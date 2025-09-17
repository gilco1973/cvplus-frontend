/**
 * PortalGenerator.tsx - One-Click Portal Generation Component
 * 
 * Advanced portal generation interface with RAG initialization, premium validation,
 * and real-time progress tracking. Handles the complete portal deployment pipeline
 * from CV processing to embedding generation to HuggingFace deployment.
 * 
 * Features:
 * - One-click portal generation with premium subscription validation
 * - Real-time progress tracking with visual indicators
 * - RAG system initialization with embedding generation
 * - Success state with shareable portal URL and QR code
 * - Comprehensive error handling with retry mechanisms
 * - Mobile-responsive design with touch-friendly interactions
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Zap,
  Crown,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Share2,
  Copy,
  QrCode,
  ExternalLink,
  Clock,
  Cpu,
  Database,
  Globe,
  Sparkles,
  ArrowRight,
  Star,
  Rocket
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PortalComponentProps, DeploymentStatus, DeploymentPhase, PortalError } from '../../../types/portal-types';
import { useFirebaseFunction } from '../../../hooks/useFeatureData';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorBoundary } from '../Common/ErrorBoundary';

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface PortalGeneratorProps extends PortalComponentProps {
  /** CV Job ID for portal generation */
  jobId: string;
  /** User's premium subscription status */
  isPremium?: boolean;
  /** Portal generation callback */
  onPortalGenerated?: (portalUrl: string, portalId: string) => void;
  /** Premium upgrade callback */
  onUpgradeRequired?: () => void;
  /** Error callback */
  onError?: (error: PortalError) => void;
}

interface GenerationState {
  phase: DeploymentPhase;
  progress: number;
  currentOperation: string;
  estimatedTimeRemaining: number;
  portalUrl?: string;
  portalId?: string;
  error?: string;
  startTime?: Date;
}

interface ProgressStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedDuration: number; // in seconds
  completed: boolean;
  active: boolean;
  error: boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Premium validation banner
 */
const PremiumBanner: React.FC<{
  isPremium: boolean;
  onUpgrade: () => void;
}> = ({ isPremium, onUpgrade }) => {
  if (isPremium) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-semibold text-yellow-900">Premium Member</h3>
            <p className="text-sm text-yellow-700">
              You have access to AI-powered portal generation with RAG chat capabilities
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-semibold text-purple-900">Premium Required</h3>
            <p className="text-sm text-purple-700">
              Upgrade to generate AI-powered portals with advanced chat features
            </p>
          </div>
        </div>
        <button
          onClick={onUpgrade}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center gap-2"
        >
          <Crown className="w-4 h-4" />
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

/**
 * Progress tracking component
 */
const ProgressTracker: React.FC<{
  steps: ProgressStep[];
  currentPhase: DeploymentPhase;
  progress: number;
  estimatedTimeRemaining: number;
}> = ({ steps, currentPhase, progress, estimatedTimeRemaining }) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            Portal Generation Progress
          </span>
          <span className="text-gray-500">
            {Math.round(progress)}% • ETA: {formatTime(estimatedTimeRemaining)}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step-by-step Progress */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                step.active
                  ? 'bg-blue-50 border border-blue-200'
                  : step.completed
                  ? 'bg-green-50 border border-green-200'
                  : step.error
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {/* Step Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.active
                    ? 'bg-blue-500 text-white'
                    : step.completed
                    ? 'bg-green-500 text-white'
                    : step.error
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {step.error ? (
                  <XCircle className="w-5 h-5" />
                ) : step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.active ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-medium ${
                      step.active
                        ? 'text-blue-900'
                        : step.completed
                        ? 'text-green-900'
                        : step.error
                        ? 'text-red-900'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <span className="text-xs text-gray-500">
                    ~{step.estimatedDuration}s
                  </span>
                </div>
                <p
                  className={`text-sm mt-1 ${
                    step.active
                      ? 'text-blue-700'
                      : step.completed
                      ? 'text-green-700'
                      : step.error
                      ? 'text-red-700'
                      : 'text-gray-500'
                  }`}
                >
                  {step.description}
                </p>
              </div>

              {/* Step Number */}
              <div
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  step.active
                    ? 'bg-blue-100 text-blue-600'
                    : step.completed
                    ? 'bg-green-100 text-green-600'
                    : step.error
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Success state with portal URL and actions
 */
const SuccessState: React.FC<{
  portalUrl: string;
  portalId: string;
  onShare: () => void;
  onCopyUrl: () => void;
  onGenerateQR: () => void;
}> = ({ portalUrl, portalId, onShare, onCopyUrl, onGenerateQR }) => {
  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      {/* Success Message */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Portal Generated Successfully! ✨
        </h3>
        <p className="text-gray-600">
          Your AI-powered portal is live and ready to share with the world.
        </p>
      </div>

      {/* Portal URL Display */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-600" />
          <div className="flex-1 text-left">
            <p className="text-sm text-gray-600 mb-1">Your Portal URL:</p>
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium break-all"
            >
              {portalUrl}
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => window.open(portalUrl, '_blank')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-5 h-5" />
          Visit Portal
        </button>
        
        <button
          onClick={onCopyUrl}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          <Copy className="w-5 h-5" />
          Copy URL
        </button>
        
        <button
          onClick={onGenerateQR}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          <QrCode className="w-5 h-5" />
          QR Code
        </button>
        
        <button
          onClick={onShare}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>

      {/* Portal Features */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Your Portal Includes:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            AI-Powered Chat
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            RAG Knowledge Base
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Mobile Responsive
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Analytics Dashboard
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Error state with retry options
 */
const ErrorState: React.FC<{
  error: string;
  onRetry: () => void;
  onContactSupport: () => void;
}> = ({ error, onRetry, onContactSupport }) => {
  return (
    <div className="text-center space-y-6">
      {/* Error Icon */}
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <XCircle className="w-12 h-12 text-red-600" />
      </div>

      {/* Error Message */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Portal Generation Failed
        </h3>
        <p className="text-gray-600 mb-4">
          Don't worry, we can try again. Most issues are temporary.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
          <p className="text-sm text-red-700">
            <strong>Error:</strong> {error}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>
        
        <button
          onClick={onContactSupport}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PortalGenerator: React.FC<PortalGeneratorProps> = ({
  jobId,
  isPremium = false,
  portalConfig,
  onPortalGenerated,
  onUpgradeRequired,
  onError,
  className = '',
  mode = 'private'
}) => {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const [generationState, setGenerationState] = useState<GenerationState>({
    phase: 'initializing',
    progress: 0,
    currentOperation: 'Ready to start',
    estimatedTimeRemaining: 0
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const { callFunction, loading: functionLoading, error: functionError } = useFirebaseFunction();

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const progressSteps = useMemo((): ProgressStep[] => {
    const steps = [
      {
        id: 'validating',
        label: 'Validating CV Data',
        description: 'Checking CV completeness and structure',
        icon: CheckCircle,
        estimatedDuration: 5,
        completed: false,
        active: false,
        error: false
      },
      {
        id: 'processing',
        label: 'Processing Content',
        description: 'Analyzing CV content and extracting key information',
        icon: Cpu,
        estimatedDuration: 15,
        completed: false,
        active: false,
        error: false
      },
      {
        id: 'embeddings',
        label: 'Creating RAG Embeddings',
        description: 'Generating vector embeddings for AI chat capabilities',
        icon: Database,
        estimatedDuration: 20,
        completed: false,
        active: false,
        error: false
      },
      {
        id: 'building',
        label: 'Building Portal',
        description: 'Compiling portal components and assets',
        icon: Rocket,
        estimatedDuration: 10,
        completed: false,
        active: false,
        error: false
      },
      {
        id: 'deploying',
        label: 'Deploying to Cloud',
        description: 'Publishing portal to HuggingFace Spaces',
        icon: Globe,
        estimatedDuration: 15,
        completed: false,
        active: false,
        error: false
      }
    ];

    // Update step states based on current phase
    steps.forEach((step, index) => {
      const phaseOrder = ['validating', 'processing', 'preparing', 'building', 'deploying', 'completed'];
      const currentPhaseIndex = phaseOrder.indexOf(generationState.phase);
      
      if (index < currentPhaseIndex) {
        step.completed = true;
      } else if (index === currentPhaseIndex) {
        step.active = true;
      }
      
      // Map phases to steps
      if (generationState.phase === 'preparing' && step.id === 'embeddings') {
        step.active = true;
      }
    });

    return steps;
  }, [generationState.phase]);

  const totalEstimatedTime = useMemo(() => {
    return progressSteps.reduce((total, step) => total + step.estimatedDuration, 0);
  }, [progressSteps]);

  // ========================================================================
  // PORTAL GENERATION LOGIC
  // ========================================================================

  const generatePortal = useCallback(async () => {
    if (!isPremium) {
      onUpgradeRequired?.();
      return;
    }

    setIsGenerating(true);
    setGenerationState({
      phase: 'initializing',
      progress: 0,
      currentOperation: 'Starting portal generation...',
      estimatedTimeRemaining: totalEstimatedTime,
      startTime: new Date()
    });

    try {
      // Simulate progress updates during generation
      const progressInterval = setInterval(() => {
        setGenerationState(prev => {
          const elapsed = prev.startTime ? (Date.now() - prev.startTime.getTime()) / 1000 : 0;
          const newProgress = Math.min((elapsed / totalEstimatedTime) * 100, 95);
          const remaining = Math.max(totalEstimatedTime - elapsed, 0);
          
          let newPhase: DeploymentPhase = prev.phase;
          let newOperation = prev.currentOperation;
          
          // Update phase based on progress
          if (newProgress < 10) {
            newPhase = 'validating';
            newOperation = 'Validating CV data and structure...';
          } else if (newProgress < 30) {
            newPhase = 'processing';
            newOperation = 'Processing CV content and extracting information...';
          } else if (newProgress < 60) {
            newPhase = 'preparing';
            newOperation = 'Generating RAG embeddings for AI capabilities...';
          } else if (newProgress < 80) {
            newPhase = 'building';
            newOperation = 'Building portal components and assets...';
          } else {
            newPhase = 'deploying';
            newOperation = 'Deploying portal to HuggingFace Spaces...';
          }

          return {
            ...prev,
            phase: newPhase,
            progress: newProgress,
            currentOperation: newOperation,
            estimatedTimeRemaining: remaining
          };
        });
      }, 1000);

      // Call the portal generation function
      const result = await callFunction('generateWebPortal', {
        jobId,
        config: {
          enableRAG: true,
          enableChat: true,
          features: {
            qrCode: true,
            analytics: true,
            socialShare: true
          },
          theme: {
            primaryColor: '#3B82F6',
            layout: 'modern'
          }
        }
      });

      clearInterval(progressInterval);

      if (result.success) {
        setGenerationState(prev => ({
          ...prev,
          phase: 'completed',
          progress: 100,
          currentOperation: 'Portal generation completed successfully!',
          estimatedTimeRemaining: 0,
          portalUrl: result.portalUrl,
          portalId: result.portalId
        }));
        
        onPortalGenerated?.(result.portalUrl, result.portalId);
        toast.success('Portal generated successfully!', {
          icon: '🎉',
          duration: 4000
        });
      } else {
        throw new Error(result.error || 'Portal generation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setGenerationState(prev => ({
        ...prev,
        phase: 'failed',
        error: errorMessage,
        currentOperation: 'Portal generation failed'
      }));
      
      const portalError: PortalError = {
        code: 'PORTAL_GENERATION_ERROR',
        message: errorMessage,
        component: 'PortalGenerator',
        operation: 'generatePortal',
        timestamp: new Date()
      };
      
      onError?.(portalError);
      toast.error('Portal generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [isPremium, jobId, totalEstimatedTime, callFunction, onPortalGenerated, onUpgradeRequired, onError]);

  // ========================================================================
  // ACTION HANDLERS
  // ========================================================================

  const handleCopyUrl = useCallback(() => {
    if (generationState.portalUrl) {
      navigator.clipboard.writeText(generationState.portalUrl);
      toast.success('Portal URL copied to clipboard!');
    }
  }, [generationState.portalUrl]);

  const handleShare = useCallback(() => {
    if (generationState.portalUrl && navigator.share) {
      navigator.share({
        title: 'My Professional Portal',
        text: 'Check out my AI-powered professional portal!',
        url: generationState.portalUrl
      });
    } else {
      handleCopyUrl();
    }
  }, [generationState.portalUrl, handleCopyUrl]);

  const handleGenerateQR = useCallback(() => {
    // TODO: Integrate with QR generation component
    toast.info('QR code generation coming soon!');
  }, []);

  const handleRetry = useCallback(() => {
    setGenerationState({
      phase: 'initializing',
      progress: 0,
      currentOperation: 'Ready to retry',
      estimatedTimeRemaining: 0
    });
    generatePortal();
  }, [generatePortal]);

  const handleContactSupport = useCallback(() => {
    // TODO: Integrate with support system
    window.open('mailto:support@cvplus.app?subject=Portal Generation Error', '_blank');
  }, []);

  // ========================================================================
  // RENDER CONDITIONS
  // ========================================================================

  if (functionError) {
    return (
      <ErrorBoundary onError={onError}>
        <div className={`max-w-4xl mx-auto p-6 ${className}`}>
          <ErrorState
            error={functionError.message}
            onRetry={handleRetry}
            onContactSupport={handleContactSupport}
          />
        </div>
      </ErrorBoundary>
    );
  }

  if (generationState.phase === 'completed' && generationState.portalUrl) {
    return (
      <ErrorBoundary onError={onError}>
        <div className={`max-w-4xl mx-auto p-6 ${className}`}>
          <SuccessState
            portalUrl={generationState.portalUrl}
            portalId={generationState.portalId || ''}
            onShare={handleShare}
            onCopyUrl={handleCopyUrl}
            onGenerateQR={handleGenerateQR}
          />
        </div>
      </ErrorBoundary>
    );
  }

  if (generationState.phase === 'failed') {
    return (
      <ErrorBoundary onError={onError}>
        <div className={`max-w-4xl mx-auto p-6 ${className}`}>
          <ErrorState
            error={generationState.error || 'Unknown error'}
            onRetry={handleRetry}
            onContactSupport={handleContactSupport}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  return (
    <ErrorBoundary onError={onError}>
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            One-Click Portal Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your CV into an AI-powered interactive portal with RAG chat capabilities,
            deployed instantly to the cloud.
          </p>
        </div>

        {/* Premium Banner */}
        <PremiumBanner
          isPremium={isPremium}
          onUpgrade={() => onUpgradeRequired?.()}
        />

        {/* Generation Interface */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {isGenerating ? (
            /* Progress Tracking */
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Generating Your Portal
                </h3>
                <p className="text-gray-600">
                  {generationState.currentOperation}
                </p>
              </div>
              
              <ProgressTracker
                steps={progressSteps}
                currentPhase={generationState.phase}
                progress={generationState.progress}
                estimatedTimeRemaining={generationState.estimatedTimeRemaining}
              />
            </div>
          ) : (
            /* Initial State - Generation Button */
            <div className="p-8 text-center">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to Generate Your Portal
                  </h3>
                  <p className="text-gray-600">
                    Your portal will include advanced AI chat, RAG knowledge base,
                    and professional presentation features.
                  </p>
                </div>

                {/* Features Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      AI-Powered Chat
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Database className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      RAG Knowledge Base
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Cloud Deployment
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Analytics Dashboard
                    </span>
                  </div>
                </div>

                {/* Generation Button */}
                <button
                  onClick={generatePortal}
                  disabled={!isPremium || functionLoading}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 mx-auto ${
                    isPremium
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {functionLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Generating Portal...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-6 h-6" />
                      Generate AI Portal
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Estimated Time */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Estimated time: {Math.round(totalEstimatedTime / 60)} minutes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PortalGenerator;