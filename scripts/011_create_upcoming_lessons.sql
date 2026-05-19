-- Create upcoming_lessons table for dashboard
CREATE TABLE IF NOT EXISTS upcoming_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  module_name TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_upcoming_lessons_course ON upcoming_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_upcoming_lessons_order ON upcoming_lessons(display_order);

-- Enable RLS
ALTER TABLE upcoming_lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
CREATE POLICY "upcoming_lessons_select" ON upcoming_lessons FOR SELECT USING (true);

-- Policy: Only admins can insert/update/delete
CREATE POLICY "upcoming_lessons_insert" ON upcoming_lessons FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "upcoming_lessons_update" ON upcoming_lessons FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

CREATE POLICY "upcoming_lessons_delete" ON upcoming_lessons FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);
