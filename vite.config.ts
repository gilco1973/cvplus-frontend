import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Security headers plugin for development and production
    {
      name: 'security-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Content Security Policy - Development friendly (allows Firebase emulators)
          const cspPolicy = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://apis.google.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https: http:",
            "font-src 'self' https://fonts.gstatic.com data:",
            "connect-src 'self' https: wss: ws: http: http://localhost:* ws://localhost:* https://accounts.google.com https://oauth2.googleapis.com https://identitytoolkit.googleapis.com",
            "media-src 'self' blob:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "frame-src 'self' https://accounts.google.com http://localhost:9099"
          ].join('; ');
          
          res.setHeader('Content-Security-Policy', cspPolicy);
          
          // XSS Protection headers
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-XSS-Protection', '1; mode=block');
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
          
          // Additional security headers
          res.setHeader('Permissions-Policy', 
            'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
          );
          
          // Remove potentially revealing headers
          res.removeHeader('X-Powered-By');
          res.removeHeader('Server');
          
          next();
        });
      }
    }
  ],
    define: {
      // Firebase tree shaking
      __FIREBASE_DEFAULTS__: JSON.stringify({
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
      })
    },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 1 // Reduce from 3 to 1 to prevent hanging
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendors - shared across all microservices
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'lucide-react'],

          // Core UI microservice - shared infrastructure
          'core-ui': ['./src/microservices/core-ui'],

          // Domain microservices - independent chunks for selective loading
          'auth-ui': ['./src/microservices/auth-ui'],
          'cv-processing-ui': ['./src/microservices/cv-processing-ui'],
          'multimedia-ui': ['./src/microservices/multimedia-ui'],
          'analytics-ui': ['./src/microservices/analytics-ui'],
          'premium-ui': ['./src/microservices/premium-ui'],
          'public-profiles-ui': ['./src/microservices/public-profiles-ui'],
          'admin-ui': ['./src/microservices/admin-ui'],
          'workflow-ui': ['./src/microservices/workflow-ui'],
          'payments-ui': ['./src/microservices/payments-ui']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit to reduce warnings
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions',
      'firebase/storage',
      'dompurify',
      'zod',
      'recharts',
      'lodash',
      'lodash/uniqBy',
      'lodash/isFunction',
      'lodash/sortBy',
      'lodash/isNil',
      'lodash/throttle',
      'lodash/isObject',
      'lodash/upperFirst',
      'lodash/maxBy',
      'lodash/minBy',
      'lodash/last',
      'lodash/first',
      'lodash/get',
      'lodash/isEqual',
      'lodash/some',
      'lodash/max',
      'lodash/isNaN',
      'lodash/omit',
      'lodash/min',
      'lodash/isNumber',
      'lodash/isString',
      'lodash/range'
    ],
    exclude: [
      'framer-motion',
      'firebase/compat',
      'firebase/analytics',
      'firebase/messaging',
      'firebase/performance'
    ]
  },
  resolve: {
    alias: {
      '@': '/Users/gklainert/Documents/cvplus/packages/frontend/src',
      '@/components': '/Users/gklainert/Documents/cvplus/packages/frontend/src/components',
      '@/hooks': '/Users/gklainert/Documents/cvplus/packages/frontend/src/hooks',
      '@/contexts': '/Users/gklainert/Documents/cvplus/packages/frontend/src/contexts',
      '@/types': '/Users/gklainert/Documents/cvplus/packages/frontend/src/types',
      '@/utils': '/Users/gklainert/Documents/cvplus/packages/frontend/src/utils',
      '@/providers': '/Users/gklainert/Documents/cvplus/packages/frontend/src/providers',

      // Microservices alias mappings
      '@/microservices': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices',
      '@/auth-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/auth-ui',
      '@/cv-processing-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/cv-processing-ui',
      '@/multimedia-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/multimedia-ui',
      '@/analytics-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/analytics-ui',
      '@/premium-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/premium-ui',
      '@/public-profiles-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/public-profiles-ui',
      '@/admin-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/admin-ui',
      '@/workflow-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/workflow-ui',
      '@/payments-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/payments-ui',
      '@/core-ui': '/Users/gklainert/Documents/cvplus/packages/frontend/src/microservices/core-ui'
    }
  },
  // Environment variable prefixes that should be exposed to the client
  envPrefix: ['VITE_']
})
