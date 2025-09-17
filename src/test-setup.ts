import { expect, beforeAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Mock Firebase Analytics to prevent IndexedDB errors in tests
vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
  logEvent: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(false)) // Always return false in test environment
}));

// Mock Firebase functions that might cause issues in test environment
vi.mock('firebase/app', async () => {
  const actual = await vi.importActual('firebase/app');
  return {
    ...actual,
    initializeApp: vi.fn(() => ({})),
  };
});

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(() => Promise.resolve())
  })),
  signInWithPopup: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid', email: 'test@test.com' } })),
  GoogleAuthProvider: vi.fn(() => ({})),
  connectAuthEmulator: vi.fn()
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  connectFirestoreEmulator: vi.fn()
}));

// Mock Firebase Functions
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(() => vi.fn(() => Promise.resolve({ data: {} }))),
  connectFunctionsEmulator: vi.fn()
}));

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  connectStorageEmulator: vi.fn()
}));

// Global mocks for browser APIs that might not be available in test environment
Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: undefined
});

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  }
});

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(), 
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  }
});

// Mock fetch API for test environment
Object.defineProperty(global, 'fetch', {
  writable: true,
  value: vi.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      status: 200,
      statusText: 'OK'
    })
  )
});

// Mock navigator APIs
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

// Mock performance API for memory testing
Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    ...global.performance,
    memory: {
      usedJSHeapSize: 10000000,
      totalJSHeapSize: 50000000,
      jsHeapSizeLimit: 100000000
    },
    now: vi.fn(() => Date.now())
  }
});

// Mock window history API
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    length: 1,
    state: null
  }
});

// Mock window location
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'http://localhost:3000/',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'http://localhost:3000',
    hostname: 'localhost',
    port: '3000',
    protocol: 'http:',
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn()
  }
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }
}));

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});