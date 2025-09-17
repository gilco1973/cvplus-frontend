import React from 'react';
import type { CVParsedData } from '../../types/cvData';
import type { CVTemplate, SelectedFeatures } from '../../types/cv-templates';
import { PROFESSIONAL_TEMPLATES } from '../../data/professional-templates';

interface ExecutiveTemplateProps {
  cvData: CVParsedData;
  template: CVTemplate;
  isEditing: boolean;
  selectedFeatures: SelectedFeatures;
  onSectionEdit: (section: string, value: unknown) => void;
  showFeaturePreviews: boolean;
  className?: string;
}

export const ExecutiveTemplate: React.FC<ExecutiveTemplateProps> = ({
  cvData,
  template,
  isEditing,
  selectedFeatures,
  onSectionEdit,
  showFeaturePreviews,
  className = ''
}) => {
  const executiveTemplate = PROFESSIONAL_TEMPLATES['executive-authority'];
  const { colors, typography, styling } = executiveTemplate;

  // Executive-specific styling
  const executiveStyles = {
    container: {
      fontFamily: typography.fonts.secondary.family,
      backgroundColor: colors.neutral.background,
      color: colors.neutral.text.primary,
      lineHeight: '1.6'
    },
    header: {
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
      color: colors.primary.contrast,
      padding: '3rem 2rem',
      borderRadius: '0 0 2rem 2rem',
      textAlign: 'center' as const,
      position: 'relative' as const,
      overflow: 'hidden' as const
    },
    headerOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(45deg, ${colors.secondary.main}20 0%, transparent 100%)`,
      pointerEvents: 'none' as const
    },
    name: {
      fontFamily: typography.fonts.primary.family,
      fontSize: typography.scale.h1.size,
      fontWeight: typography.scale.h1.weight,
      lineHeight: typography.scale.h1.lineHeight,
      letterSpacing: typography.scale.h1.letterSpacing,
      marginBottom: '0.5rem',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      position: 'relative' as const,
      zIndex: 1
    },
    title: {
      fontSize: typography.scale.h3.size,
      fontWeight: typography.scale.h3.weight,
      color: colors.secondary.light,
      marginBottom: '1rem',
      position: 'relative' as const,
      zIndex: 1
    },
    contactInfo: {
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem',
      flexWrap: 'wrap' as const,
      fontSize: typography.scale.body.size,
      fontWeight: 500,
      position: 'relative' as const,
      zIndex: 1
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '3rem',
      padding: '3rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    section: {
      marginBottom: '3rem'
    },
    sectionTitle: {
      fontFamily: typography.fonts.primary.family,
      fontSize: typography.scale.h2.size,
      fontWeight: typography.scale.h2.weight,
      color: colors.primary.main,
      marginBottom: '1.5rem',
      paddingBottom: '0.5rem',
      borderBottom: `3px solid ${colors.secondary.main}`,
      position: 'relative' as const
    },
    sectionTitleAccent: {
      position: 'absolute' as const,
      bottom: '-3px',
      left: 0,
      width: '3rem',
      height: '3px',
      background: colors.secondary.main
    },
    experienceItem: {
      marginBottom: '2.5rem',
      padding: '1.5rem',
      backgroundColor: colors.neutral.surface,
      borderRadius: '12px',
      border: `1px solid ${colors.neutral.border}`,
      boxShadow: styling.components.cards.shadow,
      position: 'relative' as const,
      transition: 'all 0.3s ease'
    },
    experienceHeader: {
      borderLeft: `4px solid ${colors.primary.main}`,
      paddingLeft: '1rem',
      marginBottom: '1rem'
    },
    position: {
      fontSize: typography.scale.h3.size,
      fontWeight: typography.scale.h3.weight,
      color: colors.neutral.text.primary,
      marginBottom: '0.25rem'
    },
    company: {
      fontSize: typography.scale.h4.size,
      fontWeight: typography.scale.h4.weight,
      color: colors.primary.main,
      marginBottom: '0.5rem'
    },
    duration: {
      fontSize: typography.scale.caption.size,
      color: colors.neutral.text.muted,
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em'
    },
    achievements: {
      listStyle: 'none',
      padding: 0,
      marginTop: '1rem'
    },
    achievement: {
      position: 'relative' as const,
      paddingLeft: '1.5rem',
      marginBottom: '0.75rem',
      color: colors.neutral.text.primary,
      lineHeight: '1.6'
    },
    achievementBullet: {
      position: 'absolute' as const,
      left: 0,
      top: '0.5rem',
      width: '8px',
      height: '8px',
      backgroundColor: colors.secondary.main,
      borderRadius: '50%'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '2rem'
    },
    skillsGrid: {
      display: 'grid',
      gap: '1rem'
    },
    skillCategory: {
      backgroundColor: colors.neutral.surface,
      padding: '1.5rem',
      borderRadius: '12px',
      border: `1px solid ${colors.neutral.border}`
    },
    skillCategoryTitle: {
      fontWeight: 600,
      color: colors.primary.main,
      marginBottom: '1rem',
      fontSize: typography.scale.h4.size
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem'
    },
    skillTag: {
      backgroundColor: colors.primary.main,
      color: colors.primary.contrast,
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: 500
    },
    metricsCard: {
      backgroundColor: colors.secondary.main,
      color: colors.secondary.contrast,
      padding: '1.5rem',
      borderRadius: '12px',
      textAlign: 'center' as const,
      marginBottom: '1rem'
    },
    metricValue: {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '0.25rem'
    },
    metricLabel: {
      fontSize: '0.875rem',
      opacity: 0.9
    },
    summaryCard: {
      backgroundColor: colors.neutral.surface,
      padding: '2rem',
      borderRadius: '12px',
      border: `1px solid ${colors.neutral.border}`,
      marginBottom: '3rem',
      fontSize: typography.scale.body.size,
      lineHeight: '1.7',
      color: colors.neutral.text.primary
    }
  };

  // Mobile responsive adjustments
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    executiveStyles.contentGrid.gridTemplateColumns = '1fr';
    executiveStyles.contentGrid.gap = '2rem';
    executiveStyles.contactInfo.flexDirection = 'column';
    executiveStyles.contactInfo.gap = '1rem';
  }

  // Render executive metrics if available
  const renderMetrics = () => {
    if (!selectedFeatures.achievementhighlighting) return null;
    
    return (
      <div>
        <div style={executiveStyles.metricsCard}>
          <div style={executiveStyles.metricValue}>20+</div>
          <div style={executiveStyles.metricLabel}>Years Leadership</div>
        </div>
        <div style={executiveStyles.metricsCard}>
          <div style={executiveStyles.metricValue}>$2B+</div>
          <div style={executiveStyles.metricLabel}>Revenue Generated</div>
        </div>
        <div style={executiveStyles.metricsCard}>
          <div style={executiveStyles.metricValue}>500+</div>
          <div style={executiveStyles.metricLabel}>Team Members Led</div>
        </div>
      </div>
    );
  };

  // Render skills section with executive focus
  const renderSkills = () => {
    if (!cvData.skills?.categories) return null;

    return (
      <div style={executiveStyles.section}>
        <h3 style={executiveStyles.sectionTitle}>
          Core Competencies
          <div style={executiveStyles.sectionTitleAccent}></div>
        </h3>
        <div style={executiveStyles.skillsGrid}>
          {Object.entries(cvData.skills.categories).map(([category, skills]) => (
            <div key={category} style={executiveStyles.skillCategory}>
              <h4 style={executiveStyles.skillCategoryTitle}>{category}</h4>
              <div style={executiveStyles.skillsList}>
                {skills.map((skill, index) => (
                  <span key={index} style={executiveStyles.skillTag}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render experience with executive focus
  const renderExperience = () => {
    if (!cvData.experience?.length) return null;

    return (
      <div style={executiveStyles.section}>
        <h3 style={executiveStyles.sectionTitle}>
          Executive Experience
          <div style={executiveStyles.sectionTitleAccent}></div>
        </h3>
        {cvData.experience.map((exp, index) => (
          <div key={index} style={executiveStyles.experienceItem}>
            <div style={executiveStyles.experienceHeader}>
              <h4 style={executiveStyles.position}>{exp.title}</h4>
              <div style={executiveStyles.company}>{exp.company}</div>
              <div style={executiveStyles.duration}>{exp.duration}</div>
            </div>
            {exp.description && (
              <p style={{ color: colors.neutral.text.primary, lineHeight: '1.6' }}>
                {exp.description}
              </p>
            )}
            {exp.achievements && (
              <ul style={executiveStyles.achievements}>
                {exp.achievements.map((achievement, achIndex) => (
                  <li key={achIndex} style={executiveStyles.achievement}>
                    <div style={executiveStyles.achievementBullet}></div>
                    {achievement}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render education section
  const renderEducation = () => {
    if (!cvData.education?.length) return null;

    return (
      <div style={executiveStyles.section}>
        <h3 style={executiveStyles.sectionTitle}>
          Education & Credentials
          <div style={executiveStyles.sectionTitleAccent}></div>
        </h3>
        {cvData.education.map((edu, index) => (
          <div key={index} style={{
            ...executiveStyles.experienceItem,
            marginBottom: '1.5rem'
          }}>
            <div style={executiveStyles.experienceHeader}>
              <h4 style={executiveStyles.position}>{edu.degree}</h4>
              <div style={executiveStyles.company}>{edu.institution}</div>
              <div style={executiveStyles.duration}>{edu.year}</div>
            </div>
            {edu.field && (
              <p style={{ 
                color: colors.neutral.text.secondary,
                fontStyle: 'italic',
                marginTop: '0.5rem'
              }}>
                {edu.field}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={className} style={executiveStyles.container}>
      {/* Executive Header */}
      <header style={executiveStyles.header}>
        <div style={executiveStyles.headerOverlay}></div>
        <h1 style={executiveStyles.name}>
          {cvData.personalInfo?.fullName || 'Executive Professional'}
        </h1>
        <h2 style={executiveStyles.title}>
          Chief Executive Officer
        </h2>
        <div style={executiveStyles.contactInfo}>
          {cvData.personalInfo?.email && (
            <span>{cvData.personalInfo.email}</span>
          )}
          {cvData.personalInfo?.phone && (
            <span>{cvData.personalInfo.phone}</span>
          )}
          {cvData.personalInfo?.location && (
            <span>{cvData.personalInfo.location}</span>
          )}
          {cvData.personalInfo?.linkedin && (
            <span>{cvData.personalInfo.linkedin}</span>
          )}
        </div>
      </header>

      {/* Executive Summary */}
      {cvData.summary && (
        <div style={{ padding: '0 2rem' }}>
          <div style={executiveStyles.summaryCard}>
            {cvData.summary}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={executiveStyles.contentGrid}>
        {/* Main Content */}
        <div>
          {renderExperience()}
          {renderEducation()}
        </div>

        {/* Sidebar */}
        <div style={executiveStyles.sidebar}>
          {renderMetrics()}
          {renderSkills()}
        </div>
      </div>

      {/* Feature Previews */}
      {showFeaturePreviews && (
        <div style={{ 
          padding: '2rem',
          backgroundColor: colors.primary.light + '10',
          borderTop: `1px solid ${colors.neutral.border}`
        }}>
          <div style={{
            textAlign: 'center',
            color: colors.primary.main,
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            🏆 Executive Features Preview
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: colors.neutral.surface,
              borderRadius: '8px',
              textAlign: 'center',
              border: `1px solid ${colors.neutral.border}`
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Performance Dashboard</div>
              <div style={{ fontSize: '0.875rem', color: colors.neutral.text.muted }}>
                Executive KPI visualization
              </div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: colors.neutral.surface,
              borderRadius: '8px',
              textAlign: 'center',
              border: `1px solid ${colors.neutral.border}`
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Strategic Impact</div>
              <div style={{ fontSize: '0.875rem', color: colors.neutral.text.muted }}>
                Board-level achievements
              </div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: colors.neutral.surface,
              borderRadius: '8px',
              textAlign: 'center',
              border: `1px solid ${colors.neutral.border}`
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Leadership Portfolio</div>
              <div style={{ fontSize: '0.875rem', color: colors.neutral.text.muted }}>
                Team transformation stories
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};