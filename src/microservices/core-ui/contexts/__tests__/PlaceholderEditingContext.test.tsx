/**
 * PlaceholderEditingContext Tests
 * 
 * Tests for the context that manages placeholder editing state
 * and coordinates updates with the backend.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlaceholderEditingProvider, usePlaceholderEditingContext } from '../PlaceholderEditingContext';
import { CVUpdateService } from '../../services/cvUpdateService';

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
    updatePlaceholder: vi.fn()
  }
}));

const mockCVUpdateService = CVUpdateService as any;

describe('PlaceholderEditingContext', () => {
  const testJobId = 'test-job-123';
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PlaceholderEditingProvider jobId={testJobId}>
      {children}
    </PlaceholderEditingProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    mockCVUpdateService.updatePlaceholder.mockResolvedValue({ success: true });
  });

  describe('Initial State', () => {
    it('provides initial context values', () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      expect(result.current.state.editingKey).toBeNull();
      expect(result.current.state.values).toEqual({});
      expect(result.current.state.errors).toEqual({});
      expect(result.current.state.isSaving).toBe(false);
      expect(result.current.state.pendingUpdates).toEqual({});
      expect(result.current.isSaving).toBe(false);
    });

    it('throws error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => usePlaceholderEditingContext());
      }).toThrow('usePlaceholderEditingContext must be used within a PlaceholderEditingProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Editing Flow', () => {
    it('starts editing correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
      });

      expect(result.current.state.editingKey).toBe('[INSERT TEAM SIZE]');
      expect(result.current.isEditing('[INSERT TEAM SIZE]')).toBe(true);
      expect(result.current.isEditing('[OTHER KEY]')).toBe(false);
    });

    it('updates value correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
      });

      expect(result.current.getValue('[INSERT TEAM SIZE]')).toBe('10');
      expect(result.current.state.values['[INSERT TEAM SIZE]']).toBe('10');
    });

    it('clears errors when updating value', () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        // Simulate an error
        result.current.state.errors['[INSERT TEAM SIZE]'] = 'Test error';
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
      });

      expect(result.current.getError('[INSERT TEAM SIZE]')).toBe('');
    });

    it('cancels editing correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
        result.current.cancelEditing();
      });

      expect(result.current.state.editingKey).toBeNull();
    });
  });

  describe('Server Integration', () => {
    it('stops editing and saves to server', async () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
      });

      await act(async () => {
        await result.current.stopEditing();
      });

      expect(mockCVUpdateService.updatePlaceholder).toHaveBeenCalledWith({
        jobId: testJobId,
        placeholderKey: '[INSERT TEAM SIZE]',
        value: '10',
        section: 'placeholder_updates',
        field: '[INSERT TEAM SIZE]'
      });

      expect(result.current.state.editingKey).toBeNull();
    });

    it('handles server errors gracefully', async () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });
      
      mockCVUpdateService.updatePlaceholder.mockRejectedValue(new Error('Server error'));

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
      });

      await act(async () => {
        await result.current.stopEditing();
      });

      // Should still try to save
      expect(mockCVUpdateService.updatePlaceholder).toHaveBeenCalled();
    });

    it('does not save empty values', async () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
      });

      await act(async () => {
        await result.current.stopEditing();
      });

      expect(mockCVUpdateService.updatePlaceholder).not.toHaveBeenCalled();
    });

    it('does not save whitespace-only values', async () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.updateValue('[INSERT TEAM SIZE]', '   ');
      });

      await act(async () => {
        await result.current.stopEditing();
      });

      expect(mockCVUpdateService.updatePlaceholder).not.toHaveBeenCalled();
    });
  });

  describe('Optimistic Updates', () => {
    it('adds pending updates with optimistic updates enabled', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PlaceholderEditingProvider 
          jobId={testJobId} 
          options={{ optimisticUpdates: true }}
        >
          {children}
        </PlaceholderEditingProvider>
      );

      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
      });

      expect(result.current.state.pendingUpdates['[INSERT TEAM SIZE]']).toBe('10');
    });

    it('removes pending updates after successful save', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PlaceholderEditingProvider 
          jobId={testJobId} 
          options={{ optimisticUpdates: true }}
        >
          {children}
        </PlaceholderEditingProvider>
      );

      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
      });

      await act(async () => {
        await result.current.stopEditing();
      });

      expect(result.current.state.pendingUpdates['[INSERT TEAM SIZE]']).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('sets errors correctly', () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        // Manually set error for testing
        result.current.state.errors['[INSERT TEAM SIZE]'] = 'Test error';
      });

      expect(result.current.getError('[INSERT TEAM SIZE]')).toBe('Test error');
    });

    it('handles retry logic for failed saves', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PlaceholderEditingProvider 
          jobId={testJobId} 
          options={{ maxRetries: 2 }}
        >
          {children}
        </PlaceholderEditingProvider>
      );

      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });
      
      // Mock server to fail initially, then succeed
      let callCount = 0;
      mockCVUpdateService.updatePlaceholder.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Server error');
        }
        return { success: true };
      });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
      });

      await act(async () => {
        await result.current.stopEditing();
      });

      // Should have called the service at least once
      expect(mockCVUpdateService.updatePlaceholder).toHaveBeenCalled();
    });
  });

  describe('Debounced Saves', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('debounces save calls with immediate validation', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <PlaceholderEditingProvider 
          jobId={testJobId} 
          options={{ 
            immediateValidation: true,
            saveDelay: 500 
          }}
        >
          {children}
        </PlaceholderEditingProvider>
      );

      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.updateValue('[INSERT TEAM SIZE]', '1');
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
        result.current.updateValue('[INSERT TEAM SIZE]', '100');
      });

      // Should not have saved yet
      expect(mockCVUpdateService.updatePlaceholder).not.toHaveBeenCalled();

      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should save now
      expect(mockCVUpdateService.updatePlaceholder).toHaveBeenCalledTimes(1);
      expect(mockCVUpdateService.updatePlaceholder).toHaveBeenCalledWith({
        jobId: testJobId,
        placeholderKey: '[INSERT TEAM SIZE]',
        value: '100',
        section: 'placeholder_updates',
        field: '[INSERT TEAM SIZE]'
      });
    });
  });

  describe('Multiple Placeholders', () => {
    it('handles multiple placeholders independently', () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.updateValue('[INSERT TEAM SIZE]', '10');
        result.current.updateValue('[INSERT BUDGET]', '$1M');
      });

      expect(result.current.getValue('[INSERT TEAM SIZE]')).toBe('10');
      expect(result.current.getValue('[INSERT BUDGET]')).toBe('$1M');
    });

    it('only allows one placeholder to be edited at a time', () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
        result.current.startEditing('[INSERT BUDGET]');
      });

      expect(result.current.isEditing('[INSERT TEAM SIZE]')).toBe(false);
      expect(result.current.isEditing('[INSERT BUDGET]')).toBe(true);
      expect(result.current.state.editingKey).toBe('[INSERT BUDGET]');
    });
  });

  describe('Session Management', () => {
    it('tracks editing session state', () => {
      const { result } = renderHook(() => usePlaceholderEditingContext(), { wrapper });

      expect(result.current.isSaving).toBe(false);

      act(() => {
        result.current.startEditing('[INSERT TEAM SIZE]');
      });

      expect(result.current.state.editingKey).toBe('[INSERT TEAM SIZE]');
    });

    it('cleans up timeouts on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      const { unmount } = renderHook(() => usePlaceholderEditingContext(), { wrapper });
      
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
});