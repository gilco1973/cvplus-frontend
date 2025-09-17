import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X, Edit3, Eye, EyeOff, Info } from 'lucide-react';
import { 
  detectPlaceholdersInCV, 
  getPlaceholderSummary, 
  groupPlaceholdersBySection,
  type PlaceholderMatch 
} from '../../utils/placeholderDetection';

export interface PlaceholderBannerProps {
  cvData: unknown;
  onDismiss?: () => void;
  onStartEditing?: () => void;
  className?: string;
  autoHideAfter?: number; // milliseconds
}

export const PlaceholderBanner: React.FC<PlaceholderBannerProps> = ({
  cvData,
  onDismiss,
  onStartEditing,
  className = '',
  autoHideAfter
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [placeholderMatches, setPlaceholderMatches] = useState<PlaceholderMatch[]>([]);
  const [placeholderSummary, setPlaceholderSummary] = useState<ReturnType<typeof getPlaceholderSummary> | null>(null);

  // Detect placeholders when CV data changes
  useEffect(() => {
    if (cvData) {
      const matches = detectPlaceholdersInCV(cvData);
      setPlaceholderMatches(matches);
      
      if (matches.length > 0) {
        const summary = getPlaceholderSummary(matches);
        setPlaceholderSummary(summary);
      } else {
        setPlaceholderSummary(null);
      }
    }
  }, [cvData]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHideAfter && placeholderMatches.length > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideAfter);
      
      return () => clearTimeout(timer);
    }
  }, [autoHideAfter, placeholderMatches.length, handleDismiss]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatSectionName = (sectionName: string) => {
    return sectionName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Don't render if no placeholders found or if dismissed
  if (!isVisible || !placeholderSummary || placeholderMatches.length === 0) {
    return null;
  }

  const groupedPlaceholders = groupPlaceholdersBySection(placeholderMatches);

  return (
    <div className={`relative ${className}`}>
      {/* Main Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-amber-800">
                  Placeholders Detected
                </h4>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {placeholderSummary.totalCount} found
                </span>
              </div>
              <div className="mt-1">
                <p className="text-sm text-amber-700">
                  Your CV contains <strong>{placeholderSummary.uniqueCount} unique placeholder{placeholderSummary.uniqueCount !== 1 ? 's' : ''}</strong> in{' '}
                  <strong>{placeholderSummary.sectionsCount} section{placeholderSummary.sectionsCount !== 1 ? 's' : ''}</strong> that need to be replaced with your actual information.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {/* Expand/Collapse Button */}
            <button
              onClick={handleToggleExpanded}
              className="p-1 rounded-md text-amber-600 hover:bg-amber-100 transition-colors"
              title={isExpanded ? 'Hide details' : 'Show details'}
            >
              {isExpanded ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md text-amber-600 hover:bg-amber-100 transition-colors"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4">
          <div className="flex items-center space-x-3">
            {onStartEditing && (
              <button
                onClick={onStartEditing}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Start Editing</span>
              </button>
            )}
            
            <button
              onClick={handleToggleExpanded}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-amber-100 text-amber-800 text-sm font-medium rounded-md hover:bg-amber-200 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>{isExpanded ? 'Hide' : 'View'} Details</span>
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-amber-200 bg-amber-50/50">
            <div className="p-4">
              <h5 className="text-sm font-semibold text-amber-800 mb-3">
                Placeholders by Section:
              </h5>
              
              <div className="space-y-3">
                {Object.entries(groupedPlaceholders).map(([sectionName, matches]) => (
                  <div key={sectionName} className="bg-white rounded-md border border-amber-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="text-sm font-medium text-amber-900 capitalize">
                        {formatSectionName(sectionName)}
                      </h6>
                      <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                        {matches.length} placeholder{matches.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {matches.slice(0, 6).map((match, index) => (
                        <div
                          key={index}
                          className="bg-amber-50 border border-amber-200 rounded px-3 py-2"
                        >
                          <code className="text-xs text-amber-800 font-mono break-all">
                            {match.text}
                          </code>
                          {match.location && (
                            <div className="text-xs text-amber-600 mt-1">
                              in {match.location}
                            </div>
                          )}
                        </div>
                      ))}
                      {matches.length > 6 && (
                        <div className="col-span-full text-xs text-amber-600 text-center py-2">
                          ... and {matches.length - 6} more in this section
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Instructions */}
              <div className="mt-4 p-3 bg-blue-50/80 border border-blue-200 rounded-md">
                <h6 className="text-sm font-semibold text-blue-800 mb-2">
                  How to fix placeholders:
                </h6>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Click "Start Editing" to enter edit mode</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Click on any section to edit its content</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Replace placeholders like <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">[INSERT NUMBER]</code> with your actual data</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Save your changes to update the CV preview</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};