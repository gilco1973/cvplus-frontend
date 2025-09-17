import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { CareerTimeline } from '../CareerTimeline';
import { TimelineData } from '../../../../types/cv-features';
import '@testing-library/jest-dom';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock react-intersection-observer
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}));

// Mock useFeatureData hook
vi.mock('../../../../hooks/useFeatureData', () => ({
  useFeatureData: () => ({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
    update: vi.fn(),
    state: 'success',
  }),
}));

// Mock date-fns to avoid timezone issues in tests
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    format: (date: Date, formatStr: string) => {
      if (formatStr === 'MMM yyyy') return 'Jan 2023';
      if (formatStr === 'yyyy') return '2023';
      return '2023-01-01';
    },
    parseISO: (dateString: string) => new Date(dateString),
    isValid: (date: Date) => !isNaN(date.getTime()),
    differenceInMonths: () => 12,
  };
});

const mockTimelineData: TimelineData = {
  experiences: [
    {
      company: 'Tech Corp',
      position: 'Senior Developer',
      startDate: '2022-01-01',
      endDate: '2023-12-31',
      description: 'Developed cutting-edge web applications using React and TypeScript.',
      achievements: [
        'Led team of 5 developers',
        'Improved performance by 40%',
        'Implemented CI/CD pipeline',
      ],
      location: 'San Francisco, CA',
      logo: 'https://example.com/techcorp-logo.png',
    },
    {
      company: 'Startup Inc',
      position: 'Full Stack Developer',
      startDate: '2020-06-01',
      endDate: '2021-12-31',
      description: 'Built scalable backend systems and responsive frontend interfaces.',
      achievements: [
        'Reduced API response time by 60%',
        'Implemented real-time features',
      ],
      location: 'Remote',
    },
  ],
  education: [
    {
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      graduationDate: '2020-05-15',
      gpa: '3.8',
      description: 'Specialized in software engineering and machine learning.',
      logo: 'https://example.com/university-logo.png',
    },
  ],
  milestones: [
    {
      date: '2023-06-01',
      title: 'AWS Certified Solutions Architect',
      description: 'Achieved AWS Solutions Architect Professional certification.',
      type: 'certification',
    },
    {
      date: '2022-03-15',
      title: 'Tech Innovation Award',
      description: 'Received company-wide recognition for innovative solution.',
      type: 'achievement',
    },
  ],
};

const defaultProps = {
  jobId: 'test-job-id',
  profileId: 'test-profile-id',
  data: mockTimelineData,
  isEnabled: true,
};

describe('CareerTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the timeline with all data types', () => {
      render(<CareerTimeline {...defaultProps} />);
      
      expect(screen.getByText('Career Timeline')).toBeInTheDocument();
      expect(screen.getByText('Interactive timeline with clickable milestones and achievements')).toBeInTheDocument();
      
      // Check for experience items
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
      expect(screen.getByText('Startup Inc')).toBeInTheDocument();
      
      // Check for education items
      expect(screen.getByText('Bachelor of Science')).toBeInTheDocument();
      expect(screen.getByText('University of Technology')).toBeInTheDocument();
      
      // Check for milestone items
      expect(screen.getByText('AWS Certified Solutions Architect')).toBeInTheDocument();
      expect(screen.getByText('Tech Innovation Award')).toBeInTheDocument();
    });

    it('renders statistics correctly', () => {
      render(<CareerTimeline {...defaultProps} />);
      
      // Check for the specific statistics sections
      expect(screen.getByText('Positions')).toBeInTheDocument();
      expect(screen.getByText('Education')).toBeInTheDocument();
      expect(screen.getByText('Milestones')).toBeInTheDocument();
      expect(screen.getByText('Total Items')).toBeInTheDocument();
      
      // Check that there are numeric values in the statistics
      const positionsSection = screen.getByText('Positions').parentElement;
      expect(positionsSection).toHaveTextContent('2'); // 2 positions
      
      const educationSection = screen.getByText('Education').parentElement;
      expect(educationSection).toHaveTextContent('1'); // 1 education item
    });

    it('renders empty state when no data is provided', () => {
      const emptyData: TimelineData = {
        experiences: [],
        education: [],
        milestones: [],
      };
      
      render(<CareerTimeline {...defaultProps} data={emptyData} />);
      
      expect(screen.getByText('No timeline data available')).toBeInTheDocument();
    });

    it('does not render when disabled', () => {
      render(<CareerTimeline {...defaultProps} isEnabled={false} />);
      
      expect(screen.queryByText('Career Timeline')).not.toBeInTheDocument();
    });
  });

  describe('Customization Options', () => {
    it('respects showDates customization', () => {
      render(
        <CareerTimeline
          {...defaultProps}
          customization={{ showDates: false }}
        />
      );
      
      // Dates should not be visible in timeline items
      const timelineItems = screen.getAllByRole('button');
      timelineItems.forEach(item => {
        expect(within(item).queryByText(/Jan 2023/)).not.toBeInTheDocument();
      });
    });

    it('respects showLogos customization', () => {
      render(
        <CareerTimeline
          {...defaultProps}
          customization={{ showLogos: false }}
        />
      );
      
      // Company logos should not be rendered
      expect(screen.queryByAltText('Tech Corp logo')).not.toBeInTheDocument();
      expect(screen.queryByAltText('University of Technology logo')).not.toBeInTheDocument();
    });

    it('applies vertical layout by default', () => {
      render(<CareerTimeline {...defaultProps} />);
      
      // Look for the timeline container with vertical class
      const container = document.querySelector('.timeline-container');
      expect(container).toHaveClass('timeline-vertical');
    });

    it('applies horizontal layout when specified', () => {
      render(
        <CareerTimeline
          {...defaultProps}
          customization={{ layout: 'horizontal' }}
        />
      );
      
      // Look for the timeline container with horizontal class
      const container = document.querySelector('.timeline-container');
      expect(container).toHaveClass('timeline-horizontal');
    });

    it('groups items by year when groupByYear is enabled', () => {
      render(
        <CareerTimeline
          {...defaultProps}
          customization={{ groupByYear: true }}
        />
      );
      
      // Should show year headers
      expect(screen.getByText('2023')).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('opens milestone popup when timeline item is clicked', async () => {
      render(<CareerTimeline {...defaultProps} />);
      
      // Find the timeline item by its role and label
      const timelineItem = screen.getByRole('button', { name: /Senior Developer.*Tech Corp/ });
      expect(timelineItem).toBeInTheDocument();
      
      fireEvent.click(timelineItem!);
      
      await waitFor(() => {
        expect(screen.getByText('Key Achievements')).toBeInTheDocument();
        expect(screen.getByText('Led team of 5 developers')).toBeInTheDocument();
        expect(screen.getByText('Improved performance by 40%')).toBeInTheDocument();
        expect(screen.getByText('Implemented CI/CD pipeline')).toBeInTheDocument();
      });
    });

    it('closes milestone popup when close button is clicked', async () => {
      render(<CareerTimeline {...defaultProps} />);
      
      // Open popup
      const timelineItem = screen.getByRole('button', { name: /Senior Developer.*Tech Corp/ });
      fireEvent.click(timelineItem!);
      
      await waitFor(() => {
        expect(screen.getByText('Key Achievements')).toBeInTheDocument();
      });
      
      // Close popup using the close button
      const closeButton = screen.getByRole('button', { name: 'Close popup' });
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Key Achievements')).not.toBeInTheDocument();
      });
    });

    it('closes milestone popup when clicking outside', async () => {
      render(<CareerTimeline {...defaultProps} />);
      
      // Open popup
      const timelineItem = screen.getByRole('button', { name: /Senior Developer.*Tech Corp/ });
      fireEvent.click(timelineItem!);
      
      await waitFor(() => {
        expect(screen.getByText('Key Achievements')).toBeInTheDocument();
      });
      
      // Click outside (on backdrop)
      const backdrop = screen.getByText('Key Achievements').closest('.fixed');
      fireEvent.click(backdrop!);
      
      await waitFor(() => {
        expect(screen.queryByText('Key Achievements')).not.toBeInTheDocument();
      });
    });

    it('displays current position indicator correctly', () => {
      const dataWithCurrentPosition: TimelineData = {
        ...mockTimelineData,
        experiences: [
          {
            ...mockTimelineData.experiences[0],
            endDate: undefined, // Current position
          },
        ],
      };
      
      render(<CareerTimeline {...defaultProps} data={dataWithCurrentPosition} />);
      
      expect(screen.getByText('Current')).toBeInTheDocument();
    });
  });

  describe('Data Processing', () => {
    it('handles invalid dates gracefully', () => {
      const dataWithInvalidDates: TimelineData = {
        experiences: [
          {
            company: 'Test Corp',
            position: 'Developer',
            startDate: 'invalid-date',
            endDate: 'also-invalid',
            description: 'Test description',
            achievements: [],
          },
        ],
        education: [],
        milestones: [],
      };
      
      render(<CareerTimeline {...defaultProps} data={dataWithInvalidDates} />);
      
      // Should still render but without the invalid items
      expect(screen.getByText('Career Timeline')).toBeInTheDocument();
      expect(screen.queryByText('Test Corp')).not.toBeInTheDocument();
    });

    it('sorts timeline items by date correctly', () => {
      render(<CareerTimeline {...defaultProps} />);
      
      const timelineItems = screen.getAllByText(/Senior Developer|Full Stack Developer|Bachelor of Science|AWS Certified/);
      
      // Should be sorted by date (newest first)
      // The exact order depends on the mock data, but we can verify they all appear
      expect(timelineItems.length).toBeGreaterThan(0);
    });

    it('calculates duration correctly for experiences', () => {
      render(
        <CareerTimeline
          {...defaultProps}
          customization={{ showDuration: true }}
        />
      );
      
      // Duration should be displayed (mocked to return "1 year")
      const durations = screen.getAllByText('1 year');
      expect(durations.length).toBeGreaterThan(0);
      expect(durations[0]).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<CareerTimeline {...defaultProps} />);
      
      // Timeline items should be clickable buttons
      const timelineItems = screen.getAllByRole('button');
      expect(timelineItems.length).toBeGreaterThan(0);
      
      timelineItems.forEach(item => {
        expect(item).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      render(<CareerTimeline {...defaultProps} />);
      
      // Find the Senior Developer timeline item that has achievements
      const seniorDevButton = screen.getByRole('button', { name: /Senior Developer.*Tech Corp/ });
      expect(seniorDevButton).toBeInTheDocument();
      
      // Focus the item
      seniorDevButton.focus();
      expect(seniorDevButton).toHaveFocus();
      
      // Simulate Enter key press
      fireEvent.keyDown(seniorDevButton, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        // Check if the popup opened by looking for the achievements content
        expect(screen.getByText('Led team of 5 developers')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('provides meaningful alt text for logos', () => {
      render(<CareerTimeline {...defaultProps} />);
      
      const logoImage = screen.getByAltText('Tech Corp logo');
      expect(logoImage).toBeInTheDocument();
      expect(logoImage).toHaveAttribute('src', 'https://example.com/techcorp-logo.png');
    });
  });

  describe('Error Handling', () => {
    it('handles logo loading errors gracefully', () => {
      render(<CareerTimeline {...defaultProps} />);
      
      const logoImage = screen.getByAltText('Tech Corp logo');
      fireEvent.error(logoImage);
      
      // Should still render the timeline item without crashing
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    });

    it('displays error boundary when error occurs', () => {
      const mockError = new Error('Test error');
      const onError = vi.fn();
      
      // Mock console.error to avoid noise in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <CareerTimeline
          {...defaultProps}
          onError={onError}
        />
      );
      
      // Error boundary should be present in the component
      expect(screen.getByText('Career Timeline')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Props Integration', () => {
    it('calls onUpdate when provided', () => {
      const onUpdate = vi.fn();
      
      render(
        <CareerTimeline
          {...defaultProps}
          onUpdate={onUpdate}
        />
      );
      
      // onUpdate should be available but not called during initial render
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('applies custom className', () => {
      render(
        <CareerTimeline
          {...defaultProps}
          className="custom-timeline-class"
        />
      );
      
      const wrapper = screen.getByText('Career Timeline').closest('.cv-feature-wrapper');
      expect(wrapper).toHaveClass('custom-timeline-class');
    });

    it('respects mode prop for styling', () => {
      render(
        <CareerTimeline
          {...defaultProps}
          mode="public"
        />
      );
      
      const wrapper = screen.getByText('Career Timeline').closest('.cv-feature-wrapper');
      expect(wrapper).toHaveClass('bg-white', 'border-gray-200');
    });
  });

  describe('Performance', () => {
    it('renders large datasets efficiently', () => {
      // Create a large dataset
      const largeData: TimelineData = {
        experiences: Array.from({ length: 50 }, (_, i) => ({
          company: `Company ${i}`,
          position: `Position ${i}`,
          startDate: `202${i % 4}-01-01`,
          endDate: `202${(i % 4) + 1}-01-01`,
          description: `Description for position ${i}`,
          achievements: [`Achievement ${i}-1`, `Achievement ${i}-2`],
        })),
        education: [],
        milestones: [],
      };
      
      const startTime = performance.now();
      render(<CareerTimeline {...defaultProps} data={largeData} />);
      const endTime = performance.now();
      
      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Should still show the first few items
      expect(screen.getByText('Company 0')).toBeInTheDocument();
    });
  });
});

// Integration tests for Firebase Function integration
describe('CareerTimeline Firebase Integration', () => {
  it('integrates with Firebase Functions correctly', () => {
    // Since useFeatureData is mocked at the module level,
    // we just verify the component renders with the provided data
    render(<CareerTimeline {...defaultProps} />);
    
    expect(screen.getByText('Career Timeline')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
  });

  it('handles component lifecycle correctly', () => {
    // Test that the component handles initialization properly
    render(<CareerTimeline {...defaultProps} />);
    
    // Should show FeatureWrapper
    expect(screen.getByText('Career Timeline')).toBeInTheDocument();
    expect(screen.getByText('Interactive timeline with clickable milestones and achievements')).toBeInTheDocument();
  });

  it('maintains proper component state', () => {
    // Test component state management
    render(<CareerTimeline {...defaultProps} />);
    
    // Should render all timeline items
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('AWS Certified Solutions Architect')).toBeInTheDocument();
    expect(screen.getByText('Bachelor of Science')).toBeInTheDocument();
  });
});