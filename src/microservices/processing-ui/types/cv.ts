// CV processing types for cv-processing-ui microservice
import type { BaseEntity } from '@/core-ui/types/common';

export interface CVState {
  currentCV: CV | null;
  analysisResults: CVAnalysisResult[];
  generationStatus: GenerationStatus;
  templates: CVTemplate[];
  previewData: CVPreview | null;
  isLoading: boolean;
  error: string | null;
}

export interface CV extends BaseEntity {
  userId: string;
  title: string;
  content: CVContent;
  metadata: CVMetadata;
  version: number;
  status: CVStatus;
  templateId: string;
  tags: string[];
}

export interface CVContent {
  personalInfo: PersonalInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  customSections: CustomSection[];
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
  photoUrl?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  honors?: string[];
  coursework?: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  yearsOfExperience?: number;
  lastUsed?: Date;
  verified: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate: Date;
  endDate?: Date;
  highlights: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
  native: boolean;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  type: CustomSectionType;
  order: number;
}

export interface CVMetadata {
  atsScore: number;
  lastAnalyzed: Date;
  wordCount: number;
  pageCount: number;
  targetRole?: string;
  industry?: string;
  experienceLevel: ExperienceLevel;
}

export type CVStatus = 'draft' | 'active' | 'archived' | 'template';
export type SkillCategory = 'technical' | 'soft' | 'language' | 'certification' | 'other';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type LanguageProficiency = 'basic' | 'conversational' | 'professional' | 'native';
export type CustomSectionType = 'text' | 'list' | 'table' | 'media';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';

export interface CVPreview {
  html: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  pageBreaks: number[];
}

export interface CVUploadData {
  file: File;
  extractText: boolean;
  preserveFormatting: boolean;
}

export interface CVExportOptions {
  format: 'pdf' | 'docx' | 'html' | 'json';
  templateId?: string;
  customizations?: Record<string, any>;
}

export type GenerationStatus = 'idle' | 'analyzing' | 'generating' | 'optimizing' | 'completed' | 'failed';