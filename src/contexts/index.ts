// CVPlus Frontend Contexts - Unified Exports
// All React contexts from the consolidated frontend module

// Auth Context
export { AuthContext, AuthProvider, useAuthContext } from './AuthContext';

// Help Context
export { HelpContext, HelpProvider, useHelpContext } from './HelpContext';

// Placeholder Editing Context
export {
  PlaceholderEditingContext,
  PlaceholderEditingProvider,
  usePlaceholderEditingContext
} from './PlaceholderEditingContext';

// Analysis Context
export {
  UnifiedAnalysisContext,
  UnifiedAnalysisProvider,
  useUnifiedAnalysisContext
} from './analysis/UnifiedAnalysisContext';

// Theme Context (if exists)
export { ThemeContext, ThemeProvider, useTheme } from './ThemeContext';

// Session Context
export { SessionContext, SessionProvider, useSession } from './SessionContext';

// CV Generation Context
export { CVContext, CVProvider, useCVContext } from './CVContext';

// Feature Context
export { FeatureContext, FeatureProvider, useFeatureContext } from './FeatureContext';

// Job Analysis Context
export { JobContext, JobProvider, useJobContext } from './JobContext';

// Premium Context
export { PremiumContext, PremiumProvider, usePremiumContext } from './PremiumContext';

// I18n Context
export { I18nContext, I18nProvider, useI18nContext } from './I18nContext';

// Navigation Context
export { NavigationContext, NavigationProvider, useNavigationContext } from './NavigationContext';

// Toast Context
export { ToastContext, ToastProvider, useToastContext } from './ToastContext';

// Loading Context
export { LoadingContext, LoadingProvider, useLoadingContext } from './LoadingContext';

// Modal Context
export { ModalContext, ModalProvider, useModalContext } from './ModalContext';

// Error Context
export { ErrorContext, ErrorProvider, useErrorContext } from './ErrorContext';

// Analytics Context
export { AnalyticsContext, AnalyticsProvider, useAnalyticsContext } from './AnalyticsContext';

// Additional contexts from package consolidation will be added here