-- Add updated_at column to refund_requests table
ALTER TABLE refund_requests 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_refund_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refund_requests_updated_at_trigger ON refund_requests;

CREATE TRIGGER refund_requests_updated_at_trigger
BEFORE UPDATE ON refund_requests
FOR EACH ROW
EXECUTE FUNCTION update_refund_requests_updated_at();
