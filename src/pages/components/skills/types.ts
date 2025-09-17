/**
 * Skills Types - Extracted from CVSkills for better modularity
 */

export interface SkillItem {
  name: string;
  level?: string;
  category?: string;
  yearsExperience?: number;
  keywords?: string[];
  certifications?: string[];
  description?: string;
  icon?: string;
}

export interface SkillCategory {
  name: string;
  skills: SkillItem[];
  color: string;
  icon: string;
  description?: string;
}

export interface SkillsData {
  categories: SkillCategory[];
  summary?: {
    totalSkills: number;
    expertLevel: number;
    years: number;
  };
}

export interface CVSkillsProps {
  skillsData: SkillsData;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showFilters?: boolean;
  showSearch?: boolean;
  onSkillClick?: (skill: SkillItem) => void;
}