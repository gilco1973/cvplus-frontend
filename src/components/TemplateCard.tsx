import React from 'react';
import { CheckCircle, Crown, Star, Briefcase, Palette, Stethoscope, DollarSign, Globe, Laptop, ArrowRight } from 'lucide-react';
import { usePremiumStatus } from '../hooks/usePremiumStatus';

interface Template {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  isPremium: boolean;
  previewImage?: string;
}

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: (templateId: string) => void;
  isRoleOptimized?: boolean;
}

// Template-specific visual configurations
const templateVisualConfigs = {
  'tech-innovation': {
    primaryColor: 'blue',
    secondaryColor: 'cyan',
    icon: Laptop,
    pattern: 'tech',
    gradient: 'from-blue-500/10 via-cyan-500/5 to-blue-600/10',
    borderGradient: 'from-blue-500/30 to-cyan-500/30',
    accentElements: ['Code blocks', 'System diagrams', 'Technical skills matrix']
  },
  'executive-authority': {
    primaryColor: 'slate',
    secondaryColor: 'blue',
    icon: Briefcase,
    pattern: 'executive',
    gradient: 'from-slate-500/10 via-blue-500/5 to-slate-600/10',
    borderGradient: 'from-slate-500/30 to-blue-500/30',
    accentElements: ['Leadership metrics', 'Strategic achievements', 'Board relationships']
  },
  'creative-showcase': {
    primaryColor: 'purple',
    secondaryColor: 'pink',
    icon: Palette,
    pattern: 'creative',
    gradient: 'from-purple-500/10 via-pink-500/5 to-purple-600/10',
    borderGradient: 'from-purple-500/30 to-pink-500/30',
    accentElements: ['Portfolio gallery', 'Design philosophy', 'Creative process']
  },
  'healthcare-professional': {
    primaryColor: 'green',
    secondaryColor: 'emerald',
    icon: Stethoscope,
    pattern: 'healthcare',
    gradient: 'from-green-500/10 via-emerald-500/5 to-green-600/10',
    borderGradient: 'from-green-500/30 to-emerald-500/30',
    accentElements: ['Certifications', 'Patient care metrics', 'Medical expertise']
  },
  'financial-expert': {
    primaryColor: 'amber',
    secondaryColor: 'yellow',
    icon: DollarSign,
    pattern: 'financial',
    gradient: 'from-amber-500/10 via-yellow-500/5 to-amber-600/10',
    borderGradient: 'from-amber-500/30 to-yellow-500/30',
    accentElements: ['ROI achievements', 'Risk analysis', 'Financial modeling']
  },
  'international-professional': {
    primaryColor: 'indigo',
    secondaryColor: 'violet',
    icon: Globe,
    pattern: 'international',
    gradient: 'from-indigo-500/10 via-violet-500/5 to-indigo-600/10',
    borderGradient: 'from-indigo-500/30 to-violet-500/30',
    accentElements: ['Global experience', 'Language skills', 'Cultural adaptability']
  }
};

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  isRoleOptimized = false
}) => {
  const { isPremium } = usePremiumStatus();
  const canAccess = !template.isPremium || isPremium;
  const config = templateVisualConfigs[template.id as keyof typeof templateVisualConfigs];
  const IconComponent = config?.icon || Star;

  return (
    <button
      onClick={() => canAccess && onSelect(template.id)}
      disabled={!canAccess}
      className={`group relative rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] transform-gpu ${
        isSelected
          ? 'border-cyan-400 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-cyan-900/30 shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-400/20'
          : canAccess
          ? 'border-gray-600/50 hover:border-gray-500/70 bg-gradient-to-br from-gray-800/40 via-gray-700/30 to-gray-800/40 hover:shadow-xl hover:shadow-black/20'
          : 'border-gray-700/30 bg-gradient-to-br from-gray-800/20 via-gray-800/10 to-gray-900/20 opacity-60 cursor-not-allowed'
      }`}
      style={{ minHeight: '320px' }}
    >
      {/* Background Pattern Overlay */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config?.gradient || 'from-gray-500/5 to-gray-600/5'} opacity-50`} />
      
      {/* Top Section - Header with badges */}
      <div className="relative p-5 pb-3">
        <div className="flex items-start justify-between mb-4">
          {/* Template Icon and Title */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-cyan-400/20 text-cyan-300' 
                : canAccess
                ? 'bg-gray-600/30 text-gray-400 group-hover:bg-gray-500/40 group-hover:text-gray-300'
                : 'bg-gray-700/20 text-gray-600'
            }`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-lg leading-tight mb-1 ${
                isSelected
                  ? 'text-cyan-100'
                  : canAccess
                  ? 'text-gray-100 group-hover:text-white'
                  : 'text-gray-500'
              }`}>
                {template.name}
              </h3>
              <div className={`text-xs font-medium uppercase tracking-wider ${
                isSelected
                  ? 'text-cyan-300'
                  : canAccess
                  ? 'text-gray-400 group-hover:text-gray-300'
                  : 'text-gray-600'
              }`}>
                {template.category}
              </div>
            </div>
          </div>

          {/* Badges Stack */}
          <div className="flex flex-col gap-2 items-end">
            {/* Role-Optimized Badge */}
            {isRoleOptimized && (
              <div className="bg-green-500/20 border border-green-400/40 text-green-300 text-xs px-3 py-1 rounded-full font-semibold shadow-sm">
                ⭐ Recommended
              </div>
            )}
            
            {/* Premium Badge */}
            {template.isPremium && (
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm ${
                canAccess
                  ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/40 text-yellow-300'
                  : 'bg-gray-600/20 border border-gray-500/30 text-gray-500'
              }`}>
                <Crown className="w-3 h-3" />
                Premium
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Section - Visual Preview */}
      <div className="relative px-5 py-4">
        {/* Template Preview with Visual Elements */}
        <div className={`relative rounded-xl p-4 mb-4 border transition-all duration-300 ${
          isSelected
            ? 'bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border-cyan-400/30 shadow-inner'
            : canAccess
            ? 'bg-gradient-to-br from-gray-600/10 to-gray-700/10 border-gray-600/20 group-hover:border-gray-500/30'
            : 'bg-gradient-to-br from-gray-700/5 to-gray-800/5 border-gray-700/20'
        }`}>
          {/* Large Emoji with Enhanced Styling */}
          <div className="flex items-center justify-center mb-3">
            <div className={`text-4xl p-3 rounded-xl transition-all ${
              isSelected
                ? 'bg-cyan-400/10 shadow-lg'
                : canAccess
                ? 'bg-gray-600/20 group-hover:bg-gray-500/30 group-hover:scale-110'
                : 'bg-gray-700/10'
            }`}>
              {template.emoji}
            </div>
          </div>

          {/* Template Features Preview */}
          {config && (
            <div className="space-y-2">
              {config.accentElements.slice(0, 3).map((element, index) => (
                <div key={index} className={`flex items-center gap-2 text-xs ${
                  isSelected
                    ? 'text-cyan-200/80'
                    : canAccess
                    ? 'text-gray-400 group-hover:text-gray-300'
                    : 'text-gray-600'
                }`}>
                  <div className={`w-1 h-1 rounded-full ${
                    isSelected ? 'bg-cyan-400' : 'bg-gray-500'
                  }`} />
                  {element}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <p className={`text-sm leading-relaxed mb-3 ${
          isSelected
            ? 'text-cyan-200/90'
            : canAccess
            ? 'text-gray-300 group-hover:text-gray-200'
            : 'text-gray-600'
        }`}>
          {template.description}
        </p>

        {/* Premium Lock Message */}
        {!canAccess && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
            <Crown className="w-4 h-4" />
            <span>Upgrade to unlock this template</span>
          </div>
        )}

        {/* Interactive Call-to-Action */}
        {canAccess && (
          <div className={`flex items-center justify-between pt-3 border-t transition-colors ${
            isSelected
              ? 'border-cyan-400/20'
              : 'border-gray-600/20 group-hover:border-gray-500/30'
          }`}>
            <span className={`text-sm font-medium ${
              isSelected
                ? 'text-cyan-300'
                : 'text-gray-400 group-hover:text-gray-300'
            }`}>
              {isSelected ? 'Selected' : 'Select Template'}
            </span>
            
            {isSelected ? (
              <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            ) : (
              <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                canAccess ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600'
              }`} />
            )}
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      {canAccess && !isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </button>
  );
};