/**
 * CSS Optimization Service
 *
 * Provides CSS minification, deduplication, and optimization for
 * HTML fragments generated during the CV enhancement process.
 *
 * @author Gil Klainert
 * @version 3.0.0 - Migrated to Enhancements Module
  */

export interface CSSOptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  removedRules: number;
  duplicatesRemoved: number;
  optimizedCSS: string;
  analysis: {
    selectors: number;
    properties: number;
    mediaQueries: number;
    keyframes: number;
    unusedSelectors?: string[];
  };
}

export interface CSSOptimizationOptions {
  minify: boolean;
  removeDuplicates: boolean;
  removeUnused: boolean;
  optimizeColors: boolean;
  optimizeUnits: boolean;
  mergeMediaQueries: boolean;
  preserveComments: boolean;
  usedSelectors?: string[];
}

export class CSSOptimizerService {
  private globalCSS: Set<string> = new Set();
  private duplicateSelectors: Map<string, string> = new Map();
  private cssStats: Map<string, CSSOptimizationResult> = new Map();

  /**
   * Optimize CSS from HTML fragments
    */
  optimizeFragmentCSS(
    htmlFragment: string,
    featureId: string,
    options: Partial<CSSOptimizationOptions> = {}
  ): CSSOptimizationResult {
    const defaultOptions: CSSOptimizationOptions = {
      minify: true,
      removeDuplicates: true,
      removeUnused: false, // Keep false for fragments as we can't know all usage
      optimizeColors: true,
      optimizeUnits: true,
      mergeMediaQueries: true,
      preserveComments: false
    };

    const config = { ...defaultOptions, ...options };

    try {
      // Extract CSS from HTML fragment
      const extractedCSS = this.extractCSSFromHTML(htmlFragment);
      if (!extractedCSS) {
        return this.createEmptyResult();
      }

      const originalSize = extractedCSS.length;
      let optimizedCSS = extractedCSS;

      // Track original selectors for analysis
      const originalAnalysis = this.analyzeCSS(extractedCSS);

      // Step 1: Remove duplicates against global CSS
      if (config.removeDuplicates) {
        optimizedCSS = this.removeDuplicateRules(optimizedCSS, featureId);
      }

      // Step 2: Optimize colors
      if (config.optimizeColors) {
        optimizedCSS = this.optimizeColors(optimizedCSS);
      }

      // Step 3: Optimize units
      if (config.optimizeUnits) {
        optimizedCSS = this.optimizeUnits(optimizedCSS);
      }

      // Step 4: Merge media queries
      if (config.mergeMediaQueries) {
        optimizedCSS = this.mergeMediaQueries(optimizedCSS);
      }

      // Step 5: Remove comments (if not preserving)
      if (!config.preserveComments) {
        optimizedCSS = this.removeComments(optimizedCSS);
      }

      // Step 6: Minify CSS
      if (config.minify) {
        optimizedCSS = this.minifyCSS(optimizedCSS);
      }

      // Update global CSS tracking
      this.updateGlobalCSS(optimizedCSS);

      const optimizedSize = optimizedCSS.length;
      const finalAnalysis = this.analyzeCSS(optimizedCSS);

      const result: CSSOptimizationResult = {
        originalSize,
        optimizedSize,
        compressionRatio: originalSize > 0 ? (originalSize - optimizedSize) / originalSize : 0,
        removedRules: originalAnalysis.selectors - finalAnalysis.selectors,
        duplicatesRemoved: this.duplicateSelectors.size,
        optimizedCSS,
        analysis: finalAnalysis
      };

      this.cssStats.set(featureId, result);
      return result;

    } catch (error) {
      console.error(`❌ Error optimizing CSS for ${featureId}:`, error);
      return this.createEmptyResult();
    }
  }

  /**
   * Extract CSS from HTML fragment
    */
  private extractCSSFromHTML(html: string): string | null {
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const matches = html.match(styleRegex);

    if (!matches) return null;

    return matches
      .map(match => match.replace(/<\/?style[^>]*>/gi, ''))
      .join('\n');
  }

  /**
   * Remove duplicate CSS rules
    */
  private removeDuplicateRules(css: string, featureId: string): string {
    const rules = this.parseCSS(css);
    const uniqueRules: string[] = [];
    const seenSelectors = new Set<string>();

    for (const rule of rules) {
      const selector = this.extractSelector(rule);
      if (!selector) continue;

      // Check against global CSS
      if (this.globalCSS.has(selector)) {
        this.duplicateSelectors.set(selector, featureId);
        continue;
      }

      // Check against current fragment
      if (seenSelectors.has(selector)) {
        this.duplicateSelectors.set(selector, featureId);
        continue;
      }

      seenSelectors.add(selector);
      uniqueRules.push(rule);
    }

    return uniqueRules.join('\n');
  }

  /**
   * Parse CSS into individual rules
    */
  private parseCSS(css: string): string[] {
    // Simple CSS rule splitting (handles most cases)
    const rules = css.split('}').filter(rule => rule.trim());
    return rules.map(rule => rule.trim() + '}');
  }

  /**
   * Extract selector from CSS rule
    */
  private extractSelector(rule: string): string | null {
    const match = rule.match(/^([^{]+){/);
    return match ? match[1].trim() : null;
  }

  /**
   * Optimize color values
    */
  private optimizeColors(css: string): string {
    return css
      // Convert rgb to hex
      .replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
        const hex = (n: number) => n.toString(16).padStart(2, '0');
        return `#${hex(parseInt(r))}${hex(parseInt(g))}${hex(parseInt(b))}`;
      })
      // Shorten hex colors
      .replace(/#([a-f0-9])\1([a-f0-9])\2([a-f0-9])\3/gi, '#$1$2$3')
      // Convert named colors to hex (common ones)
      .replace(/\bwhite\b/g, '#fff')
      .replace(/\bblack\b/g, '#000')
      .replace(/\bred\b/g, '#f00')
      .replace(/\bgreen\b/g, '#008000')
      .replace(/\bblue\b/g, '#00f');
  }

  /**
   * Optimize unit values
    */
  private optimizeUnits(css: string): string {
    return css
      // Remove unnecessary zeros
      .replace(/(\d)\.0+(px|em|rem|%|vh|vw|pt)/g, '$1$2')
      .replace(/0\.(\d+)/g, '.$1')
      // Convert 0px to 0
      .replace(/\b0(px|em|rem|%|vh|vw|pt)\b/g, '0')
      // Optimize margin/padding shorthands
      .replace(/(\w+):\s*(\d+\w*)\s+\2\s+\2\s+\2/g, '$1: $2')
      .replace(/(\w+):\s*(\d+\w*)\s+(\d+\w*)\s+\2\s+\3/g, '$1: $2 $3');
  }

  /**
   * Merge duplicate media queries
    */
  private mergeMediaQueries(css: string): string {
    const mediaQueries: Map<string, string[]> = new Map();
    const nonMediaCSS: string[] = [];

    // Split CSS into media queries and regular rules
    const mediaRegex = /@media\s+([^{]+)\s*\{([\s\S]*?)\}\s*\}/gi;
    let lastIndex = 0;
    let match;

    while ((match = mediaRegex.exec(css)) !== null) {
      // Add non-media CSS before this match
      nonMediaCSS.push(css.substring(lastIndex, match.index));

      const mediaQuery = match[1].trim();
      const rules = match[2].trim();

      if (!mediaQueries.has(mediaQuery)) {
        mediaQueries.set(mediaQuery, []);
      }
      mediaQueries.get(mediaQuery)!.push(rules);

      lastIndex = match.index + match[0].length;
    }

    // Add remaining non-media CSS
    nonMediaCSS.push(css.substring(lastIndex));

    // Reconstruct CSS with merged media queries
    let result = nonMediaCSS.join('').trim();

    for (const [query, rules] of mediaQueries) {
      result += `\n@media ${query} {\n${rules.join('\n')}\n}`;
    }

    return result;
  }

  /**
   * Remove CSS comments
    */
  private removeComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  /**
   * Minify CSS
    */
  private minifyCSS(css: string): string {
    return css
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove spaces around certain characters
      .replace(/\s*([{}:;,>+~])\s*/g, '$1')
      // Remove trailing semicolons
      .replace(/;}/g, '}')
      // Remove empty rules
      .replace(/[^}]+\{\s*\}/g, '')
      .trim();
  }

  /**
   * Analyze CSS structure
    */
  private analyzeCSS(css: string): CSSOptimizationResult['analysis'] {
    const selectors = (css.match(/[^{}]+(?=\s*\{)/g) || []).length;
    const properties = (css.match(/[^{}:]+:/g) || []).length;
    const mediaQueries = (css.match(/@media[^{]+\{/g) || []).length;
    const keyframes = (css.match(/@keyframes[^{]+\{/g) || []).length;

    return {
      selectors,
      properties,
      mediaQueries,
      keyframes
    };
  }

  /**
   * Update global CSS tracking
    */
  private updateGlobalCSS(css: string): void {
    const rules = this.parseCSS(css);
    for (const rule of rules) {
      const selector = this.extractSelector(rule);
      if (selector) {
        this.globalCSS.add(selector);
      }
    }
  }

  /**
   * Create empty optimization result
    */
  private createEmptyResult(): CSSOptimizationResult {
    return {
      originalSize: 0,
      optimizedSize: 0,
      compressionRatio: 0,
      removedRules: 0,
      duplicatesRemoved: 0,
      optimizedCSS: '',
      analysis: {
        selectors: 0,
        properties: 0,
        mediaQueries: 0,
        keyframes: 0
      }
    };
  }

  /**
   * Optimize complete HTML fragment (CSS + content)
    */
  optimizeHTMLFragment(
    htmlFragment: string,
    featureId: string,
    options: Partial<CSSOptimizationOptions> = {}
  ): string {
    try {
      const cssResult = this.optimizeFragmentCSS(htmlFragment, featureId, options);

      if (!cssResult.optimizedCSS) {
        return htmlFragment; // No CSS to optimize
      }

      // Replace original CSS with optimized version
      return htmlFragment.replace(
        /<style[^>]*>[\s\S]*?<\/style>/gi,
        `<style>${cssResult.optimizedCSS}</style>`
      );
    } catch (error) {
      console.error(`❌ Error optimizing HTML fragment for ${featureId}:`, error);
      return htmlFragment;
    }
  }

  /**
   * Get CSS optimization statistics
    */
  getCSSStatistics(): Map<string, CSSOptimizationResult> {
    return new Map(this.cssStats);
  }

  /**
   * Get overall optimization summary
    */
  getOptimizationSummary(): {
    totalFeatures: number;
    totalOriginalSize: number;
    totalOptimizedSize: number;
    overallCompressionRatio: number;
    totalDuplicatesRemoved: number;
    averageCompressionRatio: number;
  } {
    const stats = Array.from(this.cssStats.values());

    const totalOriginalSize = stats.reduce((sum, stat) => sum + stat.originalSize, 0);
    const totalOptimizedSize = stats.reduce((sum, stat) => sum + stat.optimizedSize, 0);
    const totalDuplicatesRemoved = stats.reduce((sum, stat) => sum + stat.duplicatesRemoved, 0);

    const overallCompressionRatio = totalOriginalSize > 0
      ? (totalOriginalSize - totalOptimizedSize) / totalOriginalSize
      : 0;

    const averageCompressionRatio = stats.length > 0
      ? stats.reduce((sum, stat) => sum + stat.compressionRatio, 0) / stats.length
      : 0;

    return {
      totalFeatures: stats.length,
      totalOriginalSize,
      totalOptimizedSize,
      overallCompressionRatio,
      totalDuplicatesRemoved,
      averageCompressionRatio
    };
  }

  /**
   * Generate critical CSS for above-the-fold content
    */
  generateCriticalCSS(htmlFragments: string[]): string {
    const criticalSelectors = new Set<string>();
    const aboveFoldElements = ['header', 'nav', '.hero', '.banner', '.top-section'];

    for (const fragment of htmlFragments) {
      const css = this.extractCSSFromHTML(fragment);
      if (!css) continue;

      const rules = this.parseCSS(css);
      for (const rule of rules) {
        const selector = this.extractSelector(rule);
        if (!selector) continue;

        // Check if selector targets above-the-fold elements
        if (aboveFoldElements.some(element => selector.includes(element))) {
          criticalSelectors.add(rule);
        }
      }
    }

    return Array.from(criticalSelectors).join('\n');
  }

  /**
   * Clear optimization cache
    */
  clearCache(): void {
    this.globalCSS.clear();
    this.duplicateSelectors.clear();
    this.cssStats.clear();
    console.warn('🧹 CSS optimization cache cleared');
  }

  /**
   * Export optimization report
    */
  exportOptimizationReport(): {
    summary: ReturnType<CSSOptimizerService['getOptimizationSummary']>;
    featureDetails: Array<{ featureId: string; result: CSSOptimizationResult }>;
    recommendations: string[];
  } {
    const summary = this.getOptimizationSummary();
    const featureDetails = Array.from(this.cssStats.entries()).map(([featureId, result]) => ({
      featureId,
      result
    }));

    const recommendations: string[] = [];

    if (summary.overallCompressionRatio < 0.3) {
      recommendations.push('Consider enabling more aggressive CSS optimization options');
    }

    if (summary.totalDuplicatesRemoved > summary.totalFeatures * 2) {
      recommendations.push('High number of duplicate CSS rules detected - review common styles');
    }

    if (summary.averageCompressionRatio > 0.7) {
      recommendations.push('Excellent CSS optimization ratio achieved');
    }

    return {
      summary,
      featureDetails,
      recommendations
    };
  }
}

export const cssOptimizerService = new CSSOptimizerService();