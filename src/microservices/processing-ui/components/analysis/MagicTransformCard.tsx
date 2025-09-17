/**
 * Magic Transform Card Component
 * Provides AI-powered automatic CV improvements
 */

import React from 'react';
import { Sparkles, Wand2, Loader2, TrendingUp } from 'lucide-react';

interface MagicTransformProgress {
  stage: string;
  progress: number;
  message: string;
}

interface MagicTransformCardProps {
  onMagicTransform: () => void;
  isTransforming: boolean;
  progress: MagicTransformProgress | null;
  className?: string;
}

/**
 * Magic Transform feature card
 * Allows users to apply AI-powered improvements automatically
 */
export const MagicTransformCard: React.FC<MagicTransformCardProps> = ({
  onMagicTransform,
  isTransforming,
  progress,
  className = ''
}) => {
  return (
    <div className={`magic-transform-card ${className}`}>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  ✨ Magic Transform
                </h3>
                <p className="text-sm text-gray-600">
                  AI-powered automatic improvements
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                Let our AI automatically optimize your CV with industry best practices, 
                keyword optimization, and formatting improvements.
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+15-30% ATS Score</span>
                </div>
                <div className="flex items-center">
                  <Wand2 className="w-3 h-3 mr-1" />
                  <span>Professional Format</span>
                </div>
                <span>• Keyword Optimization</span>
              </div>
            </div>

            {/* Progress Display */}
            {isTransforming && progress && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {progress.stage}
                  </span>
                  <span className="text-sm text-gray-600">
                    {progress.progress}%
                  </span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {progress.message}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <span className="inline-flex items-center px-2 py-1 rounded bg-purple-100 text-purple-700">
              Premium Feature
            </span>
          </div>

          <button
            onClick={onMagicTransform}
            disabled={isTransforming}
            className={`
              inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${isTransforming
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 shadow-lg'
              }
            `}
          >
            {isTransforming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Transforming...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Apply Magic Transform
              </>
            )}
          </button>
        </div>

        {/* Feature Benefits */}
        <div className="mt-4 pt-4 border-t border-purple-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-purple-600">15-30%</div>
              <div className="text-xs text-gray-600">ATS Score Boost</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">30s</div>
              <div className="text-xs text-gray-600">Processing Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">100%</div>
              <div className="text-xs text-gray-600">Professional</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};