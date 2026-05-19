-- Script para criar usuario administrador
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, crie o usuario no Supabase Auth (via Dashboard ou API)
-- Email: admin@rfapexx.com
-- Senha: Admin@123456

-- 2. Depois de criar o usuario no Auth, execute este SQL para tornar ele admin:
-- (Substitua 'SEU_USER_ID_AQUI' pelo ID do usuario criado)

-- Para encontrar o ID do usuario, execute:
-- SELECT id, email FROM auth.users WHERE email = 'admin@rfapexx.com';

-- Depois execute:
-- UPDATE public.users SET is_admin = true WHERE id = 'SEU_USER_ID_AQUI';

-- OU se preferir, insira diretamente na tabela users com is_admin = true:
-- INSERT INTO public.users (id, email, full_name, is_admin)
-- VALUES ('SEU_USER_ID_AQUI', 'admin@rfapexx.com', 'Administrador RFAPEXX', true);

-- INSTRUCOES PASSO A PASSO:
-- 
-- 1. Va para o Supabase Dashboard
-- 2. Clique em "Authentication" no menu lateral
-- 3. Clique em "Users" e depois em "Add User"
-- 4. Preencha:
--    - Email: admin@rfapexx.com
--    - Password: Admin@123456
--    - Marque "Auto Confirm User"
-- 5. Clique em "Create User"
-- 6. Copie o "User UID" do usuario criado
-- 7. Va para "SQL Editor" no menu lateral
-- 8. Execute o seguinte SQL (substituindo o ID):
--
-- UPDATE public.users SET is_admin = true WHERE id = 'COLE_O_USER_UID_AQUI';
--
-- Se o usuario nao existir na tabela users, primeiro insira:
-- INSERT INTO public.users (id, email, full_name, is_admin)
-- SELECT id, email, 'Administrador RFAPEXX', true
-- FROM auth.users WHERE email = 'admin@rfapexx.com'
-- ON CONFLICT (id) DO UPDATE SET is_admin = true;
