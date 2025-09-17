/**
 * Development Mode Utilities
 * Handles detection of development environment and development-specific features
 */

/**
 * Checks if the application is running in development mode
 */
export const isDevelopmentMode = (): boolean => {
  // Check for development environment indicators
  return import.meta.env.DEV || 
         import.meta.env.MODE === 'development' ||
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1' ||
         window.location.port === '3000' ||
         window.location.port === '5173'; // Vite default port
};

/**
 * Checks if Firebase emulators are likely being used
 */
export const isUsingFirebaseEmulators = (): boolean => {
  return isDevelopmentMode() && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
};

/**
 * Gets development mode indicators for debugging
 */
export const getDevelopmentInfo = () => {
  return {
    isDev: isDevelopmentMode(),
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    hostname: window.location.hostname,
    port: window.location.port,
    usingEmulators: isUsingFirebaseEmulators()
  };
};

/**
 * Development mode feature flags
 */
export const DEVELOPMENT_FEATURES = {
  SKIP_CV_UPLOAD: isDevelopmentMode(),
  SHOW_DEBUG_INFO: isDevelopmentMode(),
  ENABLE_DEV_TOOLS: isDevelopmentMode()
} as const;