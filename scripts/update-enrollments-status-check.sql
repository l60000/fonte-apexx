-- Drop existing status constraint
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_status_check;

-- Add new constraint allowing pending status for payment flow
ALTER TABLE enrollments
ADD CONSTRAINT enrollments_status_check
CHECK (status IN ('active', 'pending', 'completed', 'cancelled', 'expired'));
