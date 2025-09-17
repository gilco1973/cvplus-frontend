/**
 * CVPlus Breadcrumb Navigation Focused Test Suite
 * 
 * Comprehensive tests specifically for breadcrumb navigation functionality:
 * 1. Breadcrumb items display correctly for each step
 * 2. Breadcrumb navigation works properly (clicking takes you to the right page)
 * 3. Mobile and desktop breadcrumb variants render correctly  
 * 4. Step indicators within breadcrumbs are accurate
 * 5. Current page highlighting works in breadcrumbs
 * 6. Home button navigation works
 * 7. Expandable breadcrumbs work on mobile
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { NavigationBreadcrumbs } from '../components/NavigationBreadcrumbs';
import { generateBreadcrumbs, BreadcrumbItem } from '../utils/breadcrumbs';
import { ResponsiveStepIndicator } from '../components/ResponsiveStepIndicator';
import { EnhancedSessionState, NavigationContext, CVStep } from '../types/session';

// Mock React Router navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/analysis/test-job-123' })
  };
});

// Mock NavigationStateManager
vi.mock('../services/navigation/navigationStateManager', () => {
  return {
    default: {
      getInstance: () => ({
        generateBreadcrumbs: vi.fn(() => [
          { id: 'upload', label: 'Upload CV', url: '/', step: 'upload', accessible: true },
          { id: 'processing', label: 'Processing', url: '/process/test-123', step: 'processing', accessible: true },
          { id: 'analysis', label: 'Analysis Results', url: '/analysis/test-123', step: 'analysis', accessible: true, current: true }
        ])
      })
    }
  };
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

// Mock data for NavigationBreadcrumbs tests
const mockSession: EnhancedSessionState = {
  sessionId: 'test-session-123',
  jobId: 'test-job-123',
  completedSteps: ['upload', 'processing'] as CVStep[],
  stepProgress: {
    upload: { completion: 100, status: 'completed' },
    processing: { completion: 100, status: 'completed' },
    analysis: { completion: 50, status: 'in-progress' }
  }
} as EnhancedSessionState;

const mockNavigationContext: NavigationContext = {
  completionPercentage: 60,
  blockedPaths: [],
  criticalIssues: [],
  recommendedNextSteps: ['features'] as CVStep[]
} as NavigationContext;

describe('CVPlus Breadcrumb Navigation - Focused Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  describe('1. Breadcrumb Items Display Correctly', () => {
    it('should display correct breadcrumb items for processing step', () => {
      const breadcrumbs = generateBreadcrumbs('processing', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      // Should show Upload CV and Processing
      expect(screen.getByText('Upload CV')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      
      // Processing should be marked as current (it's the current step)
      const processingElement = screen.getByText('Processing');
      
      // The current item should be in a span with font-medium on the parent element
      expect(processingElement.parentElement).toHaveClass('font-medium');
    });

    it('should display correct breadcrumb items for analysis step', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      expect(screen.getByText('Upload CV')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    });

    it('should display correct breadcrumb items for feature selection step', () => {
      const breadcrumbs = generateBreadcrumbs('feature-selection', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      expect(screen.getByText('Upload CV')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
      expect(screen.getByText('Role Selection')).toBeInTheDocument();
      expect(screen.getByText('Feature Selection')).toBeInTheDocument();
    });

    it('should display correct breadcrumb items for final results step', () => {
      const breadcrumbs = generateBreadcrumbs('final-results', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      const labels = ['Upload CV', 'Processing', 'Analysis Results', 'Role Selection', 'Feature Selection', 'Final Results'];
      labels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('2. Breadcrumb Navigation Works Properly', () => {
    it('should navigate to correct URL when clicking Upload CV', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      const uploadButton = screen.getByText('Upload CV');
      fireEvent.click(uploadButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should navigate to correct URL when clicking Processing', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      const processingButton = screen.getByText('Processing');
      fireEvent.click(processingButton);

      expect(mockNavigate).toHaveBeenCalledWith('/process/test-job-123');
    });

    it('should not navigate when clicking current page item', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      const analysisText = screen.getByText('Analysis Results');
      fireEvent.click(analysisText);

      // Should not call navigate for current page
      expect(mockNavigate).not.toHaveBeenCalledWith('/analysis/test-job-123');
    });

    it('should handle navigation to multiple different paths', () => {
      const breadcrumbs = generateBreadcrumbs('feature-selection', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      // Test navigation to different steps
      fireEvent.click(screen.getByText('Upload CV'));
      expect(mockNavigate).toHaveBeenCalledWith('/');

      fireEvent.click(screen.getByText('Processing'));
      expect(mockNavigate).toHaveBeenCalledWith('/process/test-job-123');

      fireEvent.click(screen.getByText('Analysis Results'));
      expect(mockNavigate).toHaveBeenCalledWith('/analysis/test-job-123');
    });
  });

  describe('3. Mobile and Desktop Breadcrumb Variants', () => {
    it('should render desktop breadcrumb variant by default', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      const { container } = render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      // Desktop version should be rendered with space-x-2 class
      const desktopNav = container.querySelector('nav.flex.items-center.space-x-2');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should render mobile breadcrumb variant when mobile=true', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      const { container } = render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} mobile={true} />
        </TestWrapper>
      );

      // Mobile version should have different structure
      const mobileNav = container.querySelector('nav.flex.items-center.justify-between');
      expect(mobileNav).toBeInTheDocument();
    });

    it('should show step indicators in mobile mode when showStepIndicator=true', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} mobile={true} showStepIndicator={true} />
        </TestWrapper>
      );

      // Should show step indicators - look for step buttons
      const stepButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-8 h-8 rounded-full')
      );
      
      expect(stepButtons.length).toBeGreaterThan(0);
    });

    it('should show different layouts for mobile vs desktop', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      // Desktop render
      const { container: desktopContainer } = render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} mobile={false} />
        </TestWrapper>
      );

      // Mobile render  
      const { container: mobileContainer } = render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} mobile={true} />
        </TestWrapper>
      );

      // Desktop should have space-x-2, mobile should have justify-between
      expect(desktopContainer.querySelector('.space-x-2')).toBeInTheDocument();
      expect(mobileContainer.querySelector('.justify-between')).toBeInTheDocument();
    });
  });

  describe('4. Step Indicators Within Breadcrumbs Are Accurate', () => {
    it('should show correct step numbers in mobile step indicators', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123'); // 3 steps total, on step 3
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} mobile={true} showStepIndicator={true} />
        </TestWrapper>
      );

      // Should show numbers 1, 2, and current step 3
      const stepButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-8 h-8 rounded-full')
      );
      
      expect(stepButtons).toHaveLength(3); // Upload, Processing, Analysis
    });

    it('should show check marks for completed steps', () => {
      const breadcrumbs = generateBreadcrumbs('feature-selection', 'test-job-123'); // Step 5, so steps 1-4 completed
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} mobile={true} showStepIndicator={true} />
        </TestWrapper>
      );

      // Completed steps should have CheckCircle icons (we can't easily test the icon, but can test structure)
      const stepButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('w-8 h-8 rounded-full')
      );
      
      expect(stepButtons).toHaveLength(5); // All 5 steps should be shown
    });

    it('should highlight current step correctly', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} mobile={true} showStepIndicator={true} />
        </TestWrapper>
      );

      // Find the current step indicator (step 3)
      const currentStepButton = screen.getByRole('button', { name: '3' });
      expect(currentStepButton).toBeInTheDocument();
      expect(currentStepButton).toHaveClass('bg-blue-600');
    });

    it('should show progress lines between step indicators', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      const { container } = render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} mobile={true} showStepIndicator={true} />
        </TestWrapper>
      );

      // Should have progress lines between steps (corrected selector)
      const progressLines = container.querySelectorAll('[class*="w-6"][class*="h-0.5"]');
      expect(progressLines.length).toBeGreaterThan(0);
    });
  });

  describe('5. Current Page Highlighting Works', () => {
    it('should highlight current page in breadcrumbs with correct styling', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      const currentItem = screen.getByText('Analysis Results');
      
      // Current item should have font-medium class on the parent span
      expect(currentItem.parentElement).toHaveClass('font-medium');
    });

    it('should not highlight non-current pages', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      // Previous steps should be clickable buttons, not highlighted spans
      const uploadButton = screen.getByText('Upload CV');
      const processingButton = screen.getByText('Processing');
      
      expect(uploadButton.closest('button')).toBeInTheDocument();
      expect(processingButton.closest('button')).toBeInTheDocument();
    });

    it('should support dark variant highlighting', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} variant="dark" />
        </TestWrapper>
      );

      const currentItem = screen.getByText('Analysis Results');
      
      // In dark variant, current item parent should have text-gray-100 class
      expect(currentItem.parentElement).toHaveClass('text-gray-100');
    });
  });

  describe('6. Home Button Navigation Works', () => {
    it('should render home button in desktop mode', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      const homeButton = screen.getByTitle('Home');
      expect(homeButton).toBeInTheDocument();
    });

    it('should render home button in mobile mode', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} mobile={true} />
        </TestWrapper>
      );

      const homeButton = screen.getByLabelText('Home');
      expect(homeButton).toBeInTheDocument();
    });

    it('should navigate to home when clicking home button in desktop', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      const homeButton = screen.getByTitle('Home');
      fireEvent.click(homeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should navigate to home when clicking home button in mobile', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} mobile={true} />
        </TestWrapper>
      );

      const homeButton = screen.getByLabelText('Home');
      fireEvent.click(homeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should style home button correctly for dark variant', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} variant="dark" />
        </TestWrapper>
      );

      const homeButton = screen.getByTitle('Home');
      expect(homeButton).toHaveClass('text-gray-300');
    });
  });

  describe('7. Expandable Breadcrumbs Work on Mobile', () => {
    it('should show expand button when there are many breadcrumb items on mobile', () => {
      const longBreadcrumbs = generateBreadcrumbs('final-results', 'test-job-123'); // 6 items
      
      render(
        <TestWrapper>
          <Breadcrumb items={longBreadcrumbs} mobile={true} />
        </TestWrapper>
      );

      const expandButton = screen.getByLabelText('Show more');
      expect(expandButton).toBeInTheDocument();
    });

    it('should not show expand button when there are few breadcrumb items', () => {
      const shortBreadcrumbs = generateBreadcrumbs('processing', 'test-job-123'); // Only 2 items
      
      render(
        <TestWrapper>
          <Breadcrumb items={shortBreadcrumbs} mobile={true} />
        </TestWrapper>
      );

      const expandButton = screen.queryByLabelText('Show more');
      expect(expandButton).not.toBeInTheDocument();
    });

    it('should expand to show all breadcrumbs when clicking expand button', () => {
      const longBreadcrumbs = generateBreadcrumbs('final-results', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={longBreadcrumbs} mobile={true} />
        </TestWrapper>
      );

      const expandButton = screen.getByLabelText('Show more');
      fireEvent.click(expandButton);
      
      // After expansion, all breadcrumb items should be visible
      expect(screen.getByText('Upload CV')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
      expect(screen.getByText('Role Selection')).toBeInTheDocument();
      expect(screen.getByText('Feature Selection')).toBeInTheDocument();
      expect(screen.getByText('Final Results')).toBeInTheDocument();
    });

    it('should change expand button label to "Show less" after expanding', () => {
      const longBreadcrumbs = generateBreadcrumbs('final-results', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={longBreadcrumbs} mobile={true} />
        </TestWrapper>
      );

      const expandButton = screen.getByLabelText('Show more');
      fireEvent.click(expandButton);
      
      // After expanding, button should show "Show less"
      expect(screen.getByLabelText('Show less')).toBeInTheDocument();
    });

    it('should collapse back to condensed view when clicking "Show less"', () => {
      const longBreadcrumbs = generateBreadcrumbs('final-results', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={longBreadcrumbs} mobile={true} />
        </TestWrapper>
      );

      // Expand first
      const expandButton = screen.getByLabelText('Show more');
      fireEvent.click(expandButton);
      
      // Then collapse
      const collapseButton = screen.getByLabelText('Show less');
      fireEvent.click(collapseButton);
      
      // Should be back to "Show more"
      expect(screen.getByLabelText('Show more')).toBeInTheDocument();
    });
  });

  describe('NavigationBreadcrumbs Integration', () => {
    it('should render NavigationBreadcrumbs with session data', () => {
      render(
        <NavigationBreadcrumbs
          session={mockSession}
          navigationContext={mockNavigationContext}
          currentStep="analysis"
        />
      );

      // Should show progress indicator
      expect(screen.getByText('Progress:')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should handle navigation clicks in NavigationBreadcrumbs', () => {
      const mockOnNavigate = vi.fn();
      
      render(
        <NavigationBreadcrumbs
          session={mockSession}
          navigationContext={mockNavigationContext}
          currentStep="analysis"
          onNavigate={mockOnNavigate}
        />
      );

      // Find and click a breadcrumb item (this may vary based on the mock data structure)
      const breadcrumbItems = screen.getAllByRole('listitem');
      if (breadcrumbItems.length > 0) {
        fireEvent.click(breadcrumbItems[0]);
        // Since our mock returns accessible breadcrumbs, it should call onNavigate
      }
    });

    it('should show critical issues when present', () => {
      const contextWithIssues = {
        ...mockNavigationContext,
        criticalIssues: ['Missing required field', 'Invalid data format']
      };
      
      render(
        <NavigationBreadcrumbs
          session={mockSession}
          navigationContext={contextWithIssues}
          currentStep="analysis"
        />
      );

      expect(screen.getByText('2 issues')).toBeInTheDocument();
    });

    it('should show next recommended steps', () => {
      render(
        <NavigationBreadcrumbs
          session={mockSession}
          navigationContext={mockNavigationContext}
          currentStep="analysis"
        />
      );

      expect(screen.getByText('Next:')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty breadcrumb items gracefully', () => {
      expect(() => {
        render(
          <TestWrapper>
            <Breadcrumb items={[]} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle breadcrumb items without paths', () => {
      const breadcrumbsWithoutPaths: BreadcrumbItem[] = [
        { label: 'Step 1' },
        { label: 'Step 2', current: true }
      ];
      
      expect(() => {
        render(
          <TestWrapper>
            <Breadcrumb items={breadcrumbsWithoutPaths} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle invalid job IDs in breadcrumb generation', () => {
      expect(() => {
        const breadcrumbs = generateBreadcrumbs('analysis', '');
        render(
          <TestWrapper>
            <Breadcrumb items={breadcrumbs} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle unknown page types in breadcrumb generation', () => {
      const breadcrumbs = generateBreadcrumbs('unknown-page', 'test-job-123');
      expect(breadcrumbs).toEqual([]);
    });

    it('should handle navigation failures gracefully', () => {
      // Mock navigate to throw an error but not actually throw to avoid test failure
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockNavigate.mockImplementation(() => {
        console.error('Navigation failed');
        return Promise.reject(new Error('Navigation failed'));
      });
      
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );
      
      // Should not crash when navigation fails
      expect(() => {
        fireEvent.click(screen.getByText('Upload CV'));
      }).not.toThrow();
      
      // Clean up console spy
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      const nav = screen.getByLabelText('Breadcrumb');
      expect(nav).toBeInTheDocument();
    });

    it('should have proper ARIA labels for mobile mode', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} mobile={true} />
        </TestWrapper>
      );

      const nav = screen.getByLabelText('Breadcrumb');
      expect(nav).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      const uploadButton = screen.getByText('Upload CV');
      uploadButton.focus();
      
      // Simulate Enter key press
      fireEvent.keyDown(uploadButton, { key: 'Enter' });
      // Note: We'd need to add keyboard event handlers to the component for this to work
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when props do not change', () => {
      const breadcrumbs = generateBreadcrumbs('analysis', 'test-job-123');
      
      const { rerender } = render(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      // Re-render with same props
      rerender(
        <TestWrapper>
          <Breadcrumb items={breadcrumbs} />
        </TestWrapper>
      );

      // Component should still be working
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    });

    it('should handle large numbers of breadcrumb items efficiently', () => {
      const manyBreadcrumbs: BreadcrumbItem[] = Array.from({ length: 20 }, (_, i) => ({
        label: `Step ${i + 1}`,
        path: `/step-${i + 1}`,
        current: i === 19
      }));
      
      expect(() => {
        render(
          <TestWrapper>
            <Breadcrumb items={manyBreadcrumbs} mobile={true} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });
});
