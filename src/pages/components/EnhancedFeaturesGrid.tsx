/**
 * EnhancedFeaturesGrid Component
 * 
 * Displays all enhanced CV features in a grid layout with interactive previews.
 * Shows completed features with full data and processing features with progress indicators.
 */

import React, { memo, useState } from 'react';
import { 
  Calendar, 
  Video, 
  Users, 
  Award, 
  Globe, 
  Mic, 
  BarChart3, 
  Star,
  Clock,
  Play,
  Download,
  Eye,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Camera,
  Target,
  MessageSquare,
  Languages,
  Mail,
  Link,
  Shield,
  QrCode
} from 'lucide-react';
import { SkillsRadarChart } from '../../components/features/SkillsRadarChart';
import { getFeatureComponent } from '../../utils/featureRegistry';

interface FeatureData {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  currentStep?: string;
  data?: any;
  error?: string;
  processedAt?: string;
  startedAt?: string;
  enabled?: boolean;
  url?: string;
  embedCode?: string;
  shareableUrl?: string;
}

interface EnhancedFeaturesGridProps {
  features: Record<string, FeatureData>;
  jobId: string;
  metadata?: {
    jobId: string;
    status: string;
    lastUpdated: string;
    userId: string;
  };
  className?: string;
}

// Feature configuration with icons, colors, and descriptions
const FEATURE_CONFIG: Record<string, {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  category: 'media' | 'interactive' | 'analytics' | 'professional';
}> = {
  timeline: {
    title: 'Interactive Timeline',
    description: 'Visual career progression with key milestones',
    icon: BarChart3,
    color: 'blue',
    category: 'interactive'
  },
  videoIntroduction: {
    title: 'Video Introduction',
    description: 'AI-generated professional video presentation',
    icon: Video,
    color: 'purple',
    category: 'media'
  },
  podcast: {
    title: 'Career Podcast',
    description: 'Audio discussion of your professional journey',
    icon: Mic,
    color: 'green',
    category: 'media'
  },
  skillsVisualization: {
    title: 'Skills Radar',
    description: 'Interactive skills proficiency visualization',
    icon: Target,
    color: 'orange',
    category: 'interactive'
  },
  portfolio: {
    title: 'Portfolio Gallery',
    description: 'Curated showcase of your best work',
    icon: Camera,
    color: 'pink',
    category: 'professional'
  },
  portfolioGallery: {
    title: 'Portfolio Gallery',
    description: 'Curated showcase of your best work',
    icon: Camera,
    color: 'pink',
    category: 'professional'
  },
  personalityInsights: {
    title: 'Personality Insights',
    description: 'AI-powered personality and work style analysis',
    icon: Users,
    color: 'indigo',
    category: 'analytics'
  },
  achievementHighlighting: {
    title: 'Achievement Highlights',
    description: 'Key accomplishments with impact metrics',
    icon: Award,
    color: 'yellow',
    category: 'professional'
  },
  certificationBadges: {
    title: 'Certification Badges',
    description: 'Visual display of professional certifications',
    icon: Award,
    color: 'emerald',
    category: 'professional'
  },
  languageProficiency: {
    title: 'Language Skills',
    description: 'Multi-language proficiency visualization',
    icon: Languages,
    color: 'cyan',
    category: 'interactive'
  },
  calendar: {
    title: 'Availability Calendar',
    description: 'Interactive booking and availability system',
    icon: Calendar,
    color: 'red',
    category: 'professional'
  },
  atsOptimization: {
    title: 'ATS Optimization',
    description: 'Application tracking system compatibility score',
    icon: Target,
    color: 'slate',
    category: 'analytics'
  },
  ragChat: {
    title: 'AI Chat Assistant',
    description: 'Interactive Q&A about your professional background',
    icon: MessageSquare,
    color: 'violet',
    category: 'interactive'
  },
  contactForm: {
    title: 'Contact Form',
    description: 'Interactive contact functionality',
    icon: Mail,
    color: 'blue',
    category: 'professional'
  },
  socialMediaLinks: {
    title: 'Social Media Links',
    description: 'Professional social media integration',
    icon: Link,
    color: 'cyan',
    category: 'professional'
  },
  availabilityCalendar: {
    title: 'Availability Calendar',
    description: 'Scheduling and availability integration',
    icon: Calendar,
    color: 'green',
    category: 'professional'
  },
  testimonialsCarousel: {
    title: 'Testimonials Carousel',
    description: 'Professional testimonials showcase',
    icon: MessageSquare,
    color: 'purple',
    category: 'professional'
  },
  embedQRCode: {
    title: 'QR Code Integration',
    description: 'Quick access QR code',
    icon: QrCode,
    color: 'slate',
    category: 'professional'
  },
  privacyMode: {
    title: 'Privacy Protection',
    description: 'Personal information protection',
    icon: Shield,
    color: 'emerald',
    category: 'professional'
  }
};

export const EnhancedFeaturesGrid: React.FC<EnhancedFeaturesGridProps> = memo(({
  features = {},
  jobId,
  metadata,
  className = ''
}) => {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  // Process features data
  const processedFeatures = Object.entries(features)
    .map(([featureKey, featureData]) => {
      const config = FEATURE_CONFIG[featureKey];
      return {
        key: featureKey,
        config: config || {
          title: featureKey.charAt(0).toUpperCase() + featureKey.slice(1),
          description: 'Enhanced CV feature',
          icon: Star,
          color: 'gray',
          category: 'professional' as const
        },
        data: featureData
      };
    })
    .filter(feature => feature.data && feature.data.enabled !== false)
    .reduce((acc, feature) => {
      // Deduplicate portfolio features - prefer 'portfolioGallery' over 'portfolio'
      if (feature.key === 'portfolio' || feature.key === 'portfolioGallery') {
        const existingPortfolio = acc.find(f => f.key === 'portfolio' || f.key === 'portfolioGallery');
        if (existingPortfolio) {
          // Replace with portfolioGallery if current is portfolio, or skip if current is portfolio and existing is portfolioGallery
          if (feature.key === 'portfolioGallery' && existingPortfolio.key === 'portfolio') {
            const index = acc.indexOf(existingPortfolio);
            acc[index] = feature;
          }
          // Skip adding duplicate portfolio feature
          return acc;
        }
      }
      acc.push(feature);
      return acc;
    }, [] as typeof processedFeatures);

  // Group features by category
  const groupedFeatures = processedFeatures.reduce((acc, feature) => {
    const category = feature.config.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, typeof processedFeatures>);

  // Category configurations
  const categoryConfig = {
    media: { title: 'Media & Content', description: 'Audio and video presentations' },
    interactive: { title: 'Interactive Features', description: 'Dynamic visualizations and tools' },
    analytics: { title: 'Analytics & Insights', description: 'Data-driven career analysis' },
    professional: { title: 'Professional Tools', description: 'Career enhancement utilities' }
  };

  // Get color classes for feature status
  const getStatusColors = (status: string, color: string) => {
    const baseColors = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500',
      yellow: 'bg-yellow-500',
      emerald: 'bg-emerald-500',
      cyan: 'bg-cyan-500',
      red: 'bg-red-500',
      slate: 'bg-slate-500',
      violet: 'bg-violet-500',
      gray: 'bg-gray-500'
    };

    const statusColors = {
      completed: baseColors[color as keyof typeof baseColors] || baseColors.gray,
      processing: 'bg-blue-500',
      pending: 'bg-gray-400',
      failed: 'bg-red-500'
    };

    return statusColors[status as keyof typeof statusColors] || statusColors.pending;
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Render actual React component if available, otherwise fallback to manual rendering
  const renderReactComponent = (feature: any) => {
    const { data, key } = feature;
    
    if (data.status !== 'completed' || !data.data) return null;

    // Get the React component from the feature registry
    const FeatureComponent = getFeatureComponent(key) || getFeatureComponent(`${key}-component`);
    
    if (FeatureComponent) {
      // Render the actual React component
      const componentProps = {
        ...data.data,
        jobId: feature.key,
        featureId: key,
        className: "w-full"
      };
      
      try {
        return <FeatureComponent {...componentProps} />;
      } catch (error) {
        console.warn(`Failed to render React component for ${key}:`, error);
        // Fallback to manual rendering
        return renderFeatureContent(feature);
      }
    }
    
    // No React component found, use manual rendering
    return renderFeatureContent(feature);
  };

  // Render feature content based on feature type (fallback)
  const renderFeatureContent = (feature: any) => {
    const { data, key } = feature;
    
    if (!data.data) return null;

    switch (key) {
      case 'portfolio':
      case 'portfolioGallery':
        // Debug: Log the data structure
        console.log(`Portfolio data for ${key}:`, data.data);
        
        // Check for portfolio items in different possible data structures
        let portfolioItems = null;
        if (Array.isArray(data.data)) {
          portfolioItems = data.data;
        } else if (data.data?.items && Array.isArray(data.data.items)) {
          portfolioItems = data.data.items;
        } else if (data.data?.portfolio && Array.isArray(data.data.portfolio)) {
          portfolioItems = data.data.portfolio;
        } else if (data.data?.projects && Array.isArray(data.data.projects)) {
          portfolioItems = data.data.projects;
        }

        if (portfolioItems && portfolioItems.length > 0) {
          const displayItems = portfolioItems.slice(0, 9); // Show first 9 items in 3-column grid
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-gray-800 text-sm">Portfolio Items</h5>
                <span className="text-xs text-gray-500">{portfolioItems.length} projects</span>
              </div>
              
              {/* Portfolio Grid - Full Width Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayItems.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h6 className="font-medium text-gray-900 text-sm truncate">
                          {item.title || item.name || 'Untitled Project'}
                        </h6>
                        {item.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Project Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.category && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {item.category}
                        </span>
                      )}
                      {item.technologies && Array.isArray(item.technologies) && item.technologies.slice(0, 2).map((tech: string, techIndex: number) => (
                        <span
                          key={techIndex}
                          className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {item.technologies && item.technologies.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{item.technologies.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {portfolioItems.length > 9 && (
                <div className="text-center pt-2">
                  <div className="text-xs text-gray-500">
                    +{portfolioItems.length - 9} more projects available
                  </div>
                </div>
              )}
            </div>
          );
        } else {
          // Show debug info when no items found
          return (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-800 text-sm">Portfolio Gallery</h5>
              <div className="text-xs text-gray-500">
                No portfolio items found. Data structure: {typeof data.data}
              </div>
              {data.data && typeof data.data === 'object' && (
                <div className="text-xs text-gray-400">
                  Available keys: {Object.keys(data.data).join(', ')}
                </div>
              )}
            </div>
          );
        }
        break;

      case 'timeline':
        if (data.data.events && Array.isArray(data.data.events)) {
          const recentEvents = data.data.events.slice(0, 3);
          return (
            <div className="space-y-3">
              <h5 className="font-medium text-gray-800 text-sm">Career Timeline</h5>
              {recentEvents.map((event: any, index: number) => (
                <div key={index} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900">{event.title}</div>
                    <div className="text-gray-600 text-xs">{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        }
        break;

      case 'podcast':
        if (data.data.transcript || data.data.duration) {
          return (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-800 text-sm">Career Podcast</h5>
              {data.data.duration && (
                <div className="text-xs text-gray-600">Duration: {data.data.duration} seconds</div>
              )}
              {data.data.transcript && (
                <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                  <div className="line-clamp-3">{data.data.transcript.substring(0, 200)}...</div>
                </div>
              )}
            </div>
          );
        }
        break;

      case 'skillsVisualization':
        // Use the new SkillsRadarChart component
        if (data.data && typeof data.data === 'object') {
          return (
            <SkillsRadarChart 
              skillsData={data.data}
              interactive={true}
              showToggle={true}
              className="w-full"
            />
          );
        } else {
          // Fallback for unexpected data structure
          return (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-800 text-sm">Skills Radar</h5>
              <div className="text-xs text-gray-500">
                Invalid data structure: {typeof data.data}
              </div>
            </div>
          );
        }
        break;

      case 'videoIntroduction':
        return (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-800 text-sm">Video Introduction</h5>
            <div className="text-xs text-gray-600">
              Professional video presentation ready
            </div>
          </div>
        );

      default:
        // For other features, show a summary instead of raw JSON
        if (typeof data.data === 'object' && data.data !== null) {
          const keys = Object.keys(data.data);
          return (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-800 text-sm">Feature Data</h5>
              <div className="text-xs text-gray-600">
                Generated data includes: {keys.slice(0, 3).join(', ')}
                {keys.length > 3 && ` and ${keys.length - 3} more fields`}
              </div>
            </div>
          );
        }
    }

    return null;
  };

  // Render feature actions
  const renderFeatureActions = (feature: any) => {
    const { data, key } = feature;
    
    if (data.status !== 'completed' || !data.data) return null;

    const actions = [];

    // View action for all completed features
    actions.push(
      <button
        key="view"
        onClick={() => setExpandedFeature(expandedFeature === key ? null : key)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg border hover:bg-blue-200 transition-colors font-medium"
      >
        <Eye className="w-4 h-4" />
        {expandedFeature === key ? 'Hide' : 'View'}
      </button>
    );

    // Feature-specific actions
    if (data.url || data.shareableUrl) {
      actions.push(
        <a
          key="open"
          href={data.url || data.shareableUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg border hover:bg-green-200 transition-colors font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Open
        </a>
      );
    }

    if (key === 'podcast' && data.data?.audioUrl) {
      actions.push(
        <a
          key="play"
          href={data.data.audioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg border hover:bg-purple-200 transition-colors font-medium"
        >
          <Play className="w-4 h-4" />
          Play
        </a>
      );
    }

    return <div className="flex flex-wrap gap-2 mt-3">{actions}</div>;
  };

  if (processedFeatures.length === 0) {
    return (
      <section className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Star className="w-6 h-6 text-blue-600" />
          Enhanced Features
        </h2>
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-500 mb-2">No enhanced features are currently available</p>
          <p className="text-base text-gray-400">Enhanced features will appear here as they are generated</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Star className="w-6 h-6 text-blue-600" />
          Enhanced Features
        </h2>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          {processedFeatures.length} features available
        </div>
      </div>

      {/* Features by Category */}
      <div className="space-y-12">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category}>
            {/* Category Header */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {categoryConfig[category as keyof typeof categoryConfig].title}
              </h3>
              <p className="text-base text-gray-600">
                {categoryConfig[category as keyof typeof categoryConfig].description}
              </p>
            </div>

            {/* Features Grid - Improved spacing with 2-column max for better readability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categoryFeatures.map((feature) => {
                const IconComponent = feature.config.icon;
                const isExpanded = expandedFeature === feature.key;
                
                // Portfolio Gallery and Skills Radar get special full-width treatment when expanded
                const needsFullWidth = ((feature.key === 'portfolio' || feature.key === 'portfolioGallery' || feature.key === 'skillsVisualization') && isExpanded);
                const fullWidthColSpan = needsFullWidth ? 'lg:col-span-2' : '';

                return (
                  <div
                    key={feature.key}
                    className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300 ${fullWidthColSpan}`}
                  >
                    {/* Feature Header - Larger and more spaced */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${getStatusColors(feature.data.status, feature.config.color)} bg-opacity-10`}>
                          <IconComponent className={`w-6 h-6 text-${feature.config.color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-base mb-2">
                            {feature.config.title}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {feature.config.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {getStatusIcon(feature.data.status)}
                      </div>
                    </div>

                    {/* Status Information - More prominent */}
                    <div className="mb-4">
                      {feature.data.status === 'processing' && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
                            <span className="font-medium">{feature.data.currentStep || 'Processing...'}</span>
                            <span className="font-mono">{feature.data.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${feature.data.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {feature.data.status === 'failed' && feature.data.error && (
                        <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                          <div className="font-medium mb-1">❌ Failed</div>
                          <div className="text-xs">{feature.data.error}</div>
                        </div>
                      )}

                      {feature.data.status === 'completed' && (
                        <div className="text-sm text-green-700 font-medium bg-green-50 px-3 py-2 rounded-lg">
                          ✓ Completed Successfully
                        </div>
                      )}

                      {feature.data.status === 'pending' && (
                        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          ⏳ Waiting to process...
                        </div>
                      )}
                    </div>

                    {/* Feature Actions */}
                    {renderFeatureActions(feature)}

                    {/* Expanded Content - More spacious */}
                    {isExpanded && feature.data.status === 'completed' && feature.data.data && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className={`${feature.key === 'skillsVisualization' ? 'min-h-[400px]' : 'max-h-60 overflow-y-auto'}`}>
                          {renderReactComponent(feature)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Summary */}
      {processedFeatures.length > 1 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {processedFeatures.length}
              </div>
              <div className="text-sm text-gray-600">Total Features</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {processedFeatures.filter(f => f.data.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {processedFeatures.filter(f => f.data.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {processedFeatures.filter(f => f.data.status === 'failed').length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

EnhancedFeaturesGrid.displayName = 'EnhancedFeaturesGrid';

export default EnhancedFeaturesGrid;