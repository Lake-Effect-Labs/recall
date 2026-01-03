-- Add summary field to calls table for per-call meeting notes
ALTER TABLE calls ADD COLUMN IF NOT EXISTS summary text;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_calls_summary ON calls(account_id) WHERE summary IS NOT NULL;

