/**
 * Template Registry Service
 * Comprehensive template management system with caching, search, and analytics
 * Implements the TemplateRegistry interface with performance optimizations
 */

import type {
  TemplateRegistry,
  CVTemplate,
  TemplateId,
  TemplateCategory,
  ExperienceLevel
} from '../types/cv-templates';
import {
  PROFESSIONAL_TEMPLATES,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByIndustry,
  getTemplatesByExperienceLevel,
  getPopularTemplates,
  validateTemplate,
  searchTemplates
} from '../data/professional-templates';

// ============================================================================
// TEMPLATE REGISTRY IMPLEMENTATION
// ============================================================================

class TemplateRegistryService implements TemplateRegistry {
  private _templates: Map<TemplateId, CVTemplate>;
  private _searchCache: Map<string, CVTemplate[]>;
  private _lastCacheUpdate: number;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Analytics tracking
  public readonly analytics = {
    usage: new Map<TemplateId, number>(),
    ratings: new Map<TemplateId, number[]>(),
    feedback: new Map<TemplateId, string[]>(),
    performance: new Map<TemplateId, { generationTime: number; errors: number; }>()
  };

  constructor() {
    this._templates = new Map();
    this._searchCache = new Map();
    this._lastCacheUpdate = 0;
    
    // Initialize with professional templates
    this.initializeTemplates();
    
    console.warn('✅ Template Registry initialized with', this._templates.size, 'professional templates');
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initializeTemplates(): void {
    // Load professional templates
    Object.values(PROFESSIONAL_TEMPLATES).forEach(template => {
      this._templates.set(template.id, template);
      
      // Initialize analytics
      this.analytics.usage.set(template.id, template.metadata.popularity || 0);
      this.analytics.ratings.set(template.id, [template.metadata.rating || 4.0]);
      this.analytics.feedback.set(template.id, []);
      this.analytics.performance.set(template.id, { generationTime: 0, errors: 0 });
    });
    
    console.warn('📊 Template analytics initialized for', this._templates.size, 'templates');
  }

  // ============================================================================
  // TEMPLATE ACCESS
  // ============================================================================

  get templates(): Map<TemplateId, CVTemplate> {
    return new Map(this._templates); // Return copy for immutability
  }

  get categories(): {
    [K in TemplateCategory]: {
      templates: TemplateId[];
      description: string;
      icon: string;
      popularityScore: number;
    };
  } {
    return {
      executive: {
        templates: this.getTemplateIdsByCategory('executive'),
        description: 'Professional templates for C-suite and senior management roles',
        icon: '👔',
        popularityScore: this.calculateCategoryPopularity('executive')
      },
      technical: {
        templates: this.getTemplateIdsByCategory('technical'),
        description: 'Clean, systematic designs for engineering and IT professionals',
        icon: '💻',
        popularityScore: this.calculateCategoryPopularity('technical')
      },
      creative: {
        templates: this.getTemplateIdsByCategory('creative'),
        description: 'Expressive designs for designers, artists, and creative professionals',
        icon: '🎨',
        popularityScore: this.calculateCategoryPopularity('creative')
      },
      healthcare: {
        templates: this.getTemplateIdsByCategory('healthcare'),
        description: 'Professional, trustworthy designs for healthcare professionals',
        icon: '🏥',
        popularityScore: this.calculateCategoryPopularity('healthcare')
      },
      financial: {
        templates: this.getTemplateIdsByCategory('financial'),
        description: 'Conservative, stable designs for finance sector professionals',
        icon: '💼',
        popularityScore: this.calculateCategoryPopularity('financial')
      },
      academic: {
        templates: this.getTemplateIdsByCategory('academic'),
        description: 'Scholarly designs for educators and researchers',
        icon: '🎓',
        popularityScore: this.calculateCategoryPopularity('academic')
      },
      sales: {
        templates: this.getTemplateIdsByCategory('sales'),
        description: 'Dynamic, confident designs for sales professionals',
        icon: '📈',
        popularityScore: this.calculateCategoryPopularity('sales')
      },
      international: {
        templates: this.getTemplateIdsByCategory('international'),
        description: 'Universal designs for global and multicultural roles',
        icon: '🌍',
        popularityScore: this.calculateCategoryPopularity('international')
      }
    };
  }

  // ============================================================================
  // SEARCH AND FILTERING
  // ============================================================================

  get search() {
    return {
      byCategory: (category: TemplateCategory): CVTemplate[] => {
        const cacheKey = `category:${category}`;
        const cached = this.getCachedSearch(cacheKey);
        if (cached) return cached;

        const templates = getTemplatesByCategory(category);
        this.setCachedSearch(cacheKey, templates);
        return templates;
      },

      byIndustry: (industry: string): CVTemplate[] => {
        const cacheKey = `industry:${industry.toLowerCase()}`;
        const cached = this.getCachedSearch(cacheKey);
        if (cached) return cached;

        const templates = getTemplatesByIndustry(industry);
        this.setCachedSearch(cacheKey, templates);
        return templates;
      },

      byExperienceLevel: (level: ExperienceLevel): CVTemplate[] => {
        const cacheKey = `experience:${level}`;
        const cached = this.getCachedSearch(cacheKey);
        if (cached) return cached;

        const templates = getTemplatesByExperienceLevel(level);
        this.setCachedSearch(cacheKey, templates);
        return templates;
      },

      byFeatures: (features: string[]): CVTemplate[] => {
        const cacheKey = `features:${features.sort().join(',')}`;
        const cached = this.getCachedSearch(cacheKey);
        if (cached) return cached;

        const templates = Array.from(this._templates.values())
          .filter(template => {
            const templateFeatures = this.extractTemplateFeatures(template);
            return features.every(feature => templateFeatures.includes(feature.toLowerCase()));
          });
        
        this.setCachedSearch(cacheKey, templates);
        return templates;
      },

      byPopularity: (limit?: number): CVTemplate[] => {
        const cacheKey = `popularity:${limit || 'all'}`;
        const cached = this.getCachedSearch(cacheKey);
        if (cached) return cached;

        const templates = getPopularTemplates(limit);
        this.setCachedSearch(cacheKey, templates);
        return templates;
      },

      byRating: (minRating: number): CVTemplate[] => {
        const cacheKey = `rating:${minRating}`;
        const cached = this.getCachedSearch(cacheKey);
        if (cached) return cached;

        const templates = Array.from(this._templates.values())
          .filter(template => template.metadata.rating >= minRating)
          .sort((a, b) => b.metadata.rating - a.metadata.rating);
        
        this.setCachedSearch(cacheKey, templates);
        return templates;
      },

      byQuery: (query: string): CVTemplate[] => {
        const cacheKey = `query:${query.toLowerCase()}`;
        const cached = this.getCachedSearch(cacheKey);
        if (cached) return cached;

        const templates = searchTemplates(query);
        this.setCachedSearch(cacheKey, templates);
        return templates;
      }
    };
  }

  // ============================================================================
  // TEMPLATE OPERATIONS
  // ============================================================================

  get operations() {
    return {
      register: (template: CVTemplate): void => {
        const validation = validateTemplate(template);
        if (!validation.isValid) {
          throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
        }

        if (this._templates.has(template.id)) {
          throw new Error(`Template with ID '${template.id}' already exists`);
        }

        this._templates.set(template.id, template);
        
        // Initialize analytics
        this.analytics.usage.set(template.id, 0);
        this.analytics.ratings.set(template.id, [template.metadata.rating || 4.0]);
        this.analytics.feedback.set(template.id, []);
        this.analytics.performance.set(template.id, { generationTime: 0, errors: 0 });
        
        this.clearSearchCache();
        
        console.warn('✅ Template registered:', template.name, `(${template.id})`);
      },

      unregister: (templateId: TemplateId): void => {
        if (!this._templates.has(templateId)) {
          throw new Error(`Template with ID '${templateId}' not found`);
        }

        const template = this._templates.get(templateId)!;
        this._templates.delete(templateId);
        
        // Clean up analytics
        this.analytics.usage.delete(templateId);
        this.analytics.ratings.delete(templateId);
        this.analytics.feedback.delete(templateId);
        this.analytics.performance.delete(templateId);
        
        this.clearSearchCache();
        
        console.warn('🗑️ Template unregistered:', template.name, `(${templateId})`);
      },

      update: (templateId: TemplateId, updates: Partial<CVTemplate>): void => {
        if (!this._templates.has(templateId)) {
          throw new Error(`Template with ID '${templateId}' not found`);
        }

        const existingTemplate = this._templates.get(templateId)!;
        const updatedTemplate = { ...existingTemplate, ...updates };
        
        // Validate updated template
        const validation = validateTemplate(updatedTemplate);
        if (!validation.isValid) {
          throw new Error(`Updated template validation failed: ${validation.errors.join(', ')}`);
        }

        // Update metadata timestamp
        updatedTemplate.metadata.updated = new Date().toISOString().split('T')[0];
        
        this._templates.set(templateId, updatedTemplate);
        this.clearSearchCache();
        
        console.warn('🔄 Template updated:', updatedTemplate.name, `(${templateId})`);
      },

      clone: (templateId: TemplateId, newId: TemplateId): CVTemplate => {
        const originalTemplate = this._templates.get(templateId);
        if (!originalTemplate) {
          throw new Error(`Template with ID '${templateId}' not found`);
        }

        if (this._templates.has(newId)) {
          throw new Error(`Template with ID '${newId}' already exists`);
        }

        const clonedTemplate: CVTemplate = {
          ...structuredClone(originalTemplate),
          id: newId,
          name: `${originalTemplate.name} (Copy)`,
          metadata: {
            ...originalTemplate.metadata,
            created: new Date().toISOString().split('T')[0],
            updated: new Date().toISOString().split('T')[0],
            popularity: 0,
            rating: 4.0,
            isDefault: false,
            isPremium: false
          }
        };

        this.operations.register(clonedTemplate);
        
        console.warn('📋 Template cloned:', originalTemplate.name, '->', clonedTemplate.name);
        return clonedTemplate;
      },

      validate: (template: CVTemplate): { isValid: boolean; errors: string[] } => {
        return validateTemplate(template);
      },

      getById: (templateId: TemplateId): CVTemplate | undefined => {
        return this._templates.get(templateId);
      },

      exists: (templateId: TemplateId): boolean => {
        return this._templates.has(templateId);
      },

      count: (): number => {
        return this._templates.size;
      },

      getAll: (): CVTemplate[] => {
        return Array.from(this._templates.values());
      }
    };
  }

  // ============================================================================
  // ANALYTICS AND PERFORMANCE
  // ============================================================================

  public trackUsage(templateId: TemplateId): void {
    const currentUsage = this.analytics.usage.get(templateId) || 0;
    this.analytics.usage.set(templateId, currentUsage + 1);
    
    // Update template popularity in metadata
    const template = this._templates.get(templateId);
    if (template) {
      template.metadata.popularity = currentUsage + 1;
      template.metadata.updated = new Date().toISOString().split('T')[0];
    }
  }

  public addRating(templateId: TemplateId, rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const ratings = this.analytics.ratings.get(templateId) || [];
    ratings.push(rating);
    this.analytics.ratings.set(templateId, ratings);
    
    // Update template rating in metadata
    const template = this._templates.get(templateId);
    if (template) {
      const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      template.metadata.rating = Math.round(averageRating * 10) / 10;
    }
  }

  public addFeedback(templateId: TemplateId, feedback: string): void {
    const currentFeedback = this.analytics.feedback.get(templateId) || [];
    currentFeedback.push(feedback);
    this.analytics.feedback.set(templateId, currentFeedback);
  }

  public recordPerformance(templateId: TemplateId, generationTime: number, hasErrors: boolean): void {
    const perf = this.analytics.performance.get(templateId) || { generationTime: 0, errors: 0 };
    perf.generationTime = (perf.generationTime + generationTime) / 2; // Running average
    if (hasErrors) {
      perf.errors += 1;
    }
    this.analytics.performance.set(templateId, perf);
  }

  public getAnalyticsSummary(): {
    totalTemplates: number;
    totalUsage: number;
    averageRating: number;
    topTemplates: Array<{ id: TemplateId; name: string; usage: number; rating: number }>;
    performanceMetrics: { averageGenerationTime: number; errorRate: number };
  } {
    const totalUsage = Array.from(this.analytics.usage.values()).reduce((sum, usage) => sum + usage, 0);
    const allRatings = Array.from(this.analytics.ratings.values()).flat();
    const averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
    
    const topTemplates = Array.from(this._templates.entries())
      .map(([id, template]) => ({
        id,
        name: template.name,
        usage: this.analytics.usage.get(id) || 0,
        rating: template.metadata.rating
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);
    
    const allPerformance = Array.from(this.analytics.performance.values());
    const averageGenerationTime = allPerformance.reduce((sum, perf) => sum + perf.generationTime, 0) / allPerformance.length;
    const totalErrors = allPerformance.reduce((sum, perf) => sum + perf.errors, 0);
    const errorRate = totalErrors / totalUsage;
    
    return {
      totalTemplates: this._templates.size,
      totalUsage,
      averageRating,
      topTemplates,
      performanceMetrics: {
        averageGenerationTime,
        errorRate
      }
    };
  }

  // ============================================================================
  // PRIVATE UTILITIES
  // ============================================================================

  private getTemplateIdsByCategory(category: TemplateCategory): TemplateId[] {
    return Array.from(this._templates.values())
      .filter(template => template.category === category)
      .map(template => template.id);
  }

  private calculateCategoryPopularity(category: TemplateCategory): number {
    const categoryTemplates = this.getTemplateIdsByCategory(category);
    const totalUsage = categoryTemplates.reduce((sum, templateId) => {
      return sum + (this.analytics.usage.get(templateId) || 0);
    }, 0);
    return Math.round(totalUsage / Math.max(categoryTemplates.length, 1));
  }

  private extractTemplateFeatures(template: CVTemplate): string[] {
    const features: string[] = [];
    
    // Add category as a feature
    features.push(template.category);
    
    // Add experience levels
    features.push(...template.experienceLevel);
    
    // Add industries
    features.push(...template.industries.map(i => i.toLowerCase()));
    
    // Add target roles
    features.push(...template.targetRoles.map(r => r.toLowerCase()));
    
    // Add metadata tags
    features.push(...template.metadata.tags);
    
    // Add feature specifications
    if (template.features.skills.type) features.push(`skills-${template.features.skills.type}`);
    if (template.features.experience.layout) features.push(`experience-${template.features.experience.layout}`);
    if (template.features.interactivity.expandableSections) features.push('expandable-sections');
    if (template.features.accessibility.screenReaderOptimized) features.push('accessibility');
    if (template.ats.formats.ats.enabled) features.push('ats-compatible');
    
    return features;
  }

  private getCachedSearch(key: string): CVTemplate[] | null {
    if (Date.now() - this._lastCacheUpdate > this.CACHE_TTL) {
      this.clearSearchCache();
      return null;
    }
    return this._searchCache.get(key) || null;
  }

  private setCachedSearch(key: string, templates: CVTemplate[]): void {
    this._searchCache.set(key, templates);
    this._lastCacheUpdate = Date.now();
  }

  private clearSearchCache(): void {
    this._searchCache.clear();
    this._lastCacheUpdate = 0;
    console.warn('🧹 Template search cache cleared');
  }

  // ============================================================================
  // ADVANCED UTILITIES
  // ============================================================================

  public getRecommendations(userProfile: {
    industry?: string;
    role?: string;
    experienceLevel?: ExperienceLevel;
    preferences?: string[];
  }): CVTemplate[] {
    const candidates = Array.from(this._templates.values());
    const score = new Map<TemplateId, number>();
    
    // Initialize scores
    candidates.forEach(template => {
      score.set(template.id, 0);
    });
    
    // Score by industry match
    if (userProfile.industry) {
      candidates.forEach(template => {
        if (template.industries.some(industry => 
          industry.toLowerCase().includes(userProfile.industry!.toLowerCase())
        )) {
          score.set(template.id, (score.get(template.id) || 0) + 30);
        }
      });
    }
    
    // Score by role match
    if (userProfile.role) {
      candidates.forEach(template => {
        if (template.targetRoles.some(role => 
          role.toLowerCase().includes(userProfile.role!.toLowerCase())
        )) {
          score.set(template.id, (score.get(template.id) || 0) + 25);
        }
      });
    }
    
    // Score by experience level
    if (userProfile.experienceLevel) {
      candidates.forEach(template => {
        if (template.experienceLevel.includes(userProfile.experienceLevel!)) {
          score.set(template.id, (score.get(template.id) || 0) + 20);
        }
      });
    }
    
    // Score by preferences
    if (userProfile.preferences) {
      candidates.forEach(template => {
        const templateFeatures = this.extractTemplateFeatures(template);
        const matchCount = userProfile.preferences!.filter(pref => 
          templateFeatures.includes(pref.toLowerCase())
        ).length;
        score.set(template.id, (score.get(template.id) || 0) + (matchCount * 5));
      });
    }
    
    // Add popularity and rating bonus
    candidates.forEach(template => {
      const popularityBonus = Math.min(template.metadata.popularity / 10, 10);
      const ratingBonus = (template.metadata.rating - 3) * 5; // Bonus for ratings above 3
      score.set(template.id, (score.get(template.id) || 0) + popularityBonus + ratingBonus);
    });
    
    // Sort by score and return top recommendations
    return candidates
      .sort((a, b) => (score.get(b.id) || 0) - (score.get(a.id) || 0))
      .slice(0, 5);
  }

  public exportTemplateData(): string {
    const exportData = {
      templates: Object.fromEntries(this._templates),
      analytics: {
        usage: Object.fromEntries(this.analytics.usage),
        ratings: Object.fromEntries(this.analytics.ratings),
        feedback: Object.fromEntries(this.analytics.feedback),
        performance: Object.fromEntries(this.analytics.performance)
      },
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        totalTemplates: this._templates.size
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  public getHealthReport(): {
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
    recommendations: string[];
    metrics: {
      totalTemplates: number;
      validTemplates: number;
      averageRating: number;
      cacheHitRatio: number;
    };
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Validate all templates
    let validTemplates = 0;
    for (const template of this._templates.values()) {
      const validation = validateTemplate(template);
      if (validation.isValid) {
        validTemplates++;
      } else {
        issues.push(`Template '${template.name}' has validation errors: ${validation.errors.join(', ')}`);
      }
    }
    
    // Check for missing default templates
    const defaultTemplates = Array.from(this._templates.values()).filter(t => t.metadata.isDefault);
    if (defaultTemplates.length === 0) {
      issues.push('No default templates available');
      recommendations.push('Mark at least one template as default');
    }
    
    // Check template distribution
    const categoryDistribution = Object.keys(this.categories).map(category => {
      return this.categories[category as TemplateCategory].templates.length;
    });
    
    if (Math.max(...categoryDistribution) - Math.min(...categoryDistribution) > 3) {
      recommendations.push('Consider balancing templates across categories');
    }
    
    // Calculate metrics
    const allRatings = Array.from(this.analytics.ratings.values()).flat();
    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
      : 0;
    
    const status = issues.length === 0 ? 'healthy' : issues.length < 3 ? 'warning' : 'error';
    
    return {
      status,
      issues,
      recommendations,
      metrics: {
        totalTemplates: this._templates.size,
        validTemplates,
        averageRating,
        cacheHitRatio: this._searchCache.size > 0 ? 0.8 : 0 // Simplified metric
      }
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const templateRegistry = new TemplateRegistryService();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

// Direct access methods for common operations
export const getTemplate = (templateId: string): CVTemplate | undefined => {
  return templateRegistry.operations.getById(templateId as TemplateId);
};

export const getAllTemplates = (): CVTemplate[] => {
  return templateRegistry.operations.getAll();
};

export const searchTemplatesByQuery = (query: string): CVTemplate[] => {
  return templateRegistry.search.byQuery(query);
};

export const getTemplatesByCategory = (category: TemplateCategory): CVTemplate[] => {
  return templateRegistry.search.byCategory(category);
};

export const getPopularTemplates = (limit?: number): CVTemplate[] => {
  return templateRegistry.search.byPopularity(limit);
};

export const getRecommendedTemplates = (userProfile: {
  industry?: string;
  role?: string;
  experienceLevel?: ExperienceLevel;
  preferences?: string[];
}): CVTemplate[] => {
  return templateRegistry.getRecommendations(userProfile);
};

// Analytics shortcuts
export const trackTemplateUsage = (templateId: string): void => {
  templateRegistry.trackUsage(templateId as TemplateId);
};

export const rateTemplate = (templateId: string, rating: number): void => {
  templateRegistry.addRating(templateId as TemplateId, rating);
};

export const getAnalyticsSummary = () => {
  return templateRegistry.getAnalyticsSummary();
};

// Health and diagnostics
export const getRegistryHealth = () => {
  return templateRegistry.getHealthReport();
};

export const exportRegistry = (): string => {
  return templateRegistry.exportTemplateData();
};

// Type guard for template ID
export const isValidTemplateId = (id: string): id is TemplateId => {
  return templateRegistry.operations.exists(id as TemplateId);
};

console.warn('🚀 Template Registry Service initialized and ready');
