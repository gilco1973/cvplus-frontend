/**
 * Job Description Input Component
 *
 * Input field for job description to enable targeted CV optimization
 *
 * @author Gil Klainert
 * @version 3.0.0 - Enhanced T063 Implementation
 */

import React from 'react';
import { Target, Info } from 'lucide-react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor="job-description"
        className="flex items-center space-x-2 text-sm font-medium text-gray-700"
      >
        <Target className="w-4 h-4" />
        <span>Job Description (Optional)</span>
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            Paste the job description to optimize your CV for this specific role
          </div>
        </div>
      </label>
      <textarea
        id="job-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here to get targeted CV optimization recommendations..."
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
      />
      {value.trim() && (
        <div className="flex items-center space-x-2 text-sm text-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Job-specific optimization will be applied</span>
        </div>
      )}
    </div>
  );
};