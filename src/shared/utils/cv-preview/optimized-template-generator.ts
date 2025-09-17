/**
 * Optimized Template Generator with Performance Enhancements
 * High-performance template generation with Web Workers, caching, and monitoring
 */

import type { QRCodeSettings } from '../../types/cv-preview';
import type { CVParsedData, CVPersonalInfo, CVSkillsData } from '../../types/cvData';
import type {
  CVTemplate,
  TemplateId,
  TemplateGenerationOptions,
  GeneratedTemplate,
  TemplateGenerationResult,
  LegacyTemplate,
  adaptLegacyTemplate
} from '../../types/cv-templates';
import { templateCSSGenerator } from './template-css-generator';
import { enhancedCacheManager } from './enhanced-cache-manager';
import { performanceMetrics, PerformanceTracker } from '../performance/performance-metrics';
import { memoryMonitor } from '../performance/memory-monitor';
import type { WorkerMessage, WorkerResponse } from '../performance/template-worker';
import { CVTemplateGenerator } from './cvTemplateGenerator';
import { TemplateSpecificGenerators } from './templateSpecificGenerators';

/**
 * High-performance template generator with Web Workers and intelligent caching
 */
export class OptimizedTemplateGenerator {
  private static workerPool: Worker[] = [];
  private static workerIndex = 0;
  private static readonly MAX_WORKERS = Math.min(navigator.hardwareConcurrency || 4, 4);
  private static pendingOperations = new Map<string, { 
    resolve: Function; 
    reject: Function; 
    timeout: number;
  }>();
  private static initialized = false;

  /**
   * Initialize the optimized template generator
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize Web Workers
      await this.initializeWorkers();
      
      // Initialize monitoring
      if (!memoryMonitor.isMonitoring) {
        memoryMonitor.start();
      }
      
      // Preload critical templates
      await this.preloadCriticalTemplates();
      
      this.initialized = true;
      console.warn('🚀 Optimized Template Generator initialized');
    } catch (error) {
      console.error('Failed to initialize optimized template generator:', error);
      throw error;
    }
  }

  /**
   * Initialize worker pool for template generation
   */
  private static async initializeWorkers(): Promise<void> {
    if (this.workerPool.length > 0) return;

    for (let i = 0; i < this.MAX_WORKERS; i++) {
      try {
        const worker = new Worker(
          new URL('../performance/template-worker.ts', import.meta.url),
          { type: 'module' }
        );
        
        worker.onmessage = (event) => {
          this.handleWorkerMessage(event.data);
        };
        
        worker.onerror = (error) => {
          console.error(`Template worker ${i} error:`, error);
        };
        
        this.workerPool.push(worker);
        console.warn(`🧵 Worker ${i + 1}/${this.MAX_WORKERS} initialized`);
      } catch (error) {
        console.warn('Web Workers not supported, falling back to main thread:', error);
        break;
      }
    }

    console.warn(`🧵 Worker pool initialized with ${this.workerPool.length} workers`);
  }

  /**
   * Handle worker message responses
   */
  private static handleWorkerMessage(response: WorkerResponse): void {
    const operation = this.pendingOperations.get(response.id);
    if (!operation) return;

    if (response.type === 'success') {
      clearTimeout(operation.timeout);
      operation.resolve(response.data);
      this.pendingOperations.delete(response.id);
    } else if (response.type === 'error') {
      clearTimeout(operation.timeout);
      operation.reject(new Error(response.error));
      this.pendingOperations.delete(response.id);
    } else if (response.type === 'progress') {
      // Emit progress event if needed
      console.warn(`Progress: ${response.progress}%`);
    }
  }

  /**
   * Send task to worker with load balancing
   */
  private static async sendToWorker<T>(message: WorkerMessage, timeoutMs = 30000): Promise<T> {
    if (this.workerPool.length === 0) {
      // Fallback to main thread if workers not available
      return this.processOnMainThread<T>(message);
    }

    return new Promise((resolve, reject) => {
      const worker = this.workerPool[this.workerIndex];
      this.workerIndex = (this.workerIndex + 1) % this.workerPool.length;
      
      const timeout = setTimeout(() => {
        if (this.pendingOperations.has(message.id)) {
          this.pendingOperations.delete(message.id);
          reject(new Error(`Worker timeout after ${timeoutMs}ms`));
        }
      }, timeoutMs);
      
      this.pendingOperations.set(message.id, { resolve, reject, timeout });
      worker.postMessage(message);
    });
  }

  /**
   * Fallback processing on main thread
   */
  private static async processOnMainThread<T>(message: WorkerMessage): Promise<T> {
    console.warn('Processing on main thread - Web Workers not available');
    
    switch (message.type) {
      case 'generate_css':
        return this.generateCSSOnMainThread(message.data) as T;
      case 'generate_template':
        return this.generateTemplateOnMainThread(message.data) as T;
      default:
        throw new Error(`Unsupported operation: ${message.type}`);
    }
  }

  /**
   * Generate CSS on main thread (fallback)
   */
  private static async generateCSSOnMainThread(data: any): Promise<any> {
    // Simple CSS generation fallback
    return {
      css: `/* Fallback CSS for ${data.templateId} */`,
      size: 100,
      optimized: false
    };
  }

  /**
   * Generate template on main thread (fallback)
   */
  private static async generateTemplateOnMainThread(data: any): Promise<any> {
    // Use existing generator as fallback
    const generator = new CVTemplateGenerator();
    const html = await generator.generateHTML(data.template, data.cvData);
    
    return {
      html,
      size: html.length,
      compressed: false,
      optimized: false
    };
  }

  /**
   * Generate optimized template HTML with performance tracking
   */
  static async generateHTML(
    template: CVTemplate,
    previewData: CVParsedData,
    options: TemplateGenerationOptions = {}
  ): Promise<string> {
    await this.initialize();
    
    const tracker = performanceMetrics.startTemplateGeneration(template.id);
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(template, previewData, options);
      const cached = enhancedCacheManager.getTemplate(cacheKey);
      
      if (cached) {
        tracker.markCacheHit();
        tracker.complete(cached.length);
        console.warn(`💨 [CACHE] Retrieved cached template for ${template.name}`);
        return cached;
      }

      console.warn(`🎨 [TEMPLATE] Generating optimized HTML for ${template.name}`);
      
      // Start render tracking
      tracker.markRenderStart();

      // Generate with performance optimization
      const html = await this.generateOptimizedTemplate(template, previewData, options);

      // Cache the result
      enhancedCacheManager.setTemplate(cacheKey, html, {
        templateId: template.id,
        generatedAt: Date.now(),
        size: html.length,
        options
      });

      tracker.complete(html.length);
      console.warn(`✅ [TEMPLATE] Generated ${html.length} characters for ${template.name}`);
      
      // Check memory usage after generation
      this.checkMemoryUsage();
      
      return html;
    } catch (error) {
      tracker.recordError();
      tracker.complete();
      console.error(`❌ [TEMPLATE] Failed to generate ${template.name}:`, error);
      throw error;
    }
  }

  /**
   * Generate cache key for template
   */
  private static generateCacheKey(
    template: CVTemplate,
    previewData: CVParsedData,
    options: TemplateGenerationOptions
  ): string {
    const keyData = {
      templateId: template.id,
      templateVersion: template.metadata?.version || '1.0.0',
      dataHash: this.hashData(previewData),
      optionsHash: this.hashData(options)
    };
    
    return `optimized-template-${btoa(JSON.stringify(keyData)).slice(0, 32)}`;
  }

  /**
   * Simple hash function for data
   */
  private static hashData(data: any): string {
    try {
      return btoa(JSON.stringify(data)).slice(0, 16);
    } catch {
      return Math.random().toString(36).substr(2, 16);
    }
  }

  /**
   * Generate optimized template with Web Workers
   */
  private static async generateOptimizedTemplate(
    template: CVTemplate,
    previewData: CVParsedData,
    options: TemplateGenerationOptions
  ): Promise<string> {
    // Use Web Workers for heavy templates
    if (this.shouldUseWorkers(template, options)) {
      try {
        return await this.generateWithWorkers(template, previewData, options);
      } catch (error) {
        console.warn('Worker generation failed, falling back to main thread:', error);
      }
    }

    // Fallback to optimized main thread generation
    return this.generateOnMainThread(template, previewData, options);
  }

  /**
   * Check if Web Workers should be used
   */
  private static shouldUseWorkers(
    template: CVTemplate,
    options: TemplateGenerationOptions
  ): boolean {
    return (
      options.useWebWorkers !== false &&
      this.workerPool.length > 0 &&
      (
        template.features?.includes('heavy-processing') ||
        template.features?.includes('complex-styling') ||
        options.enableOptimizations ||
        template.category === 'creative' // Creative templates are typically heavier
      )
    );
  }

  /**
   * Generate template using Web Workers
   */
  private static async generateWithWorkers(
    template: CVTemplate,
    previewData: CVParsedData,
    options: TemplateGenerationOptions
  ): Promise<string> {
    console.warn(`🔧 [WORKERS] Processing template ${template.name} with Web Workers`);
    
    const message: WorkerMessage = {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'generate_template',
      data: {
        template,
        cvData: previewData,
        options: {
          compress: options.compress || false,
          optimize: options.enableOptimizations || false,
          includePreview: options.includePreview || false
        }
      }
    };

    const result = await this.sendToWorker<{ html: string; size: number }>(message);
    
    console.warn(`✅ [WORKERS] Generated ${result.size} characters using Web Workers`);
    return result.html;
  }

  /**
   * Generate template on main thread with optimization
   */
  private static async generateOnMainThread(
    template: CVTemplate,
    previewData: CVParsedData,
    options: TemplateGenerationOptions
  ): Promise<string> {
    // Generate CSS with enhanced caching
    const cssStyles = await templateCSSGenerator.generateTemplateCSS(template);
    
    // Generate HTML content using specific generators
    const htmlContent = await this.generateTemplateContent(template, previewData, options);
    
    // Combine and optimize
    return this.combineAndOptimize(template, cssStyles, htmlContent, options);
  }

  /**
   * Generate template content using appropriate generator
   */
  private static async generateTemplateContent(
    template: CVTemplate,
    previewData: CVParsedData,
    options: TemplateGenerationOptions
  ): Promise<string> {
    // Use specific generator based on template type
    if (template.category && TemplateSpecificGenerators[template.category]) {
      return TemplateSpecificGenerators[template.category].generateHTML(template, previewData, options);
    }
    
    // Fallback to base generator
    const generator = new CVTemplateGenerator();
    return generator.generateHTML(template, previewData);
  }

  /**
   * Combine CSS and HTML with optimization
   */
  private static combineAndOptimize(
    template: CVTemplate,
    cssStyles: string,
    htmlContent: string,
    options: TemplateGenerationOptions
  ): string {
    // Build final HTML
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name} - CV Template</title>
    <style>
        ${cssStyles}
    </style>
</head>
<body class="template-${template.id} category-${template.category}">
    ${htmlContent}
</body>
</html>
    `.trim();

    // Apply optimizations
    if (options.enableOptimizations) {
      html = this.optimizeHTML(html);
    }

    if (options.compress) {
      html = this.compressHTML(html);
    }

    return html;
  }

  /**
   * Optimize HTML for performance
   */
  private static optimizeHTML(html: string): string {
    return html
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove extra whitespace between tags
      .replace(/>\s+</g, '><')
      // Optimize inline styles
      .replace(/style\s*=\s*"([^"]*)"/g, (match, styles) => {
        const optimized = styles
          .replace(/\s*;\s*/g, ';')
          .replace(/\s*:\s*/g, ':')
          .replace(/;\s*$/, '');
        return `style="${optimized}"`;
      });
  }

  /**
   * Compress HTML for smaller size
   */
  private static compressHTML(html: string): string {
    return html
      .replace(/\s{2,}/g, ' ')
      .replace(/\n\s*/g, '')
      .trim();
  }

  /**
   * Check memory usage and perform cleanup if needed
   */
  private static checkMemoryUsage(): void {
    const stats = memoryMonitor.getStatistics();
    
    if (stats.current && stats.current.usedPercent > 85) {
      console.warn('🧠 High memory usage detected, performing cleanup');
      enhancedCacheManager.releaseMemoryPressure();
    }
  }

  /**
   * Preload critical templates for better performance
   */
  private static async preloadCriticalTemplates(): Promise<void> {
    const criticalTemplates = [
      'professional-modern',
      'executive-classic',
      'tech-minimal'
    ];

    try {
      await enhancedCacheManager.warmCache(criticalTemplates);
      console.warn('🔥 Critical templates preloaded');
    } catch (error) {
      console.warn('Failed to preload critical templates:', error);
    }
  }

  /**
   * Get comprehensive performance statistics
   */
  static getPerformanceStats(): {
    template: any;
    memory: any;
    cache: any;
    workers: { count: number; pending: number };
  } {
    return {
      template: performanceMetrics.getTemplateStats(),
      memory: memoryMonitor.getStatistics(),
      cache: enhancedCacheManager.getStats(),
      workers: {
        count: this.workerPool.length,
        pending: this.pendingOperations.size
      }
    };
  }

  /**
   * Clear all caches and reset state
   */
  static clearCache(): void {
    enhancedCacheManager.clearAll();
    templateCSSGenerator.clearCache();
    console.warn('🗑️ All caches cleared');
  }

  /**
   * Cleanup workers and resources
   */
  static cleanup(): void {
    // Cleanup pending operations
    this.pendingOperations.forEach(({ timeout }) => clearTimeout(timeout));
    this.pendingOperations.clear();

    // Terminate workers
    this.workerPool.forEach(worker => worker.terminate());
    this.workerPool = [];

    // Stop monitoring
    memoryMonitor.stop();

    this.initialized = false;
    console.warn('🧹 Optimized Template Generator cleanup completed');
  }

  /**
   * Legacy compatibility: Generate template result
   */
  static async generateTemplateResult(
    templateId: TemplateId,
    previewData: CVParsedData,
    options: TemplateGenerationOptions = {}
  ): Promise<TemplateGenerationResult> {
    const template = await this.getTemplate(templateId);
    const html = await this.generateHTML(template, previewData, options);
    
    return {
      html,
      css: await templateCSSGenerator.generateTemplateCSS(template),
      metadata: {
        templateId: template.id,
        generatedAt: new Date().toISOString(),
        size: html.length,
        performance: {
          generationTime: 0, // Would be tracked by performance metrics
          cacheHit: false,   // Would be tracked by performance metrics
          workerUsed: this.shouldUseWorkers(template, options)
        }
      }
    };
  }

  /**
   * Get template by ID (compatibility method)
   */
  private static async getTemplate(templateId: TemplateId): Promise<CVTemplate> {
    // This would integrate with your template registry
    // For now, return a basic template structure
    return {
      id: templateId,
      name: `Template ${templateId}`,
      category: 'professional',
      metadata: {
        version: '1.0.0',
        updated: Date.now()
      },
      styling: {
        colorPalette: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#f59e0b',
          background: '#ffffff',
          surface: '#f8fafc',
          text: {
            primary: '#1e293b',
            secondary: '#64748b'
          },
          border: '#e2e8f0'
        },
        typography: {
          headings: {
            fontFamily: 'Inter, system-ui, sans-serif'
          },
          body: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5'
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem'
        }
      },
      features: []
    };
  }
}

/**
 * Export legacy compatibility functions
 */
export const generateHTML = OptimizedTemplateGenerator.generateHTML.bind(OptimizedTemplateGenerator);
export const generateTemplateResult = OptimizedTemplateGenerator.generateTemplateResult.bind(OptimizedTemplateGenerator);
export const clearCache = OptimizedTemplateGenerator.clearCache.bind(OptimizedTemplateGenerator);
export const getPerformanceStats = OptimizedTemplateGenerator.getPerformanceStats.bind(OptimizedTemplateGenerator);

/**
 * Initialize on module load
 */
if (typeof window !== 'undefined') {
  // Auto-initialize in browser environment
  OptimizedTemplateGenerator.initialize().catch(console.error);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    OptimizedTemplateGenerator.cleanup();
  });
}