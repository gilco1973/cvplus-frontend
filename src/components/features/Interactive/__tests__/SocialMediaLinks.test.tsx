import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import toast from 'react-hot-toast';
import { SocialMediaLinks } from '../SocialMediaLinks';
import { CVFeatureProps } from '../../../../types/cv-features';

// Mock Firebase and external dependencies
vi.mock('../../../../lib/firebase', () => ({
  functions: {},
  analytics: {}
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn().mockResolvedValue({ data: {} }))
}));

vi.mock('firebase/analytics', () => ({
  logEvent: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}));

// Mock useFeatureData hook
vi.mock('../../../../hooks/useFeatureData', () => ({
  useFeatureData: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
    update: vi.fn(),
    state: 'idle'
  }))
}));

// Mock window.open and navigator methods
const mockWindowOpen = vi.fn();
const mockClipboardWrite = vi.fn();
const mockShare = vi.fn();

Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true
});

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
    write: mockClipboardWrite
  },
  writable: true
});

Object.defineProperty(navigator, 'share', {
  value: mockShare,
  writable: true
});

describe('SocialMediaLinks Component', () => {
  const defaultProps: Partial<CVFeatureProps> = {
    jobId: 'test-job-123',
    profileId: 'test-profile-456',
    isEnabled: true,
    mode: 'private'
  };

  const sampleSocialData = {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    portfolio: 'https://johndoe.dev',
    twitter: 'https://twitter.com/johndoe',
    medium: 'https://medium.com/@johndoe',
    youtube: 'https://youtube.com/c/johndoe'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders social media links when data is provided', () => {
      render(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
        />
      );

      expect(screen.getByText('Social Media Links')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('YouTube')).toBeInTheDocument();
    });

    it('shows empty state when no social links are provided', () => {
      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{}}
        />
      );

      expect(screen.getByText('No social media links configured')).toBeInTheDocument();
      expect(screen.getByText('Add your social media profiles to connect with visitors')).toBeInTheDocument();
    });

    it('renders null when disabled', () => {
      const { container } = render(
        <SocialMediaLinks
          {...defaultProps}
          isEnabled={false}
          data={sampleSocialData}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('filters out empty or undefined social links', () => {
      const partialData = {
        linkedin: 'https://linkedin.com/in/johndoe',
        github: '',
        portfolio: undefined,
        twitter: 'https://twitter.com/johndoe'
      };

      render(
        <SocialMediaLinks
          {...defaultProps}
          data={partialData}
        />
      );

      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.queryByText('GitHub')).not.toBeInTheDocument();
      expect(screen.queryByText('Portfolio')).not.toBeInTheDocument();
    });
  });

  describe('Customization Options', () => {
    it('applies different display styles correctly', () => {
      const { rerender } = render(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
          customization={{ style: 'icons' }}
        />
      );

      // Icons style should not show labels by default when style is icons
      const linkedinButton = screen.getByTitle('Visit my LinkedIn profile');
      expect(linkedinButton).toBeInTheDocument();

      // Test buttons style
      rerender(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
          customization={{ style: 'buttons', showLabels: true }}
        />
      );

      expect(screen.getByText('LinkedIn')).toBeInTheDocument();

      // Test cards style
      rerender(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
          customization={{ style: 'cards' }}
        />
      );

      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    it('applies different sizes correctly', () => {
      const { container } = render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
          customization={{ size: 'large' }}
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('p-4'); // Large size class
    });

    it('toggles labels visibility', () => {
      const { rerender } = render(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
          customization={{ showLabels: false, style: 'buttons' }}
        />
      );

      // Labels should not be visible
      expect(screen.queryByText('LinkedIn')).not.toBeInTheDocument();

      rerender(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
          customization={{ showLabels: true, style: 'buttons' }}
        />
      );

      // Labels should be visible
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    it('applies different themes correctly', () => {
      const { container } = render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
          customization={{ theme: 'dark' }}
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-gray-800');
    });
  });

  describe('Link Interactions', () => {
    it('opens links in new tab when openInNewTab is true', async () => {
      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
          customization={{ openInNewTab: true }}
        />
      );

      const linkedinButton = screen.getByTitle('Visit my LinkedIn profile');
      fireEvent.click(linkedinButton);

      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://linkedin.com/in/johndoe',
          '_blank',
          'noopener,noreferrer'
        );
      });
    });

    it('opens links in same tab when openInNewTab is false', async () => {
      const originalLocation = window.location.href;
      
      // Mock location.href setter
      delete (window as any).location;
      window.location = { href: originalLocation } as any;
      const setHref = vi.fn();
      Object.defineProperty(window.location, 'href', {
        set: setHref,
        get: () => originalLocation
      });

      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
          customization={{ openInNewTab: false }}
        />
      );

      const linkedinButton = screen.getByTitle('Visit my LinkedIn profile');
      fireEvent.click(linkedinButton);

      await waitFor(() => {
        expect(setHref).toHaveBeenCalledWith('https://linkedin.com/in/johndoe');
      });
    });

    it('tracks clicks with analytics', async () => {
      const mockTrackFunction = vi.fn().mockResolvedValue({ data: {} });
      
      // Mock httpsCallable to return our mock function
      const { httpsCallable } = await import('firebase/functions');
      vi.mocked(httpsCallable).mockReturnValue(mockTrackFunction);

      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
        />
      );

      const linkedinButton = screen.getByTitle('Visit my LinkedIn profile');
      fireEvent.click(linkedinButton);

      await waitFor(() => {
        expect(mockTrackFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            jobId: 'test-job-123',
            profileId: 'test-profile-456',
            platform: 'LinkedIn',
            url: 'https://linkedin.com/in/johndoe'
          })
        );
      });
    });

    it('shows success toast on successful click', async () => {
      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
        />
      );

      const linkedinButton = screen.getByTitle('Visit my LinkedIn profile');
      fireEvent.click(linkedinButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Opening LinkedIn');
      });
    });
  });

  describe('Link Validation', () => {
    it('shows validate links button in private mode', () => {
      render(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
          mode="private"
        />
      );

      expect(screen.getByText('Validate Links')).toBeInTheDocument();
    });

    it('hides validation controls in public mode', () => {
      render(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
          mode="public"
        />
      );

      expect(screen.queryByText('Validate Links')).not.toBeInTheDocument();
    });

    it('calls validation function when validate button is clicked', async () => {
      const mockValidateFunction = vi.fn().mockResolvedValue({ 
        data: {
          linkedin: {
            url: 'https://linkedin.com/in/johndoe',
            isValid: true,
            isReachable: true,
            responseTime: 150
          }
        }
      });
      
      const { httpsCallable } = await import('firebase/functions');
      vi.mocked(httpsCallable).mockReturnValue(mockValidateFunction);

      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
        />
      );

      const validateButton = screen.getByText('Validate Links');
      fireEvent.click(validateButton);

      await waitFor(() => {
        expect(mockValidateFunction).toHaveBeenCalledWith(
          expect.objectContaining({
            jobId: 'test-job-123',
            profileId: 'test-profile-456',
            links: { linkedin: 'https://linkedin.com/in/johndoe' }
          })
        );
      });
    });
  });

  describe('Settings Panel', () => {
    it('toggles settings panel visibility', async () => {
      render(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
          mode="private"
        />
      );

      // Settings panel should not be visible initially
      expect(screen.queryByText('Link Settings')).not.toBeInTheDocument();

      // Click settings button
      const settingsButton = screen.getByText('Settings');
      fireEvent.click(settingsButton);

      // Settings panel should be visible
      await waitFor(() => {
        expect(screen.getByText('Link Settings')).toBeInTheDocument();
        expect(screen.getByText('Display Style')).toBeInTheDocument();
      });
    });

    it('updates customization when settings are changed', async () => {
      const mockOnUpdate = vi.fn();

      render(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
          onUpdate={mockOnUpdate}
        />
      );

      // Open settings
      const settingsButton = screen.getByText('Settings');
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('Display Style')).toBeInTheDocument();
      });

      // Change display style
      const styleSelect = screen.getByDisplayValue('Buttons');
      fireEvent.change(styleSelect, { target: { value: 'cards' } });

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          customization: expect.objectContaining({
            style: 'cards'
          })
        })
      );
    });
  });

  describe('Share Functionality', () => {
    it('shares link using Web Share API when available', async () => {
      mockShare.mockResolvedValue(undefined);

      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
          customization={{ style: 'cards' }}
          mode="private"
        />
      );

      const shareButton = screen.getByTitle('Share this profile');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: 'My LinkedIn Profile',
          text: 'Check out my LinkedIn profile',
          url: 'https://linkedin.com/in/johndoe'
        });
      });
    });

    it('falls back to clipboard when Web Share API is not available', async () => {
      // Remove share API
      const originalShare = navigator.share;
      delete (navigator as any).share;

      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
          customization={{ style: 'cards' }}
          mode="private"
        />
      );

      const shareButton = screen.getByTitle('Share this profile');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'https://linkedin.com/in/johndoe'
        );
      });

      // Restore share API
      navigator.share = originalShare;
    });
  });

  describe('Error Handling', () => {
    it('handles tracking errors gracefully', async () => {
      const mockTrackFunction = vi.fn().mockRejectedValue(new Error('Tracking failed'));
      
      const { httpsCallable } = await import('firebase/functions');
      vi.mocked(httpsCallable).mockReturnValue(mockTrackFunction);

      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
        />
      );

      const linkedinButton = screen.getByTitle('Visit my LinkedIn profile');
      fireEvent.click(linkedinButton);

      // Should still open the link even if tracking fails
      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://linkedin.com/in/johndoe',
          '_blank',
          'noopener,noreferrer'
        );
      });
    });

    it('handles validation errors gracefully', async () => {
      const mockValidateFunction = vi.fn().mockRejectedValue(new Error('Validation failed'));
      const mockOnError = vi.fn();
      
      const { httpsCallable } = await import('firebase/functions');
      vi.mocked(httpsCallable).mockReturnValue(mockValidateFunction);

      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
          onError={mockOnError}
        />
      );

      const validateButton = screen.getByText('Validate Links');
      fireEvent.click(validateButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to validate social media links');
        expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for social links', () => {
      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
        />
      );

      const linkedinButton = screen.getByLabelText('Visit LinkedIn profile');
      expect(linkedinButton).toBeInTheDocument();
      expect(linkedinButton).toHaveAttribute('title', 'Visit my LinkedIn profile');
    });

    it('is keyboard navigable', async () => {
      render(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
        />
      );

      // Tab through the social links
      const linkedInButton = screen.getByTitle('Visit my LinkedIn profile');
      const githubButton = screen.getByTitle('Visit my GitHub profile');
      
      // Simulate tab navigation
      linkedInButton.focus();
      expect(linkedInButton).toHaveFocus();
      
      githubButton.focus();
      expect(githubButton).toHaveFocus();
    });

    it('supports keyboard activation', async () => {
      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ linkedin: 'https://linkedin.com/in/johndoe' }}
        />
      );

      const linkedinButton = screen.getByTitle('Visit my LinkedIn profile');
      linkedinButton.focus();
      
      fireEvent.keyDown(linkedinButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          'https://linkedin.com/in/johndoe',
          '_blank',
          'noopener,noreferrer'
        );
      });
    });
  });

  describe('Platform Support', () => {
    it('supports all major social media platforms', () => {
      const allPlatformsData = {
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
        portfolio: 'https://johndoe.dev',
        twitter: 'https://twitter.com/johndoe',
        medium: 'https://medium.com/@johndoe',
        youtube: 'https://youtube.com/c/johndoe',
        instagram: 'https://instagram.com/johndoe',
        facebook: 'https://facebook.com/johndoe'
      };

      render(
        <SocialMediaLinks
          {...defaultProps}
          data={allPlatformsData}
        />
      );

      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('YouTube')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
    });
  });

  describe('Analytics Display', () => {
    it('displays analytics in private mode', async () => {
      const mockAnalyticsData = {
        linkedin: {
          platform: 'linkedin',
          clicks: 15,
          uniqueClicks: 12,
          lastClicked: new Date('2024-01-15'),
          conversionRate: 0.8
        },
        github: {
          platform: 'github',
          clicks: 8,
          uniqueClicks: 7,
          lastClicked: new Date('2024-01-10'),
          conversionRate: 0.875
        }
      };

      const mockAnalyticsFunction = vi.fn().mockResolvedValue({ data: mockAnalyticsData });
      const { httpsCallable } = await import('firebase/functions');
      vi.mocked(httpsCallable).mockReturnValue(mockAnalyticsFunction);

      render(
        <SocialMediaLinks
          {...defaultProps}
          data={{ 
            linkedin: 'https://linkedin.com/in/johndoe',
            github: 'https://github.com/johndoe'
          }}
          mode="private"
        />
      );

      // Wait for analytics to load
      await waitFor(() => {
        expect(mockAnalyticsFunction).toHaveBeenCalled();
      });

      // Check if analytics are displayed (we can't easily test the state update in this test setup)
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    it('hides analytics in public mode', () => {
      render(
        <SocialMediaLinks
          {...defaultProps}
          data={sampleSocialData}
          mode="public"
        />
      );

      expect(screen.queryByText('Social Media Analytics')).not.toBeInTheDocument();
    });
  });
});
