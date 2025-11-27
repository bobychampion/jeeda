# Fix Firebase Deployment Permissions

## Issue
Your account `jabpa87@gmail.com` is logged in but doesn't have the required permissions for project "coupleit".

## Solution Options

### Option 1: Grant Permissions in Firebase Console (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select project**: `coupleit`
3. **Go to Project Settings** (gear icon) → **Users and permissions**
4. **Add yourself** (if not already added) with role: **Owner** or **Editor**
5. **Wait 1-2 minutes** for permissions to propagate
6. **Try deploying again**

### Option 2: Re-authenticate

Run this command in your terminal:
```bash
firebase login --reauth
```

Then follow the prompts to re-authenticate.

### Option 3: Use Different Account

If you have access to another account with permissions:
```bash
firebase logout
firebase login
```

---

## After Fixing Permissions

Once permissions are fixed, deploy with:
```bash
cd "/Users/aghoghokpatgehechampion/Replique Designs"
firebase deploy --only hosting
```

Your frontend will be live at:
- `https://coupleit.web.app`
- `https://coupleit.firebaseapp.com`

