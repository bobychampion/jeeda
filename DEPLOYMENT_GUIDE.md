# Deployment Guide: Firebase Hosting + Backend

## Overview

You have two options for deploying your application:

### Option 1: Frontend (Firebase Hosting) + Backend (Cloud Functions) ✅ Recommended for Firebase
- **Frontend**: Deploy to Firebase Hosting (static files)
- **Backend**: Convert Express server to Cloud Functions (serverless)
- **Pros**: Everything in one place, automatic scaling, Firebase integration
- **Cons**: Requires converting Express routes to Cloud Functions

### Option 2: Frontend (Firebase Hosting) + Backend (Separate Service) ✅ Easier, No Code Changes
- **Frontend**: Deploy to Firebase Hosting
- **Backend**: Deploy to Railway, Render, Heroku, or similar
- **Pros**: No code changes needed, easier setup
- **Cons**: Backend hosted separately

---

## Option 1: Firebase Hosting + Cloud Functions

### Step 1: Install Firebase Tools
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Cloud Functions
```bash
firebase init functions
# Select: JavaScript, ESLint: Yes, Install dependencies: Yes
```

### Step 3: Convert Express Server to Cloud Functions
- Move backend code to `functions/` directory
- Convert Express routes to Cloud Functions
- Update imports and exports

### Step 4: Update firebase.json
```json
{
  "hosting": {
    "public": "frontend/dist",
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "functions"
  }
}
```

### Step 5: Deploy
```bash
firebase deploy
```

---

## Option 2: Firebase Hosting + Separate Backend (EASIER)

### Frontend Deployment (Firebase Hosting)

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Deploy to Firebase Hosting:**
```bash
cd ..
firebase deploy --only hosting
```

3. **Update frontend API URL:**
   - Set `VITE_API_URL` in frontend `.env` to your backend URL
   - Or update `aiService.js` and other services to use production backend URL

### Backend Deployment (Choose one):

#### A. Railway (Recommended - Free tier available)
1. Go to https://railway.app
2. Create new project
3. Connect GitHub repo or deploy from folder
4. Set root directory to `backend`
5. Add environment variables from `.env`
6. Deploy!

#### B. Render (Free tier available)
1. Go to https://render.com
2. Create new Web Service
3. Connect repo or upload code
4. Set root directory to `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables
8. Deploy!

#### C. Heroku
```bash
cd backend
heroku create your-app-name
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set FIREBASE_PRIVATE_KEY="your-key"
heroku config:set FIREBASE_CLIENT_EMAIL=your-email
# ... add all other env vars
git push heroku main
```

---

## Recommended: Option 2 (Separate Backend)

This is the **easiest** approach with **no code changes**:

1. **Deploy Frontend to Firebase Hosting** (already configured)
2. **Deploy Backend to Railway/Render** (5 minutes setup)
3. **Update frontend `.env`** with backend URL

Let me help you set this up!

