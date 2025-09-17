import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SkillsVisualization } from '../SkillsVisualization';
import { Skill, SkillCategory } from '../../../../types/cv-features';

// Mock external dependencies
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock-image-data')
  }),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Cell: () => <div data-testid="cell" />,
  ScatterChart: ({ children }: any) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => <div data-testid="scatter" />,
  ZAxis: () => <div data-testid="z-axis" />,
}));

vi.mock('../../../../hooks/useFeatureData', () => ({
  useFeatureData: vi.fn().mockReturnValue({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
    update: vi.fn(),
    state: 'success'
  }),
}));

describe('SkillsVisualization', () => {
  const mockSkills: Skill[] = [
    {
      name: 'JavaScript',
      level: 9,
      category: 'Programming',
      yearsOfExperience: 5,
      endorsements: 12
    },
    {
      name: 'React',
      level: 8,
      category: 'Frameworks',
      yearsOfExperience: 3,
      endorsements: 8
    }
  ];

  const mockCategories: SkillCategory[] = [
    {
      name: 'Programming',
      skills: ['JavaScript']
    },
    {
      name: 'Frameworks',
      skills: ['React']
    }
  ];

  const defaultProps = {
    jobId: 'test-job-id',
    profileId: 'test-profile-id',
    data: {
      skills: mockSkills,
      categories: mockCategories,
      showProficiency: true,
      groupByCategory: true
    },
    isEnabled: true,
    mode: 'private' as const
  };

  it('renders skills visualization with basic content', () => {
    render(<SkillsVisualization {...defaultProps} />);
    
    expect(screen.getByText('Skills Visualization')).toBeInTheDocument();
    expect(screen.getByText(/Explore your skills/)).toBeInTheDocument();
  });

  it('renders chart components', () => {
    render(<SkillsVisualization {...defaultProps} />);
    
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('does not render when disabled', () => {
    render(<SkillsVisualization {...defaultProps} isEnabled={false} />);
    
    expect(screen.queryByText('Skills Visualization')).not.toBeInTheDocument();
  });

  it('shows skills summary', () => {
    render(<SkillsVisualization {...defaultProps} />);
    
    expect(screen.getByText('Total Skills')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('shows settings button', () => {
    render(<SkillsVisualization {...defaultProps} />);
    
    expect(screen.getByLabelText('Chart settings')).toBeInTheDocument();
  });

  it('opens settings panel when clicked', () => {
    render(<SkillsVisualization {...defaultProps} />);
    
    const settingsButton = screen.getByLabelText('Chart settings');
    fireEvent.click(settingsButton);
    
    expect(screen.getByText('Chart Type')).toBeInTheDocument();
    expect(screen.getByText('Color Scheme')).toBeInTheDocument();
  });

  it('shows export button in settings', () => {
    render(<SkillsVisualization {...defaultProps} />);
    
    const settingsButton = screen.getByLabelText('Chart settings');
    fireEvent.click(settingsButton);
    
    expect(screen.getByText('Export PNG')).toBeInTheDocument();
  });
});
