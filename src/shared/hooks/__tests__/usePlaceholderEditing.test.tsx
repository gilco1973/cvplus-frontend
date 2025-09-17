/**
 * usePlaceholderEditing Hook Tests
 * 
 * Tests for the custom hook that provides placeholder editing functionality.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { usePlaceholderEditing } from '../usePlaceholderEditing';
import { PlaceholderEditingProvider } from '../../contexts/PlaceholderEditingContext';
import { PlaceholderInfo } from '../../types/placeholders';

import { vi } from 'vitest';

// Mock dependencies
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../services/cvUpdateService', () => ({
  CVUpdateService: {
    updatePlaceholder: vi.fn().mockResolvedValue({ success: true })
  }
}));

describe('usePlaceholderEditing', () => {
  const testJobId = 'test-job-123';
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PlaceholderEditingProvider jobId={testJobId}>
      {children}
    </PlaceholderEditingProvider>
  );

  const testPlaceholders: PlaceholderInfo[] = [
    {
      key: '[INSERT TEAM SIZE]',
      placeholder: 'INSERT TEAM SIZE',
      type: 'number',
      label: 'Team Size',
      helpText: 'How many people did you manage?',
      example: '8 developers',
      required: true
    },
    {
      key: '[INSERT BUDGET]',
      placeholder: 'INSERT BUDGET',
      type: 'currency',
      label: 'Budget',
      helpText: 'What was the budget you managed?',
      example: '$2.5M',
      required: false
    },
    {
      key: '[INSERT PERCENTAGE]',
      placeholder: 'INSERT PERCENTAGE',
      type: 'percentage',
      label: 'Percentage',
      helpText: 'What percentage improvement did you achieve?',
      example: '25',
      required: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('provides all expected methods and properties', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      expect(typeof result.current.startEditing).toBe('function');
      expect(typeof result.current.stopEditing).toBe('function');
      expect(typeof result.current.updateValue).toBe('function');
      expect(typeof result.current.cancelEditing).toBe('function');
      expect(typeof result.current.isEditing).toBe('function');
      expect(typeof result.current.getValue).toBe('function');
      expect(typeof result.current.getError).toBe('function');
      expect(typeof result.current.isSaving).toBe('boolean');
      expect(typeof result.current.hasActiveEditing).toBe('boolean');
      expect(typeof result.current.getCompletionStatus).toBe('function');
      expect(typeof result.current.validatePlaceholder).toBe('function');
      expect(typeof result.current.formatPlaceholderValue).toBe('function');
    });

    it('starts with no active editing', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      expect(result.current.hasActiveEditing).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });

    it('detects active editing correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
      });

      expect(result.current.hasActiveEditing).toBe(true);
      expect(result.current.isEditing('[INSERT TEAM SIZE]')).toBe(true);
    });
  });

  describe('Completion Status', () => {
    it('calculates completion status correctly for empty placeholders', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const status = result.current.getCompletionStatus(testPlaceholders);

      expect(status.total).toBe(3);
      expect(status.completed).toBe(0);
      expect(status.isComplete).toBe(false);
      expect(status.completionPercentage).toBe(0);
    });

    it('calculates completion status correctly for partial completion', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      act(() => {
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
        result.current.updateValue('[INSERT BUDGET]', '$1M');
      });

      const status = result.current.getCompletionStatus(testPlaceholders);

      expect(status.total).toBe(3);
      expect(status.completed).toBe(2);
      expect(status.isComplete).toBe(false);
      expect(status.completionPercentage).toBe(67);
    });

    it('calculates completion status correctly for full completion', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      act(() => {
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
        result.current.updateValue('[INSERT BUDGET]', '$1M');
        result.current.updateValue('[INSERT PERCENTAGE]', '25');
      });

      const status = result.current.getCompletionStatus(testPlaceholders);

      expect(status.total).toBe(3);
      expect(status.completed).toBe(3);
      expect(status.isComplete).toBe(true);
      expect(status.completionPercentage).toBe(100);
    });

    it('handles empty placeholder array', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const status = result.current.getCompletionStatus([]);

      expect(status.total).toBe(0);
      expect(status.completed).toBe(0);
      expect(status.isComplete).toBe(true);
      expect(status.completionPercentage).toBe(100);
    });
  });

  describe('Validation', () => {
    it('validates required fields correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const validationResult = result.current.validatePlaceholder(testPlaceholders[0], '');

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.error).toBe('Team Size is required');
    });

    it('validates number input correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const validResult = result.current.validatePlaceholder(testPlaceholders[0], '10');
      expect(validResult.isValid).toBe(true);
      expect(validResult.formattedValue).toBe('10');

      const invalidResult = result.current.validatePlaceholder(testPlaceholders[0], 'invalid');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBe('Team Size must be a valid number');
    });

    it('validates percentage input correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const validResult = result.current.validatePlaceholder(testPlaceholders[2], '25');
      expect(validResult.isValid).toBe(true);

      const invalidResult = result.current.validatePlaceholder(testPlaceholders[2], '150');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBe('Percentage must be between 0 and 100');
    });

    it('validates currency input correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const validResult = result.current.validatePlaceholder(testPlaceholders[1], '1.5M');
      expect(validResult.isValid).toBe(true);

      const invalidResult = result.current.validatePlaceholder(testPlaceholders[1], 'invalid$');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBe('Budget must be a valid amount (e.g., 1000, $1.5M, 500K)');
    });

    it('validates with custom regex', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const customPlaceholder: PlaceholderInfo = {
        ...testPlaceholders[0],
        validation: /^\d{3}-\d{3}-\d{4}$/,
        example: '123-456-7890'
      };

      const validResult = result.current.validatePlaceholder(customPlaceholder, '123-456-7890');
      expect(validResult.isValid).toBe(true);

      const invalidResult = result.current.validatePlaceholder(customPlaceholder, '123456789');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBe('Team Size format is invalid. Example: 123-456-7890');
    });
  });

  describe('Formatting', () => {
    it('formats number values correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const formatted = result.current.formatPlaceholderValue(testPlaceholders[0], '1000');
      expect(formatted).toBe('1,000');
    });

    it('formats currency values correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const formatted = result.current.formatPlaceholderValue(testPlaceholders[1], '$1.5M');
      expect(formatted).toBe('1.5M');
    });

    it('formats percentage values correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const formatted = result.current.formatPlaceholderValue(testPlaceholders[2], '25%');
      expect(formatted).toBe('25');
    });

    it('formats text values correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const textPlaceholder: PlaceholderInfo = {
        ...testPlaceholders[0],
        type: 'text'
      };

      const formatted = result.current.formatPlaceholderValue(textPlaceholder, '  hello world  ');
      expect(formatted).toBe('Hello world');
    });
  });

  describe('Data Access', () => {
    it('gets all values correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      act(() => {
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
        result.current.updateValue('[INSERT BUDGET]', '$1M');
      });

      const allValues = result.current.getAllValues();
      expect(allValues).toEqual({
        '[INSERT TEAM SIZE]': '10',
        '[INSERT BUDGET]': '$1M'
      });
    });

    it('gets all errors correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const allErrors = result.current.getAllErrors();
      expect(allErrors).toEqual({});
    });

    it('detects unsaved changes correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      expect(result.current.hasUnsavedChanges()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles whitespace-only values', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const validationResult = result.current.validatePlaceholder(testPlaceholders[1], '   ');
      expect(validationResult.isValid).toBe(true); // Non-required field
    });

    it('handles very long text values', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const longText = 'a'.repeat(150);
      const textPlaceholder: PlaceholderInfo = {
        ...testPlaceholders[0],
        type: 'text'
      };

      const validationResult = result.current.validatePlaceholder(textPlaceholder, longText);
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.error).toBe('Team Size must be less than 100 characters');
    });

    it('handles invalid placeholder types gracefully', () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      const invalidPlaceholder: PlaceholderInfo = {
        ...testPlaceholders[0],
        type: 'unknown' as any
      };

      const validationResult = result.current.validatePlaceholder(invalidPlaceholder, 'test');
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.formattedValue).toBe('test');
    });
  });

  describe('Integration with Context', () => {
    it('delegates core operations to context correctly', async () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
      });

      expect(result.current.isEditing('[INSERT TEAM SIZE]')).toBe(true);
      expect(result.current.getValue('[INSERT TEAM SIZE]')).toBe('10');

      act(() => {
        result.current.cancelEditing();
      });

      expect(result.current.isEditing('[INSERT TEAM SIZE]')).toBe(false);
    });

    it('stops editing correctly through hook', async () => {
      const { result } = renderHook(() => usePlaceholderEditing(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
      });

      await act(async () => {
        await result.current.stopEditing();
      });

      expect(result.current.isEditing('[INSERT TEAM SIZE]')).toBe(false);
    });
  });
});