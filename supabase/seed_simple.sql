-- Simple Seed Script for Testing
-- Run this AFTER you've signed up and have an account

-- STEP 1: Get your account_id (run this first!)
SELECT id, name, created_at FROM accounts ORDER BY created_at DESC LIMIT 1;

-- STEP 2: Copy the id from above, then replace 'YOUR_ACCOUNT_ID' in the script below
-- Then run the entire script below

-- ============================================
-- CUSTOMER 1: Sarah Johnson
-- ============================================
DO $$
DECLARE
  v_account_id uuid := '5f903d36-2f47-4b48-9569-c860cc4c09a7';  -- REPLACE THIS!
  v_customer1_id uuid;
  v_customer2_id uuid;
  v_customer3_id uuid;
  v_customer4_id uuid;
  v_call1_id uuid;
  v_call2_id uuid;
BEGIN
  -- Create Customer 1: Sarah Johnson
  INSERT INTO customers (account_id, display_name, company, summary, last_interaction_at)
  VALUES (
    v_account_id,
    'Sarah Johnson',
    'Tech Solutions Inc',
    'CTO at Tech Solutions, 50 employees. Interested in enterprise plan with $50k budget. Prefers email communication. Mentioned Q2 implementation timeline.',
    NOW() - INTERVAL '2 days'
  )
  RETURNING id INTO v_customer1_id;

  INSERT INTO customer_phones (account_id, customer_id, phone_e164)
  VALUES (v_account_id, v_customer1_id, '+15551234567')
  ON CONFLICT (account_id, phone_e164) DO NOTHING;

  INSERT INTO customer_emails (account_id, customer_id, email_lower)
  VALUES (v_account_id, v_customer1_id, 'sarah.johnson@techsolutions.com')
  ON CONFLICT (account_id, email_lower) DO NOTHING;

  INSERT INTO memories (account_id, customer_id, type, content, source) VALUES
    (v_account_id, v_customer1_id, 'personal', 'Has two kids, loves hiking on weekends', 'call'),
    (v_account_id, v_customer1_id, 'business', 'CTO at Tech Solutions, manages team of 15 engineers', 'call'),
    (v_account_id, v_customer1_id, 'business', 'Budget approved: $50k for Q2 implementation', 'call'),
    (v_account_id, v_customer1_id, 'commitment', 'Will send technical requirements document by Friday', 'call'),
    (v_account_id, v_customer1_id, 'commitment', 'Needs SOC 2 compliance documentation before moving forward', 'email');

  INSERT INTO follow_ups (account_id, customer_id, suggestion, status, source) VALUES
    (v_account_id, v_customer1_id, 'Follow up on technical requirements document by Friday', 'pending', 'call'),
    (v_account_id, v_customer1_id, 'Send SOC 2 compliance documentation', 'pending', 'email');

  -- Create a call
  INSERT INTO calls (account_id, customer_id, twilio_call_sid, direction, from_phone, to_phone, started_at, duration_seconds, recording_status)
  VALUES (v_account_id, v_customer1_id, 'CA' || substr(md5(random()::text), 1, 32), 'inbound', '+15551234567', '+15550000000', NOW() - INTERVAL '2 days', 420, 'completed')
  RETURNING id INTO v_call1_id;

  INSERT INTO transcripts (account_id, call_id, raw_text)
  VALUES (v_account_id, v_call1_id, 'Hi Sarah, thanks for taking my call. I wanted to follow up on our conversation about the enterprise plan. You mentioned you needed SOC 2 compliance documentation. I can send that over today. Also, you said you would send the technical requirements by Friday. Does that timeline still work for you?');

  INSERT INTO emails (account_id, customer_id, gmail_message_id, direction, from_email, to_emails, subject, body_snippet, sent_at)
  VALUES (v_account_id, v_customer1_id, 'msg_' || substr(md5(random()::text), 1, 16), 'received', 'sarah.johnson@techsolutions.com', ARRAY['you@example.com'], 'Re: Technical Requirements', 'Thanks for the call. I will send the technical requirements document by Friday as discussed.', NOW() - INTERVAL '1 day');

  -- ============================================
  -- CUSTOMER 2: Michael Chen
  -- ============================================
  INSERT INTO customers (account_id, display_name, company, summary, last_interaction_at)
  VALUES (
    v_account_id,
    'Michael Chen',
    'Chen Consulting',
    'Solo consultant looking for affordable solution. Budget-conscious, needs basic features. Very responsive via email.',
    NOW() - INTERVAL '5 days'
  )
  RETURNING id INTO v_customer2_id;

  INSERT INTO customer_phones (account_id, customer_id, phone_e164)
  VALUES (v_account_id, v_customer2_id, '+15559876543')
  ON CONFLICT (account_id, phone_e164) DO NOTHING;

  INSERT INTO customer_emails (account_id, customer_id, email_lower)
  VALUES (v_account_id, v_customer2_id, 'michael@chenconsulting.com')
  ON CONFLICT (account_id, email_lower) DO NOTHING;

  INSERT INTO memories (account_id, customer_id, type, content, source) VALUES
    (v_account_id, v_customer2_id, 'personal', 'Works from home, prefers afternoon calls', 'call'),
    (v_account_id, v_customer2_id, 'business', 'Solo consultant, handles 10-15 clients at a time', 'call'),
    (v_account_id, v_customer2_id, 'business', 'Budget: $99/month max, needs basic features only', 'call');

  INSERT INTO follow_ups (account_id, customer_id, suggestion, status, source)
  VALUES (v_account_id, v_customer2_id, 'Send pricing comparison for monthly plans', 'pending', 'email');

  -- ============================================
  -- CUSTOMER 3: Emily Rodriguez
  -- ============================================
  INSERT INTO customers (account_id, display_name, company, summary, last_interaction_at)
  VALUES (
    v_account_id,
    'Emily Rodriguez',
    'Rodriguez Marketing',
    'Marketing agency owner, 25 employees. Very interested, asked for demo. Needs custom branding options.',
    NOW() - INTERVAL '1 hour'
  )
  RETURNING id INTO v_customer3_id;

  INSERT INTO customer_phones (account_id, customer_id, phone_e164)
  VALUES (v_account_id, v_customer3_id, '+15555551234')
  ON CONFLICT (account_id, phone_e164) DO NOTHING;

  INSERT INTO customer_emails (account_id, customer_id, email_lower)
  VALUES (v_account_id, v_customer3_id, 'emily@rodriguezmarketing.com')
  ON CONFLICT (account_id, email_lower) DO NOTHING;

  INSERT INTO memories (account_id, customer_id, type, content, source) VALUES
    (v_account_id, v_customer3_id, 'business', 'Marketing agency with 25 employees, serves Fortune 500 clients', 'call'),
    (v_account_id, v_customer3_id, 'business', 'Needs white-label/custom branding for client-facing features', 'call'),
    (v_account_id, v_customer3_id, 'commitment', 'Scheduled demo for next Tuesday at 2pm', 'call');

  INSERT INTO follow_ups (account_id, customer_id, suggestion, status, source)
  VALUES (v_account_id, v_customer3_id, 'Prepare demo with custom branding examples for Tuesday', 'pending', 'call');

  INSERT INTO calls (account_id, customer_id, twilio_call_sid, direction, from_phone, to_phone, started_at, duration_seconds, recording_status)
  VALUES (v_account_id, v_customer3_id, 'CA' || substr(md5(random()::text), 1, 32), 'outbound', '+15550000000', '+15555551234', NOW() - INTERVAL '1 hour', 180, 'completed')
  RETURNING id INTO v_call2_id;

  INSERT INTO emails (account_id, customer_id, gmail_message_id, direction, from_email, to_emails, subject, body_snippet, sent_at)
  VALUES (v_account_id, v_customer3_id, 'msg_' || substr(md5(random()::text), 1, 16), 'sent', 'you@example.com', ARRAY['emily@rodriguezmarketing.com'], 'Demo Scheduled - Tuesday 2pm', 'Hi Emily, confirmed our demo for Tuesday at 2pm.', NOW() - INTERVAL '2 hours');

  -- ============================================
  -- CUSTOMER 4: David Kim
  -- ============================================
  INSERT INTO customers (account_id, display_name, company, summary, last_interaction_at)
  VALUES (
    v_account_id,
    'David Kim',
    'Kim Industries',
    'Long-time customer, very satisfied. Recently upgraded to enterprise plan. Always pays on time. Referred 3 other customers.',
    NOW() - INTERVAL '7 days'
  )
  RETURNING id INTO v_customer4_id;

  INSERT INTO customer_phones (account_id, customer_id, phone_e164)
  VALUES (v_account_id, v_customer4_id, '+15554443322')
  ON CONFLICT (account_id, phone_e164) DO NOTHING;

  INSERT INTO customer_emails (account_id, customer_id, email_lower)
  VALUES (v_account_id, v_customer4_id, 'david@kimindustries.com')
  ON CONFLICT (account_id, email_lower) DO NOTHING;

  INSERT INTO memories (account_id, customer_id, type, content, source) VALUES
    (v_account_id, v_customer4_id, 'personal', 'Married with 3 kids, lives in Seattle', 'call'),
    (v_account_id, v_customer4_id, 'business', 'CEO of Kim Industries, 200 employees, manufacturing company', 'call'),
    (v_account_id, v_customer4_id, 'business', 'Upgraded to enterprise plan last month, very happy with service', 'email'),
    (v_account_id, v_customer4_id, 'commitment', 'Will provide testimonial for website next week', 'call');

  RAISE NOTICE 'Seed data created successfully!';
END $$;

-- Verify the data was created
SELECT 
  c.display_name,
  c.company,
  COUNT(DISTINCT m.id) as memory_count,
  COUNT(DISTINCT f.id) as followup_count
FROM customers c
LEFT JOIN memories m ON c.id = m.customer_id
LEFT JOIN follow_ups f ON c.id = f.customer_id
WHERE c.account_id = '5f903d36-2f47-4b48-9569-c860cc4c09a7'  -- Your account_id
GROUP BY c.id, c.display_name, c.company;

