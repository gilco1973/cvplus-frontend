import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  Save,
  AlertCircle,
  CheckCircle,
  Edit3,
  Layout
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';
import toast from 'react-hot-toast';
import { PortalSectionsProps, PortalSection, PortalSectionType, PortalError } from '../../../types/portal-component-props';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorBoundary, FunctionalErrorBoundary } from '../Common/ErrorBoundary';
import { useFirebaseFunction } from '../../../hooks/useFeatureData';

// Section type configurations
const SECTION_CONFIGS = {
  header: {
    name: 'Header Section',
    icon: '👤',
    description: 'Profile photo, name, and title',
    defaultVisible: true,
    required: true
  },
  summary: {
    name: 'Professional Summary',
    icon: '📝',
    description: 'Brief overview of experience and goals',
    defaultVisible: true,
    required: false
  },
  experience: {
    name: 'Work Experience',
    icon: '💼',
    description: 'Professional work history and achievements',
    defaultVisible: true,
    required: false
  },
  education: {
    name: 'Education',
    icon: '🎓',
    description: 'Academic background and qualifications',
    defaultVisible: true,
    required: false
  },
  skills: {
    name: 'Skills & Expertise',
    icon: '⚡',
    description: 'Technical and soft skills',
    defaultVisible: true,
    required: false
  },
  projects: {
    name: 'Projects',
    icon: '🚀',
    description: 'Notable projects and contributions',
    defaultVisible: true,
    required: false
  },
  achievements: {
    name: 'Achievements',
    icon: '🏆',
    description: 'Awards, recognition, and accomplishments',
    defaultVisible: false,
    required: false
  },
  certifications: {
    name: 'Certifications',
    icon: '📜',
    description: 'Professional certifications and licenses',
    defaultVisible: false,
    required: false
  },
  languages: {
    name: 'Languages',
    icon: '🌍',
    description: 'Language proficiency levels',
    defaultVisible: false,
    required: false
  },
  testimonials: {
    name: 'Testimonials',
    icon: '💬',
    description: 'Recommendations and testimonials',
    defaultVisible: false,
    required: false
  },
  contact: {
    name: 'Contact Information',
    icon: '📞',
    description: 'Contact details and social links',
    defaultVisible: true,
    required: false
  },
  portfolio: {
    name: 'Portfolio Gallery',
    icon: '🎨',
    description: 'Visual portfolio and work samples',
    defaultVisible: false,
    required: false
  },
  social: {
    name: 'Social Links',
    icon: '🔗',
    description: 'Social media and professional profiles',
    defaultVisible: false,
    required: false
  },
  custom: {
    name: 'Custom Section',
    icon: '🔧',
    description: 'Custom content section',
    defaultVisible: false,
    required: false
  }
} as const;

// Animation variants
const ANIMATION_VARIANTS = {
  fade: 'opacity transition-opacity duration-300',
  slide: 'transform transition-transform duration-300',
  none: ''
} as const;

// DnD item types
const ItemTypes = {
  SECTION: 'section'
} as const;

// Draggable section item component
interface DraggableSectionProps {
  section: PortalSection;
  index: number;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  onToggleVisibility: (sectionId: string, visible: boolean) => void;
  onEditSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  allowReordering: boolean;
  allowToggle: boolean;
  allowEditing: boolean;
  animationDuration: number;
  children: React.ReactNode;
}

const DraggableSection: React.FC<DraggableSectionProps> = ({
  section,
  index,
  moveSection,
  onToggleVisibility,
  onEditSection,
  onDeleteSection,
  allowReordering,
  allowToggle,
  allowEditing,
  animationDuration,
  children
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const config = SECTION_CONFIGS[section.type as keyof typeof SECTION_CONFIGS];

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SECTION,
    item: { index, section },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    canDrag: allowReordering && !config?.required
  });

  const [, drop] = useDrop({
    accept: ItemTypes.SECTION,
    hover: (item: { index: number; section: PortalSection }) => {
      if (!ref.current || !allowReordering) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;
      
      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    drop: () => {
      setIsDragOver(false);
    },
    collect: (monitor) => {
      const isOver = monitor.isOver();
      if (isOver !== isDragOver) {
        setIsDragOver(isOver);
      }
    }
  });

  drag(drop(ref));

  const handleToggleVisibility = useCallback(() => {
    if (config?.required) {
      toast.error('This section is required and cannot be hidden');
      return;
    }
    onToggleVisibility(section.id, !section.visible);
  }, [section.id, section.visible, onToggleVisibility, config]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    onEditSection(section.id);
  }, [section.id, onEditSection]);

  const handleDelete = useCallback(() => {
    if (config?.required) {
      toast.error('This section is required and cannot be deleted');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the ${config?.name || section.name} section?`)) {
      onDeleteSection(section.id);
    }
  }, [section.id, section.name, onDeleteSection, config]);

  return (
    <div
      ref={ref}
      className={`
        relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-${animationDuration}
        ${
          isDragging
            ? 'opacity-50 scale-95 border-blue-300 shadow-lg'
            : isDragOver
            ? 'border-blue-400 shadow-md transform scale-105'
            : section.visible
            ? 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            : 'border-gray-100 dark:border-gray-800 opacity-60'
        }
        ${
          section.error
            ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
            : section.isLoading
            ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
            : ''
        }
      `}
      style={{
        order: section.order,
        display: section.visible ? 'block' : 'none'
      }}
    >
      {/* Section Header Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          {allowReordering && !config?.required && (
            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          
          {/* Section Icon & Info */}
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label={config?.name || section.name}>
              {config?.icon || '📄'}
            </span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {config?.name || section.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {config?.description || 'Custom section'}
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-1">
            {section.isLoading && (
              <div className="w-4 h-4 animate-spin border-2 border-blue-600 border-t-transparent rounded-full" />
            )}
            {section.error && (
              <AlertCircle className="w-4 h-4 text-red-500" title={section.error} />
            )}
            {config?.required && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Required</span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Visibility Toggle */}
          {allowToggle && (
            <button
              onClick={handleToggleVisibility}
              disabled={config?.required}
              className={`
                p-1.5 rounded transition-colors
                ${
                  section.visible
                    ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                ${config?.required ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={section.visible ? 'Hide section' : 'Show section'}
            >
              {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          )}
          
          {/* Edit Button */}
          {allowEditing && (
            <button
              onClick={handleEdit}
              className="p-1.5 rounded text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
              title="Edit section"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          
          {/* Delete Button */}
          {allowEditing && !config?.required && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              title="Delete section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Section Content */}
      {section.visible && (
        <div className="p-4">
          {section.isLoading ? (
            <LoadingSpinner size="medium" message="Loading section..." />
          ) : section.error ? (
            <FunctionalErrorBoundary
              error={new Error(section.error)}
              title="Section Error"
              onRetry={() => window.location.reload()}
            />
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
};

// Main PortalSections component
export const PortalSections: React.FC<PortalSectionsProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization = {},
  onUpdate,
  onError,
  className = '',
  mode = 'private',
  portalConfig,
  sections: initialSections = [],
  sectionConfig = {},
  allowReordering = true,
  allowToggle = true,
  onSectionsReorder,
  onSectionToggle,
  renderOptions = {},
  templates = {},
  onSectionReorder,
  onSectionEdit,
  onSectionLoad,
  onSectionError,
  customRenderers = {}
}) => {
  const {
    allowEditing = false,
    layout = 'vertical',
    spacing = 'normal',
    animations = { enabled: true, duration: 300, easing: 'ease-in-out' }
  } = sectionConfig;
  
  const {
    lazyLoad = false,
    virtualization = false,
    errorBoundaries = true,
    loadingPlaceholders = true
  } = renderOptions;

  const [sections, setSections] = useState<PortalSection[]>(initialSections);
  const [isDirty, setIsDirty] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(layout);
  const [selectedSpacing, setSelectedSpacing] = useState(spacing);
  const [animationsEnabled, setAnimationsEnabled] = useState(animations.enabled);
  const [hasChanges, setHasChanges] = useState(false);

  // Firebase Functions hook
  const { callFunction, loading: isSaving, error: functionError } = useFirebaseFunction();

  // Initialize sections if not provided
  useEffect(() => {
    if (initialSections.length === 0) {
      const defaultSections: PortalSection[] = Object.entries(SECTION_CONFIGS)
        .filter(([_, config]) => config.defaultVisible)
        .map(([type, config], index) => ({
          id: `section-${type}`,
          name: config.name,
          type: type as PortalSectionType,
          data: {},
          visible: true,
          order: index,
          customization: {},
          isLoading: false
        }));
      
      setSections(defaultSections);
    } else {
      setSections(initialSections);
    }
  }, [initialSections]);

  // Layout classes
  const layoutClasses = useMemo(() => {
    const spacingClasses = {
      compact: 'gap-2',
      normal: 'gap-4',
      relaxed: 'gap-6'
    };
    
    const baseClasses = `sections-container ${spacingClasses[selectedSpacing]}`;
    
    switch (selectedLayout) {
      case 'horizontal':
        return `${baseClasses} flex flex-row overflow-x-auto`;
      case 'grid':
        return `${baseClasses} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
      case 'masonry':
        return `${baseClasses} columns-1 md:columns-2 lg:columns-3`;
      default: // vertical
        return `${baseClasses} flex flex-col`;
    }
  }, [selectedLayout, selectedSpacing]);

  // Move section handler for drag and drop
  const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      const draggedSection = newSections[dragIndex];
      
      newSections.splice(dragIndex, 1);
      newSections.splice(hoverIndex, 0, draggedSection);
      
      // Update order values
      return newSections.map((section, index) => ({
        ...section,
        order: index
      }));
    });
    
    setHasChanges(true);
    setIsDirty(true);
  }, []);

  // Toggle section visibility
  const handleToggleVisibility = useCallback((sectionId: string, visible: boolean) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, visible } : section
      )
    );
    
    setHasChanges(true);
    onSectionToggle?.(sectionId, visible);
  }, [onSectionToggle]);

  // Edit section handler
  const handleEditSection = useCallback((sectionId: string) => {
    onSectionEdit?.(sectionId, {});
  }, [onSectionEdit]);

  // Delete section handler
  const handleDeleteSection = useCallback((sectionId: string) => {
    setSections(prevSections => prevSections.filter(section => section.id !== sectionId));
    setHasChanges(true);
    toast.success('Section deleted successfully');
  }, []);

  // Add new section
  const handleAddSection = useCallback((type: PortalSectionType) => {
    const config = SECTION_CONFIGS[type];
    const newSection: PortalSection = {
      id: `section-${type}-${Date.now()}`,
      name: config.name,
      type,
      data: {},
      visible: true,
      order: sections.length,
      customization: {},
      isLoading: false
    };
    
    setSections(prevSections => [...prevSections, newSection]);
    setHasChanges(true);
    toast.success(`${config.name} section added`);
  }, [sections.length]);

  // Save sections configuration
  const handleSave = useCallback(async () => {
    try {
      const result = await callFunction('updatePortalSections', {
        jobId,
        profileId,
        sections,
        config: {
          layout: selectedLayout,
          spacing: selectedSpacing,
          animations: { ...animations, enabled: animationsEnabled }
        }
      });
      
      onUpdate?.(result);
      onSectionsReorder?.(sections);
      setHasChanges(false);
      setIsDirty(false);
      toast.success('Sections configuration saved!');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save sections';
      toast.error(errorMsg);
      onError?.(error instanceof Error ? error : new Error(errorMsg));
    }
  }, [callFunction, jobId, profileId, sections, selectedLayout, selectedSpacing, animations, animationsEnabled, onUpdate, onSectionsReorder]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all sections to defaults? This will remove all customizations.')) {
      const defaultSections: PortalSection[] = Object.entries(SECTION_CONFIGS)
        .filter(([_, config]) => config.defaultVisible)
        .map(([type, config], index) => ({
          id: `section-${type}`,
          name: config.name,
          type: type as PortalSectionType,
          data: {},
          visible: true,
          order: index,
          customization: {},
          isLoading: false
        }));
      
      setSections(defaultSections);
      setSelectedLayout('vertical');
      setSelectedSpacing('normal');
      setAnimationsEnabled(true);
      setHasChanges(true);
      toast.success('Sections reset to defaults');
    }
  }, []);

  // Render section content
  const renderSectionContent = useCallback((section: PortalSection) => {
    const CustomRenderer = customRenderers[section.type];
    
    if (CustomRenderer) {
      return (
        <CustomRenderer
          section={section}
          config={sectionConfig}
          onUpdate={(data) => {
            setSections(prev =>
              prev.map(s => s.id === section.id ? { ...s, data } : s)
            );
            setHasChanges(true);
          }}
          onError={(error) => {
            setSections(prev =>
              prev.map(s => s.id === section.id ? { ...s, error: error.message } : s)
            );
            onSectionError?.(section.id, error as PortalError);
          }}
        />
      );
    }
    
    // Default section content based on type
    const config = SECTION_CONFIGS[section.type as keyof typeof SECTION_CONFIGS];
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <span className="text-2xl">{config?.icon || '📄'}</span>
          <div>
            <h4 className="font-medium">{config?.name || section.name}</h4>
            <p className="text-sm">{config?.description || 'Custom section content'}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Content for {config?.name || section.name} section will be rendered here.
            <br />
            <span className="text-xs">Configure section data using the edit button above.</span>
          </p>
        </div>
      </div>
    );
  }, [customRenderers, sectionConfig, onSectionError]);

  if (!isEnabled) {
    return null;
  }

  const visibleSections = sections.filter(section => section.visible).sort((a, b) => a.order - b.order);
  const hiddenSections = sections.filter(section => !section.visible);
  const availableSectionTypes = Object.keys(SECTION_CONFIGS).filter(
    type => !sections.some(section => section.type === type)
  ) as PortalSectionType[];

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Portal Sections"
        description="Manage and customize your portal sections"
        isLoading={isSaving}
        error={functionError}
        onRetry={handleSave}
      >
        <div className="space-y-6">
          {/* Section Management Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Section Configuration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {sections.length} sections • {visibleSections.length} visible • {hiddenSections.length} hidden
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Layout Toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                  ${showSettings
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }
                `}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              {/* Save Button */}
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              
              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                title="Reset to defaults"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Section Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Layout Configuration */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Layout Style
                  </label>
                  <select
                    value={selectedLayout}
                    onChange={(e) => {
                      setSelectedLayout(e.target.value as typeof selectedLayout);
                      setHasChanges(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="vertical">Vertical Stack</option>
                    <option value="horizontal">Horizontal Row</option>
                    <option value="grid">Grid Layout</option>
                    <option value="masonry">Masonry Layout</option>
                  </select>
                </div>
                
                {/* Spacing Configuration */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Section Spacing
                  </label>
                  <select
                    value={selectedSpacing}
                    onChange={(e) => {
                      setSelectedSpacing(e.target.value as typeof selectedSpacing);
                      setHasChanges(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>
                
                {/* Animation Configuration */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Animations
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={animationsEnabled}
                      onChange={(e) => {
                        setAnimationsEnabled(e.target.checked);
                        setHasChanges(true);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enable smooth animations</span>
                  </label>
                </div>
              </div>
              
              {/* Add New Section */}
              {availableSectionTypes.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Section</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableSectionTypes.map((type) => {
                      const config = SECTION_CONFIGS[type as keyof typeof SECTION_CONFIGS];
                      return (
                        <button
                          key={type}
                          onClick={() => handleAddSection(type)}
                          className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <span className="text-lg">{config.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {config.name}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Sections List */}
          <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
            <div className={layoutClasses}>
              {visibleSections.map((section, index) => (
                <DraggableSection
                  key={section.id}
                  section={section}
                  index={index}
                  moveSection={moveSection}
                  onToggleVisibility={handleToggleVisibility}
                  onEditSection={handleEditSection}
                  onDeleteSection={handleDeleteSection}
                  allowReordering={allowReordering}
                  allowToggle={allowToggle}
                  allowEditing={allowEditing}
                  animationDuration={animations.duration || 300}
                >
                  {renderSectionContent(section)}
                </DraggableSection>
              ))}
            </div>
          </DndProvider>
          
          {/* Hidden Sections */}
          {hiddenSections.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Hidden Sections ({hiddenSections.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hiddenSections.map((section) => {
                  const config = SECTION_CONFIGS[section.type as keyof typeof SECTION_CONFIGS];
                  return (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg opacity-50">{config?.icon || '📄'}</span>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            {config?.name || section.name}
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Hidden section
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleVisibility(section.id, true)}
                        className="p-1.5 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                        title="Show section"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {sections.length === 0 && (
            <div className="text-center py-12">
              <Layout className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Sections Configured
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by adding your first portal section.
              </p>
              <button
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>
          )}
          
          {/* Changes Indicator */}
          {hasChanges && (
            <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Unsaved changes</span>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="ml-2 px-3 py-1 bg-white text-blue-600 rounded text-xs font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};