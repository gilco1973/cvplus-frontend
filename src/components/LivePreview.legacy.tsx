import React, { useState } from 'react';
import { Eye, Settings, Sparkles, Play, ZoomIn, ZoomOut, Monitor, Tablet, Smartphone, User, MapPin, Mail, Phone, Calendar, GraduationCap, Briefcase, Code } from 'lucide-react';
import type { CVParsedData } from '../types/cvData';
import type { Job } from '../types/job';

interface Template {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  isPremium: boolean;
}

interface LivePreviewProps {
  selectedTemplate: Template | null;
  selectedFeatures: Record<string, boolean>;
  previewMode: 'template' | 'features' | 'final';
  onPreviewModeChange: (mode: 'template' | 'features' | 'final') => void;
  // New props for CV data
  jobData?: Job | null;
  cvData?: CVParsedData | null;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  selectedTemplate,
  selectedFeatures,
  previewMode,
  onPreviewModeChange,
  jobData,
  cvData
}) => {
  const [zoomLevel, setZoomLevel] = useState(75);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const selectedCount = Object.values(selectedFeatures).filter(Boolean).length;

  // Get CV data from props with fallback to parsed data
  const getCVData = (): CVParsedData | null => {
    if (cvData) return cvData;
    if (jobData?.parsedData && typeof jobData.parsedData === 'object') {
      return jobData.parsedData as CVParsedData;
    }
    return null;
  };

  // Check if we have actual CV data to render
  const hasValidCVData = () => {
    const data = getCVData();
    return data && (data.personalInfo || data.experience || data.education || data.skills);
  };

  const getPreviewContent = () => {
    switch (previewMode) {
      case 'template':
        return {
          title: selectedTemplate?.name || 'Select Template',
          subtitle: 'Template Preview',
          emoji: selectedTemplate?.emoji || '📄',
          description: selectedTemplate?.description || 'Choose a template to preview'
        };
      case 'features':
        return {
          title: `${selectedCount} Features`,
          subtitle: 'Features Preview',
          emoji: '✨',
          description: `${selectedCount} features will be applied to your CV`
        };
      case 'final':
        return {
          title: 'Complete Preview',
          subtitle: 'Final Result',
          emoji: '🎯',
          description: 'Template + Features combined preview'
        };
      default:
        return {
          title: 'Preview',
          subtitle: 'Select mode',
          emoji: '👁️',
          description: 'Choose a preview mode'
        };
    }
  };

  const content = getPreviewContent();

  const getViewModeClasses = () => {
    switch (viewMode) {
      case 'desktop':
        return 'aspect-[3/4] max-w-full';
      case 'tablet':
        return 'aspect-[3/4] max-w-sm mx-auto';
      case 'mobile':
        return 'aspect-[4/3] max-w-xs mx-auto';
      default:
        return 'aspect-[3/4] max-w-full';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100">Live Preview</h2>
            <p className="text-sm text-gray-400">See your CV come together</p>
          </div>
        </div>
      </div>
      
      {/* Preview Mode Selector */}
      <div className="flex mb-6 bg-gray-700/50 rounded-lg p-1">
        {[
          { id: 'template', label: 'Template', icon: Settings },
          { id: 'features', label: 'Features', icon: Sparkles },
          { id: 'final', label: 'Final', icon: Play }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onPreviewModeChange(id as 'template' | 'features' | 'final')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              previewMode === id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-600/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      
      {/* View Mode Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'desktop', icon: Monitor, label: 'Desktop' },
            { id: 'tablet', icon: Tablet, label: 'Tablet' },
            { id: 'mobile', icon: Smartphone, label: 'Mobile' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id as 'desktop' | 'tablet' | 'mobile')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === id
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }`}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
            disabled={zoomLevel <= 50}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400 min-w-12 text-center">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel(Math.min(125, zoomLevel + 25))}
            disabled={zoomLevel >= 125}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Preview Canvas */}
      <div className={`bg-gray-900/50 rounded-lg border border-gray-600 mb-4 transition-all ${getViewModeClasses()} overflow-hidden`}
           style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}>
        {hasValidCVData() ? (
          <CVPreviewRenderer 
            cvData={getCVData()!}
            selectedTemplate={selectedTemplate}
            selectedFeatures={selectedFeatures}
            previewMode={previewMode}
            viewMode={viewMode}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center text-gray-400 p-8">
              <div className="text-4xl mb-4 animate-pulse">
                {content.emoji}
              </div>
              <div className="text-base font-medium text-gray-200 mb-2">
                {content.title}
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {content.subtitle}
              </div>
              <div className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                {content.description}
              </div>
              
              {/* Feature Indicators */}
              {previewMode === 'features' && selectedCount > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-1">
                  {Object.entries(selectedFeatures)
                    .filter(([_, enabled]) => enabled)
                    .slice(0, 6)
                    .map(([featureId, _], index) => (
                      <div
                        key={featureId}
                        className="w-2 h-2 bg-cyan-400/60 rounded-full animate-pulse"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      />
                    ))
                  }
                  {selectedCount > 6 && (
                    <div className="text-xs text-cyan-400 ml-2">+{selectedCount - 6} more</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Preview Status */}
      <div className="flex justify-between items-center text-sm">
        <div className="text-gray-400">
          {selectedCount} of {Object.keys(selectedFeatures).length} features
        </div>
        <div className="flex gap-2">
          <div className={`px-2 py-1 rounded-md text-xs ${
            previewMode === 'template'
              ? 'bg-blue-500/20 text-blue-300'
              : previewMode === 'features'
              ? 'bg-purple-500/20 text-purple-300'
              : 'bg-green-500/20 text-green-300'
          }`}>
            {content.subtitle}
          </div>
        </div>
      </div>
    </div>
  );
};

// CV Preview Renderer Component
interface CVPreviewRendererProps {
  cvData: CVParsedData;
  selectedTemplate: Template | null;
  selectedFeatures: Record<string, boolean>;
  previewMode: 'template' | 'features' | 'final';
  viewMode: 'desktop' | 'tablet' | 'mobile';
}

const CVPreviewRenderer: React.FC<CVPreviewRendererProps> = ({
  cvData,
  selectedTemplate,
  selectedFeatures,
  previewMode,
  viewMode
}) => {
  const getTemplateStyles = () => {
    if (!selectedTemplate) return {};
    
    // Template-specific styling
    switch (selectedTemplate.id) {
      case 'tech-innovation':
        return {
          primaryColor: '#3b82f6',
          backgroundColor: '#f8fafc',
          headerStyle: 'modern-tech'
        };
      case 'executive-authority':
        return {
          primaryColor: '#1e40af',
          backgroundColor: '#ffffff',
          headerStyle: 'executive'
        };
      case 'creative-showcase':
        return {
          primaryColor: '#8b5cf6',
          backgroundColor: '#faf5ff',
          headerStyle: 'creative'
        };
      case 'healthcare-professional':
        return {
          primaryColor: '#06b6d4',
          backgroundColor: '#f0fdf4',
          headerStyle: 'healthcare'
        };
      case 'financial-expert':
        return {
          primaryColor: '#059669',
          backgroundColor: '#f7fafc',
          headerStyle: 'financial'
        };
      case 'international-professional':
        return {
          primaryColor: '#0ea5e9',
          backgroundColor: '#f0f9ff',
          headerStyle: 'international'
        };
      default:
        return {
          primaryColor: '#6b7280',
          backgroundColor: '#ffffff',
          headerStyle: 'default'
        };
    }
  };

  const templateStyles = getTemplateStyles();
  const responsiveClass = viewMode === 'mobile' ? 'text-xs' : viewMode === 'tablet' ? 'text-sm' : 'text-base';

  const renderPersonalInfo = () => {
    const personalInfo = cvData.personalInfo;
    if (!personalInfo) return null;

    return (
      <div className={`p-6 mb-6 rounded-lg`} style={{ backgroundColor: templateStyles.backgroundColor }}>
        <div className="text-center">
          <h1 className={`font-bold mb-2 ${responsiveClass === 'text-xs' ? 'text-lg' : responsiveClass === 'text-sm' ? 'text-xl' : 'text-2xl'}`}
              style={{ color: templateStyles.primaryColor }}>
            {personalInfo.fullName || personalInfo.name || 'Professional Name'}
          </h1>
          {personalInfo.title && (
            <p className={`text-gray-600 mb-4 ${responsiveClass}`}>
              {personalInfo.title}
            </p>
          )}
          <div className={`flex flex-wrap justify-center gap-4 ${responsiveClass}`}>
            {personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {(personalInfo.location || personalInfo.city) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{personalInfo.location || personalInfo.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const summary = cvData.summary || cvData.objective;
    if (!summary) return null;

    return (
      <div className="mb-6">
        <h2 className={`font-semibold mb-3 ${responsiveClass === 'text-xs' ? 'text-sm' : responsiveClass === 'text-sm' ? 'text-base' : 'text-lg'}`}
            style={{ color: templateStyles.primaryColor }}>
          Professional Summary
        </h2>
        <p className={`text-gray-700 leading-relaxed ${responsiveClass}`}>
          {summary}
        </p>
      </div>
    );
  };

  const renderExperience = () => {
    const experience = cvData.experience;
    if (!experience || experience.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className={`font-semibold mb-3 ${responsiveClass === 'text-xs' ? 'text-sm' : responsiveClass === 'text-sm' ? 'text-base' : 'text-lg'}`}
            style={{ color: templateStyles.primaryColor }}>
          <Briefcase className="w-4 h-4 inline-block mr-2" />
          Professional Experience
        </h2>
        <div className="space-y-4">
          {experience.slice(0, 3).map((exp, index) => (
            <div key={index} className="border-l-2 pl-4" style={{ borderColor: templateStyles.primaryColor }}>
              <h3 className={`font-medium ${responsiveClass}`}>
                {exp.title || exp.position || exp.role || 'Position Title'}
              </h3>
              <p className={`text-gray-600 ${responsiveClass === 'text-xs' ? 'text-xs' : 'text-sm'}`}>
                {exp.company || 'Company Name'}
                {exp.duration && ` • ${exp.duration}`}
              </p>
              {exp.description && (
                <p className={`text-gray-700 mt-1 ${responsiveClass === 'text-xs' ? 'text-xs' : 'text-sm'}`}>
                  {exp.description.substring(0, 150)}...
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    const skills = cvData.skills;
    if (!skills) return null;

    const skillsArray = skills.technical || skills.software || skills.categories?.technical || [];
    if (skillsArray.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className={`font-semibold mb-3 ${responsiveClass === 'text-xs' ? 'text-sm' : responsiveClass === 'text-sm' ? 'text-base' : 'text-lg'}`}
            style={{ color: templateStyles.primaryColor }}>
          <Code className="w-4 h-4 inline-block mr-2" />
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {skillsArray.slice(0, 12).map((skill, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-white ${responsiveClass === 'text-xs' ? 'text-xs' : 'text-sm'}`}
              style={{ backgroundColor: templateStyles.primaryColor }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    const education = cvData.education;
    if (!education || education.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className={`font-semibold mb-3 ${responsiveClass === 'text-xs' ? 'text-sm' : responsiveClass === 'text-sm' ? 'text-base' : 'text-lg'}`}
            style={{ color: templateStyles.primaryColor }}>
          <GraduationCap className="w-4 h-4 inline-block mr-2" />
          Education
        </h2>
        <div className="space-y-2">
          {education.slice(0, 2).map((edu, index) => (
            <div key={index}>
              <h3 className={`font-medium ${responsiveClass}`}>
                {edu.degree || 'Degree'}
                {edu.field && ` in ${edu.field}`}
              </h3>
              <p className={`text-gray-600 ${responsiveClass === 'text-xs' ? 'text-xs' : 'text-sm'}`}>
                {edu.institution || 'Institution'}
                {edu.year && ` • ${edu.year}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFeatureEnhancements = () => {
    if (previewMode !== 'features' && previewMode !== 'final') return null;
    
    const enabledFeatures = Object.entries(selectedFeatures).filter(([_, enabled]) => enabled);
    if (enabledFeatures.length === 0) return null;

    return (
      <div className="mt-6 p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
        <h3 className={`font-medium text-cyan-300 mb-2 ${responsiveClass}`}>
          <Sparkles className="w-4 h-4 inline-block mr-2" />
          Enhanced Features Active
        </h3>
        <div className="flex flex-wrap gap-2">
          {enabledFeatures.slice(0, 6).map(([featureId]) => (
            <span key={featureId} className={`px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full ${responsiveClass === 'text-xs' ? 'text-xs' : 'text-sm'}`}>
              {featureId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </span>
          ))}
          {enabledFeatures.length > 6 && (
            <span className={`px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full ${responsiveClass === 'text-xs' ? 'text-xs' : 'text-sm'}`}>
              +{enabledFeatures.length - 6} more
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-4 bg-white" style={{ backgroundColor: templateStyles.backgroundColor }}>
      <div className="max-w-full mx-auto">
        {renderPersonalInfo()}
        {renderSummary()}
        {renderExperience()}
        {renderSkills()}
        {renderEducation()}
        {renderFeatureEnhancements()}
      </div>
    </div>
  );
};