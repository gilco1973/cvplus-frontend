// SessionResumePrompt - Intelligent session resume recommendations
import React, { useState, useEffect } from 'react';
import {
  EnhancedSessionState,
  ResumeRecommendation,
  ActionRecommendation
} from '../types/session';
import { ResumeIntelligence } from '../services/navigation/resumeIntelligence';

export interface SessionResumePromptProps {
  session: EnhancedSessionState;
  onResume: (step?: string, options?: Record<string, unknown>) => Promise<void>;
  onDismiss?: () => void;
  autoShow?: boolean;
  showAlternatives?: boolean;
}

export const SessionResumePrompt: React.FC<SessionResumePromptProps> = ({
  session,
  onResume,
  onDismiss,
  autoShow = true,
  showAlternatives = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<ResumeRecommendation | null>(null);
  const [actions, setActions] = useState<ActionRecommendation[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const resumeIntelligence = new ResumeIntelligence();

  useEffect(() => {
    const checkShouldShow = async () => {
      if (!autoShow) return;
      
      // Show if session has been inactive for more than 5 minutes
      const lastActivity = new Date(session.lastActiveAt);
      const timeSinceLastActivity = Date.now() - lastActivity.getTime();
      const shouldShow = timeSinceLastActivity > 5 * 60 * 1000; // 5 minutes

      if (shouldShow) {
        await loadRecommendations();
        setIsVisible(true);
      }
    };

    checkShouldShow();
  }, [session, autoShow]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      
      const [resumeRec, actionRecs] = await Promise.all([
        resumeIntelligence.suggestOptimalResumePoint(session),
        resumeIntelligence.getNextRecommendedActions(session)
      ]);
      
      setRecommendation(resumeRec);
      setActions(actionRecs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async (step?: string) => {
    setIsLoading(true);
    try {
      await onResume(step);
      setIsVisible(false);
    } catch (error) {
      console.error('Error resuming session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 1) return 'less than a minute';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'gray';
      default: return 'blue';
    }
  };

  const getProgressPercentage = (): number => {
    const totalSteps = ['upload', 'processing', 'analysis', 'features', 'templates', 'preview', 'results'];
    const completedSteps = totalSteps.filter(step => session.completedSteps.includes(step as 'upload' | 'processing' | 'analysis' | 'features' | 'templates' | 'preview' | 'results'));
    return Math.round((completedSteps.length / totalSteps.length) * 100);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome Back!</h2>
              <p className="text-sm text-gray-600 mt-1">
                Your CV is {getProgressPercentage()}% complete. Let's continue where you left off.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading recommendations...</p>
          </div>
        )}

        {/* Recommendations */}
        {!isLoading && recommendation && (
          <div className="px-6 py-4">
            {/* Primary Recommendation */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recommended Next Step</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900 capitalize">
                    {recommendation.recommendedStep}
                  </h4>
                  <span className="text-sm text-blue-700">
                    ~{formatDuration(recommendation.timeToComplete)}
                  </span>
                </div>
                <p className="text-blue-800 text-sm mb-3">{recommendation.reason}</p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleResume(recommendation.recommendedStep)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                  >
                    Continue Here
                  </button>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 text-sm"
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                {/* Detailed Information */}
                {showDetails && (
                  <div className="mt-4 pt-3 border-t border-blue-200 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-blue-900">Confidence:</span>
                        <span className="ml-2 text-blue-800">{Math.round(recommendation.confidence * 100)}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">Priority:</span>
                        <span className="ml-2 text-blue-800 capitalize">{recommendation.priority}</span>
                      </div>
                    </div>
                    
                    {recommendation.requiredData.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium text-blue-900">Required:</span>
                        <span className="ml-2 text-blue-800">{recommendation.requiredData.join(', ')}</span>
                      </div>
                    )}

                    {recommendation.warnings.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium text-orange-700">Warnings:</span>
                        <ul className="ml-2 text-orange-600">
                          {recommendation.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {actions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {actions.slice(0, 3).map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full bg-${getPriorityColor(action.priority)}-500`}></span>
                          <h4 className="font-medium text-gray-900">{action.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">~{formatDuration(action.estimatedTime)}</span>
                          {action.benefits.length > 0 && (
                            <span className="text-xs text-green-600">• {action.benefits[0]}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleResume(action.requiredSteps[0])}
                        className="ml-3 px-3 py-1 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
                      >
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Options */}
            {showAlternatives && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Other Options</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleResume(session.currentStep)}
                    className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Continue Current Step
                  </button>
                  <button
                    onClick={() => handleResume('upload')}
                    className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Start from Beginning
                  </button>
                  <button
                    onClick={() => handleResume('preview')}
                    className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Jump to Preview
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionResumePrompt;