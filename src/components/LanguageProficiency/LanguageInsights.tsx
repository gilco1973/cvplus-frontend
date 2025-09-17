/**
 * Language Insights Component
 * Displays analytics and recommendations for language proficiencies
 */

import React from 'react';
import { TrendingUp, Globe, Award, Users, Lightbulb, Target } from 'lucide-react';
import { LanguageVisualization } from '../../types/language';

interface LanguageInsightsProps {
  insights: LanguageVisualization['insights'];
}

const InsightCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description?: string;
  color?: string;
  bgColor?: string;
}> = ({ icon, title, value, description, color = '#3B82F6', bgColor = '#EFF6FF' }) => {
  return (
    <div 
      className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
      style={{ 
        backgroundColor: bgColor,
        borderColor: `${color}20`
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="p-2 rounded-lg"
          style={{ 
            backgroundColor: color,
            color: 'white'
          }}
        >
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
            {title}
          </h4>
          {description && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
};

const RecommendationItem: React.FC<{
  recommendation: string;
  index: number;
}> = ({ recommendation, index }) => {
  // Determine recommendation type and color
  const getRecommendationType = (rec: string) => {
    if (rec.toLowerCase().includes('certification') || rec.toLowerCase().includes('certif')) {
      return { color: '#F59E0B', bgColor: '#FEF3C7', icon: <Award className="w-4 h-4" /> };
    }
    if (rec.toLowerCase().includes('improve') || rec.toLowerCase().includes('advance')) {
      return { color: '#10B981', bgColor: '#D1FAE5', icon: <TrendingUp className="w-4 h-4" /> };
    }
    if (rec.toLowerCase().includes('learn') || rec.toLowerCase().includes('second')) {
      return { color: '#8B5CF6', bgColor: '#E9D5FF', icon: <Globe className="w-4 h-4" /> };
    }
    return { color: '#3B82F6', bgColor: '#EFF6FF', icon: <Target className="w-4 h-4" /> };
  };

  const type = getRecommendationType(recommendation);

  return (
    <div 
      className="flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm animate-fade-in"
      style={{ 
        backgroundColor: type.bgColor,
        borderColor: `${type.color}20`,
        animationDelay: `${index * 100}ms`
      }}
    >
      <div 
        className="p-2 rounded-lg flex-shrink-0 mt-1"
        style={{ 
          backgroundColor: type.color,
          color: 'white'
        }}
      >
        {type.icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {recommendation}
        </p>
      </div>
    </div>
  );
};

export const LanguageInsights: React.FC<LanguageInsightsProps> = ({ insights }) => {
  const {
    totalLanguages,
    fluentLanguages,
    businessReady,
    certifiedLanguages,
    recommendations
  } = insights;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Language Analytics
        </h4>
        
        <div className="grid grid-cols-1 gap-4">
          <InsightCard
            icon={<Globe className="w-4 h-4" />}
            title="Total Languages"
            value={totalLanguages}
            description="Languages in your profile"
            color="#3B82F6"
            bgColor="#EFF6FF"
          />
          
          <InsightCard
            icon={<Users className="w-4 h-4" />}
            title="Fluent Level"
            value={fluentLanguages}
            description="Native + Fluent languages"
            color="#10B981"
            bgColor="#D1FAE5"
          />
          
          <InsightCard
            icon={<Award className="w-4 h-4" />}
            title="Certified"
            value={certifiedLanguages.length}
            description="With certifications"
            color="#F59E0B"
            bgColor="#FEF3C7"
          />
        </div>
      </div>

      {/* Business Ready Languages */}
      {businessReady.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Business Ready
          </h4>
          <div className="flex flex-wrap gap-2">
            {businessReady.map((language, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-full border border-green-200 dark:border-green-800"
              >
                {language}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
            These languages are ready for professional business use
          </p>
        </div>
      )}

      {/* Certified Languages */}
      {certifiedLanguages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Certified Proficiencies
          </h4>
          <div className="flex flex-wrap gap-2">
            {certifiedLanguages.map((language, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-sm rounded-full border border-yellow-200 dark:border-yellow-800 flex items-center gap-1"
              >
                <Award className="w-3 h-3" />
                {language}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
            Languages with formal certifications or verifications
          </p>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-500" />
            Recommendations
          </h4>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <RecommendationItem
                key={index}
                recommendation={recommendation}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Proficiency Distribution */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Growth Potential
        </h4>
        
        <div className="space-y-3">
          {fluentLanguages > 0 && (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Strong Foundation</span>
              </div>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {fluentLanguages} fluent {fluentLanguages === 1 ? 'language' : 'languages'}
              </span>
            </div>
          )}
          
          {totalLanguages > fluentLanguages && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Development Opportunities</span>
              </div>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {totalLanguages - fluentLanguages} to improve
              </span>
            </div>
          )}
          
          {certifiedLanguages.length < totalLanguages && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Certification Potential</span>
              </div>
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                {totalLanguages - certifiedLanguages.length} uncertified
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};