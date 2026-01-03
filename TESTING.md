# Testing Guide for Recall

This guide will help you test the Recall app step by step.

## Quick Start (Minimum Setup)

To test the basic functionality, you need at minimum:
1. **Supabase** (for database and auth)
2. **OpenAI API Key** (for AI extraction - optional for basic testing)

You can test Twilio and Gmail integrations later.

## Step 1: Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Wait for the project to finish setting up
3. Go to **Settings** > **API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

4. Go to **SQL Editor** in Supabase dashboard
5. Run the migrations in order:
   - Copy/paste contents of `supabase/migrations/001_initial_schema.sql` → Run
   - Copy/paste contents of `supabase/migrations/002_rls_policies.sql` → Run
   - Copy/paste contents of `supabase/migrations/003_account_creation_trigger.sql` → Run

6. Go to **Authentication** > **Providers** and ensure **Email** is enabled

## Step 2: Set Up Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   
   # For basic testing, you can skip these (but some features won't work):
   OPENAI_API_KEY=sk-...  # Optional for now
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Step 3: Install Dependencies & Run

```bash
cd recall-app
npm install
npm run dev
```

The app should start at http://localhost:3000

## Step 4: Test Basic Functionality

### Test 1: Authentication ✅

1. Go to http://localhost:3000
2. You should be redirected to `/auth/login`
3. Click "Sign up" to create an account
4. Enter:
   - Full name
   - Email (use a real email you can verify)
   - Password (min 6 characters)
5. Click "Create account"
6. You should be redirected to `/dashboard`

**Expected Result:** 
- Account and profile are automatically created
- You see the dashboard with "No customers yet" message

### Test 2: Dashboard & Navigation ✅

1. You should see:
   - Navigation bar with "Recall" logo
   - Links: Customers, Calls, Settings
   - Your account name/email in top right
   - "Sign out" button

2. Click "Settings" in navigation
3. You should see:
   - Account settings section
   - Twilio settings section
   - Gmail settings section

**Expected Result:** All pages load without errors

### Test 3: Account Settings ✅

1. In Settings page, try changing your account name
2. Click "Save"
3. Refresh the page - name should persist

**Expected Result:** Account name updates successfully

### Test 4: Customer Creation (Manual) ✅

Since you don't have Twilio/Gmail set up yet, let's manually create a customer to test the UI:

1. Go to Supabase SQL Editor
2. Run this query (replace `YOUR_ACCOUNT_ID` with your actual account_id from the `accounts` table):

```sql
-- First, get your account_id
SELECT id, name FROM accounts;

-- Then create a test customer (replace YOUR_ACCOUNT_ID)
INSERT INTO customers (account_id, display_name, company, summary)
VALUES (
  'YOUR_ACCOUNT_ID',
  'John Doe',
  'Acme Corp',
  'Test customer for UI testing. Interested in our premium plan.'
);

-- Add a phone number
INSERT INTO customer_phones (account_id, customer_id, phone_e164)
SELECT 
  account_id,
  id,
  '+15551234567'
FROM customers
WHERE display_name = 'John Doe'
LIMIT 1;

-- Add an email
INSERT INTO customer_emails (account_id, customer_id, email_lower)
SELECT 
  account_id,
  id,
  'john@acmecorp.com'
FROM customers
WHERE display_name = 'John Doe'
LIMIT 1;
```

3. Go back to http://localhost:3000/dashboard
4. You should see "John Doe" in the customer list

**Expected Result:** Customer appears in dashboard

### Test 5: Customer Profile Page ✅

1. Click on "John Doe" in the customer list
2. You should see:
   - Customer header with name and contact info
   - Pre-call brief section (may be empty if no interactions)
   - Memory sections (Personal Facts, Business Context, Commitments)
   - Timeline section (empty for now)

**Expected Result:** Customer profile page loads and displays correctly

## Step 5: Test with OpenAI (Optional)

If you have an OpenAI API key:

1. Add to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

2. Restart the dev server

3. Create a test memory via SQL:
```sql
-- Add a test memory (replace YOUR_ACCOUNT_ID and customer_id)
INSERT INTO memories (account_id, customer_id, type, content, source)
VALUES (
  'YOUR_ACCOUNT_ID',
  (SELECT id FROM customers WHERE display_name = 'John Doe' LIMIT 1),
  'personal',
  'Loves playing golf on weekends',
  'call'
);
```

4. Refresh the customer profile page
5. You should see the memory in the "Personal Facts" section

## Step 6: Test Twilio Integration (Advanced)

**Prerequisites:**
- Twilio account with a phone number
- ngrok or similar for local webhook testing

1. Set up Twilio:
   - Get Account SID and Auth Token
   - Get a phone number
   - In Settings page, enter Twilio credentials

2. Use ngrok to expose localhost:
   ```bash
   ngrok http 3000
   ```

3. Update Twilio webhook URL to: `https://your-ngrok-url.ngrok.io/api/twilio/voice`

4. Call your Twilio number
5. The call should be recorded and processed

## Step 7: Test Gmail Integration (Advanced)

1. Set up Google OAuth:
   - Create OAuth credentials in Google Cloud Console
   - Add redirect URI: `http://localhost:3000/api/gmail/callback`

2. In Settings, click "Connect Gmail"
3. Complete OAuth flow
4. Click "Sync Now" to import emails

## Troubleshooting

### "Missing credentials" error
- Make sure `.env.local` exists and has all required variables
- Restart the dev server after changing env vars

### "Profile not found" error
- Check that migrations ran successfully
- Verify the trigger in `003_account_creation_trigger.sql` is active

### Can't see customers
- Check RLS policies are enabled
- Verify you're logged in with the correct account
- Check Supabase logs for errors

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Check that all env vars are set

## Next Steps

Once basic testing passes:
1. Set up Twilio for call testing
2. Set up Gmail for email sync testing
3. Test the full flow: call → transcription → extraction → customer profile

