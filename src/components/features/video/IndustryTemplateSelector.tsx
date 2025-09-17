import React, { useState } from 'react';
import { X, CheckCircle, Star, Award, Briefcase, Code, DollarSign, Users, Palette, Brain, Search } from 'lucide-react';

interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  preview: string;
  tags: string[];
  qualityScore: number;
  popularity: number;
  duration: 'short' | 'medium' | 'long';
}

interface IndustryTemplateSelectorProps {
  selectedTemplate: IndustryTemplate | null;
  onSelectTemplate: (template: IndustryTemplate) => void;
  onClose: () => void;
}

const industryTemplates: IndustryTemplate[] = [
  {
    id: 'tech-senior',
    name: 'Senior Tech Professional',
    industry: 'Technology',
    description: 'Emphasizes technical expertise, innovation, and leadership in software development',
    preview: 'Hi, I\'m [Name], a senior software engineer passionate about building scalable solutions that drive innovation. With expertise in [skills], I\'ve led teams to deliver cutting-edge products...',
    tags: ['Leadership', 'Innovation', 'Scalability', 'Team Management'],
    qualityScore: 9.2,
    popularity: 95,
    duration: 'medium'
  },
  {
    id: 'tech-startup',
    name: 'Startup Tech Founder',
    industry: 'Technology',
    description: 'Focused on entrepreneurship, disruption, and rapid growth',
    preview: 'I\'m [Name], founder of [company], where we\'re revolutionizing [industry] through innovative technology. Our team has built solutions that scale from zero to millions...',
    tags: ['Entrepreneurship', 'Growth', 'Innovation', 'Vision'],
    qualityScore: 8.9,
    popularity: 78,
    duration: 'short'
  },
  {
    id: 'marketing-growth',
    name: 'Growth Marketing Expert',
    industry: 'Marketing',
    description: 'Results-driven approach highlighting conversion optimization and ROI',
    preview: 'Hello! I\'m [Name], a growth marketing specialist who has driven 300% revenue growth for B2B companies. I specialize in data-driven strategies that convert...',
    tags: ['ROI', 'Conversion', 'Analytics', 'Growth Hacking'],
    qualityScore: 9.1,
    popularity: 87,
    duration: 'medium'
  },
  {
    id: 'marketing-brand',
    name: 'Brand Strategist',
    industry: 'Marketing',
    description: 'Creative storytelling focused on brand building and audience engagement',
    preview: 'I\'m [Name], a brand strategist who believes in the power of authentic storytelling. I\'ve helped brands connect with millions of customers through compelling narratives...',
    tags: ['Storytelling', 'Brand Building', 'Creativity', 'Engagement'],
    qualityScore: 8.7,
    popularity: 72,
    duration: 'long'
  },
  {
    id: 'finance-analyst',
    name: 'Financial Analyst',
    industry: 'Finance',
    description: 'Analytical approach emphasizing precision, risk management, and strategic insights',
    preview: 'I\'m [Name], a financial analyst with expertise in risk assessment and strategic planning. I\'ve helped companies optimize their financial performance through data-driven insights...',
    tags: ['Risk Management', 'Analysis', 'Strategy', 'Compliance'],
    qualityScore: 9.0,
    popularity: 83,
    duration: 'medium'
  },
  {
    id: 'finance-advisor',
    name: 'Investment Advisor',
    industry: 'Finance',
    description: 'Trust-building approach focused on client relationships and portfolio management',
    preview: 'Hello, I\'m [Name], an investment advisor dedicated to helping clients achieve their financial goals. With [years] of experience in portfolio management...',
    tags: ['Client Relations', 'Portfolio Management', 'Trust', 'Wealth Building'],
    qualityScore: 8.8,
    popularity: 69,
    duration: 'long'
  },
  {
    id: 'consulting-strategy',
    name: 'Strategy Consultant',
    industry: 'Consulting',
    description: 'Problem-solving approach highlighting analytical thinking and business transformation',
    preview: 'I\'m [Name], a strategy consultant who helps organizations navigate complex business challenges. I\'ve led transformation initiatives that delivered measurable results...',
    tags: ['Problem Solving', 'Transformation', 'Analytics', 'Leadership'],
    qualityScore: 9.3,
    popularity: 91,
    duration: 'medium'
  },
  {
    id: 'healthcare-professional',
    name: 'Healthcare Professional',
    industry: 'Healthcare',
    description: 'Compassionate approach emphasizing patient care and medical expertise',
    preview: 'Hello, I\'m Dr. [Name], dedicated to providing exceptional patient care through evidence-based medicine. My commitment is to improving health outcomes...',
    tags: ['Patient Care', 'Medical Expertise', 'Compassion', 'Evidence-Based'],
    qualityScore: 9.1,
    popularity: 85,
    duration: 'medium'
  }
];

export const IndustryTemplateSelector: React.FC<IndustryTemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const industries = ['All', 'Technology', 'Marketing', 'Finance', 'Consulting', 'Healthcare'];
  
  const getIndustryIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'technology': return <Code className="w-5 h-5 text-cyan-400" />;
      case 'marketing': return <Palette className="w-5 h-5 text-pink-400" />;
      case 'finance': return <DollarSign className="w-5 h-5 text-green-400" />;
      case 'consulting': return <Brain className="w-5 h-5 text-purple-400" />;
      case 'healthcare': return <Users className="w-5 h-5 text-blue-400" />;
      default: return <Briefcase className="w-5 h-5 text-gray-400" />;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 9) return 'text-green-400';
    if (score >= 8) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredTemplates = industryTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'All' || template.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-400" />
              Industry-Specific Templates
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Choose a professionally optimized template tailored to your industry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates, descriptions, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            
            {/* Industry Filter */}
            <div className="flex gap-2 flex-wrap">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => setSelectedIndustry(industry)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedIndustry === industry
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id;
              
              return (
                <div
                  key={template.id}
                  className={`relative bg-gray-900 rounded-lg p-6 border-2 transition-all cursor-pointer hover:scale-105 ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-900/20' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => onSelectTemplate(template)}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Template Header */}
                  <div className="flex items-start gap-3 mb-4">
                    {getIndustryIcon(template.industry)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-100">{template.name}</h3>
                      <p className="text-sm text-gray-400">{template.industry}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getQualityColor(template.qualityScore)}`}>
                        {template.qualityScore}/10
                      </div>
                      <div className="text-xs text-gray-500">Quality</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-4">{template.description}</p>

                  {/* Preview */}
                  <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                    <h4 className="text-xs font-medium text-gray-400 mb-2">Script Preview:</h4>
                    <p className="text-xs text-gray-300 italic leading-relaxed line-clamp-3">
                      {template.preview}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>Popular: {template.popularity}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="capitalize">{template.duration} length</span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className={`text-center text-sm font-medium ${
                      isSelected ? 'text-purple-400' : 'text-gray-500'
                    }`}>
                      {isSelected ? 'Selected Template' : 'Click to Select'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No Templates Found</h3>
              <p className="text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            {selectedTemplate && (
              <span className="ml-2 text-purple-400">
                • {selectedTemplate.name} selected
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedTemplate && onSelectTemplate(selectedTemplate)}
              disabled={!selectedTemplate}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryTemplateSelector;