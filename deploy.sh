#!/bin/bash

echo "🚀 Deploying Replique Crafts to Firebase..."
echo ""

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Check if user is logged in
if ! npx firebase-tools projects:list &>/dev/null; then
  echo "⚠️  You need to login to Firebase first."
  echo "   Run: npx firebase-tools login"
  echo "   Then run this script again."
  exit 1
fi

# Deploy
echo "🔥 Deploying to Firebase..."
npx firebase-tools deploy --only hosting

echo ""
echo "✅ Deployment complete!"

