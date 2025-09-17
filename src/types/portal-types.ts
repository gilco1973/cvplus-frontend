/**
 * CVPlus Portal System TypeScript Interfaces
 * 
 * Comprehensive type definitions for the portal system React components
 * including HuggingFace Spaces deployment, RAG-based AI chat, QR integration,
 * and real-time deployment status tracking.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { ReactNode } from 'react';
import { CVFeatureProps, FeatureCustomization } from './cv-features';
import { CVData } from './cvData';
import { User } from './firebase-types';
import { ServiceResult, ApiResponse } from './service-types';
import { AppError } from './error-handling';

// ============================================================================
// BASE PORTAL INTERFACES
// ============================================================================

/**
 * Base configuration for portal components
 */
export interface PortalConfig {
  /** Portal unique identifier */
  id: string;
  /** User-friendly portal name */
  name: string;
  /** Portal description */
  description?: string;
  /** Portal visibility setting */
  visibility: 'public' | 'private' | 'unlisted';
  /** Custom domain or subdomain */
  customDomain?: string;
  /** Portal theme configuration */
  theme: PortalTheme;
  /** Feature enablement flags */
  features: PortalFeatures;
  /** SEO and metadata */
  metadata: PortalMetadata;
  /** Creation and update timestamps */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Portal theme and styling configuration
 */
export interface PortalTheme {
  /** Primary theme color */
  primaryColor: string;
  /** Secondary theme color */
  secondaryColor: string;
  /** Background color or gradient */
  backgroundColor: string;
  /** Text color scheme */
  textColor: string;
  /** Font family selection */
  fontFamily: string;
  /** Layout style */
  layout: 'modern' | 'classic' | 'minimal' | 'creative';
  /** Animation preferences */
  animations: boolean;
  /** Dark mode support */
  darkMode: boolean;
}

/**
 * Portal feature enablement configuration
 */
export interface PortalFeatures {
  /** Enable AI chat functionality */
  aiChat: boolean;
  /** Enable QR code generation and display */
  qrCode: boolean;
  /** Enable contact form */
  contactForm: boolean;
  /** Enable calendar integration */
  calendar: boolean;
  /** Enable portfolio gallery */
  portfolio: boolean;
  /** Enable social media links */
  socialLinks: boolean;
  /** Enable testimonials section */
  testimonials: boolean;
  /** Enable analytics tracking */
  analytics: boolean;
}

/**
 * Portal SEO and metadata configuration
 */
export interface PortalMetadata {
  /** Page title */
  title: string;
  /** Meta description */
  description: string;
  /** Meta keywords */
  keywords: string[];
  /** Open Graph image */
  ogImage?: string;
  /** Canonical URL */
  canonicalUrl?: string;
  /** Custom meta tags */
  customMeta?: Record<string, string>;
}

// ============================================================================
// PORTAL COMPONENT PROPS
// ============================================================================

/**
 * Extended CVFeatureProps for portal-enabled components
 */
export interface PortalComponentProps extends CVFeatureProps {
  /** Portal-specific configuration */
  portalConfig: PortalConfig;
  /** Deployment status information */
  deploymentStatus?: DeploymentStatus;
  /** Portal URL once deployed */
  portalUrl?: string;
  /** Error handling for portal operations */
  onPortalError?: (error: PortalError) => void;
  /** Success callback for portal operations */
  onPortalSuccess?: (result: PortalOperationResult) => void;
}

/**
 * PortalLayout component props
 */
export interface PortalLayoutProps extends PortalComponentProps {
  /** Child components to render within layout */
  children: ReactNode;
  /** Header configuration */
  header?: PortalHeaderConfig;
  /** Footer configuration */
  footer?: PortalFooterConfig;
  /** Navigation configuration */
  navigation?: PortalNavigationConfig;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: PortalError;
}

/**
 * Portal header configuration
 */
export interface PortalHeaderConfig {
  /** Show user avatar/photo */
  showAvatar: boolean;
  /** Show user name */
  showName: boolean;
  /** Show user title/role */
  showTitle: boolean;
  /** Custom header content */
  customContent?: ReactNode;
  /** Header style variant */
  variant: 'minimal' | 'standard' | 'prominent';
}

/**
 * Portal footer configuration
 */
export interface PortalFooterConfig {
  /** Show copyright notice */
  showCopyright: boolean;
  /** Show "Powered by CVPlus" branding */
  showBranding: boolean;
  /** Custom footer links */
  customLinks?: Array<{
    label: string;
    url: string;
    external?: boolean;
  }>;
  /** Footer style variant */
  variant: 'minimal' | 'standard' | 'detailed';
}

/**
 * Portal navigation configuration
 */
export interface PortalNavigationConfig {
  /** Navigation items */
  items: PortalNavigationItem[];
  /** Navigation position */
  position: 'top' | 'side' | 'bottom';
  /** Navigation style */
  style: 'tabs' | 'pills' | 'underline' | 'sidebar';
  /** Show section anchors */
  showAnchors: boolean;
}

/**
 * Portal navigation item
 */
export interface PortalNavigationItem {
  /** Item ID */
  id: string;
  /** Display label */
  label: string;
  /** Target section or URL */
  target: string;
  /** Item icon */
  icon?: string;
  /** Item visibility */
  visible: boolean;
  /** Item order */
  order: number;
}

// ============================================================================
// DEPLOYMENT STATUS TYPES
// ============================================================================

/**
 * PortalDeploymentStatus component props
 */
export interface PortalDeploymentStatusProps extends PortalComponentProps {
  /** Current deployment status */
  status: DeploymentStatus;
  /** Deployment history */
  history?: DeploymentHistoryEntry[];
  /** Show detailed deployment logs */
  showLogs?: boolean;
  /** Auto-refresh interval in seconds */
  refreshInterval?: number;
  /** Callback when deployment completes */
  onDeploymentComplete?: (result: DeploymentResult) => void;
  /** Callback when deployment fails */
  onDeploymentError?: (error: DeploymentError) => void;
}

/**
 * Deployment status information
 */
export interface DeploymentStatus {
  /** Current deployment phase */
  phase: DeploymentPhase;
  /** Overall progress percentage */
  progress: number;
  /** Current operation description */
  currentOperation: string;
  /** Deployment start time */
  startedAt: Date;
  /** Estimated completion time */
  estimatedCompletion?: Date;
  /** Deployment URL (when ready) */
  url?: string;
  /** Error information (if failed) */
  error?: DeploymentError;
  /** Detailed status logs */
  logs: DeploymentLogEntry[];
}

/**
 * Deployment phases
 */
export type DeploymentPhase = 
  | 'initializing'
  | 'validating'
  | 'preparing'
  | 'uploading'
  | 'building'
  | 'deploying'
  | 'testing'
  | 'completed'
  | 'failed';

/**
 * Deployment log entry
 */
export interface DeploymentLogEntry {
  /** Log entry timestamp */
  timestamp: Date;
  /** Log level */
  level: 'info' | 'warning' | 'error' | 'success';
  /** Log message */
  message: string;
  /** Additional log data */
  data?: Record<string, any>;
}

/**
 * Deployment history entry
 */
export interface DeploymentHistoryEntry {
  /** Deployment ID */
  id: string;
  /** Deployment timestamp */
  timestamp: Date;
  /** Final status */
  status: 'success' | 'failed' | 'cancelled';
  /** Deployment duration */
  duration: number;
  /** Portal URL (if successful) */
  url?: string;
  /** Error information (if failed) */
  error?: DeploymentError;
  /** Deployment version/commit */
  version?: string;
}

// ============================================================================
// PORTAL SECTIONS TYPES
// ============================================================================

/**
 * PortalSections component props
 */
export interface PortalSectionsProps extends PortalComponentProps {
  /** Available sections to display */
  sections: PortalSection[];
  /** Section display configuration */
  sectionConfig: PortalSectionConfig;
  /** Drag and drop support */
  allowReordering?: boolean;
  /** Section visibility controls */
  allowToggle?: boolean;
  /** Callback when sections are reordered */
  onSectionsReorder?: (sections: PortalSection[]) => void;
  /** Callback when section visibility changes */
  onSectionToggle?: (sectionId: string, visible: boolean) => void;
}

/**
 * Portal section definition
 */
export interface PortalSection {
  /** Section unique identifier */
  id: string;
  /** Section display name */
  name: string;
  /** Section type */
  type: PortalSectionType;
  /** Section content data */
  data: any;
  /** Section visibility */
  visible: boolean;
  /** Section display order */
  order: number;
  /** Section customization */
  customization?: PortalSectionCustomization;
  /** Section loading state */
  isLoading?: boolean;
  /** Section error state */
  error?: string;
}

/**
 * Portal section types
 */
export type PortalSectionType = 
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'achievements'
  | 'certifications'
  | 'languages'
  | 'testimonials'
  | 'contact'
  | 'portfolio'
  | 'social'
  | 'custom';

/**
 * Section display configuration
 */
export interface PortalSectionConfig {
  /** Default sections to show */
  defaultSections: string[];
  /** Maximum sections allowed */
  maxSections: number;
  /** Section layout style */
  layout: 'vertical' | 'horizontal' | 'grid' | 'masonry';
  /** Section spacing */
  spacing: 'compact' | 'normal' | 'relaxed';
  /** Section animations */
  animations: boolean;
}

/**
 * Section-specific customization
 */
export interface PortalSectionCustomization extends FeatureCustomization {
  /** Section background */
  background?: string;
  /** Section border */
  border?: string;
  /** Section padding */
  padding?: string;
  /** Section margin */
  margin?: string;
  /** Custom CSS classes */
  cssClasses?: string[];
}

// ============================================================================
// QR INTEGRATION TYPES
// ============================================================================

/**
 * PortalQRIntegration component props
 */
export interface PortalQRIntegrationProps extends PortalComponentProps {
  /** QR code configuration */
  qrConfig: QRCodeConfig;
  /** QR code display options */
  displayOptions: QRDisplayOptions;
  /** Download options */
  downloadOptions?: QRDownloadOptions;
  /** Callback when QR code is generated */
  onQRGenerated?: (qrData: QRCodeData) => void;
  /** Callback when QR code is scanned */
  onQRScanned?: (scanData: QRScanData) => void;
}

/**
 * QR code configuration
 */
export interface QRCodeConfig {
  /** Target URL for QR code */
  url: string;
  /** QR code size in pixels */
  size: number;
  /** Error correction level */
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  /** QR code colors */
  colors: {
    foreground: string;
    background: string;
  };
  /** Include logo/avatar in center */
  includeLogo?: boolean;
  /** Logo URL */
  logoUrl?: string;
  /** Logo size ratio (0-0.3) */
  logoSizeRatio?: number;
}

/**
 * QR code display options
 */
export interface QRDisplayOptions {
  /** Show QR code title */
  showTitle: boolean;
  /** QR code title text */
  title?: string;
  /** Show scan instructions */
  showInstructions: boolean;
  /** Custom instructions text */
  instructionsText?: string;
  /** Display style */
  style: 'card' | 'minimal' | 'prominent';
  /** Show download button */
  showDownload: boolean;
  /** Show share button */
  showShare: boolean;
}

/**
 * QR code download options
 */
export interface QRDownloadOptions {
  /** Available download formats */
  formats: QRDownloadFormat[];
  /** Default download format */
  defaultFormat: QRDownloadFormat;
  /** Download filename template */
  filenameTemplate: string;
  /** Include metadata in download */
  includeMetadata: boolean;
}

/**
 * QR download format
 */
export type QRDownloadFormat = 'png' | 'svg' | 'pdf' | 'jpeg';

/**
 * QR code data
 */
export interface QRCodeData {
  /** Generated QR code URL/data */
  qrCodeUrl: string;
  /** Target URL */
  targetUrl: string;
  /** QR code dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  /** Generation timestamp */
  generatedAt: Date;
  /** QR code format */
  format: string;
}

/**
 * QR scan data
 */
export interface QRScanData {
  /** Scan timestamp */
  scannedAt: Date;
  /** Scanned URL */
  url: string;
  /** Scanner user agent */
  userAgent?: string;
  /** Scanner location (if available) */
  location?: {
    country?: string;
    city?: string;
  };
  /** Referrer information */
  referrer?: string;
}

// ============================================================================
// CHAT INTERFACE TYPES
// ============================================================================

/**
 * PortalChatInterface component props
 */
export interface PortalChatInterfaceProps extends PortalComponentProps {
  /** Chat configuration */
  chatConfig: ChatConfig;
  /** Initial messages */
  initialMessages?: ChatMessage[];
  /** Chat history */
  messageHistory?: ChatMessage[];
  /** Chat UI customization */
  uiConfig?: ChatUIConfig;
  /** Message callbacks */
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onChatError?: (error: ChatError) => void;
}

/**
 * Chat configuration
 */
export interface ChatConfig {
  /** Enable RAG (Retrieval Augmented Generation) */
  enableRAG: boolean;
  /** AI model configuration */
  model: ChatModelConfig;
  /** Vector search configuration */
  vectorSearch: VectorSearchConfig;
  /** Chat behavior settings */
  behavior: ChatBehaviorConfig;
  /** Rate limiting */
  rateLimiting: ChatRateLimitConfig;
}

/**
 * Chat model configuration
 */
export interface ChatModelConfig {
  /** Model name/identifier */
  modelName: string;
  /** Model parameters */
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  /** System prompt template */
  systemPrompt: string;
  /** Context window size */
  contextWindowSize: number;
}

/**
 * Vector search configuration for RAG
 */
export interface VectorSearchConfig {
  /** Number of similar documents to retrieve */
  topK: number;
  /** Similarity threshold */
  threshold: number;
  /** Search algorithm */
  algorithm: 'cosine' | 'euclidean' | 'dot_product';
  /** Enable hybrid search (keyword + vector) */
  hybridSearch: boolean;
  /** Metadata filters */
  filters?: Record<string, any>;
}

/**
 * Chat behavior configuration
 */
export interface ChatBehaviorConfig {
  /** Welcome message */
  welcomeMessage: string;
  /** Suggested questions */
  suggestedQuestions: string[];
  /** Enable typing indicators */
  showTyping: boolean;
  /** Message timeout (ms) */
  messageTimeout: number;
  /** Auto-scroll to latest message */
  autoScroll: boolean;
  /** Enable message reactions */
  enableReactions: boolean;
}

/**
 * Chat rate limiting configuration
 */
export interface ChatRateLimitConfig {
  /** Messages per minute */
  messagesPerMinute: number;
  /** Messages per hour */
  messagesPerHour: number;
  /** Enable rate limiting */
  enabled: boolean;
  /** Rate limit exceeded message */
  rateLimitMessage: string;
}

/**
 * Chat UI customization
 */
export interface ChatUIConfig {
  /** Chat widget position */
  position: 'bottom-right' | 'bottom-left' | 'embedded';
  /** Chat widget size */
  size: 'small' | 'medium' | 'large';
  /** Color scheme */
  colorScheme: 'light' | 'dark' | 'auto';
  /** Custom CSS */
  customCSS?: string;
  /** Avatar configuration */
  avatar: {
    showUserAvatar: boolean;
    showBotAvatar: boolean;
    botAvatarUrl?: string;
  };
  /** Message styling */
  messageStyle: {
    bubbleStyle: 'rounded' | 'square' | 'minimal';
    showTimestamps: boolean;
    showReadReceipts: boolean;
  };
}

/**
 * Chat message interface
 */
export interface ChatMessage {
  /** Message unique identifier */
  id: string;
  /** Message content */
  content: string;
  /** Message sender */
  sender: 'user' | 'assistant' | 'system';
  /** Message timestamp */
  timestamp: Date;
  /** Message type */
  type: 'text' | 'image' | 'file' | 'system';
  /** Message metadata */
  metadata?: ChatMessageMetadata;
  /** Message status */
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  /** Referenced documents (for RAG) */
  sourceDocuments?: RAGSourceDocument[];
}

/**
 * Chat message metadata
 */
export interface ChatMessageMetadata {
  /** Processing time (ms) */
  processingTime?: number;
  /** Token usage */
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  /** Confidence score */
  confidence?: number;
  /** Message reactions */
  reactions?: ChatReaction[];
  /** Edit history */
  editHistory?: Date[];
}

/**
 * Chat reaction
 */
export interface ChatReaction {
  /** Reaction emoji */
  emoji: string;
  /** User who reacted */
  userId?: string;
  /** Reaction timestamp */
  timestamp: Date;
}

/**
 * RAG source document
 */
export interface RAGSourceDocument {
  /** Document ID */
  id: string;
  /** Document content excerpt */
  content: string;
  /** Document section */
  section: string;
  /** Similarity score */
  score: number;
  /** Document metadata */
  metadata: Record<string, any>;
}

// ============================================================================
// HUGGINGFACE INTEGRATION TYPES
// ============================================================================

/**
 * HuggingFace Space configuration
 */
export interface HuggingFaceSpaceConfig {
  /** Space name */
  name: string;
  /** Space visibility */
  visibility: 'public' | 'private';
  /** Space SDK */
  sdk: 'gradio' | 'streamlit' | 'docker' | 'static';
  /** Hardware tier */
  hardware: 'cpu-basic' | 'cpu-upgrade' | 'gpu-basic' | 'gpu-upgrade';
  /** Space description */
  description?: string;
  /** Space license */
  license?: string;
  /** Custom domain */
  customDomain?: string;
}

/**
 * Deployment result
 */
export interface DeploymentResult {
  /** Deployment success status */
  success: boolean;
  /** Deployed space URL */
  spaceUrl?: string;
  /** Space ID */
  spaceId?: string;
  /** Deployment timestamp */
  deployedAt: Date;
  /** Deployment duration */
  duration: number;
  /** Build logs */
  buildLogs?: string[];
  /** Error information */
  error?: DeploymentError;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Portal-specific error codes
 */
export type PortalErrorCode = 
  | 'PORTAL_CONFIG_INVALID'
  | 'DEPLOYMENT_FAILED'
  | 'HUGGINGFACE_API_ERROR'
  | 'VECTOR_SEARCH_ERROR'
  | 'CHAT_SERVICE_ERROR'
  | 'QR_GENERATION_ERROR'
  | 'SECTION_RENDER_ERROR'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'RESOURCE_NOT_FOUND'
  | 'SERVICE_UNAVAILABLE';

/**
 * Portal error interface
 */
export interface PortalError extends AppError {
  /** Portal-specific error code */
  code: PortalErrorCode;
  /** Portal component where error occurred */
  component?: string;
  /** Portal operation that failed */
  operation?: string;
  /** Additional error context */
  context?: Record<string, any>;
}

/**
 * Deployment error interface
 */
export interface DeploymentError extends PortalError {
  /** Deployment phase where error occurred */
  phase: DeploymentPhase;
  /** Build logs */
  buildLogs?: string[];
  /** HuggingFace API response */
  apiResponse?: any;
}

/**
 * Chat error interface
 */
export interface ChatError extends PortalError {
  /** Chat operation that failed */
  chatOperation: 'send_message' | 'load_history' | 'vector_search' | 'model_inference';
  /** Message ID (if applicable) */
  messageId?: string;
}

// ============================================================================
// OPERATION RESULT TYPES
// ============================================================================

/**
 * Portal operation result
 */
export interface PortalOperationResult {
  /** Operation success status */
  success: boolean;
  /** Operation type */
  operation: PortalOperationType;
  /** Result data */
  data?: any;
  /** Operation duration */
  duration: number;
  /** Operation timestamp */
  timestamp: Date;
}

/**
 * Portal operation types
 */
export type PortalOperationType = 
  | 'deploy'
  | 'update'
  | 'delete'
  | 'configure'
  | 'validate'
  | 'generate_qr'
  | 'send_message'
  | 'search_vectors'
  | 'render_section';

// ============================================================================
// VECTOR EMBEDDING TYPES (for RAG)
// ============================================================================

/**
 * RAG embedding interface
 */
export interface RAGEmbedding {
  /** Embedding ID */
  id: string;
  /** Original content */
  content: string;
  /** Vector embedding */
  vector: number[];
  /** Content metadata */
  metadata: EmbeddingMetadata;
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Embedding metadata
 */
export interface EmbeddingMetadata {
  /** CV section this embedding belongs to */
  section: CVSection;
  /** Content type */
  contentType: 'text' | 'title' | 'summary' | 'achievement' | 'skill';
  /** Content importance score */
  importance: number;
  /** Content language */
  language?: string;
  /** Additional custom metadata */
  custom?: Record<string, any>;
}

/**
 * CV section types for embeddings
 */
export type CVSection = 
  | 'personal_info'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'achievements'
  | 'certifications'
  | 'projects'
  | 'languages'
  | 'references';

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Portal service response wrapper
 */
export type PortalServiceResult<T> = ServiceResult<T, PortalError>;

/**
 * Portal API response wrapper
 */
export type PortalApiResponse<T> = ApiResponse<T>;

/**
 * Portal component state
 */
export interface PortalComponentState<T = any> {
  /** Component data */
  data: T | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: PortalError | null;
  /** Last updated timestamp */
  lastUpdated?: Date;
}

/**
 * Portal analytics data
 */
export interface PortalAnalytics {
  /** Total portal views */
  views: number;
  /** Unique visitors */
  uniqueVisitors: number;
  /** Chat interactions */
  chatInteractions: number;
  /** QR code scans */
  qrScans: number;
  /** Average session duration */
  avgSessionDuration: number;
  /** Popular sections */
  popularSections: Array<{
    section: string;
    views: number;
  }>;
  /** Traffic sources */
  trafficSources: Array<{
    source: string;
    visits: number;
  }>;
}