export const CVTemplateStyles = {
  getBaseStyles: (): string => `
    .cv-preview-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #111827;
      background: #ffffff;
      padding: 40px;
      margin: 0 auto;
      box-shadow: 0 4px 25px rgba(0,0,0,0.15);
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }
    
    .feature-preview {
      border: 2px solid #4299e1;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      position: relative;
      box-shadow: 0 2px 8px rgba(66, 153, 225, 0.1);
    }
    
    .feature-preview-banner {
      background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 16px;
      display: inline-block;
      animation: pulse 2s infinite;
      box-shadow: 0 2px 4px rgba(66, 153, 225, 0.3);
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .animate-fade-in-up {
      animation: fade-in-up 0.5s ease-out forwards;
    }
    
    .feature-preview {
      transition: all 0.3s ease-in-out;
    }
    
    .feature-preview.opacity-50 {
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out, filter 0.3s ease-in-out;
    }
    
    .grayscale {
      filter: grayscale(100%);
    }
    
    .timeline-container {
      position: relative;
      padding-left: 30px;
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 20px;
      padding-left: 30px;
    }
    
    .timeline-dot {
      position: absolute;
      left: -6px;
      top: 6px;
      width: 12px;
      height: 12px;
      background: #4299e1;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 2px #4299e1;
    }
    
    .timeline-item::before {
      content: '';
      position: absolute;
      left: -1px;
      top: 18px;
      bottom: -20px;
      width: 2px;
      background: #e2e8f0;
    }
    
    .timeline-item:last-child::before {
      display: none;
    }
    
    .skills-chart {
      space-y: 16px;
    }
    
    .skill-bar {
      margin-bottom: 16px;
    }
    
    .skill-bar span {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #2d3748;
    }
    
    .progress {
      width: 100%;
      height: 12px;
      background: #edf2f7;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .progress .fill {
      height: 100%;
      background: linear-gradient(90deg, #4299e1 0%, #3182ce 100%);
      border-radius: 6px;
      transition: width 0.8s ease-in-out;
    }
    
    .video-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f7fafc;
      border: 2px dashed #cbd5e0;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
    }
    
    .play-button {
      width: 60px;
      height: 60px;
      background: #4299e1;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .play-button:hover {
      background: #3182ce;
      transform: scale(1.1);
    }
    
    .portfolio-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .portfolio-item {
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .portfolio-item:hover {
      border-color: #4299e1;
      background: #edf8ff;
      transform: translateY(-2px);
    }
    
    .contact-form {
      max-width: 400px;
    }
    
    .contact-form input,
    .contact-form textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }
    
    .contact-form input:focus,
    .contact-form textarea:focus {
      outline: none;
      border-color: #4299e1;
    }
    
    .contact-form button {
      background: #4299e1;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    
    .contact-form button:hover {
      background: #3182ce;
    }
  `,

  getSectionStyles: (): string => `
    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 20px;
      border-bottom: 3px solid #4299e1;
      padding-bottom: 10px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .section-title:hover {
      color: #3182ce;
    }
    
    .section-title .collapse-icon {
      margin-left: auto;
      width: 20px;
      height: 20px;
      color: #4299e1;
      transition: transform 0.3s ease;
    }
    
    .section-title .collapse-icon.collapsed {
      transform: rotate(-90deg);
    }
    
    .section-content {
      transition: all 0.3s ease;
      overflow: hidden;
    }
    
    .section-content.collapsed {
      max-height: 0;
      opacity: 0;
      margin-top: 0;
      padding-top: 0;
    }
    
    .section-content:not(.collapsed) {
      max-height: none;
      opacity: 1;
    }
  `,

  getEditableStyles: (): string => `
    .editable-section {
      position: relative;
      border: 2px solid transparent;
      border-radius: 4px;
      padding: 8px;
      transition: all 0.3s ease;
    }
    
    .editable-section:hover {
      border-color: #4299e1;
      background: rgba(66, 153, 225, 0.08);
    }
    
    .edit-overlay {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #4299e1;
      color: #ffffff;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s ease;
      box-shadow: 0 2px 8px rgba(66, 153, 225, 0.4);
    }
    
    .editable-section:hover .edit-overlay {
      opacity: 1;
    }
  `,

  getHeaderStyles: (): string => `
    .header-section {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 3px solid #e2e8f0;
    }
    
    .name {
      font-size: 40px;
      font-weight: 800;
      color: #1a202c;
      margin-bottom: 12px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    
    .contact-info {
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
      font-size: 15px;
      color: #4a5568;
      font-weight: 500;
    }
  `,

  getContentStyles: (): string => `
    .experience-item, .education-item {
      margin-bottom: 28px;
      padding-left: 24px;
      border-left: 4px solid #4299e1;
      position: relative;
    }
    
    .position, .degree {
      font-size: 20px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 6px;
    }
    
    .company, .institution {
      font-size: 17px;
      color: #3182ce;
      margin-bottom: 6px;
      font-weight: 600;
    }
    
    .duration {
      font-size: 14px;
      color: #718096;
      margin-bottom: 12px;
      font-weight: 500;
    }
    
    .description {
      margin-bottom: 12px;
      color: #2d3748;
      line-height: 1.7;
    }
    
    .achievements {
      list-style: none;
      padding: 0;
    }
    
    .achievements li {
      margin-bottom: 10px;
      padding-left: 24px;
      position: relative;
      color: #2d3748;
      line-height: 1.6;
    }
    
    .achievements li::before {
      content: '▸';
      position: absolute;
      left: 0;
      color: #4299e1;
      font-weight: bold;
      font-size: 16px;
    }
    
    .preview-content-with-placeholders {
      background: linear-gradient(90deg, transparent 0%, #e3f2fd 25%, #f3e5f5 50%, #e8f5e8 75%, transparent 100%);
      background-size: 400% 100%;
      animation: shimmer 3s ease-in-out infinite;
      border: 1px solid #e1f5fe;
      border-radius: 4px;
      padding: 6px 8px;
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .preview-content-with-placeholders:hover {
      border-color: #2563eb;
      background: #dbeafe;
      animation: none;
      transform: scale(1.02);
    }
    
    /* Make individual placeholders clickable */
    .placeholder-text {
      background: #fef3c7;
      border: 1px dashed #f59e0b;
      border-radius: 3px;
      padding: 2px 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-block;
      margin: 0 1px;
    }
    
    .placeholder-text:hover {
      background: #fbbf24;
      border-color: #d97706;
      color: #92400e;
      transform: scale(1.05);
    }
    
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    .placeholder-hint {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 6px;
      padding: 8px 12px;
      margin-top: 10px;
      font-size: 12px;
      color: #0369a1;
      text-align: center;
    }
    
    .placeholder-hint em {
      font-style: normal;
      font-weight: 500;
    }
    
    /* Enhanced Content Styles */
    .experience-item.enhanced-content {
      border-left: 4px solid #10b981;
      background: linear-gradient(135deg, #f0fdf4 0%, #f7fee7 100%);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 32px;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
      position: relative;
    }
    
    .enhanced-description {
      color: #065f46;
      line-height: 1.7;
      font-weight: 500;
      margin-bottom: 12px;
    }
    
    .improvement-badge {
      position: absolute;
      top: -8px;
      right: 12px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
      animation: gentle-pulse 2s ease-in-out infinite;
    }
    
    @keyframes gentle-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.9; }
    }
  `,

  getSkillsStyles: (): string => `
    .skills-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    
    .skill-category {
      background: #f7fafc;
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    .skill-category h4 {
      color: #1a202c;
      margin-bottom: 12px;
      font-weight: 700;
      font-size: 18px;
    }

    /* Feature Preview Styles */
    .privacy-info p {
      margin: 8px 0;
      padding: 8px 12px;
      background: #f0fff4;
      border-left: 3px solid #48bb78;
      border-radius: 4px;
    }

    .calendar-widget {
      text-align: center;
    }

    .schedule-button {
      display: block;
      width: 100%;
      margin: 8px 0;
      padding: 12px 20px;
      background: #4299e1;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .schedule-button:hover {
      background: #3182ce;
    }

    .calendar-note {
      margin-top: 12px;
      font-size: 12px;
      color: #666;
      font-style: italic;
    }
  `,

  getAllStyles: (): string => {
    return `
      <style>
        ${CVTemplateStyles.getBaseStyles()}
        ${CVTemplateStyles.getSectionStyles()}
        ${CVTemplateStyles.getEditableStyles()}
        ${CVTemplateStyles.getHeaderStyles()}
        ${CVTemplateStyles.getContentStyles()}
        ${CVTemplateStyles.getSkillsStyles()}
      </style>
    `;
  }
};