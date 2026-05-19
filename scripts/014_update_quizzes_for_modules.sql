-- Update quizzes to link to modules and add to upcoming lessons

-- Add module_id to quizzes table
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update upcoming_lessons to support quizzes
ALTER TABLE upcoming_lessons ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'lesson' CHECK (item_type IN ('lesson', 'quiz'));
ALTER TABLE upcoming_lessons ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE;
ALTER TABLE upcoming_lessons ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_upcoming_lessons_order ON upcoming_lessons(course_id, display_order);
CREATE INDEX IF NOT EXISTS idx_quizzes_module ON quizzes(module_id);
