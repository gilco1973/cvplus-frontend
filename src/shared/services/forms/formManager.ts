// Form Manager - Core form state management
import { FormState, FormSchema, ValidationResult } from '../../types/session';
import { FormValidator } from './formValidator';
import { AutoSaveManager } from './autoSaveManager';

export class FormManager {
  private static instance: FormManager;
  private activeForms = new Map<string, ActiveForm>();
  private validator: FormValidator;
  private autoSave: AutoSaveManager;

  private constructor() {
    this.validator = new FormValidator();
    this.autoSave = new AutoSaveManager();
  }

  public static getInstance(): FormManager {
    if (!FormManager.instance) {
      FormManager.instance = new FormManager();
    }
    return FormManager.instance;
  }

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
      pendingChanges: new Map()
    };

    this.activeForms.set(formId, activeForm);
    this.autoSave.setupAutoSave(formId, activeForm);
  }

  public updateFieldValue(formId: string, fieldName: string, value: unknown): boolean {
    const activeForm = this.activeForms.get(formId);
    if (!activeForm) return false;

    const fieldState = activeForm.formState.fields[fieldName];
    if (fieldState) {
      fieldState.value = value;
      fieldState.dirty = true;
      fieldState.lastModified = new Date();
      
      activeForm.formState.metadata.isDirty = true;
      activeForm.formState.metadata.lastModified = new Date();
      
      // Track changes
      activeForm.pendingChanges.set(fieldName, {
        fieldName,
        oldValue: fieldState.value,
        newValue: value,
        timestamp: new Date()
      });

      // Validate and trigger auto-save
      this.validator.validateField(activeForm, fieldName);
      this.autoSave.triggerAutoSave(formId, activeForm);
    }

    return true;
  }

  public validateForm(formId: string): ValidationResult[] {
    const activeForm = this.activeForms.get(formId);
    return activeForm ? this.validator.validateForm(activeForm) : [];
  }

  public getFormState(formId: string): FormState | null {
    return this.activeForms.get(formId)?.formState || null;
  }

  public unregisterForm(formId: string): void {
    const activeForm = this.activeForms.get(formId);
    if (activeForm) {
      this.autoSave.cleanup(formId);
      this.activeForms.delete(formId);
    }
  }

  private initializeFields(fieldDefinitions: any[], initialData?: Record<string, unknown>) {
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
        validationRules: fieldDef.validation?.map((v: any) => v.type) || [],
        metadata: {
          fieldType: fieldDef.type,
          required: fieldDef.required
        }
      };
    }

    return fields;
  }

  private initializeSections(sectionDefinitions: any[]) {
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
}

export interface ActiveForm {
  sessionId: string;
  formState: FormState;
  schema: FormSchema;
  lastSaved: Date;
  pendingChanges: Map<string, FieldChange>;
}

export interface FieldChange {
  fieldName: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: Date;
}

export default FormManager;