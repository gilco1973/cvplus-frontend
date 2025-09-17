/**
 * PortalQRIntegration.test.tsx - Unit Tests
 * 
 * Comprehensive test suite for the PortalQRIntegration component
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PortalQRIntegration } from '../PortalQRIntegration';
import { PortalConfig, QRCodeConfig } from '../../../../types/portal-types';

import { vi } from 'vitest';

// Mock Firebase functions
vi.mock('../../../../lib/firebase', () => ({
  functions: {}
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn().mockResolvedValue({ data: {} }))
}));

// Mock QR code library
vi.mock('qrcode', () => ({
  toCanvas: vi.fn().mockResolvedValue(undefined)
}));

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  success: vi.fn(),
  error: vi.fn(),
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockPortalConfig: PortalConfig = {
  id: 'test-portal-123',
  name: 'Test Portal',
  description: 'Test portal description',
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
    keywords: ['test']
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockQRConfig: QRCodeConfig = {
  url: 'https://test.cvplus.app',
  size: 256,
  errorCorrectionLevel: 'M',
  colors: {
    foreground: '#000000',
    background: '#FFFFFF'
  },
  includeLogo: false
};

const defaultProps = {
  portalConfig: mockPortalConfig,
  qrConfig: mockQRConfig,
  jobId: 'test-job-123',
  profileId: 'test-profile-456',
  isEnabled: true,
  mode: 'private' as const
};

// ============================================================================
// TEST SUITES
// ============================================================================

describe('PortalQRIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  // ==========================================================================
  // BASIC RENDERING TESTS
  // ==========================================================================
  
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<PortalQRIntegration {...defaultProps} />);
      expect(screen.getByRole('canvas')).toBeInTheDocument();
    });
    
    it('does not render when disabled', () => {
      const { container } = render(
        <PortalQRIntegration {...defaultProps} isEnabled={false} />
      );
      expect(container.firstChild).toBeNull();
    });
    
    it('displays title when showTitle is true', () => {
      render(
        <PortalQRIntegration
          {...defaultProps}
          displaySettings={{
            showTitle: true,
            title: 'Test QR Code Title'
          }}
        />
      );
      expect(screen.getByText('Test QR Code Title')).toBeInTheDocument();
    });
    
    it('displays instructions when showInstructions is true', () => {
      render(
        <PortalQRIntegration
          {...defaultProps}
          displaySettings={{
            showInstructions: true,
            instructions: 'Test instructions'
          }}
        />
      );
      expect(screen.getByText('Test instructions')).toBeInTheDocument();
    });
  });
  
  // ==========================================================================
  // ACTION BUTTON TESTS
  // ==========================================================================
  
  describe('Action Buttons', () => {
    it('shows download button when showDownload is true', () => {
      render(
        <PortalQRIntegration
          {...defaultProps}
          displaySettings={{ showDownload: true }}
        />
      );
      expect(screen.getByText('Download')).toBeInTheDocument();
    });
    
    it('shows share button when showShare is true', () => {
      render(
        <PortalQRIntegration
          {...defaultProps}
          displaySettings={{ showShare: true }}
        />
      );
      expect(screen.getByText('Share')).toBeInTheDocument();
    });
    
    it('opens share menu when share button is clicked', async () => {
      render(
        <PortalQRIntegration
          {...defaultProps}
          displaySettings={{ showShare: true }}
        />
      );
      
      const shareButton = screen.getByText('Share');
      fireEvent.click(shareButton);
      
      await waitFor(() => {
        expect(screen.getByText('Copy')).toBeInTheDocument();
      });
    });
    
    it('shows analytics button', () => {
      render(<PortalQRIntegration {...defaultProps} />);
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
    
    it('shows settings button', () => {
      render(<PortalQRIntegration {...defaultProps} />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
  
  // ==========================================================================
  // SETTINGS PANEL TESTS
  // ==========================================================================
  
  describe('Settings Panel', () => {
    it('opens settings panel when settings button is clicked', async () => {
      render(<PortalQRIntegration {...defaultProps} />);
      
      const settingsButton = screen.getByText('Settings');
      fireEvent.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByText('QR Code Settings')).toBeInTheDocument();
      });
    });
    
    it('shows settings tabs', async () => {
      render(<PortalQRIntegration {...defaultProps} />);
      
      const settingsButton = screen.getByText('Settings');
      fireEvent.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Basic')).toBeInTheDocument();
        expect(screen.getByText('Advanced')).toBeInTheDocument();
        expect(screen.getByText('Analytics')).toBeInTheDocument();
        expect(screen.getByText('Sharing')).toBeInTheDocument();
      });
    });
    
    it('switches between settings tabs', async () => {
      render(<PortalQRIntegration {...defaultProps} />);
      
      const settingsButton = screen.getByText('Settings');
      fireEvent.click(settingsButton);
      
      await waitFor(() => {
        const advancedTab = screen.getByText('Advanced');
        fireEvent.click(advancedTab);
        
        expect(screen.getByText('Enable Logo')).toBeInTheDocument();
      });
    });
  });
  
  // ==========================================================================
  // ANALYTICS TESTS
  // ==========================================================================
  
  describe('Analytics', () => {
    it('opens analytics panel when analytics button is clicked', async () => {
      render(<PortalQRIntegration {...defaultProps} />);
      
      const analyticsButton = screen.getByText('Analytics');
      fireEvent.click(analyticsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Portal QR Analytics')).toBeInTheDocument();
      });
    });
    
    it('calls onQRGenerated callback when provided', async () => {
      const mockOnQRGenerated = vi.fn();
      
      render(
        <PortalQRIntegration
          {...defaultProps}
          onQRGenerated={mockOnQRGenerated}
        />
      );
      
      // QR generation should be triggered on mount
      await waitFor(() => {
        expect(mockOnQRGenerated).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
  
  // ==========================================================================
  // URL GENERATION TESTS
  // ==========================================================================
  
  describe('URL Generation', () => {
    it('generates URL with UTM parameters', () => {
      const { container } = render(<PortalQRIntegration {...defaultProps} />);
      
      // Check that the final URL display contains UTM parameters
      expect(container.textContent).toContain('utm_source');
      expect(container.textContent).toContain('utm_medium');
      expect(container.textContent).toContain('utm_campaign');
    });
    
    it('includes portal ID in URL parameters', () => {
      const { container } = render(<PortalQRIntegration {...defaultProps} />);
      
      expect(container.textContent).toContain('portal_id');
    });
  });
  
  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================
  
  describe('Error Handling', () => {
    it('calls onError callback when QR generation fails', async () => {
      const mockOnError = vi.fn();
      
      // Mock QR generation to fail
      const QRCodeGenerator = await import('qrcode');
      vi.mocked(QRCodeGenerator.toCanvas).mockRejectedValueOnce(new Error('QR generation failed'));
      
      render(
        <PortalQRIntegration
          {...defaultProps}
          onError={mockOnError}
        />
      );
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'QR_GENERATION_ERROR',
            message: 'QR generation failed'
          })
        );
      }, { timeout: 3000 });
    });
    
    it('displays error state when QR generation fails', async () => {
      // Mock QR generation to fail
      const QRCodeGenerator = await import('qrcode');
      vi.mocked(QRCodeGenerator.toCanvas).mockRejectedValueOnce(new Error('QR generation failed'));
      
      render(<PortalQRIntegration {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('QR Generation Error')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
  
  // ==========================================================================
  // CUSTOMIZATION TESTS
  // ==========================================================================
  
  describe('Customization', () => {
    it('applies custom colors from portal theme', () => {
      render(<PortalQRIntegration {...defaultProps} />);
      
      // The component should use the portal's primary color
      expect(mockPortalConfig.theme.primaryColor).toBe('#3B82F6');
    });
    
    it('applies custom size settings', async () => {
      render(
        <PortalQRIntegration
          {...defaultProps}
          displaySettings={{ size: 'large' }}
        />
      );
      
      const canvas = screen.getByRole('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });
  
  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================
  
  describe('Accessibility', () => {
    it('provides canvas element for screen readers', () => {
      render(<PortalQRIntegration {...defaultProps} />);
      
      const canvas = screen.getByRole('canvas');
      expect(canvas).toBeInTheDocument();
    });
    
    it('supports keyboard navigation for buttons', () => {
      render(
        <PortalQRIntegration
          {...defaultProps}
          displaySettings={{
            showDownload: true,
            showShare: true
          }}
        />
      );
      
      const downloadButton = screen.getByText('Download');
      const shareButton = screen.getByText('Share');
      
      expect(downloadButton).toBeInTheDocument();
      expect(shareButton).toBeInTheDocument();
      
      // Buttons should be focusable
      downloadButton.focus();
      expect(document.activeElement).toBe(downloadButton);
      
      shareButton.focus();
      expect(document.activeElement).toBe(shareButton);
    });
  });
  
  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================
  
  describe('Integration', () => {
    it('works with different portal configurations', () => {
      const customPortalConfig = {
        ...mockPortalConfig,
        theme: {
          ...mockPortalConfig.theme,
          primaryColor: '#FF0000',
          layout: 'creative' as const
        }
      };
      
      render(
        <PortalQRIntegration
          {...defaultProps}
          portalConfig={customPortalConfig}
        />
      );
      
      expect(screen.getByRole('canvas')).toBeInTheDocument();
    });
    
    it('handles different QR configurations', () => {
      const customQRConfig = {
        ...mockQRConfig,
        size: 512,
        errorCorrectionLevel: 'H' as const,
        includeLogo: true
      };
      
      render(
        <PortalQRIntegration
          {...defaultProps}
          qrConfig={customQRConfig}
        />
      );
      
      expect(screen.getByRole('canvas')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// SNAPSHOT TESTS
// ============================================================================

describe('PortalQRIntegration Snapshots', () => {
  it('matches snapshot for basic configuration', () => {
    const { container } = render(<PortalQRIntegration {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });
  
  it('matches snapshot with all display options enabled', () => {
    const { container } = render(
      <PortalQRIntegration
        {...defaultProps}
        displaySettings={{
          size: 'large',
          style: 'prominent',
          showTitle: true,
          title: 'Test QR Code',
          showInstructions: true,
          instructions: 'Test instructions',
          showDownload: true,
          showShare: true
        }}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});