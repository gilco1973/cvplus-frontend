// Auto Save Manager - Debounced auto-save functionality for forms
import { ActiveForm } from './formManager';

export interface AutoSaveOptions {
  debounceMs?: number;
  maxRetries?: number;
  saveOnBlur?: boolean;
  conflictStrategy?: 'merge' | 'overwrite' | 'ask';
}

export class AutoSaveManager {
  private autoSaveTimers = new Map<string, NodeJS.Timeout>();
  private savePromises = new Map<string, Promise<boolean>>();
  private retryCount = new Map<string, number>();
  
  private defaultOptions: AutoSaveOptions = {
    debounceMs: 2000,
    maxRetries: 3,
    saveOnBlur: true,
    conflictStrategy: 'merge'
  };

  public setupAutoSave(formId: string, activeForm: ActiveForm, options?: AutoSaveOptions): void {
    const config = { ...this.defaultOptions, ...options };
    
    // Clear any existing timer
    this.cleanup(formId);
    
    // Set up blur listener if enabled
    if (config.saveOnBlur) {
      this.setupBlurListener(formId, activeForm);
    }
  }

  public triggerAutoSave(formId: string, activeForm: ActiveForm): void {
    // Clear existing timer
    const existingTimer = this.autoSaveTimers.get(formId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set up new debounced save
    const timer = setTimeout(() => {
      this.performSave(formId, activeForm);
    }, this.defaultOptions.debounceMs);

    this.autoSaveTimers.set(formId, timer);
  }

  public async forceSave(formId: string, activeForm: ActiveForm): Promise<boolean> {
    // Cancel any pending debounced saves
    this.cleanup(formId);
    
    // Perform immediate save
    return this.performSave(formId, activeForm);
  }

  public cleanup(formId: string): void {
    const timer = this.autoSaveTimers.get(formId);
    if (timer) {
      clearTimeout(timer);
      this.autoSaveTimers.delete(formId);
    }
    
    this.savePromises.delete(formId);
    this.retryCount.delete(formId);
  }

  public hasPendingChanges(formId: string, activeForm: ActiveForm): boolean {
    return activeForm.pendingChanges.size > 0 || activeForm.formState.metadata.isDirty;
  }

  private async performSave(formId: string, activeForm: ActiveForm): Promise<boolean> {
    // Check if there's already a save in progress
    const existingPromise = this.savePromises.get(formId);
    if (existingPromise) {
      return existingPromise;
    }

    // Create save promise
    const savePromise = this.executeSave(formId, activeForm);
    this.savePromises.set(formId, savePromise);

    try {
      const result = await savePromise;
      
      if (result) {
        // Reset retry count on success
        this.retryCount.delete(formId);
        
        // Clear pending changes
        activeForm.pendingChanges.clear();
        activeForm.formState.metadata.isDirty = false;
        activeForm.lastSaved = new Date();
      }
      
      return result;
    } finally {
      this.savePromises.delete(formId);
    }
  }

  private async executeSave(formId: string, activeForm: ActiveForm): Promise<boolean> {
    try {
      // Simulate API call to save form data
      // In a real implementation, this would call the session manager or API
      console.warn(`Auto-saving form ${formId}:`, {
        sessionId: activeForm.sessionId,
        formId: activeForm.formState.formId,
        changesCount: activeForm.pendingChanges.size,
        lastModified: activeForm.formState.metadata.lastModified
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate occasional failures for retry testing
      const shouldSimulateFailure = Math.random() < 0.1; // 10% failure rate
      if (shouldSimulateFailure && this.getRetryCount(formId) < 2) {
        throw new Error('Simulated network error');
      }

      return true;
    } catch (error) {
      console.error(`Auto-save failed for form ${formId}:`, error);
      
      // Retry logic
      const retryCount = this.getRetryCount(formId);
      if (retryCount < this.defaultOptions.maxRetries!) {
        this.retryCount.set(formId, retryCount + 1);
        
        // Exponential backoff
        const retryDelay = Math.pow(2, retryCount) * 1000;
        
        setTimeout(() => {
          this.performSave(formId, activeForm);
        }, retryDelay);
        
        console.warn(`Retrying auto-save for form ${formId} in ${retryDelay}ms (attempt ${retryCount + 1})`);
      }
      
      return false;
    }
  }

  private setupBlurListener(formId: string, activeForm: ActiveForm): void {
    const handleBlur = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const form = target.closest('form');
      
      if (form && form.getAttribute('data-form-id') === formId) {
        // Save on blur if there are pending changes
        if (this.hasPendingChanges(formId, activeForm)) {
          this.triggerAutoSave(formId, activeForm);
        }
      }
    };

    // Add blur listener to document
    document.addEventListener('blur', handleBlur, true);
    
    // Store cleanup function for later
    const cleanup = () => {
      document.removeEventListener('blur', handleBlur, true);
    };
    
    // Store cleanup in a way that can be accessed later
    (activeForm as any)._autoSaveCleanup = cleanup;
  }

  private getRetryCount(formId: string): number {
    return this.retryCount.get(formId) || 0;
  }
}

export default AutoSaveManager;