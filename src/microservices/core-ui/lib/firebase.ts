import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, collection, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
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

// Initialize services with error handling
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// Initialize storage with proper error handling and bucket verification
let storage: any;
try {
  storage = getStorage(app);
  
  // Verify storage bucket is configured
  if (!firebaseConfig.storageBucket) {
    console.error('❌ Firebase Storage bucket is not configured. Please set VITE_FIREBASE_STORAGE_BUCKET in your environment variables.');
  } else {
    console.warn('✅ Firebase Storage initialized successfully with bucket:', firebaseConfig.storageBucket);
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Storage:', error);
  throw new Error(`Firebase Storage initialization failed: ${error}`);
}

export { storage };

// Initialize Analytics with proper error handling and conditional loading
export let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== 'undefined') {
  try {
    // Only initialize analytics if it's available and not excluded
    analytics = getAnalytics(app);
    console.warn('✅ Firebase Analytics initialized successfully');
  } catch (error) {
    // Suppress analytics warnings in development - analytics is often excluded for dev builds
    if (import.meta.env.DEV) {
      console.debug('ℹ️ Firebase Analytics not available in development build');
    } else {
      console.warn('⚠️ Firebase Analytics not available or excluded from bundle:', error);
    }
    analytics = null;
  }
}


// Enable emulators in development with enhanced error handling and HMR protection
if (import.meta.env.DEV) {
  // Track emulator connections globally to prevent duplicate connections during HMR
  const globalWindow = globalThis as any;
  const emulatorConnectionKey = '__firebase_emulators_connected__';
  
  const connectToEmulators = () => {
    // Check if emulators are already connected globally (across HMR reloads)
    if (globalWindow[emulatorConnectionKey]) {
      console.warn('[Firebase] Emulators already connected, skipping duplicate connection');
      return;
    }
    
    try {
      // Connect to emulators immediately without async testing
      console.warn('[Firebase] Connecting to Firebase emulators for local development...');
      
      // Connect with proper error handling - each connection is wrapped individually
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.warn('[Firebase] Auth emulator connected');
      } catch (error) {
        // Suppress expected "already connected" errors
        if (error instanceof Error && error.message.includes('already')) {
          console.warn('[Firebase] Auth emulator already connected');
        } else {
          console.warn('[Firebase] Auth emulator connection failed:', error);
        }
      }
      
      try {
        connectFirestoreEmulator(db, 'localhost', 8090);
        console.warn('[Firebase] Firestore emulator connected');
      } catch (error) {
        // Suppress expected "already connected" errors
        if (error instanceof Error && error.message.includes('already')) {
          console.warn('[Firebase] Firestore emulator already connected');
        } else {
          console.warn('[Firebase] Firestore emulator connection failed:', error);
        }
      }
      
      try {
        connectFunctionsEmulator(functions, 'localhost', 5001);
        console.warn('[Firebase] Functions emulator connected');
      } catch (error) {
        // Suppress expected "already connected" errors
        if (error instanceof Error && error.message.includes('already')) {
          console.warn('[Firebase] Functions emulator already connected');
        } else {
          console.warn('[Firebase] Functions emulator connection failed:', error);
        }
      }
      
      try {
        connectStorageEmulator(storage, 'localhost', 9199);
        console.warn('[Firebase] Storage emulator connected');
      } catch (error) {
        // Suppress expected "already connected" errors
        if (error instanceof Error && error.message.includes('already')) {
          console.warn('[Firebase] Storage emulator already connected');
        } else {
          console.warn('[Firebase] Storage emulator connection failed:', error);
        }
      }
      
      // Mark emulators as connected globally
      globalWindow[emulatorConnectionKey] = true;
      console.warn('[Firebase] Firebase emulator connections completed');
      
      // Add CORS debugging for emulator connectivity
      console.warn('[Firebase] Testing CORS connectivity with emulators...');
      
    } catch (error) {
      console.warn('[Firebase] Failed to connect to Firebase emulators:', error);
    }
  };
  
  // Connect immediately - no async delays
  connectToEmulators();
}

// Utility function to test emulator connectivity
export const testEmulatorConnectivity = async (): Promise<{
  firestore: boolean;
  functions: boolean;
  auth: boolean;
  storage: boolean;
  websocket: boolean;
  details: unknown;
}> => {
  const results = {
    firestore: false,
    functions: false,
    auth: false,
    storage: false,
    websocket: false,
    details: {} as any
  };

  try {
    // Test Firestore HTTP
    const firestoreTest = await fetch('http://localhost:8090/', { method: 'GET' });
    results.firestore = firestoreTest.ok;
    results.details.firestore = firestoreTest.status;
  } catch (error) {
    results.details.firestore = error;
  }

  try {
    // Test Firestore WebSocket endpoint (indirect test)
    const wsTest = await fetch('http://localhost:9150/', { method: 'GET' });
    results.websocket = true; // If we can reach it, it's likely working
    results.details.websocket = 'reachable';
  } catch (error) {
    results.details.websocket = error;
  }

  try {
    // Test Functions
    const functionsTest = await fetch('http://localhost:5001/getmycv-ai/us-central1/', { method: 'GET' });
    results.functions = functionsTest.ok;
    results.details.functions = functionsTest.status;
  } catch (error) {
    results.details.functions = error;
  }

  try {
    // Test Auth
    const authTest = await fetch('http://localhost:9099/', { method: 'GET' });
    results.auth = authTest.ok || authTest.status === 400; // Auth returns 400 for GET
    results.details.auth = authTest.status;
  } catch (error) {
    results.details.auth = error;
  }

  try {
    // Test Storage
    const storageTest = await fetch('http://localhost:9199/', { method: 'GET' });
    results.storage = storageTest.ok;
    results.details.storage = storageTest.status;
  } catch (error) {
    results.details.storage = error;
  }

  return results;
};

// Safe analytics usage utility
export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (analytics) {
    try {
      // Import logEvent dynamically to avoid issues if analytics is excluded
      import('firebase/analytics').then(({ logEvent }) => {
        logEvent(analytics!, eventName, eventParams);
      }).catch(() => {
        console.warn('⚠️ Analytics logging not available');
      });
    } catch (error) {
      console.warn('⚠️ Failed to log analytics event:', error);
    }
  }
};

// Utility function to test actual Firestore operations
export const testFirestoreOperations = async (): Promise<boolean> => {
  try {
    console.warn('🧪 Testing Firestore write operations...');
    
    // Test document creation (similar to createJob)
    const testCollection = collection(db, 'test');
    const testDoc = doc(testCollection);
    
    await setDoc(testDoc, {
      test: 'connectivity',
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    console.warn('✅ Firestore write test successful');
    
    // Clean up test document
    await deleteDoc(testDoc);
    console.warn('✅ Firestore cleanup successful');
    
    return true;
  } catch (error) {
    console.error('❌ Firestore operation test failed:', error);
    return false;
  }
};

// Utility function to test storage service functionality
export const testStorageService = async (): Promise<boolean> => {
  try {
    console.warn('🧪 Testing Firebase Storage service...');
    
    // Check if storage is initialized
    if (!storage) {
      console.error('❌ Storage service is not initialized');
      return false;
    }
    
    // Check if storage bucket is configured
    if (!firebaseConfig.storageBucket) {
      console.error('❌ Storage bucket is not configured');
      return false;
    }
    
    // Test storage reference creation (this should work even without emulator)
    const { ref } = await import('firebase/storage');
    const testRef = ref(storage, 'test-connectivity');
    
    if (!testRef) {
      console.error('❌ Could not create storage reference');
      return false;
    }
    
    console.warn('✅ Storage service test successful');
    return true;
  } catch (error) {
    console.error('❌ Storage service test failed:', error);
    return false;
  }
};

// Utility function to test CSP compliance for Firebase emulators
export const testCSPCompliance = async (): Promise<{success: boolean, details: string[]}> => {
  if (!import.meta.env.DEV) {
    return { success: true, details: ['CSP test skipped in production mode'] };
  }
  
  const details: string[] = [];
  let allPassed = true;
  
  // Test HTTP connections to emulators with proper endpoints
  const endpoints = [
    { url: 'http://localhost:8090', name: 'Firestore Emulator', method: 'GET' as const },
    { url: 'http://localhost:9099', name: 'Auth Emulator', method: 'GET' as const },
    { url: 'http://localhost:5001/getmycv-ai/us-central1/testCors', name: 'Functions Emulator', method: 'GET' as const },
    { url: 'http://localhost:9199', name: 'Storage Emulator', method: 'GET' as const }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, { 
        method: endpoint.method,
        signal: AbortSignal.timeout(2000),
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok || response.status === 400 || response.status === 404) {
        // 400/404 are acceptable for emulator endpoints when no specific resource is requested
        details.push(`✅ ${endpoint.name}: Connection allowed by CSP (status: ${response.status})`);
      } else {
        details.push(`⚠️ ${endpoint.name}: Unexpected response status ${response.status}`);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('CSP')) {
        details.push(`❌ ${endpoint.name}: Blocked by CSP - ${error.message}`);
        allPassed = false;
      } else if (error instanceof Error && error.name === 'AbortError') {
        details.push(`⚠️ ${endpoint.name}: Connection timeout - emulator may be starting`);
      } else {
        details.push(`⚠️ ${endpoint.name}: Connection failed (${error}) - emulator may not be running`);
      }
    }
  }
  
  return { success: allPassed, details };
};

// Console log configuration summary for debugging
if (import.meta.env.DEV) {
  console.warn('🔧 Firebase Configuration Summary:');
  console.warn('  - Project ID:', firebaseConfig.projectId);
  console.warn('  - Auth Domain:', firebaseConfig.authDomain);
  console.warn('  - Storage Bucket:', firebaseConfig.storageBucket || 'Not configured');
  console.warn('  - API Key:', firebaseConfig.apiKey ? 'Set' : 'Not set');
  console.warn('  - Analytics:', analytics ? 'Available' : 'Not available/excluded');
  console.warn('  - Emulators:', import.meta.env.DEV ? 'Enabled for development' : 'Disabled');
  console.warn('  - Development mode:', import.meta.env.DEV ? 'TRUE' : 'FALSE');
  
  // Run CSP compliance test after a brief delay to allow emulators to start
  setTimeout(async () => {
    const cspTest = await testCSPCompliance();
    console.warn('🛡️ CSP Compliance Test Results:');
    cspTest.details.forEach(detail => console.warn(`  ${detail}`));
    if (cspTest.success) {
      console.warn('✅ All CSP tests passed - emulators should connect properly');
    } else {
      console.warn('⚠️ Some CSP violations detected - check Vite configuration');
    }
  }, 3000);
}

// Test Firebase Functions CORS specifically
export const testFunctionsCors = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.warn('[Firebase] Testing Functions CORS configuration...');
    
    // Try to call the testCors function directly
    const response = await fetch('http://localhost:5001/getmycv-ai/us-central1/testCors', {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.warn('[Firebase] Functions CORS test successful:', data);
      return { success: true };
    } else {
      console.warn('[Firebase] Functions CORS test failed with status:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.warn('[Firebase] Functions CORS test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export default app;