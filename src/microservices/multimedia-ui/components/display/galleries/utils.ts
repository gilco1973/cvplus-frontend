// @ts-ignore
/**
 * Portfolio Gallery Utilities
 * Utility functions for portfolio gallery components
  */

import { PortfolioProject } from './types';

// Technology icon mapping
export const getTechIcon = (tech: string): string => {
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
export const getStatusBadge = (status: PortfolioProject['status']) => {
  const statusConfig = {
    'completed': { label: 'Completed', color: 'bg-green-100 text-green-800' },
    'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    'concept': { label: 'Concept', color: 'bg-blue-100 text-blue-800' }
  };
  return statusConfig[status];
};

// Export portfolio data as JSON
export const exportPortfolioData = (projects: PortfolioProject[], categories: string[]) => {
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
};