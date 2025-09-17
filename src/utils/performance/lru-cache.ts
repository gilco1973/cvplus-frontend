/**
 * High-performance LRU (Least Recently Used) Cache implementation
 * Optimized for template system memory management
 */

export interface CacheEntry<V> {
  value: V;
  size: number;
  timestamp: number;
  accessCount: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  memoryUsage: number;
  maxMemory: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
  oldestEntry: number;
  newestEntry: number;
}

export class LRUCache<K, V> {
  private readonly cache = new Map<K, CacheEntry<V>>();
  private readonly accessOrder: K[] = [];
  private readonly maxSize: number;
  private readonly maxMemory: number;
  private readonly ttl: number;
  
  private memoryUsage = 0;
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  
  constructor(
    maxSize = 1000,
    maxMemory: number = 50 * 1024 * 1024, // 50MB
    ttl: number = 30 * 60 * 1000 // 30 minutes
  ) {
    this.maxSize = maxSize;
    this.maxMemory = maxMemory;
    this.ttl = ttl;
  }

  /**
   * Get value from cache with LRU update
   */
  get(key: K): V | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.delete(key);
      this.missCount++;
      return null;
    }

    // Update access order (move to end)
    this.updateAccessOrder(key);
    
    // Update access statistics
    entry.accessCount++;
    entry.timestamp = Date.now();
    
    this.hitCount++;
    return entry.value;
  }

  /**
   * Set value in cache with size-based eviction
   */
  set(key: K, value: V, customSize?: number): boolean {
    const size = customSize ?? this.calculateSize(value);
    
    // Check if single item exceeds memory limit
    if (size > this.maxMemory) {
      console.warn(`Cache item too large: ${size} bytes > ${this.maxMemory} bytes`);
      return false;
    }

    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.delete(key);
    }

    // Evict items to make space
    while (
      (this.cache.size >= this.maxSize) ||
      (this.memoryUsage + size > this.maxMemory)
    ) {
      if (!this.evictLRU()) {
        break; // No more items to evict
      }
    }

    // Add new entry
    const entry: CacheEntry<V> = {
      value,
      size,
      timestamp: Date.now(),
      accessCount: 1
    };

    this.cache.set(key, entry);
    this.accessOrder.push(key);
    this.memoryUsage += size;

    return true;
  }

  /**
   * Delete specific key from cache
   */
  delete(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.memoryUsage -= entry.size;
    
    // Remove from access order
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }

    return true;
  }

  /**
   * Check if key exists in cache (without updating access)
   */
  has(key: K): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.length = 0;
    this.memoryUsage = 0;
    this.evictionCount = 0;
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    let oldestEntry = now;
    let newestEntry = 0;

    for (const entry of this.cache.values()) {
      if (entry.timestamp < oldestEntry) oldestEntry = entry.timestamp;
      if (entry.timestamp > newestEntry) newestEntry = entry.timestamp;
    }

    const totalRequests = this.hitCount + this.missCount;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: this.memoryUsage,
      maxMemory: this.maxMemory,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
      evictionCount: this.evictionCount,
      oldestEntry: oldestEntry === now ? 0 : oldestEntry,
      newestEntry
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;
    
    const keysToDelete: K[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry, now)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.delete(key);
      cleanedCount++;
    }
    
    return cleanedCount;
  }

  /**
   * Get all keys in LRU order (least recently used first)
   */
  keys(): K[] {
    return [...this.accessOrder];
  }

  /**
   * Get all values in LRU order
   */
  values(): V[] {
    return this.accessOrder.map(key => {
      const entry = this.cache.get(key);
      return entry ? entry.value : null;
    }).filter(value => value !== null) as V[];
  }

  /**
   * Perform memory pressure release
   */
  releaseMemoryPressure(targetMemory?: number): number {
    const target = targetMemory ?? (this.maxMemory * 0.7); // Release to 70% capacity
    let releasedCount = 0;
    
    while (this.memoryUsage > target && this.cache.size > 0) {
      if (!this.evictLRU()) break;
      releasedCount++;
    }
    
    return releasedCount;
  }

  private calculateSize(value: V): number {
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16 encoding
    }
    
    if (typeof value === 'object' && value !== null) {
      try {
        return JSON.stringify(value).length * 2;
      } catch {
        return 1024; // Default size for non-serializable objects
      }
    }
    
    return 64; // Default size for primitives
  }

  private isExpired(entry: CacheEntry<V>, now: number = Date.now()): boolean {
    return (now - entry.timestamp) > this.ttl;
  }

  private updateAccessOrder(key: K): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
      this.accessOrder.push(key);
    }
  }

  private evictLRU(): boolean {
    if (this.accessOrder.length === 0) return false;
    
    const keyToEvict = this.accessOrder[0];
    const evicted = this.delete(keyToEvict);
    
    if (evicted) {
      this.evictionCount++;
    }
    
    return evicted;
  }
}

/**
 * Specialized LRU cache for CSS content with compression
 */
export class CSSLRUCache extends LRUCache<string, string> {
  constructor() {
    super(
      1000,           // Max 1000 CSS entries
      10 * 1024 * 1024, // 10MB memory limit
      60 * 60 * 1000     // 1 hour TTL
    );
  }

  /**
   * Store CSS with optional compression
   */
  setCSS(key: string, css: string, compress = true): boolean {
    const processedCSS = compress ? this.compressCSS(css) : css;
    return this.set(key, processedCSS);
  }

  /**
   * Get CSS with automatic decompression
   */
  getCSS(key: string): string | null {
    const css = this.get(key);
    return css ? this.decompressCSS(css) : null;
  }

  private compressCSS(css: string): string {
    // Simple CSS compression: remove comments, extra whitespace
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ')             // Collapse whitespace
      .replace(/;\s*}/g, '}')           // Remove semicolon before closing brace
      .replace(/\s*{\s*/g, '{')         // Clean up braces
      .replace(/}\s*/g, '}')
      .trim();
  }

  private decompressCSS(css: string): string {
    // For simple compression, no decompression needed
    return css;
  }
}

/**
 * Template-specific LRU cache with metadata
 */
export class TemplateLRUCache extends LRUCache<string, any> {
  constructor() {
    super(
      100,            // Max 100 templates
      20 * 1024 * 1024, // 20MB memory limit
      2 * 60 * 60 * 1000  // 2 hours TTL
    );
  }

  /**
   * Store template with metadata
   */
  setTemplate(templateId: string, templateData: any, metadata?: any): boolean {
    const entry = {
      data: templateData,
      metadata: metadata || {},
      cached: Date.now()
    };
    
    return this.set(templateId, entry);
  }

  /**
   * Get template data only
   */
  getTemplate(templateId: string): any | null {
    const entry = this.get(templateId);
    return entry ? entry.data : null;
  }

  /**
   * Get template with metadata
   */
  getTemplateWithMetadata(templateId: string): { data: any; metadata: any; cached: number } | null {
    return this.get(templateId);
  }
}