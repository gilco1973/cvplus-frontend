import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExternalDataSources } from '../ExternalDataSources';
import { useFeatureAccess } from '../../hooks/usePremiumStatus';
import { useExternalData } from '../../hooks/useExternalData';
import toast from 'react-hot-toast';

import { vi } from 'vitest';

// Mock the dependencies
vi.mock('../../hooks/usePremiumStatus');
vi.mock('../../hooks/useExternalData');
vi.mock('react-hot-toast');

const mockUseFeatureAccess = useFeatureAccess as ReturnType<typeof vi.fn>;
const mockUseExternalData = useExternalData as ReturnType<typeof vi.fn>;
const mockToast = toast as { error: ReturnType<typeof vi.fn> };

describe('ExternalDataSources Premium Integration', () => {
  const defaultProps = {
    jobId: 'test-job-123',
    onDataEnriched: vi.fn(),
    onSkip: vi.fn()
  };

  const mockExternalDataHook = {
    sources: [
      { id: 'github', name: 'GitHub', enabled: false },
      { id: 'linkedin', name: 'LinkedIn', enabled: false }
    ],
    isLoading: false,
    isPrivacyAccepted: true,
    enrichedData: [],
    error: null,
    stats: { enabledSources: 0, totalItems: 0 },
    updateSource: vi.fn(),
    toggleSource: vi.fn(),
    fetchExternalData: vi.fn(),
    clearData: vi.fn(),
    setIsPrivacyAccepted: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseExternalData.mockReturnValue(mockExternalDataHook);
  });

  it('renders full functionality for premium users', () => {
    mockUseFeatureAccess.mockReturnValue({
      hasAccess: true,
      isPremium: true,
      isLoading: false
    });

    render(<ExternalDataSources {...defaultProps} />);

    expect(screen.getByText('Enrich Your CV with External Data')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fetch external data/i })).toBeInTheDocument();
  });

  it('shows premium gate for non-premium users', () => {
    mockUseFeatureAccess.mockReturnValue({
      hasAccess: false,
      isPremium: false,
      isLoading: false
    });

    render(<ExternalDataSources {...defaultProps} />);

    // Should show the preview with overlay
    expect(screen.getByText('Premium Feature')).toBeInTheDocument();
    expect(screen.getByText(/Import and sync data from LinkedIn, GitHub/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upgrade now/i })).toBeInTheDocument();
  });

  it('shows loading state while checking premium status', () => {
    mockUseFeatureAccess.mockReturnValue({
      hasAccess: false,
      isPremium: false,
      isLoading: true
    });

    render(<ExternalDataSources {...defaultProps} />);

    expect(screen.getByText('Checking premium status...')).toBeInTheDocument();
  });

  it('handles access denied with toast notification', async () => {
    mockUseFeatureAccess.mockReturnValue({
      hasAccess: false,
      isPremium: false,
      isLoading: false
    });

    render(<ExternalDataSources {...defaultProps} />);

    // Simulate clicking on the overlay (should trigger access denied)
    const overlayElement = screen.getByRole('button', { name: /premium feature locked/i });
    fireEvent.click(overlayElement);
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('External data sources are available with Premium access');
    });
  });

  it('maintains existing component interface and functionality', () => {
    mockUseFeatureAccess.mockReturnValue({
      hasAccess: true,
      isPremium: true,
      isLoading: false
    });

    const onDataEnriched = vi.fn();
    const onSkip = vi.fn();

    render(
      <ExternalDataSources 
        jobId="test-job"
        onDataEnriched={onDataEnriched}
        onSkip={onSkip}
        className="custom-class"
      />
    );

    // Verify all props are passed through correctly
    expect(mockUseExternalData).toHaveBeenCalledWith('test-job');
    
    // Check that skip button is rendered
    const skipButton = screen.getByRole('button', { name: /skip this step/i });
    expect(skipButton).toBeInTheDocument();
    
    fireEvent.click(skipButton);
    expect(onSkip).toHaveBeenCalled();
  });
});
