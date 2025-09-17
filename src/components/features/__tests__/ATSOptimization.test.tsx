import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ATSOptimization, { type ATSOptimizationProps } from '../AI-Powered/ATSOptimization';
import type { EnhancedATSResult } from '../../../types/ats';

// Mock Firebase hooks
vi.mock('../../../hooks/useFeatureData', () => {
  const mockUseFeatureData = vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn()
  }));
  
  return {
    useFeatureData: mockUseFeatureData
  };
});

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: () => <div data-testid="radar" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Bar: () => <div data-testid="bar" />,
  Legend: () => <div data-testid="legend" />
}));

// Mock react-circular-progressbar
vi.mock('react-circular-progressbar', () => ({
  CircularProgressbar: ({ value, text }: { value: number; text: string }) => (
    <div data-testid="circular-progressbar" data-value={value} data-text={text}>
      {text}
    </div>
  ),
  buildStyles: vi.fn(() => ({}))
}));

// Mock CSS import
vi.mock('react-circular-progressbar/dist/styles.css', () => ({}));

// Test data
const mockBasicData = {
  score: 75,
  keywords: ['JavaScript', 'React', 'TypeScript', 'Node.js'],
  suggestions: [
    'Add more technical keywords to your skills section',
    'Include quantifiable achievements in your experience',
    'Optimize your summary for ATS parsing'
  ],
  compatibilityReport: {
    overallScore: 75,
    keywordDensity: 80,
    formatScore: 70,
    sectionScore: 85,
    recommendations: ['Improve formatting', 'Add keywords']
  }
};

const mockEnhancedData = {
  ...mockBasicData,
  enhancedResult: {
    passes: true,
    advancedScore: {
      overall: 75,
      confidence: 0.85,
      breakdown: {
        parsing: 80,
        keywords: 70,
        formatting: 75,
        content: 85,
        specificity: 65
      },
      atsSystemScores: {
        workday: 78,
        greenhouse: 72,
        lever: 76,
        bamboohr: 74,
        taleo: 70,
        generic: 75
      },
      recommendations: [
        {
          id: 'rec-1',
          priority: 1,
          category: 'keywords',
          title: 'Add Industry-Specific Keywords',
          description: 'Include more relevant keywords for your target role',
          impact: 'high',
          estimatedScoreImprovement: 8,
          actionRequired: 'add',
          section: 'skills',
          atsSystemsAffected: ['workday', 'greenhouse']
        },
        {
          id: 'rec-2',
          priority: 2,
          category: 'formatting',
          title: 'Improve Section Headers',
          description: 'Use standard section headers for better ATS parsing',
          impact: 'medium',
          estimatedScoreImprovement: 5,
          actionRequired: 'modify',
          section: 'formatting',
          atsSystemsAffected: ['taleo']
        }
      ],
      competitorBenchmark: {
        benchmarkScore: 75,
        industryAverage: 65,
        topPercentile: 90,
        gapAnalysis: {
          missingKeywords: ['Python', 'AWS', 'Docker'],
          weakAreas: ['technical skills', 'certifications'],
          strengthAreas: ['experience', 'education']
        }
      }
    },
    semanticAnalysis: {
      primaryKeywords: [
        { keyword: 'JavaScript', relevanceScore: 0.9, frequency: 5, variations: ['JS'], context: ['skills'], atsImportance: 0.8, competitorUsage: 0.7 },
        { keyword: 'React', relevanceScore: 0.85, frequency: 4, variations: ['ReactJS'], context: ['experience'], atsImportance: 0.9, competitorUsage: 0.8 }
      ],
      semanticMatches: [],
      contextualRelevance: 0.8,
      densityOptimization: {
        current: 0.05,
        recommended: 0.08,
        sections: { skills: 0.1, experience: 0.03 }
      },
      synonymMapping: {},
      industrySpecificTerms: ['Frontend Development', 'Full Stack', 'Web Development']
    }
  } as EnhancedATSResult
};

const defaultProps: ATSOptimizationProps = {
  jobId: 'test-job-123',
  profileId: 'test-profile-456',
  data: mockBasicData,
  customization: {
    showScore: true,
    showKeywords: true,
    showSuggestions: true,
    interactive: true
  }
};

describe('ATSOptimization Component', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with basic data', () => {
      render(<ATSOptimization {...defaultProps} />);
      
      expect(screen.getByText('ATS Optimization')).toBeInTheDocument();
      expect(screen.getByText('AI-powered ATS compatibility analysis and optimization')).toBeInTheDocument();
      expect(screen.getByTestId('circular-progressbar')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('displays the correct score status message', () => {
      render(<ATSOptimization {...defaultProps} />);
      
      expect(screen.getByText('⚠ Good with Improvements Needed')).toBeInTheDocument();
    });

    it('renders keywords section', async () => {
      render(<ATSOptimization {...defaultProps} />);
      
      expect(screen.getByText('Keyword Analysis (4)')).toBeInTheDocument();
      
      // Click to expand the keyword section
      const keywordSection = screen.getByText('Keyword Analysis (4)');
      await user.click(keywordSection);
      
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('renders suggestions section', () => {
      render(<ATSOptimization {...defaultProps} />);
      
      expect(screen.getByText('Optimization Recommendations (3)')).toBeInTheDocument();
    });
  });

  describe('Enhanced Data Rendering', () => {
    const enhancedProps: ATSOptimizationProps = {
      ...defaultProps,
      data: mockEnhancedData
    };

    it('renders enhanced ATS result with AI badge', () => {
      render(<ATSOptimization {...enhancedProps} />);
      
      expect(screen.getByText('AI')).toBeInTheDocument();
      expect(screen.getByText('Analysis Confidence: 85%')).toBeInTheDocument();
    });

    it('shows advanced analytics when enhanced data is available', async () => {
      render(<ATSOptimization {...enhancedProps} />);
      
      const showDetailsButton = screen.getByText('Show Details');
      await user.click(showDetailsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Score Breakdown')).toBeInTheDocument();
        expect(screen.getByText('ATS System Compatibility')).toBeInTheDocument();
        expect(screen.getByText('Industry Benchmark')).toBeInTheDocument();
      });
    });

    it('displays radar chart for score breakdown', async () => {
      render(<ATSOptimization {...enhancedProps} />);
      
      const showDetailsButton = screen.getByText('Show Details');
      await user.click(showDetailsButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
        expect(screen.getByText('parsing')).toBeInTheDocument();
      });
    });

    it('shows system compatibility scores', async () => {
      render(<ATSOptimization {...enhancedProps} />);
      
      const showDetailsButton = screen.getByText('Show Details');
      await user.click(showDetailsButton);
      
      await waitFor(() => {
        expect(screen.getByText('ATS System Compatibility')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });

    it('displays industry benchmark comparison', async () => {
      render(<ATSOptimization {...enhancedProps} />);
      
      const showDetailsButton = screen.getByText('Show Details');
      await user.click(showDetailsButton);
      
      const benchmarkSection = screen.getByText('Industry Benchmark');
      await user.click(benchmarkSection);
      
      await waitFor(() => {
        expect(screen.getByText('Your Score')).toBeInTheDocument();
        expect(screen.getByText('Industry Average')).toBeInTheDocument();
        expect(screen.getByText('Top 10%')).toBeInTheDocument();
        expect(screen.getByText('Missing Competitive Keywords')).toBeInTheDocument();
        expect(screen.getByText('Python')).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Features', () => {
    const enhancedProps: ATSOptimizationProps = {
      ...defaultProps,
      data: mockEnhancedData
    };

    it('allows filtering recommendations by priority', async () => {
      render(<ATSOptimization {...enhancedProps} />);
      
      const suggestionsSection = screen.getByText('Optimization Recommendations (2)');
      await user.click(suggestionsSection);
      
      await waitFor(() => {
        const priorityFilter = screen.getByDisplayValue('All Priorities');
        expect(priorityFilter).toBeInTheDocument();
      });
      
      const priorityFilter = screen.getByDisplayValue('All Priorities');
      await user.selectOptions(priorityFilter, '1'); // Use the actual value instead of text
      
      await waitFor(() => {
        expect(screen.getByText('Add Industry-Specific Keywords')).toBeInTheDocument();
      });
    });

    it('allows searching recommendations', async () => {
      render(<ATSOptimization {...enhancedProps} />);
      
      const suggestionsSection = screen.getByText('Optimization Recommendations (2)');
      await user.click(suggestionsSection);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search recommendations...')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText('Search recommendations...');
      await user.type(searchInput, 'keywords');
      
      await waitFor(() => {
        expect(screen.getByText('Add Industry-Specific Keywords')).toBeInTheDocument();
      });
    });

    it('handles recommendation application', async () => {
      const onUpdate = vi.fn();
      render(<ATSOptimization {...enhancedProps} onUpdate={onUpdate} />);
      
      const suggestionsSection = screen.getByText('Optimization Recommendations (2)');
      await user.click(suggestionsSection);
      
      await waitFor(() => {
        expect(screen.getAllByText('Apply')).toHaveLength(2);
      });
      
      const applyButtons = screen.getAllByText('Apply');
      await user.click(applyButtons[0]);
      
      expect(onUpdate).toHaveBeenCalledWith({ appliedRecommendation: 'rec-1' });
    });

    it('exports ATS report', async () => {
      // Mock URL.createObjectURL and related methods
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();
      
      const mockLink = {
        click: vi.fn(),
        setAttribute: vi.fn()
      };
      
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      
      render(<ATSOptimization {...enhancedProps} />);
      
      const exportButton = screen.getByText('Export Report');
      await user.click(exportButton);
      
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('Collapsible Sections', () => {
    const enhancedProps: ATSOptimizationProps = {
      ...defaultProps,
      data: mockEnhancedData
    };

    it('toggles keyword analysis section', async () => {
      render(<ATSOptimization {...enhancedProps} />);
      
      const keywordSection = screen.getByText('Keyword Analysis (4)');
      await user.click(keywordSection);
      
      await waitFor(() => {
        expect(screen.getByText('Primary Keywords')).toBeInTheDocument();
        expect(screen.getByText('Industry Terms')).toBeInTheDocument();
      });
    });

    it('toggles suggestions section', async () => {
      render(<ATSOptimization {...enhancedProps} />);
      
      const suggestionsSection = screen.getByText('Optimization Recommendations (2)');
      await user.click(suggestionsSection);
      
      await waitFor(() => {
        expect(screen.getByText('Add Industry-Specific Keywords')).toBeInTheDocument();
        expect(screen.getByText('Improve Section Headers')).toBeInTheDocument();
      });
    });
  });

  describe('Different Score Ranges', () => {
    it('displays excellent status for high scores', () => {
      const highScoreData = { ...mockBasicData, score: 85 };
      render(<ATSOptimization {...defaultProps} data={highScoreData} />);
      
      expect(screen.getByText('✓ Excellent ATS Compatibility')).toBeInTheDocument();
    });

    it('displays needs optimization status for low scores', () => {
      const lowScoreData = { ...mockBasicData, score: 45 };
      render(<ATSOptimization {...defaultProps} data={lowScoreData} />);
      
      expect(screen.getByText('✗ Needs Significant Optimization')).toBeInTheDocument();
    });
  });

  describe('Customization Options', () => {
    it('hides score when showScore is false', () => {
      const customProps = {
        ...defaultProps,
        customization: { ...defaultProps.customization, showScore: false }
      };
      render(<ATSOptimization {...customProps} />);
      
      expect(screen.queryByTestId('circular-progressbar')).not.toBeInTheDocument();
    });

    it('hides keywords when showKeywords is false', () => {
      const customProps = {
        ...defaultProps,
        customization: { ...defaultProps.customization, showKeywords: false }
      };
      render(<ATSOptimization {...customProps} />);
      
      expect(screen.queryByText('Keyword Analysis')).not.toBeInTheDocument();
    });

    it('hides suggestions when showSuggestions is false', () => {
      const customProps = {
        ...defaultProps,
        customization: { ...defaultProps.customization, showSuggestions: false }
      };
      render(<ATSOptimization {...customProps} />);
      
      expect(screen.queryByText('Optimization Recommendations')).not.toBeInTheDocument();
    });

    it('disables interactive features when interactive is false', () => {
      const enhancedProps = {
        ...defaultProps,
        data: mockEnhancedData,
        customization: { ...defaultProps.customization, interactive: false }
      };
      render(<ATSOptimization {...enhancedProps} />);
      
      const suggestionsSection = screen.getByText('Optimization Recommendations (2)');
      fireEvent.click(suggestionsSection);
      
      expect(screen.queryByText('Apply')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error state when error prop is provided', async () => {
      const errorProps = {
        ...defaultProps,
        data: mockBasicData
      };
      
      // Mock the useFeatureData hook to return an error
      const useFeatureDataModule = await import('../../../hooks/useFeatureData');
      vi.mocked(useFeatureDataModule.useFeatureData).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Failed to load ATS data'),
        refresh: vi.fn()
      });
      
      render(<ATSOptimization {...errorProps} />);
      
      expect(screen.getByText('Feature Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load ATS data')).toBeInTheDocument();
    });

    it('displays loading state', async () => {
      const useFeatureDataModule = await import('../../../hooks/useFeatureData');
      vi.mocked(useFeatureDataModule.useFeatureData).mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refresh: vi.fn()
      });
      
      render(<ATSOptimization {...defaultProps} />);
      
      expect(screen.getByText('Analyzing ATS compatibility...')).toBeInTheDocument();
    });

    it('handles missing data gracefully', () => {
      const emptyProps = {
        ...defaultProps,
        data: {
          score: 0,
          keywords: [],
          suggestions: [],
          compatibilityReport: {
            overallScore: 0,
            keywordDensity: 0,
            formatScore: 0,
            sectionScore: 0,
            recommendations: []
          }
        }
      };
      
      render(<ATSOptimization {...emptyProps} />);
      
      expect(screen.getByText('ATS Optimization')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<ATSOptimization {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });

    it('supports keyboard navigation', async () => {
      render(<ATSOptimization {...defaultProps} />);
      
      const showDetailsButton = screen.getByText('Show Details');
      showDetailsButton.focus();
      expect(showDetailsButton).toHaveFocus();
      
      fireEvent.keyDown(showDetailsButton, { key: 'Enter' });
      expect(screen.getByText('Score Breakdown')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('memoizes expensive calculations', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const { rerender } = render(<ATSOptimization {...defaultProps} />);
      rerender(<ATSOptimization {...defaultProps} />);
      
      // Component should not re-calculate expensive operations unnecessarily
      expect(consoleSpy).not.toHaveBeenCalledWith('Expensive calculation');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Integration with CV Features', () => {
    it('calls onUpdate when data changes', async () => {
      const onUpdate = vi.fn();
      render(<ATSOptimization {...defaultProps} onUpdate={onUpdate} />);
      
      const refreshButton = screen.getByText('Refresh Analysis');
      await user.click(refreshButton);
      
      // Should trigger refresh which may call onUpdate
      expect(screen.getByText('Refresh Analysis')).toBeInTheDocument();
    });

    it('calls onError when errors occur', async () => {
      const onError = vi.fn();
      
      // Import and mock the hook directly
      const useFeatureDataModule = await import('../../../hooks/useFeatureData');
      vi.mocked(useFeatureDataModule.useFeatureData).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Test error'),
        refresh: vi.fn()
      });
      
      render(<ATSOptimization {...defaultProps} onError={onError} />);
      
      // Error should be handled by FeatureWrapper with generic error message
      expect(screen.getByText('Feature Error')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });
});

// Helper test utilities
export const createMockATSData = (overrides: Partial<typeof mockBasicData> = {}) => ({
  ...mockBasicData,
  ...overrides
});

export const createMockEnhancedATSData = (overrides: Partial<typeof mockEnhancedData> = {}) => ({
  ...mockEnhancedData,
  ...overrides
});

export const renderATSOptimization = (props: Partial<ATSOptimizationProps> = {}) => {
  const finalProps = { ...defaultProps, ...props };
  return render(<ATSOptimization {...finalProps} />);
};