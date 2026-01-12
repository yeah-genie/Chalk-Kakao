-- Seeding AP Calculus AB into tiered structure
-- Board: AP
-- Subject: Calculus AB
-- Module: Main Curriculum
-- Units and Topics from existing knowledge-graph.ts

-- Unit 1: Limits & Continuity
INSERT INTO public.kb_units (id, module_id, name, weight, order_index)
VALUES ('limits', 'ap-calc-ab-main', 'Limits and Continuity', 11, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.kb_topics (id, unit_id, name, order_index) VALUES
('calc-1-1', 'limits', 'Introducing Calculus: Can Change Occur at an Instant?', 1),
('calc-1-2', 'limits', 'Defining Limits and Using Limit Notation', 2),
('calc-1-3', 'limits', 'Estimating Limit Values from Graphs', 3),
('calc-1-4', 'limits', 'Estimating Limit Values from Tables', 4),
('calc-1-5', 'limits', 'Determining Limits Using Algebraic Properties', 5),
('calc-1-6', 'limits', 'Determining Limits Using Algebraic Manipulation', 6),
('calc-1-7', 'limits', 'Squeeze Theorem', 7),
('calc-1-8', 'limits', 'Continuity', 8),
('calc-1-9', 'limits', 'Intermediate Value Theorem (IVT)', 9)
ON CONFLICT (id) DO NOTHING;

-- Unit 2: Differentiation Definition
INSERT INTO public.kb_units (id, module_id, name, weight, order_index)
VALUES ('diff-def', 'ap-calc-ab-main', 'Differentiation: Definition and Fundamental Properties', 11, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.kb_topics (id, unit_id, name, order_index) VALUES
('calc-2-1', 'diff-def', 'Defining Average and Instantaneous Rates of Change', 1),
('calc-2-2', 'diff-def', 'Defining the Derivative of a Function', 2),
('calc-2-3', 'diff-def', 'Estimating Derivatives of a Function at a Point', 3),
('calc-2-4', 'diff-def', 'Connecting Differentiability and Continuity', 4),
('calc-2-5', 'diff-def', 'Power Rule', 5),
('calc-2-6', 'diff-def', 'Derivative Rules: Sum, Difference, Constant Multiple', 6),
('calc-2-7', 'diff-def', 'Derivatives of Trigonometric Functions', 7),
('calc-2-8', 'diff-def', 'Derivatives of eˣ and ln(x)', 8)
ON CONFLICT (id) DO NOTHING;
