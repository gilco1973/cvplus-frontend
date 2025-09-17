/**
 * EditablePlaceholder Component Tests
 * 
 * Comprehensive test suite for the EditablePlaceholder component.
 * Tests editing behavior, validation, and integration with context.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { EditablePlaceholder } from '../EditablePlaceholder';
import { PlaceholderEditingProvider } from '../../../contexts/PlaceholderEditingContext';
import { PlaceholderInfo } from '../../../types/placeholders';
import { PlaceholderMatch } from '../../../types/inline-editing';

import { vi } from 'vitest';

// Test placeholder definitions
const testPlaceholders: Record<string, PlaceholderInfo> = {
  '[INSERT TEAM SIZE]': {
    key: '[INSERT TEAM SIZE]',
    placeholder: 'INSERT TEAM SIZE',
    type: 'number',
    label: 'Team Size',
    helpText: 'How many people did you manage?',
    example: '8 developers',
    required: true
  },
  '[INSERT BUDGET]': {
    key: '[INSERT BUDGET]',
    placeholder: 'INSERT BUDGET',
    type: 'currency',
    label: 'Budget',
    helpText: 'What was the budget you managed?',
    example: '$2.5M',
    required: false
  },
  '[INSERT PERCENTAGE]': {
    key: '[INSERT PERCENTAGE]',
    placeholder: 'INSERT PERCENTAGE',
    type: 'percentage',
    label: 'Percentage',
    helpText: 'What percentage improvement did you achieve?',
    example: '25',
    required: false
  }
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PlaceholderEditingProvider jobId="test-job-123">
    {children}
  </PlaceholderEditingProvider>
);

describe('EditablePlaceholder', () => {
  const testPlaceholder: PlaceholderMatch = {
    id: 'test-placeholder-1',
    key: 'INSERT TEAM SIZE',
    fullMatch: '[INSERT TEAM SIZE]',
    type: 'number',
    label: 'Team Size',
    helpText: 'How many people did you manage?',
    example: '8 developers',
    required: true,
    startIndex: 0,
    endIndex: 18,
    fieldPath: 'test.field',
    section: 'test'
  };

  const percentagePlaceholder: PlaceholderMatch = {
    id: 'test-placeholder-2',
    key: 'INSERT PERCENTAGE',
    fullMatch: '[INSERT PERCENTAGE]',
    type: 'percentage',
    label: 'Percentage',
    helpText: 'What percentage improvement did you achieve?',
    example: '25',
    required: false,
    startIndex: 0,
    endIndex: 20,
    fieldPath: 'test.percentage',
    section: 'test'
  };

  const currencyPlaceholder: PlaceholderMatch = {
    id: 'test-placeholder-3',
    key: 'INSERT BUDGET',
    fullMatch: '[INSERT BUDGET]',
    type: 'currency',
    label: 'Budget',
    helpText: 'What was the budget you managed?',
    example: '$2.5M',
    required: false,
    startIndex: 0,
    endIndex: 15,
    fieldPath: 'test.budget',
    section: 'test'
  };

  const defaultProps = {
    placeholder: testPlaceholder,
    onUpdate: vi.fn(),
    readOnly: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display Mode', () => {
    it('renders placeholder in display mode initially', () => {
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveClass('bg-yellow-200');
    });

    it('shows clickable styling for placeholders', () => {
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      expect(placeholder).toHaveClass('cursor-pointer');
      expect(placeholder).toHaveAttribute('role', 'button');
    });

    it('shows tooltip with help text on hover', () => {
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      expect(placeholder).toHaveAttribute('title', 'Click to edit: How many people did you manage?');
    });

    it('handles disabled state correctly', () => {
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} disabled />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      expect(placeholder).toHaveClass('cursor-not-allowed', 'opacity-50');
      expect(placeholder).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Editing Mode', () => {
    it('enters editing mode when clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      // Should show input field
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('enters editing mode with Enter key', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      placeholder.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('does not enter editing mode when disabled', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} disabled />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('auto-focuses input when entering editing mode', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });
  });

  describe('Input Behavior', () => {
    it('updates value as user types', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, '10');

      expect(input).toHaveValue('10');
    });

    it('shows help text when input is focused', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      expect(screen.getByText('How many people did you manage?')).toBeInTheDocument();
    });

    it('shows keyboard shortcuts hint', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      expect(screen.getByText('Enter to save • Esc to cancel')).toBeInTheDocument();
    });

    it('completes editing with Enter key', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, '10');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });

    it('cancels editing with Escape key', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, '10');
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });

    it('completes editing on blur', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, '10');
      await user.tab(); // Blur the input

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('shows validation error for invalid number input', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, 'invalid');

      expect(screen.getByText('Team Size must be a valid number')).toBeInTheDocument();
    });

    it('shows validation error for empty required field', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.keyboard('{Enter}');

      expect(screen.getByText('Team Size is required')).toBeInTheDocument();
    });

    it('validates percentage input range', async () => {
      const user = userEvent.setup();
      const percentageProps = {
        ...defaultProps,
        placeholder: percentagePlaceholder
      };
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...percentageProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT PERCENTAGE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, '150');

      expect(screen.getByText('Percentage must be between 0 and 100')).toBeInTheDocument();
    });
  });

  describe('Content Updates', () => {
    it('calls onContentUpdate when editing completes', async () => {
      const user = userEvent.setup();
      const mockOnContentUpdate = vi.fn();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} onContentUpdate={mockOnContentUpdate} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, '10');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnContentUpdate).toHaveBeenCalledWith(
          'I managed a team of 10 developers.'
        );
      });
    });

    it('updates display to show filled value', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, '10');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.queryByText('[INSERT TEAM SIZE]')).not.toBeInTheDocument();
      });
    });
  });

  describe('Number Input Type', () => {
    it('formats numbers with commas', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, '1000');

      expect(input).toHaveValue('1,000');
    });

    it('restricts input to numeric characters', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('inputMode', 'numeric');
      expect(input).toHaveAttribute('pattern', '[0-9,]*');
    });
  });

  describe('Currency Input Type', () => {
    it('handles currency input correctly', async () => {
      const user = userEvent.setup();
      const currencyProps = {
        ...defaultProps,
        placeholder: currencyPlaceholder
      };
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...currencyProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT BUDGET]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, '2.5M');

      expect(input).toHaveValue('2.5M');
    });
  });

  describe('Percentage Input Type', () => {
    it('shows percentage symbol suffix', async () => {
      const user = userEvent.setup();
      const percentageProps = {
        ...defaultProps,
        placeholder: percentagePlaceholder
      };
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...percentageProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT PERCENTAGE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, '25');

      expect(screen.getByText('%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      expect(placeholder).toHaveAttribute('role', 'button');
      expect(placeholder).toHaveAttribute('aria-label', 'Edit Team Size');
      expect(placeholder).toHaveAttribute('tabIndex', '0');
    });

    it('has proper ARIA attributes for input', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Team Size');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('updates aria-invalid when validation fails', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EditablePlaceholder {...defaultProps} />
        </TestWrapper>
      );

      const placeholder = screen.getByText('[INSERT TEAM SIZE]');
      await user.click(placeholder);

      const input = screen.getByRole('textbox');
      await user.type(input, 'invalid');

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});