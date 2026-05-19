-- Add order_nsu column to payments table for InfinityPay integration
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS order_nsu text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_order_nsu ON payments(order_nsu);
