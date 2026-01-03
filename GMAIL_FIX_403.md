# Fix: Error 403 - Access Denied

This error means your Google OAuth app is in "Testing" mode and your email isn't added as a test user.

## Quick Fix (2 minutes)

### Step 1: Go to Google Cloud Console
1. Go to https://console.cloud.google.com
2. Select your project (the one you created for Recall)

### Step 2: Add Test Users
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Scroll down to **"Test users"** section
3. Click **"+ ADD USERS"**
4. Add your email address (the one you're trying to connect with Gmail)
   - If you're testing with `samfilipiak@gmail.com`, add that
   - You can add multiple emails (one per line)
5. Click **"ADD"**

### Step 3: Try Again
1. Go back to your Recall app
2. Go to Settings → Gmail
3. Click "Connect Gmail" again
4. It should work now!

## Alternative: Publish Your App (For Production)

If you want anyone to be able to connect (not just test users):

1. Go to **"OAuth consent screen"**
2. Scroll to the bottom
3. Click **"PUBLISH APP"**
4. Confirm the warning

**Note:** Publishing requires Google to review your app if you're requesting sensitive scopes. For now, adding test users is easier.

## For Multiple Users

If you're building this for multiple customers:
- **Option 1:** Add each user's email as a test user (works for up to 100 users)
- **Option 2:** Publish the app (requires Google verification for sensitive scopes)

## Troubleshooting

**Still getting 403?**
- Make sure you added the EXACT email you're signing in with
- Wait a minute after adding test users (Google needs to sync)
- Try signing out and back in to Google
- Clear browser cache/cookies

**Want to add more test users later?**
- Just go back to OAuth consent screen → Test users → Add more emails

