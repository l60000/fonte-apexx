-- =====================================================
-- PDF COURSE SUPPORT - SCHEMA UPDATE
-- =====================================================

-- Add PDF fields to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS module_count INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT true;

-- Create table for page-specific audios
CREATE TABLE IF NOT EXISTS public.course_page_audios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, page_number)
);

ALTER TABLE public.course_page_audios ENABLE ROW LEVEL SECURITY;

-- Enrolled users and admins can view page audios
DROP POLICY IF EXISTS "page_audios_select_enrolled" ON public.course_page_audios;
CREATE POLICY "page_audios_select_enrolled" ON public.course_page_audios 
  FOR SELECT USING (
    -- User is enrolled in the course
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = course_page_audios.course_id 
      AND e.user_id = auth.uid() 
      AND e.status = 'active'
    )
    OR
    -- User is admin
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can manage page audios
DROP POLICY IF EXISTS "admin_page_audios_all" ON public.course_page_audios;
CREATE POLICY "admin_page_audios_all" ON public.course_page_audios 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create table for user page progress (tracking which pages were read with audio)
CREATE TABLE IF NOT EXISTS public.user_page_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  audio_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id, page_number)
);

ALTER TABLE public.user_page_progress ENABLE ROW LEVEL SECURITY;

-- Users can manage their own page progress
DROP POLICY IF EXISTS "page_progress_select_own" ON public.user_page_progress;
CREATE POLICY "page_progress_select_own" ON public.user_page_progress 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "page_progress_insert_own" ON public.user_page_progress;
CREATE POLICY "page_progress_insert_own" ON public.user_page_progress 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "page_progress_update_own" ON public.user_page_progress;
CREATE POLICY "page_progress_update_own" ON public.user_page_progress 
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can see all page progress
DROP POLICY IF EXISTS "admin_page_progress_all" ON public.user_page_progress;
CREATE POLICY "admin_page_progress_all" ON public.user_page_progress 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_audios_course_page ON public.course_page_audios(course_id, page_number);
CREATE INDEX IF NOT EXISTS idx_page_progress_user_course ON public.user_page_progress(user_id, course_id);
