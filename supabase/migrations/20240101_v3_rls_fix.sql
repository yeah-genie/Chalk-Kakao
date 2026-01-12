-- ==========================================
-- FIX RLS POLICIES FOR KB TABLES
-- RUN THIS IN SUPABASE SQL EDITOR
-- ==========================================

-- 1. Drop old conflicting policies
DROP POLICY IF EXISTS "Allow public read for authenticated" ON public.kb_boards;
DROP POLICY IF EXISTS "Tutors can manage boards" ON public.kb_boards;
DROP POLICY IF EXISTS "Allow public read for authenticated" ON public.kb_subjects;
DROP POLICY IF EXISTS "Tutors can manage subjects" ON public.kb_subjects;
DROP POLICY IF EXISTS "Allow public read for authenticated" ON public.kb_modules;
DROP POLICY IF EXISTS "Tutors can manage modules" ON public.kb_modules;
DROP POLICY IF EXISTS "Allow public read for authenticated" ON public.kb_units;
DROP POLICY IF EXISTS "Tutors can manage units" ON public.kb_units;
DROP POLICY IF EXISTS "Allow public read for authenticated" ON public.kb_topics;
DROP POLICY IF EXISTS "Tutors can manage topics" ON public.kb_topics;

-- 2. Create simplified "Authenticated All Access" policies
-- These tables are communal resources (Subjects, Units, etc.)
-- Every logged-in tutor should be able to read and contribute to them.

CREATE POLICY "Full access for authenticated" ON public.kb_boards 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Full access for authenticated" ON public.kb_subjects 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Full access for authenticated" ON public.kb_modules 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Full access for authenticated" ON public.kb_units 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Full access for authenticated" ON public.kb_topics 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Also ensure kb_proposed_taxonomy has correct policy
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.kb_proposed_taxonomy;
CREATE POLICY "Full access for authenticated" ON public.kb_proposed_taxonomy 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
