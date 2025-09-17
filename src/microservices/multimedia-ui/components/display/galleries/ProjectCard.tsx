/**
 * Project Card Component
 * Individual project display for portfolio gallery
 */

import React, { useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  ExternalLink,
  Github,
  Eye,
  Calendar,
  Users,
  Award,
  ZoomIn,
  Play
} from 'lucide-react';
import { ProjectCardProps } from './types';
import { getTechIcon, getStatusBadge } from './utils';

export const ProjectCard: React.FC<ProjectCardProps> = ({
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