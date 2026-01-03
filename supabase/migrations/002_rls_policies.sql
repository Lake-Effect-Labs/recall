-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations_gmail ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations_twilio ENABLE ROW LEVEL SECURITY;

-- Accounts policies
CREATE POLICY "Users can view their own account"
  ON accounts FOR SELECT
  USING (id = current_account_id());

CREATE POLICY "Users can update their own account"
  ON accounts FOR UPDATE
  USING (id = current_account_id());

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Customers policies
CREATE POLICY "Users can view their account's customers"
  ON customers FOR SELECT
  USING (account_id = current_account_id());

CREATE POLICY "Users can insert customers to their account"
  ON customers FOR INSERT
  WITH CHECK (account_id = current_account_id());

CREATE POLICY "Users can update their account's customers"
  ON customers FOR UPDATE
  USING (account_id = current_account_id());

CREATE POLICY "Users can delete their account's customers"
  ON customers FOR DELETE
  USING (account_id = current_account_id());

-- Customer phones policies
CREATE POLICY "Users can view their account's customer phones"
  ON customer_phones FOR SELECT
  USING (account_id = current_account_id());

CREATE POLICY "Users can insert customer phones to their account"
  ON customer_phones FOR INSERT
  WITH CHECK (account_id = current_account_id());

CREATE POLICY "Users can update their account's customer phones"
  ON customer_phones FOR UPDATE
  USING (account_id = current_account_id());

CREATE POLICY "Users can delete their account's customer phones"
  ON customer_phones FOR DELETE
  USING (account_id = current_account_id());

-- Customer emails policies
CREATE POLICY "Users can view their account's customer emails"
  ON customer_emails FOR SELECT
  USING (account_id = current_account_id());

CREATE POLICY "Users can insert customer emails to their account"
  ON customer_emails FOR INSERT
  WITH CHECK (account_id = current_account_id());

CREATE POLICY "Users can update their account's customer emails"
  ON customer_emails FOR UPDATE
  USING (account_id = current_account_id());

CREATE POLICY "Users can delete their account's customer emails"
  ON customer_emails FOR DELETE
  USING (account_id = current_account_id());

-- Calls policies
CREATE POLICY "Users can view their account's calls"
  ON calls FOR SELECT
  USING (account_id = current_account_id());

CREATE POLICY "Users can insert calls to their account"
  ON calls FOR INSERT
  WITH CHECK (account_id = current_account_id());

CREATE POLICY "Users can update their account's calls"
  ON calls FOR UPDATE
  USING (account_id = current_account_id());

-- Transcripts policies
CREATE POLICY "Users can view their account's transcripts"
  ON transcripts FOR SELECT
  USING (account_id = current_account_id());

CREATE POLICY "Users can insert transcripts to their account"
  ON transcripts FOR INSERT
  WITH CHECK (account_id = current_account_id());

-- Emails policies
CREATE POLICY "Users can view their account's emails"
  ON emails FOR SELECT
  USING (account_id = current_account_id());

CREATE POLICY "Users can insert emails to their account"
  ON emails FOR INSERT
  WITH CHECK (account_id = current_account_id());

CREATE POLICY "Users can update their account's emails"
  ON emails FOR UPDATE
  USING (account_id = current_account_id());

-- Memories policies
CREATE POLICY "Users can view their account's memories"
  ON memories FOR SELECT
  USING (account_id = current_account_id());

CREATE POLICY "Users can insert memories to their account"
  ON memories FOR INSERT
  WITH CHECK (account_id = current_account_id());

CREATE POLICY "Users can update their account's memories"
  ON memories FOR UPDATE
  USING (account_id = current_account_id());

CREATE POLICY "Users can delete their account's memories"
  ON memories FOR DELETE
  USING (account_id = current_account_id());

-- Follow-ups policies
CREATE POLICY "Users can view their account's follow-ups"
  ON follow_ups FOR SELECT
  USING (account_id = current_account_id());

CREATE POLICY "Users can insert follow-ups to their account"
  ON follow_ups FOR INSERT
  WITH CHECK (account_id = current_account_id());

CREATE POLICY "Users can update their account's follow-ups"
  ON follow_ups FOR UPDATE
  USING (account_id = current_account_id());

CREATE POLICY "Users can delete their account's follow-ups"
  ON follow_ups FOR DELETE
  USING (account_id = current_account_id());

-- Integrations Gmail policies
CREATE POLICY "Users can view their account's Gmail integration"
  ON integrations_gmail FOR SELECT
  USING (account_id = current_account_id());

CREATE POLICY "Users can insert Gmail integration for their account"
  ON integrations_gmail FOR INSERT
  WITH CHECK (account_id = current_account_id());

CREATE POLICY "Users can update their account's Gmail integration"
  ON integrations_gmail FOR UPDATE
  USING (account_id = current_account_id());

CREATE POLICY "Users can delete their account's Gmail integration"
  ON integrations_gmail FOR DELETE
  USING (account_id = current_account_id());

-- Integrations Twilio policies
CREATE POLICY "Users can view their account's Twilio integration"
  ON integrations_twilio FOR SELECT
  USING (account_id = current_account_id());

CREATE POLICY "Users can insert Twilio integration for their account"
  ON integrations_twilio FOR INSERT
  WITH CHECK (account_id = current_account_id());

CREATE POLICY "Users can update their account's Twilio integration"
  ON integrations_twilio FOR UPDATE
  USING (account_id = current_account_id());

CREATE POLICY "Users can delete their account's Twilio integration"
  ON integrations_twilio FOR DELETE
  USING (account_id = current_account_id());

