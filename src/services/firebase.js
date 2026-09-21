// ============================================================
// MENZO FIREBASE CLIENT INITIALIZATION
// ============================================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || ''
};

// Check if valid Firebase configuration is present
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'your_project_id'
  );
};

// Initialize Firebase App
let app;
let auth;
let db;

try {
  if (!getApps().length) {
    // If not configured, use placeholder config so module loading does not crash
    app = initializeApp(
      isFirebaseConfigured()
        ? firebaseConfig
        : {
            apiKey: 'AIzaSyDemoPlaceholderKeyForInitializationOnly',
            authDomain: 'menzo-demo.firebaseapp.com',
            projectId: 'menzo-demo',
            storageBucket: 'menzo-demo.appspot.com',
            messagingSenderId: '1234567890',
            appId: '1:1234567890:web:abcdef123456'
          }
    );
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
}

// Google Auth Provider configured with standard scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, db };
export default app;
