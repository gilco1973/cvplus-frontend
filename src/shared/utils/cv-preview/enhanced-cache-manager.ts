/**
 * Enhanced cache manager for template system
 * Integrates LRU cache, memory monitoring, and performance tracking
 */

import { LRUCache, CSSLRUCache, TemplateLRUCache } from '../performance/lru-cache';
import { memoryMonitor } from '../performance/memory-monitor';
import { performanceMetrics } from '../performance/performance-metrics';

export interface CacheConfig {
  maxSize: number;
  maxMemory: number;
  ttl: number;
  enableCompression: boolean;
  enableMetrics: boolean;
}

export interface CacheStats {
  css: {
    size: number;
    hitRate: number;
    memoryUsage: number;
  };
  templates: {
    size: number;
    hitRate: number;
    memoryUsage: number;
  };
  totalMemory: number;
  totalEntries: number;
}

/**
 * Enhanced cache manager with multi-level caching and performance monitoring
 */
export class EnhancedCacheManager {
  private cssCache: CSSLRUCache;
  private templateCache: TemplateLRUCache;
  private metadataCache: LRUCache<string, any>;
  
  private config: CacheConfig = {
    maxSize: 1000,
    maxMemory: 50 * 1024 * 1024, // 50MB
    ttl: 30 * 60 * 1000,         // 30 minutes
    enableCompression: true,
    enableMetrics: true
  };
  
  private cleanupInterval: number | null = null;
  private isInitialized = false;

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...this.config, ...config };
    this.initializeCaches();
  }

  /**
   * Initialize cache system
   */
  private initializeCaches(): void {
    // Initialize specialized caches
    this.cssCache = new CSSLRUCache();
    this.templateCache = new TemplateLRUCache();
    
    // General metadata cache
    this.metadataCache = new LRUCache<string, any>(
      this.config.maxSize,
      this.config.maxMemory * 0.1, // 10% for metadata
      this.config.ttl
    );
    
    // Set up automatic cleanup
    this.setupCleanup();
    
    // Initialize monitoring if enabled
    if (this.config.enableMetrics) {
      this.initializeMonitoring();
    }
    
    this.isInitialized = true;
    console.warn('Enhanced cache manager initialized');
  }

  /**
   * Get CSS from cache
   */
  getCSS(key: string): string | null {
    const startTime = performance.now();
    const result = this.cssCache.getCSS(key);
    
    if (this.config.enableMetrics) {
      const duration = performance.now() - startTime;
      performanceMetrics.startTemplateGeneration('cache-access')
        .markCacheHit()
        .complete();
    }
    
    return result;
  }

  /**
   * Set CSS in cache
   */
  setCSS(key: string, css: string): boolean {
    const success = this.cssCache.setCSS(key, css, this.config.enableCompression);
    
    if (success && this.config.enableMetrics) {
      this.checkMemoryPressure();
    }
    
    return success;
  }

  /**
   * Get template from cache
   */
  getTemplate(templateId: string): any | null {
    const startTime = performance.now();
    const result = this.templateCache.getTemplate(templateId);
    
    if (this.config.enableMetrics) {
      const duration = performance.now() - startTime;
      performanceMetrics.startTemplateGeneration('template-cache-access')
        .markCacheHit()
        .complete();
    }
    
    return result;
  }

  /**
   * Set template in cache
   */
  setTemplate(templateId: string, templateData: any, metadata?: any): boolean {
    const success = this.templateCache.setTemplate(templateId, templateData, metadata);
    
    if (success && this.config.enableMetrics) {
      this.checkMemoryPressure();
    }
    
    return success;
  }

  /**
   * Get metadata from cache
   */
  getMetadata(key: string): any | null {
    return this.metadataCache.get(key);
  }

  /**
   * Set metadata in cache
   */
  setMetadata(key: string, metadata: any): boolean {
    return this.metadataCache.set(key, metadata);
  }

  /**
   * Check if key exists in any cache
   */
  has(key: string, cacheType: 'css' | 'template' | 'metadata' = 'css'): boolean {
    switch (cacheType) {
      case 'css':
        return this.cssCache.has(key);
      case 'template':
        return this.templateCache.has(key);
      case 'metadata':
        return this.metadataCache.has(key);
      default:
        return false;
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: string | RegExp, cacheType?: 'css' | 'template' | 'metadata'): number {
    let invalidatedCount = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    const invalidateFromCache = (cache: any) => {
      const keys = cache.keys();
      const keysToDelete = keys.filter((key: string) => regex.test(key));
      keysToDelete.forEach((key: string) => {
        cache.delete(key);
        invalidatedCount++;
      });
    };
    
    if (!cacheType || cacheType === 'css') {
      invalidateFromCache(this.cssCache);
    }
    
    if (!cacheType || cacheType === 'template') {
      invalidateFromCache(this.templateCache);
    }
    
    if (!cacheType || cacheType === 'metadata') {
      invalidateFromCache(this.metadataCache);
    }
    
    if (invalidatedCount > 0) {
      console.warn(`Invalidated ${invalidatedCount} cache entries matching pattern: ${pattern}`);
    }
    
    return invalidatedCount;
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(): CacheStats {
    const cssStats = this.cssCache.getStats();
    const templateStats = this.templateCache.getStats();
    const metadataStats = this.metadataCache.getStats();
    
    return {
      css: {
        size: cssStats.size,
        hitRate: cssStats.hitRate,
        memoryUsage: cssStats.memoryUsage
      },
      templates: {
        size: templateStats.size,
        hitRate: templateStats.hitRate,
        memoryUsage: templateStats.memoryUsage
      },
      totalMemory: cssStats.memoryUsage + templateStats.memoryUsage + metadataStats.memoryUsage,
      totalEntries: cssStats.size + templateStats.size + metadataStats.size
    };
  }

  /**
   * Warm cache with frequently used templates
   */
  async warmCache(templateIds: string[]): Promise<void> {
    console.warn(`Warming cache for ${templateIds.length} templates...`);
    
    const warmPromises = templateIds.map(async (templateId) => {
      try {
        // Check if already cached
        if (this.has(templateId, 'template')) {
          return;
        }
        
        // Load and cache template (placeholder implementation)
        // In real implementation, this would load from API or storage
        const templateData = await this.loadTemplate(templateId);
        if (templateData) {
          this.setTemplate(templateId, templateData);
        }
      } catch (error) {
        console.warn(`Failed to warm cache for template ${templateId}:`, error);
      }
    });
    
    await Promise.allSettled(warmPromises);
    console.warn('Cache warming completed');
  }

  /**
   * Perform cache cleanup and optimization
   */
  cleanup(): {
    cssCleanup: number;
    templateCleanup: number;
    metadataCleanup: number;
    memoryReleased: number;
  } {
    const startMemory = this.getTotalMemoryUsage();
    
    const cssCleanup = this.cssCache.cleanup();
    const templateCleanup = this.templateCache.cleanup();
    const metadataCleanup = this.metadataCache.cleanup();
    
    const endMemory = this.getTotalMemoryUsage();
    const memoryReleased = startMemory - endMemory;
    
    const result = {
      cssCleanup,
      templateCleanup,
      metadataCleanup,
      memoryReleased
    };
    
    console.warn('Cache cleanup completed:', result);
    return result;
  }

  /**
   * Release memory pressure by evicting least used items
   */
  releaseMemoryPressure(): {
    cssReleased: number;
    templatesReleased: number;
    metadataReleased: number;
    totalMemoryReleased: number;
  } {
    const startMemory = this.getTotalMemoryUsage();
    
    const cssReleased = this.cssCache.releaseMemoryPressure();
    const templatesReleased = this.templateCache.releaseMemoryPressure();
    const metadataReleased = this.metadataCache.releaseMemoryPressure();
    
    const endMemory = this.getTotalMemoryUsage();
    const totalMemoryReleased = startMemory - endMemory;
    
    const result = {
      cssReleased,
      templatesReleased,
      metadataReleased,
      totalMemoryReleased
    };
    
    console.warn('Memory pressure relief completed:', result);
    return result;
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.cssCache.clear();
    this.templateCache.clear();
    this.metadataCache.clear();
    
    console.warn('All caches cleared');
  }

  /**
   * Export cache data for debugging
   */
  exportData(): string {
    const data = {
      config: this.config,
      stats: this.getStats(),
      cssStats: this.cssCache.getStats(),
      templateStats: this.templateCache.getStats(),
      metadataStats: this.metadataCache.getStats(),
      exportTime: Date.now()
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Destroy cache manager and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.clearAll();
    this.isInitialized = false;
    
    console.warn('Enhanced cache manager destroyed');
  }

  private setupCleanup(): void {
    // Set up automatic cleanup every 5 minutes
    this.cleanupInterval = window.setInterval(() => {
      this.cleanup();
      
      // Check memory pressure
      if (this.config.enableMetrics) {
        this.checkMemoryPressure();
      }
    }, 5 * 60 * 1000);
  }

  private initializeMonitoring(): void {
    if (!memoryMonitor) return;
    
    // Set up memory alerts
    memoryMonitor.onAlert((alert) => {
      if (alert.type === 'critical' || alert.type === 'leak_detected') {
        console.warn('Memory alert received, performing cache cleanup:', alert);
        this.releaseMemoryPressure();
      }
    });
  }

  private checkMemoryPressure(): void {
    const stats = this.getStats();
    const memoryUsagePercent = (stats.totalMemory / this.config.maxMemory) * 100;
    
    if (memoryUsagePercent > 85) {
      console.warn(`High cache memory usage: ${memoryUsagePercent.toFixed(1)}%`);
      this.releaseMemoryPressure();
    }
  }

  private getTotalMemoryUsage(): number {
    const stats = this.getStats();
    return stats.totalMemory;
  }

  private async loadTemplate(templateId: string): Promise<any | null> {
    // Placeholder implementation
    // In real implementation, this would load from API or storage
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        id: templateId,
        data: `Template data for ${templateId}`,
        loadedAt: Date.now()
      };
    } catch (error) {
      console.error(`Failed to load template ${templateId}:`, error);
      return null;
    }
  }
}

/**
 * Global enhanced cache manager instance
 */
export const enhancedCacheManager = new EnhancedCacheManager();

/**
 * Initialize enhanced caching system
 */
export function initializeEnhancedCaching(config?: Partial<CacheConfig>): void {
  // Update configuration if provided
  if (config) {
    enhancedCacheManager.destroy();
    const newManager = new EnhancedCacheManager(config);
    // Replace global instance (in production, use dependency injection)
  }
  
  console.warn('Enhanced caching system initialized');
}

/**
 * Utility to preload critical templates
 */
export async function preloadCriticalTemplates(): Promise<void> {
  const criticalTemplates = [
    'professional-modern',
    'executive-classic',
    'tech-minimal',
    'creative-bold'
  ];
  
  await enhancedCacheManager.warmCache(criticalTemplates);
}