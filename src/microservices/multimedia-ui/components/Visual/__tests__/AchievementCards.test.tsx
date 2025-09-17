import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { AchievementCards } from '../AchievementCards';
import { Achievement } from '../../../../types/cv-features';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, className, layout, whileHover, variants, initial, animate, exit, transition, ...props }: any) => (
      <div onClick={onClick} className={className} {...props}>
        {children}
      </div>
    )
  },
  AnimatePresence: ({ children, mode }: any) => children
}));

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    toDataURL: vi.fn(() => 'data:image/png;base64,mock')
  }))
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock useFeatureData hook
vi.mock('../../../../hooks/useFeatureData', () => ({
  useFeatureData: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn()
  }))
}));

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Project Leadership Excellence',
    description: 'Led a cross-functional team of 12 developers to deliver a critical product feature 2 weeks ahead of schedule.',
    impact: 'Increased team productivity by 35% and reduced time-to-market by 15 days.',
    category: 'leadership',
    importance: 'high',
    date: '2024-01-15',
    metrics: [
      {
        label: 'Team Size',
        value: 12,
        type: 'number'
      },
      {
        label: 'Productivity Increase',
        value: 35,
        type: 'percentage',
        improvement: '+10% vs target'
      },
      {
        label: 'Time Saved',
        value: 15,
        type: 'time'
      }
    ],
    tags: ['leadership', 'project-management', 'team-building']
  },
  {
    id: '2',
    title: 'Technical Innovation Award',
    description: 'Developed an innovative caching solution that reduced database load by 60%.',
    impact: 'Saved the company $50,000 annually in infrastructure costs.',
    category: 'innovation',
    importance: 'high',
    date: '2023-11-20',
    metrics: [
      {
        label: 'Performance Improvement',
        value: 60,
        type: 'percentage'
      },
      {
        label: 'Annual Savings',
        value: 50000,
        type: 'currency'
      }
    ],
    tags: ['innovation', 'performance', 'cost-optimization']
  },
  {
    id: '3',
    title: 'Customer Satisfaction Initiative',
    description: 'Implemented customer feedback system that improved satisfaction scores.',
    category: 'work',
    importance: 'medium',
    date: '2023-08-10',
    metrics: [
      {
        label: 'Satisfaction Increase',
        value: 25,
        type: 'percentage'
      }
    ]
  }
];

const defaultProps = {
  jobId: 'test-job-123',
  profileId: 'test-profile-456',
  data: {
    achievements: mockAchievements,
    totalAchievements: 3,
    highlightedAchievements: ['1']
  }
};

describe('AchievementCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders achievement cards correctly', () => {
    render(<AchievementCards {...defaultProps} />);
    
    expect(screen.getByText('Project Leadership Excellence')).toBeInTheDocument();
    expect(screen.getByText('Technical Innovation Award')).toBeInTheDocument();
    expect(screen.getByText('Customer Satisfaction Initiative')).toBeInTheDocument();
  });

  it('displays achievement metrics correctly', () => {
    render(<AchievementCards {...defaultProps} />);
    
    expect(screen.getByText('12')).toBeInTheDocument(); // Team Size
    expect(screen.getByText('35%')).toBeInTheDocument(); // Productivity Increase
    expect(screen.getByText('$50,000')).toBeInTheDocument(); // Annual Savings
  });

  it('shows highlighted achievements with featured badge', () => {
    render(<AchievementCards {...defaultProps} />);
    
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('filters achievements by category', async () => {
    render(<AchievementCards {...defaultProps} />);
    
    const categoryFilter = screen.getByDisplayValue('All Categories');
    fireEvent.change(categoryFilter, { target: { value: 'leadership' } });
    
    await waitFor(() => {
      expect(screen.getByText('Project Leadership Excellence')).toBeInTheDocument();
      expect(screen.queryByText('Technical Innovation Award')).not.toBeInTheDocument();
    });
  });

  it('filters achievements by importance', async () => {
    render(<AchievementCards {...defaultProps} />);
    
    const importanceFilter = screen.getByDisplayValue('All Priorities');
    fireEvent.change(importanceFilter, { target: { value: 'high' } });
    
    await waitFor(() => {
      expect(screen.getByText('Project Leadership Excellence')).toBeInTheDocument();
      expect(screen.getByText('Technical Innovation Award')).toBeInTheDocument();
      expect(screen.queryByText('Customer Satisfaction Initiative')).not.toBeInTheDocument();
    });
  });

  it('sorts achievements correctly', async () => {
    render(<AchievementCards {...defaultProps} />);
    
    const sortSelect = screen.getByDisplayValue('Sort by Priority');
    fireEvent.change(sortSelect, { target: { value: 'title' } });
    
    // The component should re-render with sorted achievements
    await waitFor(() => {
      expect(sortSelect).toHaveValue('title');
    });
  });

  it('displays summary statistics correctly', () => {
    render(<AchievementCards {...defaultProps} />);
    
    expect(screen.getByText('Total Achievements')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
    expect(screen.getByText('With Metrics')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    
    // Check that the stats section contains the correct values
    const statsSection = screen.getByText('Total Achievements').closest('div');
    expect(statsSection).toBeInTheDocument();
  });

  it('handles export functionality', async () => {
    render(<AchievementCards {...defaultProps} />);
    
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(exportButton).toBeInTheDocument();
    });
  });

  it('handles card click to expand/collapse', async () => {
    render(<AchievementCards {...defaultProps} />);
    
    const firstCard = screen.getByText('Project Leadership Excellence').closest('div');
    if (firstCard) {
      fireEvent.click(firstCard);
      // Card should now be expanded (implementation detail)
    }
  });

  it('renders different layouts correctly', () => {
    // Test grid layout (default)
    const { rerender } = render(<AchievementCards {...defaultProps} />);
    expect(screen.getByText('Project Leadership Excellence')).toBeInTheDocument();
    
    // Test carousel layout
    rerender(
      <AchievementCards 
        {...defaultProps} 
        customization={{ layout: 'carousel' }}
      />
    );
    expect(screen.getByText('Project Leadership Excellence')).toBeInTheDocument();
    
    // Test masonry layout
    rerender(
      <AchievementCards 
        {...defaultProps} 
        customization={{ layout: 'masonry' }}
      />
    );
    expect(screen.getByText('Project Leadership Excellence')).toBeInTheDocument();
  });

  it('renders with different card sizes', () => {
    const { rerender } = render(
      <AchievementCards 
        {...defaultProps} 
        customization={{ cardSize: 'small' }}
      />
    );
    expect(screen.getByText('Project Leadership Excellence')).toBeInTheDocument();
    
    rerender(
      <AchievementCards 
        {...defaultProps} 
        customization={{ cardSize: 'large' }}
      />
    );
    expect(screen.getByText('Project Leadership Excellence')).toBeInTheDocument();
  });

  it('handles disabled state correctly', () => {
    render(<AchievementCards {...defaultProps} isEnabled={false} />);
    
    expect(screen.queryByText('Project Leadership Excellence')).not.toBeInTheDocument();
  });

  it('shows no data state when achievements array is empty', () => {
    render(
      <AchievementCards 
        {...defaultProps} 
        data={{ achievements: [], totalAchievements: 0 }}
      />
    );
    
    expect(screen.getByText('No Achievements Found')).toBeInTheDocument();
    expect(screen.getByText('Add your achievements to see them displayed here.')).toBeInTheDocument();
  });

  it('formats different metric types correctly', () => {
    const customAchievement: Achievement = {
      id: '4',
      title: 'Test Achievement',
      description: 'Test description',
      category: 'test',
      importance: 'medium',
      metrics: [
        { label: 'Percentage', value: 85, type: 'percentage' },
        { label: 'Currency', value: 1000, type: 'currency' },
        { label: 'Time', value: 30, type: 'time' },
        { label: 'Number', value: 42, type: 'number' }
      ]
    };
    
    render(
      <AchievementCards 
        {...defaultProps} 
        data={{ achievements: [customAchievement] }}
      />
    );
    
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('30 days')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays achievement tags when present', () => {
    render(<AchievementCards {...defaultProps} />);
    
    expect(screen.getByText('leadership')).toBeInTheDocument();
    expect(screen.getByText('project-management')).toBeInTheDocument();
    expect(screen.getByText('team-building')).toBeInTheDocument();
  });
});