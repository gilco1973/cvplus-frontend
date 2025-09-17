import React, { useState, useCallback, useRef } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  BarChart3,
  Radar as RadarIcon,
  TrendingUp,
  Zap,
  Cloud,
  Download,
  Settings,
  Eye,
  EyeOff,
  Palette,
  RotateCcw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { CVFeatureProps, SkillsData, Skill, SkillCategory } from '../../../types/cv-features';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { useFeatureData } from '../../../hooks/useFeatureData';

interface SkillsVisualizationProps extends CVFeatureProps {
  data: {
    skills: Skill[];
    categories: SkillCategory[];
    showProficiency?: boolean;
    groupByCategory?: boolean;
  };
  customization?: {
    chartType?: 'radar' | 'bar' | 'progress' | 'bubble' | 'word-cloud';
    colorScheme?: 'default' | 'professional' | 'vibrant' | 'monochrome';
    animateOnLoad?: boolean;
    showLegend?: boolean;
    compactMode?: boolean;
  };
}

interface ChartDataPoint {
  name: string;
  value: number;
  level: number;
  category: string;
  color?: string;
  yearsOfExperience?: number;
  endorsements?: number;
}

interface BubbleDataPoint {
  x: number;
  y: number;
  z: number;
  name: string;
  category: string;
  color?: string;
}

const COLOR_SCHEMES = {
  default: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    categories: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#F97316']
  },
  professional: {
    primary: '#1E3A8A',
    secondary: '#374151',
    success: '#065F46',
    warning: '#92400E',
    danger: '#991B1B',
    categories: ['#1E3A8A', '#374151', '#065F46', '#92400E', '#991B1B', '#0F172A', '#581C87']
  },
  vibrant: {
    primary: '#EC4899',
    secondary: '#8B5CF6',
    success: '#06D6A0',
    warning: '#FFD60A',
    danger: '#F72585',
    categories: ['#EC4899', '#8B5CF6', '#06D6A0', '#FFD60A', '#F72585', '#00B4D8', '#FB8500']
  },
  monochrome: {
    primary: '#374151',
    secondary: '#6B7280',
    success: '#4B5563',
    warning: '#9CA3AF',
    danger: '#D1D5DB',
    categories: ['#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6', '#1F2937']
  }
};

const CHART_ICONS = {
  radar: RadarIcon,
  bar: BarChart3,
  progress: TrendingUp,
  bubble: Zap,
  'word-cloud': Cloud
};

export const SkillsVisualization: React.FC<SkillsVisualizationProps> = ({
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
    chartType = 'radar',
    colorScheme = 'default',
    animateOnLoad = true,
    showLegend = true,
    compactMode = false
  } = customization;

  // State management
  const [currentChartType, setCurrentChartType] = useState(chartType);
  const [currentColorScheme, setCurrentColorScheme] = useState(colorScheme);
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Firebase data integration
  const {
    data: firebaseData,
    loading,
    error,
    refresh
  } = useFeatureData<SkillsData>({
    jobId,
    featureName: 'skills-visualization',
    initialData: propData,
    params: { profileId }
  });

  // Use provided data or fetched data
  const skillsData = propData || firebaseData;

  // Helper functions
  const getColorScheme = useCallback(() => {
    return COLOR_SCHEMES[currentColorScheme] || COLOR_SCHEMES.default;
  }, [currentColorScheme]);

  const getCategoryColor = useCallback((categoryIndex: number) => {
    const colors = getColorScheme().categories;
    return colors[categoryIndex % colors.length];
  }, [getColorScheme]);

  // Data processing functions
  const processRadarData = useCallback((): ChartDataPoint[] => {
    if (!skillsData?.skills) return [];

    return skillsData.skills
      .slice(0, 8) // Limit to 8 skills for readability
      .map((skill, index) => ({
        name: skill.name,
        value: skill.level * 10, // Convert to percentage
        level: skill.level,
        category: skill.category,
        color: getCategoryColor(index)
      }));
  }, [skillsData, getCategoryColor]);

  const processBarData = useCallback((): ChartDataPoint[] => {
    if (!skillsData?.skills) return [];

    return skillsData.skills
      .sort((a, b) => b.level - a.level)
      .slice(0, 12)
      .map((skill, index) => ({
        name: skill.name.length > 15 ? `${skill.name.substring(0, 15)}...` : skill.name,
        value: skill.level,
        level: skill.level,
        category: skill.category,
        color: getCategoryColor(
          skillsData.categories?.findIndex(cat => cat.name === skill.category) || 0
        ),
        yearsOfExperience: skill.yearsOfExperience,
        endorsements: skill.endorsements
      }));
  }, [skillsData, getCategoryColor]);

  const processBubbleData = useCallback((): BubbleDataPoint[] => {
    if (!skillsData?.skills) return [];

    return skillsData.skills.map((skill, index) => {
      const categoryIndex = skillsData.categories?.findIndex(cat => cat.name === skill.category) || 0;
      return {
        x: skill.level,
        y: skill.yearsOfExperience || 0,
        z: skill.endorsements || 1,
        name: skill.name,
        category: skill.category,
        color: getCategoryColor(categoryIndex)
      };
    });
  }, [skillsData, getCategoryColor]);

  const processProgressData = useCallback(() => {
    if (!skillsData?.categories) return [];

    return skillsData.categories.map((category, index) => {
      const categorySkills = skillsData.skills.filter(skill => skill.category === category.name);
      const averageLevel = categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length;
      
      return {
        name: category.name,
        value: averageLevel,
        count: categorySkills.length,
        color: getCategoryColor(index)
      };
    });
  }, [skillsData, getCategoryColor]);

  // Export functionality
  const handleExport = useCallback(async (format: 'png' | 'svg' = 'png') => {
    if (!chartRef.current) return;

    setIsExporting(true);
    try {
      if (format === 'png') {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true
        });
        
        const link = document.createElement('a');
        link.download = `skills-visualization-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
      
      toast.success(`Skills visualization exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export visualization');
      onError?.(error instanceof Error ? error : new Error('Export failed'));
    } finally {
      setIsExporting(false);
    }
  }, [onError]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label || data.name}</p>
          <p className="text-sm text-gray-600">
            Level: <span className="font-medium">{data.level}/10</span>
          </p>
          {data.yearsOfExperience && (
            <p className="text-sm text-gray-600">
              Experience: <span className="font-medium">{data.yearsOfExperience} years</span>
            </p>
          )}
          {data.endorsements && (
            <p className="text-sm text-gray-600">
              Endorsements: <span className="font-medium">{data.endorsements}</span>
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: data.color }}
            />
            <span className="text-xs text-gray-500">{data.category}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render chart based on type
  const renderChart = useCallback(() => {
    const colors = getColorScheme();

    switch (currentChartType) {
      case 'radar': {
        const data = processRadarData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data}>
              <PolarGrid stroke={colors.categories[0]} strokeOpacity={0.3} />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#374151' }}
                className="text-sm"
              />
              <PolarRadiusAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: '#6B7280' }}
                angle={90}
              />
              <Radar
                dataKey="value"
                stroke={colors.primary}
                fill={colors.primary}
                fillOpacity={0.2}
                strokeWidth={2}
                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        );
      }

      case 'bar': {
        const data = processBarData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#374151' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                domain={[0, 10]}
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="level" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'bubble': {
        const data = processBubbleData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Skill Level"
                domain={[0, 10]}
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Years of Experience"
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 300]} name="Endorsements" />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900">{data.name}</p>
                        <p className="text-sm text-gray-600">Level: {data.x}/10</p>
                        <p className="text-sm text-gray-600">Experience: {data.y} years</p>
                        <p className="text-sm text-gray-600">Endorsements: {data.z}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: data.color }}
                          />
                          <span className="text-xs text-gray-500">{data.category}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="z">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      }

      case 'progress': {
        const data = processProgressData();
        return (
          <div className="space-y-4">
            {data.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {category.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {category.count} skills
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {category.value.toFixed(1)}/10
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(category.value / 10) * 100}%`,
                      backgroundColor: category.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      }

      case 'word-cloud': {
        if (!skillsData?.skills) return <div>No skills data available</div>;
        
        return (
          <div className="flex flex-wrap gap-3 justify-center items-center p-6">
            {skillsData.skills
              .sort((a, b) => b.level - a.level)
              .map((skill, index) => {
                const size = Math.max(12, Math.min(32, skill.level * 3 + 12));
                const opacity = Math.max(0.4, skill.level / 10);
                const categoryIndex = skillsData.categories?.findIndex(
                  cat => cat.name === skill.category
                ) || 0;
                
                return (
                  <span
                    key={index}
                    className="font-semibold cursor-pointer transition-all duration-200 hover:scale-110"
                    style={{
                      fontSize: `${size}px`,
                      color: getCategoryColor(categoryIndex),
                      opacity
                    }}
                    title={`${skill.name}: ${skill.level}/10 (${skill.category})`}
                  >
                    {skill.name}
                  </span>
                );
              })}
          </div>
        );
      }

      default:
        return <div>Unsupported chart type</div>;
    }
  }, [currentChartType, skillsData, getColorScheme, processRadarData, processBarData, processBubbleData, processProgressData, getCategoryColor]);

  // Settings panel
  const SettingsPanel = () => (
    <div className="absolute top-4 right-4 z-10">
      <div className="relative">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          aria-label="Chart settings"
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </button>
        
        {showSettings && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Chart Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CHART_ICONS).map(([type, Icon]) => (
                  <button
                    key={type}
                    onClick={() => setCurrentChartType(type as any)}
                    className={`p-2 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                      currentChartType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Color Scheme
              </label>
              <div className="space-y-2">
                {Object.keys(COLOR_SCHEMES).map((scheme) => (
                  <button
                    key={scheme}
                    onClick={() => setCurrentColorScheme(scheme as any)}
                    className={`w-full p-2 border rounded-lg text-left transition-colors ${
                      currentColorScheme === scheme
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES].categories.slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-sm capitalize">{scheme}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <button
                onClick={() => handleExport('png')}
                disabled={isExporting}
                className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export PNG'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Handle component disabled state
  if (!isEnabled) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Skills Visualization"
        description="Loading your skills data..."
        isLoading={true}
      >
        <LoadingSpinner size="large" message="Processing skills data..." />
      </FeatureWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Skills Visualization"
        error={error}
        onRetry={refresh}
      >
        <div />
      </FeatureWrapper>
    );
  }

  // No data state
  if (!skillsData?.skills || skillsData.skills.length === 0) {
    return (
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Skills Visualization"
        description="No skills data available"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <BarChart3 className="w-full h-full" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Skills Data
          </h3>
          <p className="text-gray-600 mb-4">
            Add your skills to see them visualized here.
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

  // Legend component
  const Legend = () => {
    if (!showLegend || !skillsData?.categories) return null;

    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4 p-4 bg-gray-50 rounded-lg">
        {skillsData.categories.map((category, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: getCategoryColor(index) }}
            />
            <span className="text-sm text-gray-700">{category.name}</span>
            <span className="text-xs text-gray-500">
              ({category.skills?.length || skillsData.skills.filter(s => s.category === category.name).length})
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Main render
  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Skills Visualization"
        description={`Explore your skills across ${skillsData.skills.length} technologies and ${skillsData.categories?.length || 0} categories`}
      >
        <div className="relative">
          <SettingsPanel />
          
          <div 
            ref={chartRef} 
            className={`bg-white rounded-lg ${compactMode ? 'p-2' : 'p-6'}`}
          >
            {/* Chart Type Indicator */}
            <div className="flex items-center gap-2 mb-4">
              {React.createElement(CHART_ICONS[currentChartType], {
                className: "w-5 h-5 text-blue-600"
              })}
              <h4 className="text-lg font-semibold text-gray-900 capitalize">
                {currentChartType.replace('-', ' ')} Chart
              </h4>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {skillsData.skills.length} skills
                </span>
              </div>
            </div>

            {/* Chart Container */}
            <div className={`${compactMode ? 'h-64' : 'h-96'} w-full`}>
              {renderChart()}
            </div>

            {/* Legend */}
            <Legend />

            {/* Skills Summary */}
            {!compactMode && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {skillsData.skills.length}
                  </div>
                  <p className="text-sm text-blue-700">Total Skills</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {skillsData.categories?.length || 0}
                  </div>
                  <p className="text-sm text-green-700">Categories</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {(skillsData.skills.reduce((sum, skill) => sum + skill.level, 0) / skillsData.skills.length).toFixed(1)}
                  </div>
                  <p className="text-sm text-yellow-700">Avg Level</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {skillsData.skills.filter(skill => skill.level >= 8).length}
                  </div>
                  <p className="text-sm text-purple-700">Expert Level</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};