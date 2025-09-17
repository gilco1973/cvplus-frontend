/**
 * Template Selection Component - Enhanced with all 8 professional templates
 */

interface TemplateSelectionProps {
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
}

export const TemplateSelection = ({ selectedTemplate, setSelectedTemplate }: TemplateSelectionProps) => {
  const templates = [
    { 
      id: 'executive-authority', 
      name: 'Executive Authority', 
      emoji: '👔', 
      description: 'Commanding presence for C-suite and senior leadership roles',
      category: 'executive',
      isPremium: true
    },
    { 
      id: 'tech-innovation', 
      name: 'Tech Innovation', 
      emoji: '💻', 
      description: 'Clean, systematic design perfect for software engineers',
      category: 'technical',
      isPremium: false
    },
    { 
      id: 'creative-showcase', 
      name: 'Creative Showcase', 
      emoji: '🎨', 
      description: 'Bold, expressive design for creative professionals',
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
      id: 'academic-scholar', 
      name: 'Academic Scholar', 
      emoji: '🎓', 
      description: 'Scholarly design for educators and researchers',
      category: 'academic',
      isPremium: false
    },
    { 
      id: 'sales-performance', 
      name: 'Sales Performance', 
      emoji: '📈', 
      description: 'Dynamic, results-focused design for sales professionals',
      category: 'sales',
      isPremium: false
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

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <span className="text-2xl">🎯</span>
          Professional CV Templates
        </h3>
        <p className="text-sm text-gray-400">
          Choose from 8 industry-optimized professional templates
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all relative overflow-hidden ${
              selectedTemplate === template.id
                ? 'border-blue-400 bg-blue-900/30 text-blue-300'
                : 'border-gray-600 hover:border-gray-500 text-gray-300 bg-gray-700/50'
            } ${template.isPremium ? 'ring-1 ring-yellow-400/20' : ''}`}
          >
            {template.isPremium && (
              <div className="absolute top-2 right-2">
                <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                  Premium
                </span>
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{template.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm break-words leading-tight">{template.name}</div>
                  <div className="text-xs text-gray-500 capitalize truncate">{template.category}</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed break-words">
                {template.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};