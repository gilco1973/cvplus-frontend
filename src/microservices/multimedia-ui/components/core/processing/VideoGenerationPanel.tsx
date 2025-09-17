/**
 * Video Generation Panel Component
 * Interface for generating video introductions
 */

import React from 'react';
import { Video, Loader2 } from 'lucide-react';
import { VideoGenerationPanelProps, VideoIntroduction } from './types';

export const VideoGenerationPanel: React.FC<VideoGenerationPanelProps> = ({
  selectedStyle,
  isGenerating,
  onStyleChange,
  onGenerate
}) => {
  const getStyleDescription = (style: VideoIntroduction['style']) => {
    switch (style) {
      case 'professional':
        return 'Clean, business-focused presentation with formal tone';
      case 'casual':
        return 'Relaxed, friendly approach with conversational tone';
      case 'creative':
        return 'Dynamic visuals with engaging storytelling elements';
      case 'executive':
        return 'Authoritative, leadership-focused with executive presence';
      default:
        return 'Standard professional presentation';
    }
  };

  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Video className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Create Your Video Introduction
        </h3>
        <p className="text-gray-600 mb-6">
          Generate a personalized video introduction based on your CV content
        </p>
      </div>

      {/* Style Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Choose Your Style
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['professional', 'casual', 'creative', 'executive'] as const).map((style) => (
            <button
              key={style}
              onClick={() => onStyleChange(style)}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                selectedStyle === style
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900 capitalize mb-1">
                {style}
              </div>
              <div className="text-xs text-gray-600">
                {getStyleDescription(style)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={`px-8 py-3 rounded-lg font-medium transition-colors ${
          isGenerating
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Video...
          </div>
        ) : (
          'Generate Video Introduction'
        )}
      </button>

      {isGenerating && (
        <div className="mt-4 text-sm text-gray-600">
          <p>This may take a few minutes. We're creating your personalized video...</p>
        </div>
      )}
    </div>
  );
};