-- Blocked/Personal Numbers Table
-- Numbers in this table will not create customer records
CREATE TABLE blocked_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  phone_e164 text NOT NULL,
  label text, -- Optional label like "Family", "Personal", etc.
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(account_id, phone_e164)
);

-- Index for quick lookups
CREATE INDEX idx_blocked_numbers_account_phone ON blocked_numbers(account_id, phone_e164);

-- RLS Policies
ALTER TABLE blocked_numbers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own blocked numbers
CREATE POLICY "Users can view own blocked numbers"
  ON blocked_numbers
  FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert their own blocked numbers
CREATE POLICY "Users can insert own blocked numbers"
  ON blocked_numbers
  FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their own blocked numbers
CREATE POLICY "Users can update own blocked numbers"
  ON blocked_numbers
  FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own blocked numbers
CREATE POLICY "Users can delete own blocked numbers"
  ON blocked_numbers
  FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM profiles WHERE user_id = auth.uid()
    )
  );

