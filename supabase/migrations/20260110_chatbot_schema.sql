-- ===================================
-- CHATBOT SCHEMA (그룹 챗봇 MVP)
-- ===================================

-- 챗봇 사용자 (카카오 사용자 ↔ DB 연결)
CREATE TABLE IF NOT EXISTS public.chatbot_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kakao_user_id TEXT UNIQUE NOT NULL, -- 카카오 botUserKey
    nickname TEXT,
    group_key TEXT, -- 주로 활동하는 그룹 (botGroupKey)
    total_certifications INTEGER DEFAULT 0,
    total_problems INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0, -- 연속 인증 일수
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_users_kakao ON public.chatbot_users(kakao_user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_users_group ON public.chatbot_users(group_key);

-- 스터디 그룹 (그룹 채팅방)
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_key TEXT UNIQUE NOT NULL, -- 카카오 botGroupKey
    name TEXT,
    invite_code TEXT UNIQUE, -- 초대 코드 (선택사항)
    member_count INTEGER DEFAULT 0,
    total_certifications INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_groups_key ON public.study_groups(group_key);

-- 일일 인증 기록
CREATE TABLE IF NOT EXISTS public.daily_certifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.chatbot_users(id) ON DELETE CASCADE,
    group_key TEXT, -- 인증한 그룹 채팅방
    image_url TEXT NOT NULL, -- 카카오 CDN 이미지 URL
    analysis_result JSONB, -- Gemini 분석 결과 전체
    total_problems INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    accuracy DECIMAL(5,4) DEFAULT 0, -- 0.0000 ~ 1.0000
    weakest_area TEXT, -- 가장 약한 영역
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certifications_user ON public.daily_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_group ON public.daily_certifications(group_key);
CREATE INDEX IF NOT EXISTS idx_certifications_date ON public.daily_certifications(created_at);

-- 오답노트
CREATE TABLE IF NOT EXISTS public.wrong_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.chatbot_users(id) ON DELETE CASCADE,
    certification_id UUID REFERENCES public.daily_certifications(id) ON DELETE CASCADE,
    problem_number INTEGER,
    problem_text TEXT, -- 문제 내용 (있는 경우)
    student_answer TEXT,
    correct_answer TEXT,
    error_type TEXT, -- 부호 실수, 계산 실수 등
    error_location TEXT, -- "2번째 줄"
    error_description TEXT, -- 상세 설명
    reviewed_at TIMESTAMPTZ, -- 복습 완료 시간
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wrong_answers_user ON public.wrong_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_type ON public.wrong_answers(error_type);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_date ON public.wrong_answers(created_at);

-- 주간 리포트
CREATE TABLE IF NOT EXISTS public.weekly_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.chatbot_users(id) ON DELETE CASCADE,
    group_key TEXT,
    week_start DATE NOT NULL, -- 주 시작일 (월요일)
    week_end DATE NOT NULL, -- 주 종료일 (일요일)
    total_problems INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    avg_accuracy DECIMAL(5,4) DEFAULT 0,
    certification_count INTEGER DEFAULT 0, -- 인증 횟수
    weakest_area TEXT,
    error_breakdown JSONB, -- {"부호 실수": 5, "계산 실수": 3}
    rank_in_group INTEGER, -- 그룹 내 순위
    improvement_rate DECIMAL(5,4), -- 전주 대비 향상률
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_user ON public.weekly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week ON public.weekly_reports(week_start);

-- 그룹 멤버십 (사용자 ↔ 그룹 연결)
CREATE TABLE IF NOT EXISTS public.group_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.chatbot_users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, group_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_group ON public.group_memberships(group_id);

-- ===================================
-- FUNCTIONS
-- ===================================

-- 일일 랭킹 조회 함수
CREATE OR REPLACE FUNCTION get_daily_ranking(p_group_key TEXT, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    nickname TEXT,
    avg_accuracy DECIMAL,
    total_problems BIGINT,
    certification_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY AVG(dc.accuracy) DESC, SUM(dc.total_problems) DESC) as rank,
        cu.id as user_id,
        cu.nickname,
        AVG(dc.accuracy) as avg_accuracy,
        SUM(dc.total_problems) as total_problems,
        COUNT(dc.id) as certification_count
    FROM public.daily_certifications dc
    JOIN public.chatbot_users cu ON dc.user_id = cu.id
    WHERE dc.group_key = p_group_key
      AND dc.created_at::date = p_date
    GROUP BY cu.id, cu.nickname
    ORDER BY avg_accuracy DESC, total_problems DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- 주간 리포트 생성 함수
CREATE OR REPLACE FUNCTION generate_weekly_report(p_user_id UUID, p_week_start DATE)
RETURNS UUID AS $$
DECLARE
    v_report_id UUID;
    v_group_key TEXT;
    v_total_problems INTEGER;
    v_correct_count INTEGER;
    v_cert_count INTEGER;
    v_weakest TEXT;
    v_errors JSONB;
BEGIN
    -- 사용자의 주 그룹 조회
    SELECT group_key INTO v_group_key FROM public.chatbot_users WHERE id = p_user_id;
    
    -- 주간 통계 집계
    SELECT 
        COALESCE(SUM(total_problems), 0),
        COALESCE(SUM(correct_count), 0),
        COUNT(id)
    INTO v_total_problems, v_correct_count, v_cert_count
    FROM public.daily_certifications
    WHERE user_id = p_user_id
      AND created_at >= p_week_start
      AND created_at < p_week_start + INTERVAL '7 days';
    
    -- 오류 유형 집계
    SELECT jsonb_object_agg(error_type, cnt)
    INTO v_errors
    FROM (
        SELECT error_type, COUNT(*) as cnt
        FROM public.wrong_answers
        WHERE user_id = p_user_id
          AND created_at >= p_week_start
          AND created_at < p_week_start + INTERVAL '7 days'
        GROUP BY error_type
    ) t;
    
    -- 가장 많은 오류 유형
    SELECT error_type INTO v_weakest
    FROM public.wrong_answers
    WHERE user_id = p_user_id
      AND created_at >= p_week_start
      AND created_at < p_week_start + INTERVAL '7 days'
    GROUP BY error_type
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- 리포트 생성
    INSERT INTO public.weekly_reports (
        user_id, group_key, week_start, week_end,
        total_problems, correct_count, avg_accuracy,
        certification_count, weakest_area, error_breakdown
    ) VALUES (
        p_user_id, v_group_key, p_week_start, p_week_start + INTERVAL '6 days',
        v_total_problems, v_correct_count,
        CASE WHEN v_total_problems > 0 THEN v_correct_count::DECIMAL / v_total_problems ELSE 0 END,
        v_cert_count, v_weakest, v_errors
    )
    ON CONFLICT (user_id, week_start) DO UPDATE SET
        total_problems = EXCLUDED.total_problems,
        correct_count = EXCLUDED.correct_count,
        avg_accuracy = EXCLUDED.avg_accuracy,
        certification_count = EXCLUDED.certification_count,
        weakest_area = EXCLUDED.weakest_area,
        error_breakdown = EXCLUDED.error_breakdown
    RETURNING id INTO v_report_id;
    
    RETURN v_report_id;
END;
$$ LANGUAGE plpgsql;

-- 사용자 통계 업데이트 트리거
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chatbot_users
    SET 
        total_certifications = total_certifications + 1,
        total_problems = total_problems + NEW.total_problems,
        total_correct = total_correct + NEW.correct_count,
        last_active_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_certification_created
    AFTER INSERT ON public.daily_certifications
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- 그룹 통계 업데이트 트리거
CREATE OR REPLACE FUNCTION update_group_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.study_groups
    SET 
        total_certifications = total_certifications + 1,
        updated_at = NOW()
    WHERE group_key = NEW.group_key;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_certification_for_group
    AFTER INSERT ON public.daily_certifications
    FOR EACH ROW 
    WHEN (NEW.group_key IS NOT NULL)
    EXECUTE FUNCTION update_group_stats();
