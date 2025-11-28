# Fix Firebase Private Key in Render

## Problem
Your diagnostics show:
```json
"firebase": {
  "status": "failed",
  "error": "2 UNKNOWN: Getting metadata from plugin failed with error: error:1E08010C:DECODER routines::unsupported"
}
```

This means the `FIREBASE_PRIVATE_KEY` in Render is **not properly formatted**.

---

## Solution: Fix the Private Key Format

### Step 1: Get the Correctly Formatted Key

Run this command in your terminal:
```bash
cd backend
node format-key-for-render.js ../backend/coupleit-firebase-adminsdk-fbsvc-083446a894.json
```

This will output the correctly formatted values.

### Step 2: Update Render Environment Variables

1. **Go to Render Dashboard:**
   - https://dashboard.render.com
   - Click on your `jeeda-backend` service

2. **Go to Environment Tab:**
   - Click "Environment" in the sidebar

3. **Update `FIREBASE_PRIVATE_KEY`:**
   - Find `FIREBASE_PRIVATE_KEY` in the list
   - Click "Edit" or delete and re-add it
   - **IMPORTANT:** Copy the ENTIRE value from the script output, including:
     - The opening quote `"`
     - The entire key with `\n` characters
     - The closing quote `"`
   - Example format:
     ```
     "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDChmD82ohaEtSl\n...rest of key...\n-----END PRIVATE KEY-----\n"
     ```

4. **Verify Other Variables:**
   - `FIREBASE_PROJECT_ID` should be: `coupleit`
   - `FIREBASE_CLIENT_EMAIL` should be: `firebase-adminsdk-fbsvc@coupleit.iam.gserviceaccount.com`

### Step 3: Save and Redeploy

1. Click "Save Changes"
2. Render will automatically redeploy (or click "Manual Deploy" → "Deploy latest commit")
3. Wait 2-3 minutes for deployment

### Step 4: Verify It's Fixed

After redeploy, visit:
```
https://jeeda.onrender.com/api/ai/diagnostics
```

You should see:
```json
"firebase": {
  "status": "ok",
  "templatesFound": <number>,
  "canQuery": true
}
```

---

## Common Mistakes

❌ **Wrong:** Copying the key without quotes
```
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDChmD82ohaEtSl
...
-----END PRIVATE KEY-----
```

✅ **Correct:** Key with quotes and `\n` characters
```
"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDChmD82ohaEtSl\n...\n-----END PRIVATE KEY-----\n"
```

---

## Quick Fix Script

If you have the JSON file, run:
```bash
cd backend
node format-key-for-render.js ../backend/coupleit-firebase-adminsdk-fbsvc-083446a894.json
```

Then copy the `FIREBASE_PRIVATE_KEY` value (including quotes) to Render.

---

## After Fixing

Once Firebase is working, all these features will work:
- ✅ Template recommendations
- ✅ AI chat assistant
- ✅ Template management
- ✅ Category management
- ✅ All Firestore operations

Your other services (Hugging Face, Cloudinary, Email) are already working! 🎉

