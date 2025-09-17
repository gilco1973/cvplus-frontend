/**
 * CVPreviewPageNew - Pure React Implementation
 * 
 * This component replaces the problematic HTML-generation + React hydration system
 * with a clean React SPA that consumes JSON APIs directly.
 * 
 * Key Features:
 * - Uses useCVData hook for main CV data
 * - Uses useEnhancedFeatures hook for interactive components  
 * - No HTML hydration dependencies
 * - Proper loading states and error boundaries
 * - Progressive loading strategy
 */

import React, { useMemo, Suspense, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// SEO meta tags handled by document.title and meta tags
import { ArrowLeft, Download, Share2, Loader2, AlertCircle, Eye, GitCompare } from 'lucide-react';
import toast from 'react-hot-toast';

// Custom hooks
import { useJobEnhanced } from '../hooks/useJobEnhanced';
import { useAuth } from '../contexts/AuthContext';
// Placeholder handling - only for user-provided replacements
import { PlaceholderReplacements } from '../utils/placeholderReplacer';
import { PlaceholderEditingProvider } from '../contexts/PlaceholderEditingContext';
import { EditablePlaceholderWrapper } from '../utils/editablePlaceholderUtils';

// Layout and common components
import { Header } from '../components/Header';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { designSystem } from '../config/designSystem';

// Section components (to be created)
import { CVPersonalInfo } from './components/CVPersonalInfo';
import { CVExperience } from './components/CVExperience';
import { CVSkills } from './components/CVSkills';
import { CVEducation } from './components/CVEducation';

// Loading and layout components
import { CVPreviewSkeleton } from '../components/common/CVPreviewSkeleton';
import { CVPreviewLayout } from '../components/common/CVPreviewLayout';

// Types
import type { Job } from '../services/cvService';

// Handler for updating CV content when placeholders are edited
const handleContentUpdate = async (newContent: string, fieldPath: string, section: string) => {
  try {
    console.log('Content updated:', { newContent, fieldPath, section });
    // TODO: Implement real-time CV update via Firebase function
    // This will call the backend to update the CV data in the database
  } catch (error) {
    console.error('Failed to update CV content:', error);
    toast.error('Failed to save changes');
  }
};

interface CVPreviewPageNewProps {
  className?: string;
}

export const CVPreviewPageNew: React.FC<CVPreviewPageNewProps> = ({ className = '' }) => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'single' | 'comparison'>('single');

  // Enhanced job hook with better error handling and performance
  const {
    job,
    loading,
    error,
    lastUpdate,
    subscriptionActive,
    retryCount,
    refresh,
    forceRefresh
  } = useJobEnhanced(jobId || '', {
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 2000,
    enableLogging: process.env.NODE_ENV === 'development',
    pollWhenInactive: true,
    pollInterval: 30000
  });

  // Memoized data extraction for both original and enhanced CV
  const cvData = useMemo(() => {
    if (!job?.parsedData) return null;
    
    // Ensure we have safe default values for all fields
    const originalData = {
      personalInfo: job.parsedData.personalInfo || {},
      experience: Array.isArray(job.parsedData.experience) ? job.parsedData.experience : [],
      skills: job.parsedData.skills || {},
      education: Array.isArray(job.parsedData.education) ? job.parsedData.education : [],
      summary: job.parsedData.summary || '',
    };
    
    // Get enhanced data with sessionStorage fallback for improved CV
    let enhancedSourceData = null;
    
    // Priority 1: Use job.improvedCV from database
    if (job.improvedCV) {
      enhancedSourceData = job.improvedCV;
      console.log('Using improved CV from database');
    } 
    // Priority 2: Check sessionStorage for recent improvements
    else if (jobId) {
      try {
        const sessionStorageKey = `improvements-${jobId}`;
        const storedImprovements = sessionStorage.getItem(sessionStorageKey);
        if (storedImprovements) {
          enhancedSourceData = JSON.parse(storedImprovements);
          console.log('Using improved CV from sessionStorage fallback');
        }
      } catch (error) {
        console.warn('Failed to parse improved CV from sessionStorage:', error);
      }
    }
    
    // Keep placeholders intact - do NOT auto-replace with fake data
    // User will provide real data through placeholder input forms
    const userPlaceholderReplacements: PlaceholderReplacements = {}; // TODO: Get from user input state
    
    // Process text keeping placeholders intact unless user provided real data
    const processTextWithPlaceholders = (text: string): string => {
      if (!text) return text;
      // Keep original text with placeholders - do NOT auto-generate fake content
      return text;
    };
    
    const processExperienceWithPlaceholders = (experience: any[]): any[] => {
      if (!Array.isArray(experience)) return [];
      return experience.map(exp => ({
        ...exp,
        description: processTextWithPlaceholders(exp.description || ''),
        achievements: Array.isArray(exp.achievements) 
          ? exp.achievements.map(processTextWithPlaceholders)
          : exp.achievements
      }));
    };
    
    // 🚨 CRITICAL FIX: Don't fallback to originalData when no enhanced data exists
    // This was causing identical before/after comparison (both pointing to same object)
    const enhancedData = enhancedSourceData ? {
      personalInfo: enhancedSourceData.personalInfo || {},
      experience: processExperienceWithPlaceholders(enhancedSourceData.experience || []),
      skills: enhancedSourceData.skills || {},
      education: Array.isArray(enhancedSourceData.education) ? enhancedSourceData.education : [],
      summary: processTextWithPlaceholders(enhancedSourceData.summary || ''),
    } : null; // Return null instead of originalData to indicate no enhanced version exists
    
    // Enhanced debug logging to help track the data source and comparison
    if (process.env.NODE_ENV === 'development') {
      console.log('[CVPreview] Data sources:', {
        hasJobImprovedCV: !!job?.improvedCV,
        hasSessionStorageImprovedCV: !!enhancedSourceData && !job?.improvedCV,
        enhancedDataSource: enhancedSourceData ? 'enhanced' : 'none',
        originalSummaryLength: originalData.summary.length,
        enhancedSummaryLength: enhancedData?.summary?.length || 0,
        summaryHasPlaceholders: enhancedData?.summary?.includes('[') || false,
        originalSummaryPreview: originalData.summary.substring(0, 100) + '...',
        enhancedSummaryPreview: enhancedData?.summary?.substring(0, 100) + '...' || 'No enhanced data',
        summariesAreDifferent: enhancedData ? (originalData.summary !== enhancedData.summary) : false,
        hasEnhancedData: !!enhancedData
      });
    }
    
    return {
      original: originalData,
      enhanced: enhancedData,
      enhancedFeatures: Array.isArray(job.enhancedFeatures) ? job.enhancedFeatures : [],
      metadata: {
        jobId: job.id || '',
        status: job.status || 'unknown',
        lastUpdated: job.updatedAt || null,
        userId: job.userId || ''
      }
    };
  }, [job, jobId]);
  
  // Check if improvements are available (from database or sessionStorage)
  const hasImprovements = useMemo(() => {
    if (job?.improvedCV && job?.parsedData) {
      return true;
    }
    
    // Check sessionStorage fallback
    if (jobId && job?.parsedData) {
      try {
        const storedImprovements = sessionStorage.getItem(`improvements-${jobId}`);
        return !!storedImprovements;
      } catch (error) {
        console.warn('Failed to check sessionStorage for improvements:', error);
        return false;
      }
    }
    
    return false;
  }, [job, jobId]);

  // Authorization check
  const isAuthorized = useMemo(() => {
    if (!job || !user) return false;
    return job.userId === user.uid;
  }, [job, user]);

  // Update document title and meta tags when CV data is available
  // MOVED TO TOP: This hook must be called on every render, before any early returns
  React.useEffect(() => {
    if (cvData && cvData.enhanced && cvData.enhanced.personalInfo) {
      const name = cvData.enhanced.personalInfo.name;
      const title = name 
        ? `${name} - Professional CV | CVPlus` 
        : 'Professional CV | CVPlus';
      document.title = title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `Professional CV for ${name || 'career professional'} with enhanced AI-powered features and interactive elements.`
        );
      }
    }
  }, [cvData]);

  // Handle loading state
  if (loading) {
    return (
      <div className={`min-h-screen bg-neutral-900 ${className}`}>
        <Header 
          currentPage="preview" 
          jobId={jobId}
          title="CV Preview"
          subtitle="Loading your enhanced CV preview..."
          variant="dark"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <Loader2 className={`w-8 h-8 animate-spin text-${designSystem.colors.primary[400]} mx-auto mb-4`} />
              <h2 className={`text-xl font-semibold ${designSystem.accessibility.contrast.text.primary} mb-2`}>Loading CV Preview</h2>
              <p className={designSystem.accessibility.contrast.text.secondary}>Preparing your enhanced CV preview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error states
  if (error) {
    return (
      <div className={`min-h-screen bg-neutral-900 ${className}`}>
        <Header 
          currentPage="preview" 
          jobId={jobId}
          title="CV Preview"
          subtitle="Error loading preview"
          variant="dark"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`${designSystem.components.status.error} rounded-lg p-6`}>
            <div className="text-center">
              <div className={`text-${designSystem.colors.semantic.error[400]} text-xl mb-4`}>⚠️</div>
              <h2 className={`text-xl font-semibold ${designSystem.accessibility.contrast.text.primary} mb-2`}>Error Loading Preview</h2>
              <p className={`${designSystem.accessibility.contrast.text.secondary} mb-6`}>{error}</p>
              <button
                onClick={refresh}
                className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.md} inline-flex items-center space-x-2`}
              >
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle missing job
  if (!job) {
    return (
      <div className={`min-h-screen bg-neutral-900 ${className}`}>
        <Header 
          currentPage="preview" 
          jobId={jobId}
          title="CV Preview"
          subtitle="Job not found"
          variant="dark"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className={`text-xl font-semibold ${designSystem.accessibility.contrast.text.primary} mb-2`}>Job Not Found</h2>
            <p className={`${designSystem.accessibility.contrast.text.secondary} mb-6`}>The requested CV preview could not be found.</p>
            <button
              onClick={() => navigate('/')}
              className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.md} inline-flex items-center space-x-2`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle authorization
  if (!isAuthorized) {
    return (
      <div className={`min-h-screen bg-neutral-900 ${className}`}>
        <Header 
          currentPage="preview" 
          jobId={jobId}
          title="CV Preview"
          subtitle="Access denied"
          variant="dark"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`${designSystem.components.status.error} rounded-lg p-6`}>
            <div className="text-center">
              <div className={`text-${designSystem.colors.semantic.error[400]} text-xl mb-4`}>⚠️</div>
              <h2 className={`text-xl font-semibold ${designSystem.accessibility.contrast.text.primary} mb-2`}>Access Denied</h2>
              <p className={`${designSystem.accessibility.contrast.text.secondary} mb-6`}>
                You don't have permission to view this CV preview.
              </p>
              <button
                onClick={() => navigate('/')}
                className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.md} inline-flex items-center space-x-2`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle job not ready for preview
  if (job.status !== 'analyzed' && job.status !== 'completed') {
    const statusMessages = {
      pending: 'Your CV is being processed...',
      processing: 'Analyzing your CV with AI...',
      failed: 'CV processing failed. Please try uploading again.'
    };

    const statusMessage = statusMessages[job.status as keyof typeof statusMessages] || 'Processing...';

    if (job.status === 'processing' || job.status === 'pending') {
      navigate(`/process/${jobId}`);
      return null;
    }

    if (!job.parsedData) {
      navigate(`/analysis/${jobId}`);
      return null;
    }

    return (
      <div className={`min-h-screen bg-neutral-900 ${className}`}>
        <Header 
          currentPage="preview" 
          jobId={jobId}
          title="CV Preview"
          subtitle="Processing CV..."
          variant="dark"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Loader2 className={`w-12 h-12 text-${designSystem.colors.primary[400]} mx-auto mb-4 animate-spin`} />
            <h2 className={`text-xl font-semibold ${designSystem.accessibility.contrast.text.primary} mb-2`}>Processing CV</h2>
            <p className={`${designSystem.accessibility.contrast.text.secondary} mb-6`}>{statusMessage}</p>
            <button
              onClick={forceRefresh}
              className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.md} inline-flex items-center space-x-2`}
            >
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle missing CV data
  if (!cvData) {
    return (
      <div className={`min-h-screen bg-neutral-900 ${className}`}>
        <Header 
          currentPage="preview" 
          jobId={jobId}
          title="CV Preview"
          subtitle="No data available"
          variant="dark"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className={`w-12 h-12 text-${designSystem.colors.neutral[400]} mx-auto mb-4`} />
            <h2 className={`text-xl font-semibold ${designSystem.accessibility.contrast.text.primary} mb-2`}>No CV Data Available</h2>
            <p className={`${designSystem.accessibility.contrast.text.secondary} mb-6`}>
              The CV data couldn't be loaded. Please try refreshing the page.
            </p>
            <button
              onClick={refresh}
              className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.md} inline-flex items-center space-x-2`}
            >
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Action handlers
  const handleDownload = async () => {
    try {
      // TODO: Implement PDF download functionality
      toast.success('PDF download started!');
    } catch (error) {
      toast.error('Failed to download PDF');
      console.error('Download error:', error);
    }
  };

  const handleShare = async () => {
    try {
      const name = cvData?.enhanced?.personalInfo?.name || 'Professional';
      const shareData = {
        title: `${name} CV`,
        text: 'Check out my professional CV created with CVPlus AI',
        url: window.location.href
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('CV shared successfully!');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('CV link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share CV');
      console.error('Share error:', error);
    }
  };

  const handleBackToAnalysis = () => {
    navigate(`/analysis/${jobId}`);
  };
  
  const handleContinueToFeatures = () => {
    navigate(`/customize/${jobId}`);
  };

  // Main render
  return (
    <div className={`min-h-screen bg-neutral-900 ${className}`}>
      <Header 
        currentPage="preview" 
        jobId={jobId}
        title="CV Preview"
        subtitle="Review your enhanced CV content before selecting features"
        variant="dark"
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Preview Controls */}
        <div className={`${designSystem.components.card.base} ${designSystem.components.card.variants.elevated} ${designSystem.components.card.padding.md} mb-6 shadow-xl`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${designSystem.accessibility.contrast.text.primary} mb-2`}>CV Preview</h1>
              <p className={designSystem.accessibility.contrast.text.secondary}>
                {viewMode === 'single' ? 
                  'Showing your enhanced CV with applied text improvements.' :
                  'Side-by-side comparison of your original and enhanced CV content.'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Mode Selector */}
              {hasImprovements && (
                <div className="bg-neutral-700 p-1 rounded-lg flex">
                  <button
                    onClick={() => setViewMode('single')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-all flex items-center space-x-2 ${
                      viewMode === 'single'
                        ? 'bg-neutral-600 text-white shadow-sm'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Single View</span>
                    <span className="sm:hidden">Single</span>
                  </button>
                  <button
                    onClick={() => setViewMode('comparison')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-all flex items-center space-x-2 ${
                      viewMode === 'comparison'
                        ? 'bg-neutral-600 text-white shadow-sm'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    <GitCompare className="w-4 h-4" />
                    <span className="hidden sm:inline">Comparison View</span>
                    <span className="sm:hidden">Compare</span>
                  </button>
                </div>
              )}
              <button
                onClick={handleBackToAnalysis}
                className={`${designSystem.components.button.base} ${designSystem.components.button.variants.secondary.default} ${designSystem.components.button.sizes.md}`}
              >
                Back to Analysis
              </button>
              <button
                onClick={handleContinueToFeatures}
                className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.md} inline-flex items-center space-x-2`}
              >
                <span>Continue to Features</span>
              </button>
            </div>
          </div>
        </div>

        {/* CV Preview Content */}
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('CV Preview Error:', error, errorInfo);
            toast.error('Error loading CV preview');
          }}
        >
          <PlaceholderEditingProvider jobId={jobId || ''}>
            <Suspense fallback={<CVPreviewSkeleton />}>
            {viewMode === 'single' ? (
              /* Single View - Enhanced CV Only */
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-8 space-y-8">
                  <CVPersonalInfo 
                    data={cvData.enhanced?.personalInfo || cvData.original.personalInfo}
                    jobId={jobId}
                    metadata={cvData.metadata}
                  />

                  {(cvData.enhanced?.summary || cvData.original.summary) && (
                    <section className="border-b border-gray-200 pb-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h2>
                      <div className="text-gray-700 leading-relaxed">
                        <EditablePlaceholderWrapper
                          content={cvData.enhanced?.summary || cvData.original.summary}
                          onContentUpdate={(newContent) => handleContentUpdate(newContent, 'summary', 'professional_summary')}
                          fieldPath="summary"
                          section="professional_summary"
                          fallbackToStatic={true}
                        />
                      </div>
                    </section>
                  )}

                  <CVExperience 
                    data={cvData.enhanced?.experience || cvData.original.experience}
                    jobId={jobId}
                    onContentUpdate={handleContentUpdate}
                  />

                  <CVSkills 
                    data={cvData.enhanced?.skills || cvData.original.skills}
                    jobId={jobId}
                  />

                  <CVEducation 
                    data={cvData.enhanced?.education || cvData.original.education}
                    jobId={jobId}
                  />
                </div>
              </div>
            ) : (
              /* Comparison View - Side by Side */
              <div className="space-y-6">
                {/* Development Debug Panel for Comparison */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-bold text-black mb-2">🔍 Debug: Comparison Data</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-black">Original Summary (first 200 chars):</strong>
                        <div className="bg-white p-2 rounded mt-1 max-h-20 overflow-auto text-black border">
                          {cvData.original.summary.substring(0, 200)}...
                        </div>
                      </div>
                      <div>
                        <strong className="text-black">Enhanced Summary (first 200 chars):</strong>
                        <div className="bg-white p-2 rounded mt-1 max-h-20 overflow-auto text-black border">
                          {cvData.enhanced?.summary?.substring(0, 200) + '...' || 'No enhanced data available'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm space-y-2">
                      <div>
                        <strong className="text-black">Are they different?</strong> 
                        <span className="text-black font-bold">
                          {cvData.enhanced ? 
                            (cvData.original.summary !== cvData.enhanced.summary ? '✅ YES' : '❌ NO - IDENTICAL') : 
                            '⚠️ NO ENHANCED DATA - Apply improvements first'
                          }
                        </span>
                      </div>
                      <div>
                        <strong className="text-black">Character count:</strong> 
                        <span className="text-black">
                          Original: {cvData.original.summary.length} | Enhanced: {cvData.enhanced?.summary?.length || 0}
                        </span>
                      </div>
                      <div>
                        <strong className="text-black">Has placeholders:</strong> 
                        <span className="text-black">
                          {cvData.enhanced?.summary?.includes('[') ? '✅ YES ([INSERT] placeholders found)' : '❌ NO'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comparison Headers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-orange-800">Before (Original)</h3>
                    </div>
                    <p className="text-sm text-orange-600 mt-1">Your original CV content</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-green-800">After (Enhanced)</h3>
                    </div>
                    <p className="text-sm text-green-600 mt-1">AI-enhanced and improved content</p>
                  </div>
                </div>

                {/* Personal Information Comparison */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                    <div className="p-6">
                      <CVPersonalInfo 
                        data={cvData.original.personalInfo}
                        jobId={jobId}
                        metadata={cvData.metadata}
                      />
                    </div>
                    <div className="p-6">
                      <CVPersonalInfo 
                        data={cvData.enhanced?.personalInfo || cvData.original.personalInfo}
                        jobId={jobId}
                        metadata={cvData.metadata}
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Summary Comparison */}
                {(cvData.original.summary || cvData.enhanced?.summary) && (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <h2 className="text-lg font-semibold text-gray-900">Professional Summary</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                      <div className="p-6">
                        {cvData.original.summary ? (
                          <p className="text-gray-700 leading-relaxed">{cvData.original.summary}</p>
                        ) : (
                          <p className="text-gray-400 italic">No summary provided</p>
                        )}
                      </div>
                      <div className="p-6">
                        {cvData.enhanced?.summary ? (
                          <div className="text-gray-700 leading-relaxed">
                            <EditablePlaceholderWrapper
                              content={cvData.enhanced.summary}
                              onContentUpdate={(newContent) => handleContentUpdate(newContent, 'summary', 'professional_summary')}
                              fieldPath="summary"
                              section="professional_summary"
                              fallbackToStatic={true}
                            />
                          </div>
                        ) : (
                          <p className="text-gray-400 italic">No enhanced summary available - Apply improvements first</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Experience Comparison */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Professional Experience</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                    <div className="p-6">
                      <CVExperience 
                        data={cvData.original.experience}
                        jobId={jobId}
                      />
                    </div>
                    <div className="p-6">
                      <CVExperience 
                        data={cvData.enhanced?.experience || cvData.original.experience}
                        jobId={jobId}
                        onContentUpdate={handleContentUpdate}
                      />
                    </div>
                  </div>
                </div>

                {/* Skills Comparison */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                    <div className="p-6">
                      <CVSkills 
                        data={cvData.original.skills}
                        jobId={jobId}
                      />
                    </div>
                    <div className="p-6">
                      <CVSkills 
                        data={cvData.enhanced?.skills || cvData.original.skills}
                        jobId={jobId}
                      />
                    </div>
                  </div>
                </div>

                {/* Education Comparison */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                    <div className="p-6">
                      <CVEducation 
                        data={cvData.original.education}
                        jobId={jobId}
                      />
                    </div>
                    <div className="p-6">
                      <CVEducation 
                        data={cvData.enhanced?.education || cvData.original.education}
                        jobId={jobId}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            </Suspense>
          </PlaceholderEditingProvider>
        </ErrorBoundary>

        {/* Bottom Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>
                {viewMode === 'single' ? 
                  'Your CV preview shows enhanced content with applied text improvements.' :
                  'Compare your original and enhanced CV side-by-side to see the improvements.'
                }
              </p>
              <p className="mt-1">Ready to select interactive features for your final CV?</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToAnalysis}
                className={`${designSystem.components.button.base} ${designSystem.components.button.variants.secondary.default} ${designSystem.components.button.sizes.md} !border-gray-300 !text-gray-600 hover:!bg-gray-50`}
              >
                Modify Text Improvements
              </button>
              <button
                onClick={handleContinueToFeatures}
                className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.md} flex items-center space-x-2`}
              >
                <span>Continue to Features</span>
                <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">
                  Next Step
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default CVPreviewPageNew;