-- Chalk MVP Supabase Schema
-- Run this in Supabase SQL Editor

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  school TEXT,
  subject TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  grade TEXT,
  subject TEXT,
  goal TEXT,
  parent_contact TEXT,
  notes TEXT,
  color TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Lesson logs table (updated with new fields)
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,

  -- Problem (태그 + 상세)
  problem_tags TEXT[] DEFAULT '{}',
  problem_detail TEXT,

  -- Diagnosis (태그 + 상세)
  diagnosis_tags TEXT[] DEFAULT '{}',
  diagnosis_detail TEXT,

  -- Solution (태그 + 상세)
  solution_tags TEXT[] DEFAULT '{}',
  solution_detail TEXT,

  -- Recording & Analysis
  recording_id UUID,
  auto_generated BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Recordings table
CREATE TABLE IF NOT EXISTS public.recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Audio info
  audio_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  file_size_bytes BIGINT,

  -- Processing status
  status TEXT DEFAULT 'recording' CHECK (status IN ('recording', 'processing', 'analyzed', 'error')),

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Recording analyses table
CREATE TABLE IF NOT EXISTS public.recording_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Transcript
  full_transcript TEXT,

  -- Speaker diarization (stored as JSONB)
  speakers JSONB DEFAULT '[]',
  tutor_speaking_ratio DECIMAL(3,2) DEFAULT 0,
  student_speaking_ratio DECIMAL(3,2) DEFAULT 0,

  -- AI Analysis
  summary TEXT,
  key_topics TEXT[] DEFAULT '{}',
  problem_tags TEXT[] DEFAULT '{}',
  diagnosis_tags TEXT[] DEFAULT '{}',
  solution_tags TEXT[] DEFAULT '{}',

  -- Learning insights
  understanding_score INTEGER CHECK (understanding_score >= 0 AND understanding_score <= 100),
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  difficulty_moments JSONB DEFAULT '[]',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Parent notifications table
CREATE TABLE IF NOT EXISTS public.parent_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_contact TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Student analytics table
CREATE TABLE IF NOT EXISTS public.student_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Aggregate stats
  total_lessons INTEGER DEFAULT 0,
  total_hours DECIMAL(10,2) DEFAULT 0,

  -- Growth metrics (stored as JSONB arrays)
  understanding_trend INTEGER[] DEFAULT '{}',
  engagement_trend INTEGER[] DEFAULT '{}',
  improvement_rate INTEGER DEFAULT 0,

  -- Pattern analysis (stored as JSONB)
  common_struggles JSONB DEFAULT '[]',
  effective_solutions JSONB DEFAULT '[]',
  peak_performance_time TEXT,

  -- Learning profile (stored as JSONB)
  learning_style JSONB,
  strengths TEXT[] DEFAULT '{}',
  areas_to_improve TEXT[] DEFAULT '{}',

  -- Recommendations
  next_focus_areas TEXT[] DEFAULT '{}',
  suggested_approach TEXT,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Enable RLS (Row Level Security)
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recording_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Profiles policies
-- =============================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public profiles for /tutor/[id] page
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- =============================================
-- Students policies
-- =============================================

CREATE POLICY "Users can view their own students"
  ON public.students FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "Users can insert their own students"
  ON public.students FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Users can update their own students"
  ON public.students FOR UPDATE
  USING (auth.uid() = tutor_id);

CREATE POLICY "Users can delete their own students"
  ON public.students FOR DELETE
  USING (auth.uid() = tutor_id);

-- =============================================
-- Logs policies
-- =============================================

DROP POLICY IF EXISTS "Users can view their own logs" ON public.logs;
CREATE POLICY "Users can view their own logs"
  ON public.logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own logs" ON public.logs;
CREATE POLICY "Users can insert their own logs"
  ON public.logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own logs" ON public.logs;
CREATE POLICY "Users can update their own logs"
  ON public.logs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own logs" ON public.logs;
CREATE POLICY "Users can delete their own logs"
  ON public.logs FOR DELETE
  USING (auth.uid() = user_id);

-- Public logs for /tutor/[id] page
DROP POLICY IF EXISTS "Public logs are viewable by everyone" ON public.logs;
CREATE POLICY "Public logs are viewable by everyone"
  ON public.logs FOR SELECT
  USING (true);

-- =============================================
-- Recordings policies
-- =============================================

CREATE POLICY "Users can view their own recordings"
  ON public.recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings"
  ON public.recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings"
  ON public.recordings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings"
  ON public.recordings FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Recording analyses policies
-- =============================================

CREATE POLICY "Users can view analyses for their recordings"
  ON public.recording_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = recording_analyses.recording_id
      AND recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analyses for their recordings"
  ON public.recording_analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = recording_analyses.recording_id
      AND recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analyses for their recordings"
  ON public.recording_analyses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.recordings
      WHERE recordings.id = recording_analyses.recording_id
      AND recordings.user_id = auth.uid()
    )
  );

-- =============================================
-- Parent notifications policies
-- =============================================

CREATE POLICY "Users can view their own notifications"
  ON public.parent_notifications FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "Users can insert their own notifications"
  ON public.parent_notifications FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Users can update their own notifications"
  ON public.parent_notifications FOR UPDATE
  USING (auth.uid() = tutor_id);

-- =============================================
-- Student analytics policies
-- =============================================

CREATE POLICY "Users can view analytics for their students"
  ON public.student_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = student_analytics.student_id
      AND students.tutor_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analytics for their students"
  ON public.student_analytics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = student_analytics.student_id
      AND students.tutor_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analytics for their students"
  ON public.student_analytics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = student_analytics.student_id
      AND students.tutor_id = auth.uid()
    )
  );

-- =============================================
-- Functions
-- =============================================

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_student_analytics_updated_at
  BEFORE UPDATE ON public.student_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- Indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS logs_user_id_idx ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS logs_student_id_idx ON public.logs(student_id);
CREATE INDEX IF NOT EXISTS logs_created_at_idx ON public.logs(created_at DESC);
CREATE INDEX IF NOT EXISTS logs_lesson_date_idx ON public.logs(lesson_date DESC);

CREATE INDEX IF NOT EXISTS students_tutor_id_idx ON public.students(tutor_id);
CREATE INDEX IF NOT EXISTS students_status_idx ON public.students(status);

CREATE INDEX IF NOT EXISTS recordings_user_id_idx ON public.recordings(user_id);
CREATE INDEX IF NOT EXISTS recordings_student_id_idx ON public.recordings(student_id);
CREATE INDEX IF NOT EXISTS recordings_status_idx ON public.recordings(status);

CREATE INDEX IF NOT EXISTS student_analytics_student_id_idx ON public.student_analytics(student_id);

CREATE INDEX IF NOT EXISTS parent_notifications_tutor_id_idx ON public.parent_notifications(tutor_id);
CREATE INDEX IF NOT EXISTS parent_notifications_student_id_idx ON public.parent_notifications(student_id);
CREATE INDEX IF NOT EXISTS parent_notifications_created_at_idx ON public.parent_notifications(created_at DESC);

-- =============================================
-- Storage bucket for recordings
-- =============================================

-- Run this separately in Supabase Dashboard -> Storage
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('recordings', 'recordings', false);

-- Storage policies (run in SQL editor after creating bucket)
-- CREATE POLICY "Users can upload their recordings"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can read their recordings"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their recordings"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
