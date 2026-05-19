-- Add CPF column to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);

-- Create index for CPF lookups
CREATE INDEX IF NOT EXISTS profiles_cpf_idx ON profiles(cpf);

-- Add comment
COMMENT ON COLUMN profiles.cpf IS 'CPF do usuário (formato: 000.000.000-00)';
