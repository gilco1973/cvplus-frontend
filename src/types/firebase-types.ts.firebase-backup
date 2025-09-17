// Firebase-specific types for CVPlus
// Provides type safety for Firebase operations

import { 
  DocumentData, 
  QuerySnapshot, 
  DocumentSnapshot,
  FirestoreError 
} from 'firebase/firestore';

// Firebase document wrapper
export interface FirebaseDocument<T = DocumentData> {
  id: string;
  data: T;
  exists: boolean;
  ref?: any;
}

// Firebase query result wrapper
export interface FirebaseQueryResult<T = DocumentData> {
  docs: FirebaseDocument<T>[];
  empty: boolean;
  size: number;
}

// Firebase operation result
export interface FirebaseOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: FirestoreError;
}

// Type-safe document converter
export function convertFirebaseDoc<T>(doc: DocumentSnapshot): FirebaseDocument<T> {
  return {
    id: doc.id,
    data: doc.data() as T,
    exists: doc.exists(),
    ref: doc.ref
  };
}

// Type-safe query converter
export function convertFirebaseQuery<T>(snapshot: QuerySnapshot): FirebaseQueryResult<T> {
  return {
    docs: snapshot.docs.map(doc => convertFirebaseDoc<T>(doc)),
    empty: snapshot.empty,
    size: snapshot.size
  };
}

// Firebase collection paths
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  SESSIONS: 'sessions',
  CV_DATA: 'cvData',
  RECOMMENDATIONS: 'recommendations',
  FEATURES: 'features',
  ANALYTICS: 'analytics'
} as const;

// Firebase error handling
export function isFirebaseError(error: unknown): error is FirestoreError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as any).code === 'string'
  );
}

// Session document structure
export interface SessionDocument {
  id: string;
  userId?: string;
  cvData?: any;
  progress?: any;
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
  status: 'active' | 'completed' | 'error';
}

// CV Data document structure
export interface CVDataDocument {
  id: string;
  sessionId: string;
  parsedData?: any;
  originalFile?: any;
  enhancedData?: any;
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
}

// User document structure
export interface UserDocument {
  id: string;
  email?: string;
  displayName?: string;
  sessions: string[];
  preferences?: any;
  createdAt: any; // Firebase Timestamp
  lastLogin?: any; // Firebase Timestamp
}