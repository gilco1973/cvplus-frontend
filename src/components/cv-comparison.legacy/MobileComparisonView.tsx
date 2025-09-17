import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  GitCompare
} from 'lucide-react';
import { DiffRenderer, DiffStats } from './DiffRenderer';
import { getSectionDisplayName, SectionComparison, DiffResult } from '../../utils/cv-comparison/diffUtils';

export interface MobileComparisonViewProps {
  sections: SectionComparison[];
  className?: string;
}

type MobileViewMode = 'before' | 'after' | 'diff';

/**
 * Mobile-optimized comparison view with swipeable before/after content
 */
export const MobileComparisonView: React.FC<MobileComparisonViewProps> = ({
  sections,
  className = ''
}) => {
  // Remove unused state variables
  const [viewMode, setViewMode] = useState<MobileViewMode>('diff');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const sectionsWithChanges = sections.filter(section => section.hasChanges);
  const currentSection = sectionsWithChanges[currentSectionIndex];

  const navigateSection = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    } else if (direction === 'next' && currentSectionIndex < sectionsWithChanges.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  if (!currentSection) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <GitCompare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">No changes to display</p>
      </div>
    );
  }

  return (
    <div className={`mobile-comparison-view ${className}`}>
      {/* Section Navigation */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">
            {getSectionDisplayName(currentSection.sectionName)}
          </h3>
          <span className="text-sm text-gray-500">
            {currentSectionIndex + 1} of {sectionsWithChanges.length}
          </span>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateSection('prev')}
            disabled={currentSectionIndex === 0}
            className={`
              p-2 rounded-lg flex items-center gap-2 text-sm
              ${currentSectionIndex === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {sectionsWithChanges.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSectionIndex(index)}
                className={`
                  w-2 h-2 rounded-full transition-colors
                  ${index === currentSectionIndex ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              />
            ))}
          </div>

          <button
            onClick={() => navigateSection('next')}
            disabled={currentSectionIndex === sectionsWithChanges.length - 1}
            className={`
              p-2 rounded-lg flex items-center gap-2 text-sm
              ${currentSectionIndex === sectionsWithChanges.length - 1
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex items-center justify-center">
          <div className="bg-white p-1 rounded-lg flex shadow-sm">
            <button
              onClick={() => setViewMode('before')}
              className={`
                px-3 py-2 rounded text-xs font-medium transition-all flex items-center gap-1
                ${viewMode === 'before' 
                  ? 'bg-red-50 text-red-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Eye className="w-3 h-3" />
              Before
            </button>
            <button
              onClick={() => setViewMode('diff')}
              className={`
                px-3 py-2 rounded text-xs font-medium transition-all flex items-center gap-1
                ${viewMode === 'diff' 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <ArrowLeftRight className="w-3 h-3" />
              Changes
            </button>
            <button
              onClick={() => setViewMode('after')}
              className={`
                px-3 py-2 rounded text-xs font-medium transition-all flex items-center gap-1
                ${viewMode === 'after' 
                  ? 'bg-green-50 text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Eye className="w-3 h-3" />
              After
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div>
          <div 
            className="animate-fade-in p-4"
            key={`${currentSection.sectionName}-${viewMode}`}
          >
            {viewMode === 'before' && (
              <BeforeView content={currentSection.before} />
            )}
            
            {viewMode === 'after' && (
              <AfterView 
                content={currentSection.after} 
                changes={currentSection.changes}
              />
            )}
            
            {viewMode === 'diff' && (
              <DiffView 
                changes={currentSection.changes}
                sectionName={getSectionDisplayName(currentSection.sectionName)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Before content view
 */
interface BeforeViewProps {
  content: string;
}

const BeforeView: React.FC<BeforeViewProps> = ({ content }) => (
  <div>
    <div className="mb-3 flex items-center">
      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
        ORIGINAL
      </span>
    </div>
    <div className="bg-gray-50 rounded-lg p-4 text-sm">
      {content ? (
        <div className="whitespace-pre-wrap text-gray-700">
          {content}
        </div>
      ) : (
        <div className="text-gray-400 italic">No content</div>
      )}
    </div>
  </div>
);

/**
 * After content view
 */
interface AfterViewProps {
  content: string;
  changes: DiffResult[];
}

const AfterView: React.FC<AfterViewProps> = ({ content, changes }) => {
  const hasChanges = changes.some(c => c.type !== 'unchanged');
  
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
          IMPROVED
        </span>
        {hasChanges && (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
            Enhanced
          </span>
        )}
      </div>
      <div className="bg-white border rounded-lg p-4 text-sm">
        {content ? (
          <div className="whitespace-pre-wrap text-gray-900">
            {content}
          </div>
        ) : (
          <div className="text-gray-400 italic">No content</div>
        )}
      </div>
    </div>
  );
};

/**
 * Diff view with highlighted changes
 */
interface DiffViewProps {
  changes: DiffResult[];
  sectionName: string;
}

const DiffView: React.FC<DiffViewProps> = ({ changes, sectionName }) => (
  <div>
    <div className="mb-4">
      <DiffStats changes={changes} />
    </div>
    <div className="bg-white border rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-3 text-sm">
        Changes in {sectionName}
      </h4>
      <DiffRenderer 
        changes={changes} 
        showInline={false}
        className="text-sm"
      />
    </div>
  </div>
);

/**
 * Mobile comparison toggle button for the main view
 */
export interface MobileComparisonToggleProps {
  hasComparison: boolean;
  isComparisonView: boolean;
  onToggle: () => void;
  className?: string;
}

export const MobileComparisonToggle: React.FC<MobileComparisonToggleProps> = ({
  hasComparison,
  isComparisonView,
  onToggle,
  className = ''
}) => {
  if (!hasComparison) return null;

  return (
    <button
      onClick={onToggle}
      className={`
        fixed bottom-4 right-4 z-50
        bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg
        flex items-center gap-2 text-sm font-medium
        hover:bg-blue-700 transition-colors
        ${className}
      `}
    >
      {isComparisonView ? (
        <>
          <Eye className="w-4 h-4" />
          Single View
        </>
      ) : (
        <>
          <GitCompare className="w-4 h-4" />
          Compare
        </>
      )}
    </button>
  );
};