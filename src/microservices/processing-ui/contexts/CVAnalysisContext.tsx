// CV Analysis context for managing analysis state across the microservice
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EventBus } from '@/core-ui/services/EventBus';
import { NotificationService } from '@/core-ui/services/NotificationService';
import { createLogger } from '@cvplus/logging';
import type {
  AnalysisState,
  AnalysisRequest,
  CVAnalysisResult,
  AnalysisProgress
} from '../types/analysis';

// Initialize logger for cv-processing-ui microservice
const logger = createLogger('cv-processing-ui:analysis');

interface CVAnalysisContextValue extends AnalysisState {
  startAnalysis: (request: AnalysisRequest) => Promise<CVAnalysisResult[]>;
  stopAnalysis: () => void;
  clearResults: () => void;
  clearError: () => void;
  retryAnalysis: () => Promise<void>;
}

const initialState: AnalysisState = {
  isAnalyzing: false,
  progress: null,
  results: [],
  error: null,
  lastAnalyzed: null
};

const CVAnalysisContext = createContext<CVAnalysisContextValue | undefined>(undefined);

interface CVAnalysisProviderProps {
  children: ReactNode;
}

export function CVAnalysisProvider({ children }: CVAnalysisProviderProps) {
  const [state, setState] = useState<AnalysisState>(initialState);
  const [lastRequest, setLastRequest] = useState<AnalysisRequest | null>(null);

  // Listen for analysis events from backend
  useEffect(() => {
    const unsubscribeProgress = EventBus.on('cv-analysis-progress', (event) => {
      const { progress } = event.payload;
      setState(prev => ({
        ...prev,
        progress
      }));
    });

    const unsubscribeCompleted = EventBus.on('cv-analysis-completed', (event) => {
      const { cvId, results } = event.payload;
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: null,
        results,
        lastAnalyzed: new Date()
      }));
      NotificationService.success('CV analysis completed successfully!', {
        microservice: 'processing-ui'
      });
      logger.info('CV analysis completed', { cvId, resultsCount: results.length });
    });

    const unsubscribeFailed = EventBus.on('cv-analysis-failed', (event) => {
      const { cvId, error } = event.payload;
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: null,
        error: error.message || 'Analysis failed'
      }));
      NotificationService.error('CV analysis failed', {
        microservice: 'processing-ui'
      });
      logger.error('CV analysis failed', { cvId, error });
    });

    return () => {
      unsubscribeProgress();
      unsubscribeCompleted();
      unsubscribeFailed();
    };
  }, []);

  const startAnalysis = async (request: AnalysisRequest): Promise<CVAnalysisResult[]> => {
    try {
      setState(prev => ({
        ...prev,
        isAnalyzing: true,
        progress: {
          currentStep: 'parsing',
          completedSteps: [],
          totalSteps: 8,
          progress: 0,
          estimatedTimeRemaining: 30
        },
        error: null
      }));

      setLastRequest(request);

      logger.info('Starting CV analysis', {
        cvId: request.cvId,
        analysisTypes: request.analysisTypes
      });

      // TODO: Integrate with @cvplus/processing backend service
      await simulateAnalysis();

      // Mock analysis results
      const mockResults: CVAnalysisResult[] = request.analysisTypes.map((type, index) => ({
        id: `analysis_${Date.now()}_${index}`,
        cvId: request.cvId,
        type,
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        recommendations: [
          {
            id: `rec_${Date.now()}_${index}`,
            type: 'content_improvement',
            priority: 'medium',
            title: `Improve ${type.replace('_', ' ')}`,
            description: `Consider enhancing your ${type.replace('_', ' ')} to increase impact.`,
            impact: 'moderate',
            category: 'content',
            actionable: true,
            suggestedChanges: ['Add more specific examples', 'Use action verbs'],
            examples: ['Led a team of 5 engineers', 'Increased sales by 25%']
          }
        ],
        atsCompatibility: {
          overall: Math.floor(Math.random() * 30) + 70,
          formatting: Math.floor(Math.random() * 20) + 80,
          keywords: Math.floor(Math.random() * 25) + 75,
          structure: Math.floor(Math.random() * 15) + 85,
          content: Math.floor(Math.random() * 30) + 70,
          details: {
            keywordDensity: Math.random() * 0.05 + 0.02,
            standardSections: ['experience', 'education', 'skills'],
            missingSections: [],
            formattingIssues: [],
            readabilityScore: Math.floor(Math.random() * 20) + 80,
            lengthScore: Math.floor(Math.random() * 15) + 85
          }
        },
        timestamp: new Date(),
        metadata: {
          processingTime: Math.floor(Math.random() * 15000) + 5000,
          algorithmVersion: '2.1.0',
          confidence: Math.random() * 0.3 + 0.7,
          dataPoints: Math.floor(Math.random() * 50) + 20,
          benchmarkData: request.includeBenchmarking ? {
            industry: request.targetIndustry || 'technology',
            role: request.targetRole || 'software engineer',
            experienceLevel: 'mid',
            averageScore: Math.floor(Math.random() * 20) + 70,
            topPercentile: Math.floor(Math.random() * 10) + 90,
            sampleSize: Math.floor(Math.random() * 500) + 100
          } : undefined
        }
      }));

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: null,
        results: mockResults,
        lastAnalyzed: new Date()
      }));

      // Emit analysis completed event
      EventBus.emit({
        type: 'cv-analysis-completed',
        source: 'processing-ui',
        target: 'all',
        payload: { cvId: request.cvId, results: mockResults }
      });

      logger.info('CV analysis completed successfully', {
        cvId: request.cvId,
        resultsCount: mockResults.length
      });

      return mockResults;
    } catch (error) {
      logger.error('CV analysis failed', error);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: null,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }));
      throw error;
    }
  };

  const simulateAnalysis = async (): Promise<void> => {
    const steps = [
      'parsing',
      'content_extraction',
      'structure_analysis',
      'keyword_analysis',
      'ats_scoring',
      'recommendation_generation',
      'benchmarking',
      'finalization'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        progress: {
          currentStep: steps[i] as any,
          completedSteps: steps.slice(0, i) as any[],
          totalSteps: steps.length,
          progress: Math.round((i + 1) / steps.length * 100),
          estimatedTimeRemaining: (steps.length - i - 1) * 1
        }
      }));
    }
  };

  const stopAnalysis = () => {
    setState(prev => ({
      ...prev,
      isAnalyzing: false,
      progress: null
    }));
    logger.info('CV analysis stopped by user');
  };

  const clearResults = () => {
    setState(prev => ({
      ...prev,
      results: [],
      lastAnalyzed: null
    }));
    logger.info('CV analysis results cleared');
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const retryAnalysis = async (): Promise<void> => {
    if (lastRequest) {
      await startAnalysis(lastRequest);
    }
  };

  const value: CVAnalysisContextValue = {
    ...state,
    startAnalysis,
    stopAnalysis,
    clearResults,
    clearError,
    retryAnalysis
  };

  return (
    <CVAnalysisContext.Provider value={value}>
      {children}
    </CVAnalysisContext.Provider>
  );
}

export function useCVAnalysis(): CVAnalysisContextValue {
  const context = useContext(CVAnalysisContext);
  if (!context) {
    throw new Error('useCVAnalysis must be used within a CVAnalysisProvider');
  }
  return context;
}