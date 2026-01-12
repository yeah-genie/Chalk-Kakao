-- ==========================================
-- CHALK SCALABILITY & AI TAXONOMY INFRA
-- CONSOLIDATED SCHEMA (RUN THIS IN SUPABASE SQL EDITOR)
-- ==========================================

-- 1. Boards (AP, SAT, IB, KR-CSAT...)
CREATE TABLE IF NOT EXISTS public.kb_boards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects (Math, Physics...)
CREATE TABLE IF NOT EXISTS public.kb_subjects (
    id TEXT PRIMARY KEY,
    board_id TEXT REFERENCES public.kb_boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Modules
CREATE TABLE IF NOT EXISTS public.kb_modules (
    id TEXT PRIMARY KEY,
    subject_id TEXT REFERENCES public.kb_subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Units
CREATE TABLE IF NOT EXISTS public.kb_units (
    id TEXT PRIMARY KEY,
    module_id TEXT REFERENCES public.kb_modules(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weight INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Topics
CREATE TABLE IF NOT EXISTS public.kb_topics (
    id TEXT PRIMARY KEY,
    unit_id TEXT REFERENCES public.kb_units(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    dependencies TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AI Proposed Taxonomy (Human-in-the-loop Queue)
CREATE TABLE IF NOT EXISTS public.kb_proposed_taxonomy (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES public.kb_subjects(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('unit', 'topic')),
    name TEXT NOT NULL,
    description TEXT,
    parent_id TEXT, -- Unit name or ID if type is topic
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Enable all for authenticated users)
ALTER TABLE public.kb_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_proposed_taxonomy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for authenticated" ON public.kb_boards FOR SELECT USING (true);
CREATE POLICY "Allow public read for authenticated" ON public.kb_subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read for authenticated" ON public.kb_modules FOR SELECT USING (true);
CREATE POLICY "Allow public read for authenticated" ON public.kb_units FOR SELECT USING (true);
CREATE POLICY "Allow public read for authenticated" ON public.kb_topics FOR SELECT USING (true);
CREATE POLICY "Allow all for authenticated" ON public.kb_proposed_taxonomy FOR ALL USING (auth.role() = 'authenticated');

-- Additional Write policies for Tutors
CREATE POLICY "Tutors can manage boards" ON public.kb_boards FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Tutors can manage subjects" ON public.kb_subjects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Tutors can manage modules" ON public.kb_modules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Tutors can manage units" ON public.kb_units FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Tutors can manage topics" ON public.kb_topics FOR ALL USING (auth.role() = 'authenticated');

-- ===================================
-- SEED DATA
-- ===================================

-- Boards
INSERT INTO public.kb_boards (id, name) VALUES ('ap', 'Advanced Placement') ON CONFLICT DO NOTHING;
INSERT INTO public.kb_boards (id, name) VALUES ('sat', 'College Board SAT') ON CONFLICT DO NOTHING;
INSERT INTO public.kb_boards (id, name) VALUES ('custom', 'Custom Curriculum') ON CONFLICT DO NOTHING;

-- AP Calculus AB
INSERT INTO public.kb_subjects (id, board_id, name, icon) 
VALUES ('ap-calc-ab', 'ap', 'Calculus AB', 'TrendingUp') ON CONFLICT DO NOTHING;

INSERT INTO public.kb_modules (id, subject_id, name)
VALUES ('ap-calc-ab-main', 'ap-calc-ab', 'Main Curriculum') ON CONFLICT DO NOTHING;

INSERT INTO public.kb_units (id, module_id, name, weight)
VALUES ('limits', 'ap-calc-ab-main', 'Limits & Continuity', 12) ON CONFLICT DO NOTHING;

INSERT INTO public.kb_topics (id, unit_id, name)
VALUES ('limits.intro', 'limits', 'Concept of Limits') ON CONFLICT DO NOTHING;

-- SAT Math
INSERT INTO public.kb_subjects (id, board_id, name, icon) 
VALUES ('sat-math', 'sat', 'SAT Math', 'Calculator') ON CONFLICT DO NOTHING;

INSERT INTO public.kb_modules (id, subject_id, name)
VALUES ('sat-math-core', 'sat-math', 'Digital SAT Math Core') ON CONFLICT DO NOTHING;

INSERT INTO public.kb_units (id, module_id, name)
VALUES ('algebra', 'sat-math-core', 'Heart of Algebra') ON CONFLICT DO NOTHING;
