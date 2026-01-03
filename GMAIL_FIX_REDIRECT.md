# Fix: Getting Redirected from OAuth Consent Screen

If you're signed in but still getting redirected, the OAuth consent screen probably hasn't been configured yet.

## Solution: Set Up OAuth Consent Screen First

### Step 1: Go to Credentials Page
1. Go to: https://console.cloud.google.com/apis/credentials?project=recall-app-483216
2. Make sure you're signed in and the project is selected

### Step 2: Create OAuth Client (if you haven't)
1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth client ID"**
3. If it asks you to configure the consent screen first, click **"CONFIGURE CONSENT SCREEN"**

### Step 3: Configure OAuth Consent Screen
1. **User Type:** Select **"External"** (unless you have Google Workspace)
2. Click **"CREATE"**
3. Fill in:
   - **App name:** "Recall"
   - **User support email:** Your email (samfilipiak@gmail.com)
   - **Developer contact information:** Your email
4. Click **"SAVE AND CONTINUE"**
5. **Scopes:** Click **"ADD OR REMOVE SCOPES"**
   - Add: `https://www.googleapis.com/auth/gmail.readonly`
   - Add: `https://www.googleapis.com/auth/userinfo.email`
   - Click **"UPDATE"** then **"SAVE AND CONTINUE"**
6. **Test users:** Click **"+ ADD USERS"**
   - Add: `samfilipiak@gmail.com`
   - Click **"ADD"**
7. Click **"SAVE AND CONTINUE"** (skip summary)
8. Click **"BACK TO DASHBOARD"**

### Step 4: Now Create OAuth Client
1. Go back to: https://console.cloud.google.com/apis/credentials?project=recall-app-483216
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. **Application type:** "Web application"
4. **Name:** "Recall Web Client"
5. **Authorized redirect URIs:**
   - Add: `http://localhost:3000/api/gmail/callback`
6. Click **"CREATE"**
7. Copy the **Client ID** and **Client Secret**

### Step 5: Add to .env.local
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## Alternative: If You Already Have OAuth Client

If you already created the OAuth client but can't access consent screen:

1. Go to: https://console.cloud.google.com/apis/credentials?project=recall-app-483216
2. Find your OAuth 2.0 Client ID
3. Click on it
4. Look for a link/button that says **"OAuth consent screen"** or **"CONFIGURE CONSENT SCREEN"**
5. Click that to set it up

## Quick Test

After setting up, try this link again:
https://console.cloud.google.com/apis/credentials/consent?project=recall-app-483216

It should work now!

