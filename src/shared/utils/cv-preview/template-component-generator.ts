/**
 * Template Component Generator
 * Generates component-specific CSS styles for templates
 */

import type { CVTemplate } from '../../types/cv-templates';

export class TemplateComponentGenerator {
  /**
   * Generate component styles for template
   */
  static async generate(template: CVTemplate): Promise<string> {
    const componentStyles = [
      this.generateButtonStyles(template),
      this.generateCardStyles(template),
      this.generateInputStyles(template),
      this.generateBadgeStyles(template),
      this.generateProgressStyles(template),
      this.generateModalStyles(template),
      this.generateTooltipStyles(template),
      this.generateDividerStyles(template),
      this.generateIconStyles(template),
      this.generateTableStyles(template)
    ];

    return componentStyles.join('\n\n');
  }

  /**
   * Generate button styles
   */
  private static generateButtonStyles(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Button Styles */
      .template-${template.id} .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: ${spacing.xs};
        padding: ${spacing.sm} ${spacing.md};
        border: 1px solid transparent;
        border-radius: 6px;
        font-family: inherit;
        font-size: 0.9rem;
        font-weight: 500;
        line-height: 1.5;
        text-decoration: none;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
        vertical-align: middle;
        white-space: nowrap;
      }
      
      .template-${template.id} .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .template-${template.id} .btn:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      
      /* Button variants */
      .template-${template.id} .btn-primary {
        background-color: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }
      
      .template-${template.id} .btn-primary:hover:not(:disabled) {
        background-color: var(--primary-600);
        border-color: var(--primary-600);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
      
      .template-${template.id} .btn-secondary {
        background-color: var(--secondary-color);
        color: white;
        border-color: var(--secondary-color);
      }
      
      .template-${template.id} .btn-secondary:hover:not(:disabled) {
        background-color: var(--secondary-600);
        border-color: var(--secondary-600);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
      
      .template-${template.id} .btn-outline {
        background-color: transparent;
        color: var(--primary-color);
        border-color: var(--primary-color);
      }
      
      .template-${template.id} .btn-outline:hover:not(:disabled) {
        background-color: var(--primary-color);
        color: white;
      }
      
      .template-${template.id} .btn-ghost {
        background-color: transparent;
        color: var(--primary-color);
        border-color: transparent;
      }
      
      .template-${template.id} .btn-ghost:hover:not(:disabled) {
        background-color: var(--primary-50);
      }
      
      /* Button sizes */
      .template-${template.id} .btn-sm {
        padding: calc(${spacing.xs} * 0.75) ${spacing.sm};
        font-size: 0.8rem;
      }
      
      .template-${template.id} .btn-lg {
        padding: ${spacing.md} ${spacing.lg};
        font-size: 1.1rem;
      }
      
      .template-${template.id} .btn-xl {
        padding: ${spacing.lg} ${spacing.xl};
        font-size: 1.2rem;
      }
      
      /* Button with icons */
      .template-${template.id} .btn-icon {
        padding: ${spacing.sm};
        aspect-ratio: 1;
        border-radius: 50%;
      }
      
      .template-${template.id} .btn .icon {
        width: 1em;
        height: 1em;
        display: inline-block;
      }
    `;
  }

  /**
   * Generate card styles
   */
  private static generateCardStyles(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Card Styles */
      .template-${template.id} .card {
        background-color: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: var(--shadow-sm);
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .template-${template.id} .card:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
      
      .template-${template.id} .card-header {
        padding: ${spacing.md};
        border-bottom: 1px solid var(--border-color);
        background-color: var(--bg-tertiary);
      }
      
      .template-${template.id} .card-body {
        padding: ${spacing.md};
      }
      
      .template-${template.id} .card-footer {
        padding: ${spacing.md};
        border-top: 1px solid var(--border-color);
        background-color: var(--bg-tertiary);
      }
      
      .template-${template.id} .card-title {
        margin: 0 0 ${spacing.sm} 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      
      .template-${template.id} .card-subtitle {
        margin: 0 0 ${spacing.sm} 0;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
      
      .template-${template.id} .card-text {
        color: var(--text-primary);
        line-height: 1.6;
      }
      
      /* Card variants */
      .template-${template.id} .card-elevated {
        box-shadow: var(--shadow-lg);
        border: none;
      }
      
      .template-${template.id} .card-flat {
        box-shadow: none;
        border: 1px solid var(--border-color);
      }
      
      .template-${template.id} .card-primary {
        border-color: var(--primary-color);
        border-left-width: 4px;
      }
      
      .template-${template.id} .card-secondary {
        border-color: var(--secondary-color);
        border-left-width: 4px;
      }
      
      .template-${template.id} .card-accent {
        border-color: var(--accent-color);
        border-left-width: 4px;
      }
    `;
  }

  /**
   * Generate input styles
   */
  private static generateInputStyles(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Input Styles */
      .template-${template.id} .form-group {
        margin-bottom: ${spacing.md};
      }
      
      .template-${template.id} .form-label {
        display: block;
        margin-bottom: ${spacing.xs};
        font-weight: 500;
        color: var(--text-primary);
      }
      
      .template-${template.id} .form-input {
        display: block;
        width: 100%;
        padding: ${spacing.sm};
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background-color: var(--surface-color);
        color: var(--text-primary);
        font-family: inherit;
        font-size: 0.9rem;
        line-height: 1.5;
        transition: all 0.2s ease;
      }
      
      .template-${template.id} .form-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(${this.hexToRgb(template.styling.colorPalette.primary)}, 0.1);
      }
      
      .template-${template.id} .form-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background-color: var(--bg-tertiary);
      }
      
      .template-${template.id} .form-input.is-invalid {
        border-color: var(--error-color);
      }
      
      .template-${template.id} .form-input.is-valid {
        border-color: var(--success-color);
      }
      
      .template-${template.id} .form-textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      .template-${template.id} .form-select {
        appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 8px center;
        background-repeat: no-repeat;
        background-size: 16px 12px;
        padding-right: 40px;
      }
      
      .template-${template.id} .form-check {
        display: flex;
        align-items: center;
        gap: ${spacing.xs};
      }
      
      .template-${template.id} .form-check-input {
        width: auto;
        margin: 0;
      }
      
      .template-${template.id} .form-help {
        margin-top: ${spacing.xs};
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
      
      .template-${template.id} .form-error {
        margin-top: ${spacing.xs};
        font-size: 0.8rem;
        color: var(--error-color);
      }
      
      .template-${template.id} .form-success {
        margin-top: ${spacing.xs};
        font-size: 0.8rem;
        color: var(--success-color);
      }
    `;
  }

  /**
   * Generate badge styles
   */
  private static generateBadgeStyles(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Badge Styles */
      .template-${template.id} .badge {
        display: inline-flex;
        align-items: center;
        gap: calc(${spacing.xs} * 0.5);
        padding: calc(${spacing.xs} * 0.5) ${spacing.xs};
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-radius: 12px;
        line-height: 1;
        white-space: nowrap;
      }
      
      .template-${template.id} .badge-primary {
        background-color: var(--primary-color);
        color: white;
      }
      
      .template-${template.id} .badge-secondary {
        background-color: var(--secondary-color);
        color: white;
      }
      
      .template-${template.id} .badge-accent {
        background-color: var(--accent-color);
        color: white;
      }
      
      .template-${template.id} .badge-success {
        background-color: var(--success-color);
        color: white;
      }
      
      .template-${template.id} .badge-warning {
        background-color: var(--warning-color);
        color: white;
      }
      
      .template-${template.id} .badge-error {
        background-color: var(--error-color);
        color: white;
      }
      
      .template-${template.id} .badge-info {
        background-color: var(--info-color);
        color: white;
      }
      
      .template-${template.id} .badge-outline {
        background-color: transparent;
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
      }
      
      .template-${template.id} .badge-soft {
        background-color: var(--primary-50);
        color: var(--primary-700);
      }
      
      /* Badge sizes */
      .template-${template.id} .badge-sm {
        padding: 2px 6px;
        font-size: 0.65rem;
      }
      
      .template-${template.id} .badge-lg {
        padding: ${spacing.xs} ${spacing.sm};
        font-size: 0.85rem;
      }
      
      /* Badge with dot */
      .template-${template.id} .badge-dot::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: currentColor;
      }
    `;
  }

  /**
   * Generate progress styles
   */
  private static generateProgressStyles(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Progress Styles */
      .template-${template.id} .progress {
        width: 100%;
        height: 8px;
        background-color: var(--bg-tertiary);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      }
      
      .template-${template.id} .progress-bar {
        height: 100%;
        background-color: var(--primary-color);
        border-radius: 4px;
        transition: width 0.6s ease;
        position: relative;
        overflow: hidden;
      }
      
      .template-${template.id} .progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-image: linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.15) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, 0.15) 50%,
          rgba(255, 255, 255, 0.15) 75%,
          transparent 75%,
          transparent
        );
        background-size: 1rem 1rem;
        animation: progress-bar-stripes 1s linear infinite;
      }
      
      @keyframes progress-bar-stripes {
        0% {
          background-position-x: 1rem;
        }
      }
      
      .template-${template.id} .progress-sm {
        height: 4px;
      }
      
      .template-${template.id} .progress-lg {
        height: 12px;
      }
      
      .template-${template.id} .progress-xl {
        height: 16px;
      }
      
      /* Progress variants */
      .template-${template.id} .progress-primary .progress-bar {
        background-color: var(--primary-color);
      }
      
      .template-${template.id} .progress-secondary .progress-bar {
        background-color: var(--secondary-color);
      }
      
      .template-${template.id} .progress-accent .progress-bar {
        background-color: var(--accent-color);
      }
      
      .template-${template.id} .progress-success .progress-bar {
        background-color: var(--success-color);
      }
      
      .template-${template.id} .progress-warning .progress-bar {
        background-color: var(--warning-color);
      }
      
      .template-${template.id} .progress-error .progress-bar {
        background-color: var(--error-color);
      }
      
      /* Circular progress */
      .template-${template.id} .progress-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: conic-gradient(var(--primary-color) 0deg, var(--bg-tertiary) 0deg);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      
      .template-${template.id} .progress-circle::before {
        content: '';
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: var(--surface-color);
        position: absolute;
      }
      
      .template-${template.id} .progress-circle-text {
        position: relative;
        z-index: 1;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-primary);
      }
    `;
  }

  /**
   * Generate modal styles
   */
  private static generateModalStyles(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Modal Styles */
      .template-${template.id} .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      .template-${template.id} .modal.show {
        opacity: 1;
        visibility: visible;
      }
      
      .template-${template.id} .modal-content {
        background-color: var(--surface-color);
        border-radius: 8px;
        box-shadow: var(--shadow-xl);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.8);
        transition: transform 0.3s ease;
      }
      
      .template-${template.id} .modal.show .modal-content {
        transform: scale(1);
      }
      
      .template-${template.id} .modal-header {
        padding: ${spacing.lg};
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .template-${template.id} .modal-title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      
      .template-${template.id} .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      
      .template-${template.id} .modal-close:hover {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
      }
      
      .template-${template.id} .modal-body {
        padding: ${spacing.lg};
      }
      
      .template-${template.id} .modal-footer {
        padding: ${spacing.lg};
        border-top: 1px solid var(--border-color);
        display: flex;
        gap: ${spacing.sm};
        justify-content: flex-end;
      }
    `;
  }

  /**
   * Generate tooltip styles
   */
  private static generateTooltipStyles(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Tooltip Styles */
      .template-${template.id} .tooltip {
        position: relative;
        display: inline-block;
      }
      
      .template-${template.id} .tooltip-content {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--gray-900);
        color: white;
        padding: ${spacing.xs} ${spacing.sm};
        border-radius: 4px;
        font-size: 0.8rem;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s ease;
        z-index: 100;
        margin-bottom: 8px;
      }
      
      .template-${template.id} .tooltip-content::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: var(--gray-900);
      }
      
      .template-${template.id} .tooltip:hover .tooltip-content {
        opacity: 1;
        visibility: visible;
      }
      
      /* Tooltip positions */
      .template-${template.id} .tooltip-top .tooltip-content {
        bottom: 100%;
        margin-bottom: 8px;
      }
      
      .template-${template.id} .tooltip-bottom .tooltip-content {
        top: 100%;
        bottom: auto;
        margin-top: 8px;
        margin-bottom: 0;
      }
      
      .template-${template.id} .tooltip-bottom .tooltip-content::after {
        top: -8px;
        border-top-color: transparent;
        border-bottom-color: var(--gray-900);
      }
      
      .template-${template.id} .tooltip-right .tooltip-content {
        left: 100%;
        top: 50%;
        bottom: auto;
        transform: translateY(-50%);
        margin-left: 8px;
        margin-bottom: 0;
      }
      
      .template-${template.id} .tooltip-right .tooltip-content::after {
        left: -8px;
        top: 50%;
        transform: translateY(-50%);
        border-top-color: transparent;
        border-right-color: var(--gray-900);
      }
      
      .template-${template.id} .tooltip-left .tooltip-content {
        right: 100%;
        left: auto;
        top: 50%;
        bottom: auto;
        transform: translateY(-50%);
        margin-right: 8px;
        margin-bottom: 0;
      }
      
      .template-${template.id} .tooltip-left .tooltip-content::after {
        right: -8px;
        left: auto;
        top: 50%;
        transform: translateY(-50%);
        border-top-color: transparent;
        border-left-color: var(--gray-900);
      }
    `;
  }

  /**
   * Generate divider styles
   */
  private static generateDividerStyles(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Divider Styles */
      .template-${template.id} .divider {
        border: none;
        height: 1px;
        background-color: var(--border-color);
        margin: ${spacing.md} 0;
      }
      
      .template-${template.id} .divider-thick {
        height: 2px;
      }
      
      .template-${template.id} .divider-dashed {
        background: none;
        border-top: 1px dashed var(--border-color);
        height: 0;
      }
      
      .template-${template.id} .divider-dotted {
        background: none;
        border-top: 1px dotted var(--border-color);
        height: 0;
      }
      
      .template-${template.id} .divider-gradient {
        background: linear-gradient(
          to right,
          transparent,
          var(--border-color),
          transparent
        );
      }
      
      .template-${template.id} .divider-primary {
        background-color: var(--primary-color);
      }
      
      .template-${template.id} .divider-secondary {
        background-color: var(--secondary-color);
      }
      
      .template-${template.id} .divider-accent {
        background-color: var(--accent-color);
      }
      
      /* Divider with text */
      .template-${template.id} .divider-text {
        display: flex;
        align-items: center;
        margin: ${spacing.md} 0;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
      
      .template-${template.id} .divider-text::before,
      .template-${template.id} .divider-text::after {
        content: '';
        flex: 1;
        height: 1px;
        background-color: var(--border-color);
      }
      
      .template-${template.id} .divider-text::before {
        margin-right: ${spacing.sm};
      }
      
      .template-${template.id} .divider-text::after {
        margin-left: ${spacing.sm};
      }
      
      /* Vertical divider */
      .template-${template.id} .divider-vertical {
        width: 1px;
        height: 100%;
        background-color: var(--border-color);
        margin: 0 ${spacing.md};
        display: inline-block;
      }
    `;
  }

  /**
   * Generate icon styles
   */
  private static generateIconStyles(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Icon Styles */
      .template-${template.id} .icon {
        display: inline-block;
        width: 1em;
        height: 1em;
        fill: currentColor;
        vertical-align: middle;
      }
      
      .template-${template.id} .icon-sm {
        width: 0.8em;
        height: 0.8em;
      }
      
      .template-${template.id} .icon-lg {
        width: 1.5em;
        height: 1.5em;
      }
      
      .template-${template.id} .icon-xl {
        width: 2em;
        height: 2em;
      }
      
      .template-${template.id} .icon-2xl {
        width: 3em;
        height: 3em;
      }
      
      /* Icon colors */
      .template-${template.id} .icon-primary {
        color: var(--primary-color);
      }
      
      .template-${template.id} .icon-secondary {
        color: var(--secondary-color);
      }
      
      .template-${template.id} .icon-accent {
        color: var(--accent-color);
      }
      
      .template-${template.id} .icon-success {
        color: var(--success-color);
      }
      
      .template-${template.id} .icon-warning {
        color: var(--warning-color);
      }
      
      .template-${template.id} .icon-error {
        color: var(--error-color);
      }
      
      .template-${template.id} .icon-info {
        color: var(--info-color);
      }
      
      .template-${template.id} .icon-muted {
        color: var(--text-secondary);
      }
      
      /* Icon containers */
      .template-${template.id} .icon-container {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.5em;
        height: 2.5em;
        border-radius: 50%;
        background-color: var(--bg-tertiary);
      }
      
      .template-${template.id} .icon-container-primary {
        background-color: var(--primary-50);
        color: var(--primary-color);
      }
      
      .template-${template.id} .icon-container-secondary {
        background-color: var(--secondary-50);
        color: var(--secondary-color);
      }
      
      .template-${template.id} .icon-container-accent {
        background-color: var(--accent-50);
        color: var(--accent-color);
      }
    `;
  }

  /**
   * Generate table styles
   */
  private static generateTableStyles(template: CVTemplate): string {
    const { spacing } = template.styling;
    
    return `
      /* Table Styles */
      .template-${template.id} .table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: ${spacing.md};
      }
      
      .template-${template.id} .table th,
      .template-${template.id} .table td {
        padding: ${spacing.sm};
        text-align: left;
        border-bottom: 1px solid var(--border-color);
        vertical-align: top;
      }
      
      .template-${template.id} .table th {
        font-weight: 600;
        color: var(--text-primary);
        background-color: var(--bg-tertiary);
        border-bottom: 2px solid var(--border-color);
      }
      
      .template-${template.id} .table td {
        color: var(--text-primary);
      }
      
      .template-${template.id} .table tbody tr:hover {
        background-color: var(--bg-tertiary);
      }
      
      /* Table variants */
      .template-${template.id} .table-striped tbody tr:nth-child(odd) {
        background-color: var(--bg-tertiary);
      }
      
      .template-${template.id} .table-bordered {
        border: 1px solid var(--border-color);
      }
      
      .template-${template.id} .table-bordered th,
      .template-${template.id} .table-bordered td {
        border: 1px solid var(--border-color);
      }
      
      .template-${template.id} .table-borderless th,
      .template-${template.id} .table-borderless td {
        border: none;
      }
      
      /* Table sizes */
      .template-${template.id} .table-sm th,
      .template-${template.id} .table-sm td {
        padding: ${spacing.xs};
      }
      
      .template-${template.id} .table-lg th,
      .template-${template.id} .table-lg td {
        padding: ${spacing.md};
      }
      
      /* Responsive table */
      .template-${template.id} .table-responsive {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      @media (max-width: 768px) {
        .template-${template.id} .table-responsive .table {
          font-size: 0.8rem;
        }
        
        .template-${template.id} .table-responsive .table th,
        .template-${template.id} .table-responsive .table td {
          padding: ${spacing.xs};
          white-space: nowrap;
        }
      }
    `;
  }

  /**
   * Convert hex color to RGB values
   */
  private static hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `${r}, ${g}, ${b}`;
  }
}