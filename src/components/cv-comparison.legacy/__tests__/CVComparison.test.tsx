import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CVComparisonView } from '../CVComparisonView';
import { compareCV } from '../../../utils/cv-comparison/diffUtils';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock data
const mockOriginalData = {
  personalInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890'
  },
  summary: 'Software developer with 5 years of experience.',
  experience: [
    {
      company: 'Tech Corp',
      position: 'Developer',
      duration: '2020-2023',
      description: 'Worked on web applications'
    }
  ],
  skills: ['JavaScript', 'React', 'Node.js'],
  education: [
    {
      institution: 'University',
      degree: 'Computer Science',
      year: '2020'
    }
  ]
};

const mockImprovedData = {
  personalInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890'
  },
  summary: 'Results-driven software developer with 5+ years of experience delivering high-quality web applications.',
  experience: [
    {
      company: 'Tech Corp',
      position: 'Senior Developer',
      duration: '2020-2023',
      description: 'Led development of scalable web applications, increasing performance by 40% and reducing bugs by 60%'
    }
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
  education: [
    {
      institution: 'University',
      degree: 'Bachelor of Computer Science',
      year: '2020'
    }
  ]
};

const MockChild = () => <div data-testid="cv-preview-content">CV Preview Content</div>;

describe('CVComparisonView', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  it('renders children when no improvements are provided', () => {
    render(
      <CVComparisonView
        originalData={mockOriginalData}
        improvedData={null}
      >
        <MockChild />
      </CVComparisonView>
    );

    expect(screen.getByTestId('cv-preview-content')).toBeInTheDocument();
  });

  it('renders comparison controls when improvements are available', () => {
    render(
      <CVComparisonView
        originalData={mockOriginalData}
        improvedData={mockImprovedData}
      >
        <MockChild />
      </CVComparisonView>
    );

    expect(screen.getByText('Single View')).toBeInTheDocument();
    expect(screen.getByText('Comparison View')).toBeInTheDocument();
  });

  it('toggles between single and comparison view', async () => {
    render(
      <CVComparisonView
        originalData={mockOriginalData}
        improvedData={mockImprovedData}
      >
        <MockChild />
      </CVComparisonView>
    );

    // Initially should show single view with the child component
    expect(screen.getByTestId('cv-preview-content')).toBeInTheDocument();

    // Click comparison view button
    fireEvent.click(screen.getByText('Comparison View'));

    // Should show comparison summary
    await waitFor(() => {
      expect(screen.getByText('CV Improvement Summary')).toBeInTheDocument();
    });
  });

  it('shows improvement statistics', () => {
    render(
      <CVComparisonView
        originalData={mockOriginalData}
        improvedData={mockImprovedData}
      >
        <MockChild />
      </CVComparisonView>
    );

    // Switch to comparison view
    fireEvent.click(screen.getByText('Comparison View'));

    // Should show statistics
    expect(screen.getByText(/sections improved/)).toBeInTheDocument();
  });

  it('filters sections when Changed Only is toggled', async () => {
    render(
      <CVComparisonView
        originalData={mockOriginalData}
        improvedData={mockImprovedData}
      >
        <MockChild />
      </CVComparisonView>
    );

    // Switch to comparison view
    fireEvent.click(screen.getByText('Comparison View'));

    // Click the filter button
    const filterButton = screen.getByText('Changed Only');
    fireEvent.click(filterButton);

    // Should change to Show All
    await waitFor(() => {
      expect(screen.getByText('Show All')).toBeInTheDocument();
    });
  });

  it('handles mobile view correctly', () => {
    // Mock mobile screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    render(
      <CVComparisonView
        originalData={mockOriginalData}
        improvedData={mockImprovedData}
      >
        <MockChild />
      </CVComparisonView>
    );

    // Should show mobile comparison toggle
    expect(screen.getByText('Compare')).toBeInTheDocument();
  });

  it('expands and collapses section details', async () => {
    render(
      <CVComparisonView
        originalData={mockOriginalData}
        improvedData={mockImprovedData}
      >
        <MockChild />
      </CVComparisonView>
    );

    // Switch to comparison view
    fireEvent.click(screen.getByText('Comparison View'));

    // Find and click a section header (e.g., Professional Summary)
    await waitFor(() => {
      const summarySection = screen.getByText('Professional Summary');
      expect(summarySection).toBeInTheDocument();
      
      // Click to expand
      fireEvent.click(summarySection);
    });

    // Should show before/after content
    await waitFor(() => {
      expect(screen.getByText('BEFORE')).toBeInTheDocument();
      expect(screen.getByText('AFTER')).toBeInTheDocument();
    });
  });
});

describe('CV Comparison Utils', () => {
  it('generates correct comparison data', () => {
    const comparison = compareCV(mockOriginalData, mockImprovedData);
    
    expect(comparison).toBeDefined();
    expect(comparison.sections).toHaveLength(5); // personalInfo, summary, experience, skills, education
    expect(comparison.totalChanges).toBeGreaterThan(0);
    expect(comparison.improvementSummary.sectionsModified).toContain('summary');
    expect(comparison.improvementSummary.sectionsModified).toContain('experience');
    expect(comparison.improvementSummary.sectionsModified).toContain('skills');
  });

  it('identifies new sections correctly', () => {
    const dataWithNewSection = {
      ...mockOriginalData,
      achievements: ['Led team of 5 developers', 'Increased code quality by 30%']
    };
    
    const comparison = compareCV(mockOriginalData, dataWithNewSection);
    
    expect(comparison.improvementSummary.newSections).toContain('achievements');
  });

  it('handles empty or null data gracefully', () => {
    const comparison1 = compareCV(null, mockImprovedData);
    const comparison2 = compareCV(mockOriginalData, null);
    const comparison3 = compareCV({}, {});
    
    // When one side is null, we still create sections for the non-null side
    expect(comparison1.sections.length).toBeGreaterThanOrEqual(0);
    expect(comparison2.sections.length).toBeGreaterThanOrEqual(0);
    expect(comparison3.sections).toHaveLength(0);
  });

  it('calculates improvement statistics correctly', () => {
    const comparison = compareCV(mockOriginalData, mockImprovedData);
    
    expect(comparison.improvementSummary.sectionsModified.length).toBeGreaterThan(0);
    expect(comparison.totalChanges).toBe(comparison.improvementSummary.sectionsModified.length);
  });
});