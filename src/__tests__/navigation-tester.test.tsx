/**
 * Navigation Tester Component Test
 * Tests the development navigation testing tool
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavigationTester } from '../components/dev/NavigationTester';

// Mock React Router navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock navigation utilities
vi.mock('../utils/robustNavigation', () => ({
  robustNavigation: {
    navigateToPreview: vi.fn().mockResolvedValue(true),
    validateRoute: vi.fn().mockReturnValue(true),
    emergencyNavigate: vi.fn()
  }
}));

vi.mock('../utils/navigationDebugger', () => ({
  navigationDebugger: {
    printReport: vi.fn(),
    clearLogs: vi.fn()
  }
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/analysis/test-job-123'
  },
  writable: true
});

describe('NavigationTester Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with all testing functionality', () => {
    render(
      <BrowserRouter>
        <NavigationTester jobId="test-job-123" />
      </BrowserRouter>
    );

    // Check for main interface elements
    expect(screen.getByText('🧪 Navigation Tester')).toBeInTheDocument();
    expect(screen.getByText('test-job-123')).toBeInTheDocument();
    expect(screen.getByText('Current Path:')).toBeInTheDocument();
    
    // Check for test buttons
    expect(screen.getByText('Test Direct Nav')).toBeInTheDocument();
    expect(screen.getByText('Test Robust Nav')).toBeInTheDocument();
    expect(screen.getByText('Validate Route')).toBeInTheDocument();
    expect(screen.getByText('Emergency Nav')).toBeInTheDocument();
    
    // Check for debug buttons
    expect(screen.getByText('Show Debug Report')).toBeInTheDocument();
    expect(screen.getByText('Clear Debug Logs')).toBeInTheDocument();
  });

  it('should handle direct navigation test', async () => {
    render(
      <BrowserRouter>
        <NavigationTester jobId="test-job-123" />
      </BrowserRouter>
    );

    const directNavButton = screen.getByText('Test Direct Nav');
    fireEvent.click(directNavButton);

    // Should show testing state
    expect(screen.getByText('Testing navigation...')).toBeInTheDocument();
    
    // Wait for test completion
    await waitFor(() => {
      expect(screen.queryByText('Testing navigation...')).not.toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Should show test result
    expect(screen.getByText(/Direct navigation:/)).toBeInTheDocument();
  });

  it('should handle route validation', () => {
    render(
      <BrowserRouter>
        <NavigationTester jobId="test-job-123" />
      </BrowserRouter>
    );

    const validateButton = screen.getByText('Validate Route');
    fireEvent.click(validateButton);
    
    // Should show validation result
    expect(screen.getByText(/Route validation:/)).toBeInTheDocument();
  });

  it('should handle debug operations', async () => {
    render(
      <BrowserRouter>
        <NavigationTester jobId="test-job-123" />
      </BrowserRouter>
    );

    // Test debug report
    const debugButton = screen.getByText('Show Debug Report');
    fireEvent.click(debugButton);
    
    expect(screen.getByText('Debug report printed to console')).toBeInTheDocument();

    // Test clear logs
    const clearButton = screen.getByText('Clear Debug Logs');
    fireEvent.click(clearButton);
    
    expect(screen.getByText('Debug logs cleared')).toBeInTheDocument();
  });

  it('should handle emergency navigation', () => {
    render(
      <BrowserRouter>
        <NavigationTester jobId="test-job-123" />
      </BrowserRouter>
    );

    const emergencyButton = screen.getByText('Emergency Nav');
    fireEvent.click(emergencyButton);
    
    expect(screen.getByText('Emergency navigation initiated')).toBeInTheDocument();
  });

  it('should disable buttons during navigation testing', async () => {
    render(
      <BrowserRouter>
        <NavigationTester jobId="test-job-123" />
      </BrowserRouter>
    );

    const directNavButton = screen.getByText('Test Direct Nav');
    const robustNavButton = screen.getByText('Test Robust Nav');
    
    fireEvent.click(directNavButton);
    
    // Buttons should be disabled during testing
    expect(directNavButton).toBeDisabled();
    expect(robustNavButton).toBeDisabled();
  });

  it('should display current path correctly', () => {
    render(
      <BrowserRouter>
        <NavigationTester jobId="test-job-123" />
      </BrowserRouter>
    );

    // Should show the mocked current path
    expect(screen.getByText('/analysis/test-job-123')).toBeInTheDocument();
  });

  it('should support custom job IDs', () => {
    render(
      <BrowserRouter>
        <NavigationTester jobId="custom-job-456" />
      </BrowserRouter>
    );

    expect(screen.getByText('custom-job-456')).toBeInTheDocument();
  });

  it('should use default job ID when none provided', () => {
    render(
      <BrowserRouter>
        <NavigationTester />
      </BrowserRouter>
    );

    expect(screen.getByText('test-job-123')).toBeInTheDocument();
  });
});
