import React, { useState } from 'react';
import { AchievementCards } from '../AchievementCards';
import { Achievement } from '../../../../types/cv-features';

// Sample achievement data for demonstration
const sampleAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Project Leadership Excellence',
    description: 'Successfully led a cross-functional team of 12 developers to deliver a critical product feature 2 weeks ahead of schedule, implementing agile methodologies and improving team communication.',
    impact: 'Increased overall team productivity by 35% and reduced time-to-market by 15 days, resulting in earlier revenue generation and improved customer satisfaction.',
    category: 'leadership',
    importance: 'high',
    date: '2024-01-15',
    metrics: [
      {
        label: 'Team Size Managed',
        value: 12,
        type: 'number'
      },
      {
        label: 'Productivity Increase',
        value: 35,
        type: 'percentage',
        improvement: '+10% vs target'
      },
      {
        label: 'Time Saved',
        value: 15,
        type: 'time'
      },
      {
        label: 'Budget Under',
        value: 25000,
        type: 'currency'
      }
    ],
    tags: ['leadership', 'project-management', 'agile', 'team-building']
  },
  {
    id: '2',
    title: 'Technical Innovation Award',
    description: 'Developed and implemented an innovative distributed caching solution that reduced database load by 60% and improved application response times across all services.',
    impact: 'Achieved significant cost savings of $50,000 annually in infrastructure costs while improving user experience and system reliability.',
    category: 'innovation',
    importance: 'high',
    date: '2023-11-20',
    metrics: [
      {
        label: 'Performance Improvement',
        value: 60,
        type: 'percentage'
      },
      {
        label: 'Annual Cost Savings',
        value: 50000,
        type: 'currency'
      },
      {
        label: 'Response Time Reduction',
        value: 40,
        type: 'percentage'
      }
    ],
    tags: ['innovation', 'performance', 'architecture', 'cost-optimization']
  },
  {
    id: '3',
    title: 'Customer Satisfaction Initiative',
    description: 'Designed and implemented a comprehensive customer feedback system that improved overall satisfaction scores and provided actionable insights for product development.',
    impact: 'Enhanced customer retention and provided valuable data for strategic decision making.',
    category: 'work',
    importance: 'medium',
    date: '2023-08-10',
    metrics: [
      {
        label: 'Satisfaction Score Increase',
        value: 25,
        type: 'percentage'
      },
      {
        label: 'Feedback Response Rate',
        value: 78,
        type: 'percentage'
      }
    ],
    tags: ['customer-experience', 'data-analysis', 'product-development']
  },
  {
    id: '4',
    title: 'Security Enhancement Project',
    description: 'Led a comprehensive security audit and implementation of advanced security measures, including multi-factor authentication and encrypted data storage.',
    impact: 'Reduced security vulnerabilities by 90% and achieved SOC 2 compliance certification.',
    category: 'work',
    importance: 'high',
    date: '2023-05-15',
    metrics: [
      {
        label: 'Vulnerabilities Reduced',
        value: 90,
        type: 'percentage'
      },
      {
        label: 'Compliance Score',
        value: 98,
        type: 'percentage'
      }
    ],
    tags: ['security', 'compliance', 'risk-management']
  },
  {
    id: '5',
    title: 'Mentorship Program Success',
    description: 'Established and led a mentorship program for junior developers, providing guidance and support for career development and technical growth.',
    impact: 'Improved junior developer retention rate by 40% and accelerated their career progression.',
    category: 'leadership',
    importance: 'medium',
    date: '2023-03-01',
    metrics: [
      {
        label: 'Mentees Guided',
        value: 8,
        type: 'number'
      },
      {
        label: 'Retention Improvement',
        value: 40,
        type: 'percentage'
      }
    ],
    tags: ['mentorship', 'leadership', 'career-development', 'knowledge-sharing']
  },
  {
    id: '6',
    title: 'Process Automation Initiative',
    description: 'Automated critical business processes using RPA and custom scripts, eliminating manual work and reducing error rates.',
    impact: 'Saved 200+ hours monthly and reduced processing errors by 95%.',
    category: 'innovation',
    importance: 'medium',
    date: '2022-12-10',
    metrics: [
      {
        label: 'Time Saved Monthly',
        value: 200,
        type: 'time'
      },
      {
        label: 'Error Reduction',
        value: 95,
        type: 'percentage'
      },
      {
        label: 'Processes Automated',
        value: 15,
        type: 'number'
      }
    ],
    tags: ['automation', 'efficiency', 'process-improvement', 'rpa']
  }
];

interface AchievementCardsDemoProps {
  className?: string;
}

export const AchievementCardsDemo: React.FC<AchievementCardsDemoProps> = ({ className = '' }) => {
  const [layout, setLayout] = useState<'grid' | 'carousel' | 'masonry'>('grid');
  const [cardSize, setCardSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [colorScheme, setColorScheme] = useState<'default' | 'professional' | 'colorful' | 'minimal'>('default');
  const [animationType, setAnimationType] = useState<'fade' | 'slide' | 'zoom' | 'flip'>('fade');
  const [showMetrics, setShowMetrics] = useState(true);
  const [showIcons, setShowIcons] = useState(true);

  const demoData = {
    achievements: sampleAchievements,
    totalAchievements: sampleAchievements.length,
    highlightedAchievements: ['1', '2'] // Highlight first two achievements
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-8 ${className}`}>
      {/* Demo Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Achievement Cards Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Showcase your professional achievements with interactive, customizable cards.
          Try different layouts, sizes, and color schemes to find your perfect presentation.
        </p>
      </div>

      {/* Customization Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customization Options</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Layout Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layout Style
            </label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="grid">Grid Layout</option>
              <option value="carousel">Carousel Layout</option>
              <option value="masonry">Masonry Layout</option>
            </select>
          </div>

          {/* Card Size Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Size
            </label>
            <select
              value={cardSize}
              onChange={(e) => setCardSize(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Color Scheme Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Scheme
            </label>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="default">Default</option>
              <option value="professional">Professional</option>
              <option value="colorful">Colorful</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          {/* Animation Type Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animation Style
            </label>
            <select
              value={animationType}
              onChange={(e) => setAnimationType(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="zoom">Zoom</option>
              <option value="flip">Flip</option>
            </select>
          </div>

          {/* Toggle Controls */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showMetrics}
                onChange={(e) => setShowMetrics(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Show Metrics</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showIcons}
                onChange={(e) => setShowIcons(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Show Icons</span>
            </label>
          </div>
        </div>
      </div>

      {/* Achievement Cards Component */}
      <AchievementCards
        jobId="demo-job-123"
        profileId="demo-profile-456"
        data={demoData}
        customization={{
          layout,
          cardSize,
          colorScheme,
          animationType,
          showMetrics,
          showIcons
        }}
        mode="preview"
        className=""
      />

      {/* Demo Information */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Demo Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Layout Options:</h4>
            <ul className="space-y-1 ml-4">
              <li>• Grid - Responsive card grid</li>
              <li>• Carousel - Swipeable single cards</li>
              <li>• Masonry - Pinterest-style layout</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Interactive Features:</h4>
            <ul className="space-y-1 ml-4">
              <li>• Click cards to expand details</li>
              <li>• Filter by category and priority</li>
              <li>• Sort by date, importance, or title</li>
              <li>• Export as PNG image</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};