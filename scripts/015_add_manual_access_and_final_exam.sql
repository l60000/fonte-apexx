-- Add manual access grant field to enrollments
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS admin_granted_access BOOLEAN DEFAULT false;

-- Create final exam questions bank table
CREATE TABLE IF NOT EXISTS public.final_exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.final_exam_questions ENABLE ROW LEVEL SECURITY;

-- Admins can manage final exam questions
CREATE POLICY "admin_final_exam_questions_all" ON public.final_exam_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create final exam attempts table
CREATE TABLE IF NOT EXISTS public.final_exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
  questions_data JSONB NOT NULL, -- Array of 30 questions with options
  answers JSONB, -- User answers
  score INTEGER,
  total_questions INTEGER DEFAULT 30,
  percentage DECIMAL(5,2),
  passed BOOLEAN,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.final_exam_attempts ENABLE ROW LEVEL SECURITY;

-- Users can see their own attempts
CREATE POLICY "final_exam_attempts_select_own" ON public.final_exam_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own attempts
CREATE POLICY "final_exam_attempts_insert_own" ON public.final_exam_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own attempts
CREATE POLICY "final_exam_attempts_update_own" ON public.final_exam_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can see all attempts
CREATE POLICY "admin_final_exam_attempts_all" ON public.final_exam_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Add display_order to course_modules if not exists
ALTER TABLE public.course_modules 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
