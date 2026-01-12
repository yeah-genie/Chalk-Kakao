-- ===================================
-- CHALK 3.0 DATABASE SCHEMA
-- Supabase (PostgreSQL)
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- PROFILES (extends auth.users)
-- ===================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ===================================
-- STUDENTS
-- ===================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tutor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    subject_id TEXT NOT NULL, -- e.g., 'ap-calc-ab', 'ap-physics-1'
    parent_email TEXT,
    parent_phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can CRUD their own students"
    ON public.students FOR ALL
    USING (auth.uid() = tutor_id);

-- ===================================
-- SESSIONS
-- ===================================
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tutor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    subject_id TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    transcript TEXT,
    notes TEXT,
    recording_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can CRUD their own sessions"
    ON public.sessions FOR ALL
    USING (auth.uid() = tutor_id);

-- ===================================
-- SESSION TOPICS (extracted by AI)
-- ===================================
CREATE TABLE IF NOT EXISTS public.session_topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    topic_id TEXT NOT NULL, -- e.g., 'calc-1-2' from knowledge graph
    status_before TEXT CHECK (status_before IN ('new', 'learning', 'reviewed', 'mastered')),
    status_after TEXT CHECK (status_after IN ('new', 'learning', 'reviewed', 'mastered')),
    score_delta INTEGER,
    evidence TEXT, -- AI가 추출한 증거 문장
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for session_topics
ALTER TABLE public.session_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can view their session topics"
    ON public.session_topics FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions s
            WHERE s.id = session_topics.session_id
            AND s.tutor_id = auth.uid()
        )
    );

-- ===================================
-- STUDENT MASTERY (cumulative scores)
-- ===================================
CREATE TABLE IF NOT EXISTS public.student_mastery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    topic_id TEXT NOT NULL,
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'reviewed', 'mastered')),
    last_reviewed_at TIMESTAMPTZ,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, topic_id)
);

-- RLS for student_mastery
ALTER TABLE public.student_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutors can view their students' mastery"
    ON public.student_mastery FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = student_mastery.student_id
            AND s.tutor_id = auth.uid()
        )
    );

-- ===================================
-- INDEXES
-- ===================================
CREATE INDEX IF NOT EXISTS idx_students_tutor ON public.students(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor ON public.sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON public.sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON public.sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_mastery_student ON public.student_mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_mastery_topic ON public.student_mastery(topic_id);

-- ===================================
-- FUNCTIONS & TRIGGERS
-- ===================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mastery_updated_at
    BEFORE UPDATE ON public.student_mastery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===================================
-- PHASE 3.5: QUIZLET-STYLE FEATURES
-- ===================================

-- ===================================
-- TEACHER PROFILES (Public)
-- ===================================
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    subjects TEXT[] DEFAULT '{}', -- ['ap-calc-ab', 'ap-physics-1']
    experience_years INTEGER DEFAULT 0,
    institution TEXT,
    website_url TEXT,
    is_public BOOLEAN DEFAULT false,
    total_students INTEGER DEFAULT 0,
    total_curricula INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    verified_at TIMESTAMPTZ, -- 공식 검증된 선생님
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public teacher profiles"
    ON public.teacher_profiles FOR SELECT
    USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Teachers can update their own profile"
    ON public.teacher_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Teachers can insert their own profile"
    ON public.teacher_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ===================================
-- FOLLOWS (Teacher Following)
-- ===================================
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follows"
    ON public.follows FOR SELECT
    USING (true);

CREATE POLICY "Users can follow/unfollow"
    ON public.follows FOR ALL
    USING (auth.uid() = follower_id);

-- ===================================
-- TEXTBOOKS (교과서 DB)
-- ===================================
CREATE TABLE IF NOT EXISTS public.textbooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    publisher TEXT NOT NULL, -- 출판사 (천재교육, 비상교육, etc.)
    subject TEXT NOT NULL, -- 과목 (수학, 물리, etc.)
    grade TEXT NOT NULL, -- 학년 (고1, 고2, AP, etc.)
    year INTEGER, -- 출판연도
    isbn TEXT UNIQUE,
    cover_image_url TEXT,
    subject_id TEXT, -- knowledge graph 과목 ID (ap-calc-ab)
    is_verified BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0, -- 사용 횟수 (인기도)
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.textbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view textbooks"
    ON public.textbooks FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can add textbooks"
    ON public.textbooks FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update their textbooks"
    ON public.textbooks FOR UPDATE
    USING (auth.uid() = created_by);

-- ===================================
-- TEXTBOOK CHAPTERS (교과서 단원)
-- ===================================
CREATE TABLE IF NOT EXISTS public.textbook_chapters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    textbook_id UUID REFERENCES public.textbooks(id) ON DELETE CASCADE NOT NULL,
    chapter_number TEXT NOT NULL, -- '1', '1-1', '2-3' 등
    title TEXT NOT NULL,
    page_start INTEGER,
    page_end INTEGER,
    parent_chapter_id UUID REFERENCES public.textbook_chapters(id), -- 하위 단원 지원
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.textbook_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view textbook chapters"
    ON public.textbook_chapters FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can add chapters"
    ON public.textbook_chapters FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ===================================
-- TEXTBOOK TOPIC MAPPINGS (교과서 ↔ 토픽)
-- ===================================
CREATE TABLE IF NOT EXISTS public.textbook_topic_mappings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    textbook_chapter_id UUID REFERENCES public.textbook_chapters(id) ON DELETE CASCADE NOT NULL,
    topic_id TEXT NOT NULL, -- knowledge graph topic ID (calc-1-2)
    mapping_confidence INTEGER DEFAULT 100, -- 매핑 정확도 (0-100)
    mapped_by UUID REFERENCES auth.users(id),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(textbook_chapter_id, topic_id)
);

ALTER TABLE public.textbook_topic_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mappings"
    ON public.textbook_topic_mappings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can add mappings"
    ON public.textbook_topic_mappings FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ===================================
-- CURRICULA (공유 커리큘럼)
-- ===================================
CREATE TABLE IF NOT EXISTS public.curricula (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    subject_id TEXT NOT NULL, -- 'ap-calc-ab'
    textbook_id UUID REFERENCES public.textbooks(id), -- 연동된 교과서
    topic_ids TEXT[] NOT NULL DEFAULT '{}', -- 포함된 토픽 목록
    is_public BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    usage_count INTEGER DEFAULT 0, -- 복사/사용 횟수
    like_count INTEGER DEFAULT 0,
    clone_count INTEGER DEFAULT 0, -- 복제 횟수
    original_curriculum_id UUID REFERENCES public.curricula(id), -- 복제 원본
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.curricula ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public curricula"
    ON public.curricula FOR SELECT
    USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "Creators can CRUD their curricula"
    ON public.curricula FOR ALL
    USING (auth.uid() = creator_id);

-- ===================================
-- CURRICULUM VERIFICATIONS (검증 기록)
-- ===================================
CREATE TABLE IF NOT EXISTS public.curriculum_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    curriculum_id UUID REFERENCES public.curricula(id) ON DELETE CASCADE NOT NULL,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('auto', 'manual', 'community')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    verified_by UUID REFERENCES auth.users(id), -- 수동 검증시
    auto_criteria_met JSONB, -- 자동 검증 조건 충족 기록
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.curriculum_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verifications"
    ON public.curriculum_verifications FOR SELECT
    USING (true);

-- ===================================
-- CURRICULUM LIKES
-- ===================================
CREATE TABLE IF NOT EXISTS public.curriculum_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    curriculum_id UUID REFERENCES public.curricula(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(curriculum_id, user_id)
);

ALTER TABLE public.curriculum_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
    ON public.curriculum_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can like/unlike"
    ON public.curriculum_likes FOR ALL
    USING (auth.uid() = user_id);

-- ===================================
-- CLASSES (클래스)
-- ===================================
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    class_code TEXT UNIQUE NOT NULL, -- 6자리 참여 코드
    subject_id TEXT NOT NULL,
    curriculum_id UUID REFERENCES public.curricula(id), -- 클래스에 연결된 커리큘럼
    is_active BOOLEAN DEFAULT true,
    max_students INTEGER DEFAULT 50,
    join_approval_required BOOLEAN DEFAULT false, -- 승인 필요 여부
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can CRUD their classes"
    ON public.classes FOR ALL
    USING (auth.uid() = teacher_id);

CREATE POLICY "Anyone can view class by code for joining"
    ON public.classes FOR SELECT
    USING (true);

-- ===================================
-- CLASS MEMBERS (클래스 멤버)
-- ===================================
CREATE TABLE IF NOT EXISTS public.class_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- 가입된 사용자
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- 또는 등록된 학생
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'assistant', 'observer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    nickname TEXT, -- 클래스 내 별명
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, user_id),
    UNIQUE(class_id, student_id)
);

ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their class members"
    ON public.class_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = class_members.class_id
            AND c.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Members can view their own membership"
    ON public.class_members FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can join classes"
    ON public.class_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ===================================
-- CLASS CURRICULA (클래스 커리큘럼 공유)
-- ===================================
CREATE TABLE IF NOT EXISTS public.class_curricula (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    curriculum_id UUID REFERENCES public.curricula(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES auth.users(id) NOT NULL,
    shared_at TIMESTAMPTZ DEFAULT NOW(),
    is_required BOOLEAN DEFAULT false, -- 필수 커리큘럼 여부
    due_date TIMESTAMPTZ, -- 완료 기한
    UNIQUE(class_id, curriculum_id)
);

ALTER TABLE public.class_curricula ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage class curricula"
    ON public.class_curricula FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = class_curricula.class_id
            AND c.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Class members can view shared curricula"
    ON public.class_curricula FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.class_members cm
            WHERE cm.class_id = class_curricula.class_id
            AND cm.user_id = auth.uid()
            AND cm.status = 'approved'
        )
    );

-- ===================================
-- ADDITIONAL INDEXES FOR PHASE 3.5
-- ===================================
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_public ON public.teacher_profiles(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_textbooks_subject ON public.textbooks(subject);
CREATE INDEX IF NOT EXISTS idx_textbooks_publisher ON public.textbooks(publisher);
CREATE INDEX IF NOT EXISTS idx_textbooks_grade ON public.textbooks(grade);
CREATE INDEX IF NOT EXISTS idx_textbooks_search ON public.textbooks USING gin(to_tsvector('korean', title || ' ' || publisher));
CREATE INDEX IF NOT EXISTS idx_curricula_public ON public.curricula(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_curricula_creator ON public.curricula(creator_id);
CREATE INDEX IF NOT EXISTS idx_curricula_subject ON public.curricula(subject_id);
CREATE INDEX IF NOT EXISTS idx_curricula_verified ON public.curricula(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_classes_code ON public.classes(class_code);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_members_user ON public.class_members(user_id);

-- ===================================
-- TRIGGERS FOR PHASE 3.5
-- ===================================

-- Auto-update teacher_profiles updated_at
CREATE TRIGGER update_teacher_profiles_updated_at
    BEFORE UPDATE ON public.teacher_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_textbooks_updated_at
    BEFORE UPDATE ON public.textbooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_curricula_updated_at
    BEFORE UPDATE ON public.curricula
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===================================
-- FUNCTIONS FOR PHASE 3.5
-- ===================================

-- Generate unique class code
CREATE OR REPLACE FUNCTION generate_class_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 6 character alphanumeric code
        new_code := upper(substr(md5(random()::text), 1, 6));
        -- Check if code exists
        SELECT EXISTS(SELECT 1 FROM public.classes WHERE class_code = new_code) INTO code_exists;
        -- Exit loop if code is unique
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Update follower counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.teacher_profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
        UPDATE public.teacher_profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.teacher_profiles SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
        UPDATE public.teacher_profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_follow_change
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Update curriculum like counts
CREATE OR REPLACE FUNCTION update_curriculum_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.curricula SET like_count = like_count + 1 WHERE id = NEW.curriculum_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.curricula SET like_count = like_count - 1 WHERE id = OLD.curriculum_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_curriculum_like_change
    AFTER INSERT OR DELETE ON public.curriculum_likes
    FOR EACH ROW EXECUTE FUNCTION update_curriculum_like_count();

-- Auto-verify curriculum (when usage_count >= 10 and clone_count >= 5)
CREATE OR REPLACE FUNCTION check_auto_verification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_verified = false AND NEW.usage_count >= 10 AND NEW.clone_count >= 5 THEN
        NEW.is_verified := true;
        NEW.verified_at := NOW();
        -- Insert verification record
        INSERT INTO public.curriculum_verifications (
            curriculum_id, verification_type, status, auto_criteria_met
        ) VALUES (
            NEW.id, 'auto', 'approved',
            jsonb_build_object('usage_count', NEW.usage_count, 'clone_count', NEW.clone_count)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_curriculum_auto_verification
    BEFORE UPDATE ON public.curricula
    FOR EACH ROW EXECUTE FUNCTION check_auto_verification();
