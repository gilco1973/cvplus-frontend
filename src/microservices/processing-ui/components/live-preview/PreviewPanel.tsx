/**
 * PreviewPanel Component
 *
 * Renders CV preview with responsive viewport simulation
 */

import React, { useMemo } from 'react';
import { PreviewPanelProps } from './types';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  cvData,
  template,
  viewportConfig,
  zoomLevel,
  className = ''
}) => {
  const previewStyle = useMemo(() => {
    const { width, height, orientation } = viewportConfig;
    const finalWidth = orientation === 'landscape' ? height : width;
    const finalHeight = orientation === 'landscape' ? width : height;
    const scale = zoomLevel / 100;

    return {
      width: `${finalWidth}px`,
      height: `${finalHeight}px`,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
    };
  }, [viewportConfig, zoomLevel]);

  const containerStyle = useMemo(() => {
    const scale = zoomLevel / 100;
    const { width, height, orientation } = viewportConfig;
    const finalWidth = orientation === 'landscape' ? height : width;
    const finalHeight = orientation === 'landscape' ? width : height;

    return {
      width: `${finalWidth * scale}px`,
      height: `${finalHeight * scale}px`,
    };
  }, [viewportConfig, zoomLevel]);

  const renderCV = () => {
    if (!cvData) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">📄</div>
            <div>No CV data available</div>
            <div className="text-sm">Upload a CV to see the preview</div>
          </div>
        </div>
      );
    }

    const responsiveClass = getResponsiveClasses();
    const templateClasses = getTemplateClasses();

    return (
      <div className={`cv-preview-content h-full overflow-auto ${responsiveClass} ${templateClasses}`}>
        {/* Personal Information */}
        {cvData.personalInfo && (
          <div className="cv-section personal-info">
            <h1 className="name">{cvData.personalInfo.name || 'Your Name'}</h1>
            <div className="contact-info">
              {cvData.personalInfo.email && <div className="email">{cvData.personalInfo.email}</div>}
              {cvData.personalInfo.phone && <div className="phone">{cvData.personalInfo.phone}</div>}
              {cvData.personalInfo.location && <div className="location">{cvData.personalInfo.location}</div>}
            </div>
          </div>
        )}

        {/* Summary */}
        {cvData.summary && (
          <div className="cv-section summary">
            <h2>Professional Summary</h2>
            <p>{cvData.summary}</p>
          </div>
        )}

        {/* Experience */}
        {cvData.experience && cvData.experience.length > 0 && (
          <div className="cv-section experience">
            <h2>Experience</h2>
            {cvData.experience.map((exp: any, index: number) => (
              <div key={index} className="experience-item">
                <div className="experience-header">
                  <h3>{exp.position || 'Position'}</h3>
                  <div className="company">{exp.company || 'Company'}</div>
                </div>
                {exp.duration && <div className="duration">{exp.duration}</div>}
                {exp.description && <p className="description">{exp.description}</p>}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="achievements">
                    {exp.achievements.map((achievement: string, i: number) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {cvData.education && cvData.education.length > 0 && (
          <div className="cv-section education">
            <h2>Education</h2>
            {cvData.education.map((edu: any, index: number) => (
              <div key={index} className="education-item">
                <h3>{edu.degree || 'Degree'}</h3>
                <div className="institution">{edu.institution || 'Institution'}</div>
                {edu.year && <div className="year">{edu.year}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {cvData.skills && cvData.skills.length > 0 && (
          <div className="cv-section skills">
            <h2>Skills</h2>
            <div className="skills-list">
              {cvData.skills.map((skill: any, index: number) => (
                <span key={index} className="skill-tag">
                  {typeof skill === 'string' ? skill : skill.name || skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getResponsiveClasses = () => {
    switch (viewportConfig.mode) {
      case 'mobile':
        return 'text-xs leading-tight p-2';
      case 'tablet':
        return 'text-sm leading-normal p-4';
      case 'print':
        return 'text-sm leading-relaxed p-6';
      default:
        return 'text-base leading-normal p-6';
    }
  };

  const getTemplateClasses = () => {
    if (!template) return 'template-modern';

    // Basic template styling based on template type
    switch (template.id) {
      case 'classic':
        return 'template-classic font-serif';
      case 'modern':
        return 'template-modern font-sans';
      case 'creative':
        return 'template-creative font-sans';
      default:
        return 'template-modern font-sans';
    }
  };

  return (
    <div className={`preview-panel-container ${className}`}>
      <div
        className="preview-viewport bg-white shadow-lg border border-gray-300 mx-auto my-4"
        style={containerStyle}
      >
        <div style={previewStyle}>
          {renderCV()}
        </div>
      </div>
    </div>
  );
};