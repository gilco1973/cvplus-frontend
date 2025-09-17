import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Sparkles, Zap, AlertTriangle, Crown, Target, CheckCircle, Eye, Settings, Play } from 'lucide-react';
import { PremiumFeatureSelectionPanel } from '../components/PremiumFeatureSelectionPanel';
import { Header } from '../components/Header';
import { Section } from '../components/layout/Section';
import { updateJobFeatures, getJob } from '../services/cvService';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureValidation, useBulkFeatureOperations } from '../hooks/useFeatureValidation';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import toast from 'react-hot-toast';
import { FEATURE_CONFIGS } from '../config/featureConfigs';
import { TemplateCard } from '../components/TemplateCard';
import { LivePreview } from '../components/LivePreview';
// Role profiles are now handled in the dedicated RoleSelectionPage

// Template Configuration
interface Template {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  isPremium: boolean;
  previewImage?: string;
}

const PROFESSIONAL_TEMPLATES: Template[] = [
  {
    id: 'tech-innovation',
    name: 'Tech Innovation',
    emoji: '💻',
    description: 'Clean, systematic design perfect for software engineers and technical professionals',
    category: 'technical',
    isPremium: false
  },
  {
    id: 'executive-authority',
    name: 'Executive Authority',
    emoji: '👔',
    description: 'Commanding presence for C-suite and senior leadership roles',
    category: 'executive',
    isPremium: true
  },
  {
    id: 'creative-showcase',
    name: 'Creative Showcase',
    emoji: '🎨',
    description: 'Bold, expressive design for creative professionals and designers',
    category: 'creative',
    isPremium: true
  },
  {
    id: 'healthcare-professional',
    name: 'Healthcare Professional',
    emoji: '🏥',
    description: 'Clean, trustworthy design for medical professionals',
    category: 'healthcare',
    isPremium: false
  },
  {
    id: 'financial-expert',
    name: 'Financial Expert',
    emoji: '💼',
    description: 'Conservative, stable design for finance sector professionals',
    category: 'financial',
    isPremium: true
  },
  {
    id: 'international-professional',
    name: 'International Professional',
    emoji: '🌍',
    description: 'Universal design for global and multicultural roles',
    category: 'international',
    isPremium: false
  }
];

export const FeatureSelectionPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('tech-innovation');
  const [isLoading, setIsLoading] = useState(false);
  const [jobData, setJobData] = useState<any>(null);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [roleContext, setRoleContext] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<'template' | 'features' | 'final'>('template');

  // Memoize the feature restriction callback to prevent infinite loops
  const handleFeatureRestricted = useCallback((featureId: string, premiumType: string) => {
    toast.error(`${featureId} requires ${premiumType} access. Please upgrade to use this feature.`);
    setShowPremiumPrompt(true);
  }, []);

  // Feature validation hook
  const {
    isValid: isSelectionValid,
    restrictedFeatures,
    warnings,
    validateAndFilter
  } = useFeatureValidation({
    selectedFeatures,
    enforceRestrictions: true,
    onFeatureRestricted: handleFeatureRestricted
  });

  // Bulk operations hook
  const { selectAllAccessible, selectOnlyFree, getAccessibleCount, getPremiumCount } = useBulkFeatureOperations();

  // Initialize default feature selections and role context
  useEffect(() => {
    // Get role context from navigation state if available
    const state = location.state;
    if (state?.roleContext) {
      setRoleContext(state.roleContext);
    }
  }, [location.state]);

  // Initialize default feature selections
  useEffect(() => {
    const initializeDefaults = async () => {
      if (!jobId) return;

      try {
        // Load job data to check if features were already selected
        const job = await getJob(jobId);
        setJobData(job);

        // Set default feature selections
        const defaults: Record<string, boolean> = {
          // Core features (always enabled by default)
          'atsOptimized': true,
          'keywordOptimization': true,
          'achievementsShowcase': true,
          
          // Enhancement features (selectable)
          'embedQRCode': true,
          'socialMediaLinks': false,
          'languageProficiency': false,
          'certificationBadges': false,
          
          // Advanced features (selectable)
          'skillsVisualization': false,
          'portfolioGallery': false,
          'careerTimeline': false,
          'personalityInsights': false
        };

        // If job already has selected features, use those instead
        if (job?.selectedFeatures && job.selectedFeatures.length > 0) {
          const existingSelections: Record<string, boolean> = {};
          
          // First set all to false
          Object.keys(defaults).forEach(key => {
            existingSelections[key] = false;
          });
          
          // Then enable the selected ones
          job.selectedFeatures.forEach((featureId: string) => {
            // Convert kebab-case to camelCase for the UI
            const camelCaseKey = Object.keys(FEATURE_CONFIGS).find(
              key => FEATURE_CONFIGS[key].id === featureId
            );
            if (camelCaseKey) {
              existingSelections[camelCaseKey] = true;
            }
          });
          
          setSelectedFeatures(existingSelections);
        } else {
          setSelectedFeatures(defaults);
        }
      } catch (error) {
        console.error('Error loading job data:', error);
        // Fallback to defaults if job loading fails
        setSelectedFeatures({
          'atsOptimized': true,
          'keywordOptimization': true,
          'achievementsShowcase': true,
          'embedQRCode': true,
          'socialMediaLinks': false,
          'languageProficiency': false,
          'certificationBadges': false,
          'skillsVisualization': false,
          'portfolioGallery': false,
          'careerTimeline': false,
          'personalityInsights': false
        });
      }
    };

    initializeDefaults();
  }, [jobId]);

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [featureId]: enabled
    }));
  };

  const handleSelectAll = () => {
    const allFeatureIds = Object.keys(selectedFeatures);
    const accessibleFeatures = selectAllAccessible(allFeatureIds);
    setSelectedFeatures(accessibleFeatures);
    
    if (!isPremium && getPremiumCount(allFeatureIds) > 0) {
      toast(`Selected all accessible features. Upgrade to unlock ${getPremiumCount(allFeatureIds)} premium features.`);
    }
  };

  const handleSelectNone = () => {
    const allFeatureIds = Object.keys(selectedFeatures);
    const noneSelected = selectOnlyFree(allFeatureIds);
    
    // Keep core features always enabled
    noneSelected['atsOptimized'] = true;
    noneSelected['keywordOptimization'] = true; 
    noneSelected['achievementsShowcase'] = true;
    
    setSelectedFeatures(noneSelected);
  };

  const handleContinue = async () => {
    if (!jobId || !user) {
      toast.error('Missing job ID or user authentication');
      return;
    }

    // Critical: Validate and filter features before sending to server
    const validatedFeatures = validateAndFilter();
    
    // Show warnings if any features were filtered out
    if (restrictedFeatures.length > 0) {
      toast.error(`${restrictedFeatures.length} premium features were removed. Please upgrade to access them.`);
      setShowPremiumPrompt(true);
    }

    setIsLoading(true);
    try {
      // Convert ONLY validated features to kebab-case feature IDs
      const selectedFeatureIds: string[] = [];
      
      Object.entries(validatedFeatures).forEach(([camelCaseKey, isSelected]) => {
        if (isSelected && FEATURE_CONFIGS[camelCaseKey]) {
          selectedFeatureIds.push(FEATURE_CONFIGS[camelCaseKey].id);
        }
      });

      console.log('🔒 Validated features for processing:', selectedFeatureIds);
      console.log('🚫 Restricted features filtered out:', restrictedFeatures);

      // Update job with ONLY accessible features - server will also validate
      const serverResponse = await updateJobFeatures(jobId, selectedFeatureIds);

      // Server response includes server-side validation results
      const serverValidatedCount = serverResponse.validatedFeatures.length;
      const serverRemovedCount = serverResponse.removedFeatures.length;
      
      console.log('🔒 Server validation results:', {
        requested: selectedFeatureIds.length,
        validated: serverValidatedCount,
        removed: serverRemovedCount,
        clientRestricted: restrictedFeatures.length
      });

      // Show appropriate success message based on server response
      if (serverRemovedCount > 0) {
        toast.success(serverResponse.message);
      } else if (restrictedFeatures.length > 0) {
        toast.success(`${serverValidatedCount} features selected. ${restrictedFeatures.length} premium features require upgrade.`);
      } else {
        toast.success(`${serverValidatedCount} features selected for your CV!`);
      }
      
      // Navigate to processing page
      navigate(`/process/${jobId}`);
    } catch (error: any) {
      console.error('Error updating job features:', error);
      
      // Check if error is related to premium access
      if (error.message?.includes('premium') || error.message?.includes('access')) {
        toast.error('Some features require premium access. Please upgrade or remove premium features.');
        setShowPremiumPrompt(true);
      } else {
        toast.error(error.message || 'Failed to save feature selections');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Navigate back to analysis page if we have a jobId, otherwise to home
    if (jobId) {
      navigate(`/analysis/${jobId}`);
    } else {
      navigate('/');
    }
  };

  const selectedCount = Object.values(selectedFeatures).filter(Boolean).length;
  const accessibleCount = getAccessibleCount(Object.keys(selectedFeatures));
  const premiumCount = getPremiumCount(Object.keys(selectedFeatures));
  const coreFeatures = ['atsOptimized', 'keywordOptimization', 'achievementsShowcase'];
  const coreCount = coreFeatures.filter(key => selectedFeatures[key]).length;
  const enhancementCount = selectedCount - coreCount;

  return (
    <div className="min-h-screen bg-neutral-900">
      <Header 
        currentPage="feature-selection" 
        jobId={jobId} 
        title="Customize Your CV" 
        subtitle="Select template and features to create your enhanced CV"
        variant="dark" 
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Role Context Display (if available) */}
        {roleContext?.selectedRole && (
          <Section variant="content" background="transparent" spacing="sm">
            <div className="mb-8 p-6 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-xl border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-1">
                      Role-Based Optimization Active
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Template and features optimized for <span className="text-cyan-300 font-medium">{roleContext.selectedRole.name}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">
                    {roleContext.selectedRecommendations?.length || '12'}+
                  </div>
                  <div className="text-xs text-gray-400">Recommendations</div>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Template & Features */}
          <div className="xl:col-span-2 space-y-8">
            {/* Section 1: Template Selection */}
            <Section variant="content" background="transparent" spacing="lg">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-100">Choose Your Template</h2>
                      <p className="text-sm text-gray-400">Select a professional design that matches your industry</p>
                    </div>
                  </div>
                  {roleContext?.selectedRole && (
                    <div className="text-xs text-green-400 bg-green-900/20 px-3 py-1 rounded-full border border-green-500/30">
                      Role-optimized
                    </div>
                  )}
                </div>
                
                {/* Template Grid - 3-column responsive with proper spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {PROFESSIONAL_TEMPLATES.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate === template.id}
                      onSelect={setSelectedTemplate}
                      isRoleOptimized={roleContext?.selectedRole?.category === template.category}
                    />
                  ))}
                </div>
              </div>
            </Section>

            {/* Section 2: Feature Customization */}
            <Section variant="content" background="transparent" spacing="lg">

              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-100">Feature Customization</h2>
                      <p className="text-sm text-gray-400">Select features to enhance your CV</p>
                    </div>
                  </div>
                  
                  {/* Selection Summary */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-gray-300">
                        <span className="font-semibold text-cyan-400">{coreCount}</span> Core
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">
                        <span className="font-semibold text-purple-400">{enhancementCount}</span> Enhanced
                      </span>
                    </div>
                    {!isPremium && premiumCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-300">
                          <span className="font-semibold text-yellow-400">{premiumCount}</span> Premium
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Role-Based Feature Recommendations */}
                {roleContext?.selectedRole && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-green-300 mb-1">
                          🎯 Role-Based Recommendations Applied
                        </h3>
                        <p className="text-green-200 text-sm">
                          Features optimized for {roleContext.selectedRole.name} roles
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 text-sm font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Premium Access Warning */}
                {!isPremium && restrictedFeatures.length > 0 && (
                  <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-red-300 font-medium mb-1">Premium Features Selected</h4>
                        <p className="text-red-200 text-sm mb-2">
                          {restrictedFeatures.length} selected features require premium access and will be removed during processing.
                        </p>
                        <button
                          onClick={() => navigate('/pricing')}
                          className="text-red-300 hover:text-red-200 underline text-sm transition-colors"
                        >
                          Upgrade to unlock all features →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <PremiumFeatureSelectionPanel
                  selectedFeatures={selectedFeatures}
                  onFeatureToggle={handleFeatureToggle}
                  onSelectAll={handleSelectAll}
                  onSelectNone={handleSelectNone}
                  enforceRestrictions={true}
                />
              </div>
            </Section>
          </div>

          {/* Section 3: Live Preview (Right Column) */}
          <div className="xl:col-span-1">
            <Section variant="content" background="transparent" spacing="lg">
              <LivePreview
                selectedTemplate={PROFESSIONAL_TEMPLATES.find(t => t.id === selectedTemplate) || null}
                selectedFeatures={selectedFeatures}
                previewMode={previewMode}
                onPreviewModeChange={setPreviewMode}
                jobData={jobData}
                cvData={jobData?.parsedData as any}
              />
            </Section>
          </div>
        </div>

        {/* Section 4: Action Bar - Sticky Bottom */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4 -mx-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Left Side - Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-300 hover:text-gray-100 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Roles
              </button>
            </div>
            
            {/* Center - Summary */}
            <div className="flex items-center gap-6 text-sm text-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-gray-300">
                  <span className="font-semibold text-cyan-400">{PROFESSIONAL_TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span> template
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">
                  <span className="font-semibold text-purple-400">{selectedCount}</span> features selected
                </span>
              </div>
              {!isPremium && restrictedFeatures.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-300 text-xs">
                    {restrictedFeatures.length} require upgrade
                  </span>
                </div>
              )}
            </div>
            
            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {/* Save for later functionality */}}
                className="px-4 py-2 text-gray-300 hover:text-gray-100 font-medium transition-colors hidden sm:block hover:bg-gray-800/50 rounded-lg"
              >
                Save Progress
              </button>
              
              <button
                onClick={handleContinue}
                disabled={isLoading || selectedCount === 0}
                className={`flex items-center gap-2 font-semibold py-3 px-6 rounded-lg transition-all min-w-[200px] justify-center ${
                  isLoading || selectedCount === 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : restrictedFeatures.length > 0
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : restrictedFeatures.length > 0 ? (
                  <>
                    Continue with {selectedCount - restrictedFeatures.length} Features
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Generate Enhanced CV
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Preview Info */}
        {selectedCount > 0 && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h3 className="font-medium text-blue-300 mb-2">What happens next?</h3>
            <p className="text-sm text-blue-200/80">
              Your CV will be processed with the selected features. Core features will be applied during generation, 
              while visual enhancements will be added progressively. The entire process typically takes 2-3 minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};