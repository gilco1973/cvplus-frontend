/**
 * Detected Role Card Component
 * Displays detected role with confidence score and selection controls
 */

import React from 'react';
import { CheckCircle, Target, TrendingUp, Settings, ChevronRight } from 'lucide-react';
import type { DetectedRoleCardProps } from '../context/types';

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return 'green';
  if (confidence >= 0.6) return 'yellow';
  return 'red';
};

const getConfidenceLabel = (confidence: number) => {
  if (confidence >= 0.9) return 'Excellent Match';
  if (confidence >= 0.8) return 'Very Good Match';
  if (confidence >= 0.7) return 'Good Match';
  if (confidence >= 0.6) return 'Moderate Match';
  return 'Low Match';
};

const getEnhancementPercentage = (enhancementPotential: number | undefined | null): number => {
  if (typeof enhancementPotential !== 'number' || isNaN(enhancementPotential)) {
    return 0; // Safe fallback
  }
  return Math.round(enhancementPotential);
};

export const DetectedRoleCard: React.FC<DetectedRoleCardProps> = ({
  role,
  isSelected,
  onSelect,
  onCustomize,
  className = ''
}) => {
  const confidenceColor = getConfidenceColor(role.confidence || 0);
  const confidenceLabel = getConfidenceLabel(role.confidence || 0);
  const confidencePercentage = Math.round((role.confidence || 0) * 100);
  const enhancementPercentage = getEnhancementPercentage(role.enhancementPotential);
  
  return (
    <div className={`
      relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 
      border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer
      hover:shadow-lg hover:scale-[1.02]
      ${isSelected 
        ? 'border-cyan-500 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 shadow-cyan-500/20 shadow-lg' 
        : 'border-gray-700 hover:border-gray-600'
      }
      ${className}
    `}
      onClick={() => onSelect(role)}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      )}
      
      {/* Role Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isSelected ? 'bg-cyan-500/20 border-2 border-cyan-500' : 'bg-gray-700 border-2 border-gray-600'}
          `}>
            <Target className={`w-6 h-6 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <h3 className={`text-xl font-bold ${isSelected ? 'text-cyan-300' : 'text-gray-100'}`}>
              {role.roleName}
            </h3>
            <p className="text-gray-400 text-sm">
              Role ID: {role.roleId}
            </p>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCustomize();
          }}
          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
          title="Customize role"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
      
      {/* Confidence Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 text-${confidenceColor}-400`} />
            <span className="text-sm font-medium text-gray-300">Confidence Score</span>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold text-${confidenceColor}-400`}>
              {confidencePercentage}%
            </div>
            <div className={`text-xs text-${confidenceColor}-300`}>
              {confidenceLabel}
            </div>
          </div>
        </div>
        
        {/* Confidence Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-${confidenceColor}-500 to-${confidenceColor}-400 transition-all duration-500`}
            style={{ width: `${confidencePercentage}%` }}
          />
        </div>
      </div>
      
      {/* Matching Factors */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Key Matching Factors</h4>
        <div className="flex flex-wrap gap-2">
          {role.matchingFactors && role.matchingFactors.slice(0, 3).map((factor, index) => {
            // Handle both string and object formats
            const factorText = typeof factor === 'string' 
              ? factor 
              : (factor as any).type || (factor as any).name || JSON.stringify(factor);
            
            return (
              <span
                key={index}
                className={`
                  px-3 py-1 text-xs rounded-full border
                  ${isSelected 
                    ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' 
                    : 'bg-gray-700/50 border-gray-600 text-gray-300'
                  }
                `}
              >
                {factorText}
              </span>
            );
          })}
          {role.matchingFactors && role.matchingFactors.length > 3 && (
            <span className="px-3 py-1 text-xs rounded-full bg-gray-600 text-gray-400">
              +{role.matchingFactors.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      {/* Enhancement Potential */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Enhancement Potential</span>
          <div className="flex items-center gap-1">
            <span className={`text-sm font-bold text-${confidenceColor}-400`}>
              +{enhancementPercentage}%
            </span>
            <span className="text-xs text-gray-400">improvement</span>
          </div>
        </div>
      </div>
      
      {/* Role Selection Reasoning */}
      {role.scoringReasoning && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Why This Role?</h4>
          <div className={`
            p-3 rounded-lg text-sm leading-relaxed
            ${isSelected 
              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-100' 
              : 'bg-gray-700/30 border border-gray-600/50 text-gray-300'
            }
          `}>
            {role.scoringReasoning}
          </div>
        </div>
      )}
      
      {/* Quick Recommendations Preview */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Recommendations</h4>
        <div className="space-y-1">
          {role.recommendations && role.recommendations.slice(0, 2).map((rec, index) => {
            // Handle both string and object formats for recommendations
            const recText = typeof rec === 'string' 
              ? rec 
              : rec?.title || rec?.description || (rec?.type && rec?.targetSection ? `${rec.type}: ${rec.targetSection}` : JSON.stringify(rec));
            
            return (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-1 h-1 rounded-full bg-gray-500" />
                <span className="truncate">{recText}</span>
              </div>
            );
          })}
          {role.recommendations && role.recommendations.length > 2 && (
            <div className="text-xs text-gray-500 ml-3">
              +{role.recommendations.length - 2} more recommendations
            </div>
          )}
        </div>
      </div>
      
      {/* Action Button */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <button
          className={`
            w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all
            ${isSelected 
              ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }
          `}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(role);
          }}
        >
          <span>
            {isSelected ? 'Selected - Proceed with this role' : 'Select this role'}
          </span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};