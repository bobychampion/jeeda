# Quick Deployment Guide

## ✅ Easiest Option: Frontend (Firebase) + Backend (Railway/Render)

### Step 1: Deploy Frontend to Firebase Hosting

```bash
# Build frontend
cd frontend
npm run build

# Deploy (from project root)
cd ..
firebase deploy --only hosting
```

Your frontend will be live at: `https://coupleit.web.app` (or your Firebase project URL)

### Step 2: Deploy Backend to Railway (Recommended - Free)

1. **Go to https://railway.app** and sign up/login
2. **Create New Project** → "Deploy from GitHub repo" or "Empty Project"
3. **Add Service** → "GitHub Repo" or "Empty"
4. **Configure:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables:**
   - Copy all variables from `backend/.env`
   - Add them in Railway dashboard → Variables tab
6. **Deploy!** Railway will give you a URL like: `https://your-app.railway.app`

### Step 3: Update Frontend API URL

1. **Get your backend URL** from Railway (e.g., `https://your-app.railway.app`)
2. **Update frontend `.env` file:**
```env
VITE_API_URL=https://your-app.railway.app
```
3. **Rebuild and redeploy frontend:**
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

### Step 4: Update CORS in Backend

Update `backend/src/server.js` to allow your Firebase Hosting domain:

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

## Alternative: Backend on Render

Same process as Railway:
1. Go to https://render.com
2. Create new Web Service
3. Connect repo, set root to `backend`
4. Add environment variables
5. Deploy!

---

## Option 2: Everything on Firebase (Cloud Functions)

This requires converting your Express server to Cloud Functions. More complex but keeps everything in Firebase.

See `DEPLOYMENT_GUIDE.md` for detailed Cloud Functions setup.

