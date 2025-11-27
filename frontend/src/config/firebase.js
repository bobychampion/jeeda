import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCt3dkHuTPBE2FH5nbF-vNHzTZ4knvdvso',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'coupleit.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'coupleit',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'coupleit.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '932705370730',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:932705370730:web:7f6d871f23085bc5c24013',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-S194GS50DL',
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback initialization
  app = initializeApp(firebaseConfig);
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
