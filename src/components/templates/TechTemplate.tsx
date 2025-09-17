import React from 'react';
import type { CVParsedData } from '../../types/cvData';
import type { CVTemplate, SelectedFeatures } from '../../types/cv-templates';
import { PROFESSIONAL_TEMPLATES } from '../../data/professional-templates';

interface TechTemplateProps {
  cvData: CVParsedData;
  template: CVTemplate;
  isEditing: boolean;
  selectedFeatures: SelectedFeatures;
  onSectionEdit: (section: string, value: unknown) => void;
  showFeaturePreviews: boolean;
  className?: string;
}

export const TechTemplate: React.FC<TechTemplateProps> = ({
  cvData,
  template,
  isEditing,
  selectedFeatures,
  onSectionEdit,
  showFeaturePreviews,
  className = ''
}) => {
  const techTemplate = PROFESSIONAL_TEMPLATES['tech-innovation'];
  const { colors, typography, styling } = techTemplate;

  // Tech-specific styling
  const techStyles = {
    container: {
      fontFamily: typography.fonts.primary.family,
      backgroundColor: colors.neutral.background,
      color: colors.neutral.text.primary,
      lineHeight: '1.6'
    },
    header: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '2rem',
      padding: '2rem',
      backgroundColor: colors.neutral.surface,
      borderBottom: `3px solid ${colors.primary.main}`,
      marginBottom: '2rem'
    },
    personalInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    name: {
      fontFamily: typography.fonts.primary.family,
      fontSize: typography.scale.h1.size,
      fontWeight: typography.scale.h1.weight,
      color: colors.neutral.text.primary,
      marginBottom: '0.25rem'
    },
    title: {
      fontSize: typography.scale.h3.size,
      fontWeight: typography.scale.h3.weight,
      color: colors.primary.main,
      marginBottom: '1rem'
    },
    contactInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
      fontSize: typography.scale.caption.size,
      color: colors.neutral.text.secondary
    },
    skillsPreview: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center'
    },
    topSkills: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    skillChip: {
      backgroundColor: colors.primary.main,
      color: colors.primary.contrast,
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 500,
      border: 'none'
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gap: '2rem',
      padding: '0 2rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    section: {
      marginBottom: '2.5rem'
    },
    sectionTitle: {
      fontSize: typography.scale.h2.size,
      fontWeight: typography.scale.h2.weight,
      color: colors.neutral.text.primary,
      marginBottom: '1.5rem',
      paddingBottom: '0.5rem',
      borderBottom: `2px solid ${colors.secondary.main}`,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    experienceCard: {
      backgroundColor: colors.neutral.surface,
      border: `1px solid ${colors.neutral.border}`,
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      transition: 'all 0.2s ease'
    },
    experienceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
      flexWrap: 'wrap' as const,
      gap: '0.5rem'
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
      backgroundColor: colors.secondary.main + '20',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      whiteSpace: 'nowrap' as const
    },
    technologies: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.25rem',
      marginTop: '1rem'
    },
    techTag: {
      backgroundColor: colors.secondary.main + '20',
      color: colors.secondary.main,
      padding: '0.125rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 500,
      border: `1px solid ${colors.secondary.main}30`
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
      lineHeight: '1.5'
    },
    achievementBullet: {
      position: 'absolute' as const,
      left: 0,
      top: '0.375rem',
      width: '4px',
      height: '4px',
      backgroundColor: colors.primary.main,
      borderRadius: '2px'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '2rem'
    },
    sidebarSection: {
      backgroundColor: colors.neutral.surface,
      border: `1px solid ${colors.neutral.border}`,
      borderRadius: '8px',
      padding: '1.5rem'
    },
    sidebarTitle: {
      fontSize: typography.scale.h4.size,
      fontWeight: typography.scale.h4.weight,
      color: colors.neutral.text.primary,
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    skillsMatrix: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    skillCategory: {
      marginBottom: '1.5rem'
    },
    skillCategoryTitle: {
      fontSize: typography.scale.body.size,
      fontWeight: 600,
      color: colors.primary.main,
      marginBottom: '0.75rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.025em'
    },
    skillBar: {
      marginBottom: '0.75rem'
    },
    skillName: {
      fontSize: typography.scale.caption.size,
      fontWeight: 500,
      color: colors.neutral.text.primary,
      marginBottom: '0.25rem',
      display: 'flex',
      justifyContent: 'space-between'
    },
    progressBar: {
      width: '100%',
      height: '6px',
      backgroundColor: colors.neutral.border,
      borderRadius: '3px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
      borderRadius: '3px',
      transition: 'width 0.8s ease-in-out'
    },
    projectCard: {
      backgroundColor: colors.neutral.surface,
      border: `1px solid ${colors.neutral.border}`,
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      position: 'relative' as const
    },
    projectTitle: {
      fontSize: typography.scale.h4.size,
      fontWeight: typography.scale.h4.weight,
      color: colors.neutral.text.primary,
      marginBottom: '0.5rem'
    },
    projectDescription: {
      color: colors.neutral.text.secondary,
      lineHeight: '1.5',
      marginBottom: '1rem'
    },
    githubLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: colors.primary.main,
      textDecoration: 'none',
      fontSize: typography.scale.caption.size,
      fontWeight: 500,
      padding: '0.5rem 1rem',
      backgroundColor: colors.primary.main + '10',
      borderRadius: '6px',
      border: `1px solid ${colors.primary.main}30`,
      transition: 'all 0.2s ease'
    },
    certificationBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      backgroundColor: colors.semantic.success + '20',
      border: `1px solid ${colors.semantic.success}`,
      borderRadius: '6px',
      marginBottom: '0.75rem'
    },
    badgeIcon: {
      fontSize: '1.25rem'
    },
    certificationInfo: {
      flex: 1
    },
    certificationName: {
      fontSize: typography.scale.caption.size,
      fontWeight: 600,
      color: colors.neutral.text.primary,
      marginBottom: '0.125rem'
    },
    certificationIssuer: {
      fontSize: '0.75rem',
      color: colors.neutral.text.muted
    }
  };

  // Mobile responsive adjustments
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    techStyles.header.gridTemplateColumns = '1fr';
    techStyles.contentGrid.gridTemplateColumns = '1fr';
    techStyles.experienceHeader.flexDirection = 'column';
    techStyles.experienceHeader.alignItems = 'flex-start';
  }

  // Get skill proficiency level (mock implementation)
  const getSkillLevel = (skill: string): number => {
    const levels = { 'React': 90, 'TypeScript': 85, 'Node.js': 80, 'Python': 75, 'AWS': 70 };
    return (levels as any)[skill] || 65;
  };

  // Render skills matrix with proficiency bars
  const renderSkillsMatrix = () => {
    if (!cvData.skills?.categories) return null;

    return (
      <div style={techStyles.sidebarSection}>
        <h3 style={techStyles.sidebarTitle}>
          <span>📊</span>
          Technical Skills
        </h3>
        <div style={techStyles.skillsMatrix}>
          {Object.entries(cvData.skills.categories).map(([category, skills]) => (
            <div key={category} style={techStyles.skillCategory}>
              <h4 style={techStyles.skillCategoryTitle}>{category}</h4>
              {skills.slice(0, 5).map((skill, index) => {
                const level = getSkillLevel(skill);
                return (
                  <div key={index} style={techStyles.skillBar}>
                    <div style={techStyles.skillName}>
                      <span>{skill}</span>
                      <span style={{ color: colors.neutral.text.muted }}>{level}%</span>
                    </div>
                    <div style={techStyles.progressBar}>
                      <div 
                        style={{
                          ...techStyles.progressFill,
                          width: `${level}%`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render certifications with badges
  const renderCertifications = () => {
    if (!cvData.certifications?.length) return null;

    return (
      <div style={techStyles.sidebarSection}>
        <h3 style={techStyles.sidebarTitle}>
          <span>🏅</span>
          Certifications
        </h3>
        {cvData.certifications.map((cert, index) => (
          <div key={index} style={techStyles.certificationBadge}>
            <div style={techStyles.badgeIcon}>✓</div>
            <div style={techStyles.certificationInfo}>
              <div style={techStyles.certificationName}>{cert.name}</div>
              <div style={techStyles.certificationIssuer}>
                {cert.issuer} • {cert.year}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render experience with tech focus
  const renderExperience = () => {
    if (!cvData.experience?.length) return null;

    return (
      <div style={techStyles.section}>
        <h3 style={techStyles.sectionTitle}>
          <span>💼</span>
          Professional Experience
        </h3>
        {cvData.experience.map((exp, index) => (
          <div key={index} style={techStyles.experienceCard}>
            <div style={techStyles.experienceHeader}>
              <div>
                <h4 style={techStyles.position}>{exp.title}</h4>
                <div style={techStyles.company}>{exp.company}</div>
              </div>
              <div style={techStyles.duration}>{exp.duration}</div>
            </div>
            
            {exp.description && (
              <p style={{ 
                color: colors.neutral.text.primary, 
                lineHeight: '1.5', 
                marginBottom: '1rem' 
              }}>
                {exp.description}
              </p>
            )}

            {exp.achievements && (
              <ul style={techStyles.achievements}>
                {exp.achievements.map((achievement, achIndex) => (
                  <li key={achIndex} style={techStyles.achievement}>
                    <div style={techStyles.achievementBullet}></div>
                    {achievement}
                  </li>
                ))}
              </ul>
            )}

            {exp.technologies && (
              <div style={techStyles.technologies}>
                {exp.technologies.map((tech, techIndex) => (
                  <span key={techIndex} style={techStyles.techTag}>
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render projects section
  const renderProjects = () => {
    if (!cvData.projects?.length) return null;

    return (
      <div style={techStyles.section}>
        <h3 style={techStyles.sectionTitle}>
          <span>🚀</span>
          Featured Projects
        </h3>
        {cvData.projects.map((project, index) => (
          <div key={index} style={techStyles.projectCard}>
            <h4 style={techStyles.projectTitle}>{project.title}</h4>
            <p style={techStyles.projectDescription}>{project.description}</p>
            
            {project.technologies && (
              <div style={techStyles.technologies}>
                {project.technologies.map((tech, techIndex) => (
                  <span key={techIndex} style={techStyles.techTag}>
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {project.url && (
              <a 
                href={project.url} 
                style={techStyles.githubLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>🔗</span>
                View Project
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render education
  const renderEducation = () => {
    if (!cvData.education?.length) return null;

    return (
      <div style={techStyles.sidebarSection}>
        <h3 style={techStyles.sidebarTitle}>
          <span>🎓</span>
          Education
        </h3>
        {cvData.education.map((edu, index) => (
          <div key={index} style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: typography.scale.body.size,
              fontWeight: 600,
              color: colors.neutral.text.primary,
              marginBottom: '0.25rem'
            }}>
              {edu.degree}
            </div>
            <div style={{
              fontSize: typography.scale.caption.size,
              color: colors.primary.main,
              marginBottom: '0.25rem'
            }}>
              {edu.institution}
            </div>
            <div style={{
              fontSize: typography.scale.caption.size,
              color: colors.neutral.text.muted
            }}>
              {edu.year}
            </div>
            {edu.field && (
              <div style={{
                fontSize: typography.scale.caption.size,
                color: colors.neutral.text.secondary,
                fontStyle: 'italic',
                marginTop: '0.25rem'
              }}>
                {edu.field}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Get top skills for header preview
  const getTopSkills = (): string[] => {
    if (!cvData.skills?.categories) return [];
    const allSkills = Object.values(cvData.skills.categories).flat();
    return allSkills.slice(0, 6);
  };

  return (
    <div className={className} style={techStyles.container}>
      {/* Tech Header */}
      <header style={techStyles.header}>
        <div style={techStyles.personalInfo}>
          <h1 style={techStyles.name}>
            {cvData.personalInfo?.fullName || 'Technical Professional'}
          </h1>
          <h2 style={techStyles.title}>
            Senior Software Engineer
          </h2>
          <div style={techStyles.contactInfo}>
            {cvData.personalInfo?.email && (
              <div>{cvData.personalInfo.email}</div>
            )}
            {cvData.personalInfo?.phone && (
              <div>{cvData.personalInfo.phone}</div>
            )}
            {cvData.personalInfo?.location && (
              <div>{cvData.personalInfo.location}</div>
            )}
            {cvData.personalInfo?.github && (
              <div>GitHub: {cvData.personalInfo.github}</div>
            )}
            {cvData.personalInfo?.linkedin && (
              <div>LinkedIn: {cvData.personalInfo.linkedin}</div>
            )}
          </div>
        </div>

        <div style={techStyles.skillsPreview}>
          <h3 style={{
            fontSize: typography.scale.h4.size,
            fontWeight: typography.scale.h4.weight,
            color: colors.primary.main,
            marginBottom: '0.75rem'
          }}>
            Top Skills
          </h3>
          <div style={techStyles.topSkills}>
            {getTopSkills().map((skill, index) => (
              <span key={index} style={techStyles.skillChip}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Executive Summary */}
      {cvData.summary && (
        <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
          <div style={{
            backgroundColor: colors.neutral.surface,
            padding: '1.5rem',
            borderRadius: '8px',
            border: `1px solid ${colors.neutral.border}`,
            fontSize: typography.scale.body.size,
            lineHeight: '1.6',
            color: colors.neutral.text.primary
          }}>
            {cvData.summary}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={techStyles.contentGrid}>
        {/* Main Content */}
        <div>
          {renderExperience()}
          {renderProjects()}
        </div>

        {/* Sidebar */}
        <div style={techStyles.sidebar}>
          {renderSkillsMatrix()}
          {renderCertifications()}
          {renderEducation()}
        </div>
      </div>

      {/* Feature Previews */}
      {showFeaturePreviews && (
        <div style={{ 
          padding: '2rem',
          backgroundColor: colors.secondary.main + '10',
          borderTop: `1px solid ${colors.neutral.border}`,
          marginTop: '2rem'
        }}>
          <div style={{
            textAlign: 'center',
            color: colors.primary.main,
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            💻 Tech Innovation Features
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
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Code Analysis</div>
              <div style={{ fontSize: '0.875rem', color: colors.neutral.text.muted }}>
                GitHub integration & metrics
              </div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: colors.neutral.surface,
              borderRadius: '8px',
              textAlign: 'center',
              border: `1px solid ${colors.neutral.border}`
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚙️</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Tech Stack Visualization</div>
              <div style={{ fontSize: '0.875rem', color: colors.neutral.text.muted }}>
                Interactive skills matrix
              </div>
            </div>
            <div style={{
              padding: '1rem',
              backgroundColor: colors.neutral.surface,
              borderRadius: '8px',
              textAlign: 'center',
              border: `1px solid ${colors.neutral.border}`
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Certification Tracker</div>
              <div style={{ fontSize: '0.875rem', color: colors.neutral.text.muted }}>
                Professional credentials
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};