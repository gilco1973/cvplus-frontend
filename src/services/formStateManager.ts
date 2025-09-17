// Advanced Form State Manager - Auto-save, validation persistence, and intelligent form management
import {
  FormState,
  FormSchema,
  FormFieldDefinition,
  ValidationResult,
  AutoSaveConfig,
  EnhancedSessionState
} from '../types/session';
import { EnhancedSessionManager } from './enhancedSessionManager';

export class FormStateManager {
  private static instance: FormStateManager;
  private enhancedSessionManager: EnhancedSessionManager;
  
  // Auto-save configuration
  private autoSaveConfig: AutoSaveConfig = {
    enabled: true,
    intervalMs: 5000, // 5 seconds
    maxRetries: 3,
    saveOnBlur: true,
    saveOnChange: false, // Debounced change detection
    conflictStrategy: 'merge'
  };
  
  // Active form states
  private activeForms = new Map<string, ActiveForm>();
  private autoSaveTimers = new Map<string, NodeJS.Timeout>();
  private validationCache = new Map<string, ValidationResult[]>();
  
  private constructor() {
    this.enhancedSessionManager = EnhancedSessionManager.getInstance();
    this.setupGlobalFormListeners();
  }

  public static getInstance(): FormStateManager {
    if (!FormStateManager.instance) {
      FormStateManager.instance = new FormStateManager();
    }
    return FormStateManager.instance;
  }

  // =====================================================================================
  // FORM REGISTRATION AND MANAGEMENT
  // =====================================================================================

  public registerForm(
    sessionId: string,
    formId: string,
    schema: FormSchema,
    initialData?: Record<string, unknown>
  ): void {
    const formState: FormState = {
      formId,
      fields: this.initializeFields(schema.fields, initialData),
      metadata: {
        version: schema.version,
        lastModified: new Date(),
        userAgent: navigator.userAgent,
        formSchema: schema.id,
        isDirty: false,
        isValid: true
      },
      sections: this.initializeSections(schema.sections)
    };

    const activeForm: ActiveForm = {
      sessionId,
      formState,
      schema,
      lastSaved: new Date(),
      pendingChanges: new Map(),
      validationResults: new Map()
    };

    this.activeForms.set(formId, activeForm);
    
    // Setup auto-save if enabled
    if (this.autoSaveConfig.enabled) {
      this.setupAutoSave(formId);
    }

    // Initial validation
    this.validateForm(formId);
  }

  public unregisterForm(formId: string): void {
    // Clean up auto-save timer
    const timer = this.autoSaveTimers.get(formId);
    if (timer) {
      clearInterval(timer);
      this.autoSaveTimers.delete(formId);
    }

    // Clean up form state
    this.activeForms.delete(formId);
    this.validationCache.delete(formId);
  }

  // =====================================================================================
  // FIELD VALUE MANAGEMENT
  // =====================================================================================

  public updateFieldValue(
    formId: string,
    fieldName: string,
    value: unknown,
    options: {
      validate?: boolean;
      triggerAutoSave?: boolean;
      markDirty?: boolean;
    } = {}
  ): boolean {
    const activeForm = this.activeForms.get(formId);
    if (!activeForm) return false;

    const {
      validate = true,
      triggerAutoSave = this.autoSaveConfig.saveOnChange,
      markDirty = true
    } = options;

    // Update field state
    const fieldState = activeForm.formState.fields[fieldName];
    if (fieldState) {
      fieldState.value = value;
      fieldState.lastModified = new Date();
      
      if (markDirty) {
        fieldState.dirty = true;
        activeForm.formState.metadata.isDirty = true;
        activeForm.formState.metadata.lastModified = new Date();
      }

      // Track pending changes
      activeForm.pendingChanges.set(fieldName, {
        fieldName,
        oldValue: fieldState.value,
        newValue: value,
        timestamp: new Date()
      });
    }

    // Validate if requested
    if (validate) {
      this.validateField(formId, fieldName);
      this.updateFormValidationStatus(formId);
    }

    // Trigger auto-save if requested
    if (triggerAutoSave) {
      this.triggerAutoSave(formId);
    }

    return true;
  }

  public getFieldValue(formId: string, fieldName: string): unknown {
    const activeForm = this.activeForms.get(formId);
    return activeForm?.formState.fields[fieldName]?.value;
  }

  public markFieldTouched(formId: string, fieldName: string): void {
    const activeForm = this.activeForms.get(formId);
    if (!activeForm) return;

    const fieldState = activeForm.formState.fields[fieldName];
    if (fieldState && !fieldState.touched) {
      fieldState.touched = true;
      fieldState.lastModified = new Date();
      
      // Validate touched field
      this.validateField(formId, fieldName);
    }
  }

  // =====================================================================================
  // FORM VALIDATION
  // =====================================================================================

  public validateForm(formId: string): ValidationResult[] {
    const activeForm = this.activeForms.get(formId);
    if (!activeForm) return [];

    const results: ValidationResult[] = [];

    // Validate all fields
    for (const fieldName of Object.keys(activeForm.formState.fields)) {
      const fieldResults = this.validateField(formId, fieldName);
      results.push(...fieldResults);
    }

    // Update form validation status
    this.updateFormValidationStatus(formId);
    
    // Cache results
    this.validationCache.set(formId, results);

    return results;
  }

  public validateField(formId: string, fieldName: string): ValidationResult[] {
    const activeForm = this.activeForms.get(formId);
    if (!activeForm) return [];

    const fieldState = activeForm.formState.fields[fieldName];
    const fieldDef = activeForm.schema.fields.find(f => f.name === fieldName);
    
    if (!fieldState || !fieldDef) return [];

    const results: ValidationResult[] = [];
    const value = fieldState.value;

    // Required validation
    if (fieldDef.required && (value === null || value === undefined || value === '')) {
      results.push({
        field: fieldName,
        valid: false,
        errors: [`${fieldDef.label} is required`],
        warnings: [],
        timestamp: new Date()
      });
    }

    // Type-specific validation
    if (value !== null && value !== undefined && value !== '') {
      const typeValidation = this.validateFieldType(fieldDef, value);
      results.push(...typeValidation);
    }

    // Custom validation rules
    if (fieldDef.validation) {
      for (const rule of fieldDef.validation) {
        const ruleResult = this.validateRule(rule, value, fieldName);
        if (ruleResult) {
          results.push(ruleResult);
        }
      }
    }

    // Update field validation state
    const errors = results.filter(r => !r.valid).flatMap(r => r.errors);
    const warnings = results.flatMap(r => r.warnings);
    
    fieldState.valid = errors.length === 0;
    fieldState.errors = errors;
    fieldState.warnings = warnings;

    // Store in validation results
    activeForm.validationResults.set(fieldName, results);

    return results;
  }

  // =====================================================================================
  // AUTO-SAVE FUNCTIONALITY
  // =====================================================================================

  public configureAutoSave(formId: string, config: Partial<AutoSaveConfig>): void {
    this.autoSaveConfig = { ...this.autoSaveConfig, ...config };
    
    // Reconfigure existing auto-save if form is registered
    if (this.activeForms.has(formId)) {
      this.setupAutoSave(formId);
    }
  }

  public async saveFormNow(formId: string): Promise<boolean> {
    const activeForm = this.activeForms.get(formId);
    if (!activeForm) return false;

    try {
      // Save to session
      await this.saveFormToSession(activeForm);
      
      // Clear pending changes
      activeForm.pendingChanges.clear();
      activeForm.lastSaved = new Date();
      activeForm.formState.metadata.isDirty = false;

      return true;
    } catch (error) {
      console.error('Error saving form:', error);
      return false;
    }
  }

  public hasPendingChanges(formId: string): boolean {
    const activeForm = this.activeForms.get(formId);
    return activeForm ? activeForm.pendingChanges.size > 0 : false;
  }

  // =====================================================================================
  // FORM STATE PERSISTENCE
  // =====================================================================================

  public async restoreFormState(sessionId: string, formId: string): Promise<FormState | null> {
    try {
      const session = await this.enhancedSessionManager.getEnhancedSession(sessionId);
      if (!session) return null;

      const formState = session.uiState.formStates[formId];
      if (!formState) return null;

      // Validate schema compatibility
      if (this.isSchemaCompatible(formId, formState)) {
        return formState;
      }

      return null;
    } catch (error) {
      console.error('Error restoring form state:', error);
      return null;
    }
  }

  public getFormState(formId: string): FormState | null {
    const activeForm = this.activeForms.get(formId);
    return activeForm?.formState || null;
  }

  public getValidationResults(formId: string): ValidationResult[] {
    return this.validationCache.get(formId) || [];
  }

  // =====================================================================================
  // PRIVATE HELPER METHODS
  // =====================================================================================

  private setupAutoSave(formId: string): void {
    // Clear existing timer
    const existingTimer = this.autoSaveTimers.get(formId);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    // Setup new timer
    const timer = setInterval(() => {
      if (this.hasPendingChanges(formId)) {
        this.saveFormNow(formId);
      }
    }, this.autoSaveConfig.intervalMs);

    this.autoSaveTimers.set(formId, timer);
  }

  private triggerAutoSave(formId: string): void {
    // Debounced auto-save trigger
    const existingTimer = this.autoSaveTimers.get(formId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.saveFormNow(formId);
    }, 1000); // 1 second debounce

    this.autoSaveTimers.set(formId, timer);
  }

  private async saveFormToSession(activeForm: ActiveForm): Promise<void> {
    const session = await this.enhancedSessionManager.getEnhancedSession(activeForm.sessionId);
    if (!session) throw new Error('Session not found');

    // Update UI state with form state
    session.uiState.formStates[activeForm.formState.formId] = activeForm.formState;
    session.uiState.activeFormId = activeForm.formState.formId;

    // Save session (this would trigger the enhanced session manager)
    // In a real implementation, you'd call the session manager's save method
    console.warn('Saving form state to session:', activeForm.formState.formId);
  }

  private initializeFields(
    fieldDefinitions: FormFieldDefinition[],
    initialData?: Record<string, unknown>
  ): Record<string, any> {
    const fields: Record<string, any> = {};

    for (const fieldDef of fieldDefinitions) {
      const initialValue = initialData?.[fieldDef.name] ?? fieldDef.defaultValue ?? '';

      fields[fieldDef.name] = {
        value: initialValue,
        dirty: false,
        touched: false,
        valid: true,
        errors: [],
        warnings: [],
        lastModified: new Date(),
        validationRules: fieldDef.validation?.map(v => v.type) || [],
        metadata: {
          fieldType: fieldDef.type,
          required: fieldDef.required
        }
      };
    }

    return fields;
  }

  private initializeSections(sectionDefinitions: any[]): Record<string, any> {
    const sections: Record<string, any> = {};

    for (const sectionDef of sectionDefinitions) {
      sections[sectionDef.id] = {
        id: sectionDef.id,
        completed: false,
        visible: true,
        expanded: sectionDef.defaultExpanded || false,
        validationSummary: {
          valid: true,
          errorCount: 0,
          warningCount: 0
        }
      };
    }

    return sections;
  }

  private validateFieldType(fieldDef: FormFieldDefinition, value: unknown): ValidationResult[] {
    const results: ValidationResult[] = [];

    switch (fieldDef.type) {
      case 'email':
        if (typeof value === 'string' && !this.isValidEmail(value)) {
          results.push({
            field: fieldDef.name,
            valid: false,
            errors: ['Please enter a valid email address'],
            warnings: [],
            timestamp: new Date()
          });
        }
        break;
      
      case 'number':
        if (isNaN(Number(value))) {
          results.push({
            field: fieldDef.name,
            valid: false,
            errors: ['Please enter a valid number'],
            warnings: [],
            timestamp: new Date()
          });
        }
        break;
      
      // Add more type validations as needed
    }

    return results;
  }

  private validateRule(rule: any, value: unknown, fieldName: string): ValidationResult | null {
    // Implementation of custom validation rules
    switch (rule.type) {
      case 'min_length':
        if (typeof value === 'string' && value.length < rule.value) {
          return {
            field: fieldName,
            valid: false,
            errors: [rule.message || `Minimum length is ${rule.value}`],
            warnings: [],
            timestamp: new Date()
          };
        }
        break;
      
      case 'max_length':
        if (typeof value === 'string' && value.length > rule.value) {
          return {
            field: fieldName,
            valid: false,
            errors: [rule.message || `Maximum length is ${rule.value}`],
            warnings: [],
            timestamp: new Date()
          };
        }
        break;
      
      // Add more validation rules as needed
    }

    return null;
  }

  private updateFormValidationStatus(formId: string): void {
    const activeForm = this.activeForms.get(formId);
    if (!activeForm) return;

    const allValidationResults = Array.from(activeForm.validationResults.values()).flat();
    const hasErrors = allValidationResults.some(result => !result.valid);
    
    activeForm.formState.metadata.isValid = !hasErrors;

    // Update section validation summaries
    for (const section of activeForm.schema.sections) {
      const sectionFields = section.fields;
      const sectionResults = allValidationResults.filter(r => sectionFields.includes(r.field));
      
      const sectionState = activeForm.formState.sections?.[section.id];
      if (sectionState) {
        sectionState.validationSummary = {
          valid: !sectionResults.some(r => !r.valid),
          errorCount: sectionResults.filter(r => !r.valid).length,
          warningCount: sectionResults.reduce((sum, r) => sum + r.warnings.length, 0)
        };
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isSchemaCompatible(formId: string, formState: FormState): boolean {
    const activeForm = this.activeForms.get(formId);
    if (!activeForm) return false;

    // Check if schema versions are compatible
    return activeForm.schema.version === formState.metadata.version;
  }

  private setupGlobalFormListeners(): void {
    // Global blur listener for auto-save
    if (this.autoSaveConfig.saveOnBlur) {
      document.addEventListener('blur', (event) => {
        const target = event.target as HTMLElement;
        const formId = target.closest('form')?.getAttribute('data-form-id');
        
        if (formId && this.activeForms.has(formId)) {
          this.triggerAutoSave(formId);
        }
      }, true);
    }
  }
}

// Supporting interfaces
interface ActiveForm {
  sessionId: string;
  formState: FormState;
  schema: FormSchema;
  lastSaved: Date;
  pendingChanges: Map<string, FieldChange>;
  validationResults: Map<string, ValidationResult[]>;
}

interface FieldChange {
  fieldName: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: Date;
}

export default FormStateManager;