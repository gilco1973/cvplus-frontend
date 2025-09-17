
// Optimized Firebase Configuration
// Only imports what's actually needed to reduce bundle size

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase - check if app already exists to prevent duplicate initialization
let app;
try {
  // Check if Firebase app already exists
  const existingApps = getApps();
  if (existingApps.length === 0) {
    // No app exists, safe to initialize
    app = initializeApp(firebaseConfig);
    console.warn('[Firebase] App initialized successfully');
  } else {
    // App already exists, use the existing one
    app = getApp();
    console.warn('[Firebase] Using existing app instance');
  }
} catch (error) {
  console.error('[Firebase] Error during app initialization:', error);
  // Fallback: try to get existing app or throw error
  try {
    app = getApp();
  } catch (fallbackError) {
    throw new Error(`Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Initialize services with lazy loading
let auth: ReturnType<typeof getAuth> | null = null;
let firestore: ReturnType<typeof getFirestore> | null = null;
let functions: ReturnType<typeof getFunctions> | null = null;

// Track emulator connections to prevent duplicate connections during HMR
const emulatorConnections = {
  auth: false,
  firestore: false,
  functions: false,
};

export const getAuthInstance = () => {
  if (!auth) {
    auth = getAuth(app);
    
    // Connect to emulator in development - only once
    if (import.meta.env.DEV && !emulatorConnections.auth) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        emulatorConnections.auth = true;
        console.warn('[Firebase] Connected to Auth emulator on localhost:9099');
      } catch (error) {
        // Emulator might already be connected
        if (error instanceof Error && !error.message.includes('already')) {
          console.warn('[Firebase] Failed to connect to Auth emulator:', error.message);
        }
        emulatorConnections.auth = true; // Mark as attempted to prevent retries
      }
    }
  }
  return auth;
};

export const getFirestoreInstance = () => {
  if (!firestore) {
    firestore = getFirestore(app);
    
    // Connect to emulator in development - only once
    if (import.meta.env.DEV && !emulatorConnections.firestore) {
      try {
        connectFirestoreEmulator(firestore, 'localhost', 8090);
        emulatorConnections.firestore = true;
        console.warn('[Firebase] Connected to Firestore emulator on localhost:8090');
      } catch (error) {
        // Emulator might already be connected
        if (error instanceof Error && !error.message.includes('already')) {
          console.warn('[Firebase] Failed to connect to Firestore emulator:', error.message);
        }
        emulatorConnections.firestore = true; // Mark as attempted to prevent retries
      }
    }
  }
  return firestore;
};

export const getFunctionsInstance = () => {
  if (!functions) {
    functions = getFunctions(app);
    
    // Connect to emulator in development - only once
    if (import.meta.env.DEV && !emulatorConnections.functions) {
      try {
        connectFunctionsEmulator(functions, 'localhost', 5001);
        emulatorConnections.functions = true;
        console.warn('[Firebase] Connected to Functions emulator on localhost:5001');
      } catch (error) {
        // Emulator might already be connected
        if (error instanceof Error && !error.message.includes('already')) {
          console.warn('[Firebase] Failed to connect to Functions emulator:', error.message);
        }
        emulatorConnections.functions = true; // Mark as attempted to prevent retries
      }
    }
  }
  return functions;
};

export { app };
export default app;
