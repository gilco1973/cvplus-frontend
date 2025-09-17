/**
 * CVAnalysisResults Component Usage Examples
 * Demonstrates how to use the CVAnalysisResults component
 */

import React from 'react';
import { CVAnalysisResults } from './CVAnalysisResults';
import type { CVAnalysisResultsProps } from './CVAnalysisResults';

// Example data structures
const exampleJob = {
  id: 'job-123',
  userId: 'user-456',
  fileName: 'john-doe-cv.pdf',
  status: 'completed' as const,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-15T10:45:00Z')
};

const exampleAnalysisResults = {
  overallScore: 87,
  sectionScores: {
    experience: 92,
    skills: 85,
    education: 88,
    summary: 80,
    certifications: 90
  },
  keywords: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'AWS', 'Docker', 'Kubernetes', 'Project Management', 'Agile'
  ],
  suggestions: [
    {
      id: 'suggestion-1',
      type: 'improvement' as const,
      section: 'skills',
      title: 'Add Cloud Computing Certifications',
      description: 'Consider obtaining AWS or Azure certifications to strengthen your cloud computing profile. This is highly valued in your target industry.',
      actionable: true,
      priority: 8
    },
    {
      id: 'suggestion-2',
      type: 'warning' as const,
      section: 'experience',
      title: 'Quantify Your Achievements',
      description: 'Add specific metrics and numbers to your accomplishments. For example: "Increased team productivity by 25%" instead of "Improved team productivity".',
      actionable: true,
      priority: 7
    },
    {
      id: 'suggestion-3',
      type: 'critical' as const,
      section: 'format',
      title: 'Fix ATS Formatting Issues',
      description: 'Your CV has formatting that may not be properly parsed by Applicant Tracking Systems. Consider using standard section headers.',
      actionable: true,
      priority: 9
    }
  ],
  atsCompatibility: {
    score: 78,
    factors: [
      {
        name: 'Keyword Optimization',
        score: 85,
        weight: 35,
        description: 'Good use of relevant industry keywords'
      },
      {
        name: 'Format Structure',
        score: 70,
        weight: 25,
        description: 'Standard formatting with some ATS-unfriendly elements'
      },
      {
        name: 'Section Headers',
        score: 80,
        weight: 20,
        description: 'Most section headers are ATS-compatible'
      },
      {
        name: 'File Format',
        score: 90,
        weight: 20,
        description: 'PDF format is widely supported'
      }
    ],
    recommendations: [
      'Add more industry-specific keywords',
      'Use standard section headers like "Work Experience"',
      'Avoid complex formatting elements'
    ]
  },
  readabilityScore: 84
};

const exampleAnalysisResult = {
  jobId: 'job-123',
  recommendations: [
    {
      id: 'rec-1',
      title: 'Strengthen Technical Leadership Profile',
      description: 'Emphasize your experience leading technical teams and projects. This combination of technical expertise and leadership is highly sought after.',
      priority: 'high' as const,
      category: 'Experience',
      impact: 'Positions you for senior-level roles',
      estimatedImprovement: 12,
      selected: false
    },
    {
      id: 'rec-2',
      title: 'Add Industry Certifications',
      description: 'Consider obtaining relevant certifications in cloud computing, project management, or your specific technical domain.',
      priority: 'medium' as const,
      category: 'Credentials',
      impact: 'Validates expertise and commitment to professional growth',
      estimatedImprovement: 8,
      selected: false
    }
  ],
  atsAnalysis: {
    currentScore: 78,
    predictedScore: 89,
    issues: [
      {
        message: 'Some formatting elements may not be ATS-friendly',
        severity: 'warning' as const,
        category: 'Format'
      },
      {
        message: 'Could benefit from more industry keywords',
        severity: 'warning' as const,
        category: 'Keywords'
      }
    ],
    suggestions: [
      {
        reason: 'Adding cloud computing keywords will improve relevance',
        impact: 'Better matching for cloud-related positions',
        category: 'Keywords'
      },
      {
        reason: 'Standard section headers improve ATS parsing',
        impact: 'Ensures all content is properly categorized',
        category: 'Format'
      }
    ],
    overall: 78,
    passes: true
  },
  summary: {
    totalRecommendations: 2,
    highPriorityCount: 1,
    potentialScoreIncrease: 11
  },
  createdAt: '2024-01-15T10:45:00Z',
  updatedAt: '2024-01-15T10:45:00Z'
};

// Basic Usage Example
export const BasicUsage: React.FC = () => {
  const handleExport = (format: 'pdf' | 'json') => {
    console.log(`Exporting analysis as ${format}...`);
    // Implement export logic
  };

  const handleShare = () => {
    console.log('Sharing analysis results...');
    // Implement sharing logic
  };

  const handleGenerateMultimedia = (type: 'podcast' | 'video' | 'portfolio') => {
    console.log(`Generating ${type} content...`);
    // Implement multimedia generation
  };

  const handleApplyRecommendation = (recommendationId: string) => {
    console.log(`Applying recommendation: ${recommendationId}`);
    // Implement recommendation application
  };

  return (
    <CVAnalysisResults
      job={exampleJob}
      analysisResults={exampleAnalysisResults}
      analysisResult={exampleAnalysisResult}
      onExport={handleExport}
      onShare={handleShare}
      onGenerateMultimedia={handleGenerateMultimedia}
      onApplyRecommendation={handleApplyRecommendation}
    />
  );
};

// Minimal Usage Example (without optional handlers)
export const MinimalUsage: React.FC = () => {
  return (
    <CVAnalysisResults
      job={exampleJob}
      analysisResults={exampleAnalysisResults}
      analysisResult={exampleAnalysisResult}
    />
  );
};

// Custom Styled Example
export const CustomStyledUsage: React.FC = () => {
  return (
    <CVAnalysisResults
      job={exampleJob}
      analysisResults={exampleAnalysisResults}
      analysisResult={exampleAnalysisResult}
      className="max-w-6xl mx-auto shadow-lg"
      onExport={(format) => {
        // Custom export implementation
        if (format === 'pdf') {
          // Generate PDF with custom branding
        } else {
          // Export JSON with additional metadata
        }
      }}
    />
  );
};

// Integration with State Management Example
export const StateManagementExample: React.FC = () => {
  const [analysisData, setAnalysisData] = React.useState({
    job: exampleJob,
    analysisResults: exampleAnalysisResults,
    analysisResult: exampleAnalysisResult
  });

  const [appliedRecommendations, setAppliedRecommendations] = React.useState<Set<string>>(new Set());

  const handleApplyRecommendation = (recommendationId: string) => {
    setAppliedRecommendations(prev => new Set([...prev, recommendationId]));

    // Update the analysis result to reflect applied recommendation
    setAnalysisData(prev => ({
      ...prev,
      analysisResult: {
        ...prev.analysisResult,
        recommendations: prev.analysisResult.recommendations.map(rec =>
          rec.id === recommendationId ? { ...rec, selected: true } : rec
        )
      }
    }));
  };

  const handleExportWithTracking = async (format: 'pdf' | 'json') => {
    try {
      // Track export action
      console.log(`Export initiated: ${format}`);

      // Perform export
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation

      console.log(`Export completed: ${format}`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <CVAnalysisResults
      job={analysisData.job}
      analysisResults={analysisData.analysisResults}
      analysisResult={analysisData.analysisResult}
      onExport={handleExportWithTracking}
      onApplyRecommendation={handleApplyRecommendation}
    />
  );
};

// Error Handling Example
export const ErrorHandlingExample: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);

  const handleExportWithErrorHandling = async (format: 'pdf' | 'json') => {
    try {
      setError(null);
      // Simulate export process that might fail
      if (Math.random() > 0.7) {
        throw new Error(`Failed to export ${format}`);
      }
      console.log(`Successfully exported ${format}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      console.error('Export error:', errorMessage);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <CVAnalysisResults
      job={exampleJob}
      analysisResults={exampleAnalysisResults}
      analysisResult={exampleAnalysisResult}
      onExport={handleExportWithErrorHandling}
    />
  );
};

export default {
  BasicUsage,
  MinimalUsage,
  CustomStyledUsage,
  StateManagementExample,
  ErrorHandlingExample
};