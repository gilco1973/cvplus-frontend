/**
 * Enhanced Templates Page
 * Demonstrates integration of the new professional template system
 * Maintains backward compatibility while showcasing new features
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateCV } from '../services/cvService';
import { CVServiceCore } from '../services/cv/CVServiceCore';
import { Loader2, Clock, Star, Award, Zap, Globe } from 'lucide-react';
import { designSystem } from '../config/designSystem';
import toast from 'react-hot-toast';
import {
  templateSelectionService,
  enhancedCVGenerationService,
  getTemplatesForPage,
  trackSelection,
  isValidTemplateId,
  getTemplateCapabilities
} from '../services/template-integration';
import {
  getAllTemplates,
  getTemplatesByCategory,
  getAnalyticsSummary
} from '../services/template-registry';
import type { TemplateCategory, ExperienceLevel } from '../types/cv-templates';

// ============================================================================
// ENHANCED TEMPLATE INTERFACE
// ============================================================================

interface EnhancedTemplateDisplay {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: TemplateCategory;
  isPremium: boolean;
  rating: number;
  features: string[];
  atsScore: number;
  estimatedTime: string;
}

// ============================================================================
// CATEGORY CONFIGURATION
// ============================================================================

const CATEGORY_CONFIG: Record<TemplateCategory, {
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}> = {
  executive: {
    name: 'Executive',
    icon: <Award className="w-5 h-5" />,
    description: 'C-suite & senior leadership',
    color: 'bg-blue-500'
  },
  technical: {
    name: 'Technical',
    icon: <Zap className="w-5 h-5" />,
    description: 'Engineering & IT professionals',
    color: 'bg-purple-500'
  },
  creative: {
    name: 'Creative',
    icon: <Star className="w-5 h-5" />,
    description: 'Design & creative roles',
    color: 'bg-pink-500'
  },
  healthcare: {
    name: 'Healthcare',
    icon: <Globe className="w-5 h-5" />,
    description: 'Medical professionals',
    color: 'bg-green-500'
  },
  financial: {
    name: 'Financial',
    icon: <Globe className="w-5 h-5" />,
    description: 'Finance sector',
    color: 'bg-emerald-500'
  },
  academic: {
    name: 'Academic',
    icon: <Globe className="w-5 h-5" />,
    description: 'Education & research',
    color: 'bg-indigo-500'
  },
  sales: {
    name: 'Sales',
    icon: <Globe className="w-5 h-5" />,
    description: 'Sales professionals',
    color: 'bg-orange-500'
  },
  international: {
    name: 'International',
    icon: <Globe className="w-5 h-5" />,
    description: 'Global roles',
    color: 'bg-teal-500'
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EnhancedTemplatesPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  // State management
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState<EnhancedTemplateDisplay[]>([]);
  const [recommendedTemplates, setRecommendedTemplates] = useState<string[]>([]);
  const [asyncMode] = useState(CVServiceCore.isAsyncCVGenerationEnabled());

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    initializeTemplates();
    loadRecommendations();
  }, []);

  const initializeTemplates = () => {
    try {
      const allTemplates = getAllTemplates();
      
      const enhancedTemplates: EnhancedTemplateDisplay[] = allTemplates.map(template => {
        const capabilities = getTemplateCapabilities(template.id);
        
        return {
          id: template.id,
          name: template.name,
          description: template.description,
          preview: template.preview.previewEmoji,
          category: template.category,
          isPremium: template.metadata.isPremium,
          rating: template.metadata.rating,
          features: capabilities?.features || [],
          atsScore: template.ats.formats.ats.compatibility.score,
          estimatedTime: capabilities?.estimatedGenerationTime || '30 seconds'
        };
      });
      
      setTemplates(enhancedTemplates);
      
      // Auto-select first template if none selected
      if (!selectedTemplate && enhancedTemplates.length > 0) {
        setSelectedTemplate(enhancedTemplates[0].id);
      }
      
      console.log('✅ Enhanced templates loaded:', enhancedTemplates.length);
    } catch (error) {
      console.error('❌ Failed to initialize templates:', error);
      toast.error('Failed to load templates. Using fallback options.');
      
      // Fallback to legacy templates
      const fallbackTemplates = getTemplatesForPage();
      const fallbackEnhanced: EnhancedTemplateDisplay[] = fallbackTemplates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        preview: template.preview,
        category: 'technical' as TemplateCategory,
        isPremium: false,
        rating: 4.0,
        features: ['Basic Features'],
        atsScore: 80,
        estimatedTime: '30 seconds'
      }));
      
      setTemplates(fallbackEnhanced);
      if (fallbackEnhanced.length > 0) {
        setSelectedTemplate(fallbackEnhanced[0].id);
      }
    }
  };

  const loadRecommendations = () => {
    try {
      // Set user profile based on job context or defaults
      templateSelectionService.setUserProfile({
        experienceLevel: 'mid' as ExperienceLevel,
        preferences: ['ats-compatible', 'modern', 'professional']
      });
      
      const recommended = templateSelectionService.getRecommendations(3);
      setRecommendedTemplates(recommended.map(t => t.id));
      
      console.log('🎨 Template recommendations loaded:', recommended.length);
    } catch (error) {
      console.error('⚠️ Failed to load recommendations:', error);
    }
  };

  // ============================================================================
  // TEMPLATE FILTERING
  // ============================================================================

  const filteredTemplates = templates.filter(template => {
    if (activeCategory === 'all') return true;
    return template.category === activeCategory;
  });

  // ============================================================================
  // CV GENERATION
  // ============================================================================

  const handleGenerateCV = async () => {
    if (!jobId || !selectedTemplate) return;

    const defaultFeatures = ['ats-optimization', 'keyword-enhancement', 'achievement-highlighting'];

    try {
      // Track template selection
      trackSelection(selectedTemplate, jobId);
      
      if (asyncMode) {
        console.log('🚀 [ASYNC MODE] Initiating enhanced CV generation...');
        setIsInitializing(true);
        
        const initResponse = await CVServiceCore.initiateCVGeneration({
          jobId,
          templateId: selectedTemplate,
          features: defaultFeatures
        });
        
        const generationConfig = {
          jobId,
          templateId: selectedTemplate,
          features: defaultFeatures,
          asyncMode: true,
          enhanced: true, // Flag for enhanced template system
          initResponse,
          timestamp: new Date().toISOString()
        };
        
        sessionStorage.setItem(`generation-config-${jobId}`, JSON.stringify(generationConfig));
        
        const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
        toast.success(`🎨 Generating ${selectedTemplateData?.name} CV! Redirecting...`);
        
        navigate(`/results/${jobId}`);
        
      } else {
        console.log('🔄 [SYNC MODE] Generating enhanced CV synchronously...');
        setIsGenerating(true);
        
        // Use enhanced generation service
        const result = await enhancedCVGenerationService.generateCV({
          templateId: selectedTemplate,
          cvData: {}, // Would be populated with actual CV data
          jobId,
          features: defaultFeatures
        });
        
        if (result.success) {
          toast.success(`✅ ${result.metadata.templateName} CV generated successfully!`);
          navigate(`/results/${jobId}`);
        } else {
          throw new Error(result.error || 'Generation failed');
        }
      }
    } catch (error: unknown) {
      console.error('❌ Error in enhanced CV generation:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`❌ Failed to generate CV: ${errorMessage}`);
    } finally {
      setIsInitializing(false);
      setIsGenerating(false);
    }
  };

  // ============================================================================
  // TEMPLATE SELECTION
  // ============================================================================

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast.success(`🎨 ${template.name} template selected`);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderTemplateCard = (template: EnhancedTemplateDisplay) => {
    const isSelected = selectedTemplate === template.id;
    const isRecommended = recommendedTemplates.includes(template.id);
    const categoryConfig = CATEGORY_CONFIG[template.category];
    
    return (
      <div
        key={template.id}
        onClick={() => handleTemplateSelect(template.id)}
        className={`${
          designSystem.components.card.base
        } ${
          designSystem.components.card.variants.interactive
        } ${
          designSystem.components.card.padding.md
        } cursor-pointer transition-all duration-300 relative ${
          isSelected
            ? 'ring-2 ring-blue-600 transform scale-105 shadow-xl'
            : 'hover:shadow-xl hover:transform hover:scale-102'
        }`}
      >
        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            ⭐ Premium
          </div>
        )}
        
        {/* Recommended Badge */}
        {isRecommended && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-green-400 to-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            🎨 Recommended
          </div>
        )}
        
        {/* Template Preview */}
        <div className="text-6xl mb-4 text-center">{template.preview}</div>
        
        {/* Template Info */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold mb-1">{template.name}</h3>
            <p className="text-gray-600 text-sm">{template.description}</p>
          </div>
          
          {/* Category Badge */}
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${categoryConfig.color} text-white px-2 py-1 rounded-full text-xs`}>
              {categoryConfig.icon}
              <span>{categoryConfig.name}</span>
            </div>
            
            {/* Rating */}
            <div className="flex items-center space-x-1 text-yellow-500 text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>{template.rating}</span>
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-700">Features:</div>
            <div className="flex flex-wrap gap-1">
              {template.features.slice(0, 3).map((feature, index) => (
                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
              {template.features.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{template.features.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          {/* ATS Score */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">ATS Score:</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                template.atsScore >= 90 ? 'bg-green-500' : 
                template.atsScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="font-medium">{template.atsScore}%</span>
            </div>
          </div>
          
          {/* Generation Time */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Est. Generation:</span>
            <span>{template.estimatedTime}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryTabs = () => {
    const categories: Array<TemplateCategory | 'all'> = ['all', ...Object.keys(CATEGORY_CONFIG) as TemplateCategory[]];
    
    return (
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          const categoryInfo = category === 'all' 
            ? { name: 'All Templates', icon: <Globe className="w-4 h-4" />, color: 'bg-gray-500' }
            : CATEGORY_CONFIG[category];
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {categoryInfo.icon}
              <span>{categoryInfo.name}</span>
              <span className="text-xs opacity-75">
                ({category === 'all' ? templates.length : templates.filter(t => t.category === category).length})
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-neutral-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Professional CV Template
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select from our collection of industry-optimized, ATS-compatible templates designed by professionals for professionals.
          </p>
          
          {/* Analytics Summary */}
          <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-500">
            <div>
              <span className="font-medium text-gray-900">{templates.length}</span> Professional Templates
            </div>
            <div>
              <span className="font-medium text-gray-900">95%</span> Average ATS Score
            </div>
            <div>
              <span className="font-medium text-gray-900">4.6</span> Average Rating
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        {renderCategoryTabs()}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredTemplates.map(renderTemplateCard)}
        </div>

        {/* Generation Button */}
        <div className="text-center">
          <button
            onClick={handleGenerateCV}
            disabled={isGenerating || isInitializing || !selectedTemplate}
            className={`${
              designSystem.components.button.base
            } ${
              designSystem.components.button.variants.primary.default
            } ${
              designSystem.components.button.sizes.xl
            } font-medium transition-all transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            {isInitializing ? (
              <>
                <Clock className="inline-block w-5 h-5 mr-2 animate-pulse" />
                Initializing Enhanced Generation...
              </>
            ) : isGenerating ? (
              <>
                <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" />
                Creating Your Professional CV...
              </>
            ) : (
              <>
                <Zap className="inline-block w-5 h-5 mr-2" />
                Generate My Professional CV{asyncMode ? ' (Fast Track)' : ''}
              </>
            )}
          </button>
          
          {/* Selected Template Info */}
          {selectedTemplate && (
            <div className="mt-4 text-sm text-gray-600">
              Selected: <span className="font-medium text-gray-900">
                {templates.find(t => t.id === selectedTemplate)?.name}
              </span>
              {asyncMode && (
                <div className="mt-2">
                  <span className="text-green-600 font-medium">
                    ⚡ Fast Track Mode: Real-time progress tracking enabled
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTemplatesPage;
