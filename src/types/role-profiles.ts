/**
 * Role Profile System Types
 * TypeScript definitions for role detection and profile management
 */

export interface RoleProfile {
  id: string;
  name: string;
  description?: string;
  category: string;
  experienceLevel?: 'junior' | 'mid' | 'senior' | 'executive';
  industryFocus?: string[];
  keySkills?: string[];
  matchingCriteria: {
    titles: string[];
    skills: string[];
    experience: string[];
    industry: string[];
    education?: string[];
  };
  enhancementTemplates: {
    professionalSummary?: string;
    skillsStructure?: any;
    experienceEnhancements?: any[];
    achievementTemplates?: string[];
    keywordOptimization?: string[];
  };
  validationRules?: {
    requiredSections: string[];
    criticalSkills: string[];
    experienceRequirements?: any[];
  };
  metadata: {
    version: string;
    category: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface DetectedRole {
  roleId: string;
  roleName: string;
  confidence: number;
  matchingFactors: string[];
  enhancementPotential: number;
  recommendations: string[];
  scoringReasoning?: string;
}

export interface RoleProfileAnalysis {
  primaryRole: DetectedRole;
  alternativeRoles: DetectedRole[];
  analysisMetadata: {
    processedAt: string;
    confidenceThreshold: number;
    algorithmVersion: string;
  };
  recommendationsCount?: number;
  overallConfidence: number;
  suggestedAction: 'apply_primary' | 'review_alternatives' | 'manual_selection';
}

export interface RoleBasedRecommendation {
  id: string;
  title: string;
  description: string;
  section: string;
  type: 'content' | 'structure' | 'keyword' | 'section';
  priority: 'high' | 'medium' | 'low';
  currentContent?: string;
  suggestedContent?: string;
  estimatedScoreImprovement?: number;
  roleSpecific?: boolean;
  roleProfileId?: string;
}

export interface RoleDetectionConfig {
  confidenceThreshold: number;
  maxResults: number;
  enableMultiRoleDetection: boolean;
  weightingFactors: {
    title: number;
    skills: number;
    experience: number;
    industry: number;
    education: number;
  };
}

export interface RoleApplicationResult {
  success: boolean;
  jobId: string;
  appliedRole: {
    roleId: string;
    roleName: string;
    appliedAt: string;
  };
  transformedCV?: any;
  recommendations?: RoleBasedRecommendation[];
  transformationSummary?: any;
  comparisonReport?: any;
  enhancementPotential: number;
}

export interface RoleProfilesResponse {
  success: boolean;
  data: {
    profiles: RoleProfile[];
    totalCount: number;
    availableCategories: string[];
    availableExperienceLevels: string[];
    metrics: {
      popularRoles: any[];
      totalProfilesAvailable: number;
    };
  };
}

export interface RoleDetectionResponse {
  success: boolean;
  data: {
    analysis: RoleProfileAnalysis;
    detectedRole: DetectedRole;
    cached: boolean;
    generatedAt: string;
    cacheAge?: number;
  };
}

export interface RoleBasedRecommendationsResponse {
  success: boolean;
  data: {
    recommendations: RoleBasedRecommendation[];
    cached: boolean;
    generatedAt: string;
    roleProfile?: {
      roleId: string;
      roleName: string;
      category: string;
    };
    targetRole?: string;
  };
}

// Utility types for component props
export type RoleCategory = 'Engineering' | 'Management' | 'HR' | 'AI/Data' | 'Marketing' | 'Design' | 'Finance' | 'Sales' | 'Operations';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'executive';
export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationType = 'content' | 'structure' | 'keyword' | 'section';

// Form interfaces
export interface RoleSelectionFormData {
  selectedRoleId?: string;
  customRole?: string;
  targetIndustry?: string;
  experienceLevel?: ExperienceLevel;
  customizationOptions?: {
    enhanceSummary?: boolean;
    optimizeSkills?: boolean;
    improveExperience?: boolean;
    addAchievements?: boolean;
    keywordOptimization?: boolean;
  };
}

export interface RoleProfileFilter {
  category?: string;
  experienceLevel?: ExperienceLevel;
  industryFocus?: string;
  searchQuery?: string;
}

// Error types
export interface RoleProfileError {
  code: string;
  message: string;
  details?: any;
}

// Analytics types
export interface RoleProfileMetrics {
  popularRoles: Array<{
    roleId: string;
    roleName: string;
    usageCount: number;
    averageConfidence: number;
  }>;
  detectionSuccessRate: number;
  averageProcessingTime: number;
  categoryDistribution: Record<string, number>;
}

// Firebase Function response wrapper
export interface FirebaseFunctionResponse<T = any> {
  data: {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  };
}

// Integration types for existing CVPlus components
export interface CVWithRoleData {
  originalCV: any;
  roleAnalysis?: RoleProfileAnalysis;
  appliedRoleProfile?: RoleProfile;
  roleBasedRecommendations?: RoleBasedRecommendation[];
  enhancementResults?: any;
}

export interface JobWithRoleData {
  id: string;
  userId: string;
  status: string;
  parsedData: any;
  roleAnalysis?: RoleProfileAnalysis;
  detectedRole?: DetectedRole;
  appliedRoleProfile?: {
    roleId: string;
    roleName: string;
    appliedAt: string;
    customizationOptions?: any;
  };
  roleBasedRecommendations?: RoleBasedRecommendation[];
  lastRoleDetection?: string;
  lastRoleApplication?: string;
}

// Component state types
export interface RoleProfileSelectorState {
  detectedRole: DetectedRole | null;
  analysis: RoleProfileAnalysis | null;
  availableRoles: RoleProfile[];
  selectedRoleProfile: RoleProfile | null;
  isDetecting: boolean;
  isApplying: boolean;
  error: string | null;
  showManualSelection: boolean;
}

export interface RoleBasedRecommendationsState {
  recommendations: RoleBasedRecommendation[];
  isLoading: boolean;
  error: string | null;
  expandedSections: Record<string, boolean>;
  selectedRecommendations: Set<string>;
}

// Navigation and routing types
export interface RoleProfileRouteParams {
  jobId: string;
  roleId?: string;
  step?: 'detection' | 'selection' | 'recommendations' | 'preview';
}

// Theme and styling types
export interface RoleProfileTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  confidenceIndicators: {
    high: { bg: string; text: string; ring: string };
    medium: { bg: string; text: string; ring: string };
    low: { bg: string; text: string; ring: string };
  };
  priorityColors: {
    high: { bg: string; text: string; badge: string };
    medium: { bg: string; text: string; badge: string };
    low: { bg: string; text: string; badge: string };
  };
}