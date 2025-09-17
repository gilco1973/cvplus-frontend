/**
 * CV Analysis Results - Main orchestrator component
 * Displays comprehensive CV analysis results with interactive features
 * Follows CVPlus modular architecture with <200 lines per component
 */

import React, { useState, useCallback, useMemo } from 'react';

// Analysis sub-components
import {
  AnalysisOverview,
  SkillsAnalysisCard,
  PersonalityInsights,
  IndustryAlignment,
  ImprovementSuggestions,
  CompetitiveAnalysis,
  ExportActions,
  TabNavigation,
  AnalysisHeader,
  NextStepsActions
} from './results';

// Types
import type { CVAnalysisResults as CVAnalysisResultsType } from '../../../types/cv.types';
import type { Job } from '../../types/job';
import type { AnalysisResult } from '../../types/analysis';

export interface CVAnalysisResultsProps {
  job: Job;
  analysisResults: CVAnalysisResultsType;
  analysisResult: AnalysisResult;
  onExport?: (format: 'pdf' | 'json') => void;
  onShare?: () => void;
  onGenerateMultimedia?: (type: 'podcast' | 'video' | 'portfolio') => void;
  onApplyRecommendation?: (recommendationId: string) => void;
  className?: string;
}

/**
 * Main analysis results component - orchestrates all analysis displays
 * Shows ATS scores, personality insights, skills analysis, and recommendations
 */
export const CVAnalysisResults: React.FC<CVAnalysisResultsProps> = ({
  job,
  analysisResults,
  analysisResult,
  onExport,
  onShare,
  onGenerateMultimedia,
  onApplyRecommendation,
  className = ''
}) => {
  // UI state management
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'personality' | 'industry' | 'competitive'>('overview');
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    skills: true,
    personality: false,
    industry: false,
    competitive: false
  });

  // Computed values
  const overallScore = useMemo(() => analysisResults.overallScore, [analysisResults.overallScore]);
  const atsScore = useMemo(() => analysisResults.atsCompatibility.score, [analysisResults.atsCompatibility.score]);
  const highPriorityCount = useMemo(() =>
    analysisResults.suggestions.filter(s => s.priority >= 8).length,
    [analysisResults.suggestions]
  );

  // Section toggle handler
  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Tab navigation handler
  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab);
    setExpandedSections(prev => ({
      ...prev,
      [tab]: true
    }));
  }, []);

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <AnalysisOverview
            analysisResults={analysisResults}
            analysisResult={analysisResult}
            onApplyRecommendation={onApplyRecommendation}
            expanded={expandedSections.overview}
            onToggle={() => toggleSection('overview')}
          />
        );
      case 'skills':
        return (
          <SkillsAnalysisCard
            analysisResults={analysisResults}
            expanded={expandedSections.skills}
            onToggle={() => toggleSection('skills')}
          />
        );
      case 'personality':
        return (
          <PersonalityInsights
            analysisResults={analysisResults}
            expanded={expandedSections.personality}
            onToggle={() => toggleSection('personality')}
          />
        );
      case 'industry':
        return (
          <IndustryAlignment
            analysisResults={analysisResults}
            expanded={expandedSections.industry}
            onToggle={() => toggleSection('industry')}
          />
        );
      case 'competitive':
        return (
          <CompetitiveAnalysis
            analysisResults={analysisResults}
            expanded={expandedSections.competitive}
            onToggle={() => toggleSection('competitive')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`cv-analysis-results bg-gray-50 min-h-screen ${className}`}>
      {/* Header Section */}
      <AnalysisHeader
        job={job}
        overallScore={overallScore}
        atsScore={atsScore}
        highPriorityCount={highPriorityCount}
        onExport={onExport}
        onShare={onShare}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Content Sections */}
        <div className="space-y-8">
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        <NextStepsActions
          onGenerateMultimedia={onGenerateMultimedia}
        />
      </div>

      {/* Export Actions */}
      <ExportActions
        job={job}
        analysisResults={analysisResults}
        onExport={onExport}
        onShare={onShare}
      />
    </div>
  );
};

// Export types
export type { CVAnalysisResultsProps };