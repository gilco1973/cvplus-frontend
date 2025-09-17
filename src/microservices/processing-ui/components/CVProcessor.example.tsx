/**
 * CV Processor Usage Example (T067)
 *
 * Example implementation showing how to use the CVProcessor component
 * for orchestrating complete CV processing workflows.
 *
 * This example demonstrates:
 * - Basic CVProcessor setup and configuration
 * - Event handling and callbacks
 * - WebSocket integration for real-time updates
 * - Error handling and recovery
 * - Queue management
 * - Custom UI integration
 *
 * @author Gil Klainert
 * @version 1.0.0 - Initial T067 Implementation
 */

import React, { useState, useCallback } from 'react';
import { CVProcessor } from './CVProcessor';
import { ProcessingResult } from './CVProcessor.types';
import { AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';

interface CVProcessorExampleProps {
  /** Enable advanced features */
  enableAdvanced?: boolean;

  /** Custom configuration */
  customConfig?: any;
}

export const CVProcessorExample: React.FC<CVProcessorExampleProps> = ({
  enableAdvanced = false,
  customConfig
}) => {
  const [processingHistory, setProcessingHistory] = useState<ProcessingResult[]>([]);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);

  /**
   * Handle processing completion
   */
  const handleProcessingComplete = useCallback((result: ProcessingResult) => {
    console.log('[CVProcessor] Processing completed:', result);

    // Add to history
    setProcessingHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10

    // Show success notification
    setNotifications(prev => [
      {
        id: `success_${Date.now()}`,
        type: 'success',
        message: `CV processed successfully with ${result.analytics.qualityScore}% quality score`,
        timestamp: new Date()
      },
      ...prev.slice(0, 4) // Keep last 5 notifications
    ]);
  }, []);

  /**
   * Handle processing errors
   */
  const handleProcessingError = useCallback((error: string) => {
    console.error('[CVProcessor] Processing error:', error);

    // Show error notification
    setNotifications(prev => [
      {
        id: `error_${Date.now()}`,
        type: 'error',
        message: `Processing failed: ${error}`,
        timestamp: new Date()
      },
      ...prev.slice(0, 4)
    ]);
  }, []);

  /**
   * Handle stage updates
   */
  const handleStageUpdate = useCallback((stageId: string, progress: number) => {
    console.log(`[CVProcessor] Stage ${stageId}: ${progress}%`);

    // Show info notification for major milestones
    if (progress === 100) {
      setNotifications(prev => [
        {
          id: `stage_${stageId}_${Date.now()}`,
          type: 'info',
          message: `Stage "${stageId}" completed`,
          timestamp: new Date()
        },
        ...prev.slice(0, 4)
      ]);
    }
  }, []);

  /**
   * Clear notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Clear processing history
   */
  const clearHistory = useCallback(() => {
    setProcessingHistory([]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CV Processor Example
        </h1>
        <p className="text-lg text-gray-600">
          Complete CV processing workflow orchestration
        </p>
      </div>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Notifications
            </h2>
            <button
              onClick={clearNotifications}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-md flex items-start space-x-3 ${
                  notification.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : notification.type === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                {notification.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : notification.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    notification.type === 'success'
                      ? 'text-green-800'
                      : notification.type === 'error'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main CV Processor */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CVProcessor
          onProcessingComplete={handleProcessingComplete}
          onProcessingError={handleProcessingError}
          onStageUpdate={handleStageUpdate}
          enableWebSocket={enableAdvanced}
          enableQueue={enableAdvanced}
          queueCapacity={enableAdvanced ? 5 : 1}
          maxRetries={3}
          pollInterval={2000}
          config={{
            features: {
              analytics: enableAdvanced,
              notifications: true,
              queue: enableAdvanced,
              retries: true
            },
            ui: {
              showMetrics: enableAdvanced,
              showQueue: enableAdvanced,
              theme: 'light'
            },
            ...customConfig
          }}
        >
          {/* Custom additional UI can be added here */}
          {enableAdvanced && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Advanced Features Active
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>✅ WebSocket Real-time Updates</div>
                <div>✅ Processing Queue Management</div>
                <div>✅ Performance Analytics</div>
                <div>✅ Enhanced Error Recovery</div>
              </div>
            </div>
          )}
        </CVProcessor>
      </div>

      {/* Processing History */}
      {processingHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Processing History
            </h2>
            <button
              onClick={clearHistory}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear History
            </button>
          </div>

          <div className="space-y-4">
            {processingHistory.map((result, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    CV Processing Result #{processingHistory.length - index}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {result.metadata.processedAt.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Quality Score:</span>
                    <div className="text-lg font-bold text-green-600">
                      {result.analytics.qualityScore}%
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">Processing Time:</span>
                    <div className="text-lg font-bold text-blue-600">
                      {(result.analytics.processingTime / 1000).toFixed(1)}s
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">Stages Completed:</span>
                    <div className="text-lg font-bold text-purple-600">
                      {result.analytics.stagesCompleted}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-600">Assets Generated:</span>
                    <div className="text-lg font-bold text-orange-600">
                      {(result.assets.documents?.length || 0) +
                       (result.assets.multimedia?.length || 0)}
                    </div>
                  </div>
                </div>

                {/* Assets Preview */}
                {(result.assets.documents || result.assets.multimedia) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Assets:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.assets.documents?.map((doc, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md"
                        >
                          📄 {doc.name}
                        </span>
                      ))}
                      {result.assets.multimedia?.map((media, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md"
                        >
                          {media.type === 'audio' ? '🎵' : media.type === 'video' ? '🎥' : '🖼️'} {media.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">How to Use</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <p>Upload your CV file using the drag-and-drop area or file selector</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <p>Select the features you want to enable (ATS optimization, personality insights, etc.)</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <p>Optionally provide a job description for targeted optimization</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <p>Monitor the real-time processing progress through all stages</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
            <p>Review your enhanced CV and download or share the results</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVProcessorExample;