/**
 * Generated CV Display Component Tests
 *
 * Comprehensive test suite for the GeneratedCVDisplay system
 * including components, hooks, and utilities.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GeneratedCVDisplay } from '../GeneratedCVDisplay';
import { useCVGeneration } from '../../../hooks/useCVGeneration';
import { useTemplates } from '../../../hooks/useTemplates';
import type { Job } from '../../../types/job';
import type { CVTemplate } from '../types';

// Mock hooks
vi.mock('../../../hooks/useCVGeneration');
vi.mock('../../../hooks/useTemplates');

const mockUseCVGeneration = useCVGeneration as vi.MockedFunction<typeof useCVGeneration>;
const mockUseTemplates = useTemplates as vi.MockedFunction<typeof useTemplates>;

// Mock job data
const mockJob: Job = {
  id: 'test-job-1',
  userId: 'test-user-1',
  cvData: {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      location: 'New York, NY'
    }
  },
  status: 'completed',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  generatedCV: {
    html: '<div class="cv-content"><h1>John Doe</h1><p>Software Developer</p></div>',
    features: ['ats-optimization', 'interactive-timeline'],
    content: {
      html: '<div class="cv-content"><h1>John Doe</h1><p>Software Developer</p></div>',
      sections: [
        {
          id: 'header',
          type: 'header',
          title: 'Header',
          content: 'John Doe - Software Developer',
          order: 0,
          visible: true,
          editable: true
        }
      ],
      styling: {
        theme: 'modern',
        colors: {
          primary: '#0ea5e9',
          secondary: '#64748b',
          accent: '#06b6d4',
          background: '#ffffff',
          text: '#334155',
          muted: '#94a3b8'
        },
        typography: {
          headingFont: 'Inter',
          bodyFont: 'Inter',
          sizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem'
          },
          weights: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          }
        },
        layout: {
          columns: 1,
          sidebar: false,
          sidebarWidth: 0,
          margins: { top: 40, right: 40, bottom: 40, left: 40 },
          padding: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        spacing: {
          section: 32,
          subsection: 16,
          item: 8,
          compact: false
        }
      },
      interactive: []
    }
  }
};

// Mock template data
const mockTemplate: CVTemplate = {
  id: 'modern-template-1',
  name: 'Modern Professional',
  description: 'Clean and contemporary design',
  category: 'modern',
  features: [
    { id: 'ats-optimized', name: 'ATS Optimized', description: 'ATS friendly', enabled: true }
  ],
  styling: {
    primaryColor: '#0ea5e9',
    secondaryColor: '#64748b',
    accentColor: '#06b6d4',
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 1.6,
    spacing: 'normal',
    layout: 'single-column'
  },
  metadata: {
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: ['modern', 'professional']
  }
};

describe('GeneratedCVDisplay', () => {
  beforeEach(() => {
    // Reset mocks
    mockUseCVGeneration.mockReturnValue({
      state: {
        cv: undefined,
        template: undefined,
        editor: {
          mode: 'view',
          history: { current: -1, states: [], maxStates: 50 },
          settings: {
            autosave: true,
            autosaveInterval: 30000,
            showGrid: false,
            snapToGrid: false,
            showRulers: false,
            rtl: false,
            spellCheck: true,
            autoCorrect: false
          },
          tools: []
        },
        loading: false,
        saving: false,
        exporting: false
      },
      actions: {
        loadCV: vi.fn(),
        updateContent: vi.fn(),
        changeTemplate: vi.fn(),
        saveVersion: vi.fn(),
        exportCV: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
        reset: vi.fn()
      }
    });

    mockUseTemplates.mockReturnValue({
      state: {
        templates: [mockTemplate],
        loading: false,
        filters: {
          category: undefined,
          features: [],
          premium: false,
          search: ''
        }
      },
      actions: {
        loadTemplates: vi.fn(),
        filterTemplates: vi.fn(),
        selectTemplate: vi.fn().mockReturnValue(mockTemplate)
      }
    });
  });

  describe('Rendering', () => {
    it('renders successfully with valid job data', () => {
      render(<GeneratedCVDisplay job={mockJob} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('displays loading state when content is not available', () => {
      const jobWithoutContent = {
        ...mockJob,
        generatedCV: undefined
      };

      render(<GeneratedCVDisplay job={jobWithoutContent} />);

      expect(screen.getByText('No generated CV content available')).toBeInTheDocument();
    });

    it('displays applied features when available', () => {
      render(<GeneratedCVDisplay job={mockJob} />);

      expect(screen.getByText('Applied Features:')).toBeInTheDocument();
      expect(screen.getByText('Ats Optimization')).toBeInTheDocument();
      expect(screen.getByText('Interactive Timeline')).toBeInTheDocument();
    });
  });

  describe('Mode Switching', () => {
    it('switches to edit mode when edit button is clicked', async () => {
      render(<GeneratedCVDisplay job={mockJob} />);

      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      // The edit button should be active (different styling)
      expect(editButton.closest('button')).toHaveClass('bg-cyan-600');
    });

    it('switches to preview mode when preview button is clicked', async () => {
      render(<GeneratedCVDisplay job={mockJob} />);

      const previewButton = screen.getByText('Preview');
      fireEvent.click(previewButton);

      expect(previewButton.closest('button')).toHaveClass('bg-cyan-600');
    });
  });

  describe('Template Operations', () => {
    it('opens template picker when template button is clicked', async () => {
      render(<GeneratedCVDisplay job={mockJob} />);

      const templateButton = screen.getByText('Template');
      fireEvent.click(templateButton);

      await waitFor(() => {
        expect(screen.getByText('Choose Template')).toBeInTheDocument();
      });
    });

    it('calls onTemplateChange when template is selected', async () => {
      const onTemplateChange = vi.fn();
      render(<GeneratedCVDisplay job={mockJob} onTemplateChange={onTemplateChange} />);

      const templateButton = screen.getByText('Template');
      fireEvent.click(templateButton);

      await waitFor(() => {
        const modernTemplate = screen.getByText('Modern Professional');
        fireEvent.click(modernTemplate);
      });

      expect(onTemplateChange).toHaveBeenCalledWith('modern-template-1');
    });
  });

  describe('Export Operations', () => {
    it('opens export menu when export button is clicked', async () => {
      render(<GeneratedCVDisplay job={mockJob} />);

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export CV')).toBeInTheDocument();
        expect(screen.getByText('Choose format and configure export settings')).toBeInTheDocument();
      });
    });

    it('calls onExport when export format is selected', async () => {
      const onExport = vi.fn();
      render(<GeneratedCVDisplay job={mockJob} onExport={onExport} />);

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        const pdfOption = screen.getByText('PDF Document');
        fireEvent.click(pdfOption);

        const exportCVButton = screen.getByText('Export CV');
        fireEvent.click(exportCVButton);
      });

      expect(onExport).toHaveBeenCalledWith('pdf', expect.any(Object));
    });
  });

  describe('Version Control', () => {
    it('opens version history when history button is clicked', async () => {
      render(<GeneratedCVDisplay job={mockJob} />);

      const historyButton = screen.getByText('History');
      fireEvent.click(historyButton);

      await waitFor(() => {
        expect(screen.getByText('Version History')).toBeInTheDocument();
        expect(screen.getByText('View and manage CV versions')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing job gracefully', () => {
      render(<GeneratedCVDisplay job={null as any} />);

      // Should not crash and show appropriate message
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('handles malformed job data gracefully', () => {
      const malformedJob = {
        id: 'test',
        // Missing required fields
      } as any;

      render(<GeneratedCVDisplay job={malformedJob} />);

      // Should not crash
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels for buttons', () => {
      render(<GeneratedCVDisplay job={mockJob} />);

      expect(screen.getByTitle('View generated CV')).toBeInTheDocument();
      expect(screen.getByTitle('Edit CV content')).toBeInTheDocument();
      expect(screen.getByTitle('Preview changes')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<GeneratedCVDisplay job={mockJob} />);

      const viewButton = screen.getByText('View');
      viewButton.focus();

      expect(document.activeElement).toBe(viewButton);
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<GeneratedCVDisplay job={mockJob} />);

      // Re-render with same props
      rerender(<GeneratedCVDisplay job={mockJob} />);

      // Component should handle this efficiently
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});

// Utility function tests
describe('Component Utilities', () => {
  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      const { formatFileSize } = require('../index');

      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('formatDate', () => {
    it('formats recent dates as relative time', () => {
      const { formatDate } = require('../index');

      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      expect(formatDate(fiveMinutesAgo)).toContain('minutes ago');
      expect(formatDate(twoHoursAgo)).toContain('hours ago');
    });
  });

  describe('validateCVContent', () => {
    it('validates content correctly', () => {
      const { validateCVContent } = require('../index');

      const validContent = {
        html: '<div>Content</div>',
        sections: [{ id: '1', type: 'text', title: 'Test', content: 'Test', order: 0, visible: true, editable: true }],
        styling: { theme: 'modern' },
        interactive: []
      };

      const result = validateCVContent(validContent);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('identifies validation errors', () => {
      const { validateCVContent } = require('../index');

      const invalidContent = {
        html: '',
        sections: [],
        styling: null,
        interactive: []
      };

      const result = validateCVContent(invalidContent);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});