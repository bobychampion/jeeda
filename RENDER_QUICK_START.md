# Render Quick Start Guide

## 🚀 Deploy Your Backend in 5 Minutes

### Step 1: Sign Up
1. Go to https://render.com
2. Sign up (use GitHub for easy connection)

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub → Select **`bobychampion/jeeda`**
3. Configure:
   - **Name:** `jeeda-backend`
   - **Root Directory:** `backend` ⚠️ **IMPORTANT!**
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Step 3: Add Environment Variables
Click **"Environment"** tab and add:

**Required:**
```
FIREBASE_PROJECT_ID=coupleit
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@coupleit.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR_KEY_HERE]\n-----END PRIVATE KEY-----\n"
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://coupleit.web.app
```

**Optional (add as needed):**
```
GEMINI_API_KEY=your_key
HUGGINGFACE_API_KEY=your_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for build to complete (~2-3 minutes)
3. Get your URL: `https://jeeda-backend.onrender.com`

### Step 5: Update Frontend
1. Edit `frontend/src/config/api.js`:
   ```javascript
   export const API_URL = import.meta.env.VITE_API_URL || 
     (isProduction 
       ? 'https://jeeda-backend.onrender.com' // ← Your Render URL
       : 'http://localhost:5000'
     );
   ```

2. Rebuild and redeploy:
   ```bash
   cd frontend
   npm run build
   cd ..
   firebase deploy --only hosting
   ```

### ✅ Done!

Your backend is now live at: `https://jeeda-backend.onrender.com`

---

## 📋 Full Guide
See `RENDER_DEPLOYMENT_GUIDE.md` for detailed instructions, troubleshooting, and advanced configuration.

