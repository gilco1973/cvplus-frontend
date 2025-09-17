// SessionStatusIndicator - Visual indicator for session and sync status
import React, { useState } from 'react';
import {
  EnhancedSessionState,
  SyncStatus
} from '../types/session';

export interface SessionStatusIndicatorProps {
  session: EnhancedSessionState | null;
  isOffline: boolean;
  syncStatus: SyncStatus;
  showDetails?: boolean;
  compact?: boolean;
}

export const SessionStatusIndicator: React.FC<SessionStatusIndicatorProps> = ({
  session,
  isOffline,
  syncStatus,
  showDetails = false,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  const getStatusColor = (): string => {
    if (isOffline) return 'orange';
    
    switch (syncStatus) {
      case 'syncing': return 'blue';
      case 'error': return 'red';
      case 'online': return 'green';
      default: return 'gray';
    }
  };

  const getStatusIcon = (): string => {
    if (isOffline) return '📡';
    
    switch (syncStatus) {
      case 'syncing': return '🔄';
      case 'error': return '⚠️';
      case 'online': return '✅';
      default: return '⚪';
    }
  };

  const getStatusText = (): string => {
    if (isOffline) return 'Offline Mode';
    
    switch (syncStatus) {
      case 'syncing': return 'Syncing...';
      case 'error': return 'Sync Error';
      case 'online': return 'Online';
      default: return 'Unknown';
    }
  };

  const calculateProgress = (): number => {
    if (!session) return 0;
    
    const mainSteps = ['upload', 'processing', 'analysis', 'features', 'templates', 'preview', 'results'];
    const completedSteps = mainSteps.filter(step => 
      session.completedSteps.includes(step as 'upload' | 'processing' | 'analysis' | 'features' | 'templates' | 'preview' | 'results')
    );
    
    return Math.round((completedSteps.length / mainSteps.length) * 100);
  };

  const getValidationIssues = (): number => {
    if (!session) return 0;
    return session.validationResults.globalValidations.filter(v => !v.valid).length;
  };

  const getPendingCheckpoints = (): number => {
    if (!session) return 0;
    return session.processingCheckpoints.filter(cp => 
      cp.state === 'pending' || cp.state === 'in_progress'
    ).length;
  };

  if (compact) {
    return (
      <div 
        className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full shadow-sm border cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-2 h-2 rounded-full bg-${getStatusColor()}-500 ${syncStatus === 'syncing' ? 'animate-pulse' : ''}`}></div>
        <span className="text-xs font-medium text-gray-700">{getStatusText()}</span>
        {session && (
          <span className="text-xs text-gray-500">{calculateProgress()}%</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Main Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <span className="font-medium text-gray-900">{getStatusText()}</span>
          </div>
          
          {session && (
            <>
              {/* Progress Bar */}
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{calculateProgress()}%</span>
              </div>

              {/* Current Step */}
              <div className="text-sm text-gray-600">
                Step: <span className="font-medium capitalize">{session.currentStep}</span>
              </div>
            </>
          )}
        </div>

        {/* Details Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <span>{isExpanded ? 'Hide' : 'Show'} Details</span>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && session && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {/* Session Info */}
            <div>
              <div className="font-medium text-gray-700 mb-1">Session</div>
              <div className="text-gray-600">
                <div>ID: {session.sessionId.slice(0, 8)}...</div>
                <div>Created: {new Date(session.createdAt).toLocaleDateString()}</div>
                <div>Last Active: {new Date(session.lastActiveAt).toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Progress Details */}
            <div>
              <div className="font-medium text-gray-700 mb-1">Progress</div>
              <div className="text-gray-600">
                <div>Completed: {session.completedSteps.length} steps</div>
                <div>Current: {session.currentStep}</div>
                <div>Features: {Object.values(session.featureStates).filter(f => f.enabled).length} enabled</div>
              </div>
            </div>

            {/* Processing Status */}
            <div>
              <div className="font-medium text-gray-700 mb-1">Processing</div>
              <div className="text-gray-600">
                <div>Pending: {getPendingCheckpoints()} operations</div>
                <div>Total Checkpoints: {session.processingCheckpoints.length}</div>
                <div>Queue Size: {session.actionQueue?.length || 0}</div>
              </div>
            </div>

            {/* Validation Status */}
            <div>
              <div className="font-medium text-gray-700 mb-1">Validation</div>
              <div className="text-gray-600">
                <div>Issues: {getValidationIssues()}</div>
                <div>Form States: {Object.keys(session.uiState.formStates).length}</div>
                <div>Schema: v{session.schemaVersion}</div>
              </div>
            </div>
          </div>

          {/* Warnings/Issues */}
          {(getValidationIssues() > 0 || getPendingCheckpoints() > 5) && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center space-x-2 text-yellow-800">
                <span>⚠️</span>
                <span className="font-medium">Attention Required</span>
              </div>
              <div className="mt-1 text-sm text-yellow-700">
                {getValidationIssues() > 0 && (
                  <div>• {getValidationIssues()} validation issues need attention</div>
                )}
                {getPendingCheckpoints() > 5 && (
                  <div>• High number of pending operations ({getPendingCheckpoints()})</div>
                )}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {session.performanceMetrics && (
            <div className="mt-2 text-xs text-gray-500 flex space-x-4">
              <span>Load Time: {session.performanceMetrics.initialLoadTime}ms</span>
              <span>Render Time: {session.performanceMetrics.renderTime}ms</span>
              <span>Memory: {Math.round((session.performanceMetrics.memoryUsage || 0) / 1024 / 1024)}MB</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionStatusIndicator;