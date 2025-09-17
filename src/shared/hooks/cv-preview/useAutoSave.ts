import { useRef, useCallback, useEffect } from 'react';

export const useAutoSave = (
  autoSaveEnabled: boolean,
  onSave: (data: unknown) => void,
  delay = 2000
) => {
  const autoSaveTimeoutRef = useRef<number | undefined>(undefined);

  const triggerAutoSave = useCallback((data: unknown) => {
    if (!autoSaveEnabled) return;
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = window.setTimeout(() => {
      onSave(data);
    }, delay);
  }, [autoSaveEnabled, onSave, delay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return { triggerAutoSave };
};