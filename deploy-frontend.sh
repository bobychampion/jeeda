#!/bin/bash
# Script to deploy frontend to Firebase Hosting

echo "🚀 Deploying Frontend to Firebase Hosting..."

# Navigate to frontend directory
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "❌ Build failed! dist directory not found."
  exit 1
fi

# Go back to root
cd ..

# Deploy to Firebase Hosting
echo "☁️  Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Frontend deployed successfully!"
echo "🌐 Your app should be live at: https://coupleit.web.app (or your Firebase project URL)"

