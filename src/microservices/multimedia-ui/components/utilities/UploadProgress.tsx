/**
 * UploadProgress Component
 * 
 * Advanced upload progress tracking with comprehensive status management.
 * Features progress visualization, pause/resume, and error handling.
 */

import React, { useEffect, useState } from 'react';
import { 
  Loader2, 
  Check, 
  X, 
  AlertTriangle, 
  Pause, 
  Play, 
  RefreshCw,
  Clock,
  Upload
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface UploadProgressItem {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error' | 'paused' | 'cancelled';
  error?: string;
  url?: string;
  estimatedTime?: number;
  speed?: number; // bytes per second
}

interface UploadProgressProps {
  items: UploadProgressItem[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  showDetails?: boolean;
  showOverallProgress?: boolean;
  compact?: boolean;
  className?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  items,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onRemove,
  showDetails = true,
  showOverallProgress = true,
  compact = false,
  className
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Calculate overall progress
  const overallProgress = React.useMemo(() => {
    if (items.length === 0) return 0;
    
    const totalProgress = items.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(totalProgress / items.length);
  }, [items]);

  // Count items by status
  const statusCounts = React.useMemo(() => {
    const counts = {
      pending: 0,
      uploading: 0,
      processing: 0,
      complete: 0,
      error: 0,
      paused: 0,
      cancelled: 0
    };
    
    items.forEach(item => {
      counts[item.status]++;
    });
    
    return counts;
  }, [items]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  // Format speed
  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatFileSize(bytesPerSecond)}/s`;
  };

  // Toggle item expansion
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Get status icon
  const getStatusIcon = (status: UploadProgressItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'complete':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-orange-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-gray-500" />;
      default:
        return <Upload className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status: UploadProgressItem['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-500';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'paused':
        return 'bg-orange-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-gray-900 rounded-lg border border-gray-700 overflow-hidden", className)}>
      {/* Overall progress header */}
      {showOverallProgress && (
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-200">
              Upload Progress ({statusCounts.complete}/{items.length})
            </h3>
            <span className="text-sm text-gray-400">
              {overallProgress}%
            </span>
          </div>
          
          {/* Overall progress bar */}
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          
          {/* Status summary */}
          {!compact && (
            <div className="flex gap-4 mt-3 text-xs text-gray-400">
              {statusCounts.uploading > 0 && (
                <span>Uploading: {statusCounts.uploading}</span>
              )}
              {statusCounts.complete > 0 && (
                <span className="text-green-400">Complete: {statusCounts.complete}</span>
              )}
              {statusCounts.error > 0 && (
                <span className="text-red-400">Failed: {statusCounts.error}</span>
              )}
              {statusCounts.paused > 0 && (
                <span className="text-orange-400">Paused: {statusCounts.paused}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Individual file progress */}
      <div className={cn("divide-y divide-gray-700", compact ? "max-h-40 overflow-y-auto" : "")}>
        {items.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          
          return (
            <div key={item.id} className="p-3">
              {/* Main item row */}
              <div className="flex items-center gap-3">
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {item.fileName}
                    </p>
                    
                    {/* Progress percentage */}
                    <span className="text-xs text-gray-400 ml-2">
                      {item.progress}%
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
                    <div 
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        getStatusColor(item.status)
                      )}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  
                  {/* Basic file info */}
                  {!compact && (
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{formatFileSize(item.fileSize)}</span>
                      
                      {item.speed && item.status === 'uploading' && (
                        <span>{formatSpeed(item.speed)}</span>
                      )}
                      
                      {item.estimatedTime && item.status === 'uploading' && (
                        <span>ETA: {formatTime(item.estimatedTime)}</span>
                      )}
                      
                      {item.error && (
                        <span className="text-red-400">{item.error}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {item.status === 'uploading' && onPause && (
                    <button
                      onClick={() => onPause(item.id)}
                      className="p-1.5 text-gray-400 hover:text-orange-400 rounded transition-colors"
                      title="Pause upload"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  
                  {item.status === 'paused' && onResume && (
                    <button
                      onClick={() => onResume(item.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-400 rounded transition-colors"
                      title="Resume upload"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  
                  {item.status === 'error' && onRetry && (
                    <button
                      onClick={() => onRetry(item.id)}
                      className="p-1.5 text-gray-400 hover:text-green-400 rounded transition-colors"
                      title="Retry upload"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  
                  {(item.status === 'uploading' || item.status === 'pending') && onCancel && (
                    <button
                      onClick={() => onCancel(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
                      title="Cancel upload"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {(item.status === 'complete' || item.status === 'error' || item.status === 'cancelled') && onRemove && (
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
                      title="Remove from list"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Expand/collapse toggle for details */}
                  {showDetails && (
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-300 rounded transition-colors"
                    >
                      <div className={cn(
                        "transform transition-transform duration-200",
                        isExpanded ? "rotate-180" : ""
                      )}>
                        ↓
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {showDetails && isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-2 text-xs text-gray-400">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">File Size:</span>
                      <span className="ml-2">{formatFileSize(item.fileSize)}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className="ml-2 capitalize">{item.status}</span>
                    </div>
                    
                    {item.speed && (
                      <div>
                        <span className="font-medium">Speed:</span>
                        <span className="ml-2">{formatSpeed(item.speed)}</span>
                      </div>
                    )}
                    
                    {item.estimatedTime && (
                      <div>
                        <span className="font-medium">ETA:</span>
                        <span className="ml-2">{formatTime(item.estimatedTime)}</span>
                      </div>
                    )}
                  </div>
                  
                  {item.url && item.status === 'complete' && (
                    <div>
                      <span className="font-medium">URL:</span>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-400 hover:text-blue-300 underline break-all"
                      >
                        {item.url}
                      </a>
                    </div>
                  )}
                  
                  {item.error && (
                    <div>
                      <span className="font-medium text-red-400">Error:</span>
                      <span className="ml-2 text-red-300">{item.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UploadProgress;