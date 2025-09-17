/**
 * Web Worker for CPU-intensive template processing
 * Offloads template generation from main thread to prevent UI blocking
 */

// Define message types for type safety
export interface WorkerMessage {
  id: string;
  type: 'generate_css' | 'generate_template' | 'compress_data';
  data: any;
}

export interface WorkerResponse {
  id: string;
  type: 'success' | 'error' | 'progress';
  data?: any;
  error?: string;
  progress?: number;
}

// Template generation data structure
export interface TemplateGenerationData {
  template: any;
  cvData: any;
  options: {
    compress: boolean;
    optimize: boolean;
    includePreview: boolean;
  };
}

export interface CSSGenerationData {
  templateId: string;
  styles: any;
  customizations: any;
  optimize: boolean;
}

/**
 * Main worker message handler
 */
self.onmessage = function(event: MessageEvent<WorkerMessage>) {
  const { id, type, data } = event.data;
  
  try {
    switch (type) {
      case 'generate_css':
        handleCSSGeneration(id, data as CSSGenerationData);
        break;
        
      case 'generate_template':
        handleTemplateGeneration(id, data as TemplateGenerationData);
        break;
        
      case 'compress_data':
        handleDataCompression(id, data);
        break;
        
      default:
        sendError(id, `Unknown message type: ${type}`);
    }
  } catch (error) {
    sendError(id, error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Handle CSS generation in worker
 */
async function handleCSSGeneration(id: string, data: CSSGenerationData): Promise<void> {
  sendProgress(id, 10);
  
  try {
    // Generate base CSS
    const baseCSS = generateBaseCSS(data.templateId, data.styles);
    sendProgress(id, 40);
    
    // Apply customizations
    const customCSS = applyCustomizations(baseCSS, data.customizations);
    sendProgress(id, 70);
    
    // Optimize if requested
    const finalCSS = data.optimize ? optimizeCSS(customCSS) : customCSS;
    sendProgress(id, 100);
    
    sendSuccess(id, {
      css: finalCSS,
      size: finalCSS.length,
      optimized: data.optimize
    });
    
  } catch (error) {
    sendError(id, error instanceof Error ? error.message : 'CSS generation failed');
  }
}

/**
 * Handle template generation in worker
 */
async function handleTemplateGeneration(id: string, data: TemplateGenerationData): Promise<void> {
  sendProgress(id, 5);
  
  try {
    // Process CV data
    const processedData = await processChunked(
      () => processTemplateData(data.cvData),
      (progress) => sendProgress(id, 5 + (progress * 0.3))
    );
    
    // Generate HTML structure
    const htmlStructure = await processChunked(
      () => generateHTMLStructure(data.template, processedData),
      (progress) => sendProgress(id, 35 + (progress * 0.3))
    );
    
    // Apply styling
    const styledHTML = await processChunked(
      () => applyTemplateStyles(htmlStructure, data.template.styles),
      (progress) => sendProgress(id, 65 + (progress * 0.2))
    );
    
    // Optimize and compress if requested
    let finalHTML = styledHTML;
    if (data.options.optimize) {
      finalHTML = await processChunked(
        () => optimizeHTML(styledHTML),
        (progress) => sendProgress(id, 85 + (progress * 0.1))
      );
    }
    
    if (data.options.compress) {
      finalHTML = compressHTML(finalHTML);
    }
    
    sendProgress(id, 100);
    
    sendSuccess(id, {
      html: finalHTML,
      size: finalHTML.length,
      compressed: data.options.compress,
      optimized: data.options.optimize
    });
    
  } catch (error) {
    sendError(id, error instanceof Error ? error.message : 'Template generation failed');
  }
}

/**
 * Handle data compression in worker
 */
function handleDataCompression(id: string, data: any): void {
  try {
    const compressed = compressData(data);
    
    sendSuccess(id, {
      compressed,
      originalSize: JSON.stringify(data).length,
      compressedSize: compressed.length,
      ratio: compressed.length / JSON.stringify(data).length
    });
    
  } catch (error) {
    sendError(id, error instanceof Error ? error.message : 'Compression failed');
  }
}

/**
 * Process operations in chunks to allow for progress updates
 */
async function processChunked<T>(
  operation: () => T,
  onProgress: (progress: number) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    // Simulate chunked processing for demo
    // In real implementation, this would break down the operation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      onProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        try {
          const result = operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
    }, 50);
  });
}

/**
 * Generate base CSS for template
 */
function generateBaseCSS(templateId: string, styles: any): string {
  // Simulate CSS generation
  const cssRules: string[] = [];
  
  // Add base styles
  cssRules.push(`
    .template-${templateId} {
      font-family: ${styles.fontFamily || 'Arial, sans-serif'};
      font-size: ${styles.fontSize || '14px'};
      line-height: ${styles.lineHeight || '1.5'};
      color: ${styles.color || '#333'};
      background-color: ${styles.backgroundColor || '#fff'};
    }
  `);
  
  // Add section styles
  if (styles.sections) {
    Object.entries(styles.sections).forEach(([section, sectionStyles]: [string, any]) => {
      cssRules.push(`
        .template-${templateId} .section-${section} {
          ${Object.entries(sectionStyles)
            .map(([prop, value]) => `${kebabCase(prop)}: ${value};`)
            .join('\n          ')}
        }
      `);
    });
  }
  
  return cssRules.join('\n\n');
}

/**
 * Apply customizations to CSS
 */
function applyCustomizations(baseCSS: string, customizations: any): string {
  let customizedCSS = baseCSS;
  
  if (customizations) {
    Object.entries(customizations).forEach(([selector, styles]: [string, any]) => {
      const customRule = `
        ${selector} {
          ${Object.entries(styles)
            .map(([prop, value]) => `${kebabCase(prop)}: ${value};`)
            .join('\n          ')}
        }
      `;
      customizedCSS += '\n\n' + customRule;
    });
  }
  
  return customizedCSS;
}

/**
 * Optimize CSS by removing redundancy and minifying
 */
function optimizeCSS(css: string): string {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove whitespace around braces and semicolons
    .replace(/\s*{\s*/g, '{')
    .replace(/;\s*}/g, '}')
    .replace(/;\s*/g, ';')
    // Remove trailing semicolons before closing braces
    .replace(/;\s*}/g, '}')
    .trim();
}

/**
 * Process template data
 */
function processTemplateData(cvData: any): any {
  // Deep clone to avoid mutations
  const processed = JSON.parse(JSON.stringify(cvData));
  
  // Sanitize HTML content
  if (processed.experience) {
    processed.experience = processed.experience.map((exp: any) => ({
      ...exp,
      description: sanitizeHTML(exp.description || '')
    }));
  }
  
  if (processed.education) {
    processed.education = processed.education.map((edu: any) => ({
      ...edu,
      description: sanitizeHTML(edu.description || '')
    }));
  }
  
  return processed;
}

/**
 * Generate HTML structure from template and data
 */
function generateHTMLStructure(template: any, data: any): string {
  const sections: string[] = [];
  
  // Header section
  sections.push(generateHeaderSection(data));
  
  // Experience section
  if (data.experience && data.experience.length > 0) {
    sections.push(generateExperienceSection(data.experience));
  }
  
  // Education section
  if (data.education && data.education.length > 0) {
    sections.push(generateEducationSection(data.education));
  }
  
  // Skills section
  if (data.skills && data.skills.length > 0) {
    sections.push(generateSkillsSection(data.skills));
  }
  
  return `
    <div class="template-${template.id} cv-template">
      ${sections.join('\n      ')}
    </div>
  `;
}

/**
 * Generate header section HTML
 */
function generateHeaderSection(data: any): string {
  return `
    <div class="section-header">
      <h1 class="name">${escapeHTML(data.name || '')}</h1>
      <div class="contact-info">
        ${data.email ? `<span class="email">${escapeHTML(data.email)}</span>` : ''}
        ${data.phone ? `<span class="phone">${escapeHTML(data.phone)}</span>` : ''}
        ${data.location ? `<span class="location">${escapeHTML(data.location)}</span>` : ''}
      </div>
      ${data.summary ? `<div class="summary">${escapeHTML(data.summary)}</div>` : ''}
    </div>
  `;
}

/**
 * Generate experience section HTML
 */
function generateExperienceSection(experience: any[]): string {
  const items = experience.map(exp => `
    <div class="experience-item">
      <h3 class="position">${escapeHTML(exp.position || '')}</h3>
      <div class="company">${escapeHTML(exp.company || '')}</div>
      <div class="duration">${escapeHTML(exp.startDate || '')} - ${escapeHTML(exp.endDate || 'Present')}</div>
      ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
    </div>
  `).join('\n    ');
  
  return `
    <div class="section-experience">
      <h2 class="section-title">Experience</h2>
      <div class="experience-list">
        ${items}
      </div>
    </div>
  `;
}

/**
 * Generate education section HTML
 */
function generateEducationSection(education: any[]): string {
  const items = education.map(edu => `
    <div class="education-item">
      <h3 class="degree">${escapeHTML(edu.degree || '')}</h3>
      <div class="institution">${escapeHTML(edu.institution || '')}</div>
      <div class="duration">${escapeHTML(edu.startDate || '')} - ${escapeHTML(edu.endDate || '')}</div>
      ${edu.gpa ? `<div class="gpa">GPA: ${escapeHTML(edu.gpa)}</div>` : ''}
    </div>
  `).join('\n    ');
  
  return `
    <div class="section-education">
      <h2 class="section-title">Education</h2>
      <div class="education-list">
        ${items}
      </div>
    </div>
  `;
}

/**
 * Generate skills section HTML
 */
function generateSkillsSection(skills: any[]): string {
  const items = skills.map(skill => `
    <span class="skill-item">${escapeHTML(skill.name || skill)}</span>
  `).join('\n    ');
  
  return `
    <div class="section-skills">
      <h2 class="section-title">Skills</h2>
      <div class="skills-list">
        ${items}
      </div>
    </div>
  `;
}

/**
 * Apply template styles to HTML
 */
function applyTemplateStyles(html: string, styles: any): string {
  // In a real implementation, this would apply inline styles or generate CSS
  // For now, just return the HTML with style classes
  return html;
}

/**
 * Optimize HTML by removing unnecessary whitespace and comments
 */
function optimizeHTML(html: string): string {
  return html
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove extra whitespace between tags
    .replace(/>\s+</g, '><')
    // Remove leading/trailing whitespace
    .trim();
}

/**
 * Compress HTML using simple compression
 */
function compressHTML(html: string): string {
  // Simple compression - in production, use proper compression algorithms
  return html
    .replace(/\s{2,}/g, ' ')
    .replace(/\n\s*/g, '')
    .trim();
}

/**
 * Compress data using JSON compression
 */
function compressData(data: any): string {
  // Simple JSON minification
  return JSON.stringify(data);
}

/**
 * Sanitize HTML content
 */
function sanitizeHTML(html: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Escape HTML entities
 */
function escapeHTML(text: string): string {
  const div = new DOMParser().parseFromString(`<div>${text}</div>`, 'text/html');
  return div.body.textContent || '';
}

/**
 * Convert camelCase to kebab-case
 */
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Send success response
 */
function sendSuccess(id: string, data: any): void {
  const response: WorkerResponse = {
    id,
    type: 'success',
    data
  };
  self.postMessage(response);
}

/**
 * Send error response
 */
function sendError(id: string, error: string): void {
  const response: WorkerResponse = {
    id,
    type: 'error',
    error
  };
  self.postMessage(response);
}

/**
 * Send progress update
 */
function sendProgress(id: string, progress: number): void {
  const response: WorkerResponse = {
    id,
    type: 'progress',
    progress
  };
  self.postMessage(response);
}