/**
 * LivePreview Component Tests
 *
 * Comprehensive test suite for the LivePreview component system
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LivePreview } from '../LivePreview';
import { ViewportControls } from '../ViewportControls';
import { PreviewPanel } from '../PreviewPanel';
import { EditorPanel } from '../EditorPanel';
import { SplitLayout } from '../SplitLayout';

const mockCVData = {
  personalInfo: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA'
  },
  summary: 'Experienced software developer with expertise in React and TypeScript.',
  experience: [
    {
      company: 'Tech Corp',
      position: 'Senior Developer',
      duration: '2021 - Present',
      description: 'Lead development of web applications using React and TypeScript.'
    }
  ],
  education: [
    {
      degree: 'Computer Science',
      institution: 'University of Technology',
      year: '2020'
    }
  ],
  skills: ['React', 'TypeScript', 'Node.js']
};

const mockTemplate = {
  id: 'modern',
  name: 'Modern Professional',
  emoji: '💼',
  category: 'Professional',
  isPremium: false
};

describe('LivePreview Component', () => {
  const defaultProps = {
    cvData: mockCVData,
    template: mockTemplate,
    onDataChange: jest.fn(),
    onTemplateChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<LivePreview {...defaultProps} />);
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('displays split view by default', () => {
    render(<LivePreview {...defaultProps} />);
    expect(screen.getByText('Split')).toHaveClass('bg-white shadow');
  });

  it('switches between preview modes', () => {
    render(<LivePreview {...defaultProps} />);

    // Switch to preview-only mode
    fireEvent.click(screen.getByText('Preview'));
    expect(screen.getByText('Preview')).toHaveClass('bg-white shadow');

    // Switch to editor-only mode
    fireEvent.click(screen.getByText('Editor'));
    expect(screen.getByText('Editor')).toHaveClass('bg-white shadow');
  });

  it('updates CV data when edited', async () => {
    const onDataChange = jest.fn();
    render(<LivePreview {...defaultProps} onDataChange={onDataChange} />);

    // Find and edit the name field
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

    await waitFor(() => {
      expect(onDataChange).toHaveBeenCalledWith(
        expect.objectContaining({
          personalInfo: expect.objectContaining({
            name: 'Jane Smith'
          })
        })
      );
    });
  });

  it('displays template comparison when requested', () => {
    render(<LivePreview {...defaultProps} />);

    // Open template settings
    const settingsButton = screen.getByTitle('Template Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Choose Template')).toBeInTheDocument();
  });

  it('handles fullscreen mode', () => {
    render(<LivePreview {...defaultProps} />);

    const fullscreenButton = screen.getByTitle('Fullscreen');
    fireEvent.click(fullscreenButton);

    // Should have fullscreen classes applied
    const container = screen.getByText('Live Preview').closest('.live-preview-container');
    expect(container).toHaveClass('fixed inset-0 z-50');
  });
});

describe('ViewportControls Component', () => {
  const controlProps = {
    currentMode: 'desktop' as const,
    onModeChange: jest.fn(),
    zoomLevel: 100 as const,
    onZoomChange: jest.fn(),
    orientation: 'portrait' as const,
    onOrientationToggle: jest.fn()
  };

  it('renders viewport mode buttons', () => {
    render(<ViewportControls {...controlProps} />);

    expect(screen.getByTitle('Desktop')).toBeInTheDocument();
    expect(screen.getByTitle('Tablet')).toBeInTheDocument();
    expect(screen.getByTitle('Mobile')).toBeInTheDocument();
    expect(screen.getByTitle('Print')).toBeInTheDocument();
  });

  it('handles viewport mode changes', () => {
    const onModeChange = jest.fn();
    render(<ViewportControls {...controlProps} onModeChange={onModeChange} />);

    fireEvent.click(screen.getByTitle('Mobile'));
    expect(onModeChange).toHaveBeenCalledWith('mobile');
  });

  it('controls zoom level', () => {
    const onZoomChange = jest.fn();
    render(<ViewportControls {...controlProps} onZoomChange={onZoomChange} />);

    // Test zoom out
    fireEvent.click(screen.getByTitle('Zoom Out'));
    expect(onZoomChange).toHaveBeenCalledWith(75);

    // Test zoom in
    fireEvent.click(screen.getByTitle('Zoom In'));
    expect(onZoomChange).toHaveBeenCalledWith(125);
  });

  it('shows orientation toggle for mobile devices', () => {
    render(<ViewportControls {...controlProps} currentMode="mobile" />);
    expect(screen.getByText('portrait')).toBeInTheDocument();

    fireEvent.click(screen.getByText('portrait'));
    expect(controlProps.onOrientationToggle).toHaveBeenCalled();
  });
});

describe('PreviewPanel Component', () => {
  const previewProps = {
    cvData: mockCVData,
    template: mockTemplate,
    viewportConfig: {
      mode: 'desktop' as const,
      width: 1920,
      height: 1080,
      orientation: 'portrait' as const
    },
    zoomLevel: 100 as const
  };

  it('renders CV content correctly', () => {
    render(<PreviewPanel {...previewProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('applies correct viewport scaling', () => {
    const { container } = render(<PreviewPanel {...previewProps} zoomLevel={50} />);

    const previewElement = container.querySelector('[style*="transform"]');
    expect(previewElement).toHaveStyle('transform: scale(0.5)');
  });

  it('handles missing CV data gracefully', () => {
    render(<PreviewPanel {...previewProps} cvData={null} />);

    expect(screen.getByText('No CV data available')).toBeInTheDocument();
    expect(screen.getByText('Upload a CV to see the preview')).toBeInTheDocument();
  });
});

describe('EditorPanel Component', () => {
  const editorProps = {
    cvData: mockCVData,
    onDataChange: jest.fn()
  };

  it('renders section tabs', () => {
    render(<EditorPanel {...editorProps} />);

    expect(screen.getByText('Personal Info')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });

  it('switches between sections', () => {
    render(<EditorPanel {...editorProps} />);

    fireEvent.click(screen.getByText('Summary'));
    expect(screen.getByText('Professional Summary')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Experience'));
    expect(screen.getByText('Work Experience')).toBeInTheDocument();
  });

  it('adds new experience entries', () => {
    const onDataChange = jest.fn();
    render(<EditorPanel {...editorProps} onDataChange={onDataChange} />);

    // Switch to experience tab
    fireEvent.click(screen.getByText('Experience'));

    // Click add experience button
    fireEvent.click(screen.getByText('Add Experience'));

    expect(onDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        experience: expect.arrayContaining([
          expect.objectContaining({
            company: '',
            position: '',
            duration: '',
            description: ''
          })
        ])
      })
    );
  });
});

describe('SplitLayout Component', () => {
  const editorPanel = <div>Editor Panel</div>;
  const previewPanel = <div>Preview Panel</div>;

  it('renders both panels', () => {
    render(
      <SplitLayout
        editorPanel={editorPanel}
        previewPanel={previewPanel}
      />
    );

    expect(screen.getByText('Editor Panel')).toBeInTheDocument();
    expect(screen.getByText('Preview Panel')).toBeInTheDocument();
  });

  it('allows resizing when enabled', () => {
    const { container } = render(
      <SplitLayout
        editorPanel={editorPanel}
        previewPanel={previewPanel}
        isResizable={true}
      />
    );

    const resizeHandle = container.querySelector('.cursor-col-resize');
    expect(resizeHandle).toBeInTheDocument();
  });

  it('disables resizing when specified', () => {
    const { container } = render(
      <SplitLayout
        editorPanel={editorPanel}
        previewPanel={previewPanel}
        isResizable={false}
      />
    );

    const resizeHandle = container.querySelector('.cursor-col-resize');
    expect(resizeHandle).not.toBeInTheDocument();
  });
});

// Integration tests
describe('LivePreview Integration', () => {
  it('synchronizes editor changes with preview', async () => {
    render(<LivePreview cvData={mockCVData} />);

    // Edit name in editor
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

    // Check that preview is updated
    await waitFor(() => {
      const previewNames = screen.getAllByText('Jane Smith');
      expect(previewNames.length).toBeGreaterThan(0);
    });
  });

  it('maintains state across mode switches', () => {
    render(<LivePreview cvData={mockCVData} />);

    // Edit data
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

    // Switch to preview-only mode
    fireEvent.click(screen.getByText('Preview'));

    // Switch back to split mode
    fireEvent.click(screen.getByText('Split'));

    // Data should be preserved
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
  });
});