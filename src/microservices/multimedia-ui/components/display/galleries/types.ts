// @ts-ignore
/**
 * Portfolio Gallery Types
 * Types for portfolio gallery components
  */

// Base props interface for CV features
export interface CVFeatureProps {
  jobId?: string;
  profileId?: string;
  isEnabled?: boolean;
  data?: any;
  customization?: any;
  onUpdate?: (data: any) => void;
  onError?: (error: Error | string) => void;
  className?: string;
  mode?: 'private' | 'public';
}

// Portfolio Gallery Types
export interface PortfolioGalleryProps extends CVFeatureProps {
  data?: {
    projects: PortfolioProject[];
    totalProjects?: number;
    featuredProjects?: string[];
    categories?: string[];
  };
  customization?: {
    layout?: 'grid' | 'masonry' | 'carousel' | 'timeline';
    showCaseStudies?: boolean;
    enableLightbox?: boolean;
    showTechnologies?: boolean;
    filterByCategory?: boolean;
    itemsPerPage?: number;
  };
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  images: ProjectImage[];
  liveUrl?: string;
  sourceUrl?: string;
  caseStudyUrl?: string;
  date: string;
  featured: boolean;
  status: 'completed' | 'in-progress' | 'concept';
  role?: string;
  team?: string[];
  achievements?: string[];
}

export interface ProjectImage {
  url: string;
  alt: string;
  caption?: string;
  type: 'hero' | 'screenshot' | 'mockup' | 'diagram';
}

export interface LightboxState {
  isOpen: boolean;
  projectId: string | null;
  imageIndex: number;
}

export interface ProjectCardProps {
  project: PortfolioProject;
  index: number;
  isFeatured: boolean;
  showTechnologies: boolean;
  showCaseStudies: boolean;
  enableLightbox: boolean;
  viewMode: 'grid' | 'masonry';
  onImageClick: (imageIndex: number) => void;
  onUpdate?: (data: any) => void;
}

export interface LightboxModalProps {
  isOpen: boolean;
  project: PortfolioProject | null;
  imageIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export interface PortfolioFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  categories: string[];
  viewMode: 'grid' | 'masonry';
  filterByCategory: boolean;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onViewModeChange: (mode: 'grid' | 'masonry') => void;
  onExport: () => void;
}