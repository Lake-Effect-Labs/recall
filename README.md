# Recall - AI Relationship Memory Assistant

Recall is an AI-powered customer relationship memory assistant that automatically builds customer profiles from phone calls and emails, providing a pre-interaction brief before every customer touchpoint.

## Features

- **Automatic Call Recording & Transcription**: Twilio integration captures calls, Whisper API transcribes them
- **Gmail Sync**: Read-only Gmail integration to import customer emails
- **AI-Powered Extraction**: GPT-4o-mini extracts personal facts, business context, commitments, and follow-ups
- **Pre-Call Briefs**: See a summary of who the customer is, what matters, and suggested actions
- **Unified Customer Profiles**: Calls and emails linked to customer profiles with phone/email matching
- **Multi-Tenant Security**: Row Level Security ensures complete data isolation between accounts

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth
- **Voice**: Twilio (calls, recordings, webhooks)
- **Transcription**: OpenAI Whisper API
- **AI Extraction**: OpenAI GPT-4o-mini
- **Email**: Gmail API (read-only)

## Setup

### 1. Clone and Install

```bash
cd recall-app
npm install
```

### 2. Environment Variables

Copy `env.example` to `.env.local` and fill in your values:

```bash
cp env.example .env.local
```

Required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Google OAuth (for Gmail)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run the migrations in order:

```bash
# In Supabase SQL Editor, run:
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/migrations/002_rls_policies.sql
# 3. supabase/migrations/003_account_creation_trigger.sql
```

3. Enable Email Auth in Authentication > Providers

### 4. Twilio Setup

1. Create a Twilio account at https://twilio.com
2. Get a phone number with Voice capabilities
3. In your phone number settings:
   - Set the webhook URL for incoming calls to: `https://your-domain.com/api/twilio/voice`
   - Method: POST
4. Note your Account SID and Auth Token
5. In Recall settings, enter your Twilio credentials

### 5. Google OAuth Setup (for Gmail)

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create a new project
3. Enable the Gmail API and People API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/gmail/callback` (and your production URL)
5. Add the Client ID and Secret to your `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Testing Call Ingestion

For local development, use ngrok to expose your webhook:

```bash
ngrok http 3000
```

Update your Twilio webhook URL to use the ngrok URL:
`https://your-ngrok-id.ngrok.io/api/twilio/voice`

Then call your Twilio number. The call will be recorded, transcribed, and insights extracted.

## Architecture

### Data Flow

1. **Call comes in** → Twilio webhook creates customer (if new) and call record
2. **Recording completes** → Webhook triggers transcription via Whisper
3. **Transcription done** → GPT-4o-mini extracts facts, commitments, follow-ups
4. **Email sync** → Gmail API fetches emails, links to customers by email/phone
5. **Customer profile** → Shows unified timeline + pre-call brief

### Database Schema

- `accounts` - Multi-tenant accounts
- `profiles` - Maps auth users to accounts
- `customers` - Customer records
- `customer_phones` / `customer_emails` - Contact info (for matching)
- `calls` - Call records with Twilio metadata
- `transcripts` - Whisper transcriptions
- `emails` - Synced Gmail messages
- `memories` - Extracted facts (personal/business/commitment)
- `follow_ups` - Suggested actions
- `integrations_gmail` / `integrations_twilio` - Per-account credentials

### Security

- All tables have Row Level Security (RLS) enabled
- `current_account_id()` function provides tenant isolation
- Twilio webhooks are signature-verified
- Service role key is only used server-side

## Deployment

This app is Vercel-compatible. Deploy with:

```bash
vercel
```

Set all environment variables in Vercel dashboard.

**Important**: Update `NEXT_PUBLIC_APP_URL` to your production URL and update your Twilio/Google OAuth redirect URLs.

## Cost Considerations

- **Whisper**: ~$0.006 per minute of audio
- **GPT-4o-mini**: ~$0.15 per 1M input tokens, $0.60 per 1M output tokens
- **Twilio**: ~$0.0085 per minute for recording + standard call rates
- Extraction runs once per call/email (idempotent)
- Long transcripts are truncated to reduce token usage

## License

MIT
