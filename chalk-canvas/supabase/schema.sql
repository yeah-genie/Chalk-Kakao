-- Chalk Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- TUTORS (선생님)
-- ============================================
CREATE TABLE tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  portfolio_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STUDENTS (학생)
-- ============================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT, -- e.g., "middle-2", "high-1"
  parent_email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUBMISSIONS (제출물)
-- ============================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  problem_text TEXT,
  correct_answer TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ANALYSES (분석 결과)
-- ============================================
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
  recognized_text TEXT,
  steps JSONB, -- [{stepNumber, content, isCorrect, expected}]
  error_step INTEGER,
  misconception_code TEXT,
  misconception_name TEXT,
  error_type TEXT CHECK (error_type IN ('conceptual', 'procedural', 'factual', 'careless')),
  description TEXT,
  recommendation TEXT,
  overall_feedback TEXT,
  confidence INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ERROR PATTERNS (오류 패턴 집계)
-- ============================================
CREATE TABLE error_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_submissions INTEGER DEFAULT 0,
  conceptual_count INTEGER DEFAULT 0,
  procedural_count INTEGER DEFAULT 0,
  factual_count INTEGER DEFAULT 0,
  careless_count INTEGER DEFAULT 0,
  top_misconceptions JSONB, -- [{code, name, count}]
  habit_diagnosis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VIEWS (편의용 뷰)
-- ============================================

-- 학생별 최근 분석 조회
CREATE VIEW student_recent_analyses AS
SELECT 
  s.id as student_id,
  s.name as student_name,
  sub.id as submission_id,
  a.error_type,
  a.misconception_code,
  a.misconception_name,
  sub.created_at
FROM students s
JOIN submissions sub ON s.id = sub.student_id
LEFT JOIN analyses a ON sub.id = a.submission_id
ORDER BY sub.created_at DESC;

-- 선생님별 학생 오류 통계
CREATE VIEW tutor_error_stats AS
SELECT 
  t.id as tutor_id,
  t.name as tutor_name,
  s.id as student_id,
  s.name as student_name,
  COUNT(a.id) as total_analyses,
  COUNT(CASE WHEN a.error_type = 'conceptual' THEN 1 END) as conceptual_count,
  COUNT(CASE WHEN a.error_type = 'procedural' THEN 1 END) as procedural_count,
  COUNT(CASE WHEN a.error_type = 'factual' THEN 1 END) as factual_count,
  COUNT(CASE WHEN a.error_type = 'careless' THEN 1 END) as careless_count
FROM tutors t
JOIN students s ON t.id = s.tutor_id
JOIN submissions sub ON s.id = sub.student_id
LEFT JOIN analyses a ON sub.id = a.submission_id
GROUP BY t.id, t.name, s.id, s.name;

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Tutor can only see their own data
CREATE POLICY "Tutors can view own data" ON tutors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Tutors can update own data" ON tutors
  FOR UPDATE USING (auth.uid() = id);

-- Students belong to tutor
CREATE POLICY "Tutors can view own students" ON students
  FOR ALL USING (tutor_id = auth.uid());

-- Submissions belong to student's tutor
CREATE POLICY "Tutors can view student submissions" ON submissions
  FOR ALL USING (
    student_id IN (
      SELECT id FROM students WHERE tutor_id = auth.uid()
    )
  );

-- Analyses follow submissions
CREATE POLICY "Tutors can view submission analyses" ON analyses
  FOR ALL USING (
    submission_id IN (
      SELECT sub.id FROM submissions sub
      JOIN students s ON sub.student_id = s.id
      WHERE s.tutor_id = auth.uid()
    )
  );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_students_tutor ON students(tutor_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_created ON submissions(created_at DESC);
CREATE INDEX idx_analyses_submission ON analyses(submission_id);
CREATE INDEX idx_analyses_error_type ON analyses(error_type);
