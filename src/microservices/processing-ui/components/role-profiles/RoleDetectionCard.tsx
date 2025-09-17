import React from 'react';
import { CheckCircle, Target, TrendingUp, Sparkles, ArrowRight, Zap, Users, ExternalLink, ArrowLeft } from 'lucide-react';
import { designSystem } from '../../config/designSystem';
import type { DetectedRole, RoleProfile, RoleProfileAnalysis } from '../../types/role-profiles';

export interface RoleDetectionCardProps {
  detectedRole: DetectedRole;
  roleProfile?: RoleProfile | null;
  analysis?: RoleProfileAnalysis | null;
  onApply: () => void;
  onShowAlternatives: () => void;
  isApplying?: boolean;
  className?: string;
}

export const RoleDetectionCard: React.FC<RoleDetectionCardProps> = ({
  detectedRole,
  roleProfile,
  analysis,
  onApply,
  onShowAlternatives,
  isApplying = false,
  className = ''
}) => {
  const confidencePercentage = Math.round(detectedRole.confidence * 100);
  const isHighConfidence = detectedRole.confidence >= 0.8;
  const isMediumConfidence = detectedRole.confidence >= 0.6;
  
  // Determine confidence color scheme
  const getConfidenceStyle = () => {
    if (isHighConfidence) {
      return {
        bgClass: 'bg-green-900/30 border-green-500/30',
        textClass: 'text-green-300',
        indicatorClass: 'bg-green-500',
        ringClass: 'ring-green-500/20'
      };
    } else if (isMediumConfidence) {
      return {
        bgClass: 'bg-orange-900/30 border-orange-500/30',
        textClass: 'text-orange-300',
        indicatorClass: 'bg-orange-500',
        ringClass: 'ring-orange-500/20'
      };
    } else {
      return {
        bgClass: 'bg-red-900/30 border-red-500/30',
        textClass: 'text-red-300',
        indicatorClass: 'bg-red-500',
        ringClass: 'ring-red-500/20'
      };
    }
  };

  const confidenceStyle = getConfidenceStyle();
  const hasMatchingFactors = detectedRole.matchingFactors && detectedRole.matchingFactors.length > 0;
  const hasRecommendations = detectedRole.recommendations && detectedRole.recommendations.length > 0;

  return (
    <div className={`bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden ${className} hover:border-gray-600 transition-all duration-300`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-cyan-900/40 p-8 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Enhanced Confidence Ring with Animation */}
            <div className="relative">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${confidenceStyle.bgClass} ${confidenceStyle.ringClass} ring-4 transition-all duration-500`}>
                <div className={`w-4 h-4 rounded-full ${confidenceStyle.indicatorClass} animate-pulse`}></div>
                {/* Animated progress circle */}
                <svg className="absolute inset-0 w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-600"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={confidenceStyle.textClass}
                    strokeDasharray={`${confidencePercentage * 2.26} 226`}
                    style={{
                      transition: 'stroke-dasharray 1.5s ease-in-out',
                    }}
                  />
                </svg>
              </div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${confidenceStyle.bgClass} ${confidenceStyle.textClass} border shadow-lg`}>
                  {confidencePercentage}%
                </span>
              </div>
            </div>
            
            {/* Enhanced Role Information */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300 font-semibold">AI Detection Complete</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  isHighConfidence ? 'bg-green-500/20 border-green-500/40 text-green-300' :
                  isMediumConfidence ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' :
                  'bg-red-500/20 border-red-500/40 text-red-300'
                }`}>
                  {isHighConfidence ? 'High Accuracy' : isMediumConfidence ? 'Good Match' : 'Partial Match'}
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-100 mb-3 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                {detectedRole.roleName}
              </h3>
              
              {roleProfile && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 font-medium">{roleProfile.category}</span>
                    </div>
                    {roleProfile.experienceLevel && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                        <span className="text-purple-300 font-medium capitalize">{roleProfile.experienceLevel} Level</span>
                      </div>
                    )}
                  </div>
                  
                  {roleProfile.description && (
                    <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                      <p className="text-gray-300 leading-relaxed text-sm">
                        {roleProfile.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Confidence Visualization */}
          <div className="flex flex-col items-end gap-2">
            <div className={`px-4 py-2 rounded-xl text-lg font-bold ${confidenceStyle.bgClass} ${confidenceStyle.textClass} border shadow-lg`}>
              {isHighConfidence ? 'Excellent Match' :
               isMediumConfidence ? 'Good Match' :
               'Partial Match'}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-100">{confidencePercentage}%</div>
              <div className="text-sm text-gray-400">Confidence Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Details Section */}
      <div className="p-8 space-y-8">
        {/* Enhanced Matching Factors with Why This Role Section */}
        {hasMatchingFactors && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-gray-100 flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-400" />
                Why This Role?
              </h4>
              <div className="text-sm text-blue-300 font-medium">
                {detectedRole.matchingFactors.length} factors identified
              </div>
            </div>
            
            {/* Top 3 factors prominently displayed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {detectedRole.matchingFactors.slice(0, 3).map((factor, index) => (
                <div
                  key={index}
                  className="relative p-5 bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border border-blue-500/40 rounded-xl hover:border-blue-400/60 transition-all duration-300"
                >
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-blue-300 mb-2">#{index + 1} Match</div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {typeof factor === 'string' ? factor : factor?.description || factor?.type || 'Match factor'}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Additional factors in compact grid */}
            {detectedRole.matchingFactors.length > 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {detectedRole.matchingFactors.slice(3, 9).map((factor, index) => (
                    <div
                      key={index + 3}
                      className="flex items-center gap-3 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg hover:bg-blue-900/30 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">
                        {typeof factor === 'string' ? factor : factor?.description || factor?.type || 'Match factor'}
                      </span>
                    </div>
                  ))}
                </div>
                
                {detectedRole.matchingFactors.length > 9 && (
                  <div className="text-center">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                      +{detectedRole.matchingFactors.length - 9} more matching factors
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Enhancement Potential */}
        <div>
          <h4 className="text-xl font-semibold text-gray-100 mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Enhancement Potential
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="relative p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/20 border border-green-500/40 rounded-xl text-center group hover:scale-105 transition-transform duration-300">
              <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="text-4xl font-bold text-green-300 mb-2">
                +{detectedRole.enhancementPotential}%
              </div>
              <div className="text-green-200 font-medium mb-1">ATS Score Boost</div>
              <div className="text-xs text-green-300/70">Applicant Tracking Systems</div>
              <div className="mt-3 w-full bg-green-900/40 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(detectedRole.enhancementPotential, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="relative p-6 bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border border-blue-500/40 rounded-xl text-center group hover:scale-105 transition-transform duration-300">
              <div className="absolute top-4 right-4 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="text-4xl font-bold text-blue-300 mb-2">
                {hasRecommendations ? detectedRole.recommendations.length : '8-12'}
              </div>
              <div className="text-blue-200 font-medium mb-1">AI Recommendations</div>
              <div className="text-xs text-blue-300/70">Personalized suggestions</div>
              <div className="mt-3 flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < Math.min(Math.ceil((hasRecommendations ? detectedRole.recommendations.length : 10) / 2), 5) 
                      ? 'bg-blue-400' : 'bg-blue-900'
                  }`}></div>
                ))}
              </div>
            </div>
            
            <div className="relative p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/20 border border-purple-500/40 rounded-xl text-center group hover:scale-105 transition-transform duration-300">
              <div className="absolute top-4 right-4 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="text-4xl font-bold text-purple-300 mb-2">
                {roleProfile ? '15+' : '10+'}
              </div>
              <div className="text-purple-200 font-medium mb-1">Template Enhancements</div>
              <div className="text-xs text-purple-300/70">Role-specific optimizations</div>
              <div className="mt-3 flex justify-center gap-1">
                {[...Array(4)].map((_, i) => (
                  <Sparkles key={i} className={`w-3 h-3 transition-all duration-300 ${
                    i < 3 ? 'text-purple-400' : 'text-purple-700'
                  }`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sample Recommendations Preview */}
        {hasRecommendations && (
          <div>
            <h4 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Sample Recommendations
            </h4>
            
            <div className="space-y-2">
              {detectedRole.recommendations.slice(0, 3).map((rec, index) => (
                <div
                  key={index}
                  className="p-3 bg-neutral-700/50 border border-neutral-600 rounded-lg"
                >
                  <p className="text-sm text-gray-300">
                    {typeof rec === 'string' ? rec : rec?.title || rec?.description || 'Recommendation'}
                  </p>
                </div>
              ))}
              
              {detectedRole.recommendations.length > 3 && (
                <p className="text-sm text-gray-400 text-center pt-2">
                  +{detectedRole.recommendations.length - 3} more recommendations available
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Actions Section */}
      <div className="p-8 bg-gradient-to-r from-gray-700/40 to-gray-800/40 border-t border-gray-600">
        <div className="space-y-6">
          {/* Primary Action with enhanced design */}
          <div className="flex flex-col lg:flex-row gap-4">
            <button
              onClick={onApply}
              disabled={isApplying}
              className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.lg} flex-1 flex items-center justify-center gap-4 relative overflow-hidden group min-h-[60px] text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300`}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              {/* Button content */}
              <div className="relative flex items-center gap-4">
                {isApplying ? (
                  <>
                    <div className="animate-spin">
                      <Zap className="w-6 h-6" />
                    </div>
                    <span className="text-lg">Applying AI Magic...</span>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 bg-white rounded-full animate-pulse`} style={{ animationDelay: `${i * 200}ms` }}></div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 group-hover:animate-spin" />
                    <span className="text-lg">Apply This Role Profile</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </>
                )}
              </div>
              
              {/* Enhanced sparkle animations */}
              {!isApplying && (
                <>
                  <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute bottom-2 left-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-4 w-1 h-1 bg-white rounded-full animate-ping opacity-50" style={{ animationDelay: '1.5s' }}></div>
                </>
              )}
            </button>
            
            {/* Secondary Action */}
            <button
              onClick={onShowAlternatives}
              disabled={isApplying}
              className={`${designSystem.components.button.base} ${designSystem.components.button.variants.secondary.default} ${designSystem.components.button.sizes.lg} flex items-center gap-3 lg:w-auto w-full justify-center px-8 min-h-[60px] border-2 border-gray-500 hover:border-gray-400 transition-all duration-300 hover:scale-105`}
            >
              <ExternalLink className="w-5 h-5" />
              <span className="font-semibold">View Alternatives</span>
            </button>
          </div>
        </div>
        
        {/* Enhanced Confidence-based messaging */}
        <div className="mt-6 p-4 rounded-xl border">
          {isHighConfidence ? (
            <div className="bg-green-900/30 border-green-500/40 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  🎯
                </div>
                <h4 className="text-lg font-bold text-green-300">Excellent Match!</h4>
              </div>
              <p className="text-green-200 leading-relaxed">
                This role profile perfectly aligns with your CV content. Our AI is <strong>{confidencePercentage}% confident</strong> this 
                will significantly enhance your professional presentation.
              </p>
            </div>
          ) : isMediumConfidence ? (
            <div className="bg-orange-900/30 border-orange-500/40 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                  ⚡
                </div>
                <h4 className="text-lg font-bold text-orange-300">Good Match</h4>
              </div>
              <p className="text-orange-200 leading-relaxed">
                <strong>{confidencePercentage}% confidence.</strong> Some customization may be needed for optimal results, 
                but this profile will still provide valuable enhancements.
              </p>
            </div>
          ) : (
            <div className="bg-red-900/30 border-red-500/40 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  💡
                </div>
                <h4 className="text-lg font-bold text-red-300">Partial Match</h4>
              </div>
              <p className="text-red-200 leading-relaxed">
                <strong>{confidencePercentage}% confidence.</strong> Consider reviewing alternatives or adding more relevant experience 
                to your CV for better role detection accuracy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleDetectionCard;