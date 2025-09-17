// CVPlus Frontend Hooks - Unified Exports
// All React hooks from the consolidated frontend module

// Auth Hooks
export { default as useAuth } from './useAuth';
export { default as useAuthState } from './useAuthState';
export { default as useAuthRedirect } from './useAuthRedirect';

// CV Hooks
export { default as useCV } from './useCV';
export { default as useCVGeneration } from './useCVGeneration';
export { default as useCVPreview } from './useCVPreview';
export { default as useCVAnalysis } from './useCVAnalysis';
export { default as useCVTemplates } from './useCVTemplates';

// Job Hooks
export { default as useJobs } from './useJobs';
export { default as useJobAnalysis } from './useJobAnalysis';

// Feature Hooks
export { default as useFeatures } from './useFeatures';
export { default as useFeatureProgress } from './useFeatureProgress';

// Session & State Hooks
export { default as useSession } from './useSession';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useSessionStorage } from './useSessionStorage';

// UI Hooks
export { default as useToast } from './useToast';
export { default as useModal } from './useModal';
export { default as useLoading } from './useLoading';
export { default as useDebounce } from './useDebounce';

// Navigation Hooks
export { default as useNavigation } from './useNavigation';
export { default as useRouter } from './useRouter';
export { default as useBreadcrumbs } from './useBreadcrumbs';

// Form Hooks
export { default as useForm } from './useForm';
export { default as useFormValidation } from './useFormValidation';

// Data Fetching Hooks
export { default as useApi } from './useApi';
export { default as useFirestore } from './useFirestore';
export { default as useFunctions } from './useFunctions';

// Performance Hooks
export { default as usePerformance } from './usePerformance';
export { default as useIntersectionObserver } from './useIntersectionObserver';

// Device & Media Hooks
export { default as useMediaQuery } from './useMediaQuery';
export { default as useDeviceType } from './useDeviceType';

// Analytics Hooks
export { default as useAnalytics } from './useAnalytics';
export { default as useTracking } from './useTracking';

// Premium Features Hooks
export { default as usePremium } from './usePremium';
export { default as useSubscription } from './useSubscription';

// I18n Hooks
export { default as useI18n } from './useI18n';
export { default as useTranslation } from './useTranslation';

// Error Handling Hooks
export { default as useErrorBoundary } from './useErrorBoundary';
export { default as useErrorHandler } from './useErrorHandler';

// Utility Hooks
export { default as useClickOutside } from './useClickOutside';
export { default as useKeyboardShortcuts } from './useKeyboardShortcuts';
export { default as useClipboard } from './useClipboard';

// Additional hooks from package consolidation will be added here
// as we extract them from various packages