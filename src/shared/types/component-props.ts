// Component Props Types for CVPlus
// Provides comprehensive prop interfaces for all components

import { ReactNode } from 'react';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

// Loading state props
export interface LoadingStateProps {
  isLoading?: boolean;
  loadingText?: string;
  error?: string | null;
}

// Feature component base props
export interface FeatureComponentProps extends BaseComponentProps, LoadingStateProps {
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

// ATS Score props
export interface ATSScoreProps extends FeatureComponentProps {
  cvData?: any;
  jobDescription?: string;
  onScoreCalculated?: (score: number) => void;
}

// Enhanced ATS Result - use from service-types.ts
// Removed duplicate definition - import from service-types

// Calendar Integration props
export interface CalendarIntegrationProps extends FeatureComponentProps {
  cvData?: any;
  onEventsGenerated?: (events: CalendarEvent[]) => void;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startDate: string; // Required field
  type: 'work' | 'education' | 'certification' | 'reminder';
  description?: string;
  location?: string;
  duration?: number;
  allDay?: boolean; // Required field
}

// Certification Badges props
export interface CertificationBadgesProps extends FeatureComponentProps {
  certifications?: Certification[];
  onBadgeGenerated?: (badge: CertificationBadge) => void;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  verified?: boolean;
}

export interface CertificationBadge {
  id: string;
  certification: Certification;
  badgeUrl: string;
  shareUrl: string;
  expiresAt?: string;
}

// Enhanced QR Code props
export interface EnhancedQRCodeProps extends FeatureComponentProps {
  profileData?: any;
  template?: QRCodeTemplate;
  onQRGenerated?: (qrData: QRCodeConfig) => void;
}

export interface QRCodeTemplate {
  id: string;
  name: string;
  design: any;
}

export interface QRCodeConfig {
  type: 'profile' | 'linkedin' | 'portfolio' | 'contact' | 'custom' | 'resume-download';
  data: string;
  template: QRCodeTemplate;
  metadata: {
    title: string;
    description: string;
    tags: string[];
    isActive: boolean;
    trackingEnabled: boolean;
  };
}

// Feature Dashboard props
export interface FeatureDashboardProps extends BaseComponentProps {
  cvData?: any;
  jobDescription?: string;
  onFeatureComplete?: (featureId: string, result: any) => void;
  onAllComplete?: () => void;
}

// Language Proficiency props
export interface LanguageProficiencyProps extends FeatureComponentProps {
  languages?: LanguageSkill[];
  onVisualizationGenerated?: (visualization: LanguageVisualization) => void;
}

export interface LanguageSkill {
  language: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
  certifications?: string[];
}

export interface LanguageVisualization {
  languages: LanguageSkill[];
  chartData: any;
  recommendations: string[];
}

// Personality Insights props
export interface PersonalityInsightsProps extends FeatureComponentProps {
  traits: PersonalityTrait[];
  workStyle: WorkStyle;
  teamCompatibility: TeamCompatibility;
  leadershipPotential: LeadershipPotential;
  communicationStyle: CommunicationStyle;
  careerRecommendations: string[];
}

export interface PersonalityTrait {
  name: string;
  score: number;
  description: string;
}

export interface WorkStyle {
  preferences: string[];
  environment: string;
  schedule: string;
}

export interface TeamCompatibility {
  roles: string[];
  collaboration: number;
  leadership: number;
}

export interface LeadershipPotential {
  score: number;
  strengths: string[];
  areas: string[];
}

export interface CommunicationStyle {
  primary: string;
  strengths: string[];
  preferences: string[];
}

// Portfolio Gallery props
export interface PortfolioGalleryProps extends FeatureComponentProps {
  projects?: PortfolioItem[];
  onGalleryGenerated?: (gallery: PortfolioGallery) => void;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  technologies: string[];
  url?: string;
}

export interface PortfolioGallery {
  items: PortfolioItem[];
  layout: 'grid' | 'masonry' | 'carousel';
  theme: string;
}

// Public Profile props
export interface PublicProfileProps extends FeatureComponentProps {
  profileData?: any;
  customization?: ProfileCustomization;
  onProfileGenerated?: (profile: PublicProfile) => void;
}

export interface ProfileCustomization {
  theme: string;
  layout: string;
  features: string[];
}

export interface PublicProfile {
  slug: string;
  publicUrl: string;
  qrCodeUrl?: string;
  settings: {
    showContactForm: boolean;
    showCalendar: boolean;
    showChat: boolean;
    customBranding: boolean;
    analytics: boolean;
  };
  createdAt: Date;
}

// Skills Visualization props
export interface SkillsVisualizationProps extends FeatureComponentProps {
  technical: TechnicalSkill[];
  soft: SoftSkill[];
  languages: LanguageSkill[];
  certifications: Certification[];
}

export interface TechnicalSkill {
  name: string;
  level: number;
  category: string;
  yearsOfExperience?: number;
}

export interface SoftSkill {
  name: string;
  level: number;
  examples?: string[];
}

// Testimonials Carousel props
export interface TestimonialsCarouselProps extends FeatureComponentProps {
  testimonials?: Testimonial[];
  onCarouselGenerated?: (carousel: TestimonialsCarousel) => void;
}

export interface Testimonial {
  id: string;
  content: string;
  author: string;
  position?: string;
  company?: string;
  relationship: 'manager' | 'colleague' | 'client' | 'subordinate' | 'mentor';
  date?: string;
  rating?: number;
}

export interface TestimonialsCarousel {
  testimonials: Testimonial[];
  layout: string;
  autoPlay: boolean;
  interval: number;
}

// Video Introduction props
export interface VideoIntroductionProps extends FeatureComponentProps {
  profileData?: any;
  preferences?: VideoPreferences;
  onVideoGenerated?: (video: VideoIntroduction) => void;
}

export interface VideoPreferences {
  duration: 'short' | 'medium' | 'long';
  style: 'professional' | 'friendly' | 'energetic';
  includeBackground?: boolean;
  voiceOver?: boolean;
}

export interface VideoIntroduction {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  style: string;
  transcript?: string;
}