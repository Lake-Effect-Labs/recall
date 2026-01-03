-- Seed script for testing Recall app
-- Run this in Supabase SQL Editor after you've signed up

-- STEP 1: Get your account_id (run this first and copy the id)
-- SELECT id, name, created_at FROM accounts ORDER BY created_at DESC LIMIT 1;

-- STEP 2: Replace 'YOUR_ACCOUNT_ID' below with your actual account_id from Step 1
-- Then run the rest of this script

-- ============================================
-- CUSTOMER 1: Sarah Johnson (Enterprise Lead)
-- ============================================
INSERT INTO customers (account_id, display_name, company, summary, last_interaction_at)
VALUES (
  'YOUR_ACCOUNT_ID',
  'Sarah Johnson',
  'Tech Solutions Inc',
  'CTO at Tech Solutions, 50 employees. Interested in enterprise plan with $50k budget. Prefers email communication. Mentioned Q2 implementation timeline. Has concerns about data security and compliance.',
  NOW() - INTERVAL '2 days'
)
ON CONFLICT DO NOTHING
RETURNING id INTO customer1_id;

-- Get the customer ID (you'll need to run this separately if the above doesn't work)
-- SELECT id INTO customer1_id FROM customers WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson' LIMIT 1;

-- Add contact info for Sarah
INSERT INTO customer_phones (account_id, customer_id, phone_e164)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  '+15551234567'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson'
ON CONFLICT (account_id, phone_e164) DO NOTHING;

INSERT INTO customer_emails (account_id, customer_id, email_lower)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'sarah.johnson@techsolutions.com'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson'
ON CONFLICT (account_id, email_lower) DO NOTHING;

-- Add memories for Sarah
INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'personal',
  'Has two kids, loves hiking on weekends',
  'call',
  0.9
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson'
ON CONFLICT DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'business',
  'CTO at Tech Solutions, manages team of 15 engineers',
  'call',
  0.95
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson'
ON CONFLICT DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'business',
  'Budget approved: $50k for Q2 implementation',
  'call',
  0.9
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson'
ON CONFLICT DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'commitment',
  'Will send technical requirements document by Friday',
  'call',
  0.85
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson'
ON CONFLICT DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'commitment',
  'Needs SOC 2 compliance documentation before moving forward',
  'email',
  0.9
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson'
ON CONFLICT DO NOTHING;

-- Add follow-ups for Sarah
INSERT INTO follow_ups (account_id, customer_id, suggestion, status, source)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'Follow up on technical requirements document by Friday',
  'pending',
  'call'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson'
ON CONFLICT DO NOTHING;

INSERT INTO follow_ups (account_id, customer_id, suggestion, status, source)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'Send SOC 2 compliance documentation',
  'pending',
  'email'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson'
ON CONFLICT DO NOTHING;

-- ============================================
-- CUSTOMER 2: Michael Chen (Small Business)
-- ============================================
INSERT INTO customers (account_id, display_name, company, summary, last_interaction_at)
VALUES (
  'YOUR_ACCOUNT_ID',
  'Michael Chen',
  'Chen Consulting',
  'Solo consultant looking for affordable solution. Budget-conscious, needs basic features. Very responsive via email. Interested in monthly plan.',
  NOW() - INTERVAL '5 days'
)
ON CONFLICT DO NOTHING;

INSERT INTO customer_phones (account_id, customer_id, phone_e164)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  '+15559876543'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Michael Chen'
ON CONFLICT (account_id, phone_e164) DO NOTHING;

INSERT INTO customer_emails (account_id, customer_id, email_lower)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'michael@chenconsulting.com'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Michael Chen'
ON CONFLICT (account_id, email_lower) DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'personal',
  'Works from home, prefers afternoon calls',
  'call',
  0.8
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Michael Chen'
ON CONFLICT DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'business',
  'Solo consultant, handles 10-15 clients at a time',
  'call',
  0.9
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Michael Chen'
ON CONFLICT DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'business',
  'Budget: $99/month max, needs basic features only',
  'call',
  0.95
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Michael Chen'
ON CONFLICT DO NOTHING;

INSERT INTO follow_ups (account_id, customer_id, suggestion, status, source)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'Send pricing comparison for monthly plans',
  'pending',
  'email'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Michael Chen'
ON CONFLICT DO NOTHING;

-- ============================================
-- CUSTOMER 3: Emily Rodriguez (Hot Lead)
-- ============================================
INSERT INTO customers (account_id, display_name, company, summary, last_interaction_at)
VALUES (
  'YOUR_ACCOUNT_ID',
  'Emily Rodriguez',
  'Rodriguez Marketing',
  'Marketing agency owner, 25 employees. Very interested, asked for demo. Mentioned they work with high-profile clients. Needs custom branding options.',
  NOW() - INTERVAL '1 hour'
)
ON CONFLICT DO NOTHING;

INSERT INTO customer_phones (account_id, customer_id, phone_e164)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  '+15555551234'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Emily Rodriguez'
ON CONFLICT (account_id, phone_e164) DO NOTHING;

INSERT INTO customer_emails (account_id, customer_id, email_lower)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'emily@rodriguezmarketing.com'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Emily Rodriguez'
ON CONFLICT (account_id, email_lower) DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'business',
  'Marketing agency with 25 employees, serves Fortune 500 clients',
  'call',
  0.95
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Emily Rodriguez'
ON CONFLICT DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'business',
  'Needs white-label/custom branding for client-facing features',
  'call',
  0.9
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Emily Rodriguez'
ON CONFLICT DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'commitment',
  'Scheduled demo for next Tuesday at 2pm',
  'call',
  0.95
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Emily Rodriguez'
ON CONFLICT DO NOTHING;

INSERT INTO follow_ups (account_id, customer_id, suggestion, status, source)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'Prepare demo with custom branding examples for Tuesday',
  'pending',
  'call'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Emily Rodriguez'
ON CONFLICT DO NOTHING;

-- ============================================
-- CUSTOMER 4: David Kim (Existing Customer)
-- ============================================
INSERT INTO customers (account_id, display_name, company, summary, last_interaction_at)
VALUES (
  'YOUR_ACCOUNT_ID',
  'David Kim',
  'Kim Industries',
  'Long-time customer, very satisfied. Recently upgraded to enterprise plan. Always pays on time. Referred 3 other customers. Loves the new features.',
  NOW() - INTERVAL '7 days'
)
ON CONFLICT DO NOTHING;

INSERT INTO customer_phones (account_id, customer_id, phone_e164)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  '+15554443322'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'David Kim'
ON CONFLICT (account_id, phone_e164) DO NOTHING;

INSERT INTO customer_emails (account_id, customer_id, email_lower)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'david@kimindustries.com'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'David Kim'
ON CONFLICT (account_id, email_lower) DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'personal',
  'Married with 3 kids, lives in Seattle',
  'call',
  0.85
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'David Kim'
ON CONFLICT DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'business',
  'CEO of Kim Industries, 200 employees, manufacturing company',
  'call',
  0.95
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'David Kim'
ON CONFLICT DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'business',
  'Upgraded to enterprise plan last month, very happy with service',
  'email',
  0.95
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'David Kim'
ON CONFLICT DO NOTHING;

INSERT INTO memories (account_id, customer_id, type, content, source, confidence)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'commitment',
  'Will provide testimonial for website next week',
  'call',
  0.9
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'David Kim'
ON CONFLICT DO NOTHING;

-- ============================================
-- Add some fake calls for testing timeline
-- ============================================
INSERT INTO calls (account_id, customer_id, twilio_call_sid, direction, from_phone, to_phone, started_at, duration_seconds, recording_status)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'CA' || substr(md5(random()::text), 1, 32),
  'inbound',
  '+15551234567',
  '+15550000000',
  NOW() - INTERVAL '2 days',
  420,
  'completed'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson'
ON CONFLICT DO NOTHING;

INSERT INTO calls (account_id, customer_id, twilio_call_sid, direction, from_phone, to_phone, started_at, duration_seconds, recording_status)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'CA' || substr(md5(random()::text), 1, 32),
  'outbound',
  '+15550000000',
  '+15555551234',
  NOW() - INTERVAL '1 hour',
  180,
  'completed'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Emily Rodriguez'
ON CONFLICT DO NOTHING;

-- Add transcripts for the calls
INSERT INTO transcripts (account_id, call_id, raw_text)
SELECT 
  'YOUR_ACCOUNT_ID',
  c.id,
  'Hi Sarah, thanks for taking my call. I wanted to follow up on our conversation about the enterprise plan. You mentioned you needed SOC 2 compliance documentation. I can send that over today. Also, you said you would send the technical requirements by Friday. Does that timeline still work for you?'
FROM calls c
JOIN customers cust ON c.customer_id = cust.id
WHERE cust.account_id = 'YOUR_ACCOUNT_ID' AND cust.display_name = 'Sarah Johnson'
ON CONFLICT DO NOTHING;

-- ============================================
-- Add some fake emails for testing timeline
-- ============================================
INSERT INTO emails (account_id, customer_id, gmail_message_id, direction, from_email, to_emails, subject, body_snippet, sent_at)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'msg_' || substr(md5(random()::text), 1, 16),
  'received',
  'sarah.johnson@techsolutions.com',
  ARRAY['you@example.com'],
  'Re: Technical Requirements',
  'Thanks for the call. I will send the technical requirements document by Friday as discussed. Looking forward to reviewing the SOC 2 documentation.',
  NOW() - INTERVAL '1 day'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Sarah Johnson'
ON CONFLICT DO NOTHING;

INSERT INTO emails (account_id, customer_id, gmail_message_id, direction, from_email, to_emails, subject, body_snippet, sent_at)
SELECT 
  'YOUR_ACCOUNT_ID',
  id,
  'msg_' || substr(md5(random()::text), 1, 16),
  'sent',
  'you@example.com',
  ARRAY['emily@rodriguezmarketing.com'],
  'Demo Scheduled - Tuesday 2pm',
  'Hi Emily, confirmed our demo for Tuesday at 2pm. I will prepare examples of custom branding options for you to review.',
  NOW() - INTERVAL '2 hours'
FROM customers 
WHERE account_id = 'YOUR_ACCOUNT_ID' AND display_name = 'Emily Rodriguez'
ON CONFLICT DO NOTHING;

-- ============================================
-- Summary
-- ============================================
-- After running this script, you should have:
-- - 4 test customers with contact info
-- - Multiple memories (personal, business, commitments)
-- - Several follow-up suggestions
-- - 2 sample calls with transcripts
-- - 2 sample emails
-- 
-- All data will be linked to YOUR_ACCOUNT_ID
-- Make sure to replace 'YOUR_ACCOUNT_ID' with your actual account_id!

