-- =============================================
-- CHALK 2.0 DATABASE SCHEMA
-- Zero-Action 철학: 자동화된 튜터 관리 시스템
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS (튜터)
-- =============================================
CREATE TABLE IF NOT EXISTS public.tutors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    profile_image TEXT,
    google_calendar_token JSONB,
    zoom_token JSONB,
    stripe_account_id TEXT,
    settings JSONB DEFAULT '{
        "auto_report": true,
        "auto_send": true,
        "send_delay_minutes": 5
    }'::jsonb,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    reports_used_this_month INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STUDENTS (학생)
-- =============================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade TEXT,
    notes TEXT,
    hourly_rate INTEGER DEFAULT 45000,
    parent_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    parent_consent BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SESSIONS (수업)
-- =============================================
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    
    -- 자동 감지 메타데이터
    calendar_event_id TEXT,
    zoom_meeting_id TEXT,
    recording_url TEXT,
    transcript TEXT,
    
    -- 정산
    amount INTEGER,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
    payment_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REPORTS (리포트)
-- =============================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    
    -- 리포트 내용
    content JSONB NOT NULL,
    formatted_message TEXT,
    ai_generated BOOLEAN DEFAULT TRUE,
    
    -- 발송 상태
    sent_at TIMESTAMPTZ,
    send_method TEXT CHECK (send_method IN ('sms', 'email', 'kakao', 'whatsapp')),
    send_status TEXT DEFAULT 'pending' CHECK (send_status IN ('pending', 'sent', 'failed', 'viewed')),
    
    -- 학부모 열람
    view_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    viewed_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYMENTS (결제)
-- =============================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'KRW',
    method TEXT CHECK (method IN ('stripe', 'bank_transfer', 'cash', 'other')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
    
    stripe_payment_id TEXT,
    bank_transfer_ref TEXT,
    notes TEXT,
    
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_sessions_tutor ON public.sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON public.sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON public.sessions(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_reports_session ON public.reports(session_id);
CREATE INDEX IF NOT EXISTS idx_reports_view_token ON public.reports(view_token);
CREATE INDEX IF NOT EXISTS idx_payments_tutor ON public.payments(tutor_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Tutors can only see their own data
CREATE POLICY "Tutors can view own data" ON public.tutors
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Tutors can view own students" ON public.students
    FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "Tutors can view own sessions" ON public.sessions
    FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "Tutors can view own reports" ON public.reports
    FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "Tutors can view own payments" ON public.payments
    FOR ALL USING (tutor_id = auth.uid());

-- Public access for report viewing (via token)
CREATE POLICY "Anyone can view reports with valid token" ON public.reports
    FOR SELECT USING (view_token IS NOT NULL);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tutors_updated_at
    BEFORE UPDATE ON public.tutors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment report view count
CREATE OR REPLACE FUNCTION increment_report_view(token TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.reports
    SET view_count = view_count + 1,
        viewed_at = COALESCE(viewed_at, NOW()),
        send_status = 'viewed'
    WHERE view_token = token;
END;
$$ LANGUAGE plpgsql;
-- =============================================
-- TOPIC MASTERY (학생별 지식 숙련도)
-- =============================================
CREATE TABLE IF NOT EXISTS public.topic_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE,
    subject_code TEXT NOT NULL,
    topic_code TEXT NOT NULL,
    level INTEGER DEFAULT 0 CHECK (level >= 0 AND level <= 100),
    evidence JSONB DEFAULT '[]'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(student_id, topic_code)
);

CREATE INDEX IF NOT EXISTS idx_topic_mastery_student ON public.topic_mastery(student_id);
ALTER TABLE public.topic_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can view/edit own students mastery" ON public.topic_mastery
    FOR ALL USING (tutor_id = auth.uid());

CREATE TRIGGER update_topic_mastery_last_updated
    BEFORE UPDATE ON public.topic_mastery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
