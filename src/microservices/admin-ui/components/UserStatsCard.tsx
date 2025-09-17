import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * User Statistics Card Component
 * 
 * Displays comprehensive user statistics including total users, growth metrics,
 * premium conversion rates, and user activity trends.
 */

interface UserStatsData {
  total: number;
  new: number;
  active: number;
  premium: number;
  growthRate: number;
  conversionToPremium: number;
  retentionRate: number;
  userDetails?: Array<{
    uid: string;
    email: string;
    displayName: string;
    isActive: boolean;
    isPremium: boolean;
    status: string;
    createdAt: any;
    lastLoginAt: any;
    cvCount: number;
    subscriptionStatus?: string;
  }>;
  lastUpdated: string;
}

interface UserStatsCardProps {
  refreshTrigger: number;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({ refreshTrigger }) => {
  const [statsData, setStatsData] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStats();
  }, [refreshTrigger]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const functions = getFunctions();
      const getUserStats = httpsCallable(functions, 'getUserStats');

      const result = await getUserStats();
      const data = (result.data as any)?.data;

      if (data) {
        setStatsData(data);
      } else {
        throw new Error('No user statistics data received');
      }
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) {
      return 'text-green-600 dark:text-green-400';
    } else if (rate < 0) {
      return 'text-red-600 dark:text-red-400';
    } else {
      return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) {
      return '↗️';
    } else if (rate < 0) {
      return '↘️';
    } else {
      return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">👥</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Statistics
          </h3>
        </div>
        <div className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
        <button
          onClick={fetchUserStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">👥</span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          User Statistics
        </h3>
      </div>

      {statsData && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(statsData.total)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Users</div>
            </div>

            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatNumber(statsData.active)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Active Users</div>
            </div>

            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatNumber(statsData.premium)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Premium Users</div>
            </div>

            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatNumber(statsData.new)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">New Users</div>
            </div>
          </div>

          {/* Growth Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                User Growth Rate
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getGrowthIcon(statsData.growthRate)}</span>
                <span className={`text-sm font-medium ${getGrowthColor(statsData.growthRate)}`}>
                  {statsData.growthRate >= 0 ? '+' : ''}{statsData.growthRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Premium Conversion
              </span>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {statsData.conversionToPremium.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                User Retention Rate
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {statsData.retentionRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Premium Conversion
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {statsData.conversionToPremium.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(statsData.conversionToPremium, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  User Activity Rate
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {statsData.retentionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(statsData.retentionRate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {statsData.userDetails && statsData.userDetails.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Recent User Activity
              </div>
              <div className="space-y-2">
                {statsData.userDetails.slice(0, 3).map((user, index) => (
                  <div key={user.uid} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        user.isActive 
                          ? 'bg-green-400' 
                          : 'bg-gray-400'
                      }`} />
                      <span className="text-gray-900 dark:text-white truncate max-w-32">
                        {user.displayName || user.email}
                      </span>
                      {user.isPremium && (
                        <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded-full">
                          PRO
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.cvCount} CVs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Last updated: {new Date(statsData.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatsCard;