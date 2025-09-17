/**
 * Specific CV Data Structure Interfaces
 * Used to replace 'any' types in utility functions
 */

export interface CVExperienceItem {
  title?: string;
  position?: string;
  role?: string;
  company?: string;
  location?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
}

export interface CVEducationItem {
  degree?: string;
  field?: string;
  institution?: string;
  location?: string;
  year?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  honors?: string;
  description?: string;
}

export interface CVCertificationItem {
  name?: string;
  issuer?: string;
  year?: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl?: string;
  verified?: boolean;
}

export interface CVProjectItem {
  title?: string;
  name?: string;
  description?: string;
  technologies?: string[];
  duration?: string;
  url?: string;
  achievements?: string[];
}

export interface CVLanguageItem {
  name?: string;
  language?: string;
  level?: string;
  proficiency?: 'elementary' | 'limited' | 'professional' | 'fluent' | 'native';
  certifications?: string[];
  yearsOfExperience?: number;
  contexts?: string[];
  verified?: boolean;
  flag?: string;
}

export interface CVSkillsData {
  technical?: string[];
  software?: string[];
  languages?: string[];
  soft?: string[];
  industry?: string[];
  tools?: string[];
  categories?: Record<string, string[]>;
}

export interface CVPersonalInfo {
  fullName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  address?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
}

export interface CVParsedData {
  personalInfo?: CVPersonalInfo;
  summary?: string;
  objective?: string;
  experience?: CVExperienceItem[];
  education?: CVEducationItem[];
  skills?: CVSkillsData;
  certifications?: CVCertificationItem[];
  projects?: CVProjectItem[];
  languages?: CVLanguageItem[];
  awards?: string[];
  publications?: string[];
  references?: string[];
  achievements?: string[];
  portfolio?: unknown[];
  testimonials?: unknown[];
  customSections?: Record<string, unknown>;
}

export interface CVDataSection {
  sectionKey: string;
  sectionData: unknown;
  isArray: boolean;
  isEmpty: boolean;
}

// Type guard functions
export function isCVExperienceItem(item: unknown): item is CVExperienceItem {
  return item !== null && typeof item === 'object' && 
    (((item as Record<string, unknown>).title !== undefined) || 
     ((item as Record<string, unknown>).company !== undefined) || 
     ((item as Record<string, unknown>).description !== undefined));
}

export function isCVEducationItem(item: unknown): item is CVEducationItem {
  return item !== null && typeof item === 'object' && 
    (((item as Record<string, unknown>).degree !== undefined) || 
     ((item as Record<string, unknown>).institution !== undefined));
}

export function isCVParsedData(data: unknown): data is CVParsedData {
  return data !== null && typeof data === 'object';
}