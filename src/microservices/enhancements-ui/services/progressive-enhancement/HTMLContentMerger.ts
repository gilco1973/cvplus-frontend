/**
 * HTML Content Merger Service
 * Handles merging of HTML fragments into base CV content
 */

export interface MergeOptions {
  preserveStyles?: boolean;
  mergeScripts?: boolean;
  wrapFragments?: boolean;
  insertPosition?: 'append' | 'prepend' | 'placeholder';
  placeholder?: string;
}

export class HTMLContentMerger {
  /**
   * Merge HTML fragment into base HTML content
   */
  static mergeFragment(
    baseHtml: string,
    fragmentHtml: string,
    featureId: string,
    options: MergeOptions = {}
  ): string {
    const {
      preserveStyles = true,
      mergeScripts = true,
      wrapFragments = true,
      insertPosition = 'append',
      placeholder
    } = options;

    try {
      if (!fragmentHtml?.trim()) {
        return baseHtml;
      }

      // Parse fragments to extract scripts and styles
      const parsedFragment = this.parseFragment(fragmentHtml);
      
      let mergedHtml = baseHtml;

      // Handle placeholder-based insertion
      if (insertPosition === 'placeholder' && placeholder) {
        const placeholderRegex = new RegExp(
          `<!--\s*${placeholder}\s*-->|<div[^>]*data-placeholder=["']${placeholder}["'][^>]*></div>`,
          'i'
        );
        
        if (placeholderRegex.test(mergedHtml)) {
          const wrappedContent = wrapFragments 
            ? this.wrapFragment(parsedFragment.content, featureId)
            : parsedFragment.content;
          
          mergedHtml = mergedHtml.replace(placeholderRegex, wrappedContent);
        } else {
          console.warn(`Placeholder ${placeholder} not found, falling back to append`);
          mergedHtml = this.appendToBody(mergedHtml, parsedFragment.content, featureId, wrapFragments);
        }
      }
      // Handle append/prepend to body
      else if (insertPosition === 'append') {
        mergedHtml = this.appendToBody(mergedHtml, parsedFragment.content, featureId, wrapFragments);
      } else if (insertPosition === 'prepend') {
        mergedHtml = this.prependToBody(mergedHtml, parsedFragment.content, featureId, wrapFragments);
      }

      // Merge styles if enabled
      if (preserveStyles && parsedFragment.styles.length > 0) {
        mergedHtml = this.mergeStyles(mergedHtml, parsedFragment.styles);
      }

      // Merge scripts if enabled
      if (mergeScripts && parsedFragment.scripts.length > 0) {
        mergedHtml = this.mergeScripts(mergedHtml, parsedFragment.scripts);
      }

      return mergedHtml;
    } catch (error) {
      console.error(`Error merging fragment for feature ${featureId}:`, error);
      return baseHtml; // Return original if merge fails
    }
  }

  /**
   * Parse HTML fragment to extract content, styles, and scripts
   */
  private static parseFragment(fragmentHtml: string): {
    content: string;
    styles: string[];
    scripts: string[];
  } {
    const styles: string[] = [];
    const scripts: string[] = [];
    let content = fragmentHtml;

    // Extract styles
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let styleMatch;
    while ((styleMatch = styleRegex.exec(fragmentHtml)) !== null) {
      styles.push(styleMatch[1]);
      content = content.replace(styleMatch[0], '');
    }

    // Extract scripts
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    while ((scriptMatch = scriptRegex.exec(fragmentHtml)) !== null) {
      scripts.push(scriptMatch[1]);
      content = content.replace(scriptMatch[0], '');
    }

    // Clean up extra whitespace
    content = content.trim();

    return { content, styles, scripts };
  }

  /**
   * Wrap fragment content in a container
   */
  private static wrapFragment(content: string, featureId: string): string {
    return `
<div class="progressive-feature progressive-feature--${featureId}" data-feature-id="${featureId}">
${content}
</div>
`;
  }

  /**
   * Append content to body
   */
  private static appendToBody(
    html: string, 
    content: string, 
    featureId: string, 
    wrap: boolean
  ): string {
    const bodyCloseIndex = html.lastIndexOf('</body>');
    
    if (bodyCloseIndex === -1) {
      // No body tag found, append to end
      return html + '\n' + (wrap ? this.wrapFragment(content, featureId) : content);
    }

    const beforeBody = html.substring(0, bodyCloseIndex);
    const afterBody = html.substring(bodyCloseIndex);
    const wrappedContent = wrap ? this.wrapFragment(content, featureId) : content;

    return beforeBody + wrappedContent + '\n' + afterBody;
  }

  /**
   * Prepend content to body
   */
  private static prependToBody(
    html: string, 
    content: string, 
    featureId: string, 
    wrap: boolean
  ): string {
    const bodyOpenIndex = html.indexOf('>');
    const bodyStartIndex = html.indexOf('<body');
    
    if (bodyStartIndex === -1) {
      // No body tag found, prepend to beginning
      return (wrap ? this.wrapFragment(content, featureId) : content) + '\n' + html;
    }

    const insertIndex = html.indexOf('>', bodyStartIndex) + 1;
    const beforeInsert = html.substring(0, insertIndex);
    const afterInsert = html.substring(insertIndex);
    const wrappedContent = wrap ? this.wrapFragment(content, featureId) : content;

    return beforeInsert + '\n' + wrappedContent + afterInsert;
  }

  /**
   * Merge styles into head section
   */
  private static mergeStyles(html: string, styles: string[]): string {
    if (styles.length === 0) return html;

    const headCloseIndex = html.indexOf('</head>');
    if (headCloseIndex === -1) {
      console.warn('No head section found, skipping style merge');
      return html;
    }

    const styleContent = styles.map(style => `<style>\n${style}\n</style>`).join('\n');
    
    const beforeHead = html.substring(0, headCloseIndex);
    const afterHead = html.substring(headCloseIndex);

    return beforeHead + styleContent + '\n' + afterHead;
  }

  /**
   * Merge scripts before closing body tag
   */
  private static mergeScripts(html: string, scripts: string[]): string {
    if (scripts.length === 0) return html;

    const bodyCloseIndex = html.lastIndexOf('</body>');
    if (bodyCloseIndex === -1) {
      console.warn('No body section found, appending scripts to end');
      const scriptContent = scripts.map(script => `<script>\n${script}\n</script>`).join('\n');
      return html + '\n' + scriptContent;
    }

    const scriptContent = scripts.map(script => `<script>\n${script}\n</script>`).join('\n');
    
    const beforeBody = html.substring(0, bodyCloseIndex);
    const afterBody = html.substring(bodyCloseIndex);

    return beforeBody + scriptContent + '\n' + afterBody;
  }

  /**
   * Remove feature from HTML
   */
  static removeFeature(html: string, featureId: string): string {
    try {
      // Remove wrapped feature containers
      const containerRegex = new RegExp(
        `<div[^>]*class="[^"]*progressive-feature[^>]*data-feature-id="${featureId}"[^>]*>[\s\S]*?</div>`,
        'gi'
      );
      
      return html.replace(containerRegex, '');
    } catch (error) {
      console.error(`Error removing feature ${featureId}:`, error);
      return html;
    }
  }

  /**
   * Get list of features present in HTML
   */
  static getEmbeddedFeatures(html: string): string[] {
    const features: string[] = [];
    const featureRegex = /data-feature-id="([^"]+)"/gi;
    
    let match;
    while ((match = featureRegex.exec(html)) !== null) {
      features.push(match[1]);
    }
    
    return Array.from(new Set(features)); // Remove duplicates
  }

  /**
   * Validate HTML structure
   */
  static validateHTML(html: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Basic structure checks
    if (!html.includes('<html')) {
      errors.push('Missing HTML tag');
    }
    
    if (!html.includes('<head')) {
      errors.push('Missing HEAD section');
    }
    
    if (!html.includes('<body')) {
      errors.push('Missing BODY section');
    }
    
    // Check for unclosed tags (basic check)
    const openTags = (html.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (html.match(/<\/[^>]*>/g) || []).length;
    
    if (Math.abs(openTags - closeTags) > 5) { // Allow some tolerance
      errors.push('Potential unclosed tags detected');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Optimize merged HTML
   */
  static optimize(html: string): string {
    try {
      // Remove empty progressive feature containers
      html = html.replace(
        /<div[^>]*class="[^"]*progressive-feature[^>]*data-feature-id="[^"]+"[^>]*>\s*<\/div>/gi,
        ''
      );
      
      // Clean up excessive whitespace
      html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      // Remove duplicate scripts (basic check)
      const scriptBlocks = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
      const uniqueScripts = Array.from(new Set(scriptBlocks));
      
      if (scriptBlocks.length !== uniqueScripts.length) {
        console.warn('Removed duplicate scripts');
        // Remove all scripts and re-add unique ones
        const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        const bodyCloseIndex = cleanHtml.lastIndexOf('</body>');
        
        if (bodyCloseIndex !== -1) {
          const beforeBody = cleanHtml.substring(0, bodyCloseIndex);
          const afterBody = cleanHtml.substring(bodyCloseIndex);
          html = beforeBody + uniqueScripts.join('\n') + '\n' + afterBody;
        }
      }
      
      return html;
    } catch (error) {
      console.error('Error optimizing HTML:', error);
      return html;
    }
  }
}

export default HTMLContentMerger;