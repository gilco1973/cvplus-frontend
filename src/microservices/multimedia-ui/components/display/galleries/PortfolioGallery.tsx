/**
 * Portfolio Gallery Component
 * Main portfolio gallery component with projects display
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Award } from 'lucide-react';
import { PortfolioGalleryProps, LightboxState } from './types';
import { exportPortfolioData } from './utils';
import { useFeatureData } from '../../hooks/useFeatureData';
import { FeatureWrapper } from '../../core/FeatureWrapper';
import { ErrorBoundary } from '../../core/ErrorBoundary';
import { PortfolioFilters } from './PortfolioFilters';
import { ProjectCard } from './ProjectCard';
import { LightboxModal } from './LightboxModal';

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
  const handleExport = useCallback(() => {
    exportPortfolioData(projects, categories);
  }, [projects, categories]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setCurrentPage(1);
  }, []);

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
          <PortfolioFilters
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            categories={categories}
            viewMode={viewMode}
            filterByCategory={filterByCategory}
            onSearchChange={setSearchTerm}
            onCategoryChange={setSelectedCategory}
            onViewModeChange={setViewMode}
            onExport={handleExport}
          />

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
                  onClick={clearFilters}
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