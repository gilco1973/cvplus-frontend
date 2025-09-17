/**
 * Personality Insights Component
 * Displays MBTI/Big Five personality analysis and career alignment
 */

import React, { useMemo } from 'react';
import { ChevronDown, ChevronUp, Brain, Target, Users, Lightbulb } from 'lucide-react';
import type { CVAnalysisResults } from '../../../../types/cv.types';

interface PersonalityInsightsProps {
  analysisResults: CVAnalysisResults;
  expanded: boolean;
  onToggle: () => void;
}

interface PersonalityTrait {
  name: string;
  score: number;
  description: string;
  careerImpact: string;
}

interface MBTIDimension {
  dimension: string;
  primary: string;
  secondary: string;
  score: number; // 0-100, where 0 is fully primary, 100 is fully secondary
  description: string;
}

export const PersonalityInsights: React.FC<PersonalityInsightsProps> = ({
  analysisResults,
  expanded,
  onToggle
}) => {
  // Mock personality data - in production would come from AI analysis
  const bigFiveTraits = useMemo<PersonalityTrait[]>(() => [
    {
      name: 'Openness',
      score: 85,
      description: 'High creativity and openness to new experiences',
      careerImpact: 'Strong fit for innovation-driven roles'
    },
    {
      name: 'Conscientiousness',
      score: 78,
      description: 'Well-organized with strong attention to detail',
      careerImpact: 'Excellent for project management and leadership'
    },
    {
      name: 'Extraversion',
      score: 72,
      description: 'Comfortable in social situations and team environments',
      careerImpact: 'Natural fit for client-facing and collaborative roles'
    },
    {
      name: 'Agreeableness',
      score: 68,
      description: 'Cooperative and empathetic team player',
      careerImpact: 'Effective in team leadership and mentoring'
    },
    {
      name: 'Neuroticism',
      score: 25, // Lower is better for this trait
      description: 'Emotionally stable under pressure',
      careerImpact: 'Handles high-stress situations well'
    }
  ], []);

  const mbtiProfile = useMemo<MBTIDimension[]>(() => [
    {
      dimension: 'Energy',
      primary: 'Extraversion (E)',
      secondary: 'Introversion (I)',
      score: 72,
      description: 'Gains energy from social interaction and external stimulation'
    },
    {
      dimension: 'Information',
      primary: 'Sensing (S)',
      secondary: 'Intuition (N)',
      score: 35,
      description: 'Focuses on concrete details and practical information'
    },
    {
      dimension: 'Decisions',
      primary: 'Thinking (T)',
      secondary: 'Feeling (F)',
      score: 65,
      description: 'Makes decisions based on logical analysis'
    },
    {
      dimension: 'Lifestyle',
      primary: 'Judging (J)',
      secondary: 'Perceiving (P)',
      score: 78,
      description: 'Prefers structured, organized approach to work'
    }
  ], []);

  const predictedMBTI = useMemo(() => {
    const types = mbtiProfile.map(dim =>
      dim.score >= 50 ? dim.secondary[0] : dim.primary[0]
    ).join('');
    return types;
  }, [mbtiProfile]);

  const getTraitColor = (score: number, isNeuroticism = false) => {
    if (isNeuroticism) {
      // For neuroticism, lower scores are better
      if (score <= 30) return 'bg-green-500';
      if (score <= 50) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-blue-500';
    if (score >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const careerMatches = useMemo(() => [
    { role: 'Technical Team Lead', match: 92, reason: 'High conscientiousness and extraversion' },
    { role: 'Product Manager', match: 88, reason: 'Strong organizational skills and openness' },
    { role: 'Senior Software Engineer', match: 85, reason: 'Detail-oriented with creative problem-solving' },
    { role: 'Project Manager', match: 82, reason: 'Structured approach and team collaboration' }
  ], []);

  return (
    <div className="personality-insights bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Personality Insights</h2>
            <p className="text-sm text-gray-500">MBTI and Big Five analysis for career alignment</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-lg font-bold text-purple-600">{predictedMBTI}</div>
            <div className="text-sm text-gray-500">Predicted Type</div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-6 space-y-8">
          {/* MBTI Analysis */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>MBTI Personality Type: {predictedMBTI}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mbtiProfile.map((dimension) => (
                <div key={dimension.dimension} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{dimension.dimension}</span>
                    <span className="text-sm text-gray-500">
                      {dimension.score >= 50 ? dimension.secondary : dimension.primary}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{dimension.primary}</span>
                      <span>{dimension.secondary}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full relative"
                        style={{ width: `${dimension.score}%` }}
                      >
                        <div className="absolute right-0 top-0 h-3 w-1 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="text-center text-xs text-gray-600 mt-1">
                      {Math.round(Math.abs(dimension.score - 50))}% tendency
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{dimension.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Big Five Traits */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Big Five Personality Traits</span>
            </h3>

            <div className="space-y-4">
              {bigFiveTraits.map((trait) => (
                <div key={trait.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{trait.name}</span>
                    <span className="text-sm font-medium text-gray-600">{trait.score}/100</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${getTraitColor(trait.score, trait.name === 'Neuroticism')}`}
                      style={{ width: `${trait.score}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">{trait.description}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Career Impact: </span>
                      <span className="text-gray-600">{trait.careerImpact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career Alignment */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span>Career Role Compatibility</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careerMatches.map((match) => (
                <div key={match.role} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{match.role}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      match.match >= 90 ? 'bg-green-100 text-green-700' :
                      match.match >= 80 ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {match.match}% match
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        match.match >= 90 ? 'bg-green-500' :
                        match.match >= 80 ? 'bg-blue-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${match.match}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{match.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insights and Recommendations */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Personality Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Leadership Style</h4>
                <p className="text-sm text-gray-600">
                  Your personality profile suggests a collaborative leadership style with strong
                  organizational skills. You likely excel at motivating teams while maintaining
                  clear structure and goals.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Work Environment Fit</h4>
                <p className="text-sm text-gray-600">
                  You thrive in dynamic, team-oriented environments that offer variety and
                  opportunities for innovation. Structure and clear processes help you deliver
                  your best work.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Communication Style</h4>
                <p className="text-sm text-gray-600">
                  You communicate effectively across different audiences, balancing logical
                  analysis with emotional intelligence. This makes you effective in both
                  technical and stakeholder interactions.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Growth Areas</h4>
                <p className="text-sm text-gray-600">
                  Consider developing skills in ambiguous situations and flexible planning.
                  Your structured approach is a strength, but adaptability will enhance your
                  leadership effectiveness.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};