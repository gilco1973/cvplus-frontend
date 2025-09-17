import type { Job } from '../services/cvService';
import type { CVParsedData, CVPersonalInfo, CVExperienceItem, CVEducationItem, CVSkillsData } from './cvData';
import type { SelectedFeatures } from './results';

export interface CVPreviewProps {
  job: Job;
  selectedTemplate: string;
  selectedFeatures: SelectedFeatures;
  appliedImprovements?: CVParsedData; // LLM-improved content from analysis step
  onUpdate?: (updates: Partial<Job['parsedData']>) => void;
  onFeatureToggle?: (feature: string, enabled: boolean) => void;
  disableComparison?: boolean; // Disable complex comparison view for simple preview
  className?: string;
}

export interface CVPreviewState {
  isEditing: boolean;
  showFeaturePreviews: boolean;
  editingSection: string | null;
  isEditingQRCode: boolean;
  showPreviewBanner: boolean;
  showPlaceholderBanner: boolean;
  previewData: CVParsedData;
  hasUnsavedChanges: boolean;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  collapsedSections: Record<string, boolean>;
}

export interface QRCodeSettings {
  url: string;
  type: 'profile' | 'linkedin' | 'portfolio' | 'contact' | 'custom';
  customText: string;
}

export interface AchievementAnalysis {
  keyAchievements: Array<{
    title: string;
    category: string;
    impact: string;
  }>;
  loading: boolean;
  error: string | null;
}

export interface FeaturePreviewData {
  [key: string]: unknown;
  languages?: Array<{ name: string; level: string }>;
  certifications?: Array<{ name: string; issuer: string; year: string; verified: boolean }>;
  socialLinks?: Record<string, string>;
  keyAchievements?: Array<{ title: string; category: string; impact: string }>;
}

export interface SectionData {
  personalInfo?: CVPersonalInfo;
  summary?: string;
  experience?: CVExperienceItem[];
  education?: CVEducationItem[];
  skills?: CVSkillsData;
}

export interface EditableSectionProps {
  section: string;
  data: unknown;
  onEdit: (section: string, newValue: unknown) => void;
  isEditing: boolean;
  className?: string;
}

export interface FeaturePreviewProps {
  featureId: string;
  isEnabled: boolean;
  isCollapsed: boolean;
  onToggleCollapse: (sectionId: string) => void;
  mockData: FeaturePreviewData;
  showPreviews: boolean;
}

export interface CVPreviewToolbarProps {
  isEditing: boolean;
  showFeaturePreviews: boolean;
  autoSaveEnabled: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  selectedTemplate: string;
  showPreviewBanner: boolean;
  appliedImprovements: CVParsedData;
  onToggleEditing: () => void;
  onToggleFeaturePreviews: () => void;
  onToggleAutoSave: () => void;
  onExpandAllSections: () => void;
  onCollapseAllSections: () => void;
  onCloseBanner: () => void;
}

export interface CVPreviewContentProps {
  previewData: CVParsedData;
  selectedTemplate: string;
  selectedFeatures: SelectedFeatures;
  showFeaturePreviews: boolean;
  collapsedSections: Record<string, boolean>;
  qrCodeSettings: QRCodeSettings;
  isEditing: boolean;
  editingSection: string | null;
  achievementAnalysis: AchievementAnalysis | null;
  showPlaceholderBanner: boolean;
  useBackendPreview?: boolean;
  jobId?: string;
  onSectionEdit: (section: string, newValue: unknown) => void;
  onToggleSection: (sectionId: string) => void;
  onEditQRCode: () => void;
  onAnalyzeAchievements: () => void;
  onStartEditing?: () => void;
  onDismissPlaceholderBanner?: () => void;
}

export interface MockDataGenerator {
  generateMockData(featureId: string, realData?: CVParsedData): FeaturePreviewData;
}

export interface TemplateGenerator {
  generateHTML(
    data: CVParsedData, 
    template: string, 
    features: Record<string, boolean>, 
    settings: { 
      qrCode: QRCodeSettings; 
      showPreviews: boolean; 
      collapsedSections: Record<string, boolean> 
    }
  ): string;
}

// CV Comparison Types
export type ComparisonViewMode = 'single' | 'comparison';

export interface CVComparisonData {
  originalData: CVParsedData;
  improvedData: CVParsedData;
  hasComparison: boolean;
  comparisonResult?: unknown;
}

export interface ComparisonStats {
  totalSections: number;
  modifiedSections: number;
  newSections: number;
  enhancedSections: number;
  improvementPercentage: number;
}

// Preview Generation State
export type PreviewSource = 'local' | 'backend';

export interface PreviewGenerationState {
  isGenerating: boolean;
  source: PreviewSource;
  error: string | null;
  lastGenerated: Date | null;
}