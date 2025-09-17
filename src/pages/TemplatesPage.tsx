import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateCV } from '../services/cvService';
import { CVServiceCore } from '../services/cv/CVServiceCore';
import { Loader2, Clock, Star, Award, Zap } from 'lucide-react';
import { designSystem } from '../config/designSystem';
import toast from 'react-hot-toast';

// Simplified professional templates for immediate display
const PROFESSIONAL_TEMPLATES_DISPLAY = [
  {
    id: 'executive-authority',
    name: 'Executive Authority',
    description: 'Commanding presence for C-suite and senior leadership roles. Sophisticated design that projects executive gravitas and strategic thinking.',
    preview: '👔',
    category: 'executive',
    targetRoles: ['CEO', 'CFO', 'CTO', 'VP', 'Director', 'General Manager', 'Senior Executive'],
    experienceLevel: ['senior', 'executive'],
    industries: ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting'],
    isPremium: true,
    isDefault: false,
    popularity: 95,
    rating: 4.8
  },
  {
    id: 'tech-innovation',
    name: 'Tech Innovation',
    description: 'Clean, systematic design perfect for software engineers, developers, and technology professionals. Skills-first layout with technical project showcases.',
    preview: '💻',
    category: 'technical',
    targetRoles: ['Software Engineer', 'Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager', 'Technical Lead'],
    experienceLevel: ['entry', 'mid', 'senior'],
    industries: ['Technology', 'Software', 'Startups', 'E-commerce', 'Gaming'],
    isPremium: false,
    isDefault: true,
    popularity: 88,
    rating: 4.7
  },
  {
    id: 'creative-showcase',
    name: 'Creative Showcase',
    description: 'Bold, expressive design for creative professionals. Portfolio-integrated layout with vibrant colors and unique visual elements that showcase creativity.',
    preview: '🎨',
    category: 'creative',
    targetRoles: ['Graphic Designer', 'Creative Director', 'UX Designer', 'Art Director', 'Photographer', 'Writer'],
    experienceLevel: ['mid', 'senior', 'specialized'],
    industries: ['Design', 'Advertising', 'Media', 'Entertainment', 'Fashion', 'Arts'],
    isPremium: true,
    isDefault: false,
    popularity: 82,
    rating: 4.6
  },
  {
    id: 'healthcare-professional',
    name: 'Healthcare Professional',
    description: 'Clean, trustworthy design for medical professionals. Credentials-focused layout with emphasis on patient care and medical certifications.',
    preview: '🏥',
    category: 'healthcare',
    targetRoles: ['Doctor', 'Nurse', 'Physician Assistant', 'Medical Technician', 'Healthcare Administrator', 'Therapist'],
    experienceLevel: ['entry', 'mid', 'senior', 'specialized'],
    industries: ['Healthcare', 'Medical', 'Pharmaceutical', 'Biotechnology', 'Mental Health'],
    isPremium: false,
    isDefault: false,
    popularity: 78,
    rating: 4.5
  },
  {
    id: 'financial-expert',
    name: 'Financial Expert',
    description: 'Conservative, stable design for finance sector professionals. Achievement-focused layout with financial metrics and regulatory compliance emphasis.',
    preview: '💼',
    category: 'financial',
    targetRoles: ['Financial Analyst', 'Investment Banker', 'CPA', 'CFO', 'Portfolio Manager', 'Financial Advisor'],
    experienceLevel: ['mid', 'senior', 'executive'],
    industries: ['Banking', 'Investment', 'Insurance', 'Accounting', 'Financial Services', 'Real Estate'],
    isPremium: true,
    isDefault: false,
    popularity: 85,
    rating: 4.7
  },
  {
    id: 'academic-scholar',
    name: 'Academic Scholar',
    description: 'Scholarly design for educators and researchers. Research-focused layout with publication prominence and academic achievement highlights.',
    preview: '🎓',
    category: 'academic',
    targetRoles: ['Professor', 'Researcher', 'PhD Candidate', 'Lecturer', 'Academic Administrator', 'Postdoc'],
    experienceLevel: ['entry', 'mid', 'senior', 'specialized'],
    industries: ['Education', 'Research', 'Universities', 'Think Tanks', 'Government Research'],
    isPremium: false,
    isDefault: false,
    popularity: 72,
    rating: 4.6
  },
  {
    id: 'sales-performance',
    name: 'Sales Performance',
    description: 'Dynamic, results-focused design for sales professionals. Performance dashboard layout with achievement metrics and client success stories.',
    preview: '📈',
    category: 'sales',
    targetRoles: ['Sales Representative', 'Account Manager', 'Sales Director', 'Business Development', 'Sales Engineer'],
    experienceLevel: ['entry', 'mid', 'senior'],
    industries: ['Sales', 'Business Development', 'Technology Sales', 'Pharmaceutical Sales', 'Real Estate'],
    isPremium: false,
    isDefault: false,
    popularity: 80,
    rating: 4.5
  },
  {
    id: 'international-professional',
    name: 'International Professional',
    description: 'Universal design for global and multicultural roles. Clean, accessible layout with emphasis on cross-cultural competencies and international experience.',
    preview: '🌍',
    category: 'international',
    targetRoles: ['International Manager', 'Global Consultant', 'Diplomat', 'Export Manager', 'Multicultural Specialist'],
    experienceLevel: ['mid', 'senior', 'executive', 'specialized'],
    industries: ['International Business', 'Consulting', 'Government', 'NGO', 'Import/Export', 'Tourism'],
    isPremium: false,
    isDefault: false,
    popularity: 68,
    rating: 4.4
  }
];

const templates = PROFESSIONAL_TEMPLATES_DISPLAY;

// Debug: Log template data for troubleshooting
console.log('💼 Templates loaded:', templates.length, 'templates');
console.log('📋 Template categories:', [...new Set(templates.map(t => t.category))]);

export const TemplatesPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState('tech-innovation'); // Default to a free template
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [asyncMode, setAsyncMode] = useState(CVServiceCore.isAsyncCVGenerationEnabled());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? templates
    : templates.filter(template => template.category === selectedCategory);
  
  // Fallback if no templates are available
  if (!templates || templates.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Templates Not Available</h2>
          <p className="text-gray-600">Unable to load professional templates. Please refresh the page or contact support.</p>
        </div>
      </div>
    );
  }
  
  // Show debug info in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📋 Filtered templates:', filteredTemplates.length);
    console.log('📍 Selected category:', selectedCategory);
    console.log('🎯 Selected template:', selectedTemplate);
  }
  
  // Get unique categories for filter buttons
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  
  // Get selected template data for enhanced display
  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const handleGenerateCV = async () => {
    if (!jobId) return;

    // Default features for TemplatesPage (enhanced CV with ATS optimization)
    const defaultFeatures = ['ats-optimization', 'keyword-enhancement', 'achievement-highlighting'];

    try {
      if (asyncMode) {
        // Async mode: initiate CV generation and navigate immediately
        console.log('🚀 [ASYNC MODE] Initiating CV generation...');
        setIsInitializing(true);
        
        const initResponse = await CVServiceCore.initiateCVGeneration({
          jobId,
          templateId: selectedTemplate,
          features: defaultFeatures
        });
        
        // Store initialization response for FinalResultsPage
        try {
          const generationConfig = {
            jobId,
            templateId: selectedTemplate,
            features: defaultFeatures,
            asyncMode: true,
            initResponse,
            timestamp: new Date().toISOString()
          };
          sessionStorage.setItem(`generation-config-${jobId}`, JSON.stringify(generationConfig));
          console.log('💾 [ASYNC] Stored generation config:', generationConfig);
        } catch (storageError) {
          console.warn('Failed to store generation config:', storageError);
        }
        
        toast.success('CV generation initiated! Redirecting to progress...');
        
        // Navigate immediately to show real-time progress
        navigate(`/results/${jobId}`);
        
      } else {
        // Sync mode: wait for completion then navigate (original behavior)
        console.log('🔄 [SYNC MODE] Generating CV synchronously...');
        setIsGenerating(true);
        
        await generateCV(jobId, selectedTemplate, defaultFeatures);
        toast.success('CV generated successfully!');
        navigate(`/results/${jobId}`);
      }
    } catch (error: unknown) {
      console.error('Error in CV generation:', error);
      
      // Show appropriate error message based on mode
      if (asyncMode) {
        toast.error('Failed to initialize CV generation. Please try again.');
      } else {
        toast.error('Failed to generate CV. Please try again.');
      }
    } finally {
      setIsInitializing(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Professional CV Template</h1>
          <p className="text-xl text-gray-600 mb-8">Select from {templates.length} industry-optimized templates designed for maximum impact</p>
          
          {/* Template Summary */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-green-600">{templates.filter(t => !t.isPremium).length} Free</span>
              {" • "}
              <span className="font-medium text-orange-600">{templates.filter(t => t.isPremium).length} Premium</span>
              {" • "}
              <span className="font-medium text-blue-600">{filteredTemplates.length} Available</span>
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                {category === 'all' ? 'All Templates' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`relative bg-white rounded-xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedTemplate === template.id
                  ? 'ring-4 ring-blue-500 shadow-2xl scale-105'
                  : 'hover:shadow-xl'
              }`}
            >
              {/* Premium Badge */}
              {template.isPremium && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Premium
                </div>
              )}
              
              {/* Default Badge */}
              {template.isDefault && (
                <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  Recommended
                </div>
              )}
              
              <div className="p-6">
                {/* Template Preview */}
                <div className="text-6xl mb-4 text-center">{template.preview}</div>
                
                {/* Template Info */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{template.description}</p>
                
                {/* Rating and Popularity */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{template.rating}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {template.popularity}% popular
                  </div>
                </div>
                
                {/* Target Roles */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-700 mb-1">Perfect for:</div>
                  <div className="flex flex-wrap gap-1">
                    {template.targetRoles.slice(0, 2).map((role) => (
                      <span key={role} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {role}
                      </span>
                    ))}
                    {template.targetRoles.length > 2 && (
                      <span className="text-xs text-gray-500">+{template.targetRoles.length - 2} more</span>
                    )}
                  </div>
                </div>
                
                {/* Industries */}
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">Industries:</div>
                  <div className="text-xs text-gray-600">
                    {template.industries.slice(0, 3).join(', ')}
                    {template.industries.length > 3 && `, +${template.industries.length - 3} more`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Selected Template Details */}
        {selectedTemplateData && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-start gap-6">
              <div className="text-8xl">{selectedTemplateData.preview}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-3xl font-bold text-gray-900">{selectedTemplateData.name}</h2>
                  {selectedTemplateData.isPremium && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-700 mb-4">{selectedTemplateData.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Target Roles
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedTemplateData.targetRoles.slice(0, 4).map(role => (
                        <li key={role}>• {role}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Experience Levels
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplateData.experienceLevel.map(level => (
                        <span key={level} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded capitalize">
                          {level}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Industries</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplateData.industries.slice(0, 3).map(industry => (
                        <span key={industry} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleGenerateCV}
            disabled={isGenerating || isInitializing}
            className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.lg} font-medium transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            {isInitializing ? (
              <>
                <Clock className="inline-block w-5 h-5 mr-2 animate-pulse" />
                Initializing CV Generation...
              </>
            ) : isGenerating ? (
              <>
                <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" />
                Generating Your CV...
              </>
            ) : (
              `Generate My Enhanced CV${asyncMode ? ' (Fast Track)' : ''}`
            )}
          </button>
          
          {/* Mode Indicator */}
          {asyncMode && (
            <div className="text-center mt-3">
              <p className="text-sm text-gray-400">
                ⚡ Fast Track Mode: Real-time progress tracking enabled
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};