/**
 * Firebase Configuration for CVPlus Shell
 *
 * Centralized Firebase configuration shared across all submodules.
 * Supports both production and emulator environments.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
const USE_EMULATORS = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

if (USE_EMULATORS && import.meta.env.DEV) {
  try {
    // Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

    // Firestore emulator
    connectFirestoreEmulator(firestore, 'localhost', 8080);

    // Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);

    // Functions emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);

    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.warn('⚠️ Error connecting to Firebase emulators:', error);
  }
}

// Export default app for convenience
export default app;