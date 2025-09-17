import React from 'react';
import { 
  Brain, FileText, CreditCard, Settings, Shield, Zap,
  Users, HelpCircle, Smartphone, Globe, ArrowRight
} from 'lucide-react';
import { CategoryGridProps } from './types';

const getCategoryIcon = (iconName: string) => {
  const iconMap = {
    'brain': Brain,
    'file-text': FileText,
    'credit-card': CreditCard,
    'settings': Settings,
    'shield': Shield,
    'zap': Zap,
    'users': Users,
    'help-circle': HelpCircle,
    'smartphone': Smartphone,
    'globe': Globe
  };
  
  return iconMap[iconName as keyof typeof iconMap] || HelpCircle;
};

export const FAQCategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {/* All Categories Card */}
      <button
        onClick={() => onCategorySelect('all')}
        className={`
          group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
          hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30
          ${selectedCategory === 'all' 
            ? 'border-cyan-400 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 shadow-lg shadow-cyan-400/20' 
            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
          }
        `}
        aria-pressed={selectedCategory === 'all'}
        role="tab"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`
            p-3 rounded-xl transition-all duration-300
            ${selectedCategory === 'all'
              ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
            }
          `}>
            <Globe className="w-6 h-6" />
          </div>
          
          <ArrowRight className={`
            w-5 h-5 transition-all duration-300 opacity-0 group-hover:opacity-100 
            ${selectedCategory === 'all' ? 'text-cyan-400' : 'text-gray-400'}
          `} />
        </div>

        <h3 className={`
          text-lg font-semibold mb-2 transition-colors duration-300
          ${selectedCategory === 'all' ? 'text-cyan-400' : 'text-gray-100 group-hover:text-white'}
        `}>
          All Categories
        </h3>
        
        <p className="text-gray-400 text-sm mb-3 group-hover:text-gray-300">
          Browse all frequently asked questions
        </p>
        
        <div className="flex items-center justify-between">
          <span className={`
            text-xs font-medium px-2 py-1 rounded-full
            ${selectedCategory === 'all'
              ? 'bg-cyan-400/20 text-cyan-400'
              : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
            }
          `}>
            {categories.reduce((total, cat) => total + cat.count, 0)} total
          </span>
        </div>

        {selectedCategory === 'all' && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/5 to-blue-500/5 pointer-events-none" />
        )}
      </button>

      {/* Category Cards */}
      {categories.map((category) => {
        const IconComponent = getCategoryIcon(category.icon);
        const isSelected = selectedCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`
              group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
              hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30
              ${isSelected 
                ? 'border-cyan-400 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 shadow-lg shadow-cyan-400/20' 
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
              }
            `}
            aria-pressed={isSelected}
            role="tab"
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className={`
                  p-3 rounded-xl transition-all duration-300
                  ${isSelected
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                  }
                `}
                style={!isSelected ? { backgroundColor: `${category.color}20` } : {}}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              
              <ArrowRight className={`
                w-5 h-5 transition-all duration-300 opacity-0 group-hover:opacity-100 
                ${isSelected ? 'text-cyan-400' : 'text-gray-400'}
              `} />
            </div>

            <h3 className={`
              text-lg font-semibold mb-2 transition-colors duration-300
              ${isSelected ? 'text-cyan-400' : 'text-gray-100 group-hover:text-white'}
            `}>
              {category.name}
            </h3>
            
            <p className="text-gray-400 text-sm mb-3 group-hover:text-gray-300">
              {category.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className={`
                text-xs font-medium px-2 py-1 rounded-full
                ${isSelected
                  ? 'bg-cyan-400/20 text-cyan-400'
                  : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                }
              `}>
                {category.count} questions
              </span>
            </div>

            {isSelected && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/5 to-blue-500/5 pointer-events-none" />
            )}

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div 
                className="absolute inset-0 rounded-2xl blur-xl opacity-20"
                style={{ backgroundColor: category.color }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};