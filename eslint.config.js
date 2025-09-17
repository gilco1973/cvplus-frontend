import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  // Ignore build outputs and dependencies
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
      'coverage/**',
      '.vite/**'
    ]
  },
  
  // Base ESLint recommended rules
  js.configs.recommended,
  
  // TypeScript configuration
  ...tseslint.configs.recommended,
  
  // Main configuration for TypeScript and React files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_' 
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      
      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      
      // Relaxed rules for development
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Microservices architecture rules
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../microservices/*'],
              message: 'Direct imports between microservices are not allowed. Use the microservice\'s public API instead.'
            },
            {
              group: ['../../microservices/*'],
              message: 'Direct imports between microservices are not allowed. Use the microservice\'s public API instead.'
            }
          ]
        }
      ]
    }
  },

  // Configuration for microservices - enforce domain boundaries
  {
    files: ['src/microservices/**/*.{ts,tsx}'],
    rules: {
      // Stricter rules for microservices to enforce boundaries
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*/components/**', '../*/hooks/**', '../*/contexts/**', '../*/services/**'],
              message: 'Cross-microservice imports are not allowed. Use the microservice\'s public API (index.ts) instead.'
            },
            {
              group: ['../../microservices/*/components/**', '../../microservices/*/hooks/**'],
              message: 'Cross-microservice imports are not allowed. Use the microservice\'s public API instead.'
            }
          ],
          paths: [
            // Allow core-ui imports from other microservices
            {
              name: '@/core-ui',
              message: undefined
            }
          ]
        }
      ]
    }
  },

  // Configuration for test files and debugging files
  {
    files: [
      '**/*.test.{ts,tsx}', 
      '**/__tests__/**/*.{ts,tsx}',
      '**/test*.{ts,tsx,js}',
      '**/debug*.{ts,tsx,js}',
      '**/scripts/**/*.{ts,tsx,js}',
      '**/utils/test*.{ts,tsx,js}'
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      // Allow any types in tests
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow non-null assertions in tests
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Allow empty functions in tests (mocks)
      '@typescript-eslint/no-empty-function': 'off',
      // Allow console statements in test/debug files
      'no-console': 'off',
      // Allow unused variables in test files
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  
  // Configuration for config files
  {
    files: ['**/*.config.{js,ts}', '**/vite.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': 'off'
    }
  },

  // Configuration for root test files
  {
    files: ['test*.js', 'test*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
);