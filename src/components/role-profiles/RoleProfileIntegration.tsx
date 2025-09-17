import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Target, Users, Sparkles, TrendingUp, ChevronRight, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { RoleProfileSelector } from './RoleProfileSelector';
import { RoleBasedRecommendations } from './RoleBasedRecommendations';
import type { Job } from '../../services/cvService';
import type { RoleProfile, DetectedRole, RoleProfileAnalysis, RoleBasedRecommendation } from '../../types/role-profiles';
import { designSystem } from '../../config/designSystem';

export interface RoleProfileIntegrationProps {
  job: Job;
  onContinue: (selectedRecommendations: string[], roleContext?: any) => void;
  onBack?: () => void;
  className?: string;
}

export const RoleProfileIntegration: React.FC<RoleProfileIntegrationProps> = ({
  job,
  onContinue,
  onBack,
  className = ''
}) => {
  const [selectedRole, setSelectedRole] = useState<RoleProfile | null>(null);
  const [detectedRole, setDetectedRole] = useState<DetectedRole | null>(null);
  const [analysis, setAnalysis] = useState<RoleProfileAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<RoleBasedRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'detection' | 'recommendations'>('detection');
  const [isRoleDetected, setIsRoleDetected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false); // NEW: Track user interaction

  // Handle role selection from the selector
  const handleRoleSelected = (roleProfile: RoleProfile | null, isDetected: boolean) => {
    console.log('🎯 [RoleSelection] Role selected:', { roleProfile: roleProfile?.name, isDetected, userHasInteracted });
    
    setSelectedRole(roleProfile);
    setIsRoleDetected(isDetected);
    
    // FIXED: Don't automatically switch to recommendations tab
    // Only switch if user has explicitly interacted (clicked a button)
    if (roleProfile && userHasInteracted) {
      console.log('🎯 [RoleSelection] Switching to recommendations tab (user interaction detected)');
      setActiveTab('recommendations');
    } else if (roleProfile && !userHasInteracted) {
      console.log('🎯 [RoleSelection] Role detected but staying on detection tab (no user interaction yet)');
      // Stay on detection tab to allow user to see the detected role and manually proceed
    }
  };

  // Handle analysis updates from role detection
  const handleAnalysisUpdate = (analysisData: RoleProfileAnalysis | null) => {
    setAnalysis(analysisData);
    if (analysisData?.primaryRole) {
      setDetectedRole(analysisData.primaryRole);
    }
  };

  // Handle recommendations updates
  const handleRecommendationsUpdate = (recs: RoleBasedRecommendation[]) => {
    setRecommendations(recs);
  };

  // NEW: Handle manual tab switching (indicates user interaction)
  const handleTabChange = (value: string) => {
    console.log('🎯 [RoleSelection] User manually switching tabs:', value);
    setUserHasInteracted(true); // Mark that user has interacted
    setActiveTab(value as 'detection' | 'recommendations');
  };

  // NEW: Handle manual proceed to recommendations
  const handleProceedToRecommendations = () => {
    console.log('🎯 [RoleSelection] User manually proceeding to recommendations');
    setUserHasInteracted(true);
    setActiveTab('recommendations');
  };

  // Handle continue to preview with role context
  const handleContinueToPreview = (selectedRecommendations: string[]) => {
    // FIXED: Only proceed if user has explicitly interacted
    if (!userHasInteracted) {
      console.log('🚫 [RoleSelection] Preventing auto-navigation - no user interaction yet');
      return;
    }
    
    console.log('✅ [RoleSelection] User confirmed - proceeding to feature selection');
    
    const roleContext = {
      selectedRole,
      detectedRole,
      analysis,
      recommendations,
      isRoleDetected
    };
    
    onContinue(selectedRecommendations, roleContext);
  };

  const hasRoleSelected = selectedRole !== null;
  const hasRecommendations = recommendations.length > 0;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Enhanced Header with Live Status */}
      <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-cyan-900/30 rounded-2xl p-8 border border-blue-500/30 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              {isAnalyzing && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">AI Role Analysis</h1>
                {hasRoleSelected && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300 font-medium">Role Detected</span>
                  </div>
                )}
              </div>
              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                Our advanced AI analyzes your professional background to identify your role and 
                generate personalized enhancement recommendations.
              </p>
              {selectedRole && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-gray-400">Detected Role:</span>
                  <span className="text-cyan-300 font-semibold">{selectedRole.name}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-purple-300">{selectedRole.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/70 backdrop-blur-sm border border-gray-600 rounded-xl p-1">
          <TabsTrigger 
            value="detection" 
            className="flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-700"
          >
            <Target className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Role Detection</span>
              <span className="text-xs opacity-80">
                {hasRoleSelected ? 'Complete' : 'Analyze CV'}
              </span>
            </div>
            {hasRoleSelected && (
              <Badge variant="success" className="ml-2">
                ✓
              </Badge>
            )}
          </TabsTrigger>
          
          <TabsTrigger 
            value="recommendations" 
            disabled={!hasRoleSelected}
            className="flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Recommendations</span>
              <span className="text-xs opacity-80">
                {hasRecommendations ? `${recommendations.length} Ready` : 'Generate Ideas'}
              </span>
            </div>
            {hasRecommendations && (
              <Badge variant="success" className="ml-2">
                {recommendations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Role Detection Tab */}
        <TabsContent value="detection" className="space-y-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <RoleProfileSelector
              jobId={job.id}
              onRoleSelected={handleRoleSelected}
              onAnalysisUpdate={handleAnalysisUpdate}
              className="animate-fade-in-up"
            />
          </div>
          
          {/* Enhanced Quick Navigation - FIXED: Now requires manual interaction */}
          {hasRoleSelected && (
            <div className="animate-slide-up">
              <Card className="border-green-500/40 bg-gradient-to-r from-green-900/30 to-emerald-900/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-300 mb-2">
                          Role Successfully Detected!
                        </h3>
                        <div className="space-y-1">
                          <p className="text-green-200">
                            <span className="font-medium">Identified Role:</span> {selectedRole?.name}
                          </p>
                          <p className="text-green-200/80">
                            <span className="font-medium">Category:</span> {selectedRole?.category}
                          </p>
                          <p className="text-sm text-green-300/70 mt-2">
                            Ready to generate {detectedRole ? Math.round(detectedRole.confidence * 100) : '85'}% confidence-based recommendations
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleProceedToRecommendations}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Recommendations
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {hasRoleSelected ? (
            <RoleBasedRecommendations
              jobId={job.id}
              roleProfile={selectedRole}
              detectedRole={detectedRole}
              onRecommendationsUpdate={handleRecommendationsUpdate}
              onContinueToPreview={handleContinueToPreview}
              className="animate-fade-in-up"
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <CardTitle className="text-gray-300 mb-2">Select a Role First</CardTitle>
                <CardDescription className="text-gray-500 mb-4">
                  Please complete role detection or manual selection to generate personalized recommendations.
                </CardDescription>
                <Button
                  onClick={() => setActiveTab('detection')}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Go to Role Detection
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Enhanced Role Context Summary */}
      {hasRoleSelected && (
        <div className="animate-fade-in">
          <Card className="bg-gradient-to-r from-gray-800/60 to-gray-700/40 border border-gray-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-100 flex items-center gap-3">
                <Users className="w-6 h-6 text-cyan-400" />
                Professional Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-6 bg-gradient-to-br from-cyan-900/30 to-blue-900/20 border border-cyan-500/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm text-cyan-300 font-medium">Detected Role</span>
                    </div>
                    <div className="text-xl font-bold text-cyan-100 mb-1">
                      {selectedRole?.name}
                    </div>
                    <div className="text-cyan-300/70">{selectedRole?.category}</div>
                    {selectedRole?.experienceLevel && (
                      <div className="text-sm text-cyan-400/60 capitalize mt-1">
                        {selectedRole.experienceLevel} Level
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/30 rounded-xl text-center">
                  <div className="text-3xl font-bold text-purple-300 mb-2">
                    {detectedRole ? Math.round(detectedRole.confidence * 100) : '85'}%
                  </div>
                  <div className="text-sm text-purple-200">Match Confidence</div>
                  <div className="w-full bg-purple-900/40 rounded-full h-2 mt-3">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${detectedRole ? detectedRole.confidence * 100 : 85}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-xl text-center">
                  <div className="text-3xl font-bold text-green-300 mb-2">
                    {recommendations.length || '8-12'}
                  </div>
                  <div className="text-sm text-green-200">Recommendations</div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${
                        i < (recommendations.length > 0 ? 3 : 1) ? 'bg-green-400' : 'bg-green-900'
                      }`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Action Bar */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              hasRoleSelected 
                ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                : 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300'
            }`}>
              {hasRoleSelected ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Ready to Continue</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Select Role to Continue</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Fallback UI components with improved styling
const Tabs: React.FC<any> = ({ value, onValueChange, children, ...props }) => (
  <div {...props}>{children}</div>
);

const TabsList: React.FC<any> = ({ children, className, ...props }) => (
  <div className={`flex ${className}`} {...props}>{children}</div>
);

const TabsTrigger: React.FC<any> = ({ value, children, className, disabled, onClick, ...props }) => {
  const isActive = props['data-state'] === 'active';
  return (
    <button 
      className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-300 ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/50'
      }`}
      disabled={disabled}
      onClick={() => !disabled && onClick?.(value)}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<any> = ({ value, children, className, ...props }) => (
  <div className={`mt-8 ${className}`} {...props}>{children}</div>
);

const Button: React.FC<any> = ({ children, className, variant, onClick, disabled, ...props }) => (
  <button 
    className={`${designSystem.components.button.base} ${
      variant === 'outline' 
        ? designSystem.components.button.variants.secondary.default
        : designSystem.components.button.variants.primary.default
    } ${designSystem.components.button.sizes.md} ${className} transition-all duration-300`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const Card: React.FC<any> = ({ children, className, ...props }) => (
  <div className={`${designSystem.components.card.base} ${designSystem.components.card.variants.default} ${designSystem.components.card.padding.md} ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader: React.FC<any> = ({ children, ...props }) => (
  <div className="mb-6" {...props}>{children}</div>
);

const CardTitle: React.FC<any> = ({ children, className, ...props }) => (
  <h3 className={`text-lg font-semibold text-gray-100 ${className}`} {...props}>{children}</h3>
);

const CardDescription: React.FC<any> = ({ children, className, ...props }) => (
  <p className={`text-sm text-gray-400 ${className}`} {...props}>{children}</p>
);

const CardContent: React.FC<any> = ({ children, className, ...props }) => (
  <div className={className} {...props}>{children}</div>
);

const Badge: React.FC<any> = ({ children, variant, className, ...props }) => {
  const variantClasses = {
    success: 'bg-green-500/20 text-green-300 border border-green-500/40',
    default: 'bg-gray-500/20 text-gray-300 border border-gray-500/40'
  };
  
  return (
    <span 
      className={`px-3 py-1 text-xs font-medium rounded-full ${variantClasses[variant || 'default']} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default RoleProfileIntegration;