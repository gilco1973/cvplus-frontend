/**
 * Statistics bar component for the logs viewer
 * Displays log statistics, error rates, and streaming metrics
 */

import React from 'react';
import { TrendingUp, Database } from 'lucide-react';
import { LogStats, StreamingStats } from './types';

interface LogsStatisticsBarProps {
  stats: LogStats;
  streamingStats: StreamingStats;
  streaming: boolean;
}

export const LogsStatisticsBar: React.FC<LogsStatisticsBarProps> = ({
  stats,
  streamingStats,
  streaming
}) => {
  return (
    <div className="flex-shrink-0 border-b border-gray-200 bg-blue-50 px-6 py-3">
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-gray-700">
            Error Rate: {stats.errorRate.toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span className="text-gray-700">
            Avg Response: {stats.averageResponseTime.toFixed(0)}ms
          </span>
        </div>

        <div className="text-gray-700">
          Total Logs: {stats.totalLogs.toLocaleString()}
        </div>

        {/* Level breakdown */}
        <div className="flex items-center gap-4">
          {Object.entries(stats.logsByLevel).map(([level, count]) => (
            <div key={level} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${getLevelColor(level)}`}></span>
              <span className="text-xs text-gray-600">
                {level.toUpperCase()}: {count}
              </span>
            </div>
          ))}
        </div>

        {streaming && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">
              {streamingStats.messagesReceived} messages
            </span>
            <span className="text-xs text-gray-500">
              ({formatBytes(streamingStats.bytesReceived)})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const getLevelColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'fatal':
    case 'error':
      return 'bg-red-500';
    case 'warn':
      return 'bg-yellow-500';
    case 'info':
      return 'bg-blue-500';
    case 'debug':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};