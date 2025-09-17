// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../lib/firebase';
import toast from 'react-hot-toast';
import { PortalConfig, PortalTheme, PortalError, PortalOperationResult } from '../../../../types/portal-types';

export const usePortalTheme = (
  portalConfig: PortalConfig,
  onPortalSuccess?: (result: PortalOperationResult) => void,
  onPortalError?: (error: PortalError) => void
) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  
  // Firebase functions
  const updatePortalConfig = httpsCallable(functions, 'updatePortalConfig');
  
  // Get theme classes
  const getThemeClasses = () => {
    const isDark = currentTheme === 'dark' || 
                  (currentTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    return {
      background: isDark ? 'bg-gray-900' : 'bg-white',
      text: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-gray-300' : 'text-gray-600',
      border: isDark ? 'border-gray-700' : 'border-gray-200',
      card: isDark ? 'bg-gray-800' : 'bg-white'
    };
  };
  
  const themeClasses = getThemeClasses();
  
  // Theme management
  const handleThemeChange = useCallback(async (theme: 'light' | 'dark' | 'auto') => {
    try {
      setCurrentTheme(theme);
      
      const updatedTheme: PortalTheme = {
        ...portalConfig.theme,
        darkMode: theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      };
      
      await updatePortalConfig({
        portalId: portalConfig.id,
        theme: updatedTheme
      });
      
      const themeName = { light: 'Light', dark: 'Dark', auto: 'System' }[theme];
      toast.success(`Theme changed to ${themeName}`);
      onPortalSuccess?.({ success: true, operation: 'configure', data: { theme }, duration: 0, timestamp: new Date() });
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update theme');
      onPortalError?.(error as PortalError);
      toast.error('Failed to update theme');
    }
  }, [portalConfig, updatePortalConfig, onPortalSuccess, onPortalError]);
  
  // Layout management
  const handleLayoutChange = useCallback(async (layout: 'modern' | 'classic' | 'minimal') => {
    try {
      const updatedTheme: PortalTheme = {
        ...portalConfig.theme,
        layout
      };
      
      await updatePortalConfig({
        portalId: portalConfig.id,
        theme: updatedTheme
      });
      
      const layoutName = { modern: 'Modern', classic: 'Classic', minimal: 'Minimal' }[layout];
      toast.success(`Layout changed to ${layoutName}`);
      onPortalSuccess?.({ success: true, operation: 'configure', data: { layout }, duration: 0, timestamp: new Date() });
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update layout');
      onPortalError?.(error as PortalError);
      toast.error('Failed to update layout');
    }
  }, [portalConfig, updatePortalConfig, onPortalSuccess, onPortalError]);
  
  // Auto-detect theme preference
  useEffect(() => {
    if (currentTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        handleThemeChange('auto');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [currentTheme, handleThemeChange]);
  
  return {
    currentTheme,
    themeClasses,
    handleThemeChange,
    handleLayoutChange
  };
};