/**
 * PortalDashboard.tsx - Comprehensive Portal Management Dashboard
 * 
 * Main dashboard component that integrates all portal features including
 * portal generation, RAG chat interface, analytics, and premium features.
 * Provides a unified interface for managing AI-powered professional portals.
 * 
 * Features:
 * - Portal generation with real-time progress tracking
 * - RAG-powered chat interface with AI capabilities
 * - Portal analytics and usage statistics
 * - Premium subscription management and feature gates
 * - Mobile-responsive design with adaptive layouts
 * - Real-time status indicators and notifications
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3,
  MessageCircle,
  Settings,
  Share2,
  Users,
  TrendingUp,
  Clock,
  Eye,
  Globe,
  Zap,
  Crown,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Copy,
  QrCode,
  Download,
  Filter,
  Calendar,
  Activity,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PortalGenerator } from './PortalGenerator';
import { PortalChatInterface } from './PortalChatInterface';
import { usePremiumSubscription } from '../../../hooks/usePremiumSubscription';
import { useFirebaseFunction } from '../../../hooks/useFeatureData';
import { PortalComponentProps, PortalError, ChatConfig } from '../../../types/portal-types';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorBoundary } from '../Common/ErrorBoundary';

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface PortalDashboardProps extends PortalComponentProps {
  /** CV Job ID */
  jobId: string;
  /** Dashboard view mode */
  viewMode?: 'overview' | 'generation' | 'chat' | 'analytics' | 'settings';
  /** Enable real-time updates */
  realTimeUpdates?: boolean;
  /** Custom dashboard configuration */
  dashboardConfig?: {
    showAnalytics?: boolean;
    showChat?: boolean;
    showGeneration?: boolean;
    compactMode?: boolean;
  };
}

interface PortalStats {
  totalViews: number;
  uniqueVisitors: number;
  chatInteractions: number;
  averageSessionDuration: number;
  conversionRate: number;
  topSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'view' | 'chat' | 'share' | 'contact';
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
}

interface ExistingPortal {
  id: string;
  url: string;
  title: string;
  createdAt: Date;
  lastUpdated: Date;
  status: 'active' | 'inactive' | 'pending';
  views: number;
  chatMessages: number;
  ragEnabled: boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Dashboard navigation tabs
 */
const DashboardTabs: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
  isPremium: boolean;
}> = ({ activeTab, onTabChange, isPremium }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, premium: false },
    { id: 'generation', label: 'Generate', icon: Zap, premium: true },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle, premium: true },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, premium: true },
    { id: 'settings', label: 'Settings', icon: Settings, premium: false }
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = tab.premium && !isPremium;
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : isDisabled
                  ? 'border-transparent text-gray-400 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
              {tab.premium && !isPremium && (
                <Crown className="w-3 h-3 text-yellow-500" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

/**
 * Portal stats cards
 */
const StatsCards: React.FC<{
  stats: PortalStats;
  loading: boolean;
}> = ({ stats, loading }) => {
  const statCards = [
    {
      label: 'Total Views',
      value: stats.totalViews,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'blue'
    },
    {
      label: 'Unique Visitors',
      value: stats.uniqueVisitors,
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'green'
    },
    {
      label: 'Chat Interactions',
      value: stats.chatInteractions,
      change: '+23.1%',
      changeType: 'positive' as const,
      icon: MessageCircle,
      color: 'purple'
    },
    {
      label: 'Avg. Session',
      value: `${Math.round(stats.averageSessionDuration / 60)}m`,
      change: '+5.4%',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'orange'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-lg mb-4" />
              <div className="w-16 h-6 bg-gray-200 rounded mb-2" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card) => {
        const IconComponent = card.icon;
        const colorClasses = {
          blue: 'bg-blue-100 text-blue-600',
          green: 'bg-green-100 text-green-600',
          purple: 'bg-purple-100 text-purple-600',
          orange: 'bg-orange-100 text-orange-600'
        };
        
        return (
          <div key={card.label} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[card.color]}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <span className={`text-sm font-medium ${
                card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </h3>
            <p className="text-sm text-gray-600">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Existing portals list
 */
const PortalsList: React.FC<{
  portals: ExistingPortal[];
  onSelectPortal: (portalId: string) => void;
  onCopyUrl: (url: string) => void;
  loading: boolean;
}> = ({ portals, onSelectPortal, onCopyUrl, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded" />
                <div className="w-48 h-3 bg-gray-200 rounded" />
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (portals.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Portals Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Generate your first AI-powered portal to get started.
        </p>
        <button
          onClick={() => onSelectPortal('generate')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
        >
          Generate Portal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {portals.map((portal) => (
        <div
          key={portal.id}
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onSelectPortal(portal.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                portal.status === 'active' ? 'bg-green-500' :
                portal.status === 'inactive' ? 'bg-gray-400' : 'bg-yellow-500'
              }`} />
              <h3 className="font-semibold text-gray-900">{portal.title}</h3>
              {portal.ragEnabled && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  AI Chat
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyUrl(portal.url);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy URL"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(portal.url, '_blank');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Visit Portal"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>Created {portal.createdAt.toLocaleDateString()}</span>
            <span>Updated {portal.lastUpdated.toLocaleDateString()}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {portal.views.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Views</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {portal.chatMessages.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {portal.status === 'active' ? '✅' : portal.status === 'pending' ? '⏳' : '❌'}
              </div>
              <div className="text-xs text-gray-500 capitalize">{portal.status}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Recent activity feed
 */
const ActivityFeed: React.FC<{
  activities: PortalStats['recentActivity'];
  loading: boolean;
}> = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="w-32 h-3 bg-gray-200 rounded" />
              <div className="w-24 h-3 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const iconMap = {
          view: Eye,
          chat: MessageCircle,
          share: Share2,
          contact: Users
        };
        
        const IconComponent = iconMap[activity.type];
        
        return (
          <div key={activity.id} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 capitalize">
                {activity.type} activity
              </p>
              <p className="text-xs text-gray-500">
                {activity.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PortalDashboard: React.FC<PortalDashboardProps> = ({
  jobId,
  viewMode = 'overview',
  realTimeUpdates = true,
  dashboardConfig = {},
  portalConfig,
  onPortalError,
  className = '',
  mode = 'private'
}) => {
  // ========================================================================
  // HOOKS AND STATE
  // ========================================================================

  const {
    isPremium,
    isLoading: premiumLoading,
    subscriptionSummary,
    canGeneratePortals,
    canUseRagChat,
    upgradeSubscription
  } = usePremiumSubscription();

  const { callFunction, loading: functionLoading } = useFirebaseFunction();
  
  const [activeTab, setActiveTab] = useState(viewMode);
  const [existingPortals, setExistingPortals] = useState<ExistingPortal[]>([]);
  const [portalStats, setPortalStats] = useState<PortalStats>({
    totalViews: 0,
    uniqueVisitors: 0,
    chatInteractions: 0,
    averageSessionDuration: 0,
    conversionRate: 0,
    topSources: [],
    recentActivity: []
  });
  const [selectedPortalId, setSelectedPortalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  const fetchPortalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch existing portals
      const portalsResult = await callFunction('getUserPortals', {
        jobId,
        includeStats: true
      });

      if (portalsResult.success) {
        const portals = portalsResult.data.portals.map((portal: any) => ({
          ...portal,
          createdAt: new Date(portal.createdAt),
          lastUpdated: new Date(portal.lastUpdated)
        }));
        
        setExistingPortals(portals);
        
        // If we have portals, fetch analytics
        if (portals.length > 0) {
          const analyticsResult = await callFunction('getPortalAnalytics', {
            portalIds: portals.map((p: ExistingPortal) => p.id),
            timeRange: '7d'
          });
          
          if (analyticsResult.success) {
            setPortalStats({
              ...analyticsResult.data.summary,
              recentActivity: analyticsResult.data.recentActivity.map((activity: any) => ({
                ...activity,
                timestamp: new Date(activity.timestamp)
              }))
            });
          }
        }
      } else {
        throw new Error(portalsResult.error || 'Failed to fetch portal data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Portal data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [jobId, callFunction]);

  // ========================================================================
  // ACTIONS
  // ========================================================================

  const handlePortalGenerated = useCallback((portalUrl: string, portalId: string) => {
    toast.success('Portal generated successfully!', {
      icon: '🚀',
      duration: 4000
    });
    
    // Refresh portal data
    fetchPortalData();
    
    // Switch to overview tab to see the new portal
    setActiveTab('overview');
  }, [fetchPortalData]);

  const handleUpgradeRequired = useCallback(async () => {
    try {
      await upgradeSubscription('premium-monthly');
      toast.success('Upgrade successful! You can now generate portals.');
    } catch (error) {
      toast.error('Upgrade failed. Please try again.');
    }
  }, [upgradeSubscription]);

  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Portal URL copied to clipboard!');
  }, []);

  const handlePortalSelect = useCallback((portalId: string) => {
    if (portalId === 'generate') {
      setActiveTab('generation');
    } else {
      setSelectedPortalId(portalId);
      setActiveTab('chat');
    }
  }, []);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeUpdates) return;
    
    const interval = setInterval(fetchPortalData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [realTimeUpdates, fetchPortalData]);

  // ========================================================================
  // RENDER CONDITIONS
  // ========================================================================

  if (premiumLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" text="Loading portal dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorBoundary onError={onPortalError}>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Dashboard Error
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPortalData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </ErrorBoundary>
    );
  }

  // ========================================================================
  // CHAT CONFIG
  // ========================================================================

  const chatConfig: ChatConfig = {
    enableRAG: true,
    model: {
      modelName: 'claude-sonnet-4-20250514',
      parameters: {
        temperature: 0.7,
        maxTokens: 800,
        topP: 1.0,
        frequencyPenalty: 0,
        presencePenalty: 0
      },
      systemPrompt: 'You are an AI assistant representing this professional. Answer questions about their CV.',
      contextWindowSize: 4000
    },
    vectorSearch: {
      topK: 5,
      threshold: 0.7,
      algorithm: 'cosine',
      hybridSearch: true
    },
    behavior: {
      welcomeMessage: 'Hi! Ask me anything about this professional\'s background and experience.',
      suggestedQuestions: [
        'What are the key skills?',
        'Tell me about work experience',
        'What achievements are highlighted?',
        'What education background is included?'
      ],
      showTyping: true,
      messageTimeout: 30000,
      autoScroll: true,
      enableReactions: true
    },
    rateLimiting: {
      messagesPerMinute: isPremium ? 20 : 5,
      messagesPerHour: isPremium ? 200 : 25,
      enabled: true,
      rateLimitMessage: 'Rate limit reached. Please wait before sending another message.'
    }
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <ErrorBoundary onError={onPortalError}>
      <div className={`max-w-7xl mx-auto p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Portal Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your AI-powered professional portals and chat experiences.
            </p>
          </div>
          
          {/* Premium Status */}
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isPremium
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isPremium ? (
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  {subscriptionSummary.planName}
                </span>
              ) : (
                'Free Plan'
              )}
            </div>
            
            <button
              onClick={fetchPortalData}
              disabled={functionLoading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${functionLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isPremium={isPremium}
        />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <StatsCards stats={portalStats} loading={loading} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Existing Portals */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Portals
                  </h2>
                  {canGeneratePortals && (
                    <button
                      onClick={() => setActiveTab('generation')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Generate New
                    </button>
                  )}
                </div>
                <PortalsList
                  portals={existingPortals}
                  onSelectPortal={handlePortalSelect}
                  onCopyUrl={handleCopyUrl}
                  loading={loading}
                />
              </div>
              
              {/* Activity Feed */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Recent Activity
                </h2>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <ActivityFeed
                    activities={portalStats.recentActivity}
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'generation' && (
          <PortalGenerator
            jobId={jobId}
            isPremium={isPremium}
            portalConfig={portalConfig}
            onPortalGenerated={handlePortalGenerated}
            onUpgradeRequired={handleUpgradeRequired}
            onError={onPortalError}
          />
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                AI Chat Interface
              </h2>
              <p className="text-gray-600">
                Experience the RAG-powered AI chat that visitors will interact with on your portal.
              </p>
            </div>
            
            <PortalChatInterface
              portalConfig={portalConfig}
              chatConfig={chatConfig}
              initialState={{
                welcomeMessage: chatConfig.behavior.welcomeMessage,
                suggestedQuestions: chatConfig.behavior.suggestedQuestions
              }}
              uiCustomization={{
                position: 'embedded',
                size: 'large',
                theme: 'light'
              }}
              features={{
                typingIndicators: true,
                reactions: true,
                timestamps: true,
                search: isPremium,
                export: isPremium,
                voiceInput: isPremium
              }}
              ragConfig={{
                enabled: canUseRagChat,
                showSources: true,
                maxSources: 3,
                similarityThreshold: 0.7
              }}
              rateLimiting={chatConfig.rateLimiting}
              onError={onPortalError}
              className="border border-gray-200 rounded-xl shadow-sm"
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Advanced Analytics
              </h3>
              <p className="text-gray-600 mb-6">
                Detailed analytics and insights coming soon. Track visitor behavior,
                chat engagement, and conversion metrics.
              </p>
              <div className="text-sm text-gray-500">
                Available with Premium subscription
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Portal Settings
              </h3>
              <p className="text-gray-600">
                Portal customization and configuration options coming soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default PortalDashboard;