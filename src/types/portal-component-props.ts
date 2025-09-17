/**
 * CVPlus Portal Component-Specific Props
 * 
 * Detailed TypeScript interfaces for each portal component
 * with comprehensive prop definitions and documentation.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { ReactNode, CSSProperties } from 'react';
import {
  PortalComponentProps,
  PortalConfig,
  DeploymentStatus,
  PortalSection,
  QRCodeConfig,
  ChatConfig,
  PortalError,
  ChatMessage,
  QRCodeData,
  PortalOperationResult,
} from './portal-types';
import { CVFeatureProps } from './cv-features';

// ============================================================================
// PORTAL LAYOUT COMPONENT
// ============================================================================

/**
 * PortalLayout.tsx component props
 * Main layout wrapper for the portal system
 */
export interface PortalLayoutProps extends PortalComponentProps {
  /** Child components to render */
  children: ReactNode;
  
  /** Layout configuration */
  layoutConfig?: {
    /** Header settings */
    header?: {
      /** Show user avatar */
      showAvatar?: boolean;
      /** Show user name */
      showName?: boolean;
      /** Show user title */
      showTitle?: boolean;
      /** Header height */
      height?: string;
      /** Header background */
      background?: string;
      /** Custom header content */
      customContent?: ReactNode;
      /** Header position */
      position?: 'fixed' | 'sticky' | 'static';
    };
    
    /** Navigation settings */
    navigation?: {
      /** Navigation type */
      type?: 'horizontal' | 'vertical' | 'sidebar' | 'tabs';
      /** Navigation position */
      position?: 'top' | 'bottom' | 'left' | 'right';
      /** Show navigation labels */
      showLabels?: boolean;
      /** Navigation items */
      items?: Array<{
        id: string;
        label: string;
        icon?: string;
        href?: string;
        active?: boolean;
        disabled?: boolean;
      }>;
    };
    
    /** Footer settings */
    footer?: {
      /** Show footer */
      show?: boolean;
      /** Footer content */
      content?: ReactNode;
      /** Show branding */
      showBranding?: boolean;
      /** Show social links */
      showSocialLinks?: boolean;
      /** Footer background */
      background?: string;
    };
    
    /** Main content area */
    main?: {
      /** Maximum width */
      maxWidth?: string;
      /** Padding */
      padding?: string;
      /** Background */
      background?: string;
      /** Container class */
      containerClass?: string;
    };
  };
  
  /** SEO configuration */
  seoConfig?: {
    /** Page title */
    title?: string;
    /** Meta description */
    description?: string;
    /** Meta keywords */
    keywords?: string[];
    /** Open Graph data */
    openGraph?: {
      title?: string;
      description?: string;
      image?: string;
      url?: string;
    };
    /** Structured data */
    structuredData?: Record<string, any>;
  };
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Error boundary */
  error?: PortalError;
  
  /** Layout event handlers */
  onLayoutReady?: () => void;
  onNavigationChange?: (activeSection: string) => void;
  onError?: (error: PortalError) => void;
}

// ============================================================================
// PORTAL DEPLOYMENT STATUS COMPONENT
// ============================================================================

/**
 * PortalDeploymentStatus.tsx component props
 * Real-time deployment tracking and status display
 */
export interface PortalDeploymentStatusProps extends PortalComponentProps {
  /** Current deployment status */
  status: DeploymentStatus;
  
  /** Status display configuration */
  displayConfig?: {
    /** Show progress bar */
    showProgress?: boolean;
    /** Show detailed logs */
    showLogs?: boolean;
    /** Show estimated time */
    showTimeEstimate?: boolean;
    /** Show deployment URL */
    showUrl?: boolean;
    /** Compact mode */
    compact?: boolean;
    /** Auto-refresh interval (seconds) */
    refreshInterval?: number;
  };
  
  /** Deployment history */
  deploymentHistory?: Array<{
    id: string;
    timestamp: Date;
    status: 'success' | 'failed' | 'cancelled';
    duration: number;
    url?: string;
    error?: string;
    version?: string;
  }>;
  
  /** Action configuration */
  actions?: {
    /** Allow manual refresh */
    allowRefresh?: boolean;
    /** Allow deployment cancellation */
    allowCancel?: boolean;
    /** Allow retry on failure */
    allowRetry?: boolean;
    /** Show deployment history */
    showHistory?: boolean;
  };
  
  /** Status event handlers */
  onStatusChange?: (newStatus: DeploymentStatus) => void;
  onDeploymentComplete?: (result: PortalOperationResult) => void;
  onDeploymentError?: (error: PortalError) => void;
  onRefresh?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  
  /** Custom styling */
  styling?: {
    /** Progress bar color */
    progressColor?: string;
    /** Success color */
    successColor?: string;
    /** Error color */
    errorColor?: string;
    /** Warning color */
    warningColor?: string;
    /** Background color */
    backgroundColor?: string;
    /** Custom CSS classes */
    customClasses?: Record<string, string>;
  };
}

// ============================================================================
// PORTAL SECTIONS COMPONENT
// ============================================================================

/**
 * PortalSections.tsx component props
 * Dynamic section rendering and management
 */
export interface PortalSectionsProps extends PortalComponentProps {
  /** Sections to render */
  sections: PortalSection[];
  
  /** Section management configuration */
  sectionConfig?: {
    /** Allow section reordering */
    allowReordering?: boolean;
    /** Allow section visibility toggle */
    allowToggle?: boolean;
    /** Allow section editing */
    allowEditing?: boolean;
    /** Section layout mode */
    layout?: 'vertical' | 'horizontal' | 'grid' | 'masonry';
    /** Section spacing */
    spacing?: 'compact' | 'normal' | 'relaxed';
    /** Animation settings */
    animations?: {
      enabled?: boolean;
      duration?: number;
      easing?: string;
    };
  };
  
  /** Rendering options */
  renderOptions?: {
    /** Lazy load sections */
    lazyLoad?: boolean;
    /** Virtualization for large lists */
    virtualization?: boolean;
    /** Error boundaries per section */
    errorBoundaries?: boolean;
    /** Loading placeholders */
    loadingPlaceholders?: boolean;
  };
  
  /** Section templates */
  templates?: {
    /** Default section template */
    default?: React.ComponentType<any>;
    /** Section-specific templates */
    [sectionType: string]: React.ComponentType<any>;
  };
  
  /** Section event handlers */
  onSectionReorder?: (newOrder: PortalSection[]) => void;
  onSectionToggle?: (sectionId: string, visible: boolean) => void;
  onSectionEdit?: (sectionId: string, newData: any) => void;
  onSectionLoad?: (sectionId: string) => void;
  onSectionError?: (sectionId: string, error: PortalError) => void;
  
  /** Custom section renderers */
  customRenderers?: {
    [sectionType: string]: React.ComponentType<{
      section: PortalSection;
      config: any;
      onUpdate?: (data: any) => void;
      onError?: (error: PortalError) => void;
    }>;
  };
}

// ============================================================================
// PORTAL QR INTEGRATION COMPONENT
// ============================================================================

/**
 * PortalQRIntegration.tsx component props
 * QR code generation and integration features
 */
export interface PortalQRIntegrationProps extends PortalComponentProps {
  /** QR code configuration */
  qrConfig: QRCodeConfig;
  
  /** QR display settings */
  displaySettings?: {
    /** QR code size */
    size?: 'small' | 'medium' | 'large' | 'custom';
    /** Custom size (if size is 'custom') */
    customSize?: number;
    /** Display style */
    style?: 'card' | 'minimal' | 'prominent' | 'floating';
    /** Show title */
    showTitle?: boolean;
    /** Custom title */
    title?: string;
    /** Show instructions */
    showInstructions?: boolean;
    /** Custom instructions */
    instructions?: string;
    /** Show download options */
    showDownload?: boolean;
    /** Show share options */
    showShare?: boolean;
  };
  
  /** Download configuration */
  downloadConfig?: {
    /** Available formats */
    formats?: Array<'png' | 'svg' | 'pdf' | 'jpeg'>;
    /** Default format */
    defaultFormat?: 'png' | 'svg' | 'pdf' | 'jpeg';
    /** Filename template */
    filenameTemplate?: string;
    /** Include metadata */
    includeMetadata?: boolean;
    /** Custom sizes for download */
    customSizes?: number[];
  };
  
  /** Analytics configuration */
  analytics?: {
    /** Track QR generation */
    trackGeneration?: boolean;
    /** Track QR scans */
    trackScans?: boolean;
    /** Analytics provider */
    provider?: 'google' | 'custom';
    /** Custom tracking function */
    customTracker?: (event: string, data: any) => void;
  };
  
  /** QR event handlers */
  onQRGenerated?: (qrData: QRCodeData) => void;
  onQRScanned?: (scanData: any) => void;
  onDownload?: (format: string, data: Blob) => void;
  onShare?: (shareData: any) => void;
  onError?: (error: PortalError) => void;
  
  /** Customization options */
  customization?: {
    /** Custom colors */
    colors?: {
      foreground?: string;
      background?: string;
      gradient?: {
        start: string;
        end: string;
      };
    };
    /** Logo settings */
    logo?: {
      enabled?: boolean;
      url?: string;
      size?: number;
      style?: 'square' | 'rounded' | 'circle';
    };
    /** Border settings */
    border?: {
      enabled?: boolean;
      width?: number;
      color?: string;
      style?: 'solid' | 'dashed' | 'dotted';
    };
    /** Shadow settings */
    shadow?: {
      enabled?: boolean;
      color?: string;
      blur?: number;
      offset?: { x: number; y: number };
    };
  };
}

// ============================================================================
// PORTAL CHAT INTERFACE COMPONENT
// ============================================================================

/**
 * PortalChatInterface.tsx component props
 * AI-powered chat with RAG functionality
 */
export interface PortalChatInterfaceProps extends PortalComponentProps {
  /** Chat configuration */
  chatConfig: ChatConfig;
  
  /** Initial chat state */
  initialState?: {
    /** Welcome message */
    welcomeMessage?: string;
    /** Suggested questions */
    suggestedQuestions?: string[];
    /** Initial messages */
    messages?: ChatMessage[];
  };
  
  /** UI customization */
  uiCustomization?: {
    /** Chat position */
    position?: 'bottom-right' | 'bottom-left' | 'embedded' | 'fullscreen';
    /** Chat size */
    size?: 'small' | 'medium' | 'large' | 'custom';
    /** Custom dimensions (if size is 'custom') */
    customDimensions?: {
      width?: string;
      height?: string;
    };
    /** Theme */
    theme?: 'light' | 'dark' | 'auto' | 'custom';
    /** Custom colors */
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
      userMessage?: string;
      botMessage?: string;
      border?: string;
    };
    /** Typography */
    typography?: {
      fontFamily?: string;
      fontSize?: string;
      lineHeight?: string;
    };
  };
  
  /** Feature configuration */
  features?: {
    /** Enable typing indicators */
    typingIndicators?: boolean;
    /** Enable message reactions */
    reactions?: boolean;
    /** Enable message timestamps */
    timestamps?: boolean;
    /** Enable message search */
    search?: boolean;
    /** Enable conversation export */
    export?: boolean;
    /** Enable voice input */
    voiceInput?: boolean;
    /** Enable file uploads */
    fileUploads?: boolean;
    /** Maximum file size (MB) */
    maxFileSize?: number;
    /** Allowed file types */
    allowedFileTypes?: string[];
  };
  
  /** RAG configuration */
  ragConfig?: {
    /** Enable RAG */
    enabled?: boolean;
    /** Show source documents */
    showSources?: boolean;
    /** Maximum source documents */
    maxSources?: number;
    /** Minimum similarity threshold */
    similarityThreshold?: number;
    /** Custom context prompt */
    contextPrompt?: string;
  };
  
  /** Rate limiting */
  rateLimiting?: {
    /** Enable rate limiting */
    enabled?: boolean;
    /** Messages per minute */
    messagesPerMinute?: number;
    /** Warning message */
    warningMessage?: string;
    /** Blocked message */
    blockedMessage?: string;
  };
  
  /** Chat event handlers */
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  onChatOpen?: () => void;
  onChatClose?: () => void;
  onError?: (error: PortalError) => void;
  onReactionAdd?: (messageId: string, reaction: string) => void;
  onFileUpload?: (file: File) => void;
  
  /** Advanced configuration */
  advanced?: {
    /** Custom message renderer */
    messageRenderer?: React.ComponentType<{
      message: ChatMessage;
      isUser: boolean;
      showTimestamp: boolean;
      onReaction?: (reaction: string) => void;
    }>;
    /** Custom input component */
    inputComponent?: React.ComponentType<{
      onSend: (message: string) => void;
      disabled?: boolean;
      placeholder?: string;
    }>;
    /** Custom welcome screen */
    welcomeComponent?: React.ComponentType<{
      suggestedQuestions: string[];
      onQuestionClick: (question: string) => void;
    }>;
    /** Custom error handler */
    errorHandler?: (error: PortalError) => ReactNode;
    /** Custom loading indicator */
    loadingIndicator?: ReactNode;
  };
}

// ============================================================================
// COMMON COMPONENT INTERFACES
// ============================================================================

/**
 * Base portal component props that all portal components extend
 */
export interface BasePortalComponentProps extends CVFeatureProps {
  /** Portal configuration */
  portalConfig: PortalConfig;
  
  /** Common styling props */
  style?: CSSProperties;
  
  /** Common CSS classes */
  className?: string;
  
  /** Component visibility */
  visible?: boolean;
  
  /** Component loading state */
  loading?: boolean;
  
  /** Component error state */
  error?: PortalError;
  
  /** Common event handlers */
  onLoad?: () => void;
  onError?: (error: PortalError) => void;
  onVisibilityChange?: (visible: boolean) => void;
  
  /** Accessibility props */
  accessibility?: {
    /** ARIA label */
    ariaLabel?: string;
    /** ARIA description */
    ariaDescription?: string;
    /** Tab index */
    tabIndex?: number;
    /** Skip link target */
    skipLinkTarget?: boolean;
  };
  
  /** Testing props */
  testId?: string;
  
  /** Debug mode */
  debug?: boolean;
}

/**
 * Portal component wrapper props for enhanced functionality
 */
export interface PortalComponentWrapperProps {
  /** Wrapped component */
  children: ReactNode;
  
  /** Error boundary configuration */
  errorBoundary?: {
    /** Enable error boundary */
    enabled?: boolean;
    /** Custom error fallback */
    fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
    /** Error reporting */
    onError?: (error: Error, errorInfo: any) => void;
  };
  
  /** Performance monitoring */
  performance?: {
    /** Enable performance tracking */
    enabled?: boolean;
    /** Performance thresholds */
    thresholds?: {
      loadTime?: number;
      renderTime?: number;
    };
    /** Performance callback */
    onPerformanceData?: (data: any) => void;
  };
  
  /** Analytics integration */
  analytics?: {
    /** Enable analytics */
    enabled?: boolean;
    /** Component identifier */
    componentId?: string;
    /** Track interactions */
    trackInteractions?: boolean;
    /** Custom analytics data */
    customData?: Record<string, any>;
  };
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  PortalLayoutProps,
  PortalDeploymentStatusProps,
  PortalSectionsProps,
  PortalQRIntegrationProps,
  PortalChatInterfaceProps,
  BasePortalComponentProps,
  PortalComponentWrapperProps,
};