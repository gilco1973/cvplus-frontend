// External Data Types for CVPlus
// Comprehensive type definitions for external data integration

export interface ExternalDataSource {
  id: 'github' | 'linkedin' | 'website' | 'web';
  name: string;
  enabled: boolean;
  username?: string;
  url?: string;
  loading?: boolean;
  error?: string;
  data?: ExternalDataResult;
}

export interface ExternalDataResult {
  source: string;
  data: {
    portfolio?: PortfolioItem[];
    skills?: string[];
    certifications?: Certification[];
    hobbies?: string[];
    interests?: string[];
    projects?: ProjectItem[];
    publications?: Publication[];
    achievements?: Achievement[];
  };
  metadata?: {
    fetchedAt: string;
    confidence: number;
    cacheHit: boolean;
  };
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  image?: string;
  type: 'project' | 'repository' | 'article' | 'design';
  tags?: string[];
  selected?: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
  verified?: boolean;
  selected?: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
  stars?: number;
  language?: string;
  selected?: boolean;
}

export interface Publication {
  id: string;
  title: string;
  venue?: string;
  date?: string;
  url?: string;
  authors?: string[];
  selected?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  date?: string;
  type: 'award' | 'recognition' | 'milestone' | 'certification';
  selected?: boolean;
}

export interface EnrichCVRequest {
  cvId: string;
  sources?: string[];
  options?: {
    forceRefresh?: boolean;
    timeout?: number;
    priority?: 'high' | 'normal' | 'low';
  };
  github?: string;
  linkedin?: string;
  website?: string;
  name?: string;
}

export interface EnrichCVResponse {
  success: boolean;
  requestId: string;
  status: 'completed' | 'partial' | 'failed';
  enrichedData: ExternalDataResult[];
  metrics: {
    fetchDuration: number;
    sourcesQueried: number;
    sourcesSuccessful: number;
    cacheHits: number;
  };
  errors: string[];
}

export interface SelectedItems {
  portfolio: string[];
  certifications: string[];
  projects: string[];
  publications: string[];
  achievements: string[];
  skills: string[];
  hobbies: string[];
  interests: string[];
}

export type DataCategory = keyof ExternalDataResult['data'];
export type ItemType = keyof Omit<SelectedItems, 'skills' | 'hobbies' | 'interests'>;
