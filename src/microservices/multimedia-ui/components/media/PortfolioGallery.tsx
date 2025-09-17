import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { 
  ExternalLink, 
  Github, 
  Eye, 
  Calendar, 
  Users, 
  Award, 
  Filter, 
  Search, 
  Grid3X3, 
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Share2,
  Maximize2,
  ZoomIn,
  Play
} from 'lucide-react';
import { CVFeatureProps } from '../../../types/cv-features';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { useFeatureData } from '../../../hooks/useFeatureData';

// Types for Portfolio Gallery
interface PortfolioGalleryProps extends CVFeatureProps {
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

interface PortfolioProject {
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

interface ProjectImage {
  url: string;
  alt: string;
  caption?: string;
  type: 'hero' | 'screenshot' | 'mockup' | 'diagram';
}

interface LightboxState {
  isOpen: boolean;
  projectId: string | null;
  imageIndex: number;
}

// Technology icon mapping
const getTechIcon = (tech: string): string => {
  const techIcons: Record<string, string> = {
    'React': '⚛️',
    'TypeScript': '🔷',
    'JavaScript': '💛',
    'Python': '🐍',
    'Node.js': '💚',
    'Firebase': '🔥',
    'MongoDB': '🍃',
    'PostgreSQL': '🐘',
    'Docker': '🐳',
    'Kubernetes': '☸️',
    'AWS': '☁️',
    'Next.js': '▲',
    'Vue': '💚',
    'Angular': '🅰️',
    'Flutter': '📱',
    'Swift': '🦉',
    'Kotlin': '🟣',
    'Java': '☕',
    'Go': '🔵',
    'Rust': '🦀'
  };
  return techIcons[tech] || '⚙️';
};

// Status badge styling
const getStatusBadge = (status: PortfolioProject['status']) => {
  const statusConfig = {
    'completed': { label: 'Completed', color: 'bg-green-100 text-green-800' },
    'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    'concept': { label: 'Concept', color: 'bg-blue-100 text-blue-800' }
  };
  return statusConfig[status];
};

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data: initialData,
  customization = {},
  onUpdate,
  onError,
  className = '',
  mode = 'private'
}) => {
  const {
    layout = 'grid',
    showCaseStudies = true,
    enableLightbox = true,
    showTechnologies = true,
    filterByCategory = true,
    itemsPerPage = 12
  } = customization;

  // Feature data hook for real Firebase integration
  const { 
    data: portfolioData, 
    loading, 
    error, 
    refresh 
  } = useFeatureData<PortfolioGalleryProps['data']>({
    jobId,
    featureName: 'portfolio-gallery',
    initialData,
    params: { profileId }
  });

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    projectId: null,
    imageIndex: 0
  });
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>(layout === 'masonry' ? 'masonry' : 'grid');

  const containerRef = useRef<HTMLDivElement>(null);

  // Processed data
  const projects = portfolioData?.projects || [];
  const categories = portfolioData?.categories || [];
  const featuredProjects = portfolioData?.featuredProjects || [];

  // Filter and search logic
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.technologies.some(tech => tech.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [projects, selectedCategory, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  // Lightbox handlers
  const openLightbox = useCallback((projectId: string, imageIndex: number = 0) => {
    if (!enableLightbox) return;
    setLightbox({ isOpen: true, projectId, imageIndex });
    document.body.style.overflow = 'hidden';
  }, [enableLightbox]);

  const closeLightbox = useCallback(() => {
    setLightbox({ isOpen: false, projectId: null, imageIndex: 0 });
    document.body.style.overflow = 'unset';
  }, []);

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    if (!lightbox.projectId) return;
    
    const project = projects.find(p => p.id === lightbox.projectId);
    if (!project) return;

    const maxIndex = project.images.length - 1;
    let newIndex = lightbox.imageIndex;

    if (direction === 'prev') {
      newIndex = lightbox.imageIndex > 0 ? lightbox.imageIndex - 1 : maxIndex;
    } else {
      newIndex = lightbox.imageIndex < maxIndex ? lightbox.imageIndex + 1 : 0;
    }

    setLightbox(prev => ({ ...prev, imageIndex: newIndex }));
  }, [lightbox, projects]);

  // Export functionality
  const exportPortfolio = useCallback(() => {
    const portfolioData = {
      totalProjects: projects.length,
      categories: categories,
      projects: projects.map(project => ({
        title: project.title,
        description: project.description,
        category: project.category,
        technologies: project.technologies,
        status: project.status,
        date: project.date,
        liveUrl: project.liveUrl,
        sourceUrl: project.sourceUrl
      }))
    };

    const blob = new Blob([JSON.stringify(portfolioData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-summary.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [projects, categories]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!lightbox.isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateLightbox('prev');
          break;
        case 'ArrowRight':
          navigateLightbox('next');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightbox.isOpen, closeLightbox, navigateLightbox]);

  if (!isEnabled) {
    return null;
  }

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Portfolio Gallery"
        description={`Showcase of ${projects.length} projects across ${categories.length} categories`}
        isLoading={loading}
        error={error}
        onRetry={refresh}
      >
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              {filterByCategory && categories.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2 rounded ${viewMode === 'masonry' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
                  title="Masonry View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={exportPortfolio}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Export Portfolio Summary"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {paginatedProjects.length} of {filteredProjects.length} projects
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            
            {featuredProjects.length > 0 && (
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-yellow-500" />
                {featuredProjects.length} featured
              </span>
            )}
          </div>

          {/* Projects Grid */}
          <div 
            ref={containerRef}
            className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6'
              }
            `}
          >
            <div>
              {paginatedProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isFeatured={featuredProjects.includes(project.id)}
                  showTechnologies={showTechnologies}
                  showCaseStudies={showCaseStudies}
                  enableLightbox={enableLightbox}
                  viewMode={viewMode}
                  onImageClick={(imageIndex) => openLightbox(project.id, imageIndex)}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <Search className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No portfolio projects have been added yet'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {enableLightbox && (
          <LightboxModal
            isOpen={lightbox.isOpen}
            project={projects.find(p => p.id === lightbox.projectId) || null}
            imageIndex={lightbox.imageIndex}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </FeatureWrapper>
    </ErrorBoundary>
  );
};

// Project Card Component
interface ProjectCardProps {
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

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  isFeatured,
  showTechnologies,
  showCaseStudies,
  enableLightbox,
  viewMode,
  onImageClick,
  onUpdate
}) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const heroImage = project.images.find(img => img.type === 'hero') || project.images[0];
  const statusBadge = getStatusBadge(project.status);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <div 
      ref={ref}
      className={`
        relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group
        ${viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''}
        ${isFeatured ? 'ring-2 ring-yellow-400' : ''}
      `}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            <Award className="w-3 h-3" />
            Featured
          </span>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Project Image */}
      <div 
        className="relative aspect-video bg-gray-200 overflow-hidden cursor-pointer"
        onClick={() => enableLightbox && onImageClick(0)}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 text-gray-400">
              <Play className="w-full h-full" />
            </div>
          </div>
        )}
        
        {heroImage && !imageError && (
          <img
            src={heroImage.url}
            alt={heroImage.alt}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {imageError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-8 h-8 mx-auto mb-2">
                <ExternalLink className="w-full h-full" />
              </div>
              <span className="text-sm">Image unavailable</span>
            </div>
          </div>
        )}

        {/* Image Overlay */}
        {enableLightbox && imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <ZoomIn className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </div>
        )}

        {/* Additional Images Indicator */}
        {project.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            +{project.images.length - 1} more
          </div>
        )}
      </div>

      {/* Project Content */}
      <div className="p-6">
        {/* Title and Date */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1">
            {project.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 ml-3">
            <Calendar className="w-4 h-4" />
            <span>{new Date(project.date).getFullYear()}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Technologies */}
        {showTechnologies && project.technologies.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {project.technologies.slice(0, 6).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  title={tech}
                >
                  <span>{getTechIcon(tech)}</span>
                  {tech}
                </span>
              ))}
              {project.technologies.length > 6 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{project.technologies.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Project Meta */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          {project.role && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Role: {project.role}</span>
            </div>
          )}
          
          {project.team && project.team.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Team: {project.team.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Achievements */}
        {project.achievements && project.achievements.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
              <Award className="w-4 h-4" />
              Key Achievements
            </div>
            <ul className="space-y-1">
              {project.achievements.slice(0, 3).map((achievement, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="line-clamp-2">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Links */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => onUpdate?.({ action: 'live_demo_clicked', projectId: project.id })}
            >
              <ExternalLink className="w-4 h-4" />
              Live Demo
            </a>
          )}
          
          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => onUpdate?.({ action: 'source_code_clicked', projectId: project.id })}
            >
              <Github className="w-4 h-4" />
              Source
            </a>
          )}
          
          {showCaseStudies && project.caseStudyUrl && (
            <a
              href={project.caseStudyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => onUpdate?.({ action: 'case_study_clicked', projectId: project.id })}
            >
              <Eye className="w-4 h-4" />
              Case Study
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Lightbox Modal Component
interface LightboxModalProps {
  isOpen: boolean;
  project: PortfolioProject | null;
  imageIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  project,
  imageIndex,
  onClose,
  onNavigate
}) => {
  if (!isOpen || !project) return null;

  const currentImage = project.images[imageIndex];
  const hasMultipleImages = project.images.length > 1;

  return (
    <div>
      <div className="animate-fade-in fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors z-60"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Navigation Buttons */}
        {hasMultipleImages && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('prev');
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors z-60"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('next');
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors z-60"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Image Container */}
        <div className="animate-fade-in max-w-7xl max-h-full mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
              <h3 className="text-white text-xl font-semibold mb-2">
                {project.title}
              </h3>
              {currentImage.caption && (
                <p className="text-white text-sm opacity-90">
                  {currentImage.caption}
                </p>
              )}
              {hasMultipleImages && (
                <div className="mt-2 text-white text-sm opacity-75">
                  {imageIndex + 1} of {project.images.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Thumbnails */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 rounded-lg p-2">
            {project.images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  // Set image index directly
                  const event = new CustomEvent('lightbox-navigate', { detail: idx });
                  window.dispatchEvent(event);
                }}
                className={`w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                  idx === imageIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};