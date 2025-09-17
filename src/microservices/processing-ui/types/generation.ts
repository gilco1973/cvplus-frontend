// CV generation types for cv-processing-ui microservice

export interface GenerationRequest {
  type: GenerationType;
  input: GenerationInput;
  options: GenerationOptions;
  targetRole?: string;
  targetIndustry?: string;
  experienceLevel?: ExperienceLevel;
}

export interface GenerationInput {
  // For upload-based generation
  file?: File;

  // For profile-based generation
  profileData?: ProfileData;

  // For enhancement-based generation
  existingCV?: string; // CV ID

  // For AI-assisted generation
  jobDescription?: string;
  careerGoals?: string;
  keySkills?: string[];
}

export interface GenerationOptions {
  templateId: string;
  length: CVLength;
  tone: CVTone;
  focusAreas: FocusArea[];
  includeOptionalSections: boolean;
  atsOptimize: boolean;
  customInstructions?: string;
}

export interface ProfileData {
  personalInfo: PersonalInfo;
  workHistory: WorkExperience[];
  education: Education[];
  skills: string[];
  achievements: string[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  honors?: string[];
  coursework?: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate: string;
  endDate?: string;
  highlights: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Language {
  name: string;
  proficiency: LanguageProficiency;
  native: boolean;
}

export interface GenerationProgress {
  stage: GenerationStage;
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining: number; // seconds
  completedStages: GenerationStage[];
}

export interface GenerationResult {
  cvId: string;
  cv: CV;
  metadata: GenerationMetadata;
  recommendations: GenerationRecommendation[];
  preview: CVPreview;
}

export interface GenerationMetadata {
  generationType: GenerationType;
  templateUsed: string;
  processingTime: number;
  aiModelUsed: string;
  confidence: number;
  improvementSuggestions: string[];
}

export interface GenerationRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  actionable: boolean;
  autoApplicable: boolean;
}

export interface GenerationState {
  isGenerating: boolean;
  progress: GenerationProgress | null;
  result: GenerationResult | null;
  error: string | null;
  history: GenerationHistoryItem[];
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: Date;
  request: GenerationRequest;
  result: GenerationResult;
  status: GenerationStatus;
}

export type GenerationType =
  | 'from_upload'
  | 'from_profile'
  | 'from_scratch'
  | 'enhancement'
  | 'ai_assisted'
  | 'job_tailored';

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';

export type CVLength = 'one_page' | 'two_page' | 'extended';

export type CVTone =
  | 'professional'
  | 'conversational'
  | 'dynamic'
  | 'conservative'
  | 'creative'
  | 'technical';

export type FocusArea =
  | 'technical_skills'
  | 'leadership'
  | 'achievements'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'volunteer'
  | 'publications';

export type GenerationStage =
  | 'initializing'
  | 'parsing_input'
  | 'analyzing_content'
  | 'generating_structure'
  | 'applying_template'
  | 'optimizing_content'
  | 'ats_optimization'
  | 'finalizing'
  | 'generating_preview';

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type RecommendationType =
  | 'content_enhancement'
  | 'formatting_improvement'
  | 'keyword_optimization'
  | 'ats_compliance'
  | 'section_addition'
  | 'skill_highlight';

export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';

export type LanguageProficiency = 'basic' | 'conversational' | 'professional' | 'native';

// Re-export from cv.ts
export type { CV, CVPreview } from './cv';