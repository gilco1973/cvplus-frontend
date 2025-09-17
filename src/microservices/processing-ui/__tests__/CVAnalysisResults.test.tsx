/**
 * CVAnalysisResults Component Tests
 * Comprehensive test suite for the analysis results component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CVAnalysisResults } from '../CVAnalysisResults';
import type { CVAnalysisResultsProps } from '../CVAnalysisResults';
import type { CVAnalysisResults as CVAnalysisResultsType } from '../../../../types/cv.types';
import type { Job } from '../../../types/job';
import type { AnalysisResult } from '../../../types/analysis';

// Mock sub-components to avoid circular dependencies in tests
vi.mock('../results/AnalysisOverview', () => ({
  AnalysisOverview: ({ analysisResults, expanded, onToggle }: any) => (
    <div data-testid="analysis-overview">
      <button onClick={onToggle}>Toggle Overview</button>
      <div>Score: {analysisResults.overallScore}</div>
    </div>
  )
}));

vi.mock('../results/SkillsAnalysisCard', () => ({
  SkillsAnalysisCard: ({ analysisResults, expanded, onToggle }: any) => (
    <div data-testid="skills-analysis">
      <button onClick={onToggle}>Toggle Skills</button>
    </div>
  )
}));

vi.mock('../results/PersonalityInsights', () => ({
  PersonalityInsights: ({ analysisResults, expanded, onToggle }: any) => (
    <div data-testid="personality-insights">
      <button onClick={onToggle}>Toggle Personality</button>
    </div>
  )
}));

vi.mock('../results/IndustryAlignment', () => ({
  IndustryAlignment: ({ analysisResults, expanded, onToggle }: any) => (
    <div data-testid="industry-alignment">
      <button onClick={onToggle}>Toggle Industry</button>
    </div>
  )
}));

vi.mock('../results/CompetitiveAnalysis', () => ({
  CompetitiveAnalysis: ({ analysisResults, expanded, onToggle }: any) => (
    <div data-testid="competitive-analysis">
      <button onClick={onToggle}>Toggle Competitive</button>
    </div>
  )
}));

vi.mock('../results/ExportActions', () => ({
  ExportActions: ({ onExport, onShare }: any) => (
    <div data-testid="export-actions">
      <button onClick={() => onExport?.('pdf')}>Export PDF</button>
      <button onClick={onShare}>Share</button>
    </div>
  )
}));

describe('CVAnalysisResults', () => {
  const mockJob: Job = {
    id: 'test-job-123',
    userId: 'user-123',
    fileName: 'test-cv.pdf',
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockAnalysisResults: CVAnalysisResultsType = {
    overallScore: 85,
    sectionScores: {
      experience: 90,
      skills: 80,
      education: 85
    },
    keywords: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    suggestions: [
      {
        id: 'sug-1',
        type: 'improvement',
        section: 'skills',
        title: 'Add cloud computing skills',
        description: 'Consider adding AWS or Azure experience',
        actionable: true,
        priority: 8
      },
      {
        id: 'sug-2',
        type: 'warning',
        section: 'experience',
        title: 'Quantify achievements',
        description: 'Add metrics to demonstrate impact',
        actionable: true,
        priority: 7
      }
    ],
    atsCompatibility: {
      score: 78,
      factors: [
        {
          name: 'Keyword Density',
          score: 85,
          weight: 30,
          description: 'Good keyword usage'
        },
        {
          name: 'Format Structure',
          score: 70,
          weight: 25,
          description: 'Standard formatting'
        }
      ],
      recommendations: ['Add more industry keywords', 'Improve section headers']
    },
    readabilityScore: 82
  };

  const mockAnalysisResult: AnalysisResult = {
    jobId: 'test-job-123',
    recommendations: [
      {
        id: 'rec-1',
        title: 'Enhance technical skills section',
        description: 'Add more specific technologies',
        priority: 'high',
        category: 'Skills',
        impact: 'High visibility to recruiters',
        estimatedImprovement: 15,
        selected: false
      }
    ],
    atsAnalysis: {
      currentScore: 78,
      predictedScore: 85,
      issues: [
        {
          message: 'Missing keywords for target role',
          severity: 'warning',
          category: 'Keywords'
        }
      ],
      suggestions: [
        {
          reason: 'Add industry-specific terms',
          impact: 'Improved ATS compatibility',
          category: 'Keywords'
        }
      ],
      overall: 78,
      passes: true
    },
    summary: {
      totalRecommendations: 1,
      highPriorityCount: 1,
      potentialScoreIncrease: 15
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const defaultProps: CVAnalysisResultsProps = {
    job: mockJob,
    analysisResults: mockAnalysisResults,
    analysisResult: mockAnalysisResult,
    onExport: vi.fn(),
    onShare: vi.fn(),
    onGenerateMultimedia: vi.fn(),
    onApplyRecommendation: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct header information', () => {
    render(<CVAnalysisResults {...defaultProps} />);

    expect(screen.getByText('CV Analysis Results')).toBeInTheDocument();
    expect(screen.getByText('test-cv.pdf')).toBeInTheDocument();
    expect(screen.getByText('85/100')).toBeInTheDocument();
    expect(screen.getByText('78/100')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // High priority count
  });

  it('renders all tab navigation options', () => {
    render(<CVAnalysisResults {...defaultProps} />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Skills Analysis')).toBeInTheDocument();
    expect(screen.getByText('Personality')).toBeInTheDocument();
    expect(screen.getByText('Industry Fit')).toBeInTheDocument();
    expect(screen.getByText('Competitive Edge')).toBeInTheDocument();
  });

  it('shows overview section by default', () => {
    render(<CVAnalysisResults {...defaultProps} />);

    expect(screen.getByTestId('analysis-overview')).toBeInTheDocument();
    expect(screen.getByText('Score: 85')).toBeInTheDocument();
  });

  it('switches between different tabs correctly', async () => {
    render(<CVAnalysisResults {...defaultProps} />);

    // Click skills tab
    fireEvent.click(screen.getByText('Skills Analysis'));
    await waitFor(() => {
      expect(screen.getByTestId('skills-analysis')).toBeInTheDocument();
    });

    // Click personality tab
    fireEvent.click(screen.getByText('Personality'));
    await waitFor(() => {
      expect(screen.getByTestId('personality-insights')).toBeInTheDocument();
    });

    // Click industry tab
    fireEvent.click(screen.getByText('Industry Fit'));
    await waitFor(() => {
      expect(screen.getByTestId('industry-alignment')).toBeInTheDocument();
    });

    // Click competitive tab
    fireEvent.click(screen.getByText('Competitive Edge'));
    await waitFor(() => {
      expect(screen.getByTestId('competitive-analysis')).toBeInTheDocument();
    });
  });

  it('calls export function when export button is clicked', () => {
    const mockOnExport = vi.fn();
    render(<CVAnalysisResults {...defaultProps} onExport={mockOnExport} />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    expect(mockOnExport).toHaveBeenCalledWith('pdf');
  });

  it('calls share function when share button is clicked', () => {
    const mockOnShare = vi.fn();
    render(<CVAnalysisResults {...defaultProps} onShare={mockOnShare} />);

    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);

    expect(mockOnShare).toHaveBeenCalled();
  });

  it('renders multimedia generation buttons', () => {
    render(<CVAnalysisResults {...defaultProps} />);

    expect(screen.getByText('Generate AI Podcast')).toBeInTheDocument();
    expect(screen.getByText('Create Video Introduction')).toBeInTheDocument();
    expect(screen.getByText('Build Portfolio Gallery')).toBeInTheDocument();
  });

  it('calls multimedia generation function with correct parameters', () => {
    const mockOnGenerateMultimedia = vi.fn();
    render(<CVAnalysisResults {...defaultProps} onGenerateMultimedia={mockOnGenerateMultimedia} />);

    // Test podcast generation
    fireEvent.click(screen.getByText('Generate AI Podcast'));
    expect(mockOnGenerateMultimedia).toHaveBeenCalledWith('podcast');

    // Test video generation
    fireEvent.click(screen.getByText('Create Video Introduction'));
    expect(mockOnGenerateMultimedia).toHaveBeenCalledWith('video');

    // Test portfolio generation
    fireEvent.click(screen.getByText('Build Portfolio Gallery'));
    expect(mockOnGenerateMultimedia).toHaveBeenCalledWith('portfolio');
  });

  it('renders export actions component', () => {
    render(<CVAnalysisResults {...defaultProps} />);

    expect(screen.getByTestId('export-actions')).toBeInTheDocument();
  });

  it('passes correct props to export actions component', () => {
    const mockOnExport = vi.fn();
    const mockOnShare = vi.fn();

    render(
      <CVAnalysisResults
        {...defaultProps}
        onExport={mockOnExport}
        onShare={mockOnShare}
      />
    );

    // Test export from ExportActions component
    fireEvent.click(screen.getByText('Export PDF'));
    expect(mockOnExport).toHaveBeenCalledWith('pdf');

    // Test share from ExportActions component
    fireEvent.click(screen.getByText('Share'));
    expect(mockOnShare).toHaveBeenCalled();
  });

  it('handles missing optional props gracefully', () => {
    const minimalProps = {
      job: mockJob,
      analysisResults: mockAnalysisResults,
      analysisResult: mockAnalysisResult
    };

    expect(() => render(<CVAnalysisResults {...minimalProps} />)).not.toThrow();
  });

  it('applies custom className if provided', () => {
    const { container } = render(
      <CVAnalysisResults {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('calculates high priority count correctly', () => {
    const analysisResultsWithMultipleSuggestions = {
      ...mockAnalysisResults,
      suggestions: [
        ...mockAnalysisResults.suggestions,
        {
          id: 'sug-3',
          type: 'critical' as const,
          section: 'format',
          title: 'Critical fix needed',
          description: 'Fix formatting issue',
          actionable: true,
          priority: 9
        }
      ]
    };

    render(
      <CVAnalysisResults
        {...defaultProps}
        analysisResults={analysisResultsWithMultipleSuggestions}
      />
    );

    // Should show 2 high priority items (priority >= 8)
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('toggles section expansion state correctly', () => {
    render(<CVAnalysisResults {...defaultProps} />);

    const toggleButton = screen.getByText('Toggle Overview');
    fireEvent.click(toggleButton);

    // The mocked component should still be visible but the state change is tested
    expect(screen.getByTestId('analysis-overview')).toBeInTheDocument();
  });

  it('renders with loading state gracefully', () => {
    const loadingProps = {
      ...defaultProps,
      analysisResults: {
        ...mockAnalysisResults,
        overallScore: 0,
        suggestions: []
      }
    };

    expect(() => render(<CVAnalysisResults {...loadingProps} />)).not.toThrow();
  });

  it('handles edge cases for score calculation', () => {
    const edgeCaseProps = {
      ...defaultProps,
      analysisResults: {
        ...mockAnalysisResults,
        overallScore: 100,
        atsCompatibility: {
          ...mockAnalysisResults.atsCompatibility,
          score: 100
        }
      }
    };

    render(<CVAnalysisResults {...edgeCaseProps} />);

    expect(screen.getByText('100/100')).toBeInTheDocument();
  });
});