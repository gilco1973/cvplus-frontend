// @ts-ignore
/**
 * CVPlus Multimedia Component Resolver
 * 
 * Provides intelligent component resolution with fallbacks and version compatibility
 * 
 * @author Gil Klainert
 * @version 1.0.0
 * @license PROPRIETARY
  */

import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ComponentConfig {
  component: React.ComponentType<any>;
  version: string;
  fallback?: React.ComponentType<any>;
  minVersion?: string;
  maxVersion?: string;
  features?: string[];
}

interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
}

// ============================================================================
// VERSION UTILITIES
// ============================================================================

const parseVersion = (version: string): VersionInfo => {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major: major || 0, minor: minor || 0, patch: patch || 0 };
};

const compareVersions = (v1: string, v2: string): number => {
  const version1 = parseVersion(v1);
  const version2 = parseVersion(v2);
  
  if (version1.major !== version2.major) return version1.major - version2.major;
  if (version1.minor !== version2.minor) return version1.minor - version2.minor;
  return version1.patch - version2.patch;
};

// ============================================================================
// COMPONENT RESOLVER CLASS
// ============================================================================

export class ComponentResolver {
  private components: Map<string, ComponentConfig> = new Map();
  private globalFallbacks: Map<string, React.ComponentType<any>> = new Map();
  private currentVersion = '1.0.0';

  /**
   * Register a component with optional configuration
    */
  register(
    name: string, 
    component: React.ComponentType<any>,
    config: Partial<Omit<ComponentConfig, 'component'>> = {}
  ): void {
    this.components.set(name, {
      component,
      version: config.version || this.currentVersion,
      ...config
    });
  }

  /**
   * Register a global fallback for a component
    */
  registerFallback(name: string, fallback: React.ComponentType<any>): void {
    this.globalFallbacks.set(name, fallback);
  }

  /**
   * Resolve a component by name with compatibility checks
    */
  resolveComponent(name: string): React.ComponentType<any> | null {
    const config = this.components.get(name);
    
    if (!config) {
      console.warn(`[ComponentResolver] Component "${name}" not found`);
      return this.globalFallbacks.get(name) || null;
    }

    // Check version compatibility
    if (!this.checkCompatibility(config.version)) {
      console.warn(`[ComponentResolver] Version compatibility failed for "${name}"`);
      return config.fallback || this.globalFallbacks.get(name) || null;
    }

    return config.component;
  }

  /**
   * Check version compatibility
    */
  checkCompatibility(version: string): boolean {
    try {
      const componentVersion = parseVersion(version);
      const currentVersion = parseVersion(this.currentVersion);
      
      // Simple compatibility check: same major version
      return componentVersion.major === currentVersion.major;
    } catch {
      return false;
    }
  }

  /**
   * Get all registered component names
    */
  getRegisteredComponents(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * Check if component exists
    */
  hasComponent(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * Get component info
    */
  getComponentInfo(name: string): ComponentConfig | null {
    return this.components.get(name) || null;
  }

  /**
   * Set current version for compatibility checks
    */
  setCurrentVersion(version: string): void {
    this.currentVersion = version;
  }

  /**
   * Clear all registered components
    */
  clear(): void {
    this.components.clear();
    this.globalFallbacks.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const componentResolver = new ComponentResolver();

// ============================================================================
// REACT HOOK FOR COMPONENT RESOLUTION
// ============================================================================

export const useComponentResolver = () => {
  return React.useMemo(() => ({
    resolve: componentResolver.resolveComponent.bind(componentResolver),
    register: componentResolver.register.bind(componentResolver),
    registerFallback: componentResolver.registerFallback.bind(componentResolver),
    hasComponent: componentResolver.hasComponent.bind(componentResolver),
    getInfo: componentResolver.getComponentInfo.bind(componentResolver)
  }), []);
};