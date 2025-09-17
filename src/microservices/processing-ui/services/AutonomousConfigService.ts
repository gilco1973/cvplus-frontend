// @ts-ignore
/**
 * Autonomous Configuration Service
 * Independent configuration management without external dependencies
  */

export interface CVProcessingConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  features: {
    magicTransform: boolean;
    atsOptimization: boolean;
    industryAnalysis: boolean;
    regionalOptimization: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    showDebugInfo: boolean;
  };
  performance: {
    maxFileSize: number; // bytes
    cacheTimeout: number; // ms
    bundleOptimization: boolean;
  };
  security: {
    validateOrigin: boolean;
    sanitizeInput: boolean;
    logSensitiveData: boolean;
  };
}

/**
 * Configuration management for autonomous operation
 * Provides environment-based configuration with runtime updates
  */
export class AutonomousConfigService {
  private config: CVProcessingConfig;
  private listeners: Set<(config: CVProcessingConfig) => void> = new Set();

  constructor() {
    this.config = this.loadDefaultConfig();
    this.loadEnvironmentConfig();
  }

  /**
   * Load default configuration
    */
  private loadDefaultConfig(): CVProcessingConfig {
    return {
      api: {
        baseUrl: this.detectApiBaseUrl(),
        timeout: 30000,
        retryAttempts: 3
      },
      features: {
        magicTransform: true,
        atsOptimization: true,
        industryAnalysis: true,
        regionalOptimization: true
      },
      ui: {
        theme: 'auto',
        compactMode: false,
        showDebugInfo: this.isDevelopment()
      },
      performance: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
        bundleOptimization: !this.isDevelopment()
      },
      security: {
        validateOrigin: !this.isDevelopment(),
        sanitizeInput: true,
        logSensitiveData: false
      }
    };
  }

  /**
   * Load environment-specific configuration
    */
  private loadEnvironmentConfig(): void {
    if (typeof window === 'undefined') return;

    // Override with environment variables if available
    const envConfig = (window as any).__CV_PROCESSING_CONFIG__;
    if (envConfig) {
      this.mergeConfig(envConfig);
    }

    // Load from localStorage for user preferences
    const userConfig = this.loadUserPreferences();
    if (userConfig) {
      this.mergeConfig(userConfig);
    }
  }

  /**
   * Load user preferences from localStorage
    */
  private loadUserPreferences(): Partial<CVProcessingConfig> | null {
    try {
      const stored = localStorage.getItem('cv-processing-config');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('[Config] Failed to load user preferences:', error);
      return null;
    }
  }

  /**
   * Save user preferences to localStorage
    */
  private saveUserPreferences(config: Partial<CVProcessingConfig>): void {
    try {
      localStorage.setItem('cv-processing-config', JSON.stringify(config));
    } catch (error) {
      console.warn('[Config] Failed to save user preferences:', error);
    }
  }

  /**
   * Detect appropriate API base URL
    */
  private detectApiBaseUrl(): string {
    if (typeof window === 'undefined') {
      return 'https://us-central1-cvplus-app.cloudfunctions.net';
    }

    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5001';
    }
    
    if (hostname.includes('staging')) {
      return 'https://us-central1-cvplus-staging.cloudfunctions.net';
    }
    
    return 'https://us-central1-cvplus-app.cloudfunctions.net';
  }

  /**
   * Check if running in development mode
    */
  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development' ||
           (typeof window !== 'undefined' && window.location.hostname === 'localhost');
  }

  /**
   * Merge configuration objects
    */
  private mergeConfig(updates: Partial<CVProcessingConfig>): void {
    this.config = this.deepMerge(this.config, updates);
    this.notifyListeners();
  }

  /**
   * Deep merge objects
    */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Notify configuration listeners
    */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        console.error('[Config] Listener error:', error);
      }
    });
  }

  /**
   * Get full configuration
    */
  getConfig(): CVProcessingConfig {
    return { ...this.config };
  }

  /**
   * Get configuration value by path
    */
  get<K extends keyof CVProcessingConfig>(key: K): CVProcessingConfig[K];
  get(path: string): any;
  get(key: any): any {
    if (typeof key === 'string' && key.includes('.')) {
      return this.getNestedValue(this.config, key);
    }
    return (this.config as any)[key];
  }

  /**
   * Get nested configuration value
    */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Update configuration
    */
  updateConfig(updates: Partial<CVProcessingConfig>): void {
    this.mergeConfig(updates);
    
    // Save UI preferences
    if (updates.ui) {
      this.saveUserPreferences({ ui: updates.ui });
    }
  }

  /**
   * Reset to default configuration
    */
  resetConfig(): void {
    this.config = this.loadDefaultConfig();
    this.loadEnvironmentConfig();
    
    // Clear saved preferences
    try {
      localStorage.removeItem('cv-processing-config');
    } catch (error) {
      console.warn('[Config] Failed to clear preferences:', error);
    }
  }

  /**
   * Subscribe to configuration changes
    */
  onChange(listener: (config: CVProcessingConfig) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Feature flag helpers
    */
  isFeatureEnabled(feature: keyof CVProcessingConfig['features']): boolean {
    return this.config.features[feature];
  }

  /**
   * Performance setting helpers
    */
  getMaxFileSize(): number {
    return this.config.performance.maxFileSize;
  }

  getCacheTimeout(): number {
    return this.config.performance.cacheTimeout;
  }

  /**
   * Security setting helpers
    */
  shouldValidateOrigin(): boolean {
    return this.config.security.validateOrigin;
  }

  shouldSanitizeInput(): boolean {
    return this.config.security.sanitizeInput;
  }

  /**
   * API configuration helpers
    */
  getApiBaseUrl(): string {
    return this.config.api.baseUrl;
  }

  getApiTimeout(): number {
    return this.config.api.timeout;
  }

  getRetryAttempts(): number {
    return this.config.api.retryAttempts;
  }
}