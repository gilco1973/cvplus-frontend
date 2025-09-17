import React from 'react';
import type { CVParsedData } from '../../types/cvData';
import type { CVTemplate, SelectedFeatures } from '../../types/cv-templates';
import { PROFESSIONAL_TEMPLATES } from '../../data/professional-templates';

interface HealthcareTemplateProps {
  cvData: CVParsedData;
  template: CVTemplate;
  isEditing: boolean;
  selectedFeatures: SelectedFeatures;
  onSectionEdit: (section: string, value: unknown) => void;
  showFeaturePreviews: boolean;
  className?: string;
}

export const HealthcareTemplate: React.FC<HealthcareTemplateProps> = ({
  cvData,
  template,
  isEditing,
  selectedFeatures,
  onSectionEdit,
  showFeaturePreviews,
  className = ''
}) => {
  const healthcareTemplate = PROFESSIONAL_TEMPLATES['healthcare-professional'];
  const { colors, typography, styling } = healthcareTemplate;

  // Healthcare-specific styling with trust and care focus
  const healthcareStyles = {
    container: {
      fontFamily: typography.fonts.primary.family,
      backgroundColor: colors.neutral.background,
      color: colors.neutral.text.primary,
      lineHeight: '1.6',
      position: 'relative' as const
    },
    trustIndicator: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
      zIndex: 10
    },
    header: {
      backgroundColor: colors.neutral.surface,
      padding: '2.5rem 2rem',
      borderBottom: `3px solid ${colors.primary.main}`,
      marginBottom: '2rem',
      position: 'relative' as const
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '2rem',
      alignItems: 'center'
    },
    personalInfo: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    name: {
      fontSize: typography.scale.h1.size,
      fontWeight: typography.scale.h1.weight,
      color: colors.neutral.text.primary,
      marginBottom: '0.5rem'
    },
    title: {
      fontSize: typography.scale.h3.size,
      fontWeight: typography.scale.h3.weight,
      color: colors.primary.main,
      marginBottom: '1rem'
    },
    credentials: {
      fontSize: typography.scale.body.size,
      color: colors.secondary.main,
      fontWeight: 600,
      marginBottom: '1rem',
      padding: '0.5rem 1rem',
      backgroundColor: colors.secondary.main + '20',
      borderRadius: '20px',
      display: 'inline-block',
      border: `1px solid ${colors.secondary.main}30`
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.5rem',
      fontSize: typography.scale.caption.size,
      color: colors.neutral.text.secondary
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem 0'
    },
    trustBadges: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
      alignItems: 'flex-end'
    },
    trustBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: colors.semantic.success + '20',
      color: colors.semantic.success,
      padding: '0.5rem 1rem',
      borderRadius: '15px',
      fontSize: typography.scale.caption.size,
      fontWeight: 600,
      border: `1px solid ${colors.semantic.success}30`
    },
    contentLayout: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '3rem',
      padding: '0 2rem 3rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    section: {
      marginBottom: '3rem'
    },
    sectionTitle: {
      fontSize: typography.scale.h2.size,
      fontWeight: typography.scale.h2.weight,
      color: colors.primary.main,
      marginBottom: '1.5rem',
      paddingBottom: '0.75rem',
      borderBottom: `2px solid ${colors.secondary.main}`,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    sectionIcon: {
      width: '32px',
      height: '32px',
      backgroundColor: colors.primary.main,
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1rem'
    },
    experienceCard: {
      backgroundColor: colors.neutral.surface,
      border: `1px solid ${colors.neutral.border}`,
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
      position: 'relative' as const,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    medicalBadge: {
      position: 'absolute' as const,
      top: '1rem',
      right: '1rem',
      backgroundColor: colors.primary.main,
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 600
    },
    position: {
      fontSize: typography.scale.h3.size,
      fontWeight: typography.scale.h3.weight,
      color: colors.neutral.text.primary,
      marginBottom: '0.5rem'
    },
    institution: {
      fontSize: typography.scale.h4.size,
      fontWeight: typography.scale.h4.weight,
      color: colors.primary.main,
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
    patientCareMetrics: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: colors.semantic.info + '10',
      borderRadius: '8px',
      border: `1px solid ${colors.semantic.info}30`
    },
    metric: {
      textAlign: 'center' as const
    },
    metricValue: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: colors.semantic.info,
      marginBottom: '0.25rem'
    },
    metricLabel: {
      fontSize: '0.75rem',
      color: colors.neutral.text.muted,
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
      paddingLeft: '1.75rem',
      marginBottom: '0.75rem',
      color: colors.neutral.text.primary,
      lineHeight: '1.5'
    },
    achievementIcon: {
      position: 'absolute' as const,
      left: 0,
      top: '0.125rem',
      width: '12px',
      height: '12px',
      backgroundColor: colors.semantic.success,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '0.6rem'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '2rem'
    },
    sidebarSection: {
      backgroundColor: colors.neutral.surface,
      border: `1px solid ${colors.neutral.border}`,
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    sidebarTitle: {
      fontSize: typography.scale.h4.size,
      fontWeight: typography.scale.h4.weight,
      color: colors.primary.main,
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    certificationsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    certificationCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: colors.semantic.success + '10',
      border: `1px solid ${colors.semantic.success}30`,
      borderRadius: '8px'
    },
    certificationIcon: {
      width: '36px',
      height: '36px',
      backgroundColor: colors.semantic.success,
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1.125rem',
      flexShrink: 0
    },
    certificationInfo: {
      flex: 1
    },
    certificationName: {
      fontSize: typography.scale.caption.size,
      fontWeight: 600,
      color: colors.neutral.text.primary,
      marginBottom: '0.25rem'
    },
    certificationDetails: {
      fontSize: '0.75rem',
      color: colors.neutral.text.muted
    },
    skillsGrid: {
      display: 'grid',
      gap: '1rem'
    },
    skillCategory: {
      backgroundColor: colors.neutral.background,
      padding: '1rem',
      borderRadius: '8px',
      border: `1px solid ${colors.neutral.border}`
    },
    skillCategoryTitle: {
      fontSize: typography.scale.body.size,
      fontWeight: 600,
      color: colors.primary.main,
      marginBottom: '0.75rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.025em'
    },
    skillTags: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem'
    },
    skillTag: {
      backgroundColor: colors.primary.main + '20',
      color: colors.primary.main,
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 500,
      border: `1px solid ${colors.primary.main}30`
    },
    publicationsSection: {
      marginTop: '2rem'
    },
    publicationCard: {
      backgroundColor: colors.neutral.background,
      border: `1px solid ${colors.neutral.border}`,
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem'
    },
    publicationTitle: {
      fontSize: typography.scale.caption.size,
      fontWeight: 600,
      color: colors.neutral.text.primary,
      marginBottom: '0.25rem'
    },
    publicationJournal: {
      fontSize: '0.75rem',
      color: colors.primary.main,
      fontStyle: 'italic'
    },
    summaryCard: {
      backgroundColor: colors.neutral.surface,
      padding: '2rem',
      borderRadius: '12px',
      border: `1px solid ${colors.neutral.border}`,
      marginBottom: '3rem',
      fontSize: typography.scale.body.size,
      lineHeight: '1.7',
      color: colors.neutral.text.primary,
      position: 'relative' as const
    },
    summaryAccent: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
      borderRadius: '12px 12px 0 0'
    }
  };

  // Mobile responsive adjustments
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    healthcareStyles.headerContent.gridTemplateColumns = '1fr';
    healthcareStyles.contentLayout.gridTemplateColumns = '1fr';
    healthcareStyles.trustBadges.alignItems = 'flex-start';
    healthcareStyles.patientCareMetrics.gridTemplateColumns = '1fr';
  }

  // Render medical certifications
  const renderCertifications = () => {
    if (!cvData.certifications?.length) return null;

    return (
      <div style={healthcareStyles.sidebarSection}>
        <h3 style={healthcareStyles.sidebarTitle}>
          <span>🏅</span>
          Medical Certifications
        </h3>
        <div style={healthcareStyles.certificationsList}>
          {cvData.certifications.map((cert, index) => (
            <div key={index} style={healthcareStyles.certificationCard}>
              <div style={healthcareStyles.certificationIcon}>✓</div>
              <div style={healthcareStyles.certificationInfo}>
                <div style={healthcareStyles.certificationName}>{cert.name}</div>
                <div style={healthcareStyles.certificationDetails}>
                  {cert.issuer} • {cert.year}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render healthcare-focused skills
  const renderSkills = () => {
    if (!cvData.skills?.categories) return null;

    return (
      <div style={healthcareStyles.sidebarSection}>
        <h3 style={healthcareStyles.sidebarTitle}>
          <span>🩺</span>
          Clinical Competencies
        </h3>
        <div style={healthcareStyles.skillsGrid}>
          {Object.entries(cvData.skills.categories).map(([category, skills]) => (
            <div key={category} style={healthcareStyles.skillCategory}>
              <h4 style={healthcareStyles.skillCategoryTitle}>{category}</h4>
              <div style={healthcareStyles.skillTags}>
                {skills.map((skill, index) => (
                  <span key={index} style={healthcareStyles.skillTag}>
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

  // Render clinical experience with patient care focus
  const renderExperience = () => {
    if (!cvData.experience?.length) return null;

    return (
      <div style={healthcareStyles.section}>
        <h3 style={healthcareStyles.sectionTitle}>
          <div style={healthcareStyles.sectionIcon}>🏥</div>
          Clinical Experience
        </h3>
        {cvData.experience.map((exp, index) => (
          <div key={index} style={healthcareStyles.experienceCard}>
            <div style={healthcareStyles.medicalBadge}>Clinical</div>
            <h4 style={healthcareStyles.position}>{exp.title}</h4>
            <div style={healthcareStyles.institution}>{exp.company}</div>
            <div style={healthcareStyles.duration}>{exp.duration}</div>
            
            {exp.description && (
              <p style={{ 
                color: colors.neutral.text.primary, 
                lineHeight: '1.6', 
                marginBottom: '1rem' 
              }}>
                {exp.description}
              </p>
            )}

            {/* Mock patient care metrics */}
            <div style={healthcareStyles.patientCareMetrics}>
              <div style={healthcareStyles.metric}>
                <div style={healthcareStyles.metricValue}>98%</div>
                <div style={healthcareStyles.metricLabel}>Patient Satisfaction</div>
              </div>
              <div style={healthcareStyles.metric}>
                <div style={healthcareStyles.metricValue}>500+</div>
                <div style={healthcareStyles.metricLabel}>Patients Treated</div>
              </div>
              <div style={healthcareStyles.metric}>
                <div style={healthcareStyles.metricValue}>15%</div>
                <div style={healthcareStyles.metricLabel}>Reduced Readmissions</div>
              </div>
            </div>

            {exp.achievements && (
              <ul style={healthcareStyles.achievements}>
                {exp.achievements.map((achievement, achIndex) => (
                  <li key={achIndex} style={healthcareStyles.achievement}>
                    <div style={healthcareStyles.achievementIcon}>+</div>
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

  // Render education with medical focus
  const renderEducation = () => {
    if (!cvData.education?.length) return null;

    return (
      <div style={healthcareStyles.section}>
        <h3 style={healthcareStyles.sectionTitle}>
          <div style={healthcareStyles.sectionIcon}>🎓</div>
          Medical Education
        </h3>
        {cvData.education.map((edu, index) => (
          <div key={index} style={healthcareStyles.experienceCard}>
            <div style={{
              ...healthcareStyles.medicalBadge,
              backgroundColor: colors.secondary.main
            }}>Education</div>
            <h4 style={healthcareStyles.position}>{edu.degree}</h4>
            <div style={healthcareStyles.institution}>{edu.institution}</div>
            <div style={healthcareStyles.duration}>{edu.year}</div>
            {edu.field && (
              <p style={{ 
                color: colors.neutral.text.secondary,
                fontStyle: 'italic',
                marginTop: '0.5rem'
              }}>
                Specialization: {edu.field}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render publications if available
  const renderPublications = () => {
    const publications = cvData.publications || [
      'Patient Care Excellence in Internal Medicine (Medical Journal, 2023)',
      'Quality Improvement in Healthcare Settings (Healthcare Today, 2022)'
    ];

    return (
      <div style={healthcareStyles.sidebarSection}>
        <h3 style={healthcareStyles.sidebarTitle}>
          <span>📚</span>
          Publications
        </h3>
        <div style={healthcareStyles.publicationsSection}>
          {publications.slice(0, 3).map((publication, index) => {
            const [title, journal] = publication.split(' (');
            return (
              <div key={index} style={healthcareStyles.publicationCard}>
                <div style={healthcareStyles.publicationTitle}>{title}</div>
                <div style={healthcareStyles.publicationJournal}>
                  {journal?.replace(')', '') || 'Medical Publication'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={className} style={healthcareStyles.container}>
      {/* Trust Indicator */}
      <div style={healthcareStyles.trustIndicator}></div>

      {/* Healthcare Header */}
      <header style={healthcareStyles.header}>
        <div style={healthcareStyles.headerContent}>
          <div style={healthcareStyles.personalInfo}>
            <h1 style={healthcareStyles.name}>
              {cvData.personalInfo?.fullName || 'Dr. Healthcare Professional'}
            </h1>
            <h2 style={healthcareStyles.title}>
              Board-Certified Internal Medicine Physician
            </h2>
            <div style={healthcareStyles.credentials}>
              MD, FACP • Board Certified Internal Medicine
            </div>
            <div style={healthcareStyles.contactGrid}>
              {cvData.personalInfo?.email && (
                <div style={healthcareStyles.contactItem}>
                  <span>📧</span>
                  {cvData.personalInfo.email}
                </div>
              )}
              {cvData.personalInfo?.phone && (
                <div style={healthcareStyles.contactItem}>
                  <span>📱</span>
                  {cvData.personalInfo.phone}
                </div>
              )}
              {cvData.personalInfo?.location && (
                <div style={healthcareStyles.contactItem}>
                  <span>📍</span>
                  {cvData.personalInfo.location}
                </div>
              )}
              {cvData.personalInfo?.linkedin && (
                <div style={healthcareStyles.contactItem}>
                  <span>🔗</span>
                  {cvData.personalInfo.linkedin}
                </div>
              )}
            </div>
          </div>

          <div style={healthcareStyles.trustBadges}>
            <div style={healthcareStyles.trustBadge}>
              <span>✓</span>
              Licensed Physician
            </div>
            <div style={healthcareStyles.trustBadge}>
              <span>🏅</span>
              Board Certified
            </div>
            <div style={healthcareStyles.trustBadge}>
              <span>🏥</span>
              Hospital Privileges
            </div>
          </div>
        </div>
      </header>

      {/* Professional Summary */}
      {cvData.summary && (
        <div style={{ padding: '0 2rem' }}>
          <div style={healthcareStyles.summaryCard}>
            <div style={healthcareStyles.summaryAccent}></div>
            {cvData.summary}
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div style={healthcareStyles.contentLayout}>
        {/* Main Content */}
        <div>
          {renderExperience()}
          {renderEducation()}
        </div>

        {/* Sidebar */}
        <div style={healthcareStyles.sidebar}>
          {renderCertifications()}
          {renderSkills()}
          {renderPublications()}
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
            marginBottom: '1rem',
            fontSize: typography.scale.h3.size
          }}>
            🏥 Healthcare Professional Features
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              padding: '1.5rem',
              backgroundColor: colors.neutral.surface,
              borderRadius: '12px',
              textAlign: 'center',
              border: `1px solid ${colors.neutral.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
              <div style={{ 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                color: colors.neutral.text.primary
              }}>Patient Care Metrics</div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: colors.neutral.text.muted,
                lineHeight: '1.5'
              }}>
                Satisfaction scores, outcomes data, and quality indicators
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              backgroundColor: colors.neutral.surface,
              borderRadius: '12px',
              textAlign: 'center',
              border: `1px solid ${colors.neutral.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🩺</div>
              <div style={{ 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                color: colors.neutral.text.primary
              }}>Clinical Credentials</div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: colors.neutral.text.muted,
                lineHeight: '1.5'
              }}>
                Board certifications, licenses, and professional affiliations
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              backgroundColor: colors.neutral.surface,
              borderRadius: '12px',
              textAlign: 'center',
              border: `1px solid ${colors.neutral.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
              <div style={{ 
                fontWeight: 600, 
                marginBottom: '0.5rem',
                color: colors.neutral.text.primary
              }}>Research & Publications</div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: colors.neutral.text.muted,
                lineHeight: '1.5'
              }}>
                Peer-reviewed articles and clinical research contributions
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};