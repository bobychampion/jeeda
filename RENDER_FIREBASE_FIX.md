# Fix Firebase Private Key in Render

## Problem
Your backend deployed but Firebase Admin is failing with:
```
Failed to parse private key: Error: Invalid PEM formatted message.
```

This means the `FIREBASE_PRIVATE_KEY` environment variable in Render is not formatted correctly.

---

## Solution: Fix the Private Key Format

### Step 1: Get Your Private Key

You have two options:

#### Option A: From Firebase Console
1. Go to https://console.firebase.google.com
2. Select project: `coupleit`
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file

#### Option B: From Your Local `.env` File
If you have it in `backend/.env`, copy the `FIREBASE_PRIVATE_KEY` value.

### Step 2: Format the Key for Render

The private key needs to be formatted as a **single line with `\n` characters**.

**Example format:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDChmD82ohaEtSl\n...rest of key...\n-----END PRIVATE KEY-----\n
```

### Step 3: Add to Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your service: `jeeda-backend`
3. Go to **"Environment"** tab
4. Find `FIREBASE_PRIVATE_KEY`
5. Click **"Edit"** or **"Add"** if it doesn't exist
6. Paste the formatted key (with `\n` characters)
7. **Important:** Make sure the entire value is wrapped in quotes: `"..."`

**Correct Format:**
```
"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDChmD82ohaEtSl\nBYN0j6vsN0oZ6vWReEkaSGfz5EcYwAmt0e70IhZw9T3zNSjRCJES47IDVRfvFANK\n...rest of key...\n-----END PRIVATE KEY-----\n"
```

### Step 4: Restart Service

1. After updating the environment variable
2. Go to **"Manual Deploy"** → **"Clear build cache & deploy"**
3. Or wait for auto-deploy

---

## Quick Format Helper

### Option A: Use the Helper Script (Easiest) ✅

1. Make sure you have the Firebase service account JSON file (e.g., `coupleit-firebase-adminsdk-fbsvc-083446a894.json`)
2. Run the helper script:

```bash
cd backend
node format-key-for-render.js ../coupleit-firebase-adminsdk-fbsvc-083446a894.json
```

This will output the correctly formatted values you can copy directly to Render.

### Option B: Manual Formatting

If you prefer to do it manually:
1. Open the JSON file
2. Copy the `private_key` value
3. Replace all actual newlines with `\n` (backslash + n)
4. Wrap the entire thing in quotes: `"..."`

---

## Verify It's Working

After redeploying, check the logs. You should see:
- ✅ No "Firebase Admin initialization error"
- ✅ Server running successfully
- ✅ API endpoints responding

Test: `https://jeeda.onrender.com/health`

---

## Alternative: Use Service Account File (Not Recommended for Render)

For Render, environment variables are the recommended approach. Using a file would require additional setup.

---

## Current Status

Your service is live at: **https://jeeda.onrender.com** ✅

But Firebase features won't work until the private key is fixed.

