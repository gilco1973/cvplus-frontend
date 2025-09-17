import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, 
  GitCompare, 
  ChevronRight, 
  Filter,
  Plus,
  TrendingUp
} from 'lucide-react';
import { 
  useCVComparison, 
  useFilteredSections,
  ComparisonViewMode 
} from '../../hooks/cv-preview/useCVComparison';
import { SideBySideDiff, DiffStats, CompactDiff } from './DiffRenderer';
import { MobileComparisonView, MobileComparisonToggle } from './MobileComparisonView';
import { getSectionDisplayName, CVComparison, SectionComparison } from '../../utils/cv-comparison/diffUtils';
import { ComparisonStats } from '../../types/cv-preview';

// CV Data structure - using unknown for safety
type CVData = unknown;

export interface CVComparisonViewProps {
  originalData: CVData;
  improvedData: CVData | null;
  comparisonReport?: {
    beforeAfter: Array<{
      section: string;
      before: string;
      after: string;
      improvement: string;
    }>;
  };
  children: React.ReactNode; // The actual CV preview content
  className?: string;
}

/**
 * Main CV Comparison View component that wraps the CV preview with comparison functionality
 */
export const CVComparisonView: React.FC<CVComparisonViewProps> = ({
  originalData,
  improvedData,
  comparisonReport,
  children,
  className = ''
}) => {
  const { state, actions } = useCVComparison(originalData, improvedData, comparisonReport);
  const filteredSections = useFilteredSections(state.comparison, state.showOnlyChanged);
  
  // Log comparison data for debugging
  useEffect(() => {
    console.log('[CVComparisonView] Component rendered with:', {
      hasOriginalData: !!originalData,
      hasImprovedData: !!improvedData,
      hasComparisonReport: !!comparisonReport,
      comparisonSections: state.comparison?.sections?.length || 0,
      filteredSections: filteredSections.length
    });
  }, [originalData, improvedData, comparisonReport, state.comparison, filteredSections]);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileComparison, setShowMobileComparison] = useState(false);

  // Enhanced comparison detection - use comparisonReport if available, fallback to computed comparison
  const hasComparison = useMemo(() => {
    const hasReport = comparisonReport?.beforeAfter && comparisonReport.beforeAfter.length > 0;
    const hasComputed = state.comparison && state.comparison.totalChanges > 0;
    console.log('[CVComparisonView] Comparison data check:', { hasReport, hasComputed, comparisonReport });
    return hasReport || hasComputed;
  }, [comparisonReport, state.comparison]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mobile comparison view
  if (isMobile && hasComparison && showMobileComparison) {
    return (
      <div className={`cv-comparison-wrapper ${className}`}>
        <MobileComparisonView 
          sections={filteredSections}
          className="h-full"
        />
        <MobileComparisonToggle
          hasComparison={hasComparison}
          isComparisonView={true}
          onToggle={() => setShowMobileComparison(false)}
        />
      </div>
    );
  }

  return (
    <div className={`cv-comparison-wrapper ${className}`}>
      {/* Comparison Controls - Hidden on mobile */}
      {hasComparison && !isMobile && (
        <ComparisonControls
          viewMode={state.viewMode}
          stats={state.stats}
          showOnlyChanged={state.showOnlyChanged}
          onViewModeChange={actions.setViewMode}
          onToggleFilter={actions.toggleShowOnlyChanged}
        />
      )}

      {/* Content Area */}
      <div>
        {state.viewMode === 'single' || isMobile ? (
          <div className="animate-fade-in" key="single-view">
            {children}
          </div>
        ) : (
          <div className="animate-fade-in space-y-6" key="comparison-view">
            {/* Comparison Summary */}
            <ComparisonSummary 
              comparison={state.comparison} 
              stats={state.stats} 
              comparisonReport={comparisonReport}
            />

            {/* Section Comparisons */}
            <div className="space-y-6">
              {filteredSections.map((section, index) => (
                <div className="animate-fade-in" key={section.sectionName}>
                  <SectionComparison
                    section={section}
                    isSelected={state.selectedSection === section.sectionName}
                    onSelect={() => actions.setSelectedSection(
                      state.selectedSection === section.sectionName 
                        ? null 
                        : section.sectionName
                    )}
                  />
                </div>
              ))}
            </div>

            {filteredSections.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No changes to display</p>
                <p className="text-sm">
                  {state.showOnlyChanged 
                    ? 'Try showing all sections to see the complete comparison'
                    : 'No improvements were applied to this CV'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Comparison Toggle */}
      {isMobile && hasComparison && (
        <MobileComparisonToggle
          hasComparison={hasComparison}
          isComparisonView={false}
          onToggle={() => setShowMobileComparison(true)}
        />
      )}
    </div>
  );
};

/**
 * Comparison Controls Toolbar
 */
interface ComparisonControlsProps {
  viewMode: ComparisonViewMode;
  stats: ComparisonStats | null;
  showOnlyChanged: boolean;
  onViewModeChange: (mode: ComparisonViewMode) => void;
  onToggleFilter: () => void;
}

const ComparisonControls: React.FC<ComparisonControlsProps> = ({
  viewMode,
  stats,
  showOnlyChanged,
  onViewModeChange,
  onToggleFilter
}) => {
  return (
    <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => onViewModeChange('single')}
              className={`
                px-3 py-2 rounded text-sm font-medium transition-all flex items-center gap-2
                ${viewMode === 'single' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Single View</span>
              <span className="sm:hidden">Single</span>
            </button>
            <button
              onClick={() => onViewModeChange('comparison')}
              className={`
                px-3 py-2 rounded text-sm font-medium transition-all flex items-center gap-2
                ${viewMode === 'comparison' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Comparison View</span>
              <span className="sm:hidden">Compare</span>
            </button>
          </div>
        </div>

        {/* Stats and Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {stats && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="hidden sm:inline">{stats.modifiedSections} sections improved</span>
                <span className="sm:hidden">{stats.modifiedSections} improved</span>
              </div>
              {stats.newSections > 0 && (
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">{stats.newSections} sections added</span>
                  <span className="sm:hidden">{stats.newSections} added</span>
                </div>
              )}
            </div>
          )}

          {viewMode === 'comparison' && (
            <button
              onClick={onToggleFilter}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2
                ${showOnlyChanged
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">
                {showOnlyChanged ? 'Show All' : 'Changed Only'}
              </span>
              <span className="sm:hidden">
                {showOnlyChanged ? 'All' : 'Changes'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Comparison Summary
 */
interface ComparisonSummaryProps {
  comparison: CVComparison | null;
  stats: ComparisonStats | null;
  comparisonReport?: {
    beforeAfter: Array<{
      section: string;
      before: string;
      after: string;
      improvement: string;
    }>;
  };
}

const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({
  comparison,
  stats,
  comparisonReport
}) => {
  // Enhanced summary - use comparisonReport data if available
  const enhancedStats = useMemo(() => {
    if (comparisonReport?.beforeAfter) {
      const reportData = comparisonReport.beforeAfter;
      return {
        totalChanges: reportData.length,
        modifiedSections: reportData.length,
        newSections: 0,
        totalSections: reportData.length,
        improvementPercentage: Math.min(100, Math.round((reportData.length / Math.max(reportData.length, 10)) * 100)),
        enhancedSections: reportData.map(item => item.section)
      };
    }
    return stats;
  }, [comparisonReport, stats]);
  
  if (!enhancedStats && (!comparison || !stats)) return null;
  
  const displayStats = enhancedStats || stats;
  if (!displayStats) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            CV Improvement Summary
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {displayStats.improvementPercentage}%
              </div>
              <div className="text-sm text-gray-600">Improved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {displayStats.modifiedSections}
              </div>
              <div className="text-sm text-gray-600">Enhanced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {displayStats.newSections || 0}
              </div>
              <div className="text-sm text-gray-600">Added</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {displayStats.totalSections}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
          
          {/* Enhanced sections display - use comparisonReport or fallback to comparison */}
          {(() => {
            const sectionsToShow = comparisonReport?.beforeAfter 
              ? comparisonReport.beforeAfter.slice(0, 3).map(item => item.section)
              : comparison?.improvementSummary?.enhancedContent?.slice(0, 3) || [];
            
            const totalSections = comparisonReport?.beforeAfter?.length || 
                                 comparison?.improvementSummary?.enhancedContent?.length || 0;
            
            if (sectionsToShow.length > 0) {
              return (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Key improvements:</span>
                  {sectionsToShow.map((section: string, index: number) => (
                    <span 
                      key={`${section}-${index}`}
                      className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                    >
                      {getSectionDisplayName(section)}
                    </span>
                  ))}
                  {totalSections > 3 && (
                    <span className="text-xs text-gray-500">
                      +{totalSections - 3} more
                    </span>
                  )}
                </div>
              );
            }
            return null;
          })()
          }
        </div>
      </div>
    </div>
  );
};

/**
 * Individual Section Comparison
 */
interface SectionComparisonProps {
  section: SectionComparison;
  isSelected: boolean;
  onSelect: () => void;
}

const SectionComparison: React.FC<SectionComparisonProps> = ({
  section,
  isSelected,
  onSelect
}) => {
  const displayName = getSectionDisplayName(section.sectionName);
  const hasChanges = section.hasChanges;

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Section Header */}
      <button
        onClick={onSelect}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-3 h-3 rounded-full
            ${hasChanges ? 'bg-green-400' : 'bg-gray-300'}
          `} />
          <h4 className="font-medium text-gray-900">{displayName}</h4>
          {hasChanges && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
              Improved
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <CompactDiff changes={section.changes} />
          <ChevronRight 
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isSelected ? 'rotate-90' : ''
            }`} 
          />
        </div>
      </button>

      {/* Section Content */}
      <div>
        {isSelected && (
          <div className="animate-fade-in border-t bg-gray-50">
            <div className="p-4">
              <DiffStats changes={section.changes} className="mb-4" />
              <SideBySideDiff
                beforeContent={section.before}
                afterContent={section.after}
                changes={section.changes}
                sectionName={displayName}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};