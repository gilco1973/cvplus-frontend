/**
 * Analysis Header Component
 * Header section with scores and export actions
 */

import React from 'react';
import { BarChart3, Download, Share2 } from 'lucide-react';
import type { Job } from '../../../types/job';

interface AnalysisHeaderProps {
  job: Job;
  overallScore: number;
  atsScore: number;
  highPriorityCount: number;
  onExport?: (format: 'pdf' | 'json') => void;
  onShare?: () => void;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  job,
  overallScore,
  atsScore,
  highPriorityCount,
  onExport,
  onShare
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CV Analysis Results</h1>
            <p className="text-sm text-gray-500">{job.fileName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          )}
          {onExport && (
            <button
              onClick={() => onExport('pdf')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Score Summary Bar */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{overallScore}/100</div>
          <div className="text-sm text-green-700">Overall Score</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{atsScore}/100</div>
          <div className="text-sm text-blue-700">ATS Compatible</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{highPriorityCount}</div>
          <div className="text-sm text-orange-700">Priority Items</div>
        </div>
      </div>
    </div>
  );
};