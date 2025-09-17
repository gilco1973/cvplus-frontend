/**
 * Professional CV Template Components
 * Export barrel for all template-specific React components
 * Complete set of 8 industry-optimized templates
 */

export { ExecutiveTemplate } from './ExecutiveTemplate';
export { TechTemplate } from './TechTemplate';
export { CreativeTemplate } from './CreativeTemplate';
export { HealthcareTemplate } from './HealthcareTemplate';
export { FinancialTemplate } from './FinancialTemplate';
export { AcademicTemplate } from './AcademicTemplate';
export { SalesTemplate } from './SalesTemplate';
export { InternationalTemplate } from './InternationalTemplate';

// Template component mapping for dynamic rendering
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { TechTemplate } from './TechTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { HealthcareTemplate } from './HealthcareTemplate';
import { FinancialTemplate } from './FinancialTemplate';
import { AcademicTemplate } from './AcademicTemplate';
import { SalesTemplate } from './SalesTemplate';
import { InternationalTemplate } from './InternationalTemplate';
import type { TemplateId } from '../../types/cv-templates';

// Template component interface
export interface TemplateComponentProps {
  cvData: any;
  template: any;
  isEditing: boolean;
  selectedFeatures: any;
  onSectionEdit: (section: string, value: unknown) => void;
  showFeaturePreviews: boolean;
  className?: string;
}

export type TemplateComponent = React.FC<TemplateComponentProps>;

// Complete template component mapping for all 8 professional templates
export const TemplateComponents: Record<string, TemplateComponent> = {
  'executive-authority': ExecutiveTemplate,
  'tech-innovation': TechTemplate, 
  'creative-showcase': CreativeTemplate,
  'healthcare-professional': HealthcareTemplate,
  'financial-expert': FinancialTemplate,
  'academic-scholar': AcademicTemplate,
  'sales-performance': SalesTemplate,
  'international-professional': InternationalTemplate
} as const;

// Template selection utility
export const getTemplateComponent = (templateId: string): TemplateComponent | null => {
  return TemplateComponents[templateId] || null;
};

// All 8 available professional template IDs
export const CORE_TEMPLATE_IDS = [
  'executive-authority',
  'tech-innovation', 
  'creative-showcase',
  'healthcare-professional',
  'financial-expert',
  'academic-scholar',
  'sales-performance',
  'international-professional'
] as const;

export type CoreTemplateId = typeof CORE_TEMPLATE_IDS[number];

// Template categories for filtering
export const TEMPLATE_CATEGORIES = {
  executive: ['executive-authority'],
  technical: ['tech-innovation'],
  creative: ['creative-showcase'], 
  healthcare: ['healthcare-professional'],
  financial: ['financial-expert'],
  academic: ['academic-scholar'],
  sales: ['sales-performance'],
  international: ['international-professional']
} as const;

// Template utility functions
export const getTemplatesByCategory = (category: keyof typeof TEMPLATE_CATEGORIES): string[] => {
  return TEMPLATE_CATEGORIES[category] || [];
};

export const getAllTemplateIds = (): readonly string[] => {
  return CORE_TEMPLATE_IDS;
};

export const isValidTemplateId = (templateId: string): templateId is CoreTemplateId => {
  return CORE_TEMPLATE_IDS.includes(templateId as CoreTemplateId);
};