import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
// Note: For production, use service account key file
// For now, we'll use the project ID and initialize with default credentials
// You'll need to set GOOGLE_APPLICATION_CREDENTIALS or use a service account

let adminApp;

try {
  if (admin.apps.length === 0) {
    // Initialize with project ID (requires GOOGLE_APPLICATION_CREDENTIALS env var)
    // Or use service account if provided
    if (process.env.FIREBASE_PRIVATE_KEY) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      // Use default credentials (requires GOOGLE_APPLICATION_CREDENTIALS)
      adminApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'coupleit',
      });
    }
  } else {
    adminApp = admin.app();
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  // Fallback initialization
  adminApp = admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'coupleit',
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export default adminApp;

