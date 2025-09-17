// CVPlus Navigation Test Suite Configuration
// This file configures the comprehensive navigation testing environment

import { defineConfig } from 'vitest/config';

// Test environment configuration
export const navigationTestConfig = {
  // Test timeouts and performance thresholds
  performance: {
    maxRenderTime: 2000, // Max time for component rendering (ms)
    maxNavigationTime: 5000, // Max time for navigation operations (ms)
    maxNetworkTimeout: 10000, // Max time for network operations (ms)
    memoryLeakThreshold: 10 * 1024 * 1024, // 10MB memory growth threshold
    maxConcurrentOperations: 20 // Max concurrent operations to test
  },
  
  // Network simulation settings
  network: {
    slowConnectionDelay: 2000, // Delay for slow network simulation (ms)
    intermittentFailureRate: 0.3, // 30% failure rate for intermittent issues
    offlineSimulationDuration: 5000, // Duration of offline simulation (ms)
    retryAttempts: 3, // Max retry attempts for network operations
    backoffMultiplier: 1.5 // Exponential backoff multiplier
  },
  
  // User permission levels for testing
  userPermissions: {
    guest: {
      canAccessPremiumFeatures: false,
      canSkipSteps: false,
      canAccessAdvancedSettings: false,
      maxSessionsAllowed: 1
    },
    basic: {
      canAccessPremiumFeatures: false,
      canSkipSteps: false,
      canAccessAdvancedSettings: false,
      maxSessionsAllowed: 3
    },
    premium: {
      canAccessPremiumFeatures: true,
      canSkipSteps: false,
      canAccessAdvancedSettings: true,
      maxSessionsAllowed: 10
    },
    admin: {
      canAccessPremiumFeatures: true,
      canSkipSteps: true,
      canAccessAdvancedSettings: true,
      maxSessionsAllowed: Infinity
    }
  },
  
  // Test data generation settings
  testData: {
    maxNavigationHistory: 10000, // Max navigation history entries
    maxConcurrentSessions: 5, // Max concurrent sessions for testing
    sessionTimeoutDays: 7, // Session timeout in days
    validationErrorVariations: 10, // Number of validation error scenarios
    corruptedDataScenarios: 8 // Number of data corruption scenarios
  },
  
  // Validation rules for navigation testing
  validation: {
    stepPrerequisites: {
      upload: [],
      processing: ['upload'],
      analysis: ['upload', 'processing'],
      features: ['analysis'],
      templates: ['analysis'],
      preview: ['analysis', 'features', 'templates'],
      results: ['preview'],
      keywords: ['analysis'],
      completed: ['results']
    },
    
    requiredSteps: ['upload', 'processing', 'analysis'],
    
    optionalSteps: ['features', 'templates', 'keywords'],
    
    premiumRequiredSteps: ['premium-features', 'advanced-analytics']
  },
  
  // Error scenarios for robustness testing
  errorScenarios: {
    networkErrors: [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'CONNECTION_REFUSED',
      'DNS_ERROR',
      'SSL_ERROR'
    ],
    
    sessionErrors: [
      'SESSION_NOT_FOUND',
      'SESSION_EXPIRED',
      'SESSION_CORRUPTED',
      'PERMISSION_DENIED',
      'VALIDATION_ERROR'
    ],
    
    navigationErrors: [
      'INVALID_STEP',
      'MISSING_PREREQUISITES',
      'BLOCKED_PATH',
      'MALFORMED_URL',
      'STATE_CORRUPTION'
    ]
  },
  
  // Device and browser testing configurations
  deviceConfigurations: [
    { name: 'mobile-small', width: 320, height: 568 },
    { name: 'mobile-large', width: 414, height: 896 },
    { name: 'tablet-portrait', width: 768, height: 1024 },
    { name: 'tablet-landscape', width: 1024, height: 768 },
    { name: 'desktop-small', width: 1280, height: 720 },
    { name: 'desktop-large', width: 1920, height: 1080 },
    { name: 'ultra-wide', width: 2560, height: 1080 }
  ],
  
  // Load testing configuration
  loadTesting: {
    cpuIntensiveOperationDuration: 500, // ms
    memoryPressureSize: 50, // MB
    concurrentUserCount: 20,
    rapidClickCount: 10,
    rapidClickInterval: 10 // ms between clicks
  },
  
  // Accessibility testing requirements
  accessibility: {
    requiredAriaLabels: [
      'navigation',
      'breadcrumb',
      'button',
      'link',
      'form',
      'input'
    ],
    
    keyboardNavigationPaths: [
      'Tab',
      'Shift+Tab',
      'Enter',
      'Space',
      'Escape',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ],
    
    screenReaderRequirements: [
      'alt-text-for-images',
      'form-labels',
      'heading-hierarchy',
      'focus-indicators',
      'status-updates'
    ]
  }
};

// Test suite runner configuration
export const testSuiteConfig = defineConfig({
  test: {
    // Global test settings
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    
    // Performance and timeout settings
    testTimeout: navigationTestConfig.performance.maxNavigationTime,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      include: [
        'src/services/navigation/**/*.ts',
        'src/components/**/Navigation*.tsx',
        'src/components/NavigationBreadcrumbs.tsx',
        'src/hooks/**/useNavigation*.ts'
      ],
      exclude: [
        'node_modules',
        'dist',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/test-setup.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        },
        // Specific thresholds for navigation components
        'src/services/navigation/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    
    // Reporter configuration
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/navigation-test-results.json',
      html: './test-results/navigation-test-report.html'
    },
    
    // Parallel test execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    }
  }
});

// Test categories for organized execution
export const testCategories = {
  edgeCases: [
    'navigation-edge-cases.test.tsx'
  ],
  
  robustness: [
    'navigation-robustness.test.tsx'
  ],
  
  flowValidation: [
    'navigation-flow-validation.test.tsx'
  ],
  
  existing: [
    'navigationStateManager.test.ts',
    'navigation-system-core.test.tsx',
    'breadcrumb-navigation-focused.test.tsx'
  ],
  
  integration: [
    'navigation-tester.test.tsx'
  ]
};

// Test execution helpers
export const testHelpers = {
  // Run all navigation tests
  runAllTests: () => {
    const allTests = Object.values(testCategories).flat();
    return allTests;
  },
  
  // Run specific test category
  runCategory: (category: keyof typeof testCategories) => {
    return testCategories[category];
  },
  
  // Performance test configuration
  getPerformanceTestConfig: () => {
    return {
      maxExecutionTime: navigationTestConfig.performance.maxNavigationTime,
      memoryThreshold: navigationTestConfig.performance.memoryLeakThreshold,
      concurrentOperations: navigationTestConfig.performance.maxConcurrentOperations
    };
  },
  
  // Network simulation configuration
  getNetworkTestConfig: () => {
    return navigationTestConfig.network;
  }
};

// Export default configuration for easy import
export default {
  config: navigationTestConfig,
  testSuite: testSuiteConfig,
  categories: testCategories,
  helpers: testHelpers
};
