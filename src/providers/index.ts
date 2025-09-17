// CVPlus Frontend Providers - Unified Exports
// All React providers from the consolidated frontend module

// Core Providers
export { default as ModuleProvider } from './ModuleProvider';
export { default as PremiumProvider } from './PremiumProvider';

// Auth Providers
export { AuthProvider } from '../contexts/AuthContext';

// Theme Providers
export { ThemeProvider } from '../contexts/ThemeContext';

// Session Providers
export { SessionProvider } from '../contexts/SessionContext';

// Feature Providers
export { FeatureProvider } from '../contexts/FeatureContext';

// Premium Providers
export { PremiumProvider as PremiumContextProvider } from '../contexts/PremiumContext';

// I18n Providers
export { I18nProvider } from '../contexts/I18nContext';

// Analytics Providers
export { AnalyticsProvider } from '../contexts/AnalyticsContext';

// Toast Providers
export { ToastProvider } from '../contexts/ToastContext';

// Loading Providers
export { LoadingProvider } from '../contexts/LoadingContext';

// Modal Providers
export { ModalProvider } from '../contexts/ModalContext';

// Error Providers
export { ErrorProvider } from '../contexts/ErrorContext';

// Navigation Providers
export { NavigationProvider } from '../contexts/NavigationContext';

// Help Providers
export { HelpProvider } from '../contexts/HelpContext';

// Placeholder Editing Providers
export { PlaceholderEditingProvider } from '../contexts/PlaceholderEditingContext';

// Analysis Providers
export { UnifiedAnalysisProvider } from '../contexts/analysis/UnifiedAnalysisContext';

// Combined App Provider
export interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorProvider>
      <AuthProvider>
        <ThemeProvider>
          <I18nProvider>
            <SessionProvider>
              <AnalyticsProvider>
                <LoadingProvider>
                  <ToastProvider>
                    <ModalProvider>
                      <NavigationProvider>
                        <FeatureProvider>
                          <PremiumContextProvider>
                            <HelpProvider>
                              <PlaceholderEditingProvider>
                                <UnifiedAnalysisProvider>
                                  <ModuleProvider>
                                    {children}
                                  </ModuleProvider>
                                </UnifiedAnalysisProvider>
                              </PlaceholderEditingProvider>
                            </HelpProvider>
                          </PremiumContextProvider>
                        </FeatureProvider>
                      </NavigationProvider>
                    </ModalProvider>
                  </ToastProvider>
                </LoadingProvider>
              </AnalyticsProvider>
            </SessionProvider>
          </I18nProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorProvider>
  );
};

// Additional providers from package consolidation will be added here