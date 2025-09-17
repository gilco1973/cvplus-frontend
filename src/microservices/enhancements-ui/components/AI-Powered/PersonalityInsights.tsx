import React, { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { CVFeatureProps } from '../../../types/cv-features';
import { useFeatureData } from '../../../hooks/useFeatureData';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface PersonalityTrait {
  name: string;
  score: number;
  description: string;
  category: 'leadership' | 'communication' | 'analytical' | 'creative' | 'collaborative';
  strengths: string[];
  developmentAreas: string[];
}

interface WorkStyle {
  type: string;
  description: string;
  characteristics: string[];
  idealEnvironment: string[];
  teamRole: string;
}

interface CareerAlignment {
  roles: string[];
  industries: string[];
  workEnvironments: string[];
  confidenceScore: number;
}

interface PersonalityProfile {
  overallType: string;
  primaryTraits: PersonalityTrait[];
  workStyle: WorkStyle;
  careerAlignment: CareerAlignment;
  communicationStyle: string;
  leadershipStyle: string;
  insights: string[];
  recommendations: string[];
  analysisDate: string;
}

interface PersonalityInsightsProps extends CVFeatureProps {
  includeCareerSuggestions?: boolean;
  includeWorkStyle?: boolean;
  displayMode?: 'overview' | 'detailed' | 'compact';
}

export const PersonalityInsights: React.FC<PersonalityInsightsProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization,
  onUpdate,
  onError,
  className = '',
  mode = 'private',
  includeCareerSuggestions = true,
  includeWorkStyle = true,
  displayMode = 'overview'
}) => {
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);
  const [showAnalysisMethod, setShowAnalysisMethod] = useState(false);

  const {
    data: personalityData,
    loading,
    error,
    refetch
  } = useFeatureData(
    'getPersonalityInsights',
    { jobId, profileId, includeCareerSuggestions, includeWorkStyle },
    { enabled: isEnabled }
  );

  useEffect(() => {
    if (personalityData) {
      setProfile(personalityData);
      onUpdate?.(personalityData);
    }
  }, [personalityData, onUpdate]);

  const getTraitColor = (category: string) => {
    switch (category) {
      case 'leadership': return '#3B82F6';
      case 'communication': return '#10B981';
      case 'analytical': return '#8B5CF6';
      case 'creative': return '#F59E0B';
      case 'collaborative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Exceptional';
    if (score >= 70) return 'Strong';
    if (score >= 60) return 'Moderate';
    if (score >= 40) return 'Developing';
    return 'Emerging';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <FeatureWrapper className={className} title="Personality Insights">
        <LoadingSpinner message="Analyzing personality traits from your experience..." />
      </FeatureWrapper>
    );
  }

  if (error) {
    return (
      <FeatureWrapper className={className} title="Personality Insights">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          <p className="font-medium">Analysis Failed</p>
          <p className="text-sm mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </FeatureWrapper>
    );
  }

  if (!profile) {
    return (
      <FeatureWrapper className={className} title="Personality Insights">
        <div className="text-gray-500 text-center p-8">
          <p>No personality analysis available</p>
        </div>
      </FeatureWrapper>
    );
  }

  const radarData = profile.primaryTraits.map(trait => ({
    trait: trait.name,
    score: trait.score,
    fullMark: 100
  }));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🎯' },
    { id: 'traits', label: 'Traits', icon: '🧠' },
    { id: 'workstyle', label: 'Work Style', icon: '💼' },
    { id: 'careers', label: 'Career Fit', icon: '🚀' }
  ];

  return (
    <FeatureWrapper className={className} title="AI Personality Insights">
      <div className="space-y-6">
        {/* Header with Overall Type */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {profile.overallType}
              </h3>
              <p className="text-gray-600">
                Analysis based on your professional experience and achievements
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Analyzed: {new Date(profile.analysisDate).toLocaleDateString()}
              </div>
              <button
                onClick={() => setShowAnalysisMethod(!showAnalysisMethod)}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                How was this analyzed?
              </button>
            </div>
          </div>
          
          <div>
            {showAnalysisMethod && (
              <div 
                className="animate-fade-in mt-4 p-4 bg-white rounded border text-sm text-gray-600"
              >
                <p>
                  This analysis uses AI to examine patterns in your work experience, 
                  project descriptions, achievements, and skill usage to identify 
                  personality traits, work preferences, and career alignment.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          <div 
            key={activeTab}
            className="animate-fade-in min-h-[400px]"
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Personality Radar Chart */}
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Personality Profile
                  </h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="trait" />
                        <PolarRadiusAxis angle={0} domain={[0, 100]} />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      🎯 Key Insights
                    </h4>
                    <ul className="space-y-2">
                      {profile.insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      💡 Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {profile.recommendations.map((rec, index) => {
                        // Handle both string and object formats for recommendations
                        const recText = typeof rec === 'string' 
                          ? rec 
                          : rec?.title || rec?.description || (rec?.type && rec?.targetSection ? `${rec.type}: ${rec.targetSection}` : JSON.stringify(rec));
                        
                        return (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span className="text-gray-700">{recText}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'traits' && (
              <div className="space-y-4">
                {profile.primaryTraits.map((trait, index) => (
                  <div 
                    key={trait.name}
                    className="animate-fade-in bg-white p-6 rounded-lg border"
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedTrait(
                        expandedTrait === trait.name ? null : trait.name
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getTraitColor(trait.category) }}
                          />
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {trait.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {trait.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(trait.score)}`}>
                            {trait.score}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {getScoreLabel(trait.score)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      {expandedTrait === trait.name && (
                        <div className="animate-fade-in mt-4 pt-4 border-t border-gray-200"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">
                                Strengths
                              </h5>
                              <ul className="space-y-1">
                                {trait.strengths.map((strength, i) => (
                                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="text-green-500 mt-1">+</span>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">
                                Development Areas
                              </h5>
                              <ul className="space-y-1">
                                {trait.developmentAreas.map((area, i) => (
                                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">→</span>
                                    {area}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'workstyle' && includeWorkStyle && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Work Style: {profile.workStyle.type}
                  </h4>
                  <p className="text-gray-600 mb-6">
                    {profile.workStyle.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">
                        Characteristics
                      </h5>
                      <ul className="space-y-2">
                        {profile.workStyle.characteristics.map((char, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span className="text-sm text-gray-700">{char}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">
                        Ideal Environment
                      </h5>
                      <ul className="space-y-2">
                        {profile.workStyle.idealEnvironment.map((env, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span className="text-sm text-gray-700">{env}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">
                        Team Role
                      </h5>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-lg font-medium text-blue-900">
                          {profile.workStyle.teamRole}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Communication Style
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">
                        {profile.communicationStyle}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Leadership Style
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">
                        {profile.leadershipStyle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'careers' && includeCareerSuggestions && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-medium text-gray-900">
                      Career Alignment
                    </h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {profile.careerAlignment.confidenceScore}%
                      </div>
                      <div className="text-sm text-gray-500">
                        Confidence Score
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">
                        Ideal Roles
                      </h5>
                      <div className="space-y-2">
                        {profile.careerAlignment.roles.map((role, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 bg-blue-50 text-blue-800 rounded-lg text-sm"
                          >
                            {role}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">
                        Target Industries
                      </h5>
                      <div className="space-y-2">
                        {profile.careerAlignment.industries.map((industry, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 bg-green-50 text-green-800 rounded-lg text-sm"
                          >
                            {industry}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">
                        Work Environments
                      </h5>
                      <div className="space-y-2">
                        {profile.careerAlignment.workEnvironments.map((env, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 bg-purple-50 text-purple-800 rounded-lg text-sm"
                          >
                            {env}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Notice */}
        {mode === 'public' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Privacy Note:</span> This personality analysis 
              is based on professional experience and achievements only. Personal data and 
              sensitive information are not included in this assessment.
            </p>
          </div>
        )}
      </div>
    </FeatureWrapper>
  );
};

export default PersonalityInsights;