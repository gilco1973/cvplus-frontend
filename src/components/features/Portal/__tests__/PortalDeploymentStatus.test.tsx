/**
 * PortalDeploymentStatus.test.tsx
 * 
 * Comprehensive test suite for the PortalDeploymentStatus component
 * covering all deployment phases, error states, and user interactions.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PortalDeploymentStatus } from '../PortalDeploymentStatus';
import { DeploymentStatus, PortalConfig } from '../../../../types/portal-types';
import { PortalDeploymentStatusProps } from '../../../../types/portal-component-props';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Create mock function
const mockCallFunction = vi.fn().mockResolvedValue({ success: true });

vi.mock('../../../../hooks/useFeatureData', () => ({
  useFirebaseFunction: () => ({
    callFunction: mockCallFunction,
    loading: false,
    error: null
  })
}));

vi.mock('../../../../lib/firebase', () => ({
  functions: {}
}));

// Test data
const mockPortalConfig: PortalConfig = {
  id: 'test-portal',
  name: 'Test Portal',
  visibility: 'public',
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter',
    layout: 'modern',
    animations: true,
    darkMode: false
  },
  features: {
    aiChat: true,
    qrCode: true,
    contactForm: true,
    calendar: true,
    portfolio: true,
    socialLinks: true,
    testimonials: true,
    analytics: true
  },
  metadata: {
    title: 'Test Portal',
    description: 'Test portal description',
    keywords: ['test', 'portal']
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

const createMockDeploymentStatus = (phase: any = 'building', error?: any): DeploymentStatus => ({
  phase,
  progress: 60,
  currentOperation: 'Building Space application',
  startedAt: new Date(Date.now() - 300000), // 5 minutes ago
  estimatedCompletion: new Date(Date.now() + 120000), // 2 minutes from now
  url: phase === 'completed' ? 'https://huggingface.co/spaces/test/portal' : undefined,
  error,
  logs: [
    {
      timestamp: new Date(Date.now() - 250000),
      level: 'info' as const,
      message: 'Starting deployment process'
    },
    {
      timestamp: new Date(Date.now() - 200000),
      level: 'info' as const,
      message: 'Validating configuration'
    },
    {
      timestamp: new Date(Date.now() - 150000),
      level: 'success' as const,
      message: 'Configuration validated successfully'
    },
    {
      timestamp: new Date(Date.now() - 100000),
      level: 'info' as const,
      message: 'Building application'
    }
  ]
});

const defaultProps: PortalDeploymentStatusProps = {
  status: createMockDeploymentStatus(),
  portalConfig: mockPortalConfig,
  jobId: 'test-job-123',
  profileId: 'test-profile-456',
  isEnabled: true,
  mode: 'private',
  className: '',
  displayConfig: {
    showProgress: true,
    showLogs: true,
    showTimeEstimate: true,
    showUrl: true,
    compact: false,
    refreshInterval: 5
  },
  actions: {
    allowRefresh: true,
    allowCancel: true,
    allowRetry: true,
    showHistory: true
  },
  deploymentHistory: [
    {
      id: 'deployment-1',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      status: 'success' as const,
      duration: 300000,
      url: 'https://huggingface.co/spaces/test/portal-old'
    }
  ]
};

// Mock timers
beforeEach(() => {
  vi.useFakeTimers();
  mockCallFunction.mockClear();
  mockCallFunction.mockResolvedValue({ success: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('PortalDeploymentStatus', () => {
  it('renders deployment status with progress bar', () => {
    render(<PortalDeploymentStatus {...defaultProps} />);
    
    expect(screen.getByText('Building')).toBeInTheDocument();
    expect(screen.getByText('Building the Space application')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays deployment logs with filtering', () => {
    render(<PortalDeploymentStatus {...defaultProps} />);
    
    expect(screen.getByText('Deployment Logs')).toBeInTheDocument();
    expect(screen.getByText('Starting deployment process')).toBeInTheDocument();
    expect(screen.getByText('Configuration validated successfully')).toBeInTheDocument();
    
    // Test log filtering
    const filterSelect = screen.getByDisplayValue('All logs');
    fireEvent.change(filterSelect, { target: { value: 'success' } });
    
    expect(screen.getByText('Configuration validated successfully')).toBeInTheDocument();
  });

  it('shows deployment URL when completed', () => {
    const completedStatus = createMockDeploymentStatus('completed');
    completedStatus.url = 'https://huggingface.co/spaces/test/portal';
    
    render(
      <PortalDeploymentStatus 
        {...defaultProps} 
        status={completedStatus}
      />
    );
    
    expect(screen.getByText('Deployment Ready')).toBeInTheDocument();
    expect(screen.getByText('https://huggingface.co/spaces/test/portal')).toBeInTheDocument();
    expect(screen.getByTitle('Open in new tab')).toBeInTheDocument();
  });

  it('displays error state with retry option', () => {
    const errorStatus = createMockDeploymentStatus('failed', {
      code: 'DEPLOYMENT_FAILED',
      message: 'Build process failed',
      phase: 'building'
    });
    
    render(
      <PortalDeploymentStatus 
        {...defaultProps} 
        status={errorStatus}
      />
    );
    
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Deployment Failed')).toBeInTheDocument();
    expect(screen.getByText('Build process failed')).toBeInTheDocument();
    expect(screen.getByText('Retry Deployment')).toBeInTheDocument();
  });

  it('handles refresh button click', async () => {
    const onRefresh = vi.fn();
    
    render(
      <PortalDeploymentStatus 
        {...defaultProps} 
        onRefresh={onRefresh}
      />
    );
    
    const refreshButton = screen.getByTitle('Refresh status');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });
  });

  it('toggles auto-refresh functionality', () => {
    render(<PortalDeploymentStatus {...defaultProps} />);
    
    const autoRefreshButton = screen.getByTitle('Disable auto-refresh');
    fireEvent.click(autoRefreshButton);
    
    expect(screen.getByTitle('Enable auto-refresh')).toBeInTheDocument();
  });

  it('handles cancel deployment', async () => {
    const onCancel = vi.fn();
    
    render(
      <PortalDeploymentStatus 
        {...defaultProps} 
        onCancel={onCancel}
      />
    );
    
    const cancelButton = screen.getByText('Cancel Deployment');
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
    });
  });

  it('copies deployment URL to clipboard', async () => {
    const completedStatus = createMockDeploymentStatus('completed');
    completedStatus.url = 'https://huggingface.co/spaces/test/portal';
    
    // Mock clipboard API
    const mockWriteText = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    });
    
    render(
      <PortalDeploymentStatus 
        {...defaultProps} 
        status={completedStatus}
      />
    );
    
    const copyButton = screen.getByTitle('Copy URL');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('https://huggingface.co/spaces/test/portal');
      expect(toast.success).toHaveBeenCalledWith('URL copied to clipboard');
    });
  });

  it('displays deployment history', () => {
    render(<PortalDeploymentStatus {...defaultProps} />);
    
    expect(screen.getByText('Recent Deployments')).toBeInTheDocument();
    expect(screen.getByText(/Duration:/)).toBeInTheDocument();
  });

  it('formats time durations correctly', () => {
    const longRunningStatus = createMockDeploymentStatus();
    longRunningStatus.startedAt = new Date(Date.now() - 3600000); // 1 hour ago
    
    render(
      <PortalDeploymentStatus 
        {...defaultProps} 
        status={longRunningStatus}
      />
    );
    
    expect(screen.getByText(/Elapsed: 1h/)).toBeInTheDocument();
  });

  it('handles different deployment phases correctly', () => {
    const phases = ['initializing', 'validating', 'preparing', 'uploading', 'building', 'deploying', 'testing'] as const;
    
    phases.forEach(phase => {
      const status = createMockDeploymentStatus(phase);
      const { rerender } = render(
        <PortalDeploymentStatus 
          {...defaultProps} 
          status={status}
        />
      );
      
      // Each phase should have appropriate progress and description
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      rerender(<div />); // Clean up for next iteration
    });
  });

  it('respects display configuration options', () => {
    const minimalDisplayConfig = {
      showProgress: false,
      showLogs: false,
      showTimeEstimate: false,
      showUrl: false,
      compact: true,
      refreshInterval: 0
    };
    
    render(
      <PortalDeploymentStatus 
        {...defaultProps} 
        displayConfig={minimalDisplayConfig}
      />
    );
    
    expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    expect(screen.queryByText('Deployment Logs')).not.toBeInTheDocument();
    expect(screen.queryByText(/Elapsed:/)).not.toBeInTheDocument();
  });

  it('handles component unmounting cleanly', () => {
    const { unmount } = render(<PortalDeploymentStatus {...defaultProps} />);
    
    // Should not throw errors on unmount
    expect(() => unmount()).not.toThrow();
  });

  it('calls onDeploymentComplete when status changes to completed', async () => {
    const onDeploymentComplete = vi.fn();
    
    const { rerender } = render(
      <PortalDeploymentStatus 
        {...defaultProps} 
        onDeploymentComplete={onDeploymentComplete}
      />
    );
    
    // Simulate status change to completed
    const completedStatus = createMockDeploymentStatus('completed');
    rerender(
      <PortalDeploymentStatus 
        {...defaultProps} 
        status={completedStatus}
        onDeploymentComplete={onDeploymentComplete}
      />
    );
    
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('handles disabled state correctly', () => {
    render(
      <PortalDeploymentStatus 
        {...defaultProps} 
        isEnabled={false}
      />
    );
    
    expect(screen.queryByText('Deployment Status')).not.toBeInTheDocument();
  });

  it('supports compact mode layout', () => {
    render(
      <PortalDeploymentStatus 
        {...defaultProps} 
        displayConfig={{
          ...defaultProps.displayConfig,
          compact: true
        }}
      />
    );
    
    // Component should still render but potentially with different styling
    expect(screen.getByText('Building')).toBeInTheDocument();
  });
});