# Backend URL Configuration Guide

## Problem
Your frontend is deployed at `https://coupleit.web.app` but it's trying to access `http://localhost:5000`, which causes CORS errors.

## Solution

You have **two options**:

### Option 1: Set Environment Variable Before Building (Recommended)

1. **Create a `.env.production` file** in the `frontend` folder:
```bash
cd frontend
echo "VITE_API_URL=https://your-backend-url.railway.app" > .env.production
```

2. **Replace `https://your-backend-url.railway.app`** with your actual backend URL (from Railway, Render, etc.)

3. **Rebuild and redeploy**:
```bash
npm run build
cd ..
firebase deploy --only hosting
```

### Option 2: Update the Config File Directly

Edit `frontend/src/config/api.js` and replace the placeholder with your backend URL:

```javascript
export const API_URL = import.meta.env.VITE_API_URL || 
  (isProduction 
    ? 'https://your-actual-backend-url.railway.app' // ← Replace this
    : 'http://localhost:5000'
  );
```

Then rebuild and redeploy.

## Quick Fix for Now

If you haven't deployed your backend yet, you can temporarily disable the features that need it, or deploy your backend first.

## Next Steps

1. **Deploy your backend** to Railway, Render, or another service
2. **Get your backend URL** (e.g., `https://jeeda-backend.railway.app`)
3. **Set it in `.env.production`** or update `config/api.js`
4. **Rebuild and redeploy** the frontend

## Testing

After setting the URL, check the browser console. You should see:
```
API Configuration: {
  environment: 'production',
  apiUrl: 'https://your-backend-url.railway.app',
  ...
}
```

