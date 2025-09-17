/**
 * Template Layout Generator
 * Generates layout-specific CSS styles for templates
 */

import type { CVTemplate } from '../../types/cv-templates';

export class TemplateLayoutGenerator {
  /**
   * Generate layout styles for template
   */
  static async generate(template: CVTemplate): Promise<string> {
    const layoutStyles = [
      this.generateSectionLayout(template),
      this.generateHeaderLayout(template),
      this.generateContentLayout(template),
      this.generateSidebarLayout(template),
      this.generateFooterLayout(template),
      this.generateCategorySpecificLayout(template)
    ];

    return layoutStyles.join('\n\n');
  }

  /**
   * Generate section layout styles
   */
  private static generateSectionLayout(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Section Layout */
      .template-${template.id} .cv-section {
        margin-bottom: ${spacing.xl};
        padding: ${spacing.md};
        background: var(--surface-color);
        border-radius: 8px;
        border: 1px solid var(--border-color);
        position: relative;
        transition: all 0.3s ease;
      }
      
      .template-${template.id} .cv-section:last-child {
        margin-bottom: 0;
      }
      
      .template-${template.id} .cv-section.highlight {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .template-${template.id} .cv-section-title {
        margin-bottom: ${spacing.md};
        padding-bottom: ${spacing.sm};
        border-bottom: 2px solid var(--primary-color);
        font-family: var(--font-primary);
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--primary-color);
        position: relative;
      }
      
      .template-${template.id} .cv-section-title::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 50px;
        height: 2px;
        background: var(--accent-color);
      }
      
      .template-${template.id} .cv-section-content {
        position: relative;
      }
    `;
  }

  /**
   * Generate header layout styles
   */
  private static generateHeaderLayout(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Header Layout */
      .template-${template.id} .cv-header {
        margin-bottom: ${spacing.xl};
        padding: ${spacing.lg};
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border-radius: 12px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      
      .template-${template.id} .cv-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
        pointer-events: none;
      }
      
      .template-${template.id} .cv-header .cv-name {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: ${spacing.sm};
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        position: relative;
        z-index: 1;
      }
      
      .template-${template.id} .cv-header .cv-title {
        font-size: 1.25rem;
        font-weight: 400;
        margin-bottom: ${spacing.md};
        opacity: 0.9;
        position: relative;
        z-index: 1;
      }
      
      .template-${template.id} .cv-header .cv-contact {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: ${spacing.md};
        position: relative;
        z-index: 1;
      }
      
      .template-${template.id} .cv-header .cv-contact-item {
        display: flex;
        align-items: center;
        gap: ${spacing.xs};
        padding: ${spacing.xs} ${spacing.sm};
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        font-size: 0.9rem;
        transition: background 0.3s ease;
      }
      
      .template-${template.id} .cv-header .cv-contact-item:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .template-${template.id} .cv-header .cv-contact-icon {
        width: 16px;
        height: 16px;
        opacity: 0.8;
      }
    `;
  }

  /**
   * Generate content layout styles
   */
  private static generateContentLayout(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Content Layout */
      .template-${template.id} .cv-main {
        display: grid;
        grid-template-columns: 1fr;
        gap: ${spacing.lg};
      }
      
      .template-${template.id} .cv-content {
        display: flex;
        flex-direction: column;
        gap: ${spacing.lg};
      }
      
      .template-${template.id} .cv-experience,
      .template-${template.id} .cv-education {
        display: flex;
        flex-direction: column;
        gap: ${spacing.md};
      }
      
      .template-${template.id} .cv-experience-item,
      .template-${template.id} .cv-education-item {
        padding: ${spacing.md};
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        border-left: 4px solid var(--primary-color);
        transition: all 0.3s ease;
        position: relative;
      }
      
      .template-${template.id} .cv-experience-item:hover,
      .template-${template.id} .cv-education-item:hover {
        border-left-color: var(--accent-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      
      .template-${template.id} .cv-item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: ${spacing.sm};
        flex-wrap: wrap;
        gap: ${spacing.xs};
      }
      
      .template-${template.id} .cv-item-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }
      
      .template-${template.id} .cv-item-subtitle {
        font-size: 1rem;
        color: var(--primary-color);
        font-weight: 500;
        margin: 0;
      }
      
      .template-${template.id} .cv-item-date {
        font-size: 0.9rem;
        color: var(--text-secondary);
        background: var(--background-color);
        padding: ${spacing.xs} ${spacing.sm};
        border-radius: 12px;
        border: 1px solid var(--border-color);
        white-space: nowrap;
      }
      
      .template-${template.id} .cv-item-location {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-top: ${spacing.xs};
      }
      
      .template-${template.id} .cv-item-description {
        color: var(--text-primary);
        line-height: 1.6;
        margin-top: ${spacing.sm};
      }
      
      .template-${template.id} .cv-item-description ul {
        margin-top: ${spacing.xs};
        padding-left: ${spacing.md};
      }
      
      .template-${template.id} .cv-item-description li {
        list-style: disc;
        margin-bottom: ${spacing.xs};
        line-height: 1.5;
      }
      
      .template-${template.id} .cv-item-description li:last-child {
        margin-bottom: 0;
      }
    `;
  }

  /**
   * Generate sidebar layout styles
   */
  private static generateSidebarLayout(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Sidebar Layout */
      .template-${template.id} .cv-sidebar {
        display: flex;
        flex-direction: column;
        gap: ${spacing.lg};
      }
      
      .template-${template.id} .cv-skills,
      .template-${template.id} .cv-languages,
      .template-${template.id} .cv-certifications {
        background: var(--surface-color);
        padding: ${spacing.md};
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }
      
      .template-${template.id} .cv-skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: ${spacing.xs};
        margin-top: ${spacing.sm};
      }
      
      .template-${template.id} .cv-skill-item {
        background: var(--primary-color);
        color: white;
        padding: ${spacing.xs} ${spacing.sm};
        border-radius: 16px;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .template-${template.id} .cv-skill-item:hover {
        background: var(--accent-color);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .template-${template.id} .cv-skill-item.skill-advanced {
        background: var(--accent-color);
      }
      
      .template-${template.id} .cv-skill-item.skill-intermediate {
        background: var(--secondary-color);
      }
      
      .template-${template.id} .cv-skill-item.skill-beginner {
        background: var(--text-secondary);
      }
      
      .template-${template.id} .cv-languages-list,
      .template-${template.id} .cv-certifications-list {
        margin-top: ${spacing.sm};
        display: flex;
        flex-direction: column;
        gap: ${spacing.sm};
      }
      
      .template-${template.id} .cv-language-item,
      .template-${template.id} .cv-certification-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${spacing.sm};
        background: var(--background-color);
        border-radius: 6px;
        border: 1px solid var(--border-color);
      }
      
      .template-${template.id} .cv-language-level,
      .template-${template.id} .cv-certification-date {
        font-size: 0.85rem;
        color: var(--text-secondary);
        background: var(--surface-color);
        padding: 2px 8px;
        border-radius: 10px;
      }
    `;
  }

  /**
   * Generate footer layout styles
   */
  private static generateFooterLayout(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Footer Layout */
      .template-${template.id} .cv-footer {
        margin-top: ${spacing.xl};
        padding: ${spacing.lg};
        background: var(--surface-color);
        border-top: 1px solid var(--border-color);
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
      
      .template-${template.id} .cv-footer .cv-references {
        margin-bottom: ${spacing.md};
      }
      
      .template-${template.id} .cv-footer .cv-generated {
        opacity: 0.7;
        font-size: 0.8rem;
      }
    `;
  }

  /**
   * Generate category-specific layout styles
   */
  private static generateCategorySpecificLayout(template: CVTemplate): string {
    switch (template.category) {
      case 'executive':
        return this.generateExecutiveLayout(template);
      case 'technical':
        return this.generateTechnicalLayout(template);
      case 'creative':
        return this.generateCreativeLayout(template);
      case 'healthcare':
        return this.generateHealthcareLayout(template);
      default:
        return this.generateProfessionalLayout(template);
    }
  }

  /**
   * Generate executive layout styles
   */
  private static generateExecutiveLayout(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Executive Layout */
      .template-${template.id}.category-executive .cv-main {
        grid-template-columns: 2fr 1fr;
        gap: ${spacing.xl};
      }
      
      .template-${template.id}.category-executive .cv-header {
        background: linear-gradient(135deg, #1a365d, #2d3748);
        padding: ${spacing.xl};
      }
      
      .template-${template.id}.category-executive .cv-section {
        border-left: 4px solid var(--primary-color);
        border-radius: 0 8px 8px 0;
      }
      
      .template-${template.id}.category-executive .cv-experience-item {
        border-left-width: 6px;
        padding: ${spacing.lg};
      }
      
      .template-${template.id}.category-executive .cv-achievements {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        padding: ${spacing.lg};
        border-radius: 12px;
        margin: ${spacing.md} 0;
      }
      
      .template-${template.id}.category-executive .cv-achievements ul {
        list-style: none;
        padding: 0;
      }
      
      .template-${template.id}.category-executive .cv-achievements li::before {
        content: '▶';
        color: var(--accent-color);
        margin-right: ${spacing.xs};
      }
    `;
  }

  /**
   * Generate technical layout styles
   */
  private static generateTechnicalLayout(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Technical Layout */
      .template-${template.id}.category-technical .cv-main {
        grid-template-columns: 1fr 300px;
        gap: ${spacing.xl};
      }
      
      .template-${template.id}.category-technical .cv-header {
        background: linear-gradient(135deg, #2d3748, #4a5568);
        border-radius: 0;
        text-align: left;
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
      }
      
      .template-${template.id}.category-technical .cv-technical-stack {
        background: var(--surface-color);
        padding: ${spacing.md};
        border: 1px solid var(--border-color);
        border-radius: 8px;
        margin: ${spacing.md} 0;
      }
      
      .template-${template.id}.category-technical .cv-tech-category {
        margin-bottom: ${spacing.md};
      }
      
      .template-${template.id}.category-technical .cv-tech-category h4 {
        color: var(--primary-color);
        font-weight: 600;
        margin-bottom: ${spacing.xs};
      }
      
      .template-${template.id}.category-technical .cv-tech-items {
        display: flex;
        flex-wrap: wrap;
        gap: ${spacing.xs};
      }
      
      .template-${template.id}.category-technical .cv-tech-item {
        background: var(--background-color);
        border: 1px solid var(--border-color);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-family: monospace;
      }
      
      .template-${template.id}.category-technical .cv-project-links {
        display: flex;
        gap: ${spacing.sm};
        margin-top: ${spacing.sm};
      }
      
      .template-${template.id}.category-technical .cv-project-link {
        background: var(--primary-color);
        color: white;
        padding: ${spacing.xs} ${spacing.sm};
        border-radius: 4px;
        text-decoration: none;
        font-size: 0.85rem;
        transition: background 0.3s ease;
      }
      
      .template-${template.id}.category-technical .cv-project-link:hover {
        background: var(--accent-color);
      }
    `;
  }

  /**
   * Generate creative layout styles
   */
  private static generateCreativeLayout(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Creative Layout */
      .template-${template.id}.category-creative .cv-main {
        grid-template-columns: 1fr;
        gap: ${spacing.lg};
      }
      
      .template-${template.id}.category-creative .cv-header {
        background: linear-gradient(45deg, var(--primary-color), var(--accent-color), var(--secondary-color));
        background-size: 300% 300%;
        animation: gradientShift 6s ease infinite;
        border-radius: 20px;
        position: relative;
        overflow: hidden;
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .template-${template.id}.category-creative .cv-section {
        border-radius: 15px;
        border: 2px solid transparent;
        background: linear-gradient(var(--surface-color), var(--surface-color)) padding-box,
                    linear-gradient(45deg, var(--primary-color), var(--accent-color)) border-box;
      }
      
      .template-${template.id}.category-creative .cv-portfolio {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: ${spacing.md};
        margin-top: ${spacing.md};
      }
      
      .template-${template.id}.category-creative .cv-portfolio-item {
        background: var(--surface-color);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .template-${template.id}.category-creative .cv-portfolio-item:hover {
        transform: translateY(-5px) rotate(1deg);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }
      
      .template-${template.id}.category-creative .cv-portfolio-image {
        width: 100%;
        height: 120px;
        background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2rem;
      }
      
      .template-${template.id}.category-creative .cv-portfolio-content {
        padding: ${spacing.sm};
      }
      
      .template-${template.id}.category-creative .cv-skills-creative {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: ${spacing.sm};
        margin-top: ${spacing.md};
      }
      
      .template-${template.id}.category-creative .cv-skill-creative {
        text-align: center;
        padding: ${spacing.md};
        background: var(--surface-color);
        border-radius: 50%;
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 3px solid var(--primary-color);
        transition: all 0.3s ease;
      }
      
      .template-${template.id}.category-creative .cv-skill-creative:hover {
        transform: scale(1.1);
        border-color: var(--accent-color);
        background: var(--primary-color);
        color: white;
      }
    `;
  }

  /**
   * Generate healthcare layout styles
   */
  private static generateHealthcareLayout(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Healthcare Layout */
      .template-${template.id}.category-healthcare .cv-main {
        grid-template-columns: 2fr 1fr;
        gap: ${spacing.xl};
      }
      
      .template-${template.id}.category-healthcare .cv-header {
        background: linear-gradient(135deg, #2b6cb0, #3182ce);
        border-radius: 8px;
      }
      
      .template-${template.id}.category-healthcare .cv-certifications {
        border: 2px solid var(--primary-color);
        border-radius: 8px;
        background: linear-gradient(135deg, var(--surface-color), var(--background-color));
      }
      
      .template-${template.id}.category-healthcare .cv-certification-item {
        border-left: 4px solid var(--accent-color);
        background: white;
        margin-bottom: ${spacing.sm};
      }
      
      .template-${template.id}.category-healthcare .cv-clinical-experience {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: ${spacing.md};
        margin: ${spacing.md} 0;
      }
      
      .template-${template.id}.category-healthcare .cv-specializations {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: ${spacing.sm};
        margin-top: ${spacing.md};
      }
      
      .template-${template.id}.category-healthcare .cv-specialization {
        background: var(--primary-color);
        color: white;
        padding: ${spacing.sm};
        border-radius: 8px;
        text-align: center;
        font-weight: 500;
        transition: background 0.3s ease;
      }
      
      .template-${template.id}.category-healthcare .cv-specialization:hover {
        background: var(--accent-color);
      }
    `;
  }

  /**
   * Generate professional layout styles (default)
   */
  private static generateProfessionalLayout(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Professional Layout */
      .template-${template.id}.category-professional .cv-main {
        grid-template-columns: 2fr 1fr;
        gap: ${spacing.xl};
      }
      
      .template-${template.id}.category-professional .cv-header {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .template-${template.id}.category-professional .cv-summary {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: ${spacing.lg};
        margin: ${spacing.md} 0;
        font-style: italic;
        position: relative;
      }
      
      .template-${template.id}.category-professional .cv-summary::before {
        content: '"';
        position: absolute;
        top: 10px;
        left: 15px;
        font-size: 3rem;
        color: var(--primary-color);
        opacity: 0.3;
        line-height: 1;
      }
    `;
  }
}