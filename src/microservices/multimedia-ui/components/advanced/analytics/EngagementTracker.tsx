/**
 * Engagement Tracker Component
 * 
 * Real-time user engagement monitoring for multimedia content.
 * Tracks user interactions, viewing patterns, and engagement metrics
 * to provide actionable insights for content optimization.
 * 
 * Features:
 * - Real-time engagement tracking and analytics
 * - User behavior pattern analysis and insights
 * - Content interaction heatmaps and visualization
 * - Engagement optimization recommendations
 * - A/B testing framework for multimedia features
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  BarChart3,
  Eye,
  Heart,
  MousePointer,
  Pause,
  Play,
  Share2,
  TrendingUp,
  Users,
  Clock,
  Target,
  Zap
} from 'lucide-react';

// Engagement tracking interfaces
interface EngagementEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  contentId: string;
  eventType: 'view' | 'play' | 'pause' | 'seek' | 'complete' | 'share' | 'like' | 'download' | 'click' | 'hover';
  duration?: number;
  position?: number;
  metadata?: Record<string, any>;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    screenSize: string;
  };
}

interface EngagementMetrics {
  contentId: string;
  title: string;
  contentType: 'video' | 'audio' | 'image' | 'gallery';
  metrics: {
    totalViews: number;
    uniqueViews: number;
    totalWatchTime: number;
    averageWatchTime: number;
    completionRate: number;
    engagementRate: number;
    shareRate: number;
    likeRate: number;
    dropOffPoints: Array<{
      position: number;
      percentage: number;
    }>;
  };
  recentEvents: EngagementEvent[];
  trends: {
    viewsGrowth: number;
    engagementGrowth: number;
    qualityScore: number;
  };
}

interface UserSegmentData {
  segment: string;
  userCount: number;
  avgEngagement: number;
  topContent: string[];
  behaviors: {
    avgSessionTime: number;
    contentPreference: string;
    devicePreference: string;
    timeOfDay: string;
  };
}

interface EngagementHeatmapData {
  contentId: string;
  interactions: Array<{
    x: number;
    y: number;
    type: string;
    intensity: number;
    timestamp: Date;
  }>;
  regions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    engagement: number;
    label: string;
  }>;
}

interface EngagementTrackerProps {
  contentIds?: string[];
  realTimeUpdates?: boolean;
  showHeatmap?: boolean;
  showUserSegments?: boolean;
  trackingEnabled?: boolean;
  onEngagementUpdate?: (metrics: EngagementMetrics) => void;
  className?: string;
}

export const EngagementTracker: React.FC<EngagementTrackerProps> = ({
  contentIds = [],
  realTimeUpdates = true,
  showHeatmap = true,
  showUserSegments = true,
  trackingEnabled = true,
  onEngagementUpdate,
  className = ""
}) => {
  // State management
  const [engagementData, setEngagementData] = useState<EngagementMetrics[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegmentData[]>([]);
  const [heatmapData, setHeatmapData] = useState<EngagementHeatmapData[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<EngagementEvent[]>([]);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket for real-time updates
  const wsRef = useRef<WebSocket | null>(null);
  const eventQueueRef = useRef<EngagementEvent[]>([]);

  // Initialize tracking and WebSocket
  useEffect(() => {
    if (trackingEnabled) {
      loadEngagementData();
      
      if (realTimeUpdates) {
        connectWebSocket();
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [contentIds, timeRange, trackingEnabled, realTimeUpdates]);

  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? 'ws://localhost:3000/ws/engagement-tracking'
        : `wss://${window.location.host}/ws/engagement-tracking`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('Engagement tracking WebSocket connected');
        
        // Subscribe to engagement events
        if (wsRef.current && contentIds.length > 0) {
          wsRef.current.send(JSON.stringify({
            action: 'subscribe',
            contentIds
          }));
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'engagement_event':
              handleRealTimeEvent(data.event);
              break;
            case 'metrics_update':
              updateEngagementMetrics(data.contentId, data.metrics);
              break;
            case 'heatmap_update':
              updateHeatmapData(data.contentId, data.heatmap);
              break;
          }
        } catch (err) {
          console.error('Failed to parse engagement event:', err);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('Engagement tracking WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
      
    } catch (err) {
      console.error('Failed to connect engagement WebSocket:', err);
    }
  }, [contentIds]);

  const loadEngagementData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        timeRange,
        contentIds: contentIds.join(',')
      });

      const [metricsRes, segmentsRes, heatmapRes] = await Promise.all([
        fetch(`/api/engagement/metrics?${params}`),
        showUserSegments ? fetch(`/api/engagement/segments?${params}`) : Promise.resolve(null),
        showHeatmap ? fetch(`/api/engagement/heatmap?${params}`) : Promise.resolve(null)
      ]);

      if (metricsRes.ok) {
        const metrics = await metricsRes.json();
        setEngagementData(metrics);
      }

      if (segmentsRes && segmentsRes.ok) {
        const segments = await segmentsRes.json();
        setUserSegments(segments);
      }

      if (heatmapRes && heatmapRes.ok) {
        const heatmap = await heatmapRes.json();
        setHeatmapData(heatmap);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to load engagement data:', err);
      setError('Failed to load engagement data');
    } finally {
      setLoading(false);
    }
  };

  const handleRealTimeEvent = (event: EngagementEvent) => {
    setRealtimeEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    
    // Update metrics immediately for better UX
    updateEngagementMetrics(event.contentId, null, event);
  };

  const updateEngagementMetrics = (contentId: string, metrics?: any, event?: EngagementEvent) => {
    setEngagementData(prev => 
      prev.map(item => {
        if (item.contentId === contentId) {
          const updated = { ...item };
          
          if (metrics) {
            updated.metrics = metrics;
          }
          
          if (event) {
            updated.recentEvents = [event, ...updated.recentEvents.slice(0, 9)];
            // Simple real-time metrics update
            if (event.eventType === 'view') {
              updated.metrics.totalViews += 1;
            }
          }
          
          onEngagementUpdate?.(updated);
          return updated;
        }
        return item;
      })
    );
  };

  const updateHeatmapData = (contentId: string, heatmap: any) => {
    setHeatmapData(prev => 
      prev.map(item => 
        item.contentId === contentId ? { ...item, ...heatmap } : item
      )
    );
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600 bg-green-100';
    if (rate >= 50) return 'text-blue-600 bg-blue-100';
    if (rate >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const renderRealTimeEvents = () => (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Engagement Events</h3>
        <div className="flex items-center text-sm text-green-600">
          <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          Live
        </div>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {realtimeEvents.slice(0, 20).map(event => (
          <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center">
              {event.eventType === 'play' ? <Play className="h-4 w-4 text-green-500 mr-2" /> :
               event.eventType === 'pause' ? <Pause className="h-4 w-4 text-yellow-500 mr-2" /> :
               event.eventType === 'like' ? <Heart className="h-4 w-4 text-red-500 mr-2" /> :
               event.eventType === 'share' ? <Share2 className="h-4 w-4 text-blue-500 mr-2" /> :
               <Eye className="h-4 w-4 text-gray-500 mr-2" />}
              <div>
                <span className="text-sm font-medium capitalize">{event.eventType}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {event.contentId.slice(0, 8)}...
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(event.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEngagementMetrics = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
      {engagementData.map(content => (
        <div 
          key={content.contentId} 
          className={`bg-white rounded-lg border p-6 cursor-pointer transition-all duration-200 ${
            selectedContent === content.contentId ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
          }`}
          onClick={() => setSelectedContent(
            selectedContent === content.contentId ? null : content.contentId
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 truncate">
              {content.title.length > 25 ? content.title.substring(0, 25) + '...' : content.title}
            </h4>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
              {content.contentType}
            </span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {content.metrics.totalViews.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Total Views</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {content.metrics.engagementRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Engagement</div>
            </div>
          </div>

          {/* Engagement Rate Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Engagement Quality</span>
              <span>{content.metrics.engagementRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  content.metrics.engagementRate >= 70 ? 'bg-green-500' :
                  content.metrics.engagementRate >= 50 ? 'bg-blue-500' :
                  content.metrics.engagementRate >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(content.metrics.engagementRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Completion Rate:</span>
              <span className="font-medium">{content.metrics.completionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Watch Time:</span>
              <span className="font-medium">
                {Math.round(content.metrics.averageWatchTime / 60)}:{(content.metrics.averageWatchTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Share Rate:</span>
              <span className="font-medium">{content.metrics.shareRate.toFixed(1)}%</span>
            </div>
          </div>

          {/* Trends */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Growth Trends</span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <TrendingUp className={`h-3 w-3 mr-1 ${
                    content.trends.viewsGrowth > 0 ? 'text-green-500' : 'text-red-500'
                  }`} />
                  <span className={`text-xs font-medium ${
                    content.trends.viewsGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {content.trends.viewsGrowth > 0 ? '+' : ''}{content.trends.viewsGrowth.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center">
                  <Activity className="h-3 w-3 mr-1 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">
                    {content.trends.qualityScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderUserSegments = () => {
    if (!showUserSegments || !userSegments.length) return null;

    return (
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Segments Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userSegments.map(segment => (
            <div key={segment.segment} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{segment.segment}</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  {segment.userCount.toLocaleString()}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Engagement:</span>
                  <span className={`font-medium px-2 py-1 rounded ${getEngagementColor(segment.avgEngagement)}`}>
                    {segment.avgEngagement.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Time:</span>
                  <span className="font-medium">
                    {Math.round(segment.behaviors.avgSessionTime / 60)}min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Device:</span>
                  <span className="font-medium capitalize">{segment.behaviors.devicePreference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Peak Time:</span>
                  <span className="font-medium">{segment.behaviors.timeOfDay}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-gray-600 mb-1">Top Content:</div>
                <div className="flex flex-wrap gap-1">
                  {segment.topContent.slice(0, 3).map((content, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {content}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHeatmap = () => {
    if (!showHeatmap || !selectedContent) return null;

    const selectedHeatmap = heatmapData.find(h => h.contentId === selectedContent);
    if (!selectedHeatmap) return null;

    return (
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Heatmap</h3>
        <div className="relative bg-gray-100 rounded-lg" style={{ height: '400px' }}>
          {/* Simplified heatmap visualization */}
          <div className="absolute inset-0 p-4">
            <div className="text-center text-gray-500 mt-32">
              <MousePointer className="h-8 w-8 mx-auto mb-2" />
              <p>Interactive heatmap visualization</p>
              <p className="text-sm">Shows user interaction patterns and engagement hotspots</p>
            </div>
          </div>
          
          {/* Heatmap regions */}
          {selectedHeatmap.regions.map((region, index) => (
            <div
              key={index}
              className="absolute border border-dashed border-blue-300 bg-blue-50 bg-opacity-50 rounded"
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.width}%`,
                height: `${region.height}%`
              }}
            >
              <div className="absolute -top-6 left-0 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                {region.label}: {region.engagement.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading && !engagementData.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading engagement data...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Engagement Tracker
            </h2>
            <p className="text-gray-600">
              Real-time user engagement monitoring and analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            
            <button
              onClick={loadEngagementData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {realTimeUpdates && renderRealTimeEvents()}
      {renderEngagementMetrics()}
      {renderUserSegments()}
      {renderHeatmap()}
    </div>
  );
};

export default EngagementTracker;