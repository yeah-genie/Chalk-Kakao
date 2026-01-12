-- =============================================
-- ESIP: Exam Strategy Intelligent Profiler
-- SAT/ACT/AMC 전략 분석 시스템
-- =============================================

-- =============================================
-- PROBLEMS (문제은행)
-- =============================================
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_type TEXT NOT NULL CHECK (exam_type IN ('SAT', 'ACT', 'AMC', 'AP', 'Custom')),
    section TEXT NOT NULL,              -- 'Math', 'Reading', 'Writing', 'Science'
    topic TEXT NOT NULL,                -- 'Algebra', 'Geometry', 'Statistics'
    subtopic TEXT,                      -- 'Linear Equations', 'Quadratics'
    difficulty INT NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
    cognitive_level TEXT CHECK (cognitive_level IN ('recall', 'application', 'analysis')),

    question_text TEXT NOT NULL,
    question_image_url TEXT,            -- 이미지 문제용
    choices JSONB,                      -- ["A. ...", "B. ...", "C. ...", "D. ..."]
    correct_answer TEXT NOT NULL,
    explanation TEXT,

    avg_time_seconds INT DEFAULT 60,    -- 평균 풀이 시간
    source TEXT,                        -- 'Official SAT 2023', 'Khan Academy'

    created_by UUID REFERENCES public.tutors(id),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_problems_exam_type ON public.problems(exam_type);
CREATE INDEX IF NOT EXISTS idx_problems_topic ON public.problems(topic);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON public.problems(difficulty);

-- =============================================
-- TEST_SESSIONS (시험 세션)
-- =============================================
CREATE TABLE IF NOT EXISTS public.test_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,

    exam_type TEXT NOT NULL,
    section TEXT,                       -- 특정 섹션만 테스트할 경우
    test_name TEXT,                     -- 'SAT Practice Test 1'

    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    total_questions INT NOT NULL,
    correct_count INT,
    total_time_seconds INT,

    -- AI 분석 결과
    analysis_result JSONB,
    error_patterns JSONB,               -- 오류 패턴 분류
    strategy_report JSONB,              -- 전략 리포트

    -- 점수 예측
    raw_score INT,
    scaled_score INT,                   -- SAT: 200-800
    predicted_score INT,                -- 전략 적용 시 예상 점수

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_sessions_student ON public.test_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_tutor ON public.test_sessions(tutor_id);

-- =============================================
-- RESPONSES (문제별 응답)
-- =============================================
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,

    question_order INT NOT NULL,        -- 몇 번째 문제였나 (1부터 시작)
    student_answer TEXT,                -- 학생이 선택한 답
    is_correct BOOLEAN,

    time_spent_seconds INT NOT NULL,    -- 이 문제에 쓴 시간
    flagged BOOLEAN DEFAULT FALSE,      -- "나중에 다시 볼" 표시
    changed_answer BOOLEAN DEFAULT FALSE, -- 답을 바꿨는지

    -- AI 분류 (분석 후 채워짐)
    error_type TEXT CHECK (error_type IN (
        'correct',           -- 정답
        'careless',          -- 부주의 (알지만 실수)
        'conceptual_gap',    -- 개념 부족
        'time_pressure',     -- 시간 압박
        'guessed'            -- 찍음
    )),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responses_session ON public.responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_problem ON public.responses(problem_id);

-- =============================================
-- STUDENT_PROFILES (학생 프로파일)
-- 시험 성향 누적 분석
-- =============================================
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,

    -- 누적 통계
    total_tests INT DEFAULT 0,
    total_questions_answered INT DEFAULT 0,
    overall_accuracy DECIMAL(5,2),

    -- 성향 점수 (0-100)
    careless_tendency INT DEFAULT 50,       -- 부주의 성향
    time_management INT DEFAULT 50,          -- 시간 관리 능력
    stamina INT DEFAULT 50,                  -- 집중력 지속
    confidence INT DEFAULT 50,               -- 자신감 (답 변경 빈도)

    -- 강점/약점 토픽
    strong_topics JSONB DEFAULT '[]'::jsonb,
    weak_topics JSONB DEFAULT '[]'::jsonb,

    -- Kill/Keep 리스트
    kill_list JSONB DEFAULT '[]'::jsonb,    -- 지금은 버려도 될 문제 유형
    keep_list JSONB DEFAULT '[]'::jsonb,    -- 반드시 맞춰야 할 문제 유형

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_student ON public.student_profiles(student_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Problems: 공개 문제는 누구나, 비공개는 생성자만
CREATE POLICY "Anyone can view public problems" ON public.problems
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Tutors can manage own problems" ON public.problems
    FOR ALL USING (created_by = auth.uid());

-- Test sessions: 튜터만 자기 학생 세션
CREATE POLICY "Tutors can manage own test sessions" ON public.test_sessions
    FOR ALL USING (tutor_id = auth.uid());

-- Responses: 세션 소유자만
CREATE POLICY "Tutors can view own responses" ON public.responses
    FOR ALL USING (
        session_id IN (
            SELECT id FROM public.test_sessions WHERE tutor_id = auth.uid()
        )
    );

-- Student profiles: 튜터만 자기 학생
CREATE POLICY "Tutors can manage own student profiles" ON public.student_profiles
    FOR ALL USING (
        student_id IN (
            SELECT id FROM public.students WHERE tutor_id = auth.uid()
        )
    );

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
