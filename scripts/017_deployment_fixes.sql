-- Correções para deploy: RLS de pagamentos e status de matrícula
-- Execute no SQL Editor do Supabase após os scripts 001–016

-- Permite matrícula pendente durante checkout
ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_status_check;
ALTER TABLE public.enrollments
  ADD CONSTRAINT enrollments_status_check
  CHECK (status IN ('active', 'pending', 'completed', 'cancelled', 'expired', 'refunded'));

-- Pagamentos: usuário só insere o próprio registro pendente
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own pending payments" ON public.payments;
CREATE POLICY "Users can insert own pending payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Aluno pode criar matrícula pendente (checkout)
DROP POLICY IF EXISTS "Users can insert own pending enrollment" ON public.enrollments;
CREATE POLICY "Users can insert own pending enrollment"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Users can update own pending enrollment" ON public.enrollments;
CREATE POLICY "Users can update own pending enrollment"
  ON public.enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Prova final: aluno pode criar e atualizar a própria tentativa
DROP POLICY IF EXISTS "final_exam_attempts_insert_own" ON public.final_exam_attempts;
CREATE POLICY "final_exam_attempts_insert_own" ON public.final_exam_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "final_exam_attempts_update_own" ON public.final_exam_attempts;
CREATE POLICY "final_exam_attempts_update_own" ON public.final_exam_attempts
  FOR UPDATE USING (auth.uid() = user_id);
