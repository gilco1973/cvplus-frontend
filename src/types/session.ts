// Session Management Types for CVPlus Platform
// This file defines interfaces for comprehensive save-and-resume functionality

export interface SessionFormData {
  // File upload data
  selectedFile?: File | null;
  fileUrl?: string;
  userInstructions?: string;
  
  // Template and feature selections
  selectedTemplateId?: string;
  selectedFeatures?: string[];
  
  // Analysis data
  targetRole?: string;
  industryKeywords?: string[];
  jobDescription?: string;
  
  // User preferences
  quickCreate?: boolean;
  settings?: {
    applyAllEnhancements?: boolean;
    generateAllFormats?: boolean;
    enablePIIProtection?: boolean;
    createPodcast?: boolean;
    useRecommendedTemplate?: boolean;
  };
  
  // Form field data from various pages
  personalInfo?: Record<string, unknown>;
  workExperience?: Record<string, unknown>;
  education?: Record<string, unknown>;
  skills?: Record<string, unknown>;
  
  // Additional context data
  customizations?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface SessionState {
  // Session identification
  sessionId: string;
  userId?: string;
  jobId?: string;
  
  // Navigation state
  currentStep: CVStep;
  completedSteps: CVStep[];
  totalSteps?: number;
  
  // Progress tracking
  progressPercentage: number;
  lastActiveAt: Date;
  createdAt: Date;
  
  // Form and selection data
  formData: SessionFormData;
  
  // Processing state
  status: SessionStatus;
  processingStage?: string;
  
  // Error handling
  lastError?: string;
  retryCount?: number;
  
  // Resume metadata
  canResume: boolean;
  resumeUrl?: string;
  
  // Storage flags
  isLocalOnly?: boolean;
  isSynced?: boolean;
  lastSyncAt?: Date;
}

export type CVStep = 
  | 'upload'
  | 'processing' 
  | 'analysis'
  | 'features'
  | 'templates'
  | 'preview'
  | 'results'
  | 'keywords'
  | 'completed';

export type SessionStatus = 
  | 'draft'
  | 'in_progress' 
  | 'processing'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'expired';

export interface SessionStorageConfig {
  // Storage preferences
  enableLocalStorage: boolean;
  enableFirestoreSync: boolean;
  
  // Retention settings
  localStorageRetentionDays: number;
  firestoreRetentionDays: number;
  
  // Sync settings
  autoSyncInterval?: number; // milliseconds
  syncOnNetworkReconnect: boolean;
  
  // Compression settings
  compressData: boolean;
  compressionThreshold: number; // bytes
}

export interface ResumeSessionOptions {
  // Resume behavior
  navigateToStep: boolean;
  restoreFormData: boolean;
  showConfirmationDialog: boolean;
  
  // Data handling
  mergeWithCurrentState: boolean;
  clearOldSession: boolean;
  
  // UI preferences
  showProgressIndicator: boolean;
  animateTransitions: boolean;
}

export interface SessionMetrics {
  // Usage statistics
  totalSessions: number;
  completedSessions: number;
  resumedSessions: number;
  
  // Time metrics
  averageSessionDuration: number;
  averageStepsCompleted: number;
  
  // Performance metrics
  syncSuccessRate: number;
  errorRate: number;
  
  // User behavior
  mostCommonExitStep: CVStep;
  mostResumedStep: CVStep;
}

export interface SessionSearchCriteria {
  userId?: string;
  status?: SessionStatus[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  steps?: CVStep[];
  hasJobId?: boolean;
  canResume?: boolean;
  limit?: number;
  orderBy?: 'createdAt' | 'lastActiveAt' | 'progressPercentage';
  orderDirection?: 'asc' | 'desc';
}

// Event types for session management
export type SessionEvent = 
  | { type: 'SESSION_CREATED'; payload: { sessionId: string } }
  | { type: 'SESSION_UPDATED'; payload: { sessionId: string; changes: Partial<SessionState> } }
  | { type: 'SESSION_RESUMED'; payload: { sessionId: string; fromStep: CVStep } }
  | { type: 'SESSION_PAUSED'; payload: { sessionId: string; atStep: CVStep } }
  | { type: 'SESSION_COMPLETED'; payload: { sessionId: string; jobId: string } }
  | { type: 'SESSION_FAILED'; payload: { sessionId: string; error: string } }
  | { type: 'SESSION_SYNCED'; payload: { sessionId: string; syncedAt: Date } }
  | { type: 'SESSION_EXPIRED'; payload: { sessionId: string; expiredAt: Date } };

// Error types for session operations
export class SessionError extends Error {
  public code: SessionErrorCode;
  public sessionId?: string;
  public retryable: boolean;

  constructor(
    message: string,
    code: SessionErrorCode,
    sessionId?: string,
    retryable = false
  ) {
    super(message);
    this.name = 'SessionError';
    this.code = code;
    this.sessionId = sessionId;
    this.retryable = retryable;
  }
}

export type SessionErrorCode = 
  | 'SESSION_NOT_FOUND'
  | 'SESSION_EXPIRED'
  | 'SESSION_CORRUPTED'
  | 'STORAGE_UNAVAILABLE'
  | 'SYNC_FAILED'
  | 'PERMISSION_DENIED'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR';

// =====================================================================================
// ENHANCED SESSION STATE MANAGEMENT - Phase 1: Enhanced State Granularity
// =====================================================================================

export interface UserInteraction {
  id: string;
  type: 'click' | 'input' | 'navigation' | 'form_submit' | 'file_upload';
  timestamp: Date;
  element?: string;
  data?: Record<string, unknown>;
}

export interface SubstepProgress {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'error';
  data?: Record<string, unknown>;
  validationErrors?: string[];
  startedAt?: Date;
  completedAt?: Date;
}

export interface StepProgressState {
  stepId: CVStep;
  substeps: SubstepProgress[];
  completion: number; // 0-100
  timeSpent: number; // milliseconds
  userInteractions: UserInteraction[];
  lastModified: Date;
  estimatedTimeToComplete?: number;
  blockers?: string[];
}

export interface ConditionalRule {
  id: string;
  condition: string; // JavaScript expression
  action: 'enable' | 'disable' | 'require' | 'recommend' | 'hide' | 'show';
  target: string; // feature ID or step ID
  priority: number;
  description?: string;
}

export interface FeatureState {
  featureId: string;
  enabled: boolean;
  configuration: Record<string, unknown>;
  progress: {
    configured: boolean;
    processing: boolean;
    completed: boolean;
    error?: string;
    retryCount?: number;
    lastProcessedAt?: Date;
  };
  dependencies: string[];
  conditionalLogic?: ConditionalRule[];
  userPreferences?: Record<string, unknown>;
  metadata?: {
    estimatedDuration?: number;
    complexity?: 'low' | 'medium' | 'high';
    category?: string;
  };
}

export interface ProcessingCheckpoint {
  id: string;
  stepId: CVStep;
  featureId?: string;
  timestamp: Date;
  state: 'created' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Resume data
  resumeData: {
    functionName: string;
    parameters: Record<string, unknown>;
    partialResults?: unknown;
    progress?: number;
    executionContext?: Record<string, unknown>;
  };
  
  // Dependencies and requirements
  dependencies: string[];
  canSkip: boolean;
  priority: number;
  
  // Error recovery
  errorRecovery?: {
    retryCount: number;
    maxRetries: number;
    lastError?: string;
    fallbackStrategy?: string;
    nextRetryAt?: Date;
  };
  
  // Performance tracking
  performance?: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
}

export interface UIStateSnapshot {
  // Form states
  activeFormId?: string;
  formStates: Record<string, FormState>;
  
  // Navigation state
  currentUrl: string;
  previousUrls: string[];
  breadcrumbs: Breadcrumb[];
  
  // UI component states
  modals: {
    open: string[];
    history: string[];
  };
  
  // User preferences
  theme?: 'light' | 'dark' | 'auto';
  sidebarCollapsed?: boolean;
  viewMode?: 'compact' | 'detailed';
  
  // Scroll positions
  scrollPositions: Record<string, number>;
  
  // Selected items
  selections: Record<string, unknown>;
}

export interface ValidationResult {
  field: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
  timestamp: Date;
}

export interface ValidationStateSnapshot {
  formValidations: Record<string, ValidationResult[]>;
  stepValidations: Record<CVStep, ValidationResult[]>;
  globalValidations: ValidationResult[];
  lastValidatedAt: Date;
  validationVersion: string;
}

export interface Breadcrumb {
  id: string;
  label: string;
  url: string;
  step: CVStep;
  completed: boolean;
  accessible: boolean;
  metadata?: Record<string, unknown>;
}

export interface FormState {
  formId: string;
  fields: Record<string, FieldState>;
  metadata: {
    version: string;
    lastModified: Date;
    userAgent: string;
    formSchema: string;
    isDirty: boolean;
    isValid: boolean;
  };
  sections?: Record<string, SectionState>;
}

export interface FieldState {
  value: unknown;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  errors: string[];
  warnings: string[];
  lastModified: Date;
  validationRules?: string[];
  metadata?: Record<string, unknown>;
}

export interface SectionState {
  id: string;
  completed: boolean;
  visible: boolean;
  expanded: boolean;
  validationSummary: {
    valid: boolean;
    errorCount: number;
    warningCount: number;
  };
}

export interface NavigationState {
  sessionId: string;
  step: CVStep;
  substep?: string;
  parameters?: Record<string, unknown>;
  timestamp: Date;
  url: string;
  referrer?: string;
  transition?: 'push' | 'replace' | 'back' | 'forward';
}

// Enhanced Session State that extends the base SessionState
export interface EnhancedSessionState extends SessionState {
  // Fine-grained step progress
  stepProgress: Record<CVStep, StepProgressState>;
  
  // Feature-specific state
  featureStates: Record<string, FeatureState>;
  
  // Processing breakpoints
  processingCheckpoints: ProcessingCheckpoint[];
  
  // UI state preservation
  uiState: UIStateSnapshot;
  
  // Validation state
  validationResults: ValidationStateSnapshot;
  
  // Enhanced navigation
  navigationHistory: NavigationState[];
  
  // Performance metrics
  performanceMetrics: {
    loadTime: number;
    interactionCount: number;
    errorCount: number;
    averageResponseTime: number;
    memoryUsage?: number;
  };
  
  // Context preservation
  contextData: {
    userAgent: string;
    screenSize: { width: number; height: number };
    timezone: string;
    language: string;
    feature_flags?: Record<string, boolean>;
    experiments?: Record<string, string>;
  };
  
  // Version control for state schema
  schemaVersion: string;
  migrationHistory?: string[];
}

// =====================================================================================
// PHASE 2: Processing Intelligence & Queue Management
// =====================================================================================

export interface ProcessingJob {
  id: string;
  type: 'cv-processing' | 'feature-generation' | 'template-application' | 'data-extraction' | 'analysis';
  priority: number;
  dependencies: string[];
  retryCount: number;
  maxRetries: number;
  
  // Job-specific data
  payload: Record<string, unknown>;
  
  // Progress tracking
  progress: number;
  estimatedDuration?: number;
  startedAt?: Date;
  completedAt?: Date;
  
  // Error handling
  lastError?: string;
  failedAt?: Date;
  
  // Queue metadata
  queuedAt: Date;
  timeoutMs?: number;
  tags?: string[];
}

export interface ProcessingQueue {
  sessionId: string;
  jobs: ProcessingJob[];
  paused: boolean;
  processing: boolean;
  
  // Queue statistics
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  queuedJobs: number;
  
  // Performance metrics
  averageJobDuration: number;
  successRate: number;
  
  // Queue management
  createdAt: Date;
  lastProcessedAt?: Date;
  nextJobId?: string;
}

// =====================================================================================
// PHASE 3: Real-Time Synchronization & Conflict Resolution
// =====================================================================================

export interface StateChange {
  id: string;
  sessionId: string;
  timestamp: Date;
  changeType: 'create' | 'update' | 'delete';
  path: string; // JSONPath to the changed property
  oldValue?: unknown;
  newValue?: unknown;
  userId?: string;
  source: 'local' | 'remote' | 'system';
}

export interface ConflictResolution {
  conflictId: string;
  sessionId: string;
  conflicts: StateChange[];
  resolutionStrategy: 'local_wins' | 'remote_wins' | 'merge' | 'user_choice';
  resolvedValue: unknown;
  resolvedAt: Date;
  resolvedBy?: string;
}

export interface SyncStatus {
  sessionId: string;
  status: 'synced' | 'syncing' | 'conflicted' | 'offline' | 'error';
  lastSyncAt?: Date;
  pendingChanges: number;
  conflicts: ConflictResolution[];
  syncVersion: number;
}

export interface UserPresence {
  userId: string;
  sessionId: string;
  status: 'active' | 'idle' | 'away';
  lastSeen: Date;
  currentStep?: CVStep;
  device?: string;
  location?: string;
}

// =====================================================================================
// PHASE 4: Navigation Intelligence & Deep Linking
// =====================================================================================

export interface ResumeRecommendation {
  recommendedStep: CVStep;
  reason: string;
  timeToComplete: number; // estimated minutes
  confidence: number; // 0-1
  priority: 'low' | 'medium' | 'high';
  alternativeOptions: AlternativeResumeOption[];
  requiredData?: string[];
  warnings?: string[];
}

export interface AlternativeResumeOption {
  step: CVStep;
  reason: string;
  timeToComplete: number;
  confidence: number;
  pros: string[];
  cons: string[];
}

export interface ActionRecommendation {
  id: string;
  type: 'next_step' | 'optimize_data' | 'fix_error' | 'enable_feature' | 'complete_section';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: number; // minutes
  requiredSteps: string[];
  benefits: string[];
  url?: string;
}

export interface NavigationContext {
  sessionId: string;
  currentPath: string;
  availablePaths: NavigationPath[];
  blockedPaths: NavigationPath[];
  recommendedNextSteps: CVStep[];
  completionPercentage: number;
  criticalIssues: string[];
}

export interface NavigationPath {
  step: CVStep;
  url: string;
  label: string;
  accessible: boolean;
  completed: boolean;
  required: boolean;
  estimatedTime?: number;
  prerequisites?: CVStep[];
  warnings?: string[];
}

// =====================================================================================
// PHASE 5: Advanced Form Management & Auto-Save
// =====================================================================================

export interface AutoSaveConfig {
  enabled: boolean;
  intervalMs: number;
  maxRetries: number;
  saveOnBlur: boolean;
  saveOnChange: boolean;
  conflictStrategy: 'merge' | 'overwrite' | 'ask_user';
}

export interface FormValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'url' | 'pattern' | 'min_length' | 'max_length' | 'custom';
  value?: unknown;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface FormSchema {
  id: string;
  version: string;
  fields: FormFieldDefinition[];
  sections: FormSectionDefinition[];
  validationRules: FormValidationRule[];
  dependencies: FormDependency[];
}

export interface FormFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'multiselect' | 'file' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: unknown;
  options?: { value: unknown; label: string }[];
  validation?: FormValidationRule[];
}

export interface FormSectionDefinition {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  collapsible: boolean;
  defaultExpanded: boolean;
  conditionalDisplay?: ConditionalRule[];
}

export interface FormDependency {
  sourceField: string;
  targetField: string;
  type: 'show' | 'hide' | 'enable' | 'disable' | 'require';
  condition: string; // JavaScript expression
}

// =====================================================================================
// PHASE 6: Offline Capability & Action Queuing
// =====================================================================================

export interface OfflineAction {
  id: string;
  type: 'state_update' | 'file_upload' | 'api_call' | 'form_submit';
  payload: Record<string, unknown>;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: number;
  dependencies: string[];
  
  // Offline-specific data
  requiresNetwork: boolean;
  canExecuteOffline: boolean;
  fallbackAction?: OfflineAction;
}

export interface OfflineCapability {
  available: boolean;
  storageQuota: number;
  usedStorage: number;
  cachedSessions: string[];
  queuedActions: OfflineAction[];
  
  // Sync status
  lastOnlineAt?: Date;
  pendingSyncCount: number;
  syncInProgress: boolean;
}

export interface SyncResult {
  actionId: string;
  success: boolean;
  error?: string;
  conflictResolved?: boolean;
  syncedAt: Date;
  dataTransferred: number; // bytes
}