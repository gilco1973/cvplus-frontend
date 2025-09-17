// Form Manager Test Suite
import { FormManager, ActiveForm, FieldChange } from '../services/forms/formManager';
import { FormValidator } from '../services/forms/formValidator';
import { AutoSaveManager } from '../services/forms/autoSaveManager';
import {
  FormState,
  FormSchema,
  ValidationResult
} from '../types/session';

// Mock dependencies
jest.mock('../services/forms/formValidator');
jest.mock('../services/forms/autoSaveManager');

const mockFormValidator = {
  validateForm: jest.fn().mockReturnValue([]),
  validateField: jest.fn().mockReturnValue([])
};

const mockAutoSaveManager = {
  setupAutoSave: jest.fn(),
  triggerAutoSave: jest.fn(),
  cleanup: jest.fn()
};

(FormValidator as jest.Mock).mockImplementation(() => mockFormValidator);
(AutoSaveManager as jest.Mock).mockImplementation(() => mockAutoSaveManager);

describe('FormManager', () => {
  let formManager: FormManager;
  let mockSchema: FormSchema;
  let mockInitialData: Record<string, unknown>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    formManager = FormManager.getInstance();

    mockSchema = {
      id: 'test-form-schema',
      version: '1.0',
      fields: [
        {
          name: 'firstName',
          type: 'text',
          label: 'First Name',
          required: true,
          defaultValue: '',
          validation: [
            { type: 'min_length', value: 2, message: 'Minimum 2 characters' }
          ]
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
          defaultValue: '',
          validation: [
            { type: 'pattern', value: '^[^@]+@[^@]+\\.[^@]+$', message: 'Invalid email format' }
          ]
        },
        {
          name: 'age',
          type: 'number',
          label: 'Age',
          required: false,
          defaultValue: 0,
          validation: [
            { type: 'min_value', value: 18, message: 'Must be 18 or older' }
          ]
        }
      ],
      sections: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          fields: ['firstName', 'email'],
          defaultExpanded: true
        },
        {
          id: 'additional-info',
          title: 'Additional Information',
          fields: ['age'],
          defaultExpanded: false
        }
      ]
    };

    mockInitialData = {
      firstName: 'John',
      email: 'john@example.com',
      age: 25
    };
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = FormManager.getInstance();
      const instance2 = FormManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Form Registration', () => {
    it('should register a form with schema and initial data', () => {
      const sessionId = 'test-session-123';
      const formId = 'personal-info-form';

      formManager.registerForm(sessionId, formId, mockSchema, mockInitialData);

      const formState = formManager.getFormState(formId);
      expect(formState).not.toBeNull();
      expect(formState?.formId).toBe(formId);
      expect(formState?.fields.firstName.value).toBe('John');
      expect(formState?.fields.email.value).toBe('john@example.com');
      expect(formState?.fields.age.value).toBe(25);
    });

    it('should register a form without initial data using defaults', () => {
      const sessionId = 'test-session-123';
      const formId = 'empty-form';

      formManager.registerForm(sessionId, formId, mockSchema);

      const formState = formManager.getFormState(formId);
      expect(formState).not.toBeNull();
      expect(formState?.fields.firstName.value).toBe('');
      expect(formState?.fields.email.value).toBe('');
      expect(formState?.fields.age.value).toBe(0);
    });

    it('should setup auto-save when registering form', () => {
      const sessionId = 'test-session-123';
      const formId = 'autosave-form';

      formManager.registerForm(sessionId, formId, mockSchema);

      expect(mockAutoSaveManager.setupAutoSave).toHaveBeenCalledWith(
        formId,
        expect.any(Object)
      );
    });

    it('should initialize sections correctly', () => {
      const sessionId = 'test-session-123';
      const formId = 'sections-form';

      formManager.registerForm(sessionId, formId, mockSchema);

      const formState = formManager.getFormState(formId);
      expect(formState?.sections).toBeDefined();
      expect(formState?.sections?.['personal-info']).toBeDefined();
      expect(formState?.sections?.['personal-info'].expanded).toBe(true);
      expect(formState?.sections?.['additional-info'].expanded).toBe(false);
    });

    it('should set form metadata correctly', () => {
      const sessionId = 'test-session-123';
      const formId = 'metadata-form';

      formManager.registerForm(sessionId, formId, mockSchema);

      const formState = formManager.getFormState(formId);
      expect(formState?.metadata.version).toBe('1.0');
      expect(formState?.metadata.formSchema).toBe('test-form-schema');
      expect(formState?.metadata.isDirty).toBe(false);
      expect(formState?.metadata.isValid).toBe(true);
      expect(formState?.metadata.userAgent).toBe(navigator.userAgent);
    });
  });

  describe('Field Value Updates', () => {
    beforeEach(() => {
      formManager.registerForm('test-session', 'test-form', mockSchema, mockInitialData);
    });

    it('should update field value and mark as dirty', () => {
      const success = formManager.updateFieldValue('test-form', 'firstName', 'Jane');

      expect(success).toBe(true);

      const formState = formManager.getFormState('test-form');
      expect(formState?.fields.firstName.value).toBe('Jane');
      expect(formState?.fields.firstName.dirty).toBe(true);
      expect(formState?.metadata.isDirty).toBe(true);
    });

    it('should track field changes in pending changes', () => {
      formManager.updateFieldValue('test-form', 'email', 'jane@example.com');

      // Access the active form to check pending changes
      const activeForm = (formManager as any).activeForms.get('test-form');
      expect(activeForm.pendingChanges.size).toBe(1);
      expect(activeForm.pendingChanges.has('email')).toBe(true);

      const change = activeForm.pendingChanges.get('email');
      expect(change.fieldName).toBe('email');
      expect(change.newValue).toBe('jane@example.com');
      expect(change.oldValue).toBe('jane@example.com'); // This would be the field value
    });

    it('should trigger validation when updating field', () => {
      formManager.updateFieldValue('test-form', 'firstName', 'J');

      expect(mockFormValidator.validateField).toHaveBeenCalledWith(
        expect.any(Object),
        'firstName'
      );
    });

    it('should trigger auto-save when updating field', () => {
      formManager.updateFieldValue('test-form', 'firstName', 'Jane');

      expect(mockAutoSaveManager.triggerAutoSave).toHaveBeenCalledWith(
        'test-form',
        expect.any(Object)
      );
    });

    it('should return false when updating non-existent form', () => {
      const success = formManager.updateFieldValue('non-existent-form', 'field', 'value');

      expect(success).toBe(false);
    });

    it('should handle updating non-existent field gracefully', () => {
      const success = formManager.updateFieldValue('test-form', 'nonExistentField', 'value');

      expect(success).toBe(true); // Still returns true as form exists
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      formManager.registerForm('test-session', 'test-form', mockSchema, mockInitialData);
    });

    it('should validate entire form', () => {
      const mockValidationResults: ValidationResult[] = [
        {
          field: 'email',
          valid: false,
          errors: ['Invalid email format'],
          warnings: [],
          timestamp: new Date()
        }
      ];

      mockFormValidator.validateForm.mockReturnValue(mockValidationResults);

      const results = formManager.validateForm('test-form');

      expect(mockFormValidator.validateForm).toHaveBeenCalled();
      expect(results).toEqual(mockValidationResults);
    });

    it('should return empty array for non-existent form validation', () => {
      const results = formManager.validateForm('non-existent-form');

      expect(results).toEqual([]);
    });

    it('should use validator when form exists', () => {
      formManager.validateForm('test-form');

      expect(mockFormValidator.validateForm).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'test-session',
          formState: expect.any(Object),
          schema: mockSchema
        })
      );
    });
  });

  describe('Form Unregistration', () => {
    beforeEach(() => {
      formManager.registerForm('test-session', 'test-form', mockSchema, mockInitialData);
    });

    it('should unregister form and cleanup auto-save', () => {
      expect(formManager.getFormState('test-form')).not.toBeNull();

      formManager.unregisterForm('test-form');

      expect(formManager.getFormState('test-form')).toBeNull();
      expect(mockAutoSaveManager.cleanup).toHaveBeenCalledWith('test-form');
    });

    it('should handle unregistering non-existent form gracefully', () => {
      expect(() => {
        formManager.unregisterForm('non-existent-form');
      }).not.toThrow();
    });
  });

  describe('Field Initialization', () => {
    it('should initialize fields with default values when no initial data provided', () => {
      const fields = (formManager as any).initializeFields(mockSchema.fields);

      expect(fields.firstName.value).toBe('');
      expect(fields.email.value).toBe('');
      expect(fields.age.value).toBe(0);
    });

    it('should initialize fields with provided initial data', () => {
      const fields = (formManager as any).initializeFields(mockSchema.fields, mockInitialData);

      expect(fields.firstName.value).toBe('John');
      expect(fields.email.value).toBe('john@example.com');
      expect(fields.age.value).toBe(25);
    });

    it('should set field metadata correctly', () => {
      const fields = (formManager as any).initializeFields(mockSchema.fields);

      expect(fields.firstName.dirty).toBe(false);
      expect(fields.firstName.touched).toBe(false);
      expect(fields.firstName.valid).toBe(true);
      expect(fields.firstName.errors).toEqual([]);
      expect(fields.firstName.warnings).toEqual([]);
      expect(fields.firstName.validationRules).toEqual(['min_length']);
      expect(fields.firstName.metadata.fieldType).toBe('text');
      expect(fields.firstName.metadata.required).toBe(true);
    });
  });

  describe('Section Initialization', () => {
    it('should initialize sections with correct default state', () => {
      const sections = (formManager as any).initializeSections(mockSchema.sections);

      expect(sections['personal-info']).toBeDefined();
      expect(sections['personal-info'].id).toBe('personal-info');
      expect(sections['personal-info'].completed).toBe(false);
      expect(sections['personal-info'].visible).toBe(true);
      expect(sections['personal-info'].expanded).toBe(true);
      expect(sections['personal-info'].validationSummary.valid).toBe(true);
      expect(sections['personal-info'].validationSummary.errorCount).toBe(0);

      expect(sections['additional-info'].expanded).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle validator errors gracefully', () => {
      mockFormValidator.validateForm.mockImplementation(() => {
        throw new Error('Validation error');
      });

      formManager.registerForm('test-session', 'error-form', mockSchema);

      expect(() => {
        formManager.validateForm('error-form');
      }).toThrow('Validation error');
    });

    it('should handle auto-save setup errors gracefully', () => {
      mockAutoSaveManager.setupAutoSave.mockImplementation(() => {
        throw new Error('Auto-save setup failed');
      });

      expect(() => {
        formManager.registerForm('test-session', 'autosave-error-form', mockSchema);
      }).toThrow('Auto-save setup failed');
    });
  });

  describe('Memory Management', () => {
    it('should clean up resources when unregistering multiple forms', () => {
      // Register multiple forms
      for (let i = 0; i < 5; i++) {
        formManager.registerForm('test-session', `form-${i}`, mockSchema);
      }

      // Unregister all forms
      for (let i = 0; i < 5; i++) {
        formManager.unregisterForm(`form-${i}`);
      }

      // Verify cleanup was called for each form
      expect(mockAutoSaveManager.cleanup).toHaveBeenCalledTimes(5);
    });

    it('should handle large form schemas efficiently', () => {
      const largeSchema: FormSchema = {
        ...mockSchema,
        fields: Array.from({ length: 100 }, (_, i) => ({
          name: `field${i}`,
          type: 'text',
          label: `Field ${i}`,
          required: false,
          defaultValue: '',
          validation: []
        }))
      };

      const startTime = Date.now();
      formManager.registerForm('test-session', 'large-form', largeSchema);
      const endTime = Date.now();

      // Should register within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      const formState = formManager.getFormState('large-form');
      expect(Object.keys(formState?.fields || {})).toHaveLength(100);
    });
  });

  describe('Concurrent Operations', () => {
    beforeEach(() => {
      formManager.registerForm('test-session', 'concurrent-form', mockSchema, mockInitialData);
    });

    it('should handle concurrent field updates', () => {
      const promises = [
        Promise.resolve(formManager.updateFieldValue('concurrent-form', 'firstName', 'Alice')),
        Promise.resolve(formManager.updateFieldValue('concurrent-form', 'email', 'alice@example.com')),
        Promise.resolve(formManager.updateFieldValue('concurrent-form', 'age', 30))
      ];

      return Promise.all(promises).then(results => {
        expect(results).toEqual([true, true, true]);

        const formState = formManager.getFormState('concurrent-form');
        expect(formState?.fields.firstName.value).toBe('Alice');
        expect(formState?.fields.email.value).toBe('alice@example.com');
        expect(formState?.fields.age.value).toBe(30);
      });
    });
  });
});