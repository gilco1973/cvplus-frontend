// Form Validator - Field and form validation logic
import { ValidationResult, FormValidationRule } from '../../types/session';
import { ActiveForm } from './formManager';

export class FormValidator {
  
  public validateForm(activeForm: ActiveForm): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const fieldName of Object.keys(activeForm.formState.fields)) {
      const fieldResults = this.validateField(activeForm, fieldName);
      results.push(...fieldResults);
    }

    this.updateFormValidationStatus(activeForm, results);
    return results;
  }

  public validateField(activeForm: ActiveForm, fieldName: string): ValidationResult[] {
    const fieldState = activeForm.formState.fields[fieldName];
    const fieldDef = activeForm.schema.fields.find(f => f.name === fieldName);
    
    if (!fieldState || !fieldDef) return [];

    const results: ValidationResult[] = [];
    const value = fieldState.value;

    // Required validation
    if (fieldDef.required && this.isEmpty(value)) {
      results.push({
        field: fieldName,
        valid: false,
        errors: [`${fieldDef.label} is required`],
        warnings: [],
        timestamp: new Date()
      });
    }

    // Type-specific validation
    if (!this.isEmpty(value)) {
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
    this.updateFieldValidationState(fieldState, results);
    return results;
  }

  private validateFieldType(fieldDef: any, value: unknown): ValidationResult[] {
    const results: ValidationResult[] = [];

    switch (fieldDef.type) {
      case 'email':
        if (typeof value === 'string' && !this.isValidEmail(value)) {
          results.push(this.createValidationResult(fieldDef.name, false, 'Please enter a valid email address'));
        }
        break;
      
      case 'number':
        if (isNaN(Number(value))) {
          results.push(this.createValidationResult(fieldDef.name, false, 'Please enter a valid number'));
        }
        break;
      
      case 'phone':
        if (typeof value === 'string' && !this.isValidPhone(value)) {
          results.push(this.createValidationResult(fieldDef.name, false, 'Please enter a valid phone number'));
        }
        break;
    }

    return results;
  }

  private validateRule(rule: FormValidationRule, value: unknown, fieldName: string): ValidationResult | null {
    switch (rule.type) {
      case 'min_length':
        if (typeof value === 'string' && value.length < (rule.value as number)) {
          return this.createValidationResult(fieldName, false, rule.message || `Minimum length is ${rule.value}`);
        }
        break;
      
      case 'max_length':
        if (typeof value === 'string' && value.length > (rule.value as number)) {
          return this.createValidationResult(fieldName, false, rule.message || `Maximum length is ${rule.value}`);
        }
        break;
      
      case 'pattern':
        if (typeof value === 'string' && typeof rule.value === 'string') {
          const regex = new RegExp(rule.value);
          if (!regex.test(value)) {
            return this.createValidationResult(fieldName, false, rule.message || 'Invalid format');
          }
        }
        break;
    }

    return null;
  }

  private updateFieldValidationState(fieldState: any, results: ValidationResult[]): void {
    const errors = results.filter(r => !r.valid).flatMap(r => r.errors);
    const warnings = results.flatMap(r => r.warnings);
    
    fieldState.valid = errors.length === 0;
    fieldState.errors = errors;
    fieldState.warnings = warnings;
  }

  private updateFormValidationStatus(activeForm: ActiveForm, results: ValidationResult[]): void {
    const hasErrors = results.some(result => !result.valid);
    activeForm.formState.metadata.isValid = !hasErrors;

    // Update section validation summaries
    for (const section of activeForm.schema.sections) {
      const sectionFields = section.fields;
      const sectionResults = results.filter(r => sectionFields.includes(r.field));
      
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

  private createValidationResult(field: string, valid: boolean, message: string): ValidationResult {
    return {
      field,
      valid,
      errors: valid ? [] : [message],
      warnings: [],
      timestamp: new Date()
    };
  }

  private isEmpty(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  }
}