import React from 'react';
import type { CVParsedData } from '../../types/cvData';
import type { CVTemplate, SelectedFeatures } from '../../types/cv-templates';
import { PROFESSIONAL_TEMPLATES } from '../../data/professional-templates';

interface CreativeTemplateProps {
  cvData: CVParsedData;
  template: CVTemplate;
  isEditing: boolean;
  selectedFeatures: SelectedFeatures;
  onSectionEdit: (section: string, value: unknown) => void;
  showFeaturePreviews: boolean;
  className?: string;
}

export const CreativeTemplate: React.FC<CreativeTemplateProps> = ({
  cvData,
  template,
  isEditing,
  selectedFeatures,
  onSectionEdit,
  showFeaturePreviews,
  className = ''
}) => {
  const creativeTemplate = PROFESSIONAL_TEMPLATES['creative-showcase'];
  const { colors, typography, styling } = creativeTemplate;

  // Creative-specific styling with artistic flair
  const creativeStyles = {
    container: {
      fontFamily: typography.fonts.secondary.family,
      backgroundColor: colors.neutral.background,
      color: colors.neutral.text.primary,
      lineHeight: '1.6',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    backgroundPattern: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: '300px',
      background: `linear-gradient(135deg, ${colors.primary.main}15 0%, ${colors.secondary.main}15 100%)`,
      clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)',
      zIndex: 0
    },
    header: {
      position: 'relative' as const,
      zIndex: 1,
      padding: '3rem 2rem 2rem',
      textAlign: 'center' as const,
      marginBottom: '2rem'
    },
    name: {
      fontFamily: typography.fonts.primary.family,
      fontSize: typography.scale.h1.size,
      fontWeight: typography.scale.h1.weight,
      lineHeight: typography.scale.h1.lineHeight,
      letterSpacing: typography.scale.h1.letterSpacing,
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.5rem'
    },
    tagline: {
      fontSize: typography.scale.h3.size,
      fontWeight: typography.scale.h3.weight,
      color: colors.neutral.text.secondary,
      marginBottom: '1.5rem',
      fontStyle: 'italic'
    },
    contactArt: {
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem',
      flexWrap: 'wrap' as const,
      fontSize: typography.scale.body.size
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: colors.neutral.text.primary,
      textDecoration: 'none',
      padding: '0.5rem 1rem',
      backgroundColor: colors.neutral.surface,
      borderRadius: '25px',
      border: `2px solid ${colors.primary.main}30`,
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    contentLayout: {
      position: 'relative' as const,
      zIndex: 1,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '3rem',
      padding: '0 2rem 3rem',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    section: {
      marginBottom: '3rem'
    },
    sectionTitle: {
      fontFamily: typography.fonts.primary.family,
      fontSize: typography.scale.h2.size,
      fontWeight: typography.scale.h2.weight,
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '2rem',
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    sectionIcon: {
      fontSize: '2rem',
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      boxShadow: `0 8px 32px ${colors.primary.main}30`
    },
    portfolioGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem'
    },
    portfolioCard: {
      backgroundColor: colors.neutral.surface,
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: styling.components.cards.shadow,
      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      border: `2px solid ${colors.neutral.border}`,
      position: 'relative' as const
    },
    portfolioImage: {
      width: '100%',
      height: '200px',
      background: `linear-gradient(135deg, ${colors.primary.main}30 0%, ${colors.secondary.main}30 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      color: colors.primary.main,
      position: 'relative' as const
    },
    portfolioOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${colors.primary.main}90 0%, ${colors.secondary.main}90 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      transition: 'opacity 0.3s ease',
      color: 'white',
      fontWeight: 600
    },
    portfolioContent: {
      padding: '1.5rem'
    },
    portfolioTitle: {
      fontSize: typography.scale.h4.size,
      fontWeight: typography.scale.h4.weight,
      color: colors.neutral.text.primary,
      marginBottom: '0.5rem'
    },
    portfolioDescription: {
      color: colors.neutral.text.secondary,
      lineHeight: '1.5',
      fontSize: typography.scale.caption.size
    },
    experienceTimeline: {
      position: 'relative' as const,
      paddingLeft: '2rem'
    },
    timelineConnector: {
      position: 'absolute' as const,
      left: '1rem',
      top: 0,
      bottom: 0,
      width: '3px',
      background: `linear-gradient(180deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`
    },
    experienceCard: {
      position: 'relative' as const,
      backgroundColor: colors.neutral.surface,
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      marginLeft: '1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: `2px solid ${colors.neutral.border}`,
      transition: 'all 0.3s ease'
    },
    experienceDot: {
      position: 'absolute' as const,
      left: '-2.75rem',
      top: '2rem',
      width: '20px',
      height: '20px',
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
      borderRadius: '50%',
      border: `4px solid ${colors.neutral.background}`,
      boxShadow: `0 0 0 3px ${colors.primary.main}30`
    },
    position: {
      fontFamily: typography.fonts.primary.family,
      fontSize: typography.scale.h3.size,
      fontWeight: typography.scale.h3.weight,
      color: colors.neutral.text.primary,
      marginBottom: '0.5rem'
    },
    company: {
      fontSize: typography.scale.h4.size,
      fontWeight: typography.scale.h4.weight,
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '0.5rem'
    },
    duration: {
      fontSize: typography.scale.caption.size,
      color: colors.neutral.text.muted,
      fontWeight: 500,
      marginBottom: '1rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em'
    },
    creativeAchievements: {
      listStyle: 'none',
      padding: 0,
      marginTop: '1rem'
    },
    creativeAchievement: {
      position: 'relative' as const,
      paddingLeft: '2rem',
      marginBottom: '1rem',
      color: colors.neutral.text.primary,
      lineHeight: '1.6'
    },
    achievementIcon: {
      position: 'absolute' as const,
      left: 0,
      top: '0.25rem',
      width: '16px',
      height: '16px',
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '0.75rem',
      fontWeight: 600
    },
    skillsArt: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem'
    },
    skillCategory: {
      backgroundColor: colors.neutral.surface,
      padding: '1.5rem',
      borderRadius: '20px',
      border: `2px solid ${colors.neutral.border}`,
      position: 'relative' as const,
      overflow: 'hidden'
    },
    skillCategoryBg: {
      position: 'absolute' as const,
      top: 0,
      right: 0,
      width: '100px',
      height: '100px',
      background: `linear-gradient(135deg, ${colors.primary.main}10 0%, ${colors.secondary.main}10 100%)`,
      borderRadius: '50%',
      transform: 'translate(30px, -30px)'
    },
    skillCategoryTitle: {
      fontFamily: typography.fonts.primary.family,
      fontSize: typography.scale.h4.size,
      fontWeight: typography.scale.h4.weight,
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '1rem',
      position: 'relative' as const,
      zIndex: 1
    },
    skillCircles: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '1rem',
      position: 'relative' as const,
      zIndex: 1
    },
    skillCircle: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.secondary.main}20 100%)`,
      border: `3px solid ${colors.primary.main}30`,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      fontWeight: 600,
      textAlign: 'center' as const,
      color: colors.neutral.text.primary,
      transition: 'all 0.3s ease'
    },
    summaryArt: {
      backgroundColor: colors.neutral.surface,
      padding: '2rem',
      borderRadius: '20px',
      border: `2px solid ${colors.neutral.border}`,
      position: 'relative' as const,
      overflow: 'hidden',
      marginBottom: '3rem',
      fontSize: typography.scale.body.size,
      lineHeight: '1.7',
      color: colors.neutral.text.primary
    },
    summaryAccent: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '5px',
      background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`
    },
    awardsShowcase: {
      display: 'grid',
      gap: '1rem'
    },
    awardCard: {
      backgroundColor: colors.neutral.surface,
      padding: '1.5rem',
      borderRadius: '15px',
      border: `2px solid ${colors.secondary.main}30`,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'all 0.3s ease'
    },
    awardIcon: {
      fontSize: '2rem',
      background: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.primary.main} 100%)`,
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    },
    awardInfo: {
      flex: 1
    },
    awardTitle: {
      fontWeight: 600,
      color: colors.neutral.text.primary,
      marginBottom: '0.25rem'
    },
    awardDescription: {
      fontSize: typography.scale.caption.size,
      color: colors.neutral.text.muted
    }
  };

  // Mobile responsive adjustments
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    creativeStyles.contentLayout.gridTemplateColumns = '1fr';
    creativeStyles.contentLayout.gap = '2rem';
    creativeStyles.portfolioGrid.gridTemplateColumns = '1fr';
    creativeStyles.contactArt.flexDirection = 'column';
  }

  // Render portfolio section with project thumbnails
  const renderPortfolio = () => {
    if (!cvData.projects?.length) return null;

    const portfolioIcons = ['🎨', '📱', '💻', '🖼️', '🎆', '📚'];

    return (
      <div style={creativeStyles.section}>
        <h3 style={creativeStyles.sectionTitle}>
          <div style={creativeStyles.sectionIcon}>🎨</div>
          Creative Portfolio
        </h3>
        <div style={creativeStyles.portfolioGrid}>
          {cvData.projects.map((project, index) => (
            <div 
              key={index} 
              style={{
                ...creativeStyles.portfolioCard,
                ':hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 20px 40px ${colors.primary.main}20`
                }
              }}
            >
              <div style={creativeStyles.portfolioImage}>
                {portfolioIcons[index % portfolioIcons.length]}
                <div 
                  style={{
                    ...creativeStyles.portfolioOverlay,
                    ':hover': { opacity: 1 }
                  }}
                >
                  View Project
                </div>
              </div>
              <div style={creativeStyles.portfolioContent}>
                <h4 style={creativeStyles.portfolioTitle}>{project.title}</h4>
                <p style={creativeStyles.portfolioDescription}>{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render creative experience timeline
  const renderExperience = () => {
    if (!cvData.experience?.length) return null;

    return (
      <div style={creativeStyles.section}>
        <h3 style={creativeStyles.sectionTitle}>
          <div style={creativeStyles.sectionIcon}>🚀</div>
          Creative Journey
        </h3>
        <div style={creativeStyles.experienceTimeline}>
          <div style={creativeStyles.timelineConnector}></div>
          {cvData.experience.map((exp, index) => (
            <div key={index} style={creativeStyles.experienceCard}>
              <div style={creativeStyles.experienceDot}></div>
              <h4 style={creativeStyles.position}>{exp.title}</h4>
              <div style={creativeStyles.company}>{exp.company}</div>
              <div style={creativeStyles.duration}>{exp.duration}</div>
              
              {exp.description && (
                <p style={{ 
                  color: colors.neutral.text.primary, 
                  lineHeight: '1.6', 
                  marginBottom: '1rem' 
                }}>
                  {exp.description}
                </p>
              )}

              {exp.achievements && (
                <ul style={creativeStyles.creativeAchievements}>
                  {exp.achievements.map((achievement, achIndex) => (
                    <li key={achIndex} style={creativeStyles.creativeAchievement}>
                      <div style={creativeStyles.achievementIcon}>★</div>
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render creative skills with circular design
  const renderSkills = () => {
    if (!cvData.skills?.categories) return null;

    return (
      <div style={creativeStyles.section}>
        <h3 style={creativeStyles.sectionTitle}>
          <div style={creativeStyles.sectionIcon}>✨</div>
          Creative Skills
        </h3>
        <div style={creativeStyles.skillsArt}>
          {Object.entries(cvData.skills.categories).map(([category, skills]) => (
            <div key={category} style={creativeStyles.skillCategory}>
              <div style={creativeStyles.skillCategoryBg}></div>
              <h4 style={creativeStyles.skillCategoryTitle}>{category}</h4>
              <div style={creativeStyles.skillCircles}>
                {skills.slice(0, 6).map((skill, index) => (
                  <div 
                    key={index} 
                    style={{
                      ...creativeStyles.skillCircle,
                      ':hover': {
                        transform: 'scale(1.1)',
                        border: `3px solid ${colors.primary.main}`
                      }
                    }}
                  >
                    {skill.length > 10 ? skill.substring(0, 8) + '...' : skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render awards and recognition
  const renderAwards = () => {
    if (!cvData.awards?.length) return null;

    return (
      <div style={creativeStyles.section}>
        <h3 style={creativeStyles.sectionTitle}>
          <div style={creativeStyles.sectionIcon}>🏆</div>
          Recognition
        </h3>
        <div style={creativeStyles.awardsShowcase}>
          {cvData.awards.map((award, index) => (
            <div key={index} style={creativeStyles.awardCard}>
              <div style={creativeStyles.awardIcon}>🏅</div>
              <div style={creativeStyles.awardInfo}>
                <div style={creativeStyles.awardTitle}>{award.title}</div>
                <div style={creativeStyles.awardDescription}>
                  {award.issuer} • {award.year}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={className} style={creativeStyles.container}>
      {/* Background Pattern */}
      <div style={creativeStyles.backgroundPattern}></div>

      {/* Creative Header */}
      <header style={creativeStyles.header}>
        <h1 style={creativeStyles.name}>
          {cvData.personalInfo?.fullName || 'Creative Professional'}
        </h1>
        <h2 style={creativeStyles.tagline}>
          Crafting Visual Stories That Inspire
        </h2>
        <div style={creativeStyles.contactArt}>
          {cvData.personalInfo?.email && (
            <div style={creativeStyles.contactItem}>
              <span>📧</span>
              {cvData.personalInfo.email}
            </div>
          )}
          {cvData.personalInfo?.phone && (
            <div style={creativeStyles.contactItem}>
              <span>📱</span>
              {cvData.personalInfo.phone}
            </div>
          )}
          {cvData.personalInfo?.portfolio && (
            <div style={creativeStyles.contactItem}>
              <span>🎨</span>
              {cvData.personalInfo.portfolio}
            </div>
          )}
          {cvData.personalInfo?.linkedin && (
            <div style={creativeStyles.contactItem}>
              <span>🔗</span>
              {cvData.personalInfo.linkedin}
            </div>
          )}
        </div>
      </header>

      {/* Creative Summary */}
      {cvData.summary && (
        <div style={{ padding: '0 2rem' }}>
          <div style={creativeStyles.summaryArt}>
            <div style={creativeStyles.summaryAccent}></div>
            {cvData.summary}
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div style={creativeStyles.contentLayout}>
        {/* Left Column */}
        <div>
          {renderPortfolio()}
          {renderExperience()}
        </div>

        {/* Right Column */}
        <div>
          {renderSkills()}
          {renderAwards()}
        </div>
      </div>

      {/* Feature Previews */}
      {showFeaturePreviews && (
        <div style={{ 
          padding: '3rem 2rem',
          background: `linear-gradient(135deg, ${colors.primary.main}10 0%, ${colors.secondary.main}10 100%)`,
          borderTop: `1px solid ${colors.neutral.border}`,
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            textAlign: 'center',
            fontFamily: typography.fonts.primary.family,
            fontSize: typography.scale.h3.size,
            fontWeight: typography.scale.h3.weight,
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '2rem'
          }}>
            🎨 Creative Showcase Features
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              padding: '2rem',
              backgroundColor: colors.neutral.surface,
              borderRadius: '20px',
              textAlign: 'center',
              border: `2px solid ${colors.neutral.border}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
              <div style={{ 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                color: colors.neutral.text.primary
              }}>Portfolio Gallery</div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: colors.neutral.text.muted,
                lineHeight: '1.5'
              }}>
                Interactive project showcases with visual previews
              </div>
            </div>
            <div style={{
              padding: '2rem',
              backgroundColor: colors.neutral.surface,
              borderRadius: '20px',
              textAlign: 'center',
              border: `2px solid ${colors.neutral.border}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
              <div style={{ 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                color: colors.neutral.text.primary
              }}>Brand Identity</div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: colors.neutral.text.muted,
                lineHeight: '1.5'
              }}>
                Consistent visual identity across all touchpoints
              </div>
            </div>
            <div style={{
              padding: '2rem',
              backgroundColor: colors.neutral.surface,
              borderRadius: '20px',
              textAlign: 'center',
              border: `2px solid ${colors.neutral.border}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎆</div>
              <div style={{ 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                color: colors.neutral.text.primary
              }}>Creative Process</div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: colors.neutral.text.muted,
                lineHeight: '1.5'
              }}>
                Visual journey through design thinking methodology
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};