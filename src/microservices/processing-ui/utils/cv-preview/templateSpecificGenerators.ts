/**
 * Template-Specific Section Generators
 * Industry-optimized content generation with template-aware formatting
 * Supports interactive elements, ATS compatibility, and responsive design
 */

import type { QRCodeSettings } from '../../types/cv-preview';
import type {
  CVParsedData,
  CVPersonalInfo,
  CVExperienceItem,
  CVEducationItem,
  CVSkillsData
} from '../../types/cvData';
import type {
  CVTemplate,
  TemplateCategory,
  ExperienceLevel,
  FeatureSpecification
} from '../../types/cv-templates';
import { SectionGenerators } from './sectionGenerators';
import { createPreviewContent, hasPlaceholders } from '../placeholderReplacer';
import { 
  sanitizeHTML, 
  sanitizeText, 
  safeGet, 
  isValidString, 
  isValidArray 
} from '../security/contentSanitizer';

// ============================================================================
// TEMPLATE-SPECIFIC SECTION GENERATORS
// ============================================================================

export class TemplateSpecificGenerators {
  /**
   * Generate all sections for a specific template
   */
  static async generateAllSections(
    template: CVTemplate,
    previewData: CVParsedData,
    selectedFeatures: Record<string, boolean>,
    qrCodeSettings: QRCodeSettings,
    collapsedSections: Record<string, boolean>,
    generateFeaturePreview: (featureId: string, isEnabled: boolean, isCollapsed: boolean) => string
  ): Promise<Record<string, string>> {
    console.warn(`🏗️ [TEMPLATE GENERATORS] Generating sections for ${template.name}`);

    return {
      header: await this.generateTemplateHeader(template, previewData),
      summary: await this.generateTemplateSummary(template, previewData, collapsedSections),
      experience: await this.generateTemplateExperience(template, previewData, collapsedSections),
      education: await this.generateTemplateEducation(template, previewData, collapsedSections),
      skills: await this.generateTemplateSkills(template, previewData, collapsedSections),
      projects: await this.generateTemplateProjects(template, previewData, collapsedSections),
      certifications: await this.generateTemplateCertifications(template, previewData, collapsedSections),
      languages: await this.generateTemplateLanguages(template, previewData, collapsedSections),
      awards: await this.generateTemplateAwards(template, previewData, collapsedSections),
      customSections: await this.generateTemplateCustomSections(template, previewData, collapsedSections),
      qrCode: this.generateTemplateQRCode(template, qrCodeSettings, collapsedSections),
      featurePreviews: this.generateTemplateFeaturePreviews(
        template,
        selectedFeatures,
        collapsedSections,
        generateFeaturePreview
      )
    };
  }

  // ============================================================================
  // HEADER GENERATION
  // ============================================================================

  private static async generateTemplateHeader(
    template: CVTemplate,
    previewData: CVParsedData
  ): Promise<string> {
    const personalInfo: CVPersonalInfo = previewData?.personalInfo || {
      name: 'Your Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'Your Location'
    };

    const contactLayout = template.features.contact.layout;
    const showIcons = template.features.contact.showIcons;
    
    switch (template.category) {
      case 'executive':
        return this.generateExecutiveHeader(personalInfo, contactLayout, showIcons);
      case 'technical':
        return this.generateTechnicalHeader(personalInfo, contactLayout, showIcons);
      case 'creative':
        return this.generateCreativeHeader(personalInfo, contactLayout, showIcons);
      case 'healthcare':
        return this.generateHealthcareHeader(personalInfo, contactLayout, showIcons);
      case 'financial':
        return this.generateFinancialHeader(personalInfo, contactLayout, showIcons);
      case 'academic':
        return this.generateAcademicHeader(personalInfo, contactLayout, showIcons);
      case 'sales':
        return this.generateSalesHeader(personalInfo, contactLayout, showIcons);
      case 'international':
        return this.generateInternationalHeader(personalInfo, contactLayout, showIcons);
      default:
        return SectionGenerators.generateHeaderSection(personalInfo);
    }
  }

  private static generateExecutiveHeader(
    personalInfo: CVPersonalInfo,
    layout: 'horizontal' | 'vertical' | 'grid',
    showIcons: boolean
  ): string {
    const contactClasses = layout === 'vertical' ? 'flex-col gap-2' : 
                          layout === 'grid' ? 'grid grid-cols-2 gap-4' : 
                          'flex justify-center gap-6 flex-wrap';
                          
    return `
      <div class="template-header executive-header editable-section" data-section="personalInfo">
        <div class="edit-overlay" onclick="editSection('personalInfo')">✏️</div>
        
        <div class="header-content">
          <h1 class="name executive-name">${personalInfo?.name || 'Your Name'}</h1>
          
          <div class="executive-title">
            <span class="title-accent">Executive Leader</span> • <span class="title-secondary">Strategic Visionary</span>
          </div>
          
          <div class="contact-info executive-contact ${contactClasses}">
            ${this.generateContactItem('email', personalInfo?.email, showIcons)}
            ${this.generateContactItem('phone', personalInfo?.phone, showIcons)}
            ${this.generateContactItem('location', personalInfo?.location, showIcons)}
            ${personalInfo?.linkedin ? this.generateContactItem('linkedin', personalInfo.linkedin, showIcons) : ''}
          </div>
        </div>
        
        <div class="header-decoration">
          <div class="leadership-badge">EXECUTIVE LEADERSHIP</div>
        </div>
      </div>
    `;
  }

  private static generateTechnicalHeader(
    personalInfo: CVPersonalInfo,
    layout: 'horizontal' | 'vertical' | 'grid',
    showIcons: boolean
  ): string {
    const contactClasses = layout === 'vertical' ? 'flex-col gap-2' : 'flex justify-center gap-4 flex-wrap';
    
    return `
      <div class="template-header technical-header editable-section" data-section="personalInfo">
        <div class="edit-overlay" onclick="editSection('personalInfo')">✏️</div>
        
        <div class="header-grid">
          <div class="name-section">
            <h1 class="name technical-name">${personalInfo?.name || 'Your Name'}</h1>
            <div class="tech-specialization">
              <span class="tech-badge">Full-Stack Developer</span>
            </div>
          </div>
          
          <div class="contact-section">
            <div class="contact-info technical-contact ${contactClasses}">
              ${this.generateContactItem('email', personalInfo?.email, showIcons)}
              ${this.generateContactItem('phone', personalInfo?.phone, showIcons)}
              ${personalInfo?.github ? this.generateContactItem('github', personalInfo.github, showIcons) : ''}
              ${personalInfo?.portfolio ? this.generateContactItem('portfolio', personalInfo.portfolio, showIcons) : ''}
            </div>
          </div>
        </div>
        
        <div class="tech-stack-preview">
          <div class="stack-item">React</div>
          <div class="stack-item">TypeScript</div>
          <div class="stack-item">Node.js</div>
          <div class="stack-item">AWS</div>
        </div>
      </div>
    `;
  }

  private static generateCreativeHeader(
    personalInfo: CVPersonalInfo,
    layout: 'horizontal' | 'vertical' | 'grid',
    showIcons: boolean
  ): string {
    return `
      <div class="template-header creative-header editable-section" data-section="personalInfo">
        <div class="edit-overlay" onclick="editSection('personalInfo')">✏️</div>
        
        <div class="creative-layout">
          <div class="name-artistic">
            <h1 class="name creative-name">${personalInfo?.name || 'Your Name'}</h1>
            <div class="creative-tagline">Creative Visionary & Design Innovator</div>
          </div>
          
          <div class="contact-artistic">
            ${this.generateContactItem('email', personalInfo?.email, showIcons)}
            ${this.generateContactItem('phone', personalInfo?.phone, showIcons)}
            ${personalInfo?.portfolio ? this.generateContactItem('portfolio', personalInfo.portfolio, showIcons) : ''}
            ${personalInfo?.behance ? this.generateContactItem('behance', personalInfo.behance, showIcons) : ''}
            ${personalInfo?.dribbble ? this.generateContactItem('dribbble', personalInfo.dribbble, showIcons) : ''}
          </div>
        </div>
        
        <div class="creative-elements">
          <div class="color-palette">
            <div class="color-swatch" style="background: var(--template-primary);"></div>
            <div class="color-swatch" style="background: var(--template-secondary);"></div>
            <div class="color-swatch" style="background: var(--template-info);"></div>
          </div>
        </div>
      </div>
    `;
  }

  private static generateHealthcareHeader(
    personalInfo: CVPersonalInfo,
    layout: 'horizontal' | 'vertical' | 'grid',
    showIcons: boolean
  ): string {
    const contactClasses = layout === 'vertical' ? 'flex-col gap-2' : 'flex justify-center gap-6 flex-wrap';
    
    return `
      <div class="template-header healthcare-header editable-section" data-section="personalInfo">
        <div class="edit-overlay" onclick="editSection('personalInfo')">✏️</div>
        
        <div class="healthcare-layout">
          <div class="credentials-section">
            <h1 class="name healthcare-name">${personalInfo?.name || 'Your Name'}</h1>
            <div class="medical-credentials">
              <span class="credential-badge">MD</span>
              <span class="credential-badge">Board Certified</span>
            </div>
            <div class="specialty">Internal Medicine Specialist</div>
          </div>
          
          <div class="contact-professional ${contactClasses}">
            ${this.generateContactItem('email', personalInfo?.email, showIcons)}
            ${this.generateContactItem('phone', personalInfo?.phone, showIcons)}
            ${this.generateContactItem('location', personalInfo?.location, showIcons)}
            ${personalInfo?.linkedin ? this.generateContactItem('linkedin', personalInfo.linkedin, showIcons) : ''}
          </div>
        </div>
      </div>
    `;
  }

  private static generateFinancialHeader(
    personalInfo: CVPersonalInfo,
    layout: 'horizontal' | 'vertical' | 'grid',
    showIcons: boolean
  ): string {
    const contactClasses = layout === 'vertical' ? 'flex-col gap-2' : 'flex justify-center gap-6 flex-wrap';
    
    return `
      <div class="template-header financial-header editable-section" data-section="personalInfo">
        <div class="edit-overlay" onclick="editSection('personalInfo')">✏️</div>
        
        <div class="financial-layout">
          <h1 class="name financial-name">${personalInfo?.name || 'Your Name'}</h1>
          
          <div class="financial-credentials">
            <span class="cert-badge">CFA</span>
            <span class="cert-badge">CPA</span>
            <span class="experience-years">15+ Years Experience</span>
          </div>
          
          <div class="specialization">Investment Portfolio Management & Financial Strategy</div>
          
          <div class="contact-info financial-contact ${contactClasses}">
            ${this.generateContactItem('email', personalInfo?.email, showIcons)}
            ${this.generateContactItem('phone', personalInfo?.phone, showIcons)}
            ${this.generateContactItem('location', personalInfo?.location, showIcons)}
          </div>
        </div>
      </div>
    `;
  }

  private static generateAcademicHeader(
    personalInfo: CVPersonalInfo,
    layout: 'horizontal' | 'vertical' | 'grid',
    showIcons: boolean
  ): string {
    const contactClasses = layout === 'vertical' ? 'flex-col gap-2' : 'flex justify-center gap-6 flex-wrap';
    
    return `
      <div class="template-header academic-header editable-section" data-section="personalInfo">
        <div class="edit-overlay" onclick="editSection('personalInfo')">✏️</div>
        
        <div class="academic-layout">
          <h1 class="name academic-name">${personalInfo?.name || 'Your Name'}</h1>
          
          <div class="academic-title">
            <span class="position">Professor of Computer Science</span>
            <span class="institution">• MIT</span>
          </div>
          
          <div class="academic-credentials">
            <span class="degree-badge">PhD</span>
            <span class="research-focus">AI & Machine Learning Research</span>
          </div>
          
          <div class="contact-info academic-contact ${contactClasses}">
            ${this.generateContactItem('email', personalInfo?.email, showIcons)}
            ${this.generateContactItem('phone', personalInfo?.phone, showIcons)}
            ${personalInfo?.orcid ? this.generateContactItem('orcid', personalInfo.orcid, showIcons) : ''}
            ${personalInfo?.googleScholar ? this.generateContactItem('scholar', personalInfo.googleScholar, showIcons) : ''}
          </div>
        </div>
      </div>
    `;
  }

  private static generateSalesHeader(
    personalInfo: CVPersonalInfo,
    layout: 'horizontal' | 'vertical' | 'grid',
    showIcons: boolean
  ): string {
    const contactClasses = layout === 'vertical' ? 'flex-col gap-2' : 'flex justify-center gap-6 flex-wrap';
    
    return `
      <div class="template-header sales-header editable-section" data-section="personalInfo">
        <div class="edit-overlay" onclick="editSection('personalInfo')">✏️</div>
        
        <div class="sales-layout">
          <h1 class="name sales-name">${personalInfo?.name || 'Your Name'}</h1>
          
          <div class="sales-metrics">
            <div class="metric">
              <span class="metric-value">$15M+</span>
              <span class="metric-label">Annual Revenue</span>
            </div>
            <div class="metric">
              <span class="metric-value">145%</span>
              <span class="metric-label">Quota Achievement</span>
            </div>
            <div class="metric">
              <span class="metric-value">Top 5%</span>
              <span class="metric-label">National Ranking</span>
            </div>
          </div>
          
          <div class="contact-info sales-contact ${contactClasses}">
            ${this.generateContactItem('email', personalInfo?.email, showIcons)}
            ${this.generateContactItem('phone', personalInfo?.phone, showIcons)}
            ${this.generateContactItem('location', personalInfo?.location, showIcons)}
            ${personalInfo?.linkedin ? this.generateContactItem('linkedin', personalInfo.linkedin, showIcons) : ''}
          </div>
        </div>
      </div>
    `;
  }

  private static generateInternationalHeader(
    personalInfo: CVPersonalInfo,
    layout: 'horizontal' | 'vertical' | 'grid',
    showIcons: boolean
  ): string {
    const contactClasses = layout === 'vertical' ? 'flex-col gap-2' : 'flex justify-center gap-6 flex-wrap';
    
    return `
      <div class="template-header international-header editable-section" data-section="personalInfo">
        <div class="edit-overlay" onclick="editSection('personalInfo')">✏️</div>
        
        <div class="international-layout">
          <h1 class="name international-name">${personalInfo?.name || 'Your Name'}</h1>
          
          <div class="global-expertise">
            <span class="region">🌍 Global Operations</span>
            <span class="languages">5 Languages</span>
            <span class="countries">20+ Countries</span>
          </div>
          
          <div class="specialization">International Business Development & Cross-Cultural Management</div>
          
          <div class="contact-info international-contact ${contactClasses}">
            ${this.generateContactItem('email', personalInfo?.email, showIcons)}
            ${this.generateContactItem('phone', personalInfo?.phone, showIcons)}
            ${this.generateContactItem('location', personalInfo?.location, showIcons)}
            ${personalInfo?.linkedin ? this.generateContactItem('linkedin', personalInfo.linkedin, showIcons) : ''}
          </div>
        </div>
      </div>
    `;
  }

  private static generateContactItem(
    type: string,
    value?: string,
    showIcons = true
  ): string {
    if (!value) return '';
    
    const icons: Record<string, string> = {
      email: '📧',
      phone: '📱',
      location: '📍',
      linkedin: '💼',
      github: '💻',
      portfolio: '🌐',
      behance: '🎨',
      dribbble: '🏀',
      orcid: '🔬',
      scholar: '🎓'
    };
    
    const icon = showIcons && icons[type] ? icons[type] + ' ' : '';
    const isLink = ['linkedin', 'github', 'portfolio', 'behance', 'dribbble', 'orcid', 'scholar'].includes(type);
    
    if (isLink) {
      const href = value.startsWith('http') ? value : `https://${value}`;
      return `<a href="${href}" class="contact-link ${type}-link" target="_blank">${icon}${value}</a>`;
    }
    
    return `<span class="contact-item ${type}-item">${icon}${value}</span>`;
  }

  // ============================================================================
  // SUMMARY GENERATION
  // ============================================================================

  private static async generateTemplateSummary(
    template: CVTemplate,
    previewData: CVParsedData,
    collapsedSections: Record<string, boolean>
  ): Promise<string> {
    const summary = previewData?.summary || '';
    const isCollapsed = collapsedSections.summary;
    
    // Use the original section generator with template-specific enhancements
    const baseSummary = SectionGenerators.generateSummarySection(
      summary, 
      collapsedSections,
      previewData?.customSections as Record<string, string>
    );
    
    // Add template-specific enhancements
    const templateEnhancements = this.getSummaryEnhancementsForTemplate(template, summary);
    
    return baseSummary.replace(
      '<div class="section-content',
      `${templateEnhancements}<div class="section-content`
    );
  }

  private static getSummaryEnhancementsForTemplate(
    template: CVTemplate,
    summary: string
  ): string {
    switch (template.category) {
      case 'executive':
        return '<div class="executive-summary-metrics">20+ Years Leadership • $2B+ Revenue Impact • Global Operations</div>';
      case 'technical':
        return '<div class="tech-summary-stack">Full-Stack • Cloud Native • DevOps • AI/ML</div>';
      case 'creative':
        return '<div class="creative-summary-awards">🏆 Cannes Lions Winner • 🎨 Brand Innovation Leader</div>';
      case 'sales':
        return '<div class="sales-summary-achievements">📈 Top 1% Performer • 🎯 145% Quota Achievement • 🏆 President\'s Club</div>';
      default:
        return '';
    }
  }

  // ============================================================================
  // EXPERIENCE GENERATION
  // ============================================================================

  private static async generateTemplateExperience(
    template: CVTemplate,
    previewData: CVParsedData,
    collapsedSections: Record<string, boolean>
  ): Promise<string> {
    const experience = previewData?.experience || [];
    const layout = template.features.experience.layout;
    
    switch (layout) {
      case 'timeline':
        return this.generateTimelineExperience(template, experience, collapsedSections);
      case 'cards':
        return this.generateCardExperience(template, experience, collapsedSections);
      case 'list':
        return this.generateListExperience(template, experience, collapsedSections);
      default:
        // Fall back to standard generation
        return SectionGenerators.generateExperienceSection(
          experience,
          collapsedSections,
          previewData?.customSections as Record<string, string>
        );
    }
  }

  private static generateTimelineExperience(
    template: CVTemplate,
    experience: CVExperienceItem[],
    collapsedSections: Record<string, boolean>
  ): string {
    const isCollapsed = collapsedSections.experience;
    
    return `
      <div class="section editable-section timeline-experience" data-section="experience">
        <div class="edit-overlay" onclick="editSection('experience')">✏️</div>
        <h2 class="section-title" onclick="toggleSection('experience')">
          Work Experience
          <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
        </h2>
        <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
          <div class="timeline-container">
            ${experience.map((exp, index) => this.generateTimelineItem(template, exp, index)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private static generateTimelineItem(
    template: CVTemplate,
    exp: CVExperienceItem,
    index: number
  ): string {
    const showTechnologies = template.features.experience.showTechnologies;
    const showAchievements = template.features.experience.showAchievements;
    
    return `
      <div class="timeline-item" data-index="${index}">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="position timeline-position">${sanitizeHTML(safeGet(exp, 'position', 'Position', isValidString))}</div>
          <div class="company timeline-company">${sanitizeHTML(safeGet(exp, 'company', 'Company', isValidString))}</div>
          <div class="duration timeline-duration">${sanitizeHTML(safeGet(exp, 'startDate', 'Start', isValidString))} - ${sanitizeHTML(safeGet(exp, 'endDate', 'End', isValidString))}</div>
          
          ${exp.description ? `<div class="description timeline-description">${createPreviewContent(exp.description)}</div>` : ''}
          
          ${showTechnologies && exp.technologies && isValidArray(exp.technologies) ? `
            <div class="technologies-used">
              ${exp.technologies.map((tech: string) => `<span class="tech-tag">${sanitizeHTML(tech)}</span>`).join('')}
            </div>
          ` : ''}
          
          ${showAchievements && exp.achievements && isValidArray(exp.achievements) ? `
            <ul class="achievements timeline-achievements">
              ${exp.achievements.map((achievement: string) => `<li>${createPreviewContent(achievement)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    `;
  }

  private static generateCardExperience(
    template: CVTemplate,
    experience: CVExperienceItem[],
    collapsedSections: Record<string, boolean>
  ): string {
    const isCollapsed = collapsedSections.experience;
    
    return `
      <div class="section editable-section card-experience" data-section="experience">
        <div class="edit-overlay" onclick="editSection('experience')">✏️</div>
        <h2 class="section-title" onclick="toggleSection('experience')">
          Work Experience
          <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
        </h2>
        <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
          <div class="experience-cards-grid">
            ${experience.map((exp, index) => this.generateExperienceCard(template, exp, index)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private static generateExperienceCard(
    template: CVTemplate,
    exp: CVExperienceItem,
    index: number
  ): string {
    const showLocation = template.features.experience.showLocation;
    const showTechnologies = template.features.experience.showTechnologies;
    
    return `
      <div class="experience-card card hover-lift" data-index="${index}">
        <div class="card-header">
          <div class="position card-position">${sanitizeHTML(safeGet(exp, 'position', 'Position', isValidString))}</div>
          <div class="company card-company">${sanitizeHTML(safeGet(exp, 'company', 'Company', isValidString))}</div>
          <div class="duration card-duration">${sanitizeHTML(safeGet(exp, 'startDate', 'Start', isValidString))} - ${sanitizeHTML(safeGet(exp, 'endDate', 'End', isValidString))}</div>
          ${showLocation && exp.location ? `<div class="location card-location">📍 ${sanitizeHTML(exp.location)}</div>` : ''}
        </div>
        
        <div class="card-content">
          ${exp.description ? `<p class="description card-description">${createPreviewContent(exp.description)}</p>` : ''}
          
          ${showTechnologies && exp.technologies && isValidArray(exp.technologies) ? `
            <div class="technologies-section">
              <h4>Technologies:</h4>
              <div class="tech-tags">
                ${exp.technologies.map((tech: string) => `<span class="tech-tag">${sanitizeHTML(tech)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          
          ${exp.achievements && isValidArray(exp.achievements) ? `
            <div class="achievements-section">
              <h4>Key Achievements:</h4>
              <ul class="achievements card-achievements">
                ${exp.achievements.map((achievement: string) => `<li>${createPreviewContent(achievement)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private static generateListExperience(
    template: CVTemplate,
    experience: CVExperienceItem[],
    collapsedSections: Record<string, boolean>
  ): string {
    const isCollapsed = collapsedSections.experience;
    const sortOrder = template.features.experience.sortOrder;
    
    // Sort experience based on template preferences
    const sortedExperience = sortOrder === 'chronological' ? 
      [...experience].reverse() : experience;
    
    return `
      <div class="section editable-section list-experience" data-section="experience">
        <div class="edit-overlay" onclick="editSection('experience')">✏️</div>
        <h2 class="section-title" onclick="toggleSection('experience')">
          Work Experience
          <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
        </h2>
        <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
          <div class="experience-list">
            ${sortedExperience.map((exp, index) => this.generateExperienceListItem(template, exp, index)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private static generateExperienceListItem(
    template: CVTemplate,
    exp: CVExperienceItem,
    index: number
  ): string {
    const dateFormat = template.features.experience.dateFormat;
    const formattedDuration = this.formatDuration(exp.startDate, exp.endDate, dateFormat);
    
    return `
      <div class="experience-list-item" data-index="${index}">
        <div class="exp-header">
          <div class="exp-title">
            <span class="position list-position">${sanitizeHTML(safeGet(exp, 'position', 'Position', isValidString))}</span>
            <span class="separator">@</span>
            <span class="company list-company">${sanitizeHTML(safeGet(exp, 'company', 'Company', isValidString))}</span>
          </div>
          <div class="duration list-duration">${sanitizeHTML(formattedDuration)}</div>
        </div>
        
        ${exp.description ? `<div class="description list-description">${createPreviewContent(exp.description)}</div>` : ''}
        
        ${exp.achievements && isValidArray(exp.achievements) ? `
          <ul class="achievements list-achievements">
            ${exp.achievements.map((achievement: string) => `<li>${createPreviewContent(achievement)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `;
  }

  private static formatDuration(
    startDate?: string,
    endDate?: string,
    format: 'full' | 'short' | 'year-only' = 'full'
  ): string {
    if (!startDate) return 'Duration not specified';
    
    const start = startDate || 'Start';
    const end = endDate || 'Present';
    
    switch (format) {
      case 'year-only': {
        const startYear = start.split('-')[0] || start.split('/')[2] || start.substring(0, 4);
        const endYear = end === 'Present' ? 'Present' : (end.split('-')[0] || end.split('/')[2] || end.substring(0, 4));
        return `${startYear} - ${endYear}`;
      }
      case 'short':
        return `${start.substring(0, 7)} - ${end.substring(0, 7)}`;
      default:
        return `${start} - ${end}`;
    }
  }

  // ============================================================================
  // SKILLS GENERATION
  // ============================================================================

  private static async generateTemplateSkills(
    template: CVTemplate,
    previewData: CVParsedData,
    collapsedSections: Record<string, boolean>
  ): Promise<string> {
    const skills = previewData?.skills;
    if (!skills) return '';
    
    const skillsType = template.features.skills.type;
    const showLevels = template.features.skills.showLevels;
    const groupByCategory = template.features.skills.groupByCategory;
    const maxItems = template.features.skills.maxItems;
    
    switch (skillsType) {
      case 'bars':
        return this.generateSkillBars(template, skills, collapsedSections, showLevels, maxItems);
      case 'circles':
        return this.generateSkillCircles(template, skills, collapsedSections, showLevels, maxItems);
      case 'tags':
        return this.generateSkillTags(template, skills, collapsedSections, groupByCategory, maxItems);
      case 'radar':
        return this.generateSkillRadar(template, skills, collapsedSections, maxItems);
      case 'icons':
        return this.generateSkillIcons(template, skills, collapsedSections, maxItems);
      default:
        return SectionGenerators.generateSkillsSection(skills, collapsedSections);
    }
  }

  private static generateSkillBars(
    template: CVTemplate,
    skills: CVSkillsData,
    collapsedSections: Record<string, boolean>,
    showLevels: boolean,
    maxItems: number
  ): string {
    const isCollapsed = collapsedSections.skills;
    
    return `
      <div class="section editable-section skills-bars" data-section="skills">
        <div class="edit-overlay" onclick="editSection('skills')">✏️</div>
        <h2 class="section-title" onclick="toggleSection('skills')">
          Skills & Expertise
          <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
        </h2>
        <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
          <div class="skills-bars-container">
            ${this.generateSkillCategories(skills, (category, skillList) => 
              this.generateSkillBarsForCategory(category, skillList, showLevels, maxItems)
            ).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private static generateSkillBarsForCategory(
    category: string,
    skillList: string[],
    showLevels: boolean,
    maxItems: number
  ): string {
    const limitedSkills = skillList.slice(0, maxItems);
    
    return `
      <div class="skill-category bars-category">
        <h4 class="category-title">${category}</h4>
        <div class="skill-bars-list">
          ${limitedSkills.map((skill, index) => {
            const level = showLevels ? this.getSkillLevel(skill, index) : 100;
            return `
              <div class="skill-bar-item">
                <div class="skill-info">
                  <span class="skill-name">${skill}</span>
                  ${showLevels ? `<span class="skill-level">${level}%</span>` : ''}
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${level}%; animation-delay: ${index * 0.1}s;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  private static generateSkillTags(
    template: CVTemplate,
    skills: CVSkillsData,
    collapsedSections: Record<string, boolean>,
    groupByCategory: boolean,
    maxItems: number
  ): string {
    const isCollapsed = collapsedSections.skills;
    
    return `
      <div class="section editable-section skills-tags" data-section="skills">
        <div class="edit-overlay" onclick="editSection('skills')">✏️</div>
        <h2 class="section-title" onclick="toggleSection('skills')">
          Technical Skills
          <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
        </h2>
        <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
          ${groupByCategory ? 
            this.generateCategorizedSkillTags(skills, maxItems) :
            this.generateUnifiedSkillTags(skills, maxItems)
          }
        </div>
      </div>
    `;
  }

  private static generateCategorizedSkillTags(
    skills: CVSkillsData,
    maxItems: number
  ): string {
    return `
      <div class="skills-tags-categorized">
        ${this.generateSkillCategories(skills, (category, skillList) => {
          const limitedSkills = skillList.slice(0, maxItems);
          return `
            <div class="skill-category tags-category">
              <h4 class="category-title">${category}</h4>
              <div class="skill-tags-list">
                ${limitedSkills.map((skill, index) => `
                  <span class="skill-tag" style="animation-delay: ${index * 0.05}s;">${skill}</span>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private static generateUnifiedSkillTags(
    skills: CVSkillsData,
    maxItems: number
  ): string {
    // Flatten all skills into one list
    const allSkills = Object.values(skills).flat().slice(0, maxItems);
    
    return `
      <div class="skills-tags-unified">
        <div class="skill-tags-cloud">
          ${allSkills.map((skill, index) => `
            <span class="skill-tag unified-tag" style="animation-delay: ${index * 0.03}s;">${skill}</span>
          `).join('')}
        </div>
      </div>
    `;
  }

  private static generateSkillCircles(
    template: CVTemplate,
    skills: CVSkillsData,
    collapsedSections: Record<string, boolean>,
    showLevels: boolean,
    maxItems: number
  ): string {
    const isCollapsed = collapsedSections.skills;
    
    return `
      <div class="section editable-section skills-circles" data-section="skills">
        <div class="edit-overlay" onclick="editSection('skills')">✏️</div>
        <h2 class="section-title" onclick="toggleSection('skills')">
          Core Competencies
          <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
        </h2>
        <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
          <div class="skills-circles-container">
            ${this.generateSkillCategories(skills, (category, skillList) => 
              this.generateSkillCirclesForCategory(category, skillList, showLevels, maxItems)
            ).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private static generateSkillCirclesForCategory(
    category: string,
    skillList: string[],
    showLevels: boolean,
    maxItems: number
  ): string {
    const limitedSkills = skillList.slice(0, maxItems);
    
    return `
      <div class="skill-category circles-category">
        <h4 class="category-title">${category}</h4>
        <div class="skill-circles-list">
          ${limitedSkills.map((skill, index) => {
            const level = showLevels ? this.getSkillLevel(skill, index) : 90;
            const circumference = 2 * Math.PI * 45; // radius = 45
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (level / 100) * circumference;
            
            return `
              <div class="skill-circle-item" style="animation-delay: ${index * 0.1}s;">
                <div class="circle-wrapper">
                  <svg class="progress-circle" width="100" height="100">
                    <circle
                      class="circle-background"
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="var(--template-border)"
                      stroke-width="4"
                      fill="transparent"
                    />
                    <circle
                      class="circle-progress"
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="var(--template-primary)"
                      stroke-width="4"
                      fill="transparent"
                      stroke-dasharray="${strokeDasharray}"
                      stroke-dashoffset="${strokeDashoffset}"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div class="circle-content">
                    ${showLevels ? `<span class="level">${level}%</span>` : ''}
                  </div>
                </div>
                <div class="skill-name">${skill}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private static generateSkillCategories(
    skills: CVSkillsData,
    generator: (category: string, skillList: string[]) => string
  ): string[] {
    return Object.entries(skills)
      .filter(([_, skillList]) => Array.isArray(skillList))
      .map(([category, skillList]) => generator(category, skillList as string[]));
  }

  private static getSkillLevel(skill: string, index: number): number {
    // SECURITY FIX: Safe skill level calculation with validation
    if (!skill || typeof skill !== 'string') {
      return 75; // Safe default
    }
    
    try {
      // Generate consistent skill levels based on skill name and position
      const sanitizedSkill = sanitizeText(skill, 100);
      const hash = sanitizedSkill.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      // Generate level between 70-95% to look realistic
      const level = 70 + Math.abs(hash + (typeof index === 'number' ? index : 0) * 7) % 26;
      
      // Ensure result is within valid range
      return Math.min(95, Math.max(70, level));
    } catch (error) {
      console.warn('Skill level calculation error:', error);
      return 75; // Safe fallback
    }
  }

  // ============================================================================
  // PLACEHOLDER METHODS FOR OTHER SECTIONS
  // ============================================================================

  private static async generateTemplateEducation(
    template: CVTemplate,
    previewData: CVParsedData,
    collapsedSections: Record<string, boolean>
  ): Promise<string> {
    return SectionGenerators.generateEducationSection(
      previewData?.education || [],
      collapsedSections
    );
  }

  private static async generateTemplateProjects(
    template: CVTemplate,
    previewData: CVParsedData,
    collapsedSections: Record<string, boolean>
  ): Promise<string> {
    // TODO: Implement template-specific project generation
    return '';
  }

  private static async generateTemplateCertifications(
    template: CVTemplate,
    previewData: CVParsedData,
    collapsedSections: Record<string, boolean>
  ): Promise<string> {
    // TODO: Implement template-specific certifications generation
    return '';
  }

  private static async generateTemplateLanguages(
    template: CVTemplate,
    previewData: CVParsedData,
    collapsedSections: Record<string, boolean>
  ): Promise<string> {
    // TODO: Implement template-specific languages generation
    return '';
  }

  private static async generateTemplateAwards(
    template: CVTemplate,
    previewData: CVParsedData,
    collapsedSections: Record<string, boolean>
  ): Promise<string> {
    // TODO: Implement template-specific awards generation
    return '';
  }

  private static async generateTemplateCustomSections(
    template: CVTemplate,
    previewData: CVParsedData,
    collapsedSections: Record<string, boolean>
  ): Promise<string> {
    // TODO: Implement template-specific custom sections generation
    return '';
  }

  private static generateTemplateQRCode(
    template: CVTemplate,
    qrCodeSettings: QRCodeSettings,
    collapsedSections: Record<string, boolean>
  ): string {
    return SectionGenerators.generateQRCodeSection(qrCodeSettings, collapsedSections);
  }

  private static generateTemplateFeaturePreviews(
    template: CVTemplate,
    selectedFeatures: Record<string, boolean>,
    collapsedSections: Record<string, boolean>,
    generateFeaturePreview: (featureId: string, isEnabled: boolean, isCollapsed: boolean) => string
  ): string {
    return SectionGenerators.generateFeaturePreviews(
      selectedFeatures,
      collapsedSections,
      generateFeaturePreview
    );
  }
}

console.warn('🏗️ Template-Specific Generators loaded');
