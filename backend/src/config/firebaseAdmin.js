import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
// Note: For production, use service account key file
// For now, we'll use the project ID and initialize with default credentials
// You'll need to set GOOGLE_APPLICATION_CREDENTIALS or use a service account

let adminApp;
let isInitialized = false;
let initializationError = null;

try {
  if (admin.apps.length === 0) {
    // Initialize with project ID (requires GOOGLE_APPLICATION_CREDENTIALS env var)
    // Or use service account if provided
    if (process.env.FIREBASE_PRIVATE_KEY) {
      try {
        adminApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        isInitialized = true;
        console.log('✅ Firebase Admin initialized successfully with service account');
      } catch (certError) {
        console.error('❌ Firebase Admin certificate error:', certError.message);
        initializationError = certError;
        // Don't create a fallback app - it won't work anyway
        throw certError;
      }
    } else {
      console.warn('⚠️ FIREBASE_PRIVATE_KEY not found. Attempting default initialization...');
      // Use default credentials (requires GOOGLE_APPLICATION_CREDENTIALS)
      adminApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'coupleit',
      });
      isInitialized = true;
      console.log('✅ Firebase Admin initialized with default credentials');
    }
  } else {
    adminApp = admin.app();
    isInitialized = true;
    console.log('✅ Using existing Firebase Admin app');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
  initializationError = error;
  // Don't create a fallback app - it will fail anyway
  // Instead, export null/undefined so we can check for it
  adminApp = null;
}

// Export db and auth, but they may be null if initialization failed
export const db = adminApp ? admin.firestore() : null;
export const auth = adminApp ? admin.auth() : null;
export const isFirebaseInitialized = () => isInitialized && adminApp !== null;
export const getInitializationError = () => initializationError;

export default adminApp;

