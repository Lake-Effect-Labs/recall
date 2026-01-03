# Quick Testing Guide (No Twilio/Gmail Required)

You can test most of the Recall app **without** Twilio or Google OAuth! Here's what you need:

## ✅ What You CAN Test Without Twilio/Gmail

- ✅ User authentication (sign up, sign in)
- ✅ Dashboard UI and navigation
- ✅ Customer list and search
- ✅ Customer profile pages
- ✅ Pre-call brief display
- ✅ Settings pages
- ✅ Account management

## ❌ What You CANNOT Test Without Twilio/Gmail

- ❌ Automatic call recording
- ❌ Email syncing
- ❌ AI transcription
- ❌ Automatic customer creation from calls/emails

## Minimum Setup (5 minutes)

### 1. Supabase Setup (Required)

1. Go to https://supabase.com → Create new project
2. Wait for setup to complete
3. Go to **SQL Editor** → Run these 3 files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_account_creation_trigger.sql`
4. Go to **Authentication** → **Providers** → Enable **Email**
5. Copy your credentials from **Settings** → **API**:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

### 2. Create `.env.local`

```bash
# Copy the example
copy env.example .env.local
```

Then fill in **only** these (minimum required):

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# App URL (REQUIRED)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI (OPTIONAL - only needed for AI features)
# OPENAI_API_KEY=sk-...

# Twilio (SKIP - not needed for basic testing)
# TWILIO_ACCOUNT_SID=...
# TWILIO_AUTH_TOKEN=...

# Google OAuth (SKIP - not needed for basic testing)
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Testing Steps

### Test 1: Authentication ✅

1. Go to http://localhost:3000
2. Click "Sign up"
3. Enter:
   - Name: "Test User"
   - Email: your-email@example.com
   - Password: anything (6+ chars)
4. Click "Create account"
5. **Expected:** Redirected to dashboard

### Test 2: Dashboard ✅

1. You should see:
   - Navigation bar with "Recall" logo
   - "No customers yet" message
   - Links: Customers, Calls, Settings
2. Click "Settings"
3. **Expected:** Settings page loads, shows "not connected" for Twilio/Gmail (this is fine!)

### Test 3: Create Test Customer (via SQL) ✅

1. Go to Supabase → **SQL Editor**
2. First, get your account_id:
```sql
SELECT id, name FROM accounts;
```

3. Create a test customer (replace `YOUR_ACCOUNT_ID`):
```sql
-- Create customer
INSERT INTO customers (account_id, display_name, company, summary, last_interaction_at)
VALUES (
  'YOUR_ACCOUNT_ID',
  'Sarah Johnson',
  'Tech Solutions Inc',
  'Interested in our enterprise plan. Mentioned budget of $50k. Prefers email communication.',
  NOW()
);

-- Get the customer_id (you'll need it)
SELECT id FROM customers WHERE display_name = 'Sarah Johnson' LIMIT 1;
```

4. Add contact info (replace `CUSTOMER_ID`):
```sql
-- Add phone
INSERT INTO customer_phones (account_id, customer_id, phone_e164)
VALUES (
  'YOUR_ACCOUNT_ID',
  'CUSTOMER_ID',
  '+15551234567'
);

-- Add email
INSERT INTO customer_emails (account_id, customer_id, email_lower)
VALUES (
  'YOUR_ACCOUNT_ID',
  'CUSTOMER_ID',
  'sarah@techsolutions.com'
);
```

5. Add some test memories:
```sql
-- Add memories (replace CUSTOMER_ID)
INSERT INTO memories (account_id, customer_id, type, content, source)
VALUES 
  ('YOUR_ACCOUNT_ID', 'CUSTOMER_ID', 'personal', 'Has two kids, loves hiking', 'call'),
  ('YOUR_ACCOUNT_ID', 'CUSTOMER_ID', 'business', 'CTO at Tech Solutions, 50 employees', 'call'),
  ('YOUR_ACCOUNT_ID', 'CUSTOMER_ID', 'commitment', 'Will send proposal by Friday', 'call');
```

6. Add a follow-up:
```sql
INSERT INTO follow_ups (account_id, customer_id, suggestion, status, source)
VALUES (
  'YOUR_ACCOUNT_ID',
  'CUSTOMER_ID',
  'Follow up on proposal by Friday',
  'pending',
  'call'
);
```

7. Go back to http://localhost:3000/dashboard
8. **Expected:** "Sarah Johnson" appears in customer list

### Test 4: Customer Profile ✅

1. Click on "Sarah Johnson"
2. **Expected:** You should see:
   - Customer header with name, company, contact info
   - Pre-call brief with summary
   - Personal Facts section (shows "Has two kids, loves hiking")
   - Business Context section (shows "CTO at Tech Solutions...")
   - Open Commitments section (shows "Will send proposal...")
   - Suggested Next Actions (shows the follow-up)
   - Timeline (empty, but section exists)

### Test 5: Search ✅

1. Go to dashboard
2. Type "Sarah" in search box
3. **Expected:** Customer appears
4. Type "xyz123" 
5. **Expected:** "No customers found" message

### Test 6: Settings ✅

1. Go to Settings
2. Change account name → Click "Save"
3. **Expected:** Name updates, shows "Saved!" message
4. Check Twilio section
5. **Expected:** Shows form to enter credentials (you can skip this)
6. Check Gmail section
7. **Expected:** Shows "Connect Gmail" button (you can skip this)

## What You're Testing

✅ **UI/UX** - All pages load and look correct  
✅ **Authentication** - Sign up/login works  
✅ **Database** - Data persists correctly  
✅ **RLS Security** - Data is isolated per account  
✅ **Customer Profiles** - Pre-call brief displays correctly  
✅ **Search** - Customer search works  
✅ **Settings** - Account settings save  

## Next Steps (Optional)

Once basic testing passes, you can add:
- **OpenAI API Key** → Test AI extraction (if you manually add transcripts/emails)
- **Twilio** → Test call ingestion (requires ngrok for local testing)
- **Gmail OAuth** → Test email syncing

But for now, you can verify the entire UI and core functionality works!

