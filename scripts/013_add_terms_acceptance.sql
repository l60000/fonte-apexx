-- Add terms acceptance tracking to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_terms_accepted ON profiles(terms_accepted);

COMMENT ON COLUMN profiles.terms_accepted IS 'Whether user has accepted terms of use';
COMMENT ON COLUMN profiles.terms_accepted_at IS 'When user accepted terms of use';
