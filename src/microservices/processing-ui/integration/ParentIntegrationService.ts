// @ts-ignore
/**
 * Parent Integration Service
 * Handles communication between autonomous CV processing module and parent application
  */

import { EventEmitter } from 'events';

export interface ParentConfig {
  apiBaseUrl?: string;
  authToken?: string;
  theme?: 'light' | 'dark' | 'auto';
  features?: string[];
  premiumEnabled?: boolean;
}

export interface ParentEvent {
  type: string;
  payload: any;
  timestamp: number;
}

export interface ModuleEvent {
  type: 'job-started' | 'job-completed' | 'job-failed' | 'navigation-request' | 'request-config';
  payload: any;
}

/**
 * Integration service for autonomous module operation
 * Enables communication with parent application while maintaining independence
  */
export class ParentIntegrationService extends EventEmitter {
  private config: ParentConfig = {};
  private isConnected = false;
  private parentWindow: Window | null = null;
  private messageQueue: ModuleEvent[] = [];

  constructor() {
    super();
    this.initializeIntegration();
  }

  /**
   * Initialize integration with parent application
    */
  private initializeIntegration(): void {
    // Check if running inside parent application
    if (typeof window !== 'undefined' && window.parent !== window) {
      this.parentWindow = window.parent;
      this.setupMessageListener();
      this.requestInitialConfig();
    }
  }

  /**
   * Setup message listener for parent communication
    */
  private setupMessageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        // Validate origin for security
        if (!this.isValidOrigin(event.origin)) {
          console.warn('[CVProcessing] Ignored message from invalid origin:', event.origin);
          return;
        }

        this.handleParentMessage(event.data);
      });
    }
  }

  /**
   * Validate message origin for security
    */
  private isValidOrigin(origin: string): boolean {
    // In development, allow localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true;
    }

    // In production, check against allowed domains
    const allowedDomains = [
      'https://cvplus.app',
      'https://www.cvplus.app',
      'https://app.cvplus.com'
    ];

    return allowedDomains.some(domain => origin.startsWith(domain));
  }

  /**
   * Handle messages from parent application
    */
  private handleParentMessage(data: any): void {
    if (!data || data.source !== 'cvplus-parent') return;

    switch (data.type) {
      case 'config-update':
        this.updateConfig(data.payload);
        break;
      case 'auth-token-updated':
        this.updateAuthToken(data.payload.token);
        break;
      case 'theme-changed':
        this.updateTheme(data.payload.theme);
        break;
      case 'feature-flags-updated':
        this.updateFeatures(data.payload.features);
        break;
      default:
        this.emit('parent-message', data);
    }
  }

  /**
   * Request initial configuration from parent
    */
  private requestInitialConfig(): void {
    this.sendToParent({
      type: 'request-config',
      payload: { module: 'cv-processing' }
    });
  }

  /**
   * Send message to parent application
    */
  private sendToParent(event: ModuleEvent): void {
    if (!this.parentWindow) {
      // Queue message if not connected yet
      this.messageQueue.push(event);
      return;
    }

    const message = {
      source: 'cvplus-cv-processing',
      ...event,
      timestamp: Date.now()
    };

    this.parentWindow.postMessage(message, '*');
  }

  /**
   * Flush queued messages when connection established
    */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const event = this.messageQueue.shift();
      if (event) {
        this.sendToParent(event);
      }
    }
  }

  /**
   * Update configuration
    */
  private updateConfig(newConfig: Partial<ParentConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.isConnected = true;
    this.flushMessageQueue();
    this.emit('config-updated', this.config);
  }

  /**
   * Update authentication token
    */
  private updateAuthToken(token: string): void {
    this.config.authToken = token;
    this.emit('auth-token-updated', token);
  }

  /**
   * Update theme
    */
  private updateTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.config.theme = theme;
    this.emit('theme-changed', theme);
  }

  /**
   * Update feature flags
    */
  private updateFeatures(features: string[]): void {
    this.config.features = features;
    this.emit('features-updated', features);
  }

  /**
   * Get current configuration
    */
  getConfig(): ParentConfig {
    return { ...this.config };
  }

  /**
   * Check if module is connected to parent
    */
  isConnectedToParent(): boolean {
    return this.isConnected;
  }

  /**
   * Notify parent of job start
    */
  notifyJobStarted(jobId: string, jobData: any): void {
    this.sendToParent({
      type: 'job-started',
      payload: { jobId, jobData }
    });
  }

  /**
   * Notify parent of job completion
    */
  notifyJobCompleted(jobId: string, result: any): void {
    this.sendToParent({
      type: 'job-completed',
      payload: { jobId, result }
    });
  }

  /**
   * Notify parent of job failure
    */
  notifyJobFailed(jobId: string, error: string): void {
    this.sendToParent({
      type: 'job-failed',
      payload: { jobId, error }
    });
  }

  /**
   * Request navigation to parent route
    */
  requestNavigation(route: string, params?: any): void {
    this.sendToParent({
      type: 'navigation-request',
      payload: { route, params }
    });
  }

  /**
   * Get authentication token
    */
  getAuthToken(): string | null {
    return this.config.authToken || null;
  }

  /**
   * Check if feature is enabled
    */
  isFeatureEnabled(feature: string): boolean {
    return this.config.features?.includes(feature) || false;
  }

  /**
   * Check if premium features are enabled
    */
  isPremiumEnabled(): boolean {
    return this.config.premiumEnabled || false;
  }

  /**
   * Get current theme
    */
  getTheme(): 'light' | 'dark' | 'auto' {
    return this.config.theme || 'auto';
  }
}

// Singleton instance for module-wide use
export const parentIntegration = new ParentIntegrationService();