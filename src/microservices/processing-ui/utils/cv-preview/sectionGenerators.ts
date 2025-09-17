import type { QRCodeSettings } from '../../types/cv-preview';
import type { CVExperienceItem, CVEducationItem, CVSkillsData, CVPersonalInfo } from '../../types/cvData';
import { createPreviewContent, hasPlaceholders, PlaceholderReplacements } from '../placeholderReplacer';

export class SectionGenerators {
  static generateQRCodeSection(qrCodeSettings: QRCodeSettings, collapsedSections: Record<string, boolean>): string {
    return `
      <div class="feature-preview" data-feature="qr-code">
        <div class="feature-preview-banner">
          📱 QR Code for easy profile sharing
          <button onclick="editQRCode()" style="margin-left: 10px; padding: 4px 10px; background: #4299e1; color: #ffffff; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">✏️ Edit URL</button>
        </div>
        <h3 class="section-title" onclick="toggleSection('qr-code')">
          📱 Quick Access QR Code
          <div class="collapse-icon ${collapsedSections['qr-code'] ? 'collapsed' : ''}">▼</div>
        </h3>
        <div class="section-content ${collapsedSections['qr-code'] ? 'collapsed' : ''}" style="text-align: center; margin: 20px 0;">
          <div style="width: 120px; height: 120px; background: #f0f0f0; border: 2px dashed #ccc; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; margin: 0 auto;">
            QR Code Will Be Generated
          </div>
          <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; font-size: 12px;">
            <div><strong>Destination:</strong> ${qrCodeSettings.type.charAt(0).toUpperCase() + qrCodeSettings.type.slice(1)}</div>
            <div style="margin-top: 5px; word-break: break-all;"><strong>URL:</strong> ${qrCodeSettings.url}</div>
            <div style="margin-top: 5px;"><strong>Text:</strong> ${qrCodeSettings.customText}</div>
          </div>
        </div>
      </div>
    `;
  }

  static generateSummarySection(summary: string, collapsedSections: Record<string, boolean>, customSections?: Record<string, string>): string {
    // Check for enhanced summary in customSections
    const enhancedSummary = customSections?.['Summary'] || customSections?.['Professional Summary'];
    const contentToUse = enhancedSummary || summary;
    const isEnhanced = !!enhancedSummary;
    
    // Show placeholders as clickable elements for user input
    const displaySummary = contentToUse ? createPreviewContent(contentToUse) : 'Professional summary will be displayed here...';
    const hasPlaceholderContent = contentToUse && hasPlaceholders(contentToUse);
    
    return `
      <div class="section editable-section" data-section="summary">
        <div class="edit-overlay" onclick="editSection('summary')">✏️</div>
        <h2 class="section-title" onclick="toggleSection('summary')">
          Professional Summary
          <div class="collapse-icon ${collapsedSections.summary ? 'collapsed' : ''}">▼</div>
        </h2>
        <div class="section-content ${collapsedSections.summary ? 'collapsed' : ''}">
          <div class="${isEnhanced ? 'enhanced-summary' : ''}">
            <p${hasPlaceholderContent ? ' class="preview-content-with-placeholders"' : ''}>${displaySummary}</p>
            ${hasPlaceholderContent ? '<div class="placeholder-hint">💡 <em>Click on placeholders like [INSERT NUMBER] to enter your real data</em></div>' : ''}
            ${isEnhanced ? '<div class="improvement-badge">✨ Enhanced with AI</div>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  static generateExperienceSection(experience: CVExperienceItem[], collapsedSections: Record<string, boolean>, customSections?: Record<string, string>): string {
    return `
      <div class="section editable-section" data-section="experience">
        <div class="edit-overlay" onclick="editSection('experience')">✏️</div>
        <h2 class="section-title" onclick="toggleSection('experience')">
          Work Experience
          <div class="collapse-icon ${collapsedSections.experience ? 'collapsed' : ''}">▼</div>
        </h2>
        <div class="section-content ${collapsedSections.experience ? 'collapsed' : ''}">
          ${experience.map(exp => {
            // Check for enhanced content in customSections
            const companyName = exp.company || '';
            const experienceKey = `Experience - ${companyName}`;
            const enhancedContent = customSections?.[experienceKey];
            
            // If we have enhanced content, use it instead of basic content
            if (enhancedContent) {
              const hasEnhancedPlaceholders = hasPlaceholders(enhancedContent);
              return `
              <div class="experience-item enhanced-content">
                <div class="position">${exp.position || 'Position'}</div>
                <div class="company">${companyName || 'Company'}</div>
                <div class="duration">${exp.startDate || 'Start'} - ${exp.endDate || 'End'}</div>
                <div class="enhanced-description${hasEnhancedPlaceholders ? ' preview-content-with-placeholders' : ''}">${createPreviewContent(enhancedContent)}</div>
                ${hasEnhancedPlaceholders ? '<div class="placeholder-hint">💡 <em>Click on placeholders like [INSERT TEAM SIZE] to enter your real data</em></div>' : ''}
                <div class="improvement-badge">✨ Enhanced with AI</div>
              </div>
              `;
            }

            // Fall back to basic content if no enhanced version available
            const hasDescPlaceholders = exp.description && hasPlaceholders(exp.description);
            const hasAchievementPlaceholders = exp.achievements && exp.achievements.some((achievement: string) => hasPlaceholders(achievement));
            
            return `
            <div class="experience-item">
              <div class="position">${exp.position || 'Position'}</div>
              <div class="company">${companyName || 'Company'}</div>
              <div class="duration">${exp.startDate || 'Start'} - ${exp.endDate || 'End'}</div>
              ${exp.description ? `<div class="description${hasDescPlaceholders ? ' preview-content-with-placeholders' : ''}">${createPreviewContent(exp.description)}</div>` : ''}
              ${exp.achievements && exp.achievements.length > 0 ? `
                <ul class="achievements">
                  ${exp.achievements.map((achievement: string) => `<li${hasPlaceholders(achievement) ? ' class="preview-content-with-placeholders"' : ''}>${createPreviewContent(achievement)}</li>`).join('')}
                </ul>
              ` : ''}
              ${(hasDescPlaceholders || hasAchievementPlaceholders) ? '<div class="placeholder-hint">💡 <em>Click on placeholders to enter your real achievements and metrics</em></div>' : ''}
            </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  static generateEducationSection(education: CVEducationItem[], collapsedSections: Record<string, boolean>): string {
    return `
      <div class="section editable-section" data-section="education">
        <div class="edit-overlay" onclick="editSection('education')">✏️</div>
        <h2 class="section-title" onclick="toggleSection('education')">
          Education
          <div class="collapse-icon ${collapsedSections.education ? 'collapsed' : ''}">▼</div>
        </h2>
        <div class="section-content ${collapsedSections.education ? 'collapsed' : ''}">
          ${education.map(edu => {
            const degree = edu.degree || 'Degree';
            const field = edu.field && edu.field !== 'undefined' ? ` in ${edu.field}` : '';
            return `
            <div class="education-item">
              <div class="degree">${degree}${field}</div>
              <div class="institution">${edu.institution || 'Institution'}</div>
              <div class="duration">${edu.startDate || 'Start'} - ${edu.endDate || 'End'}</div>
            </div>
          `;
          }).join('')}
        </div>
      </div>
    `;
  }

  static generateSkillsSection(skills: CVSkillsData, collapsedSections: Record<string, boolean>): string {
    if (!skills) return '';
    
    return `
      <div class="section editable-section" data-section="skills">
        <div class="edit-overlay" onclick="editSection('skills')">✏️</div>
        <h2 class="section-title" onclick="toggleSection('skills')">
          Skills
          <div class="collapse-icon ${collapsedSections.skills ? 'collapsed' : ''}">▼</div>
        </h2>
        <div class="section-content ${collapsedSections.skills ? 'collapsed' : ''}">
          <div class="skills-section">
            ${Object.entries(skills).map(([category, skillList]) => `
              <div class="skill-category">
                <h4>${category}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${Array.isArray(skillList) ? skillList.map((skill: string) => `
                    <span style="background: #e2e8f0; color: #2d3748; padding: 6px 12px; border-radius: 16px; font-size: 14px; font-weight: 500;">${skill}</span>
                  `).join('') : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  static generateHeaderSection(personalInfo: CVPersonalInfo): string {
    return `
      <div class="header-section editable-section" data-section="personalInfo">
        <div class="edit-overlay" onclick="editSection('personalInfo')">✏️</div>
        <h1 class="name">${personalInfo?.name || 'Your Name'}</h1>
        <div class="contact-info">
          <span>${personalInfo?.email || 'email@example.com'}</span>
          <span>${personalInfo?.phone || '+1-234-567-8900'}</span>
          <span>${personalInfo?.location || 'City, Country'}</span>
        </div>
      </div>
    `;
  }

  static generateFeaturePreviews(
    selectedFeatures: Record<string, boolean>,
    collapsedSections: Record<string, boolean>,
    generateFeaturePreview: (featureId: string, isEnabled: boolean, isCollapsed: boolean) => string
  ): string {
    // Complete feature mapping from kebab-case to camelCase - sourced from FEATURE_CONFIGS
    const featureMapping: Record<string, string> = {
      // Core Enhancement Features
      'ats-optimization': 'atsOptimization',
      'keyword-enhancement': 'keywordEnhancement',
      'achievement-highlighting': 'achievementHighlighting',
      
      // Interactive Features
      'skills-visualization': 'skillsVisualization',
      'skills-chart': 'skillsChart',
      'interactive-timeline': 'interactiveTimeline',
      
      // Multimedia Features
      'generate-podcast': 'generatePodcast',
      'video-introduction': 'videoIntroduction',
      'portfolio-gallery': 'portfolioGallery',
      
      // Professional Features
      'certification-badges': 'certificationBadges',
      'language-proficiency': 'languageProficiency',
      'achievements-showcase': 'achievementsShowcase',
      
      // Contact & Integration Features
      'contact-form': 'contactForm',
      'social-media-links': 'socialMediaLinks',
      'availability-calendar': 'availabilityCalendar',
      'testimonials-carousel': 'testimonialsCarousel',
      
      // Technical Features
      'embed-qr-code': 'embedQRCode',
      'privacy-mode': 'privacyMode'
    };

    // All available features that support preview generation
    const features = Object.keys(featureMapping);

    console.warn('🔍 [FEATURE PREVIEW GENERATION] Processing features:', features);
    console.warn('🔍 [FEATURE PREVIEW GENERATION] Selected features:', selectedFeatures);

    return features
      .map(featureId => {
        const camelCaseKey = featureMapping[featureId];
        const isEnabled = selectedFeatures[camelCaseKey] || false;
        
        console.warn(`🔍 [FEATURE PREVIEW] Feature: ${featureId}, CamelCase: ${camelCaseKey}, Enabled: ${isEnabled}`);
        
        return generateFeaturePreview(
          featureId, 
          isEnabled, 
          collapsedSections[featureId]
        );
      })
      .join('');
  }
}