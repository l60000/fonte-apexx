-- Script to set a user as admin after they sign up
-- Run this after creating the admin user via sign-up page

-- Update the user to be admin (replace the email with the admin email)
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@rfapexx.com';

-- Verify
SELECT id, email, is_admin FROM profiles WHERE email = 'admin@rfapexx.com';
