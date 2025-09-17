// Constants shared across microservices

export const constants = {
  // API Configuration
  API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  FIREBASE_CONFIG: {
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
  },

  // UI Constants
  DEBOUNCE_DELAY: 300,
  DEFAULT_PAGE_SIZE: 20,
  MAX_FILE_SIZE_MB: 10,
  ANIMATION_DURATION: 200,

  // Theme Constants
  THEME_STORAGE_KEY: 'cvplus-theme',
  I18N_STORAGE_KEY: 'cvplus-i18n',
  NAVIGATION_STORAGE_KEY: 'cvplus-navigation',

  // Breakpoints (matching Tailwind CSS)
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  } as const,

  // Z-index layers
  Z_INDEX: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070
  } as const,

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  } as const,

  // Premium Tiers
  PREMIUM_TIERS: {
    FREE: 'free',
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise'
  } as const,

  // User Roles
  USER_ROLES: {
    USER: 'user',
    PREMIUM: 'premium',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  } as const,

  // Permissions
  PERMISSIONS: {
    // CV Processing
    CV_CREATE: 'cv:create',
    CV_READ: 'cv:read',
    CV_UPDATE: 'cv:update',
    CV_DELETE: 'cv:delete',
    CV_ANALYZE: 'cv:analyze',

    // Premium Features
    PREMIUM_FEATURES: 'premium:features',
    PREMIUM_BILLING: 'premium:billing',

    // Admin
    ADMIN_USERS: 'admin:users',
    ADMIN_SYSTEM: 'admin:system',
    ADMIN_ANALYTICS: 'admin:analytics',

    // Multimedia
    MULTIMEDIA_CREATE: 'multimedia:create',
    MULTIMEDIA_PROCESS: 'multimedia:process',

    // Public Profiles
    PROFILE_CREATE: 'profile:create',
    PROFILE_SHARE: 'profile:share'
  } as const,

  // File Types
  SUPPORTED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ] as const,

  SUPPORTED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ] as const,

  SUPPORTED_VIDEO_TYPES: [
    'video/mp4',
    'video/webm',
    'video/ogg'
  ] as const,

  SUPPORTED_AUDIO_TYPES: [
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a'
  ] as const,

  // Date Formats
  DATE_FORMATS: {
    ISO: 'YYYY-MM-DD',
    US: 'MM/DD/YYYY',
    EU: 'DD/MM/YYYY',
    LONG: 'MMMM D, YYYY',
    SHORT: 'MMM D',
    TIME: 'HH:mm',
    DATETIME: 'YYYY-MM-DD HH:mm:ss'
  } as const,

  // Regex Patterns
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9]?[\s.-]?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  } as const,

  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Something went wrong. Please try again later.',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
    INVALID_FILE_TYPE: 'Invalid file type.',
    REQUIRED_FIELD: 'This field is required.'
  } as const,

  // Success Messages
  SUCCESS_MESSAGES: {
    SAVED: 'Changes saved successfully.',
    CREATED: 'Created successfully.',
    UPDATED: 'Updated successfully.',
    DELETED: 'Deleted successfully.',
    UPLOADED: 'File uploaded successfully.',
    EMAIL_SENT: 'Email sent successfully.'
  } as const
};