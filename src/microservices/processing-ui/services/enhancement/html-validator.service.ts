/**
 * HTML Validation Service
 * 
 * Provides comprehensive HTML validation including semantic structure,
 * accessibility compliance, cross-browser compatibility, and performance impact.
 */

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: string[];
  accessibility: AccessibilityResult;
  performance: PerformanceResult;
  semantics: SemanticResult;
}

export interface ValidationError {
  type: 'syntax' | 'semantic' | 'accessibility' | 'performance';
  severity: 'critical' | 'major' | 'minor';
  message: string;
  element?: string;
  line?: number;
  column?: number;
  rule?: string;
}

export interface ValidationWarning {
  type: 'best-practice' | 'compatibility' | 'optimization';
  message: string;
  element?: string;
  suggestion?: string;
}

export interface AccessibilityResult {
  wcagLevel: 'A' | 'AA' | 'AAA' | 'fail';
  score: number;
  issues: {
    missingAlt: number;
    lowContrast: number;
    missingLabels: number;
    keyboardInaccessible: number;
    missingHeadings: number;
  };
  recommendations: string[];
}

export interface PerformanceResult {
  score: number;
  metrics: {
    domComplexity: number;
    cssComplexity: number;
    imageOptimization: number;
    criticalResources: number;
  };
  suggestions: string[];
}

export interface SemanticResult {
  score: number;
  structure: {
    hasDoctype: boolean;
    hasLang: boolean;
    hasViewport: boolean;
    hasTitle: boolean;
    properHeadingOrder: boolean;
    semanticElements: number;
  };
  issues: string[];
}

export interface ValidationOptions {
  checkAccessibility: boolean;
  checkPerformance: boolean;
  checkSemantics: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
  strictMode: boolean;
  customRules: CustomRule[];
}

export interface CustomRule {
  name: string;
  selector: string;
  message: string;
  severity: 'error' | 'warning';
  test: (element: Element) => boolean;
}

export class HTMLValidatorService {
  private parser: DOMParser;
  private validationCache: Map<string, ValidationResult> = new Map();

  constructor() {
    this.parser = new DOMParser();
  }

  /**
   * Validate HTML fragment
   */
  validateHTML(
    html: string,
    featureId: string,
    options: Partial<ValidationOptions> = {}
  ): ValidationResult {
    const defaultOptions: ValidationOptions = {
      checkAccessibility: true,
      checkPerformance: true,
      checkSemantics: true,
      wcagLevel: 'AA',
      strictMode: false,
      customRules: []
    };

    const config = { ...defaultOptions, ...options };

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(html, config);
      if (this.validationCache.has(cacheKey)) {
        return this.validationCache.get(cacheKey)!;
      }

      // Parse HTML
      const doc = this.parseHTML(html);
      if (!doc) {
        return this.createErrorResult('Failed to parse HTML');
      }

      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      const recommendations: string[] = [];

      // Basic syntax validation
      this.validateSyntax(html, errors);

      // Semantic validation
      const semantics = config.checkSemantics 
        ? this.validateSemantics(doc, errors, warnings)
        : this.createEmptySemanticResult();

      // Accessibility validation
      const accessibility = config.checkAccessibility 
        ? this.validateAccessibility(doc, config.wcagLevel, errors, warnings)
        : this.createEmptyAccessibilityResult();

      // Performance validation
      const performance = config.checkPerformance 
        ? this.validatePerformance(doc, html, errors, warnings)
        : this.createEmptyPerformanceResult();

      // Custom rules validation
      if (config.customRules.length > 0) {
        this.validateCustomRules(doc, config.customRules, errors, warnings);
      }

      // Generate recommendations
      this.generateRecommendations(
        recommendations, 
        semantics, 
        accessibility, 
        performance, 
        errors, 
        warnings
      );

      // Calculate overall score
      const score = this.calculateOverallScore(semantics, accessibility, performance, errors.length);

      const result: ValidationResult = {
        isValid: errors.filter(e => e.severity === 'critical').length === 0,
        score,
        errors,
        warnings,
        recommendations,
        accessibility,
        performance,
        semantics
      };

      // Cache result
      this.validationCache.set(cacheKey, result);

      console.warn(`✅ HTML validation completed for ${featureId}: ${score}/100`);
      return result;

    } catch (error) {
      console.error(`❌ Error validating HTML for ${featureId}:`, error);
      return this.createErrorResult('Validation failed due to internal error');
    }
  }

  /**
   * Parse HTML string into document
   */
  private parseHTML(html: string): Document | null {
    try {
      // Wrap fragment in a complete HTML structure for validation
      const wrappedHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${html}</body></html>`;
      const doc = this.parser.parseFromString(wrappedHTML, 'text/html');
      
      // Check for parser errors
      const parserErrors = doc.querySelectorAll('parsererror');
      if (parserErrors.length > 0) {
        return null;
      }
      
      return doc;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate HTML syntax
   */
  private validateSyntax(html: string, errors: ValidationError[]): void {
    // Check for unclosed tags
    const openTags = html.match(/<[^/!][^>]*>/g) || [];
    const closeTags = html.match(/<\/[^>]*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      errors.push({
        type: 'syntax',
        severity: 'major',
        message: 'Mismatched opening and closing tags detected',
        rule: 'syntax-balanced-tags'
      });
    }

    // Check for common syntax errors
    if (html.includes('< ') || html.includes(' >')) {
      errors.push({
        type: 'syntax',
        severity: 'minor',
        message: 'Malformed HTML tags with extra spaces',
        rule: 'syntax-tag-spacing'
      });
    }

    // Check for unescaped characters
    const unescapedChars = html.match(/[&<>"](?![amp|lt|gt|quot];)/g);
    if (unescapedChars && unescapedChars.length > 0) {
      errors.push({
        type: 'syntax',
        severity: 'minor',
        message: 'Unescaped HTML characters found',
        rule: 'syntax-escaped-chars'
      });
    }
  }

  /**
   * Validate semantic HTML structure
   */
  private validateSemantics(
    doc: Document, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): SemanticResult {
    const body = doc.body;
    
    const structure = {
      hasDoctype: !!doc.doctype,
      hasLang: !!doc.documentElement.getAttribute('lang'),
      hasViewport: !!doc.querySelector('meta[name="viewport"]'),
      hasTitle: !!doc.querySelector('title'),
      properHeadingOrder: this.validateHeadingOrder(body),
      semanticElements: this.countSemanticElements(body)
    };

    const issues: string[] = [];

    if (!structure.hasLang) {
      issues.push('Missing lang attribute on html element');
      errors.push({
        type: 'semantic',
        severity: 'major',
        message: 'HTML element missing lang attribute',
        element: 'html',
        rule: 'semantic-lang-attribute'
      });
    }

    if (!structure.properHeadingOrder) {
      issues.push('Improper heading hierarchy detected');
      warnings.push({
        type: 'best-practice',
        message: 'Heading levels should be used in sequential order',
        suggestion: 'Ensure h1 comes before h2, h2 before h3, etc.'
      });
    }

    if (structure.semanticElements === 0) {
      issues.push('No semantic HTML5 elements found');
      warnings.push({
        type: 'best-practice',
        message: 'Consider using semantic HTML5 elements',
        suggestion: 'Use elements like <article>, <section>, <nav>, <aside>, etc.'
      });
    }

    // Check for div soup
    const divs = body.querySelectorAll('div').length;
    const semanticRatio = structure.semanticElements / (divs + structure.semanticElements || 1);
    
    if (semanticRatio < 0.3 && divs > 5) {
      warnings.push({
        type: 'best-practice',
        message: 'High ratio of div elements to semantic elements',
        suggestion: 'Replace generic divs with semantic HTML5 elements where appropriate'
      });
    }

    const score = this.calculateSemanticScore(structure, issues.length);

    return {
      score,
      structure,
      issues
    };
  }

  /**
   * Validate accessibility compliance
   */
  private validateAccessibility(
    doc: Document,
    wcagLevel: 'A' | 'AA' | 'AAA',
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): AccessibilityResult {
    const body = doc.body;
    
    const issues = {
      missingAlt: 0,
      lowContrast: 0,
      missingLabels: 0,
      keyboardInaccessible: 0,
      missingHeadings: 0
    };

    const recommendations: string[] = [];

    // Check images for alt text
    const images = body.querySelectorAll('img');
    images.forEach(img => {
      if (!img.getAttribute('alt')) {
        issues.missingAlt++;
        errors.push({
          type: 'accessibility',
          severity: 'major',
          message: 'Image missing alt attribute',
          element: 'img',
          rule: 'wcag-img-alt'
        });
      }
    });

    // Check form elements for labels
    const inputs = body.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!id || (!doc.querySelector(`label[for="${id}"]`) && !ariaLabel && !ariaLabelledBy)) {
        issues.missingLabels++;
        errors.push({
          type: 'accessibility',
          severity: 'major',
          message: 'Form element missing associated label',
          element: input.tagName.toLowerCase(),
          rule: 'wcag-form-labels'
        });
      }
    });

    // Check for keyboard accessibility
    const focusableElements = body.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    focusableElements.forEach(element => {
      if (element.getAttribute('tabindex') === '-1' && !element.hasAttribute('aria-hidden')) {
        issues.keyboardInaccessible++;
        warnings.push({
          type: 'best-practice',
          message: 'Element with tabindex="-1" may not be keyboard accessible',
          element: element.tagName.toLowerCase(),
          suggestion: 'Ensure element is accessible via keyboard navigation'
        });
      }
    });

    // Check heading structure
    const headings = body.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.missingHeadings++;
      warnings.push({
        type: 'best-practice',
        message: 'No heading elements found',
        suggestion: 'Add appropriate heading structure for better accessibility'
      });
    }

    // Generate accessibility recommendations
    if (issues.missingAlt > 0) {
      recommendations.push(`Add alt attributes to ${issues.missingAlt} images`);
    }
    if (issues.missingLabels > 0) {
      recommendations.push(`Associate labels with ${issues.missingLabels} form elements`);
    }
    if (issues.missingHeadings > 0) {
      recommendations.push('Add heading structure for better content organization');
    }

    const totalIssues = Object.values(issues).reduce((sum, count) => sum + count, 0);
    const score = Math.max(0, 100 - (totalIssues * 15));
    
    let wcagLevelAchieved: AccessibilityResult['wcagLevel'] = 'fail';
    if (score >= 95) wcagLevelAchieved = 'AAA';
    else if (score >= 85) wcagLevelAchieved = 'AA';
    else if (score >= 70) wcagLevelAchieved = 'A';

    return {
      wcagLevel: wcagLevelAchieved,
      score,
      issues,
      recommendations
    };
  }

  /**
   * Validate performance characteristics
   */
  private validatePerformance(
    doc: Document,
    html: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): PerformanceResult {
    const body = doc.body;
    
    const metrics = {
      domComplexity: this.calculateDOMComplexity(body),
      cssComplexity: this.calculateCSSComplexity(html),
      imageOptimization: this.analyzeImageOptimization(body),
      criticalResources: this.countCriticalResources(doc)
    };

    const suggestions: string[] = [];

    // DOM complexity check
    if (metrics.domComplexity > 100) {
      warnings.push({
        type: 'optimization',
        message: 'High DOM complexity may impact performance',
        suggestion: 'Consider simplifying the HTML structure'
      });
      suggestions.push('Reduce DOM complexity by simplifying HTML structure');
    }

    // CSS complexity check
    if (metrics.cssComplexity > 50) {
      warnings.push({
        type: 'optimization',
        message: 'Complex CSS may impact rendering performance',
        suggestion: 'Optimize CSS selectors and reduce complexity'
      });
      suggestions.push('Optimize CSS for better rendering performance');
    }

    // Image optimization
    if (metrics.imageOptimization < 70) {
      suggestions.push('Optimize images for better loading performance');
    }

    const score = this.calculatePerformanceScore(metrics);

    return {
      score,
      metrics,
      suggestions
    };
  }

  /**
   * Validate custom rules
   */
  private validateCustomRules(
    doc: Document,
    customRules: CustomRule[],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    for (const rule of customRules) {
      const elements = doc.querySelectorAll(rule.selector);
      
      elements.forEach(element => {
        if (!rule.test(element)) {
          if (rule.severity === 'error') {
            errors.push({
              type: 'semantic',
              severity: 'major',
              message: rule.message,
              element: element.tagName.toLowerCase(),
              rule: rule.name
            });
          } else {
            warnings.push({
              type: 'best-practice',
              message: rule.message,
              element: element.tagName.toLowerCase()
            });
          }
        }
      });
    }
  }

  /**
   * Helper methods for validation
   */
  private validateHeadingOrder(body: Element): boolean {
    const headings = body.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    
    for (const heading of headings) {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        return false;
      }
      lastLevel = level;
    }
    
    return true;
  }

  private countSemanticElements(body: Element): number {
    const semanticTags = ['article', 'section', 'nav', 'aside', 'header', 'footer', 'main', 'figure', 'figcaption'];
    return semanticTags.reduce((count, tag) => 
      count + body.querySelectorAll(tag).length, 0
    );
  }

  private calculateDOMComplexity(body: Element): number {
    const allElements = body.querySelectorAll('*');
    const maxDepth = this.getMaxDepth(body);
    return allElements.length + (maxDepth * 2);
  }

  private getMaxDepth(element: Element, depth = 0): number {
    const children = Array.from(element.children);
    if (children.length === 0) return depth;
    
    return Math.max(...children.map(child => this.getMaxDepth(child, depth + 1)));
  }

  private calculateCSSComplexity(html: string): number {
    const cssContent = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (!cssContent) return 0;
    
    const css = cssContent.join('');
    const selectors = (css.match(/[^{}]+(?=\s*\{)/g) || []).length;
    const rules = (css.match(/[^{}:]+:/g) || []).length;
    
    return selectors + (rules * 0.5);
  }

  private analyzeImageOptimization(body: Element): number {
    const images = body.querySelectorAll('img');
    if (images.length === 0) return 100;
    
    let optimizedImages = 0;
    
    images.forEach(img => {
      const src = img.getAttribute('src') || '';
      const hasLazyLoading = img.getAttribute('loading') === 'lazy';
      const hasResponsive = img.hasAttribute('srcset') || img.hasAttribute('sizes');
      const hasAlt = img.hasAttribute('alt');
      
      if (hasLazyLoading || hasResponsive || hasAlt) {
        optimizedImages++;
      }
    });
    
    return (optimizedImages / images.length) * 100;
  }

  private countCriticalResources(doc: Document): number {
    const criticalElements = doc.querySelectorAll('link[rel="stylesheet"], script[src]');
    return criticalElements.length;
  }

  /**
   * Score calculation methods
   */
  private calculateSemanticScore(structure: SemanticResult['structure'], issueCount: number): number {
    let score = 100;
    
    if (!structure.hasLang) score -= 15;
    if (!structure.properHeadingOrder) score -= 10;
    if (structure.semanticElements === 0) score -= 15;
    
    score -= issueCount * 5;
    
    return Math.max(0, score);
  }

  private calculatePerformanceScore(metrics: PerformanceResult['metrics']): number {
    let score = 100;
    
    if (metrics.domComplexity > 100) score -= 20;
    if (metrics.cssComplexity > 50) score -= 15;
    if (metrics.imageOptimization < 70) score -= 15;
    if (metrics.criticalResources > 5) score -= 10;
    
    return Math.max(0, score);
  }

  private calculateOverallScore(
    semantics: SemanticResult,
    accessibility: AccessibilityResult,
    performance: PerformanceResult,
    criticalErrors: number
  ): number {
    if (criticalErrors > 0) return Math.min(50, (semantics.score + accessibility.score + performance.score) / 3);
    
    return Math.round((semantics.score * 0.3) + (accessibility.score * 0.4) + (performance.score * 0.3));
  }

  /**
   * Recommendation generation
   */
  private generateRecommendations(
    recommendations: string[],
    semantics: SemanticResult,
    accessibility: AccessibilityResult,
    performance: PerformanceResult,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (semantics.score < 80) {
      recommendations.push('Improve semantic HTML structure for better SEO and accessibility');
    }
    
    if (accessibility.score < 80) {
      recommendations.push('Address accessibility issues to improve WCAG compliance');
    }
    
    if (performance.score < 80) {
      recommendations.push('Optimize HTML structure and CSS for better performance');
    }
    
    if (errors.length > 0) {
      recommendations.push(`Fix ${errors.length} critical errors before deployment`);
    }
    
    if (warnings.length > 5) {
      recommendations.push('Review and address best practice warnings');
    }
  }

  /**
   * Utility methods
   */
  private generateCacheKey(html: string, options: ValidationOptions): string {
    const hash = this.simpleHash(html + JSON.stringify(options));
    return `validation_${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private createErrorResult(message: string): ValidationResult {
    return {
      isValid: false,
      score: 0,
      errors: [{
        type: 'syntax',
        severity: 'critical',
        message,
        rule: 'validation-error'
      }],
      warnings: [],
      recommendations: ['Fix validation errors before proceeding'],
      accessibility: this.createEmptyAccessibilityResult(),
      performance: this.createEmptyPerformanceResult(),
      semantics: this.createEmptySemanticResult()
    };
  }

  private createEmptySemanticResult(): SemanticResult {
    return {
      score: 0,
      structure: {
        hasDoctype: false,
        hasLang: false,
        hasViewport: false,
        hasTitle: false,
        properHeadingOrder: false,
        semanticElements: 0
      },
      issues: []
    };
  }

  private createEmptyAccessibilityResult(): AccessibilityResult {
    return {
      wcagLevel: 'fail',
      score: 0,
      issues: {
        missingAlt: 0,
        lowContrast: 0,
        missingLabels: 0,
        keyboardInaccessible: 0,
        missingHeadings: 0
      },
      recommendations: []
    };
  }

  private createEmptyPerformanceResult(): PerformanceResult {
    return {
      score: 0,
      metrics: {
        domComplexity: 0,
        cssComplexity: 0,
        imageOptimization: 100,
        criticalResources: 0
      },
      suggestions: []
    };
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validationCache.clear();
    console.warn('🧹 HTML validation cache cleared');
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): {
    totalValidations: number;
    averageScore: number;
    commonIssues: { [key: string]: number };
  } {
    const results = Array.from(this.validationCache.values());
    
    if (results.length === 0) {
      return {
        totalValidations: 0,
        averageScore: 0,
        commonIssues: {}
      };
    }

    const averageScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;
    
    const commonIssues: { [key: string]: number } = {};
    results.forEach(result => {
      result.errors.forEach(error => {
        commonIssues[error.message] = (commonIssues[error.message] || 0) + 1;
      });
    });

    return {
      totalValidations: results.length,
      averageScore: Math.round(averageScore),
      commonIssues
    };
  }
}

export const htmlValidatorService = new HTMLValidatorService();