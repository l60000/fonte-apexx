-- =====================================================
-- APEX F1 COURSE PLATFORM - DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Admins can see all profiles
DROP POLICY IF EXISTS "admin_profiles_select_all" ON public.profiles;
CREATE POLICY "admin_profiles_select_all" ON public.profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- =====================================================
-- 2. COURSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Everyone can view active courses
DROP POLICY IF EXISTS "courses_select_active" ON public.courses;
CREATE POLICY "courses_select_active" ON public.courses 
  FOR SELECT USING (is_active = true);

-- Admins can do everything with courses
DROP POLICY IF EXISTS "admin_courses_all" ON public.courses;
CREATE POLICY "admin_courses_all" ON public.courses 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- 3. COURSE MODULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- Everyone can view modules of active courses
DROP POLICY IF EXISTS "modules_select_active" ON public.course_modules;
CREATE POLICY "modules_select_active" ON public.course_modules 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id AND is_active = true
    )
  );

-- Admins can manage modules
DROP POLICY IF EXISTS "admin_modules_all" ON public.course_modules;
CREATE POLICY "admin_modules_all" ON public.course_modules 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- 4. ENROLLMENTS TABLE (created before lessons for FK reference)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'refunded', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Users can see their own enrollments
DROP POLICY IF EXISTS "enrollments_select_own" ON public.enrollments;
CREATE POLICY "enrollments_select_own" ON public.enrollments 
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all enrollments
DROP POLICY IF EXISTS "admin_enrollments_all" ON public.enrollments;
CREATE POLICY "admin_enrollments_all" ON public.enrollments 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- 5. COURSE LESSONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Enrolled users can view lessons
DROP POLICY IF EXISTS "lessons_select_enrolled" ON public.course_lessons;
CREATE POLICY "lessons_select_enrolled" ON public.course_lessons 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.course_modules m ON m.course_id = e.course_id
      WHERE m.id = module_id 
      AND e.user_id = auth.uid() 
      AND e.status = 'active'
    )
  );

-- Admins can manage lessons
DROP POLICY IF EXISTS "admin_lessons_all" ON public.course_lessons;
CREATE POLICY "admin_lessons_all" ON public.course_lessons 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- 6. LESSON PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can manage their own progress
DROP POLICY IF EXISTS "progress_select_own" ON public.lesson_progress;
CREATE POLICY "progress_select_own" ON public.lesson_progress 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "progress_insert_own" ON public.lesson_progress;
CREATE POLICY "progress_insert_own" ON public.lesson_progress 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "progress_update_own" ON public.lesson_progress;
CREATE POLICY "progress_update_own" ON public.lesson_progress 
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can see all progress
DROP POLICY IF EXISTS "admin_progress_all" ON public.lesson_progress;
CREATE POLICY "admin_progress_all" ON public.lesson_progress 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- 7. CERTIFICATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  issued_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can see their own certificates
DROP POLICY IF EXISTS "certificates_select_own" ON public.certificates;
CREATE POLICY "certificates_select_own" ON public.certificates 
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage certificates
DROP POLICY IF EXISTS "admin_certificates_all" ON public.certificates;
CREATE POLICY "admin_certificates_all" ON public.certificates 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- 8. REFUND REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

-- Users can see their own refund requests
DROP POLICY IF EXISTS "refunds_select_own" ON public.refund_requests;
CREATE POLICY "refunds_select_own" ON public.refund_requests 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create refund requests
DROP POLICY IF EXISTS "refunds_insert_own" ON public.refund_requests;
CREATE POLICY "refunds_insert_own" ON public.refund_requests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can manage all refund requests
DROP POLICY IF EXISTS "admin_refunds_all" ON public.refund_requests;
CREATE POLICY "admin_refunds_all" ON public.refund_requests 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- 9. SITE STATISTICS TABLE (for admin-editable stats)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.site_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  label TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_statistics ENABLE ROW LEVEL SECURITY;

-- Everyone can view statistics
DROP POLICY IF EXISTS "stats_select_all" ON public.site_statistics;
CREATE POLICY "stats_select_all" ON public.site_statistics 
  FOR SELECT USING (true);

-- Only admins can update statistics
DROP POLICY IF EXISTS "admin_stats_all" ON public.site_statistics;
CREATE POLICY "admin_stats_all" ON public.site_statistics 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- 10. AUTHOR INFO TABLE (for "about the author" page)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.author_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  image_url TEXT,
  achievements TEXT[],
  social_links JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.author_info ENABLE ROW LEVEL SECURITY;

-- Everyone can view author info
DROP POLICY IF EXISTS "author_select_all" ON public.author_info;
CREATE POLICY "author_select_all" ON public.author_info 
  FOR SELECT USING (true);

-- Only admins can update author info
DROP POLICY IF EXISTS "admin_author_all" ON public.author_info;
CREATE POLICY "admin_author_all" ON public.author_info 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default statistics
INSERT INTO public.site_statistics (key, value, label) VALUES
  ('students_count', '500+', 'Alunos Formados'),
  ('hours_content', '120+', 'Horas de Conteudo'),
  ('satisfaction_rate', '98%', 'Taxa de Satisfacao'),
  ('certificates_issued', '450+', 'Certificados Emitidos')
ON CONFLICT (key) DO NOTHING;

-- Insert default author info
INSERT INTO public.author_info (name, title, bio, achievements, social_links) VALUES
  (
    'Carlos Silva',
    'Especialista em Automobilismo e Formula 1',
    'Com mais de 15 anos de experiencia no mundo do automobilismo, Carlos Silva e um dos maiores especialistas em Formula 1 do Brasil. Engenheiro mecanico formado pela USP, trabalhou em equipes de competicao e hoje dedica-se a formar novos talentos no setor.',
    ARRAY['Ex-engenheiro de equipe de F1', 'Comentarista esportivo', 'Autor de 3 livros sobre automobilismo', 'Mais de 10.000 alunos formados'],
    '{"instagram": "https://instagram.com", "youtube": "https://youtube.com", "linkedin": "https://linkedin.com"}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Insert sample course
INSERT INTO public.courses (title, description, long_description, price, original_price, is_active) VALUES
  (
    'Masterclass Formula 1: Do Basico ao Avancado',
    'Domine todos os aspectos tecnicos e estrategicos da Formula 1 com nosso curso completo.',
    'Este curso abrangente oferece uma imersao completa no mundo da Formula 1. Voce aprendera desde os fundamentos da engenharia automotiva ate as estrategias avancadas de corrida utilizadas pelas principais equipes do grid. Com modulos sobre aerodinamica, powertrain, telemetria, estrategia de pneus e muito mais, voce estara preparado para entender cada detalhe das corridas como um verdadeiro especialista.',
    997.00,
    1497.00,
    true
  )
ON CONFLICT DO NOTHING;
