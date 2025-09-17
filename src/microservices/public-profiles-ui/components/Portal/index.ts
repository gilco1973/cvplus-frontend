/**
 * Portal Components Export Index
 *
 * Centralized exports for all CVPlus Portal system components.
 * Provides a clean interface for importing portal-related functionality
 * throughout the application.
 *
 * @author Gil Klainert
 * @version 1.0.0
 */

// Main Components
export { PortalDashboard } from './PortalDashboard';
export { PortalGenerator } from './PortalGenerator';
export { PortalChatInterface } from './PortalChatInterface';
export { PortalLayout } from './PortalLayout';
export { PortalSections } from './PortalSections';
export { PortalQRIntegration } from './PortalQRIntegration';
export { PortalDeploymentStatus } from './PortalDeploymentStatus';

// Component-specific Exports
export { default as PortalDashboard } from './PortalDashboard';
export { default as PortalGenerator } from './PortalGenerator';
export { default as PortalChatInterface } from './PortalChatInterface';
export { default as PortalLayout } from './PortalLayout';
export { default as PortalSections } from './PortalSections';
export { default as PortalQRIntegration } from './PortalQRIntegration';
export { default as PortalDeploymentStatus } from './PortalDeploymentStatus';

// Example Components (for development and testing)
export { default as PortalChatDemo } from './PortalChatDemo';
export { default as PortalChatExample } from './PortalChatExample';
export { default as PortalLayoutExample } from './PortalLayout.example';
export { default as PortalSectionsExample } from './PortalSections.example';
export { default as PortalQRIntegrationExample } from './PortalQRIntegration.example';
export { default as PortalDeploymentStatusExample } from './PortalDeploymentStatus.example';

// Sub-components
export { PortalHeader } from './components/PortalHeader';
export { PortalFooter } from './components/PortalFooter';
export { PortalSettingsPanel } from './components/PortalSettingsPanel';
export { PortalDeploymentDisplay } from './components/PortalDeploymentDisplay';

// Types (re-exported for convenience)
export type {
  PortalConfig,
  PortalTheme,
  PortalFeatures,
  PortalMetadata,
  DeploymentStatus,
  DeploymentPhase,
  ChatMessage,
  ChatConfig,
  QRCodeConfig,
  PortalError,
  PortalOperationResult
} from '../../../types/portal-types';

export type {
  PortalLayoutProps,
  PortalDeploymentStatusProps,
  PortalSectionsProps,
  PortalQRIntegrationProps,
  PortalChatInterfaceProps
} from '../../../types/portal-component-props';

// Utility Functions
export const portalUtils = {
  /**
   * Generate a shareable portal URL
   */
  generateShareUrl: (portalId: string, baseUrl?: string): string => {
    const base = baseUrl || window.location.origin;
    return `${base}/portal/${portalId}`;
  },

  /**
   * Validate portal configuration
   */
  validatePortalConfig: (config: any): boolean => {
    return !!(config?.id && config?.name && config?.theme);
  },

  /**
   * Format deployment phase for display
   */
  formatDeploymentPhase: (phase: string): string => {
    return phase.charAt(0).toUpperCase() + phase.slice(1).replace(/_/g, ' ');
  },

  /**
   * Calculate deployment progress percentage
   */
  calculateProgress: (phase: string): number => {
    const phases = {
      initializing: 5,
      validating: 15,
      preparing: 35,
      uploading: 50,
      building: 70,
      deploying: 85,
      testing: 95,
      completed: 100,
      failed: 0
    };
    return phases[phase as keyof typeof phases] || 0;
  },

  /**
   * Copy portal URL to clipboard
   */
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  },

  /**
   * Share portal via Web Share API or fallback
   */
  sharePortal: async (portalUrl: string, title: string): Promise<boolean> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: portalUrl,
          text: `Check out this AI-powered professional portal: ${title}`
        });
        return true;
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Web Share failed:', error);
        }
      }
    }

    // Fallback to clipboard
    return await portalUtils.copyToClipboard(portalUrl);
  }
};

// Constants
export const PORTAL_CONSTANTS = {
  // Deployment phases
  DEPLOYMENT_PHASES: [
    'initializing',
    'validating',
    'preparing',
    'uploading',
    'building',
    'deploying',
    'testing',
    'completed',
    'failed'
  ] as const,

  // Default themes
  DEFAULT_THEMES: {
    modern: {
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: 'Inter, sans-serif',
      layout: 'modern',
      animations: true,
      darkMode: false
    },
    classic: {
      primaryColor: '#1E40AF',
      secondaryColor: '#7C3AED',
      backgroundColor: '#F9FAFB',
      textColor: '#374151',
      fontFamily: 'Georgia, serif',
      layout: 'classic',
      animations: false,
      darkMode: false
    },
    minimal: {
      primaryColor: '#000000',
      secondaryColor: '#6B7280',
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
      fontFamily: 'SF Pro Display, sans-serif',
      layout: 'minimal',
      animations: true,
      darkMode: false
    }
  },

  // Feature flags
  DEFAULT_FEATURES: {
    aiChat: true,
    qrCode: true,
    contactForm: true,
    calendar: true,
    portfolio: true,
    socialLinks: true,
    testimonials: true,
    analytics: true
  },

  // Rate limits
  RATE_LIMITS: {
    free: {
      portalGenerations: 0,
      chatMessages: 10,
      aiFeatures: 2
    },
    premium: {
      portalGenerations: 5,
      chatMessages: 200,
      aiFeatures: 50
    },
    enterprise: {
      portalGenerations: -1, // Unlimited
      chatMessages: -1,
      aiFeatures: -1
    }
  },

  // Chat configuration defaults
  DEFAULT_CHAT_CONFIG: {
    enableRAG: true,
    model: {
      modelName: 'claude-sonnet-4-20250514',
      parameters: {
        temperature: 0.7,
        maxTokens: 800,
        topP: 1.0,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      contextWindowSize: 4000
    },
    vectorSearch: {
      topK: 5,
      threshold: 0.7,
      algorithm: 'cosine' as const,
      hybridSearch: true
    },
    behavior: {
      showTyping: true,
      messageTimeout: 30000,
      autoScroll: true,
      enableReactions: true
    }
  }
};

// Component Registry (for dynamic loading)
export const PORTAL_COMPONENTS = {
  dashboard: PortalDashboard,
  generator: PortalGenerator,
  chat: PortalChatInterface,
  layout: PortalLayout,
  sections: PortalSections,
  qr: PortalQRIntegration,
  deployment: PortalDeploymentStatus
} as const;

// Version information
export const PORTAL_VERSION = '1.0.0';
export const PORTAL_BUILD_DATE = '2025-01-14';
export const PORTAL_AUTHOR = 'Gil Klainert';

/**
 * Portal system health check
 */
export const checkPortalSystemHealth = async (): Promise<{
  healthy: boolean;
  components: Record<string, boolean>;
  version: string;
}> => {
  const components = {
    dashboard: typeof PortalDashboard === 'function',
    generator: typeof PortalGenerator === 'function',
    chat: typeof PortalChatInterface === 'function',
    layout: typeof PortalLayout === 'function',
    sections: typeof PortalSections === 'function',
    qr: typeof PortalQRIntegration === 'function',
    deployment: typeof PortalDeploymentStatus === 'function'
  };

  const healthy = Object.values(components).every(Boolean);

  return {
    healthy,
    components,
    version: PORTAL_VERSION
  };
};

// Default export for convenience
export default {
  PortalDashboard,
  PortalGenerator,
  PortalChatInterface,
  PortalLayout,
  PortalSections,
  PortalQRIntegration,
  PortalDeploymentStatus,
  portalUtils,
  PORTAL_CONSTANTS,
  PORTAL_COMPONENTS,
  PORTAL_VERSION,
  checkPortalSystemHealth
};