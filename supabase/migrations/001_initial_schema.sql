-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Accounts table
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Profiles table (maps Supabase auth user -> account)
CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  display_name text,
  company text,
  summary text,
  last_interaction_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Customer phones table
CREATE TABLE customer_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phone_e164 text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(account_id, phone_e164)
);

-- Customer emails table
CREATE TABLE customer_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  email_lower text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(account_id, email_lower)
);

-- Calls table
CREATE TABLE calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  twilio_call_sid text UNIQUE NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_phone text NOT NULL,
  to_phone text NOT NULL,
  started_at timestamptz NOT NULL,
  duration_seconds int,
  recording_url text,
  recording_status text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Transcripts table
CREATE TABLE transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  call_id uuid NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  raw_text text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(call_id)
);

-- Emails table
CREATE TABLE emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  gmail_message_id text NOT NULL,
  thread_id text,
  direction text NOT NULL CHECK (direction IN ('sent', 'received')),
  from_email text NOT NULL,
  to_emails text[] NOT NULL,
  subject text,
  body_snippet text,
  body_text text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(account_id, gmail_message_id)
);

-- Memories table
CREATE TABLE memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('personal', 'business', 'commitment')),
  content text NOT NULL,
  confidence real DEFAULT 0.7,
  source text NOT NULL CHECK (source IN ('call', 'email')),
  source_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Follow-ups table
CREATE TABLE follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  suggestion text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'ignored')),
  source text CHECK (source IN ('call', 'email')),
  source_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Gmail integration table
CREATE TABLE integrations_gmail (
  account_id uuid PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  google_refresh_token text,
  google_email text,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Twilio integration table
CREATE TABLE integrations_twilio (
  account_id uuid PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  twilio_account_sid text NOT NULL,
  twilio_auth_token text NOT NULL,
  twilio_phone_e164 text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_customers_account_last_interaction ON customers(account_id, last_interaction_at DESC);
CREATE INDEX idx_customer_phones_lookup ON customer_phones(account_id, phone_e164);
CREATE INDEX idx_customer_emails_lookup ON customer_emails(account_id, email_lower);
CREATE INDEX idx_calls_account_started ON calls(account_id, started_at DESC);
CREATE INDEX idx_emails_account_sent ON emails(account_id, sent_at DESC);
CREATE INDEX idx_memories_customer ON memories(customer_id, created_at DESC);
CREATE INDEX idx_follow_ups_customer_status ON follow_ups(customer_id, status);
CREATE INDEX idx_profiles_account ON profiles(account_id);
CREATE INDEX idx_integrations_twilio_phone ON integrations_twilio(twilio_phone_e164);

-- Helper function to get current user's account_id
CREATE OR REPLACE FUNCTION current_account_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT account_id FROM profiles WHERE user_id = auth.uid()
$$;

