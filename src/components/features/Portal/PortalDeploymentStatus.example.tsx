/**
 * PortalDeploymentStatus.example.tsx
 * 
 * Example usage and demonstration of the PortalDeploymentStatus component
 * showing different deployment states and configuration options.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { PortalDeploymentStatus } from './PortalDeploymentStatus';
import {
  DeploymentStatus,
  DeploymentPhase,
  PortalConfig,
  PortalError,
  PortalOperationResult
} from '../../../types/portal-types';

/**
 * Example portal configuration
 */
const examplePortalConfig: PortalConfig = {
  id: 'example-portal-123',
  name: 'John Doe Professional Portal',
  description: 'Interactive CV portal with AI chat and multimedia features',
  visibility: 'public',
  customDomain: 'johndoe.cvplus.io',
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter, sans-serif',
    layout: 'modern',
    animations: true,
    darkMode: false
  },
  features: {
    aiChat: true,
    qrCode: true,
    contactForm: true,
    calendar: true,
    portfolio: true,
    socialLinks: true,
    testimonials: true,
    analytics: true
  },
  metadata: {
    title: 'John Doe - Software Engineer',
    description: 'Senior Software Engineer specializing in React and Node.js development',
    keywords: ['software engineer', 'react', 'nodejs', 'full-stack'],
    ogImage: 'https://example.com/john-doe-og.jpg',
    canonicalUrl: 'https://johndoe.cvplus.io'
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20')
};

/**
 * Create mock deployment status for different phases
 */
const createMockStatus = (phase: DeploymentPhase, withError = false): DeploymentStatus => {
  const baseStatus: DeploymentStatus = {
    phase,
    progress: getProgressForPhase(phase),
    currentOperation: getOperationForPhase(phase),
    startedAt: new Date(Date.now() - Math.random() * 300000), // Random start time within last 5 minutes
    logs: generateMockLogs(phase),
    url: phase === 'completed' ? 'https://huggingface.co/spaces/johndoe/cv-portal' : undefined
  };

  if (withError && phase === 'failed') {
    baseStatus.error = {
      code: 'DEPLOYMENT_FAILED',
      message: 'Build process failed due to missing dependencies',
      component: 'PortalDeploymentStatus',
      operation: 'deploy',
      phase: 'building'
    } as PortalError;
  }

  return baseStatus;
};

/**
 * Get progress percentage for phase
 */
const getProgressForPhase = (phase: DeploymentPhase): number => {
  const progressMap: Record<DeploymentPhase, number> = {
    initializing: 5,
    validating: 15,
    preparing: 25,
    uploading: 40,
    building: 60,
    deploying: 80,
    testing: 90,
    completed: 100,
    failed: 0
  };
  return progressMap[phase];
};

/**
 * Get current operation description for phase
 */
const getOperationForPhase = (phase: DeploymentPhase): string => {
  const operationMap: Record<DeploymentPhase, string> = {
    initializing: 'Setting up deployment environment',
    validating: 'Validating configuration and requirements',
    preparing: 'Preparing files and assets',
    uploading: 'Uploading to HuggingFace Spaces',
    building: 'Building Space application',
    deploying: 'Deploying to production',
    testing: 'Running health checks',
    completed: 'Deployment completed successfully',
    failed: 'Deployment failed'
  };
  return operationMap[phase];
};

/**
 * Generate mock deployment logs
 */
const generateMockLogs = (currentPhase: DeploymentPhase) => {
  const logs = [
    {
      timestamp: new Date(Date.now() - 300000),
      level: 'info' as const,
      message: 'Starting deployment process for CV Portal'
    },
    {
      timestamp: new Date(Date.now() - 280000),
      level: 'info' as const,
      message: 'Validating portal configuration'
    },
    {
      timestamp: new Date(Date.now() - 260000),
      level: 'success' as const,
      message: 'Configuration validation passed'
    },
    {
      timestamp: new Date(Date.now() - 240000),
      level: 'info' as const,
      message: 'Preparing application files'
    },
    {
      timestamp: new Date(Date.now() - 220000),
      level: 'info' as const,
      message: 'Uploading files to HuggingFace Spaces'
    },
    {
      timestamp: new Date(Date.now() - 200000),
      level: 'success' as const,
      message: 'Files uploaded successfully'
    },
    {
      timestamp: new Date(Date.now() - 180000),
      level: 'info' as const,
      message: 'Building Space application'
    }
  ];

  if (currentPhase === 'building' || currentPhase === 'deploying' || currentPhase === 'testing' || currentPhase === 'completed') {
    logs.push({
      timestamp: new Date(Date.now() - 160000),
      level: 'info' as const,
      message: 'Installing dependencies'
    });
  }

  if (currentPhase === 'deploying' || currentPhase === 'testing' || currentPhase === 'completed') {
    logs.push({
      timestamp: new Date(Date.now() - 140000),
      level: 'success' as const,
      message: 'Build completed successfully'
    });
  }

  if (currentPhase === 'testing' || currentPhase === 'completed') {
    logs.push({
      timestamp: new Date(Date.now() - 120000),
      level: 'info' as const,
      message: 'Running health checks'
    });
  }

  if (currentPhase === 'completed') {
    logs.push({
      timestamp: new Date(Date.now() - 100000),
      level: 'success' as const,
      message: 'All health checks passed'
    });
    logs.push({
      timestamp: new Date(Date.now() - 80000),
      level: 'success' as const,
      message: 'Deployment completed successfully'
    });
  }

  if (currentPhase === 'failed') {
    logs.push({
      timestamp: new Date(Date.now() - 160000),
      level: 'error' as const,
      message: 'Build failed: Missing required dependencies'
    });
    logs.push({
      timestamp: new Date(Date.now() - 140000),
      level: 'error' as const,
      message: 'Error: Cannot find module \'react-portal-components\''
    });
  }

  return logs;
};

/**
 * Example deployment history
 */
const exampleDeploymentHistory = [
  {
    id: 'deployment-001',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    status: 'success' as const,
    duration: 280000,
    url: 'https://huggingface.co/spaces/johndoe/cv-portal-v1',
    version: 'v1.0.0'
  },
  {
    id: 'deployment-002',
    timestamp: new Date(Date.now() - 43200000), // 12 hours ago
    status: 'failed' as const,
    duration: 120000,
    error: 'Build timeout exceeded'
  },
  {
    id: 'deployment-003',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    status: 'success' as const,
    duration: 195000,
    url: 'https://huggingface.co/spaces/johndoe/cv-portal-v2',
    version: 'v1.1.0'
  }
];

/**
 * Example component demonstrating different deployment states
 */
export const PortalDeploymentStatusExample: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<DeploymentPhase>('building');
  const [showError, setShowError] = useState(false);
  const [autoProgress, setAutoProgress] = useState(false);

  // Auto-progress through phases for demonstration
  useEffect(() => {
    if (!autoProgress) return;

    const phases: DeploymentPhase[] = [
      'initializing',
      'validating', 
      'preparing',
      'uploading',
      'building',
      'deploying',
      'testing',
      'completed'
    ];

    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      const timer = setTimeout(() => {
        setCurrentPhase(phases[currentIndex + 1]);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setAutoProgress(false);
    }
  }, [currentPhase, autoProgress]);

  const handleStatusChange = (newStatus: DeploymentStatus) => {
    console.log('Status changed:', newStatus);
  };

  const handleDeploymentComplete = (result: PortalOperationResult) => {
    console.log('Deployment completed:', result);
  };

  const handleDeploymentError = (error: PortalError) => {
    console.error('Deployment error:', error);
  };

  const handleRefresh = () => {
    console.log('Refreshing deployment status...');
  };

  const handleCancel = () => {
    console.log('Cancelling deployment...');
    setCurrentPhase('failed');
  };

  const handleRetry = () => {
    console.log('Retrying deployment...');
    setCurrentPhase('initializing');
    setShowError(false);
  };

  const status = createMockStatus(showError ? 'failed' : currentPhase, showError);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Portal Deployment Status Examples
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Interactive demonstration of the PortalDeploymentStatus component
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Controls</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Phase:</label>
            <select
              value={currentPhase}
              onChange={(e) => {
                setCurrentPhase(e.target.value as DeploymentPhase);
                setShowError(false);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="initializing">Initializing</option>
              <option value="validating">Validating</option>
              <option value="preparing">Preparing</option>
              <option value="uploading">Uploading</option>
              <option value="building">Building</option>
              <option value="deploying">Deploying</option>
              <option value="testing">Testing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <button
            onClick={() => setShowError(!showError)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showError
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showError ? 'Hide Error' : 'Show Error'}
          </button>

          <button
            onClick={() => {
              setAutoProgress(!autoProgress);
              if (!autoProgress) {
                setCurrentPhase('initializing');
                setShowError(false);
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoProgress
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {autoProgress ? 'Stop Auto Progress' : 'Start Auto Progress'}
          </button>
        </div>
      </div>

      {/* Standard Configuration */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Standard Configuration</h2>
        <PortalDeploymentStatus
          status={status}
          portalConfig={examplePortalConfig}
          jobId="example-job-123"
          profileId="example-profile-456"
          deploymentHistory={exampleDeploymentHistory}
          onStatusChange={handleStatusChange}
          onDeploymentComplete={handleDeploymentComplete}
          onDeploymentError={handleDeploymentError}
          onRefresh={handleRefresh}
          onCancel={handleCancel}
          onRetry={handleRetry}
        />
      </div>

      {/* Compact Configuration */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Compact Configuration</h2>
        <PortalDeploymentStatus
          status={status}
          portalConfig={examplePortalConfig}
          jobId="example-job-123"
          profileId="example-profile-456"
          displayConfig={{
            showProgress: true,
            showLogs: false,
            showTimeEstimate: false,
            showUrl: true,
            compact: true,
            refreshInterval: 10
          }}
          actions={{
            allowRefresh: true,
            allowCancel: false,
            allowRetry: true,
            showHistory: false
          }}
          onStatusChange={handleStatusChange}
          onDeploymentComplete={handleDeploymentComplete}
          onDeploymentError={handleDeploymentError}
        />
      </div>

      {/* Minimal Configuration */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Minimal Configuration</h2>
        <PortalDeploymentStatus
          status={status}
          portalConfig={examplePortalConfig}
          jobId="example-job-123"
          profileId="example-profile-456"
          displayConfig={{
            showProgress: true,
            showLogs: false,
            showTimeEstimate: false,
            showUrl: false,
            compact: true,
            refreshInterval: 0
          }}
          actions={{
            allowRefresh: false,
            allowCancel: false,
            allowRetry: false,
            showHistory: false
          }}
        />
      </div>

      {/* Usage Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Usage Information</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>Real-time Updates:</strong> The component supports auto-refresh with configurable intervals.</p>
          <p><strong>Error Handling:</strong> Comprehensive error display with recovery suggestions and retry mechanisms.</p>
          <p><strong>Deployment Phases:</strong> Tracks all phases from initialization to completion with progress indicators.</p>
          <p><strong>Logs Filtering:</strong> Built-in log filtering by level (info, warning, error, success).</p>
          <p><strong>HuggingFace Integration:</strong> Direct integration with HuggingFace Spaces deployment API.</p>
          <p><strong>Responsive Design:</strong> Optimized for all device sizes with Tailwind CSS.</p>
        </div>
      </div>
    </div>
  );
};

export default PortalDeploymentStatusExample;