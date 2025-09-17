/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',

    // Microservices-specific test configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/microservices/**/*.{ts,tsx}'],
      exclude: [
        'src/microservices/**/*.test.{ts,tsx}',
        'src/microservices/**/*.stories.{ts,tsx}',
        'src/microservices/**/index.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },

    // Test organization for microservices
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/microservices/**/*.{test,spec}.{ts,tsx}'
    ],

    // Allow parallel testing per microservice
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true
      }
    },

    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com'
    }
  },

  // Alias resolution for tests (same as main Vite config)
  resolve: {
    alias: {
      '@': '/Users/gklainert/Documents/cvplus/packages/frontend/src',
      '@/components': '/Users/gklainert/Documents/cvplus/packages/frontend/src/components',
      '@/hooks': '/Users/gklainert/Documents/cvplus/packages/frontend/src/hooks',
      '@/contexts': '/Users/gklainert/Documents/cvplus/packages/frontend/src/contexts',
      '@/types': '/Users/gklainert/Documents/cvplus/packages/frontend/src/types',
      '@/utils': '/Users/gklainert/Documents/cvplus/packages/frontend/src/utils',
      '@/providers': '/Users/gklainert/Documents/cvplus/packages/frontend/src/providers',

      // Microservices alias mappings for tests
      '@/microservices': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices',
      '@/auth-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/auth-ui',
      '@/processing-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/processing-ui',
      '@/multimedia-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/multimedia-ui',
      '@/analytics-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/analytics-ui',
      '@/premium-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/premium-ui',
      '@/public-profiles-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/public-profiles-ui',
      '@/admin-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/admin-ui',
      '@/workflow-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/workflow-ui',
      '@/payments-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/payments-ui',
      '@/core-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/core-ui'
    }
  }
})