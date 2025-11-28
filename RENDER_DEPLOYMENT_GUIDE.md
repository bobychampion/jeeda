# Deploy Backend to Render - Complete Guide

This guide will walk you through deploying your Jeeda backend to Render.

## Prerequisites

- A Render account (sign up at https://render.com - free tier available)
- Your backend code pushed to GitHub (already done ✅)
- All environment variables ready

---

## Step 1: Prepare Your Backend

### 1.1 Verify Your Backend Structure

Your backend should have:
- ✅ `package.json` with start script
- ✅ `render.yaml` configuration file
- ✅ `src/server.js` as entry point
- ✅ All dependencies listed in `package.json`

### 1.2 Check Your Start Command

Your `package.json` should have:
```json
{
  "scripts": {
    "start": "node src/server.js"
  }
}
```

---

## Step 2: Create a Render Account & New Web Service

### 2.1 Sign Up / Log In
1. Go to https://render.com
2. Sign up or log in (you can use GitHub to sign in)

### 2.2 Create New Web Service
1. Click **"New +"** button
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select repository: **`bobychampion/jeeda`**

---

## Step 3: Configure Your Service

### 3.1 Basic Settings

**Name:** `jeeda-backend` (or your preferred name)

**Region:** Choose closest to your users (e.g., `Oregon (US West)`)

**Branch:** `main`

**Root Directory:** `backend` ⚠️ **Important!**

**Runtime:** `Node`

**Build Command:** `npm install`

**Start Command:** `npm start`

### 3.2 Plan Selection
- **Free Plan**: Good for testing (spins down after 15 min inactivity)
- **Starter Plan ($7/month)**: Always on, better for production

---

## Step 4: Add Environment Variables

Click on **"Environment"** tab and add these variables:

### Required Variables:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=coupleit
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@coupleit.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Server Configuration
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://coupleit.web.app

# AI Services
GEMINI_API_KEY=your_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Paystack (if using)
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### ⚠️ Important Notes:

1. **FIREBASE_PRIVATE_KEY**: 
   - Must include the full key with `\n` for newlines
   - Format: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
   - Keep the quotes around the entire value

2. **PORT**: 
   - Render automatically sets `PORT` environment variable
   - Your server should use `process.env.PORT || 5000`
   - Render uses port `10000` by default

---

## Step 5: Deploy

### 5.1 Initial Deployment
1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Start your server (`npm start`)
3. Watch the build logs for any errors

### 5.2 Get Your Backend URL
After deployment, Render will give you a URL like:
```
https://jeeda-backend.onrender.com
```

**Save this URL!** You'll need it for the frontend.

---

## Step 6: Update Frontend with Backend URL

### 6.1 Update Frontend Environment

Edit `frontend/src/config/api.js`:

```javascript
export const API_URL = import.meta.env.VITE_API_URL || 
  (isProduction 
    ? 'https://jeeda-backend.onrender.com' // ← Your Render URL
    : 'http://localhost:5000'
  );
```

### 6.2 Or Use Environment Variable

Create `frontend/.env.production`:
```env
VITE_API_URL=https://jeeda-backend.onrender.com
```

### 6.3 Rebuild and Redeploy Frontend

```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

---

## Step 7: Update Backend CORS Settings

Make sure your backend allows your frontend domain. Your `backend/src/server.js` should have:

```javascript
app.use(cors({
  origin: [
    'https://coupleit.web.app',
    'https://coupleit.firebaseapp.com',
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ],
  credentials: true,
}));
```

---

## Step 8: Test Your Deployment

### 8.1 Test Backend Health
Visit: `https://jeeda-backend.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "message": "Jeeda API is running"
}
```

### 8.2 Test API Endpoints
- `https://jeeda-backend.onrender.com/api/templates`
- `https://jeeda-backend.onrender.com/api/ai/status`

### 8.3 Test from Frontend
- Go to https://coupleit.web.app
- Try using AI chat or creating a template
- Check browser console for any errors

---

## Troubleshooting

### Issue: Build Fails

**Error:** `Cannot find module`
- **Solution:** Make sure `package.json` has all dependencies listed

**Error:** `Build command failed`
- **Solution:** Check build logs, ensure Node version is compatible

### Issue: Server Crashes on Start

**Error:** `Port already in use`
- **Solution:** Make sure you're using `process.env.PORT` in your server

**Error:** `Firebase Admin initialization error`
- **Solution:** Check `FIREBASE_PRIVATE_KEY` format (must have `\n` for newlines)

### Issue: CORS Errors

**Error:** `Access-Control-Allow-Origin`
- **Solution:** 
  1. Add your frontend URL to CORS origins in `backend/src/server.js`
  2. Restart the Render service

### Issue: Environment Variables Not Working

**Solution:**
- Make sure variable names match exactly (case-sensitive)
- For `FIREBASE_PRIVATE_KEY`, keep the quotes and `\n` characters
- Restart service after adding variables

### Issue: Service Spins Down (Free Plan)

**Problem:** Service goes to sleep after 15 minutes of inactivity

**Solutions:**
1. Upgrade to Starter plan ($7/month) for always-on
2. Use a service like UptimeRobot to ping your service every 10 minutes
3. Accept the cold start delay (first request takes ~30 seconds)

---

## Render Configuration File

Your `backend/render.yaml` is already configured:

```yaml
services:
  - type: web
    name: jeeda-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

**Note:** You can also configure via Render dashboard (recommended for first-time setup).

---

## Quick Deploy Checklist

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Web service created with correct root directory (`backend`)
- [ ] All environment variables added
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Service deployed successfully
- [ ] Backend URL obtained (e.g., `https://jeeda-backend.onrender.com`)
- [ ] Frontend updated with backend URL
- [ ] Frontend rebuilt and redeployed
- [ ] CORS configured correctly
- [ ] Tested health endpoint
- [ ] Tested API from frontend

---

## Cost Estimate

**Free Plan:**
- ✅ Free forever
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start delay (~30 seconds)

**Starter Plan:**
- 💰 $7/month
- ✅ Always on
- ✅ No cold starts
- ✅ Better for production

---

## Next Steps After Deployment

1. **Set up Custom Domain** (optional):
   - In Render dashboard → Settings → Custom Domain
   - Add your domain (e.g., `api.jeeda.com`)

2. **Set up Monitoring** (optional):
   - Enable Render's built-in monitoring
   - Set up alerts for downtime

3. **Backup Environment Variables**:
   - Export your env vars to a secure location
   - Document all API keys

4. **Update Documentation**:
   - Update API documentation with production URL
   - Update frontend README with backend URL

---

## Support

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Render Community: https://community.render.com

---

## Alternative: Railway Deployment

If you prefer Railway, see `QUICK_DEPLOY.md` for Railway-specific instructions.

