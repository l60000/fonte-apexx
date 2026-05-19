-- Add Cora payment integration support

-- Update payments table to support Cora
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS cora_invoice_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS cora_code TEXT,
ADD COLUMN IF NOT EXISTS digitable_line TEXT,
ADD COLUMN IF NOT EXISTS scheduled_at DATE,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'boleto',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_cora_invoice_id ON payments(cora_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_cora_code ON payments(cora_code);

-- Create table for payment attempts/history
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  request_payload JSONB,
  response_payload JSONB,
  status TEXT CHECK (status IN ('pending', 'processing', 'success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own payment attempts"
  ON payment_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert payment attempts"
  ON payment_attempts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE payment_attempts IS 'Stores history of payment attempts for auditing';
COMMENT ON COLUMN payments.cora_invoice_id IS 'Cora API invoice ID';
COMMENT ON COLUMN payments.digitable_line IS 'Boleto digitable line for payment';
