# How to Seed Test Data

This will populate your database with 4 test customers so you can test the UI without setting up Twilio/Gmail.

## Quick Steps

### 1. Sign Up First
Make sure you've created an account at http://localhost:3000 (sign up/login)

### 2. Get Your Account ID
1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query:
```sql
SELECT id, name, created_at FROM accounts ORDER BY created_at DESC LIMIT 1;
```
3. **Copy the `id`** (it's a UUID like `123e4567-e89b-12d3-a456-426614174000`)

### 3. Run the Seed Script
1. Open `supabase/seed_simple.sql` in a text editor
2. Find `'YOUR_ACCOUNT_ID'` (appears twice at the top)
3. Replace both with your actual account_id (the UUID you copied)
4. Copy the entire script
5. Paste into Supabase SQL Editor
6. Click **"Run"**

### 4. Verify It Worked
You should see a message: "Seed data created successfully!"

Then run this to verify:
```sql
SELECT display_name, company FROM customers;
```

You should see 4 customers:
- Sarah Johnson (Tech Solutions Inc)
- Michael Chen (Chen Consulting)
- Emily Rodriguez (Rodriguez Marketing)
- David Kim (Kim Industries)

### 5. Test in the App
1. Go to http://localhost:3000/dashboard
2. You should see all 4 customers!
3. Click on any customer to see:
   - Pre-call brief
   - Personal facts
   - Business context
   - Commitments
   - Follow-ups
   - Timeline (calls & emails)

## What Gets Created

For each customer:
- ✅ Customer record with summary
- ✅ Phone number
- ✅ Email address
- ✅ Multiple memories (personal, business, commitments)
- ✅ Follow-up suggestions
- ✅ Sample calls with transcripts (for some customers)
- ✅ Sample emails (for some customers)

## Troubleshooting

**"No customers showing up"**
- Make sure you replaced `YOUR_ACCOUNT_ID` with your actual UUID
- Check that you're logged in with the same account
- Verify the seed script ran without errors

**"Error: relation does not exist"**
- Make sure you ran the migrations first (001, 002, 003)
- Check that tables exist in Supabase

**"Duplicate key" errors**
- This is fine - it means data already exists
- You can delete customers and re-run if needed:
```sql
DELETE FROM customers WHERE account_id = 'YOUR_ACCOUNT_ID';
```

## Clean Up (Optional)

To remove all test data:
```sql
-- Replace YOUR_ACCOUNT_ID with your actual account_id
DELETE FROM customers WHERE account_id = 'YOUR_ACCOUNT_ID';
```

This will cascade delete all related data (phones, emails, memories, follow-ups, calls, etc.)

