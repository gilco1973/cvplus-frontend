// Example usage of PortfolioGallery component
// This file shows how to integrate the PortfolioGallery in your CV application

import React from 'react';
import { PortfolioGallery } from './PortfolioGallery';

// Example data structure that would come from Firebase Functions
const examplePortfolioData = {
  projects: [
    {
      id: 'project-1',
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with React, Node.js, and PostgreSQL. Features include real-time inventory, payment processing, and admin dashboard.',
      category: 'Web Development',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe'],
      images: [
        {
          url: 'https://example.com/project1-hero.jpg',
          alt: 'E-commerce homepage screenshot',
          caption: 'Modern responsive homepage design',
          type: 'hero' as const
        },
        {
          url: 'https://example.com/project1-dashboard.jpg', 
          alt: 'Admin dashboard screenshot',
          caption: 'Comprehensive admin dashboard',
          type: 'screenshot' as const
        }
      ],
      liveUrl: 'https://ecommerce-demo.example.com',
      sourceUrl: 'https://github.com/username/ecommerce-platform',
      caseStudyUrl: 'https://portfolio.example.com/case-study/ecommerce',
      date: '2024-01-15',
      featured: true,
      status: 'completed' as const,
      role: 'Full-Stack Developer',
      team: ['John Doe', 'Jane Smith'],
      achievements: [
        'Reduced page load time by 40% through optimization',
        'Implemented real-time inventory tracking',
        'Achieved 99.9% uptime with proper error handling'
      ]
    },
    {
      id: 'project-2',
      title: 'Mobile Task Manager',
      description: 'Cross-platform mobile app built with React Native. Features offline sync, push notifications, and team collaboration.',
      category: 'Mobile Development',
      technologies: ['React Native', 'TypeScript', 'Firebase', 'AsyncStorage'],
      images: [
        {
          url: 'https://example.com/project2-mobile.jpg',
          alt: 'Mobile app interface mockup',
          caption: 'Clean and intuitive mobile interface',
          type: 'mockup' as const
        }
      ],
      liveUrl: 'https://apps.apple.com/app/task-manager',
      sourceUrl: 'https://github.com/username/task-manager-mobile',
      date: '2023-11-20',
      featured: false,
      status: 'completed' as const,
      role: 'Mobile Developer',
      achievements: [
        'Implemented offline-first architecture',
        'Achieved 4.8/5 app store rating',
        'Used by 10,000+ active users'
      ]
    }
  ],
  totalProjects: 2,
  featuredProjects: ['project-1'],
  categories: ['Web Development', 'Mobile Development']
};

// Example component usage
export const PortfolioGalleryExample: React.FC = () => {
  const handleUpdate = (data: any) => {
    console.log('Portfolio interaction:', data);
  };

  const handleError = (error: Error) => {
    console.error('Portfolio error:', error);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Portfolio Gallery Example
      </h1>
      
      {/* Grid Layout Example */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Grid Layout with All Features</h2>
        <PortfolioGallery
          jobId="example-job-123"
          profileId="example-profile-456"
          data={examplePortfolioData}
          customization={{
            layout: 'grid',
            showCaseStudies: true,
            enableLightbox: true,
            showTechnologies: true,
            filterByCategory: true,
            itemsPerPage: 8
          }}
          onUpdate={handleUpdate}
          onError={handleError}
          mode="public"
          className="bg-white rounded-lg shadow-sm"
        />
      </div>

      {/* Masonry Layout Example */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Masonry Layout - Minimal</h2>
        <PortfolioGallery
          jobId="example-job-123"
          profileId="example-profile-456"
          data={examplePortfolioData}
          customization={{
            layout: 'masonry',
            showCaseStudies: false,
            enableLightbox: true,
            showTechnologies: true,
            filterByCategory: false,
            itemsPerPage: 6
          }}
          onUpdate={handleUpdate}
          onError={handleError}
          mode="preview"
          className="bg-gray-50 rounded-lg"
        />
      </div>

      {/* Integration Notes */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Integration Notes
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Component automatically calls <code>getPortfolioGallery</code> Firebase Function</li>
          <li>• Real image optimization with lazy loading and error handling</li>
          <li>• Full accessibility support with ARIA labels and keyboard navigation</li>
          <li>• Responsive design works on all device sizes</li>
          <li>• Export functionality generates JSON portfolio summary</li>
          <li>• Analytics tracking through onUpdate callback</li>
        </ul>
      </div>
    </div>
  );
};

// Component registration for dynamic loading
export const portfolioGalleryConfig = {
  name: 'portfolio-gallery',
  component: PortfolioGallery,
  displayName: 'Portfolio Gallery',
  description: 'Interactive showcase of projects with filtering and lightbox viewing',
  category: 'Media',
  features: [
    'Project showcase with image galleries',
    'Technology stack filtering',
    'Lightbox image viewing',
    'Export functionality',
    'Real Firebase integration',
    'Mobile responsive design'
  ],
  customizationOptions: {
    layout: ['grid', 'masonry', 'carousel', 'timeline'],
    showCaseStudies: 'boolean',
    enableLightbox: 'boolean', 
    showTechnologies: 'boolean',
    filterByCategory: 'boolean',
    itemsPerPage: 'number'
  }
};
