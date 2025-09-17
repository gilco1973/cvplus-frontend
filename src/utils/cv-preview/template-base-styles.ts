/**
 * Template Base Styles Generator
 * Generates foundational CSS styles for templates
 */

import type { CVTemplate } from '../../types/cv-templates';

export class TemplateBaseStylesGenerator {
  /**
   * Generate base styles for template
   */
  static async generate(template: CVTemplate): Promise<string> {
    const baseStyles = [
      this.generateContainerStyles(template),
      this.generateResetStyles(template),
      this.generateUtilityStyles(template),
      this.generateGridStyles(template)
    ];

    return baseStyles.join('\n\n');
  }

  /**
   * Generate container styles
   */
  private static generateContainerStyles(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Container Styles */
      .template-${template.id} {
        max-width: 100%;
        margin: 0 auto;
        padding: ${spacing.lg};
        background: var(--background-color);
        color: var(--text-primary);
        font-family: var(--font-secondary);
        font-size: var(--font-size-base);
        line-height: var(--line-height-base);
        position: relative;
        min-height: 100vh;
        box-sizing: border-box;
      }
      
      .template-${template.id} * {
        box-sizing: border-box;
      }
      
      .template-${template.id}.template-preview {
        min-height: auto;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
    `;
  }

  /**
   * Generate reset styles
   */
  private static generateResetStyles(template: CVTemplate): string {
    return `
      /* Reset Styles */
      .template-${template.id} h1,
      .template-${template.id} h2,
      .template-${template.id} h3,
      .template-${template.id} h4,
      .template-${template.id} h5,
      .template-${template.id} h6 {
        margin: 0;
        padding: 0;
        font-weight: normal;
        line-height: 1.2;
      }
      
      .template-${template.id} p {
        margin: 0 0 var(--spacing-sm) 0;
        padding: 0;
      }
      
      .template-${template.id} ul,
      .template-${template.id} ol {
        margin: 0;
        padding: 0;
        list-style: none;
      }
      
      .template-${template.id} a {
        color: var(--primary-color);
        text-decoration: none;
        transition: color 0.2s ease;
      }
      
      .template-${template.id} a:hover {
        color: var(--accent-color);
        text-decoration: underline;
      }
      
      .template-${template.id} img {
        max-width: 100%;
        height: auto;
        display: block;
      }
      
      .template-${template.id} button {
        border: none;
        background: none;
        padding: 0;
        margin: 0;
        font: inherit;
        cursor: pointer;
      }
      
      .template-${template.id} table {
        border-collapse: collapse;
        width: 100%;
      }
      
      .template-${template.id} th,
      .template-${template.id} td {
        text-align: left;
        padding: var(--spacing-xs);
        border-bottom: 1px solid var(--border-color);
      }
    `;
  }

  /**
   * Generate utility styles
   */
  private static generateUtilityStyles(template: CVTemplate): string {
    return `
      /* Utility Styles */
      .template-${template.id} .text-center { text-align: center; }
      .template-${template.id} .text-left { text-align: left; }
      .template-${template.id} .text-right { text-align: right; }
      .template-${template.id} .text-justify { text-align: justify; }
      
      .template-${template.id} .font-bold { font-weight: bold; }
      .template-${template.id} .font-semibold { font-weight: 600; }
      .template-${template.id} .font-medium { font-weight: 500; }
      .template-${template.id} .font-normal { font-weight: normal; }
      .template-${template.id} .font-light { font-weight: 300; }
      
      .template-${template.id} .italic { font-style: italic; }
      .template-${template.id} .underline { text-decoration: underline; }
      .template-${template.id} .uppercase { text-transform: uppercase; }
      .template-${template.id} .lowercase { text-transform: lowercase; }
      .template-${template.id} .capitalize { text-transform: capitalize; }
      
      .template-${template.id} .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .template-${template.id} .break-words {
        word-wrap: break-word;
        word-break: break-word;
      }
      
      /* Spacing utilities */
      .template-${template.id} .m-0 { margin: 0; }
      .template-${template.id} .mt-0 { margin-top: 0; }
      .template-${template.id} .mr-0 { margin-right: 0; }
      .template-${template.id} .mb-0 { margin-bottom: 0; }
      .template-${template.id} .ml-0 { margin-left: 0; }
      
      .template-${template.id} .m-sm { margin: var(--spacing-sm); }
      .template-${template.id} .mt-sm { margin-top: var(--spacing-sm); }
      .template-${template.id} .mr-sm { margin-right: var(--spacing-sm); }
      .template-${template.id} .mb-sm { margin-bottom: var(--spacing-sm); }
      .template-${template.id} .ml-sm { margin-left: var(--spacing-sm); }
      
      .template-${template.id} .m-md { margin: var(--spacing-md); }
      .template-${template.id} .mt-md { margin-top: var(--spacing-md); }
      .template-${template.id} .mr-md { margin-right: var(--spacing-md); }
      .template-${template.id} .mb-md { margin-bottom: var(--spacing-md); }
      .template-${template.id} .ml-md { margin-left: var(--spacing-md); }
      
      .template-${template.id} .p-0 { padding: 0; }
      .template-${template.id} .pt-0 { padding-top: 0; }
      .template-${template.id} .pr-0 { padding-right: 0; }
      .template-${template.id} .pb-0 { padding-bottom: 0; }
      .template-${template.id} .pl-0 { padding-left: 0; }
      
      .template-${template.id} .p-sm { padding: var(--spacing-sm); }
      .template-${template.id} .pt-sm { padding-top: var(--spacing-sm); }
      .template-${template.id} .pr-sm { padding-right: var(--spacing-sm); }
      .template-${template.id} .pb-sm { padding-bottom: var(--spacing-sm); }
      .template-${template.id} .pl-sm { padding-left: var(--spacing-sm); }
      
      /* Display utilities */
      .template-${template.id} .block { display: block; }
      .template-${template.id} .inline { display: inline; }
      .template-${template.id} .inline-block { display: inline-block; }
      .template-${template.id} .flex { display: flex; }
      .template-${template.id} .inline-flex { display: inline-flex; }
      .template-${template.id} .grid { display: grid; }
      .template-${template.id} .hidden { display: none; }
      
      /* Flexbox utilities */
      .template-${template.id} .flex-row { flex-direction: row; }
      .template-${template.id} .flex-col { flex-direction: column; }
      .template-${template.id} .flex-wrap { flex-wrap: wrap; }
      .template-${template.id} .flex-nowrap { flex-wrap: nowrap; }
      
      .template-${template.id} .justify-start { justify-content: flex-start; }
      .template-${template.id} .justify-center { justify-content: center; }
      .template-${template.id} .justify-end { justify-content: flex-end; }
      .template-${template.id} .justify-between { justify-content: space-between; }
      .template-${template.id} .justify-around { justify-content: space-around; }
      
      .template-${template.id} .items-start { align-items: flex-start; }
      .template-${template.id} .items-center { align-items: center; }
      .template-${template.id} .items-end { align-items: flex-end; }
      .template-${template.id} .items-stretch { align-items: stretch; }
      
      .template-${template.id} .flex-1 { flex: 1; }
      .template-${template.id} .flex-auto { flex: auto; }
      .template-${template.id} .flex-none { flex: none; }
      
      /* Position utilities */
      .template-${template.id} .relative { position: relative; }
      .template-${template.id} .absolute { position: absolute; }
      .template-${template.id} .fixed { position: fixed; }
      .template-${template.id} .sticky { position: sticky; }
      
      /* Width utilities */
      .template-${template.id} .w-full { width: 100%; }
      .template-${template.id} .w-auto { width: auto; }
      .template-${template.id} .w-1/2 { width: 50%; }
      .template-${template.id} .w-1/3 { width: 33.333333%; }
      .template-${template.id} .w-2/3 { width: 66.666667%; }
      .template-${template.id} .w-1/4 { width: 25%; }
      .template-${template.id} .w-3/4 { width: 75%; }
      
      /* Height utilities */
      .template-${template.id} .h-full { height: 100%; }
      .template-${template.id} .h-auto { height: auto; }
      .template-${template.id} .h-screen { height: 100vh; }
    `;
  }

  /**
   * Generate grid styles
   */
  private static generateGridStyles(template: CVTemplate): string {
    return `
      /* Grid System */
      .template-${template.id} .container {
        width: 100%;
        margin: 0 auto;
        padding: 0 var(--spacing-md);
      }
      
      .template-${template.id} .row {
        display: flex;
        flex-wrap: wrap;
        margin: 0 calc(-1 * var(--spacing-xs));
      }
      
      .template-${template.id} .col {
        flex: 1;
        padding: 0 var(--spacing-xs);
      }
      
      .template-${template.id} .col-auto {
        flex: 0 0 auto;
        width: auto;
        padding: 0 var(--spacing-xs);
      }
      
      .template-${template.id} .col-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
      .template-${template.id} .col-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
      .template-${template.id} .col-3 { flex: 0 0 25%; max-width: 25%; }
      .template-${template.id} .col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
      .template-${template.id} .col-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
      .template-${template.id} .col-6 { flex: 0 0 50%; max-width: 50%; }
      .template-${template.id} .col-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
      .template-${template.id} .col-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
      .template-${template.id} .col-9 { flex: 0 0 75%; max-width: 75%; }
      .template-${template.id} .col-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
      .template-${template.id} .col-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
      .template-${template.id} .col-12 { flex: 0 0 100%; max-width: 100%; }
      
      /* Responsive grid */
      @media (max-width: 768px) {
        .template-${template.id} .col-sm-12 { flex: 0 0 100%; max-width: 100%; }
        .template-${template.id} .col-sm-6 { flex: 0 0 50%; max-width: 50%; }
      }
      
      @media (max-width: 480px) {
        .template-${template.id} .col-xs-12 { flex: 0 0 100%; max-width: 100%; }
        .template-${template.id} .row {
          margin: 0;
        }
        .template-${template.id} [class*="col-"] {
          padding: 0;
          margin-bottom: var(--spacing-sm);
        }
      }
    `;
  }
}