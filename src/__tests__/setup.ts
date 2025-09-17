// Test Setup - Global test configuration and mocks
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn((date) => ({ toDate: () => date }))
  }
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn()
}));

// Mock IndexedDB
const mockIDBDatabase = {
  createObjectStore: jest.fn(),
  transaction: jest.fn(),
  close: jest.fn(),
  objectStoreNames: { contains: jest.fn(() => false) }
};

const mockIDBTransaction = {
  objectStore: jest.fn(),
  oncomplete: null,
  onerror: null,
  abort: jest.fn()
};

const mockIDBObjectStore = {
  get: jest.fn(),
  put: jest.fn(),
  add: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  createIndex: jest.fn(),
  openCursor: jest.fn()
};

const mockIDBRequest = {
  onsuccess: null,
  onerror: null,
  result: null,
  readyState: 'done'
};

global.indexedDB = {
  open: jest.fn().mockImplementation(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      request.result = mockIDBDatabase;
      if (request.onsuccess) request.onsuccess();
    }, 0);
    return request;
  }),
  deleteDatabase: jest.fn(),
  cmp: jest.fn()
} as any;

// Mock window.crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
    getRandomValues: jest.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    })
  }
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    ...global.navigator,
    onLine: true,
    serviceWorker: {
      register: jest.fn().mockResolvedValue({
        installing: null,
        waiting: null,
        active: { postMessage: jest.fn() },
        addEventListener: jest.fn(),
        unregister: jest.fn()
      })
    },
    storage: {
      estimate: jest.fn().mockResolvedValue({
        usage: 1024 * 1024 * 10, // 10MB
        quota: 1024 * 1024 * 100  // 100MB
      })
    }
  },
  writable: true
});

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    ...global.performance,
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => [])
  }
});

// Mock BroadcastChannel
global.BroadcastChannel = class BroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;

  constructor(name: string) {
    this.name = name;
  }

  postMessage(message: any): void {
    // Mock implementation
  }

  close(): void {
    // Mock implementation
  }

  addEventListener(type: string, listener: EventListener): void {
    // Mock implementation
  }

  removeEventListener(type: string, listener: EventListener): void {
    // Mock implementation
  }

  dispatchEvent(event: Event): boolean {
    return true;
  }
};

// Mock WebSocket
global.WebSocket = class WebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState: number = WebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen(new Event('open'));
    }, 0);
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    // Mock implementation
  }

  close(code?: number, reason?: string): void {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }));
    }
  }

  addEventListener(type: string, listener: EventListener): void {
    // Mock implementation
  }

  removeEventListener(type: string, listener: EventListener): void {
    // Mock implementation
  }

  dispatchEvent(event: Event): boolean {
    return true;
  }
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob())
  })
) as jest.Mock;

// Suppress console errors in tests unless explicitly needed
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || 
     args[0].includes('React does not recognize') ||
     args[0].includes('validateDOMNesting'))
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

// Global test utilities
export const mockSessionData = {
  sessionId: 'test-session-123',
  currentStep: 'analysis',
  completedSteps: ['upload', 'processing'],
  createdAt: new Date('2024-01-01'),
  lastActiveAt: new Date()
};

export const mockFormSchema = {
  id: 'test-form',
  version: '1.0',
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
      defaultValue: '',
      validation: []
    }
  ],
  sections: [
    {
      id: 'basic-info',
      title: 'Basic Information',
      fields: ['name'],
      defaultExpanded: true
    }
  ]
};

export const createMockEnhancedSession = (overrides = {}) => ({
  ...mockSessionData,
  stepProgress: {},
  featureStates: {},
  processingCheckpoints: [],
  uiState: {
    currentView: 'analysis',
    activeFormId: null,
    formStates: {},
    navigationHistory: [],
    scrollPositions: {},
    expandedSections: []
  },
  validationResults: {
    globalValidations: [],
    stepValidations: {}
  },
  performanceMetrics: {
    initialLoadTime: 1000,
    renderTime: 100,
    memoryUsage: 10000000,
    networkRequests: 5,
    cacheHitRate: 0.8,
    interactionCount: 10,
    errorCount: 0
  },
  contextData: {
    userAgent: 'test-agent',
    viewport: { width: 1920, height: 1080 },
    referrer: '',
    timezone: 'UTC',
    language: 'en',
    environment: 'test'
  },
  schemaVersion: '2.0',
  actionQueue: [],
  offlineCapability: {
    enabled: false,
    lastSyncAt: new Date(),
    pendingActions: 0,
    storageUsed: 0,
    maxStorageSize: 50 * 1024 * 1024
  },
  ...overrides
});

// Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});