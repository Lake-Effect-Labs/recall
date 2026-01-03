# How to Add Test Users to Google OAuth

## Step-by-Step Instructions

### Method 1: Direct URL (Easiest)

1. Go directly to this URL (replace `YOUR_PROJECT_ID` with your actual project ID):
   ```
   https://console.cloud.google.com/apis/credentials/consent?project=YOUR_PROJECT_ID
   ```

2. Or find your project ID first:
   - Go to https://console.cloud.google.com
   - Click the project dropdown at the top
   - Your project ID is shown there (not the project name)

### Method 2: Navigation Path

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com

2. **Select Your Project**
   - Click the project dropdown at the top of the page
   - Select your Recall project

3. **Open the Menu (Hamburger Icon)**
   - Click the ☰ menu icon (top left)

4. **Navigate to OAuth Consent Screen**
   - Click **"APIs & Services"**
   - Click **"OAuth consent screen"** (in the left sidebar)

5. **Find Test Users Section**
   - Scroll down past:
     - App information
     - App domain
     - Authorized domains
     - Developer contact information
   - Look for **"Test users"** section (usually near the bottom)
   - You should see a button **"+ ADD USERS"**

### Method 3: If You Don't See "Test Users"

If the "Test users" section doesn't appear, you might need to:

1. **Check Publishing Status**
   - At the top of the OAuth consent screen, you'll see "Publishing status: Testing"
   - If it says "Published", you won't see test users (anyone can connect)

2. **Make Sure You're in Testing Mode**
   - If it's published, you can click "BACK TO TESTING" to switch back
   - Then the test users section will appear

### Method 4: Alternative - Via Credentials Page

1. Go to **"APIs & Services"** → **"Credentials"**
2. Find your OAuth 2.0 Client ID (the one ending in `.apps.googleusercontent.com`)
3. Click on it
4. Look for a link to **"OAuth consent screen"** or **"Configure consent screen"**
5. Click that link
6. Then follow Method 2 above

## What You Should See

When you find the right page, you should see:

```
OAuth consent screen
─────────────────────
Publishing status: Testing

[Various app info fields...]

Test users
──────────
This app is in testing mode. Only test users can sign in.

+ ADD USERS
```

## Quick Checklist

- [ ] I'm logged into the correct Google account
- [ ] I've selected the correct project
- [ ] I'm on the "OAuth consent screen" page
- [ ] I see "Publishing status: Testing" at the top
- [ ] I've scrolled down to find "Test users" section
- [ ] I see the "+ ADD USERS" button

## Still Can't Find It?

**Option A: Share Your Screen**
- Take a screenshot of what you see on the OAuth consent screen
- I can help you locate it

**Option B: Use Direct URL**
- Find your project ID (shown in the project dropdown)
- Go to: `https://console.cloud.google.com/apis/credentials/consent?project=YOUR_PROJECT_ID`
- Replace `YOUR_PROJECT_ID` with your actual project ID

**Option C: Check if Already Published**
- If the app is already published, you might not need test users
- But if you're getting 403 errors, it's likely still in testing mode

## What to Do Once You Find It

1. Click **"+ ADD USERS"**
2. Enter your email: `samfilipiak@gmail.com`
3. Click **"ADD"**
4. Wait 1-2 minutes for Google to sync
5. Try connecting Gmail in your app again

