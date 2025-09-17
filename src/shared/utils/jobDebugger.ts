/**
 * Job debugging utility to help diagnose CV display issues
 */
import type { Job } from '../types/cv';

export const debugJobState = (job: Job | null, context = 'UNKNOWN') => {
  if (!job) {
    console.warn(`🐛 [${context}] No job data available`);
    return;
  }

  const debugInfo = {
    context,
    jobId: job.id,
    status: job.status,
    generatedCV: {
      exists: !!job.generatedCV,
      hasHtml: !!job.generatedCV?.html,
      hasHtmlUrl: !!job.generatedCV?.htmlUrl,
      hasPdfUrl: !!job.generatedCV?.pdfUrl,
      htmlLength: job.generatedCV?.html?.length || 0,
      htmlUrl: job.generatedCV?.htmlUrl,
      keys: job.generatedCV ? Object.keys(job.generatedCV) : []
    },
    enhancedFeatures: {
      exists: !!job.enhancedFeatures,
      count: job.enhancedFeatures ? Object.keys(job.enhancedFeatures).length : 0,
      keys: job.enhancedFeatures ? Object.keys(job.enhancedFeatures) : [],
      statuses: job.enhancedFeatures ? 
        Object.entries(job.enhancedFeatures).map(([key, value]: [string, any]) => 
          ({ feature: key, status: value.status, progress: value.progress })
        ) : []
    },
    selectedFeatures: job.selectedFeatures || [],
    timestamps: {
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      generationStartedAt: job.generationStartedAt,
      completedAt: job.completedAt
    },
    allKeys: Object.keys(job)
  };

  console.warn(`🐛 [${context}] Job Debug Info:`, debugInfo);
  
  // Detect potential issues
  const issues = [];
  
  if (job.status === 'completed' && !job.generatedCV) {
    issues.push('Job marked as completed but no generatedCV data');
  }
  
  if (job.status === 'completed' && job.generatedCV && !job.generatedCV.html && !job.generatedCV.htmlUrl) {
    issues.push('Job completed with generatedCV but no HTML content or URL');
  }
  
  if (job.enhancedFeatures) {
    const featuresComplete = Object.values(job.enhancedFeatures).every(
      (feature: any) => feature.status === 'completed' || feature.status === 'failed' || feature.status === 'skipped'
    );
    if (!featuresComplete && job.status === 'completed') {
      issues.push('Job marked as completed but some features are still processing');
    }
  }
  
  if (issues.length > 0) {
    console.warn(`⚠️ [${context}] Potential issues detected:`, issues);
  } else {
    console.warn(`✅ [${context}] Job state looks healthy`);
  }
  
  return debugInfo;
};

export const shouldDisplayCV = (job: Job | null): boolean => {
  if (!job) return false;
  
  const hasContent = !!(job.generatedCV?.html || job.generatedCV?.htmlUrl);
  const isCompleted = job.status === 'completed';
  const hasGeneratedCV = !!job.generatedCV;
  
  console.warn(`🤔 [CV-DISPLAY-CHECK] Should display CV?`, {
    hasContent,
    isCompleted,
    hasGeneratedCV,
    result: hasContent && (isCompleted || hasGeneratedCV)
  });
  
  return hasContent && (isCompleted || hasGeneratedCV);
};