/**
 * Role Detection Section Component
 * Main orchestrator for role detection functionality with progressive disclosure
 */

import React, { useState, useEffect } from 'react';
import { Target, Sparkles, RefreshCw, Settings, Clock, AlertCircle } from 'lucide-react';
import { RoleDetectionProgress } from './RoleDetectionProgress';
import { DetectedRoleCard } from './DetectedRoleCard';
import { RoleSelectionModal } from './RoleSelectionModal';
import { useRoleDetection } from '../hooks/useRoleDetection';
import { useUnifiedAnalysis } from '../context/UnifiedAnalysisContext';
import type { RoleDetectionSectionProps } from '../context/types';

export const RoleDetectionSection: React.FC<RoleDetectionSectionProps> = ({
  jobData,
  onRoleSelected,
  onManualSelection,
  className = ''
}) => {
  const { state, canProceedToRoleDetection } = useUnifiedAnalysis();
  const { 
    detectedRoles,
    selectedRole,
    status,
    analysis,
    startDetection,
    selectRole,
    retry,
    provideFallbackRoles,
    isLoading,
    hasTimedOut,
    canRetry,
    retryCount,
    showFallbackOptions,
    progressMessage,
    cleanup,
    error
  } = useRoleDetection();
  
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<string | undefined>('~2 minutes');
  
  // Auto-trigger role detection when component mounts and analysis is complete
  useEffect(() => {
    console.log('[RoleDetectionSection] Auto-trigger check:', {
      canProceedToRoleDetection,
      status,
      isLoading,
      jobId: jobData?.id
    });
    
    if (canProceedToRoleDetection && status === 'idle' && !isLoading) {
      console.log('[RoleDetectionSection] Auto-triggering role detection...');
      startDetection(jobData);
    }
  }, [canProceedToRoleDetection, status, isLoading, startDetection, jobData]);
  
  // Enhanced progress simulation with better timeout handling
  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      // Set initial estimated time based on retry count
      const baseTime = retryCount === 0 ? 60 : Math.min(60 * Math.pow(1.5, retryCount), 120);
      setEstimatedTime(`~${Math.round(baseTime / 60)} minute${Math.round(baseTime / 60) !== 1 ? 's' : ''}`);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          // More realistic progress - slower at start, faster in middle
          if (prev < 20) return prev + Math.random() * 2;
          if (prev < 60) return prev + Math.random() * 4;
          if (prev < 90) return prev + Math.random() * 2;
          return Math.min(prev + Math.random() * 0.5, 95); // Cap at 95% until completion
        });
      }, 1000);
      
      // Progress time updates with better messaging
      const updateTimes = [
        { delay: 15000, message: 'AI is analyzing your experience...' },
        { delay: 30000, message: 'Processing complex profile data...' },
        { delay: 45000, message: 'Finalizing role recommendations...' },
        { delay: 55000, message: 'Almost ready...' }
      ];
      
      const timeouts = updateTimes.map(({ delay, message }) => 
        setTimeout(() => {
          if (isLoading) {
            setEstimatedTime(message);
          }
        }, delay)
      );
      
      return () => {
        clearInterval(interval);
        timeouts.forEach(clearTimeout);
      };
    } else if (status === 'completed') {
      setProgress(100);
      setEstimatedTime('Complete!');
    } else if (status === 'error' && hasTimedOut) {
      setProgress(100);
      setEstimatedTime(`Timeout after ${retryCount + 1} attempt${retryCount !== 0 ? 's' : ''}`);
    }
  }, [isLoading, status, hasTimedOut, retryCount]);
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  const handleRoleSelect = (role: any) => {
    selectRole(role);
    onRoleSelected(role);
  };
  
  const handleManualSelection = () => {
    setShowSelectionModal(true);
    onManualSelection();
  };
  
  const handleModalRoleSelect = (role: any) => {
    selectRole(role);
    onRoleSelected(role);
    setShowSelectionModal(false);
  };
  
  const handleRetry = () => {
    retry();
  };
  
  const isDetectionComplete = status === 'completed' && detectedRoles.length > 0;
  const hasError = status === 'error' || error;
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full border border-cyan-500/30 mb-4">
          <Target className="w-5 h-5 text-cyan-400" />
          <span className="text-cyan-300 font-medium">AI Role Detection</span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-3">
          Discovering Your Professional Profile
        </h2>
        
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Our AI analyzes your CV to identify your role and provide personalized recommendations
          {retryCount > 0 && (
            <span className="block mt-2 text-sm text-amber-400">
              Retry attempt {retryCount + 1} - Using extended analysis timeout
            </span>
          )}
        </p>
      </div>
      
      {/* Progress Section - Enhanced with progress message */}
      {(isLoading || status === 'analyzing' || status === 'detecting') && (
        <div className="space-y-4">
          <RoleDetectionProgress
            status={status}
            progress={progress}
            estimatedTime={estimatedTime}
            stage={progressMessage || (isLoading ? 'Analyzing your experience and skills' : undefined)}
          />
          
          {/* Progress message with visual feedback */}
          {progressMessage && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-blue-300 text-sm">{progressMessage}</span>
              </div>
            </div>
          )}
          
          {/* Extended processing notice */}
          {isLoading && progress > 50 && (
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                AI analysis for complex profiles can take up to {Math.round((retryCount === 0 ? 60 : Math.min(60 * Math.pow(1.5, retryCount), 120)) / 60)} minute{Math.round((retryCount === 0 ? 60 : Math.min(60 * Math.pow(1.5, retryCount), 120)) / 60) !== 1 ? 's' : ''}.
                <br />Please wait while we ensure the most accurate role detection.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Enhanced Error State with better guidance */}
      {hasError && (
        <div className={`border rounded-xl p-6 text-center ${
          hasTimedOut 
            ? 'bg-amber-900/20 border-amber-500/30' 
            : 'bg-red-900/20 border-red-500/30'
        }`}>
          <div className={`inline-flex items-center gap-2 mb-4 ${
            hasTimedOut ? 'text-amber-400' : 'text-red-400'
          }`}>
            {hasTimedOut ? <Clock className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <div className="text-lg font-semibold">
              {hasTimedOut 
                ? `Analysis Timeout (${retryCount + 1} attempt${retryCount !== 0 ? 's' : ''})` 
                : 'Role Detection Failed'
              }
            </div>
          </div>
          
          <p className="text-gray-300 mb-4 max-w-lg mx-auto leading-relaxed">
            {error || 'Unable to detect your professional role. Please try again or select manually.'}
          </p>
          
          {/* Action buttons with smart visibility */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Retry button with attempt count */}
            {canRetry && (
              <button
                onClick={handleRetry}
                className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-medium transition-all hover:scale-105 ${
                  hasTimedOut 
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25' 
                    : 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                } shadow-lg`}
              >
                <RefreshCw className="w-4 h-4" />
                Retry with Extended Timeout ({3 - retryCount} left)
              </button>
            )}
            
            {/* Fallback options button - shows when we have fallback roles */}
            {showFallbackOptions && (
              <button
                onClick={() => setShowSelectionModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
              >
                <Target className="w-4 h-4" />
                View Role Options ({detectedRoles.length})
              </button>
            )}
            
            {/* Manual selection - always available */}
            <button
              onClick={handleManualSelection}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-all hover:scale-105"
            >
              <Settings className="w-4 h-4" />
              {showFallbackOptions ? 'Browse All Roles' : 'Manual Selection'}
            </button>
          </div>
          
          {/* Additional guidance for timeouts */}
          {hasTimedOut && (
            <div className="mt-4 pt-4 border-t border-amber-500/20">
              <p className="text-sm text-amber-200/80">
                💡 <strong>Tip:</strong> Complex CVs with extensive experience may require longer processing time.
                Fallback options above provide immediate alternatives while you wait.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Detected Roles */}
      {isDetectionComplete && (
        <div className="space-y-6">
          {/* Success Message with detection context */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">
                {showFallbackOptions ? 'Fallback Options Available!' : 'Detection Complete!'}
              </span>
            </div>
            <p className="text-gray-300">
              {showFallbackOptions 
                ? `We've provided ${detectedRoles.length} carefully selected role options for you to choose from`
                : `Found ${detectedRoles.length} role${detectedRoles.length !== 1 ? 's' : ''} that match your profile`
              }
              {retryCount > 0 && !showFallbackOptions && (
                <span className="block mt-1 text-sm text-green-400">
                  ✓ Successful after {retryCount + 1} attempt{retryCount !== 0 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          
          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {detectedRoles.map((role) => (
              <DetectedRoleCard
                key={role.roleId}
                role={role}
                isSelected={selectedRole?.roleId === role.roleId}
                onSelect={handleRoleSelect}
                onCustomize={handleManualSelection}
              />
            ))}
          </div>
          
          {/* Additional Options with context-aware messaging */}
          <div className="text-center pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-4">
              {showFallbackOptions 
                ? 'These roles are carefully selected based on common professional profiles. Choose the one that best fits your background.'
                : 'Don\'t see your exact role? Browse more options or create a custom profile.'
              }
            </p>
            <button
              onClick={handleManualSelection}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
            >
              <Settings className="w-5 h-5" />
              {showFallbackOptions ? 'Browse Complete Role Library' : 'Browse All Roles'}
            </button>
          </div>
        </div>
      )}
      
      {/* Role Selection Modal with enhanced context */}
      <RoleSelectionModal
        isOpen={showSelectionModal}
        availableRoles={detectedRoles}
        selectedRole={selectedRole}
        onRoleSelect={handleModalRoleSelect}
        onClose={() => setShowSelectionModal(false)}
        onCreateCustom={() => {
          // Handle custom role creation
          console.log('Create custom role requested');
        }}
      />
    </div>
  );
};