// @ts-ignore
/**
 * CV Processing Frontend Module
 * Autonomous frontend package for CV processing functionality
 * Zero external @cvplus/*  dependencies - fully self-contained
  */
  */

// Core components
export * from './components';

// Services
export * from './services';

// Integration
export * from './integration/ParentIntegrationService';

// Hooks
export * from './hooks';

// Types
export * from '../types/analysis';
export * from './types';

// Constants
export * from './constants';

// Utils
export * from './utils/upload-helpers';
export * from '../types/job';

// Service setup and registration
import { setupServices } from './setup/serviceSetup';

/**
 * Initialize the CV Processing frontend module
  */
export const initializeCVProcessingFrontend = async (config?: any) => {
  try {
    // Setup autonomous services
    await setupServices(config);
    
    console.log('[CVProcessing] Frontend module initialized successfully');
    
    return {
      success: true,
      message: 'CV Processing frontend module ready'
    };
  } catch (error) {
    console.error('[CVProcessing] Failed to initialize frontend module:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown initialization error'
    };
  }
};

// Auto-initialize if running standalone
if (typeof window !== 'undefined' && (!window.parent || window.parent === window)) {
  // Running standalone - auto-initialize
  initializeCVProcessingFrontend().then(result => {
    if (result.success) {
      console.log('[CVProcessing] Standalone mode initialized');
    } else {
      console.error('[CVProcessing] Standalone initialization failed:', result.error);
    }
  });
}

// Version info for debugging
export const CV_PROCESSING_VERSION = '1.0.0';
export const BUILD_INFO = {
  version: CV_PROCESSING_VERSION,
  buildDate: new Date().toISOString(),
  autonomous: true
};