/**
 * Module Provider
 * 
 * Provides module integration context and error boundaries
 * for the modular architecture migration.
 */

import React, { createContext, useContext, ReactNode, ErrorInfo } from 'react';
import { MODULE_FLAGS, type ModuleFlags } from '../modules';
import { PremiumModuleProvider } from './PremiumProvider';

interface ModuleContextType {
  flags: ModuleFlags;
  isModuleEnabled: (module: keyof ModuleFlags) => boolean;
  setModuleFlag: (flag: keyof ModuleFlags, value: boolean) => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const useModules = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within ModuleProvider');
  }
  return context;
};

// Error boundary for module failures
class ModuleErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Module error caught by boundary:', error, errorInfo);
    
    // Report to monitoring service
    if (import.meta.env.PROD) {
      // reportError('module-error', { error: error.message, stack: error.stack });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Module Error</h3>
          <p className="text-red-600 text-sm mt-1">
            A module failed to load. The application will continue with legacy functionality.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-2">
              <summary className="text-red-700 cursor-pointer">Error Details</summary>
              <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

interface ModuleProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ModuleProvider: React.FC<ModuleProviderProps> = ({ 
  children, 
  fallback 
}) => {
  const [flags, setFlags] = React.useState<ModuleFlags>(MODULE_FLAGS);

  const isModuleEnabled = React.useCallback((module: keyof ModuleFlags) => {
    return flags[module] as boolean;
  }, [flags]);

  const setModuleFlag = React.useCallback((flag: keyof ModuleFlags, value: boolean) => {
    setFlags(prev => ({ ...prev, [flag]: value }));
  }, []);

  const contextValue: ModuleContextType = {
    flags,
    isModuleEnabled,
    setModuleFlag
  };

  return (
    <ModuleErrorBoundary fallback={fallback}>
      <ModuleContext.Provider value={contextValue}>
        {isModuleEnabled('USE_PREMIUM_MODULE') ? (
          <PremiumModuleProvider fallbackComponent={() => (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="text-orange-800 font-semibold">Premium Module Fallback</h3>
              <p className="text-orange-600 text-sm mt-1">
                Premium features are using legacy implementation.
              </p>
            </div>
          )}>
            {children}
          </PremiumModuleProvider>
        ) : children}
      </ModuleContext.Provider>
    </ModuleErrorBoundary>
  );
};

// Hook to check specific module availability
export const useModuleFeature = (module: keyof ModuleFlags) => {
  const { isModuleEnabled, setModuleFlag } = useModules();
  
  return {
    isEnabled: isModuleEnabled(module),
    enable: () => setModuleFlag(module, true),
    disable: () => setModuleFlag(module, false)
  };
};
