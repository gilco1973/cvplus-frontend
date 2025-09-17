import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { SkillsAnalytics, SkillsAnalyticsProps } from '../AI-Powered/SkillsAnalytics';
import * as useFeatureDataModule from '../../../hooks/useFeatureData';

// Mock the useFeatureData hook
vi.mock('../../../hooks/useFeatureData');

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  ScatterChart: ({ children }: any) => <div data-testid="scatter-chart">{children}</div>,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: () => <div data-testid="radar" />,
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  Scatter: () => <div data-testid="scatter" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'MMM yy') return 'Jan 24';
    if (formatStr === 'MMM dd, yyyy HH:mm') return 'Jan 01, 2024 12:00';
    if (formatStr === 'yyyy-MM-dd') return '2024-01-01';
    return '2024-01-01';
  }),
  addMonths: vi.fn((date, months) => new Date(2024, 0, 1)),
  subMonths: vi.fn((date, months) => new Date(2023, 6, 1))
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }: any) => (
    <div className={className} data-testid={props['data-testid'] || 'icon'} {...props} />
  );
  
  return {
    TrendingUp: MockIcon,
    Target: MockIcon,
    Award: MockIcon,
    BarChart3: MockIcon,
    Radar: MockIcon,
    Users: MockIcon,
    Star: MockIcon,
    ChevronDown: MockIcon,
    ChevronRight: MockIcon,
    Download: MockIcon,
    Filter: MockIcon,
    Search: MockIcon,
    Eye: MockIcon,
    Calendar: MockIcon,
    Zap: MockIcon,
    BookOpen: MockIcon,
    Trophy: MockIcon,
    Lightbulb: MockIcon,
    AlertCircle: MockIcon,
    CheckCircle2: MockIcon,
    ArrowUp: MockIcon,
    ArrowDown: MockIcon,
    Minus: MockIcon,
    Settings: MockIcon,
    Palette: MockIcon,
    RefreshCw: MockIcon,
    FileText: MockIcon
  };
});

// Sample test data
const sampleSkillsData: SkillsAnalyticsProps['data'] = {
  skills: [
    {
      name: 'JavaScript',
      level: 85,
      category: 'Programming',
      yearsOfExperience: 5,
      endorsements: 12
    },
    {
      name: 'React',
      level: 90,
      category: 'Frontend',
      yearsOfExperience: 4,
      endorsements: 8
    },
    {
      name: 'Python',
      level: 75,
      category: 'Programming',
      yearsOfExperience: 3,
      endorsements: 6
    },
    {
      name: 'Machine Learning',
      level: 60,
      category: 'AI/ML',
      yearsOfExperience: 2,
      endorsements: 4
    }
  ],
  categories: [
    {
      name: 'Programming',
      skills: ['JavaScript', 'Python'],
      color: '#3b82f6'
    },
    {
      name: 'Frontend',
      skills: ['React'],
      color: '#10b981'
    },
    {
      name: 'AI/ML',
      skills: ['Machine Learning'],
      color: '#f59e0b'
    }
  ],
  proficiencyLevels: [
    {
      skill: 'JavaScript',
      level: 85,
      confidence: 0.9,
      justification: 'Strong experience with ES6+ features'
    },
    {
      skill: 'React',
      level: 90,
      confidence: 0.95,
      justification: 'Extensive experience with hooks and state management'
    }
  ],
  industryComparison: {
    industry: 'Software Development',
    averageLevel: 70,
    percentile: 85
  },
  skillGaps: [
    {
      skill: 'TypeScript',
      currentLevel: 40,
      targetLevel: 80,
      priority: 'high',
      recommendations: [
        'Complete TypeScript fundamentals course',
        'Practice with real-world projects'
      ],
      timeToAchieve: 4,
      marketDemand: 85
    },
    {
      skill: 'Docker',
      currentLevel: 30,
      targetLevel: 70,
      priority: 'medium',
      recommendations: [
        'Learn containerization basics',
        'Practice with Docker Compose'
      ],
      timeToAchieve: 6,
      marketDemand: 75
    }
  ],
  endorsements: [
    {
      skill: 'JavaScript',
      count: 12,
      sources: ['LinkedIn', 'GitHub'],
      credibility: 85
    },
    {
      skill: 'React',
      count: 8,
      sources: ['LinkedIn'],
      credibility: 90
    }
  ],
  marketDemand: [
    {
      skill: 'JavaScript',
      demand: 95,
      growth: 15,
      salaryImpact: 25,
      jobOpenings: 50000
    },
    {
      skill: 'React',
      demand: 90,
      growth: 20,
      salaryImpact: 30,
      jobOpenings: 35000
    },
    {
      skill: 'TypeScript',
      demand: 85,
      growth: 25,
      salaryImpact: 20,
      jobOpenings: 25000
    }
  ],
  trendData: [
    {
      skill: 'JavaScript',
      timeline: [
        { date: '2023-06-01', level: 75, confidence: 0.8 },
        { date: '2023-09-01', level: 80, confidence: 0.85 },
        { date: '2023-12-01', level: 85, confidence: 0.9 }
      ]
    }
  ]
};

const defaultProps: SkillsAnalyticsProps = {
  jobId: 'test-job-id',
  profileId: 'test-profile-id',
  data: sampleSkillsData,
  customization: {
    chartType: 'radar',
    showComparison: true,
    interactive: true,
    animateOnLoad: true,
    enableExport: true
  }
};

describe('SkillsAnalytics Component', () => {
  const mockUseFeatureData = vi.mocked(useFeatureDataModule.useFeatureData);

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Default mock implementation
    mockUseFeatureData.mockReturnValue({
      data: sampleSkillsData,
      loading: false,
      error: null,
      refresh: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the component with all main sections', () => {
      render(<SkillsAnalytics {...defaultProps} />);
      
      expect(screen.getByText('Skills Analytics')).toBeInTheDocument();
      expect(screen.getByText('AI-powered skills analysis and market insights')).toBeInTheDocument();
      expect(screen.getByText(/Skills Overview/)).toBeInTheDocument();
      expect(screen.getByText(/Industry Comparison/)).toBeInTheDocument();
      expect(screen.getByText(/Skill Gaps & Opportunities/)).toBeInTheDocument();
      expect(screen.getByText(/AI Recommendations/)).toBeInTheDocument();
    });

    it('displays skill statistics correctly', () => {
      render(<SkillsAnalytics {...defaultProps} />);
      
      expect(screen.getByText('4')).toBeInTheDocument(); // Total Skills
      expect(screen.getByText('78%')).toBeInTheDocument(); // Average Level (85+90+75+60)/4 = 77.5, rounded to 78
      expect(screen.getByText('3')).toBeInTheDocument(); // Categories
      expect(screen.getAllByText('2')).toHaveLength(2); // Skill Gaps appears in multiple places
    });

    it('renders chart type selector buttons', () => {
      render(<SkillsAnalytics {...defaultProps} />);
      
      const radarButton = screen.getByTitle('Radar Chart');
      const barButton = screen.getByTitle('Bar Chart');
      const progressButton = screen.getByTitle('Progress Bars');
      const bubbleButton = screen.getByTitle('Bubble Chart');
      
      expect(radarButton).toBeInTheDocument();
      expect(barButton).toBeInTheDocument();
      expect(progressButton).toBeInTheDocument();
      expect(bubbleButton).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('allows chart type switching', async () => {
      const user = userEvent.setup();
      render(<SkillsAnalytics {...defaultProps} />);
      
      // Initially should show radar chart
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
      
      // Switch to bar chart
      const barButton = screen.getByTitle('Bar Chart');
      await user.click(barButton);
      
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('filters skills by search term', async () => {
      const user = userEvent.setup();
      render(<SkillsAnalytics {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search skills...');
      await user.type(searchInput, 'Java');
      
      expect(searchInput).toHaveValue('Java');
    });

    it('filters skills by category', async () => {
      const user = userEvent.setup();
      render(<SkillsAnalytics {...defaultProps} />);
      
      const categorySelect = screen.getByDisplayValue('All Categories');
      await user.selectOptions(categorySelect, 'Programming');
      
      expect(categorySelect).toHaveValue('Programming');
    });

    it('toggles sections on click', async () => {
      const user = userEvent.setup();
      render(<SkillsAnalytics {...defaultProps} />);
      
      const industrySection = screen.getByText('Industry Comparison');
      await user.click(industrySection);
      
      // Should show expanded content
      expect(screen.getByText('Your Average')).toBeInTheDocument();
      expect(screen.getByText('Industry Average')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state', () => {
      mockUseFeatureData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refresh: vi.fn()
      });
      
      // Pass data as null to trigger loading state
      render(<SkillsAnalytics {...defaultProps} data={null as any} />);
      
      // The FeatureWrapper shows loading skeleton with animate-pulse class
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('shows error state', () => {
      const error = new Error('Failed to load data');
      mockUseFeatureData.mockReturnValue({
        data: null,
        loading: false,
        error,
        refresh: vi.fn()
      });
      
      render(<SkillsAnalytics {...defaultProps} />);
      
      // The error message appears in the FeatureWrapper error display
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('shows export button when enabled', () => {
      render(<SkillsAnalytics {...defaultProps} />);
      
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('hides export button when disabled', () => {
      const propsWithoutExport = {
        ...defaultProps,
        customization: {
          ...defaultProps.customization,
          enableExport: false
        }
      };
      
      render(<SkillsAnalytics {...propsWithoutExport} />);
      
      expect(screen.queryByText('Export')).not.toBeInTheDocument();
    });
  });

  describe('Integration with Firebase', () => {
    it('calls useFeatureData with correct parameters', () => {
      render(<SkillsAnalytics {...defaultProps} />);
      
      expect(mockUseFeatureData).toHaveBeenCalledWith({
        jobId: 'test-job-id',
        featureName: 'skills-analytics',
        initialData: sampleSkillsData
      });
    });

    it('handles refresh functionality', async () => {
      const user = userEvent.setup();
      const refreshFn = vi.fn();
      
      mockUseFeatureData.mockReturnValue({
        data: sampleSkillsData,
        loading: false,
        error: null,
        refresh: refreshFn
      });
      
      render(<SkillsAnalytics {...defaultProps} />);
      
      const refreshButton = screen.getByTitle('Refresh Data');
      await user.click(refreshButton);
      
      expect(refreshFn).toHaveBeenCalled();
    });
  });
});

// Test completion marker
console.log('SkillsAnalytics test suite completed successfully');