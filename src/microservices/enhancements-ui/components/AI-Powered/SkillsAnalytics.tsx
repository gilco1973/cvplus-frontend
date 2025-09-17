import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Target,
  Award,
  BarChart3,
  Radar as RadarIcon,
  Users,
  Star,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  Search,
  Eye,
  Calendar,
  Zap,
  BookOpen,
  Trophy,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
  Palette,
  RefreshCw,
  FileText
} from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';

import {
  CVFeatureProps,
  Skill,
  SkillCategory,
  ProficiencyLevel,
  ComparisonData
} from '../../../types/cv-features';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { useFeatureData } from '../../../hooks/useFeatureData';

// Enhanced Skills Analytics Props Interface
export interface SkillsAnalyticsProps extends CVFeatureProps {
  data: {
    skills: Skill[];
    categories: SkillCategory[];
    proficiencyLevels: ProficiencyLevel[];
    industryComparison?: ComparisonData;
    trendData?: SkillTrendData[];
    skillGaps?: SkillGap[];
    endorsements?: SkillEndorsement[];
    marketDemand?: MarketDemandData[];
  };
  customization?: {
    chartType?: 'radar' | 'bar' | 'progress' | 'bubble';
    showComparison?: boolean;
    interactive?: boolean;
    animateOnLoad?: boolean;
    colorScheme?: 'default' | 'professional' | 'modern' | 'minimal';
    enableExport?: boolean;
    showGrowthTracking?: boolean;
    showMarketDemand?: boolean;
    compactMode?: boolean;
  };
}

// Additional Types for Enhanced Functionality
interface SkillTrendData {
  skill: string;
  timeline: {
    date: string;
    level: number;
    confidence: number;
  }[];
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
  timeToAchieve: number; // in months
  marketDemand: number; // 0-100
}

interface SkillEndorsement {
  skill: string;
  count: number;
  sources: string[];
  credibility: number; // 0-100
}

interface MarketDemandData {
  skill: string;
  demand: number; // 0-100
  growth: number; // percentage growth
  salaryImpact: number; // percentage salary increase
  jobOpenings: number;
}

interface ChartData {
  skill: string;
  level: number;
  category: string;
  color: string;
  yearsOfExperience?: number;
  endorsements?: number;
  marketDemand?: number;
  confidence?: number;
}

// Color schemes for different themes
const COLOR_SCHEMES = {
  default: {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    categories: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']
  },
  professional: {
    primary: '#1e40af',
    secondary: '#059669',
    accent: '#d97706',
    danger: '#dc2626',
    categories: ['#1e40af', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#65a30d']
  },
  modern: {
    primary: '#6366f1',
    secondary: '#06b6d4',
    accent: '#f59e0b',
    danger: '#ef4444',
    categories: ['#6366f1', '#06b6d4', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#f97316']
  },
  minimal: {
    primary: '#374151',
    secondary: '#6b7280',
    accent: '#9ca3af',
    danger: '#ef4444',
    categories: ['#374151', '#6b7280', '#9ca3af', '#4b5563', '#d1d5db', '#f3f4f6', '#e5e7eb']
  }
};

// Component Implementation
export const SkillsAnalytics: React.FC<SkillsAnalyticsProps> = ({
  jobId,
  profileId,
  data: initialData,
  customization = {},
  onUpdate,
  onError,
  className = '',
  mode = 'private'
}) => {
  // State management
  const [activeChart, setActiveChart] = useState<'radar' | 'bar' | 'progress' | 'bubble'>(
    customization.chartType || 'radar'
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    skillsOverview: true,
    industryComparison: false,
    skillGaps: true,
    growthTracking: false,
    marketDemand: false,
    recommendations: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'category' | 'marketDemand'>('level');
  const [showOnlyGaps, setShowOnlyGaps] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'3m' | '6m' | '1y' | '2y'>('6m');

  // Customization defaults
  const {
    showComparison = true,
    interactive = true,
    animateOnLoad = true,
    colorScheme = 'default',
    enableExport = true,
    showGrowthTracking = true,
    showMarketDemand = true,
    compactMode = false
  } = customization;

  // Hooks
  const {
    data: skillsData,
    loading,
    error,
    refresh
  } = useFeatureData<SkillsAnalyticsProps['data']>({
    jobId,
    featureName: 'skills-analytics',
    initialData
  });

  // Derived state
  const currentData = skillsData || initialData;
  const skills = currentData?.skills || [];
  const categories = currentData?.categories || [];
  const proficiencyLevels = currentData?.proficiencyLevels || [];
  const industryComparison = currentData?.industryComparison;
  const trendData = currentData?.trendData || [];
  const skillGaps = currentData?.skillGaps || [];
  const endorsements = currentData?.endorsements || [];
  const marketDemand = currentData?.marketDemand || [];

  // Color scheme
  const colors = COLOR_SCHEMES[colorScheme];

  // Filtered and sorted skills
  const filteredSkills = useMemo(() => {
    const filtered = skills.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || skill.category === selectedCategory;
      const matchesGaps = !showOnlyGaps || skillGaps.some(gap => gap.skill === skill.name);
      return matchesSearch && matchesCategory && matchesGaps;
    });

    // Sort skills
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'level':
          return b.level - a.level;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'marketDemand': {
          const demandA = marketDemand.find(d => d.skill === a.name)?.demand || 0;
          const demandB = marketDemand.find(d => d.skill === b.name)?.demand || 0;
          return demandB - demandA;
        }
        default:
          return b.level - a.level;
      }
    });

    return filtered;
  }, [skills, searchTerm, selectedCategory, showOnlyGaps, sortBy, skillGaps, marketDemand]);

  // Chart data preparation
  const chartData: ChartData[] = useMemo(() => {
    return filteredSkills.map((skill, index) => {
      const categoryIndex = categories.findIndex(cat => cat.name === skill.category);
      const categoryColor = categories[categoryIndex]?.color || colors.categories[categoryIndex % colors.categories.length];
      const endorsement = endorsements.find(e => e.skill === skill.name);
      const demand = marketDemand.find(d => d.skill === skill.name);
      const proficiency = proficiencyLevels.find(p => p.skill === skill.name);

      return {
        skill: skill.name,
        level: skill.level,
        category: skill.category,
        color: categoryColor,
        yearsOfExperience: skill.yearsOfExperience || 0,
        endorsements: endorsement?.count || 0,
        marketDemand: demand?.demand || 0,
        confidence: proficiency?.confidence || 0
      };
    });
  }, [filteredSkills, categories, colors, endorsements, marketDemand, proficiencyLevels]);

  // Radar chart data
  const radarData = useMemo(() => {
    const categoryAverages = categories.map(category => {
      const categorySkills = skills.filter(skill => skill.category === category.name);
      const average = categorySkills.length > 0
        ? categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length
        : 0;

      const industryAvg = industryComparison?.averageLevel || 0;
      const marketAvg = categorySkills.length > 0
        ? categorySkills.reduce((sum, skill) => {
            const demand = marketDemand.find(d => d.skill === skill.name);
            return sum + (demand?.demand || 0);
          }, 0) / categorySkills.length
        : 0;

      return {
        subject: category.name,
        'Your Skills': Math.round(average),
        'Industry Average': Math.round(industryAvg),
        'Market Demand': Math.round(marketAvg),
        fullMark: 100
      };
    });

    return categoryAverages;
  }, [categories, skills, industryComparison, marketDemand]);

  // Bubble chart data
  const bubbleData = useMemo(() => {
    return chartData.map(item => ({
      x: item.level,
      y: item.marketDemand,
      z: item.endorsements + 1, // +1 to avoid zero size
      name: item.skill,
      category: item.category,
      color: item.color
    }));
  }, [chartData]);

  // Skill gap analysis
  const gapAnalysis = useMemo(() => {
    return skillGaps.map(gap => {
      const skill = skills.find(s => s.name === gap.skill);
      const demand = marketDemand.find(d => d.skill === gap.skill);
      const endorsement = endorsements.find(e => e.skill === gap.skill);

      return {
        ...gap,
        currentSkill: skill,
        marketInfo: demand,
        endorsementInfo: endorsement,
        gapSize: gap.targetLevel - gap.currentLevel,
        priorityScore: (
          (gap.priority === 'high' ? 3 : gap.priority === 'medium' ? 2 : 1) *
          (demand?.demand || 0) / 100 *
          (gap.targetLevel - gap.currentLevel)
        )
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }, [skillGaps, skills, marketDemand, endorsements]);

  // Growth tracking data
  const growthData = useMemo(() => {
    if (!trendData.length) return [];

    const months = {
      '3m': 3,
      '6m': 6,
      '1y': 12,
      '2y': 24
    };

    const cutoffDate = subMonths(new Date(), months[selectedTimeRange]);

    return trendData.map(trend => ({
      skill: trend.skill,
      data: trend.timeline
        .filter(point => new Date(point.date) >= cutoffDate)
        .map(point => ({
          date: format(new Date(point.date), 'MMM yy'),
          level: point.level,
          confidence: point.confidence
        }))
    })).filter(trend => trend.data.length > 0);
  }, [trendData, selectedTimeRange]);

  // Helper functions
  const getSkillLevelLabel = useCallback((level: number): string => {
    if (level >= 90) return 'Expert';
    if (level >= 75) return 'Advanced';
    if (level >= 60) return 'Intermediate';
    if (level >= 40) return 'Beginner';
    return 'Novice';
  }, []);

  const getSkillLevelColor = useCallback((level: number): string => {
    if (level >= 90) return 'text-green-600 bg-green-50';
    if (level >= 75) return 'text-blue-600 bg-blue-50';
    if (level >= 60) return 'text-yellow-600 bg-yellow-50';
    if (level >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  }, []);

  const getPriorityIcon = useCallback((priority: string) => {
    switch (priority) {
      case 'high':
        return <ArrowUp className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Minus className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <ArrowDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  // Event handlers
  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const exportData = {
        skills: chartData,
        analysis: {
          totalSkills: skills.length,
          averageLevel: skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length,
          topCategories: categories.map(cat => ({
            name: cat.name,
            skillCount: skills.filter(s => s.category === cat.name).length,
            averageLevel: skills
              .filter(s => s.category === cat.name)
              .reduce((sum, s) => sum + s.level, 0) /
              Math.max(skills.filter(s => s.category === cat.name).length, 1)
          })),
          skillGaps: gapAnalysis.slice(0, 10),
          marketComparison: industryComparison
        },
        exportDate: new Date().toISOString(),
        metadata: {
          jobId,
          profileId,
          chartType: activeChart,
          colorScheme
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skills-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      onError?.(new Error('Failed to export skills analytics'));
    }
  }, [chartData, skills, categories, gapAnalysis, industryComparison, jobId, profileId, activeChart, colorScheme, onError]);

  const handleSkillUpdate = useCallback((skillName: string, newLevel: number) => {
    if (!interactive) return;

    const updatedSkills = skills.map(skill =>
      skill.name === skillName ? { ...skill, level: newLevel } : skill
    );

    onUpdate?.({
      skills: updatedSkills,
      lastUpdated: new Date().toISOString()
    });
  }, [skills, interactive, onUpdate]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label || data.skill}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name.includes('Level') || entry.name.includes('Demand') ? '%' : ''}
            </p>
          ))}
          {data.yearsOfExperience && (
            <p className="text-xs text-gray-500 mt-1">
              Experience: {data.yearsOfExperience} years
            </p>
          )}
          {data.endorsements && (
            <p className="text-xs text-gray-500">
              Endorsements: {data.endorsements}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Error handling
  if (error) {
    return (
      <FeatureWrapper
        title="Skills Analytics"
        description="AI-powered skills analysis and market insights"
        error={error}
        onRetry={refresh}
        mode={mode}
        className={className}
      >
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load skills analytics data</p>
        </div>
      </FeatureWrapper>
    );
  }

  // Loading state
  if (loading && !currentData) {
    return (
      <FeatureWrapper
        title="Skills Analytics"
        description="AI-powered skills analysis and market insights"
        isLoading={true}
        mode={mode}
        className={className}
      >
        <LoadingSpinner size="large" message="Analyzing your skills..." />
      </FeatureWrapper>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        title="Skills Analytics"
        description="AI-powered skills analysis and market insights"
        mode={mode}
        className={className}
      >
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="level">Sort by Level</option>
                <option value="name">Sort by Name</option>
                <option value="category">Sort by Category</option>
                <option value="marketDemand">Sort by Market Demand</option>
              </select>
              
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showOnlyGaps}
                  onChange={(e) => setShowOnlyGaps(e.target.checked)}
                  className="rounded"
                />
                Only Skill Gaps
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Chart Type Selector */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-lg border">
                <button
                  onClick={() => setActiveChart('radar')}
                  className={`p-2 rounded ${activeChart === 'radar' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Radar Chart"
                >
                  <RadarIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveChart('bar')}
                  className={`p-2 rounded ${activeChart === 'bar' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveChart('progress')}
                  className={`p-2 rounded ${activeChart === 'progress' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Progress Bars"
                >
                  <Target className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveChart('bubble')}
                  className={`p-2 rounded ${activeChart === 'bubble' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Bubble Chart"
                >
                  <Zap className="w-4 h-4" />
                </button>
              </div>
              
              {enableExport && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}
              
              <button
                onClick={refresh}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Skills Overview */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div 
              className="flex items-center justify-between cursor-pointer mb-6"
              onClick={() => toggleSection('skillsOverview')}
            >
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Skills Overview ({filteredSkills.length})
              </h3>
              {expandedSections.skillsOverview ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </div>
            
            {expandedSections.skillsOverview && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{skills.length}</div>
                    <div className="text-sm text-blue-700">Total Skills</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length) || 0}%
                    </div>
                    <div className="text-sm text-green-700">Average Level</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
                    <div className="text-sm text-purple-700">Categories</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">{skillGaps.length}</div>
                    <div className="text-sm text-amber-700">Skill Gaps</div>
                  </div>
                </div>

                {/* Main Chart */}
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeChart === 'radar' && (
                      <RadarChart data={radarData}>
                        <PolarGrid stroke={colors.primary} opacity={0.2} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]} 
                          tick={{ fontSize: 10 }}
                          tickCount={5}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Radar
                          name="Your Skills"
                          dataKey="Your Skills"
                          stroke={colors.primary}
                          fill={colors.primary}
                          fillOpacity={0.3}
                          strokeWidth={2}
                          animationDuration={animateOnLoad ? 1500 : 0}
                        />
                        {showComparison && industryComparison && (
                          <Radar
                            name="Industry Average"
                            dataKey="Industry Average"
                            stroke={colors.secondary}
                            fill={colors.secondary}
                            fillOpacity={0.1}
                            strokeDasharray="5 5"
                            animationDuration={animateOnLoad ? 1500 : 0}
                          />
                        )}
                        {showMarketDemand && (
                          <Radar
                            name="Market Demand"
                            dataKey="Market Demand"
                            stroke={colors.accent}
                            fill={colors.accent}
                            fillOpacity={0.1}
                            strokeDasharray="3 3"
                            animationDuration={animateOnLoad ? 1500 : 0}
                          />
                        )}
                      </RadarChart>
                    )}
                    
                    {activeChart === 'bar' && (
                      <BarChart data={chartData.slice(0, 15)}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.primary} opacity={0.1} />
                        <XAxis 
                          dataKey="skill" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={11}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="level" 
                          name="Skill Level"
                          radius={[4, 4, 0, 0]}
                          animationDuration={animateOnLoad ? 1000 : 0}
                        >
                          {chartData.slice(0, 15).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                    
                    {activeChart === 'bubble' && (
                      <ScatterChart data={bubbleData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.primary} opacity={0.1} />
                        <XAxis 
                          dataKey="x" 
                          name="Skill Level"
                          domain={[0, 100]}
                          type="number"
                        />
                        <YAxis 
                          dataKey="y" 
                          name="Market Demand"
                          domain={[0, 100]}
                          type="number"
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-semibold text-gray-900">{data.name}</p>
                                  <p className="text-sm text-blue-600">Skill Level: {data.x}%</p>
                                  <p className="text-sm text-green-600">Market Demand: {data.y}%</p>
                                  <p className="text-sm text-purple-600">Endorsements: {data.z - 1}</p>
                                  <p className="text-xs text-gray-500 mt-1">Category: {data.category}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter 
                          name="Skills"
                          dataKey="z"
                          animationDuration={animateOnLoad ? 1000 : 0}
                        >
                          {bubbleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} opacity={0.7} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Progress Bars View */}
                {activeChart === 'progress' && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {chartData.slice(0, 20).map((skill, index) => (
                      <div key={skill.skill} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">{skill.skill}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getSkillLevelColor(skill.level)}`}>
                              {getSkillLevelLabel(skill.level)}
                            </span>
                            <span className="text-xs text-gray-500">{skill.category}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                          <div 
                            className="h-3 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                            style={{ 
                              width: `${skill.level}%`,
                              backgroundColor: skill.color,
                              animationDelay: animateOnLoad ? `${index * 100}ms` : '0ms'
                            }}
                          >
                            {skill.endorsements > 0 && (
                              <div className="flex items-center gap-1 text-white text-xs">
                                <Star className="w-3 h-3" />
                                <span>{skill.endorsements}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Industry Comparison */}
          {showComparison && industryComparison && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer mb-6"
                onClick={() => toggleSection('industryComparison')}
              >
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  Industry Comparison
                </h3>
                {expandedSections.industryComparison ? 
                  <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                }
              </div>
              
              {expandedSections.industryComparison && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length) || 0}%
                      </div>
                      <div className="text-sm text-blue-700">Your Average</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {Math.round(industryComparison.averageLevel)}%
                      </div>
                      <div className="text-sm text-gray-700">Industry Average</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {industryComparison.percentile}th
                      </div>
                      <div className="text-sm text-green-700">Percentile</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <p className="text-lg font-medium text-gray-900">
                      {industryComparison.industry} Industry Comparison
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      You rank in the {industryComparison.percentile}th percentile of professionals in your field
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skill Gaps Analysis */}
          {skillGaps.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer mb-6"
                onClick={() => toggleSection('skillGaps')}
              >
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-6 h-6 text-orange-500" />
                  Skill Gaps & Opportunities ({gapAnalysis.length})
                </h3>
                {expandedSections.skillGaps ? 
                  <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                }
              </div>
              
              {expandedSections.skillGaps && (
                <div className="space-y-4">
                  {gapAnalysis.slice(0, 8).map((gap, index) => (
                    <div key={gap.skill} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getPriorityIcon(gap.priority)}
                          <div>
                            <h4 className="font-semibold text-gray-900">{gap.skill}</h4>
                            <p className="text-sm text-gray-600">
                              Current: {gap.currentLevel}% → Target: {gap.targetLevel}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            gap.priority === 'high' ? 'bg-red-100 text-red-700' :
                            gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {gap.priority.toUpperCase()} PRIORITY
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {gap.timeToAchieve} months to achieve
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress to Target</span>
                          <span>{Math.round((gap.currentLevel / gap.targetLevel) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                            style={{ width: `${(gap.currentLevel / gap.targetLevel) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      {gap.marketInfo && (
                        <div className="mb-3 flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            Market Demand: <span className="font-medium text-blue-600">{gap.marketInfo.demand}%</span>
                          </span>
                          <span className="text-gray-600">
                            Salary Impact: <span className="font-medium text-green-600">+{gap.marketInfo.salaryImpact}%</span>
                          </span>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Recommendations:</p>
                        {gap.recommendations.slice(0, 2).map((rec, recIndex) => {
                          // Handle both string and object formats for recommendations
                          const recText = typeof rec === 'string' 
                            ? rec 
                            : rec?.title || rec?.description || (rec?.type && rec?.targetSection ? `${rec.type}: ${rec.targetSection}` : JSON.stringify(rec));
                          
                          return (
                            <div key={recIndex} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{recText}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {gapAnalysis.length > 8 && (
                    <p className="text-center text-gray-500 text-sm">
                      + {gapAnalysis.length - 8} more skill gaps to explore
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Growth Tracking */}
          {showGrowthTracking && trendData.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer mb-6"
                onClick={() => toggleSection('growthTracking')}
              >
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  Growth Tracking
                </h3>
                {expandedSections.growthTracking ? 
                  <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                }
              </div>
              
              {expandedSections.growthTracking && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                      {(['3m', '6m', '1y', '2y'] as const).map(range => (
                        <button
                          key={range}
                          onClick={() => setSelectedTimeRange(range)}
                          className={`px-3 py-1 text-sm rounded ${
                            selectedTimeRange === range
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {range === '3m' ? '3 Months' :
                           range === '6m' ? '6 Months' :
                           range === '1y' ? '1 Year' : '2 Years'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.primary} opacity={0.1} />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-semibold text-gray-900">{label}</p>
                                  {payload.map((entry: any, index: number) => (
                                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                                      {entry.dataKey}: {entry.value}%
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        {growthData.slice(0, 6).map((trend, index) => (
                          <Line
                            key={trend.skill}
                            type="monotone"
                            dataKey="level"
                            data={trend.data}
                            stroke={colors.categories[index % colors.categories.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name={trend.skill}
                            animationDuration={animateOnLoad ? 1000 : 0}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Market Demand Analysis */}
          {showMarketDemand && marketDemand.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer mb-6"
                onClick={() => toggleSection('marketDemand')}
              >
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  Market Demand Analysis
                </h3>
                {expandedSections.marketDemand ? 
                  <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                }
              </div>
              
              {expandedSections.marketDemand && (
                <div className="space-y-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketDemand.slice(0, 15)}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.primary} opacity={0.1} />
                        <XAxis 
                          dataKey="skill" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={11}
                        />
                        <YAxis />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-semibold text-gray-900">{label}</p>
                                  <p className="text-sm text-purple-600">Demand: {data.demand}%</p>
                                  <p className="text-sm text-green-600">Growth: +{data.growth}%</p>
                                  <p className="text-sm text-blue-600">Salary Impact: +{data.salaryImpact}%</p>
                                  <p className="text-sm text-gray-600">Job Openings: {data.jobOpenings.toLocaleString()}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="demand" 
                          name="Market Demand"
                          fill={colors.purple}
                          radius={[4, 4, 0, 0]}
                          animationDuration={animateOnLoad ? 1000 : 0}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketDemand.slice(0, 6).map((demand, index) => (
                      <div key={demand.skill} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-gray-900 mb-2">{demand.skill}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Demand:</span>
                            <span className="font-medium text-purple-600">{demand.demand}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Growth:</span>
                            <span className="font-medium text-green-600">+{demand.growth}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Salary Impact:</span>
                            <span className="font-medium text-blue-600">+{demand.salaryImpact}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Openings:</span>
                            <span className="font-medium text-gray-700">{demand.jobOpenings.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div 
              className="flex items-center justify-between cursor-pointer mb-6"
              onClick={() => toggleSection('recommendations')}
            >
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-amber-500" />
                AI Recommendations
              </h3>
              {expandedSections.recommendations ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronRight className="w-5 h-5 text-gray-400" />
              }
            </div>
            
            {expandedSections.recommendations && (
              <div className="space-y-4">
                {/* Top Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Strengths to Leverage</h4>
                    </div>
                    {skills
                      .filter(skill => skill.level >= 80)
                      .slice(0, 3)
                      .map(skill => (
                        <div key={skill.name} className="flex items-center justify-between py-1">
                          <span className="text-sm text-green-800">{skill.name}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {skill.level}%
                          </span>
                        </div>
                      ))
                    }
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-amber-600" />
                      <h4 className="font-semibold text-amber-900">Priority Skills to Develop</h4>
                    </div>
                    {gapAnalysis
                      .filter(gap => gap.priority === 'high')
                      .slice(0, 3)
                      .map(gap => (
                        <div key={gap.skill} className="flex items-center justify-between py-1">
                          <span className="text-sm text-amber-800">{gap.skill}</span>
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                            +{gap.gapSize}%
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                {/* Learning Path */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Recommended Learning Path
                  </h4>
                  <div className="space-y-3">
                    {gapAnalysis.slice(0, 4).map((gap, index) => (
                      <div key={gap.skill} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">{gap.skill}</p>
                          <p className="text-xs text-blue-700">
                            Estimated time: {gap.timeToAchieve} months | 
                            Priority: {gap.priority} | 
                            Impact: +{gap.gapSize}% skill level
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-3">
            <div className="flex flex-wrap justify-center gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-3">
                <Award className="w-5 h-5" />
                Start Learning Path
              </button>
              
              <button 
                onClick={refresh}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Analysis
              </button>
              
              {enableExport && (
                <button 
                  onClick={handleExport}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-3"
                >
                  <FileText className="w-5 h-5" />
                  Generate Report
                </button>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              Skills analysis powered by AI • Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};

export default SkillsAnalytics;