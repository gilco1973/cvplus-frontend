/**
 * Analysis Header Component
 * Displays job title and navigation controls
 */

import React from 'react';
import { ArrowLeft, FileText, Clock } from 'lucide-react';
import type { Job } from '../../types/job';

interface AnalysisHeaderProps {
  job: Job;
  onBack?: () => void;
  className?: string;
}

/**
 * Header component for CV analysis view
 * Shows job info and back navigation
 */
export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  job,
  onBack,
  className = ''
}) => {
  return (
    <div className={`analysis-header ${className}`}>
      <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                CV Analysis Results
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Job ID: {job.id.substring(0, 8)}</span>
                {job.fileName && (
                  <>
                    <span>•</span>
                    <span>{job.fileName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              Status: {job.status}
            </div>
            <div className="text-xs text-gray-500">
              Created: {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${job.status === 'completed' ? 'bg-green-100 text-green-800' : 
              job.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
              job.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }
          `}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};