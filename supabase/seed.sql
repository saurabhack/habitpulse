-- ====================================================================
-- HABITPULSE SYSTEM SEED DATA & TEMPLATES
-- ====================================================================

-- 1. Default System Categories
INSERT INTO public.categories (id, user_id, name, color, icon, is_system) VALUES
('c0000000-0000-0000-0000-000000000001', NULL, 'Health & Fitness', '#10B981', 'Heart', TRUE),
('c0000000-0000-0000-0000-000000000002', NULL, 'Learning & Intellect', '#6366F1', 'BookOpen', TRUE),
('c0000000-0000-0000-0000-000000000003', NULL, 'Productivity & Work', '#F59E0B', 'Briefcase', TRUE),
('c0000000-0000-0000-0000-000000000004', NULL, 'Mindfulness & Mental Health', '#8B5CF6', 'Smile', TRUE),
('c0000000-0000-0000-0000-000000000005', NULL, 'Personal Finance', '#06B6D4', 'DollarSign', TRUE),
('c0000000-0000-0000-0000-000000000006', NULL, 'Bad Habits Elimination', '#EF4444', 'ShieldAlert', TRUE)
ON CONFLICT (id) DO NOTHING;
