/**
 * CV Upload Component
 *
 * A comprehensive CV upload interface that handles file selection,
 * feature configuration, and job creation.
 *
 * @fileoverview Core CV upload component with drag-and-drop support
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Import shared types
import { FeatureType } from '../../../shared/types/cv-job';

// Import services
import { uploadCV, CVUploadResponse } from '../services/cvService';

// Import hooks and utilities
import { useAuth } from '../hooks/useAuth';
import { formatFileSize } from '../utils/fileUtils';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface CVUploadProps {
  onJobCreated?: (jobId: string, response: CVUploadResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface FeatureConfig {
  id: FeatureType;
  name: string;
  description: string;
  icon: React.ReactNode;
  premium?: boolean;
  credits: number;
}

interface UploadState {
  file: File | null;
  selectedFeatures: FeatureType[];
  customizations: Record<string, any>;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

// ============================================================================
// Feature Configuration
// ============================================================================

const AVAILABLE_FEATURES: FeatureConfig[] = [
  {
    id: FeatureType.ATS_OPTIMIZATION,
    name: 'ATS Optimization',
    description: 'Optimize your CV for Applicant Tracking Systems with keyword analysis',
    icon: <CheckCircle className="w-5 h-5" />,
    credits: 1
  },
  {
    id: FeatureType.PERSONALITY_INSIGHTS,
    name: 'Personality Insights',
    description: 'Get AI-powered personality analysis and career recommendations',
    icon: <CheckCircle className="w-5 h-5" />,
    premium: true,
    credits: 1
  },
  {
    id: FeatureType.AI_PODCAST,
    name: 'AI Career Podcast',
    description: 'Generate a personalized podcast highlighting your achievements',
    icon: <CheckCircle className="w-5 h-5" />,
    premium: true,
    credits: 3
  },
  {
    id: FeatureType.VIDEO_INTRODUCTION,
    name: 'Video Introduction',
    description: 'Create an AI-generated video introduction for your profile',
    icon: <CheckCircle className="w-5 h-5" />,
    premium: true,
    credits: 5
  },
  {
    id: FeatureType.INTERACTIVE_TIMELINE,
    name: 'Interactive Timeline',
    description: 'Build a dynamic timeline showcasing your career progression',
    icon: <CheckCircle className="w-5 h-5" />,
    premium: true,
    credits: 2
  },
  {
    id: FeatureType.PORTFOLIO_GALLERY,
    name: 'Portfolio Gallery',
    description: 'Create a visual portfolio gallery from your achievements',
    icon: <CheckCircle className="w-5 h-5" />,
    premium: true,
    credits: 2
  }
];

// ============================================================================
// Main Component
// ============================================================================

export const CVUpload: React.FC<CVUploadProps> = ({
  onJobCreated,
  onError,
  className = ''
}) => {
  const { user, userProfile } = useAuth();

  // Component state
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    selectedFeatures: [FeatureType.ATS_OPTIMIZATION], // Default feature
    customizations: {},
    isUploading: false,
    progress: 0,
    error: null
  });

  // ============================================================================
  // File Upload Handling
  // ============================================================================

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'Invalid file format';

      if (rejection.errors) {
        const error = rejection.errors[0];
        if (error.code === 'file-too-large') {
          errorMessage = 'File size exceeds 10MB limit';
        } else if (error.code === 'file-invalid-type') {
          errorMessage = 'Supported formats: PDF, DOCX, TXT, CSV';
        }
      }

      setUploadState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      return;
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadState(prev => ({
        ...prev,
        file,
        error: null
      }));

      toast.success(`File "${file.name}" selected successfully`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  // ============================================================================
  // Feature Selection
  // ============================================================================

  const handleFeatureToggle = (featureId: FeatureType) => {
    setUploadState(prev => {
      const isSelected = prev.selectedFeatures.includes(featureId);
      const newFeatures = isSelected
        ? prev.selectedFeatures.filter(f => f !== featureId)
        : [...prev.selectedFeatures, featureId];

      // Always keep at least ATS optimization
      if (newFeatures.length === 0) {
        newFeatures.push(FeatureType.ATS_OPTIMIZATION);
      }

      return {
        ...prev,
        selectedFeatures: newFeatures
      };
    });
  };

  // Calculate total credits needed
  const totalCredits = uploadState.selectedFeatures.reduce((total, featureId) => {
    const feature = AVAILABLE_FEATURES.find(f => f.id === featureId);
    return total + (feature?.credits || 0);
  }, 0);

  // Check if user has sufficient credits
  const hasSufficientCredits = userProfile ? userProfile.credits >= totalCredits : false;

  // ============================================================================
  // Form Submission
  // ============================================================================

  const handleUpload = async () => {
    if (!uploadState.file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!user) {
      toast.error('Please sign in to upload your CV');
      return;
    }

    if (!hasSufficientCredits) {
      toast.error(`You need ${totalCredits} credits but only have ${userProfile?.credits || 0}`);
      return;
    }

    setUploadState(prev => ({ ...prev, isUploading: true, progress: 0, error: null }));

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('file', uploadState.file);
      formData.append('features', JSON.stringify(uploadState.selectedFeatures));
      formData.append('customizations', JSON.stringify(uploadState.customizations));

      // Upload with progress tracking
      const response = await uploadCV(formData, (progress) => {
        setUploadState(prev => ({ ...prev, progress }));
      });

      // Success handling
      setUploadState(prev => ({ ...prev, isUploading: false, progress: 100 }));
      toast.success(`CV upload successful! Processing job created: ${response.jobId}`);

      // Reset form
      setTimeout(() => {
        setUploadState({
          file: null,
          selectedFeatures: [FeatureType.ATS_OPTIMIZATION],
          customizations: {},
          isUploading: false,
          progress: 0,
          error: null
        });
      }, 2000);

      // Notify parent component
      onJobCreated?.(response.jobId, response);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: errorMessage
      }));

      toast.error(errorMessage);
      onError?.(errorMessage);
    }
  };

  const removeFile = () => {
    setUploadState(prev => ({ ...prev, file: null, error: null }));
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`cv-upload-container ${className}`}>
      {/* File Upload Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload your CV
        </label>

        {!uploadState.file ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragActive && !isDragReject ? 'border-blue-400 bg-blue-50' : ''}
              ${isDragReject ? 'border-red-400 bg-red-50' : ''}
              ${!isDragActive ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

            {isDragActive ? (
              <p className="text-blue-600">Drop your CV here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag and drop your CV here, or <span className="text-blue-600">browse</span>
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: PDF, DOCX, TXT, CSV (max 10MB)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{uploadState.file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(uploadState.file.size)}</p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-1 text-gray-400 hover:text-gray-600"
                disabled={uploadState.isUploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadState.isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Uploading...</span>
              <span className="text-sm text-gray-600">{uploadState.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {uploadState.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{uploadState.error}</p>
          </div>
        )}
      </div>

      {/* Feature Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Enhancement Features
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_FEATURES.map((feature) => {
            const isSelected = uploadState.selectedFeatures.includes(feature.id);
            const isPremium = feature.premium && userProfile?.subscription === 'free';

            return (
              <div
                key={feature.id}
                className={`
                  relative border rounded-lg p-4 cursor-pointer transition-all
                  ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                  ${isPremium ? 'opacity-60' : ''}
                `}
                onClick={() => !isPremium && handleFeatureToggle(feature.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {isSelected ? (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{feature.name}</h4>
                      <div className="flex items-center space-x-2">
                        {feature.premium && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Premium
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {feature.credits} credit{feature.credits !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>

                    {isPremium && (
                      <p className="text-xs text-yellow-600 mt-2">
                        Upgrade to Premium to access this feature
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Credits Summary */}
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Credits Required:</span>
            <span className="font-medium text-gray-900">{totalCredits}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-600">Your Available Credits:</span>
            <span className={`font-medium ${hasSufficientCredits ? 'text-green-600' : 'text-red-600'}`}>
              {userProfile?.credits || 0}
            </span>
          </div>

          {!hasSufficientCredits && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              Insufficient credits. Please purchase more credits or remove some features.
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleUpload}
        disabled={!uploadState.file || uploadState.isUploading || !hasSufficientCredits}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-all
          ${
            uploadState.file && hasSufficientCredits && !uploadState.isUploading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {uploadState.isUploading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Uploading...</span>
          </div>
        ) : (
          'Start CV Enhancement'
        )}
      </button>
    </div>
  );
};

export default CVUpload;