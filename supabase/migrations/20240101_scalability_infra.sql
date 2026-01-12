-- ===================================
-- CHALK 4.0 SCALABILITY INFRASTRUCTURE
-- ===================================

-- 1. Boards (AP, SAT, IB, KR-CSAT...)
CREATE TABLE IF NOT EXISTS public.kb_boards (
    id TEXT PRIMARY KEY, -- e.g. 'ap', 'sat', 'ib', 'kr-csat'
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects (Math, Physics...)
CREATE TABLE IF NOT EXISTS public.kb_subjects (
    id TEXT PRIMARY KEY, -- e.g. 'ap-calc-ab'
    board_id TEXT REFERENCES public.kb_boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT, -- Lucide icon name
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Modules (New Layer for flexibility)
CREATE TABLE IF NOT EXISTS public.kb_modules (
    id TEXT PRIMARY KEY,
    subject_id TEXT REFERENCES public.kb_subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Units (Calculus 1, 2...)
CREATE TABLE IF NOT EXISTS public.kb_units (
    id TEXT PRIMARY KEY,
    module_id TEXT REFERENCES public.kb_modules(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weight INTEGER DEFAULT 0, -- exam weighting
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Topics (Specific nodes)
CREATE TABLE IF NOT EXISTS public.kb_topics (
    id TEXT PRIMARY KEY,
    unit_id TEXT REFERENCES public.kb_units(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    dependencies TEXT[], -- Array of topic_ids
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link students to subjects in the new schema
-- (Current students table uses subject_id TEXT, we keep it but now it links to kb_subjects)

-- Seed initial AP Data
INSERT INTO public.kb_boards (id, name) VALUES ('ap', 'Advanced Placement');

INSERT INTO public.kb_subjects (id, board_id, name, icon) 
VALUES ('ap-calc-ab', 'ap', 'Calculus AB', 'TrendingUp');

INSERT INTO public.kb_modules (id, subject_id, name)
VALUES ('ap-calc-ab-main', 'ap-calc-ab', 'Main Curriculum');

INSERT INTO public.kb_units (id, module_id, name, weight)
VALUES ('limits', 'ap-calc-ab-main', 'Limits & Continuity', 12);

INSERT INTO public.kb_topics (id, unit_id, name)
VALUES ('limits.intro', 'limits', 'Concept of Limits');
