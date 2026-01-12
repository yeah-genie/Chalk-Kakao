-- Seeding SAT Math Template
INSERT INTO public.kb_boards (id, name) VALUES ('sat', 'SAT College Board') ON CONFLICT (id) DO NOTHING;

INSERT INTO public.kb_subjects (id, board_id, name, icon) 
VALUES ('sat-math', 'sat', 'SAT Math', 'PlusCircle') ON CONFLICT (id) DO NOTHING;

INSERT INTO public.kb_modules (id, subject_id, name)
VALUES ('sat-math-core', 'sat-math', 'Digital SAT Math Core') ON CONFLICT (id) DO NOTHING;

-- Unit 1: Algebra
INSERT INTO public.kb_units (id, module_id, name, weight, order_index)
VALUES ('sat-algebra', 'sat-math-core', 'Heart of Algebra', 35, 1) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.kb_topics (id, unit_id, name, order_index) VALUES
('sat-alg-1', 'sat-algebra', 'Linear Equations in One Variable', 1),
('sat-alg-2', 'sat-algebra', 'Linear Functions', 2),
('sat-alg-3', 'sat-algebra', 'Systems of Two Linear Equations', 3)
ON CONFLICT (id) DO NOTHING;

-- Unit 2: Problem Solving & Data Analysis
INSERT INTO public.kb_units (id, module_id, name, weight, order_index)
VALUES ('sat-data', 'sat-math-core', 'Problem Solving and Data Analysis', 30, 2) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.kb_topics (id, unit_id, name, order_index) VALUES
('sat-data-1', 'sat-data', 'Ratios, Rates, and Proportions', 1),
('sat-data-2', 'sat-data', 'Percentages', 2),
('sat-data-3', 'sat-data', 'Conditional Probability', 3)
ON CONFLICT (id) DO NOTHING;
