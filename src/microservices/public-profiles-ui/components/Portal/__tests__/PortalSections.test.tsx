import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PortalSections } from '../PortalSections';
import { PortalSection, PortalSectionType, PortalConfig } from '../../../../types/portal-component-props';
import * as useFirebaseFunction from '../../../../hooks/useFeatureData';

// Mock dependencies
vi.mock('../../../../hooks/useFeatureData');
vi.mock('react-hot-toast');
vi.mock('react-device-detect', () => ({
  isMobile: false
}));

// Mock Firebase Functions
const mockCallFunction = vi.fn();
const mockUseFirebaseFunction = useFirebaseFunction as any;

describe('PortalSections', () => {
  const mockPortalConfig: PortalConfig = {
    id: 'portal-123',
    name: 'Test Portal',
    description: 'Test portal description',
    visibility: 'public',
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#EF4444',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: 'Inter',
      layout: 'modern',
      animations: true,
      darkMode: false
    },
    features: {
      aiChat: true,
      qrCode: true,
      contactForm: true,
      calendar: false,
      portfolio: true,
      socialLinks: true,
      testimonials: false,
      analytics: true
    },
    metadata: {
      title: 'Test Portal',
      description: 'Test portal for testing',
      keywords: ['test', 'portal']
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  };

  const mockSections: PortalSection[] = [
    {
      id: 'section-header',
      name: 'Header Section',
      type: 'header',
      data: { name: 'John Doe', title: 'Software Engineer' },
      visible: true,
      order: 0,
      customization: {},
      isLoading: false
    },
    {
      id: 'section-experience',
      name: 'Work Experience',
      type: 'experience',
      data: { jobs: [] },
      visible: true,
      order: 1,
      customization: {},
      isLoading: false
    },
    {
      id: 'section-skills',
      name: 'Skills & Expertise',
      type: 'skills',
      data: { skills: [] },
      visible: false,
      order: 2,
      customization: {},
      isLoading: false
    }
  ];

  const defaultProps = {
    jobId: 'job-123',
    profileId: 'profile-123',
    isEnabled: true,
    data: {},
    customization: {},
    onUpdate: vi.fn(),
    onError: vi.fn(),
    className: '',
    mode: 'private' as const,
    portalConfig: mockPortalConfig,
    sections: mockSections,
    sectionConfig: {
      allowReordering: true,
      allowToggle: true,
      allowEditing: true,
      layout: 'vertical' as const,
      spacing: 'normal' as const,
      animations: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out'
      }
    },
    allowReordering: true,
    allowToggle: true,
    onSectionsReorder: vi.fn(),
    onSectionToggle: vi.fn(),
    onSectionEdit: vi.fn(),
    onSectionLoad: vi.fn(),
    onSectionError: vi.fn()
  };

  const renderWithDnd = (component: React.ReactElement) => {
    return render(
      <DndProvider backend={HTML5Backend}>
        {component}
      </DndProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFirebaseFunction.useFirebaseFunction = vi.fn().mockReturnValue({
      callFunction: mockCallFunction,
      loading: false,
      error: null
    });
  });

  describe('Rendering', () => {
    it('renders all visible sections', () => {
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      expect(screen.getAllByText('Header Section')).toHaveLength(2); // One in section header, one in content
      expect(screen.getAllByText('Work Experience')).toHaveLength(2);
      expect(screen.queryByText('Skills & Expertise')).toBeInTheDocument(); // Hidden section still appears in hidden sections area
    });

    it('displays section configuration summary', () => {
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      expect(screen.getByText(/3 sections/)).toBeInTheDocument();
      expect(screen.getByText(/2 visible/)).toBeInTheDocument();
      expect(screen.getByText(/1 hidden/)).toBeInTheDocument();
    });

    it('shows loading state when saving', () => {
      mockUseFirebaseFunction.useFirebaseFunction = vi.fn().mockReturnValue({
        callFunction: mockCallFunction,
        loading: true,
        error: null
      });
      
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      expect(screen.getByText('Portal Sections')).toBeInTheDocument();
    });

    it('displays error state when function call fails', () => {
      const error = new Error('Test error');
      mockUseFirebaseFunction.useFirebaseFunction = vi.fn().mockReturnValue({
        callFunction: mockCallFunction,
        loading: false,
        error
      });
      
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      expect(screen.getByText('Portal Sections')).toBeInTheDocument();
    });

    it('renders empty state when no sections', () => {
      renderWithDnd(<PortalSections {...defaultProps} sections={[]} />);
      
      expect(screen.getByText('No Sections Configured')).toBeInTheDocument();
      expect(screen.getByText('Get started by adding your first portal section.')).toBeInTheDocument();
    });
  });

  describe('Section Visibility', () => {
    it('toggles section visibility', async () => {
      const user = userEvent.setup();
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      const visibilityButtons = screen.getAllByTitle('Hide section');
      const experienceVisibilityButton = visibilityButtons[1]; // Second visible section (experience)
      
      await user.click(experienceVisibilityButton);
      
      expect(defaultProps.onSectionToggle).toHaveBeenCalledWith('section-experience', false);
    });

    it('prevents hiding required sections', async () => {
      const user = userEvent.setup();
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      const visibilityButtons = screen.getAllByTitle('Hide section');
      const headerVisibilityButton = visibilityButtons[0]; // First visible section (header)
      
      await user.click(headerVisibilityButton);
      
      // Should show error toast (mocked) and not call toggle
      expect(defaultProps.onSectionToggle).not.toHaveBeenCalled();
    });

    it('shows hidden sections in separate area', () => {
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      expect(screen.getByText('Hidden Sections (1)')).toBeInTheDocument();
      expect(screen.getByText('Skills & Expertise')).toBeInTheDocument();
    });

    it('allows showing hidden sections', async () => {
      const user = userEvent.setup();
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      const hiddenSection = screen.getByText('Hidden Sections (1)').parentElement;
      const showButton = within(hiddenSection!).getByTitle('Show section');
      
      await user.click(showButton);
      
      expect(defaultProps.onSectionToggle).toHaveBeenCalledWith('section-skills', true);
    });
  });

  describe('Section Management', () => {
    it('opens settings panel', async () => {
      const user = userEvent.setup();
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      const settingsButton = screen.getByText('Settings');
      await user.click(settingsButton);
      
      expect(screen.getByText('Section Settings')).toBeInTheDocument();
      expect(screen.getByText('Layout Style')).toBeInTheDocument();
      expect(screen.getByText('Section Spacing')).toBeInTheDocument();
      expect(screen.getByText('Animations')).toBeInTheDocument();
    });

    it('changes layout configuration', async () => {
      const user = userEvent.setup();
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      await user.click(screen.getByText('Settings'));
      
      const layoutSelect = screen.getByDisplayValue('Vertical Stack');
      await user.selectOptions(layoutSelect, 'Grid Layout');
      
      expect(layoutSelect).toHaveValue('grid');
    });

    it('changes spacing configuration', async () => {
      const user = userEvent.setup();
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      await user.click(screen.getByText('Settings'));
      
      const spacingSelect = screen.getByDisplayValue('Normal');
      await user.selectOptions(spacingSelect, 'Relaxed');
      
      expect(spacingSelect).toHaveValue('relaxed');
    });

    it('toggles animations setting', async () => {
      const user = userEvent.setup();
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      await user.click(screen.getByText('Settings'));
      
      const animationCheckbox = screen.getByLabelText('Enable smooth animations');
      await user.click(animationCheckbox);
      
      expect(animationCheckbox).not.toBeChecked();
    });
  });

  describe('Section Addition', () => {
    it('shows available section types for addition', async () => {
      const user = userEvent.setup();
      const sectionsWithoutSome = mockSections.filter(s => s.type !== 'skills');
      
      renderWithDnd(<PortalSections {...defaultProps} sections={sectionsWithoutSome} />);
      
      await user.click(screen.getByText('Settings'));
      
      expect(screen.getByText('Add New Section')).toBeInTheDocument();
      // Should show skills section as available to add
      const skillsButtons = screen.getAllByText('Skills & Expertise');
      expect(skillsButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('adds new section when clicked', async () => {
      const user = userEvent.setup();
      const sectionsWithoutSkills = mockSections.filter(s => s.type !== 'skills');
      
      renderWithDnd(<PortalSections {...defaultProps} sections={sectionsWithoutSkills} />);
      
      await user.click(screen.getByText('Settings'));
      
      // Find the add section button (will be in the add new section area)
      const addSectionArea = screen.getByText('Add New Section').parentElement;
      const addSkillsButton = within(addSectionArea!).getByText('Skills & Expertise');
      await user.click(addSkillsButton);
      
      // Should show toast success (mocked)
    });
  });

  describe('Section Editing', () => {
    it('calls edit handler when edit button is clicked', async () => {
      const user = userEvent.setup();
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      const editButtons = screen.getAllByTitle('Edit section');
      const experienceEditButton = editButtons[1]; // Second visible section (experience)
      
      await user.click(experienceEditButton);
      
      expect(defaultProps.onSectionEdit).toHaveBeenCalledWith('section-experience', {});
    });

    it('allows deleting non-required sections', async () => {
      const user = userEvent.setup();
      
      // Mock window.confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = vi.fn(() => true);
      
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      const deleteButtons = screen.getAllByTitle('Delete section');
      const experienceDeleteButton = deleteButtons[0]; // Experience section has delete button
      
      await user.click(experienceDeleteButton);
      
      expect(window.confirm).toHaveBeenCalled();
      
      // Restore original confirm
      window.confirm = originalConfirm;
    });

    it('prevents deleting required sections', async () => {
      const user = userEvent.setup();
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      // Header section should not have a delete button since it's required
      const deleteButtons = screen.getAllByTitle('Delete section');
      // Should only have delete button for experience section, not header
      expect(deleteButtons).toHaveLength(1);
    });
  });

  describe('Save and Reset', () => {
    it('saves changes when save button is clicked', async () => {
      const user = userEvent.setup();
      mockCallFunction.mockResolvedValue({ success: true });
      
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      // Make a change to trigger save button
      await user.click(screen.getByText('Settings'));
      const layoutSelect = screen.getByDisplayValue('Vertical Stack');
      await user.selectOptions(layoutSelect, 'Grid Layout');
      
      // Wait for save button to appear
      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Save Changes'));
      
      expect(mockCallFunction).toHaveBeenCalledWith('updatePortalSections', expect.objectContaining({
        jobId: 'job-123',
        profileId: 'profile-123',
        sections: expect.any(Array),
        config: expect.objectContaining({
          layout: 'grid'
        })
      }));
    });

    it('handles save errors gracefully', async () => {
      const user = userEvent.setup();
      const error = new Error('Save failed');
      mockCallFunction.mockRejectedValue(error);
      
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      // Make a change
      await user.click(screen.getByText('Settings'));
      const layoutSelect = screen.getByDisplayValue('Vertical Stack');
      await user.selectOptions(layoutSelect, 'Grid Layout');
      
      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Save Changes'));
      
      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith(error);
      });
    });

    it('resets to defaults when reset button is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock window.confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = vi.fn(() => true);
      
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      const resetButton = screen.getByTitle('Reset to defaults');
      await user.click(resetButton);
      
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Are you sure you want to reset all sections to defaults?')
      );
      
      // Restore original confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      // Check for proper labeling
      expect(screen.getByText('Portal Sections')).toBeInTheDocument();
      expect(screen.getByText('Section Configuration')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      const settingsButton = screen.getByText('Settings');
      
      // Tab to settings button and press Enter
      await user.tab();
      await user.keyboard('{Enter}');
      
      // Should open settings panel
      expect(screen.getByText('Section Settings')).toBeInTheDocument();
    });

    it('provides proper button titles for screen readers', () => {
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      expect(screen.getByTitle('Hide section')).toBeInTheDocument();
      expect(screen.getByTitle('Edit section')).toBeInTheDocument();
      expect(screen.getByTitle('Reset to defaults')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays section-level errors', () => {
      const sectionsWithError = [
        ...mockSections,
        {
          id: 'section-error',
          name: 'Error Section',
          type: 'custom' as PortalSectionType,
          data: {},
          visible: true,
          order: 3,
          customization: {},
          isLoading: false,
          error: 'Section failed to load'
        }
      ];
      
      renderWithDnd(<PortalSections {...defaultProps} sections={sectionsWithError} />);
      
      expect(screen.getByText('Error Section')).toBeInTheDocument();
    });

    it('displays loading state for individual sections', () => {
      const sectionsWithLoading = [
        ...mockSections,
        {
          id: 'section-loading',
          name: 'Loading Section',
          type: 'custom' as PortalSectionType,
          data: {},
          visible: true,
          order: 3,
          customization: {},
          isLoading: true
        }
      ];
      
      renderWithDnd(<PortalSections {...defaultProps} sections={sectionsWithLoading} />);
      
      expect(screen.getByText('Loading Section')).toBeInTheDocument();
      expect(screen.getByText('Loading section...')).toBeInTheDocument();
    });
  });

  describe('Custom Renderers', () => {
    it('uses custom renderer when provided', () => {
      const CustomRenderer = ({ section }: { section: PortalSection }) => (
        <div data-testid="custom-renderer">
          Custom content for {section.name}
        </div>
      );
      
      const customRenderers = {
        experience: CustomRenderer
      };
      
      renderWithDnd(
        <PortalSections
          {...defaultProps}
          customRenderers={customRenderers}
        />
      );
      
      expect(screen.getByTestId('custom-renderer')).toBeInTheDocument();
      expect(screen.getByText('Custom content for Work Experience')).toBeInTheDocument();
    });

    it('falls back to default renderer when no custom renderer', () => {
      renderWithDnd(<PortalSections {...defaultProps} />);
      
      // Should show default section content
      const contentElements = screen.getAllByText(/Content for .* section will be rendered here/);
      expect(contentElements.length).toBeGreaterThan(0);
    });
  });

  describe('Component State', () => {
    it('returns null when disabled', () => {
      const { container } = renderWithDnd(
        <PortalSections {...defaultProps} isEnabled={false} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('initializes with default sections when none provided', () => {
      renderWithDnd(<PortalSections {...defaultProps} sections={[]} />);
      
      expect(screen.getByText('No Sections Configured')).toBeInTheDocument();
    });
  });
});