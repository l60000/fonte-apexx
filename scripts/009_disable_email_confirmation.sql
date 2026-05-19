-- Disable email confirmation requirement
-- This allows users to sign up and log in immediately without email verification

-- Update auth config to disable email confirmation
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_confirmations = false
WHERE id = 1;

-- If the above doesn't work (config table might not exist), 
-- we can confirm all existing unconfirmed users:
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
