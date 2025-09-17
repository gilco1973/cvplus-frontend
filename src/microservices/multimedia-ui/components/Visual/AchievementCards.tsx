import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  Trophy,
  Award,
  Star,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  BarChart3,
  Download,
  Filter,
  Grid3X3,
  LayoutGrid,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Eye,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { CVFeatureProps } from '../../../types/cv-features';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { useFeatureData } from '../../../hooks/useFeatureData';

// Achievement Data Interfaces
interface Achievement {
  id: string;
  title: string;
  description: string;
  impact?: string;
  metrics?: AchievementMetric[];
  category: string;
  date?: string;
  importance: 'high' | 'medium' | 'low';
  icon?: string;
  tags?: string[];
}

interface AchievementMetric {
  label: string;
  value: string | number;
  type: 'percentage' | 'number' | 'currency' | 'time';
  improvement?: string;
}

interface AchievementCardsProps extends CVFeatureProps {
  data: {
    achievements: Achievement[];
    totalAchievements?: number;
    highlightedAchievements?: string[];
  };
  customization?: {
    layout?: 'grid' | 'carousel' | 'masonry';
    animationType?: 'fade' | 'slide' | 'zoom' | 'flip';
    showMetrics?: boolean;
    showIcons?: boolean;
    cardSize?: 'small' | 'medium' | 'large';
    colorScheme?: 'default' | 'professional' | 'colorful' | 'minimal';
  };
}

// Constants
const IMPORTANCE_COLORS = {
  high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-600' },
  low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' }
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'work': Trophy,
  'project': Target,
  'education': Award,
  'certification': Star,
  'leadership': Zap,
  'performance': TrendingUp,
  'innovation': BarChart3,
  'default': Trophy
};

const COLOR_SCHEMES = {
  default: {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-100',
    accent: 'text-blue-600',
    border: 'border-gray-200'
  },
  professional: {
    primary: 'bg-slate-700',
    secondary: 'bg-slate-50',
    accent: 'text-slate-700',
    border: 'border-slate-200'
  },
  colorful: {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600',
    secondary: 'bg-gradient-to-r from-blue-50 to-purple-50',
    accent: 'text-purple-600',
    border: 'border-purple-200'
  },
  minimal: {
    primary: 'bg-gray-900',
    secondary: 'bg-gray-50',
    accent: 'text-gray-900',
    border: 'border-gray-100'
  }
};

const ANIMATION_VARIANTS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  zoom: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  flip: {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 }
  }
};

export const AchievementCards: React.FC<AchievementCardsProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data: propData,
  customization = {},
  onUpdate,
  onError,
  className = '',
  mode = 'private'
}) => {
  // Destructure customization with defaults
  const {
    layout = 'grid',
    animationType = 'fade',
    showMetrics = true,
    showIcons = true,
    cardSize = 'medium',
    colorScheme = 'default'
  } = customization;

  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'importance' | 'title'>('importance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Firebase data integration
  const {
    data: firebaseData,
    loading,
    error,
    refresh
  } = useFeatureData<{ achievements: Achievement[]; totalAchievements?: number; highlightedAchievements?: string[] }>({
    jobId,
    featureName: 'achievement-cards',
    initialData: propData,
    params: { profileId }
  });

  // Use provided data or fetched data
  const achievementData = propData || firebaseData;

  // Memoized calculations
  const filteredAndSortedAchievements = useMemo(() => {
    if (!achievementData?.achievements) return [];

    const filtered = achievementData.achievements.filter(achievement => {
      const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
      const importanceMatch = selectedImportance === 'all' || achievement.importance === selectedImportance;
      return categoryMatch && importanceMatch;
    });

    // Sort achievements
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = (new Date(a.date || '').getTime()) - (new Date(b.date || '').getTime());
          break;
        case 'importance': {
          const importanceOrder = { high: 3, medium: 2, low: 1 };
          comparison = importanceOrder[a.importance] - importanceOrder[b.importance];
          break;
        }
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [achievementData?.achievements, selectedCategory, selectedImportance, sortBy, sortOrder]);

  const categories = useMemo(() => {
    if (!achievementData?.achievements) return [];
    const cats = Array.from(new Set(achievementData.achievements.map(a => a.category)));
    return ['all', ...cats];
  }, [achievementData?.achievements]);

  const itemsPerPage = layout === 'carousel' ? 1 : (cardSize === 'small' ? 12 : cardSize === 'medium' ? 8 : 6);
  const totalPages = Math.ceil(filteredAndSortedAchievements.length / itemsPerPage);
  const paginatedAchievements = layout === 'carousel' 
    ? [filteredAndSortedAchievements[currentPage]].filter(Boolean)
    : filteredAndSortedAchievements.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  // Helper functions
  const formatMetricValue = useCallback((metric: AchievementMetric): string => {
    switch (metric.type) {
      case 'percentage':
        return `${metric.value}%`;
      case 'currency':
        return `$${typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}`;
      case 'time':
        return `${metric.value} ${typeof metric.value === 'number' && metric.value === 1 ? 'day' : 'days'}`;
      default:
        return String(metric.value);
    }
  }, []);

  const getIconForCategory = useCallback((category: string) => {
    return CATEGORY_ICONS[category.toLowerCase()] || CATEGORY_ICONS.default;
  }, []);

  const handleExport = useCallback(async () => {
    if (!cardsRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `achievement-cards-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Achievement cards exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export achievement cards');
      onError?.(error instanceof Error ? error : new Error('Export failed'));
    } finally {
      setIsExporting(false);
    }
  }, [onError]);

  const handleCardClick = useCallback((achievementId: string) => {
    setExpandedCard(expandedCard === achievementId ? null : achievementId);
  }, [expandedCard]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  }, []);

  // Component disabled state
  if (!isEnabled) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Achievement Cards"
        description="Loading your achievements..."
        isLoading={true}
      >
        <LoadingSpinner size="large" message="Processing achievement data..." />
      </FeatureWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Achievement Cards"
        error={error}
        onRetry={refresh}
      >
        <div />
      </FeatureWrapper>
    );
  }

  // No data state
  if (!achievementData?.achievements || achievementData.achievements.length === 0) {
    return (
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Achievement Cards"
        description="No achievements data available"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <Trophy className="w-full h-full" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Achievements Found
          </h3>
          <p className="text-gray-600 mb-4">
            Add your achievements to see them displayed here.
          </p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Refresh
          </button>
        </div>
      </FeatureWrapper>
    );
  }

  // Filter and Controls Component
  const FilterControls = () => (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Importance Filter */}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-500" />
            <select
              value={selectedImportance}
              onChange={(e) => setSelectedImportance(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="importance">Sort by Priority</option>
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm transition-colors"
            title="Export achievement cards"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedAchievements.length} of {achievementData.achievements.length} achievements
        {achievementData.highlightedAchievements && achievementData.highlightedAchievements.length > 0 && (
          <span className="ml-2">({achievementData.highlightedAchievements.length} highlighted)</span>
        )}
      </div>
    </div>
  );

  // Achievement Card Component
  const AchievementCard = ({ achievement, index }: { achievement: Achievement; index: number }) => {
    const IconComponent = getIconForCategory(achievement.category);
    const importanceStyle = IMPORTANCE_COLORS[achievement.importance];
    const colorSchemeStyle = COLOR_SCHEMES[colorScheme];
    const isExpanded = expandedCard === achievement.id;
    const isHighlighted = achievementData?.highlightedAchievements?.includes(achievement.id);

    const cardSizeClasses = {
      small: 'p-4',
      medium: 'p-6',
      large: 'p-8'
    };

    return (
      <div 
        className={`animate-fade-in ${cardSizeClasses[cardSize]} ${colorSchemeStyle.border} ${
          isHighlighted ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
        } bg-white border rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden`}
        key={achievement.id}
        onClick={() => handleCardClick(achievement.id)}
      >
        {/* Highlighted Badge */}
        {isHighlighted && (
          <div className="absolute top-2 right-2">
            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3" />
              Featured
            </div>
          </div>
        )}

        {/* Priority Indicator */}
        <div className={`absolute top-0 left-0 w-1 h-full ${importanceStyle.bg.replace('bg-', 'bg-gradient-to-b from-').replace('50', '400')}`} />

        {/* Card Header */}
        <div className="flex items-start gap-4 mb-4">
          {showIcons && (
            <div className={`flex-shrink-0 w-12 h-12 ${importanceStyle.bg} ${importanceStyle.border} border rounded-lg flex items-center justify-center`}>
              <IconComponent className={`w-6 h-6 ${importanceStyle.icon}`} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold text-gray-900 mb-1 leading-tight ${cardSize === 'small' ? 'text-base' : ''}`}>
              {achievement.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className={`px-2 py-1 ${importanceStyle.bg} ${importanceStyle.text} rounded-full text-xs font-medium`}>
                {achievement.category}
              </span>
              {achievement.date && (
                <>
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(achievement.date).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className={`text-gray-600 mb-4 leading-relaxed ${cardSize === 'small' ? 'text-sm' : ''}`}>
          {achievement.description}
        </p>

        {/* Impact Section */}
        {achievement.impact && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Impact
            </h4>
            <p className={`text-gray-700 ${cardSize === 'small' ? 'text-sm' : ''}`}>
              {achievement.impact}
            </p>
          </div>
        )}

        {/* Metrics */}
        {showMetrics && achievement.metrics && achievement.metrics.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Key Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievement.metrics.map((metric, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">
                    {formatMetricValue(metric)}
                    {metric.improvement && (
                      <span className="text-sm text-green-600 ml-2 font-normal">
                        {metric.improvement}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {achievement.tags && achievement.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {achievement.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand/Collapse Indicator */}
        <div className="absolute bottom-2 right-2 text-gray-400">
          <Eye className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
    );
  };

  // Layout Components
  const GridLayout = () => (
    <div className={`grid gap-6 ${
      cardSize === 'small' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
        : cardSize === 'medium'
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 lg:grid-cols-2'
    }`}>
      <div>
        {paginatedAchievements.map((achievement, index) => (
          <AchievementCard key={achievement.id} achievement={achievement} index={index} />
        ))}
      </div>
    </div>
  );

  const CarouselLayout = () => (
    <div className="relative">
      <div className="overflow-hidden">
        <div>
          {paginatedAchievements.length > 0 && (
            <div 
              className="animate-fade-in w-full"
              key={currentPage}
            >
              <AchievementCard achievement={paginatedAchievements[0]} index={0} />
            </div>
          )}
        </div>
      </div>
      
      {/* Carousel Controls */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {currentPage + 1} of {filteredAndSortedAchievements.length}
          </span>
        </div>
        
        <button
          onClick={nextPage}
          disabled={currentPage >= filteredAndSortedAchievements.length - 1}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const MasonryLayout = () => {
    // Simple masonry using CSS columns
    const columnCount = cardSize === 'small' ? 4 : cardSize === 'medium' ? 3 : 2;
    
    return (
      <div 
        className={`columns-1 md:columns-2 lg:columns-${columnCount} gap-6 space-y-6`}
        style={{ columnFill: 'balance' }}
      >
        <div>
          {paginatedAchievements.map((achievement, index) => (
            <div key={achievement.id} className="break-inside-avoid mb-6">
              <AchievementCard achievement={achievement} index={index} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Pagination Component (for grid and masonry)
  const Pagination = () => {
    if (layout === 'carousel' || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 inline mr-1" />
          Previous
        </button>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
            if (pageNum >= totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-lg transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages - 1}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4 inline ml-1" />
        </button>
      </div>
    );
  };

  // Summary Stats Component
  const SummaryStats = () => {
    const stats = {
      total: achievementData.achievements.length,
      high: achievementData.achievements.filter(a => a.importance === 'high').length,
      withMetrics: achievementData.achievements.filter(a => a.metrics && a.metrics.length > 0).length,
      categories: new Set(achievementData.achievements.map(a => a.category)).size
    };

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <p className="text-sm text-blue-700">Total Achievements</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.high}</div>
          <p className="text-sm text-red-700">High Priority</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.withMetrics}</div>
          <p className="text-sm text-green-700">With Metrics</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
          <p className="text-sm text-purple-700">Categories</p>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Achievement Cards"
        description={`Showcase your ${achievementData.achievements.length} achievements across ${new Set(achievementData.achievements.map(a => a.category)).size} categories`}
      >
        <div ref={cardsRef} className="space-y-6">
          {/* Summary Statistics */}
          <SummaryStats />
          
          {/* Filter Controls */}
          <FilterControls />
          
          {/* Achievement Cards Layout */}
          <div className="min-h-96">
            {layout === 'grid' && <GridLayout />}
            {layout === 'carousel' && <CarouselLayout />}
            {layout === 'masonry' && <MasonryLayout />}
          </div>
          
          {/* Pagination */}
          <Pagination />
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};