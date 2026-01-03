# Gmail OAuth Setup Guide (For Developers)

**Important:** This guide is for **developers** setting up the app. End users don't need to do this - they just click "Connect Gmail" in the app!

The "Error 401: invalid_client" means your Google OAuth credentials aren't set up correctly. Follow these steps:

## Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. Name it (e.g., "Recall App")
4. Click **"Create"**

## Step 2: Enable Required APIs

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"** → Click it → Click **"Enable"**
3. Search for **"People API"** → Click it → Click **"Enable"**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first:
   - User Type: **External** (unless you have Google Workspace)
   - App name: "Recall"
   - User support email: your email
   - Developer contact: your email
   - Click **"Save and Continue"**
   - Scopes: Click **"Add or Remove Scopes"**
     - Add: `https://www.googleapis.com/auth/gmail.readonly`
     - Add: `https://www.googleapis.com/auth/userinfo.email`
   - Click **"Save and Continue"**
   - Test users: Add your email (samfilipiak@gmail.com)
   - Click **"Save and Continue"**

4. Back to creating OAuth client:
   - Application type: **"Web application"**
   - Name: "Recall Web Client"
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - (Add your production URL if you have one)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/gmail/callback`
     - (Add production URL if needed: `https://yourdomain.com/api/gmail/callback`)
   - Click **"Create"**

5. **IMPORTANT:** Copy these values:
   - **Client ID** (looks like: `123456789-abc...apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-...`)

## Step 4: Add to .env.local

Open your `.env.local` file and add:

```env
GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

**Make sure:**
- No quotes around the values
- No extra spaces
- The Client ID ends with `.apps.googleusercontent.com`
- The Client Secret starts with `GOCSPX-`

## Step 5: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## Step 6: Test Again

1. Go to http://localhost:3000/settings
2. Click **"Connect Gmail"**
3. You should see Google's consent screen
4. Select your account (samfilipiak@gmail.com)
5. Click **"Allow"** or **"Continue"**

## Common Issues

### "The OAuth client was not found"
- ✅ Check that Client ID in `.env.local` matches Google Cloud Console exactly
- ✅ Make sure you copied the full Client ID (including `.apps.googleusercontent.com`)
- ✅ Restart your dev server after changing `.env.local`

### "Redirect URI mismatch"
- ✅ Make sure redirect URI in Google Cloud Console is exactly: `http://localhost:3000/api/gmail/callback`
- ✅ No trailing slashes
- ✅ Must be `http://` not `https://` for localhost

### "Access blocked: This app's request is invalid"
- ✅ Make sure you added your email as a test user in OAuth consent screen
- ✅ If in "Testing" mode, only test users can sign in

### Still not working?
1. Check browser console for errors
2. Check your terminal/Next.js logs for errors
3. Verify `.env.local` has correct values:
   ```bash
   # In PowerShell
   Get-Content .env.local | Select-String "GOOGLE"
   ```

## Production Setup

When deploying to production:
1. Add your production URL to authorized redirect URIs
2. Update `NEXT_PUBLIC_APP_URL` in your production environment
3. Publish your OAuth consent screen (if ready)

