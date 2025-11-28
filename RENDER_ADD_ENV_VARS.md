# How to Add Environment Variables to Render

## Step-by-Step Guide

### Step 1: Log in to Render Dashboard

1. Go to **https://dashboard.render.com**
2. Log in with your account

---

### Step 2: Navigate to Your Service

1. In the dashboard, you'll see a list of your services
2. Click on **`jeeda-backend`** (or whatever you named your backend service)
3. This will open the service details page

---

### Step 3: Open Environment Variables

1. In the service page, look at the left sidebar
2. Click on **"Environment"** (it's usually near the bottom of the sidebar)
3. You'll see a list of existing environment variables (if any)

---

### Step 4: Add/Edit Environment Variables

#### Option A: Adding a New Variable

1. Click the **"Add Environment Variable"** button (usually at the top or bottom of the list)
2. A form will appear with two fields:
   - **Key**: Enter the variable name (e.g., `FIREBASE_PROJECT_ID`)
   - **Value**: Enter the variable value (e.g., `coupleit`)
3. Click **"Save Changes"**

#### Option B: Editing an Existing Variable

1. Find the variable in the list (e.g., `FIREBASE_PRIVATE_KEY`)
2. Click the **"Edit"** button (usually a pencil icon or "Edit" link)
3. Update the **Value** field
4. Click **"Save Changes"**

---

### Step 5: Add Firebase Credentials

Add these three variables one by one:

#### Variable 1: FIREBASE_PROJECT_ID
- **Key**: `FIREBASE_PROJECT_ID`
- **Value**: `coupleit`
- Click **"Save Changes"**

#### Variable 2: FIREBASE_CLIENT_EMAIL
- **Key**: `FIREBASE_CLIENT_EMAIL`
- **Value**: `firebase-adminsdk-fbsvc@coupleit.iam.gserviceaccount.com`
- Click **"Save Changes"**

#### Variable 3: FIREBASE_PRIVATE_KEY (IMPORTANT!)
- **Key**: `FIREBASE_PRIVATE_KEY`
- **Value**: Copy the ENTIRE value from the script output (including quotes):
  ```
  
  ```
- **⚠️ CRITICAL**: Make sure to include:
  - The opening quote `"`
  - All the `\n` characters (backslash + n)
  - The closing quote `"`
- Click **"Save Changes"**

---

### Step 6: Verify All Variables Are Added

Your environment variables list should now include:

✅ `FIREBASE_PROJECT_ID` = `coupleit`
✅ `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@coupleit.iam.gserviceaccount.com`
✅ `FIREBASE_PRIVATE_KEY` = `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

Plus any other variables you need:
- `HUGGINGFACE_API_KEY` (if not already added)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `FRONTEND_URL` = `https://coupleit.web.app`

---

### Step 7: Redeploy (Automatic or Manual)

#### Automatic Redeploy
- Render will **automatically redeploy** when you save environment variables
- You'll see a notification or the deployment will start automatically
- Wait 2-3 minutes for deployment to complete

#### Manual Redeploy (if needed)
1. Go to the **"Events"** or **"Deploy"** tab
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment to complete

---

### Step 8: Verify It's Working

After deployment completes:

1. Visit: **https://jeeda.onrender.com/api/ai/diagnostics**
2. Check the `firebase` status - it should show:
   ```json
   "firebase": {
     "status": "ok",
     "templatesFound": <number>,
     "canQuery": true
   }
   ```

---

## Visual Guide (What You'll See)

```
Render Dashboard
├── Services
│   └── jeeda-backend (click this)
│       ├── Overview
│       ├── Logs
│       ├── Metrics
│       ├── Environment ← CLICK HERE
│       │   ├── [List of variables]
│       │   └── "Add Environment Variable" button
│       ├── Settings
│       └── Events
```

---

## Common Issues & Solutions

### Issue 1: "Variable not saving"
- **Solution**: Make sure you clicked "Save Changes" after entering the value

### Issue 2: "Firebase still failing after adding variables"
- **Solution**: 
  - Double-check the `FIREBASE_PRIVATE_KEY` includes quotes and `\n` characters
  - Make sure there are no extra spaces before/after the value
  - Wait for the redeploy to complete (check the Events tab)

### Issue 3: "Can't find the Environment tab"
- **Solution**: 
  - Make sure you're in the service details page (not the dashboard)
  - Look in the left sidebar - it might be called "Environment Variables" or just "Environment"

### Issue 4: "Private key too long to paste"
- **Solution**: 
  - Render supports long values
  - Try pasting in smaller chunks if needed
  - Or use the script output directly

---

## Quick Reference: All Required Variables

Copy this list and check off as you add them:

- [ ] `FIREBASE_PROJECT_ID` = `coupleit`
- [ ] `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@coupleit.iam.gserviceaccount.com`
- [ ] `FIREBASE_PRIVATE_KEY` = `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
- [ ] `HUGGINGFACE_API_KEY` = `your_huggingface_key`
- [ ] `CLOUDINARY_CLOUD_NAME` = `your_cloudinary_cloud_name`
- [ ] `CLOUDINARY_API_KEY` = `your_cloudinary_api_key`
- [ ] `CLOUDINARY_API_SECRET` = `your_cloudinary_api_secret`
- [ ] `SMTP_HOST` = `smtp.gmail.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_USER` = `your_email@gmail.com`
- [ ] `SMTP_PASS` = `your_app_password`
- [ ] `FRONTEND_URL` = `https://coupleit.web.app`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000` (or leave Render's default)

---

## Need Help?

If you're still having issues:
1. Check the Render logs: Dashboard → Your Service → Logs
2. Visit the diagnostics endpoint: `https://jeeda.onrender.com/api/ai/diagnostics`
3. Verify all variables are set correctly in the Environment tab

