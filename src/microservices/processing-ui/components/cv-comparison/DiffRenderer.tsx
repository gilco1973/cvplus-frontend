import React from 'react';
import { DiffResult } from '../../utils/cv-comparison/diffUtils';

export interface DiffRendererProps {
  changes: DiffResult[];
  className?: string;
  showInline?: boolean;
}

/**
 * Renders diff changes with appropriate styling
 */
export const DiffRenderer: React.FC<DiffRendererProps> = ({
  changes,
  className = '',
  showInline = true
}) => {
  if (!changes || changes.length === 0) {
    return <div className={`text-gray-500 italic ${className}`}>No content</div>;
  }

  return (
    <div className={`diff-content ${className}`}>
      {changes.map((change, index) => {
        switch (change.type) {
          case 'added':
            return (
              <span
                key={index}
                className={`
                  bg-green-50 text-green-800 border-l-4 border-green-400
                  ${showInline ? 'px-1' : 'block px-2 py-1 my-1'}
                  relative group
                `}
                title="Added content"
              >
                {change.value}
                {!showInline && (
                  <span className="absolute left-0 top-0 text-green-600 text-xs font-bold">
                    +
                  </span>
                )}
              </span>
            );

          case 'removed':
            return (
              <span
                key={index}
                className={`
                  bg-red-50 text-red-800 border-l-4 border-red-400 line-through
                  ${showInline ? 'px-1' : 'block px-2 py-1 my-1'}
                  relative group opacity-75
                `}
                title="Removed content"
              >
                {change.value}
                {!showInline && (
                  <span className="absolute left-0 top-0 text-red-600 text-xs font-bold">
                    -
                  </span>
                )}
              </span>
            );

          case 'unchanged':
            return (
              <span
                key={index}
                className={`
                  ${showInline ? '' : 'block px-2 py-1'}
                  text-gray-900
                `}
              >
                {change.value}
              </span>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

/**
 * Side-by-side diff renderer for before/after comparison
 */
export interface SideBySideDiffProps {
  beforeContent: string;
  afterContent: string;
  changes: DiffResult[];
  sectionName: string;
  className?: string;
}

export const SideBySideDiff: React.FC<SideBySideDiffProps> = ({
  beforeContent,
  changes,
  sectionName,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* Before Content */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs mr-2">
            BEFORE
          </span>
          {sectionName}
        </h4>
        <div className="text-sm text-gray-600 whitespace-pre-wrap">
          {beforeContent || (
            <span className="italic text-gray-400">No content</span>
          )}
        </div>
      </div>

      {/* After Content with Changes */}
      <div className="border rounded-lg p-4 bg-white">
        <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2">
            AFTER
          </span>
          {sectionName}
          {changes.some(c => c.type !== 'unchanged') && (
            <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
              Improved
            </span>
          )}
        </h4>
        <div className="text-sm">
          <DiffRenderer changes={changes} showInline={false} />
        </div>
      </div>
    </div>
  );
};

/**
 * Compact inline diff renderer for toolbar summaries
 */
export interface CompactDiffProps {
  changes: DiffResult[];
  maxLength?: number;
  className?: string;
}

export const CompactDiff: React.FC<CompactDiffProps> = ({
  changes,
  className = ''
}) => {
  const addedCount = changes.filter(c => c.type === 'added').length;
  const removedCount = changes.filter(c => c.type === 'removed').length;
  const unchangedCount = changes.filter(c => c.type === 'unchanged').length;

  if (addedCount === 0 && removedCount === 0) {
    return (
      <span className={`text-gray-500 text-xs ${className}`}>
        No changes
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      {addedCount > 0 && (
        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
          +{addedCount}
        </span>
      )}
      {removedCount > 0 && (
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
          -{removedCount}
        </span>
      )}
      {unchangedCount > 0 && (
        <span className="text-gray-500">
          {unchangedCount} unchanged
        </span>
      )}
    </div>
  );
};

/**
 * Statistics summary for changes
 */
export interface DiffStatsProps {
  changes: DiffResult[];
  className?: string;
}

export const DiffStats: React.FC<DiffStatsProps> = ({
  changes,
  className = ''
}) => {
  const stats = {
    added: changes.filter(c => c.type === 'added').length,
    removed: changes.filter(c => c.type === 'removed').length,
    unchanged: changes.filter(c => c.type === 'unchanged').length,
    total: changes.length
  };

  const improvementPercentage = stats.total > 0 
    ? Math.round(((stats.added + stats.removed) / stats.total) * 100)
    : 0;

  return (
    <div className={`flex items-center gap-4 text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
        <span className="text-green-700">{stats.added} additions</span>
      </div>
      
      {stats.removed > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-red-700">{stats.removed} removals</span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
        <span className="text-gray-600">{stats.unchanged} unchanged</span>
      </div>

      {improvementPercentage > 0 && (
        <div className="ml-auto">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
            {improvementPercentage}% improved
          </span>
        </div>
      )}
    </div>
  );
};