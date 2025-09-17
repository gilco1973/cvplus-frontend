/**
 * Skills Analysis Card Component
 * Displays skills breakdown with strength ratings and recommendations
 */

import React, { useMemo } from 'react';
import { ChevronDown, ChevronUp, Star, TrendingUp, Code, Users, Zap } from 'lucide-react';
import type { CVAnalysisResults } from '../../../../types/cv.types';

interface SkillsAnalysisCardProps {
  analysisResults: CVAnalysisResults;
  expanded: boolean;
  onToggle: () => void;
}

interface SkillCategory {
  name: string;
  skills: Array<{
    name: string;
    strength: number;
    importance: number;
    trend: 'rising' | 'stable' | 'declining';
  }>;
  icon: React.ReactNode;
  color: string;
}

export const SkillsAnalysisCard: React.FC<SkillsAnalysisCardProps> = ({
  analysisResults,
  expanded,
  onToggle
}) => {
  // Mock skill categorization based on analysis results
  // In production, this would come from AI analysis
  const skillCategories = useMemo<SkillCategory[]>(() => [
    {
      name: 'Technical Skills',
      icon: <Code className="h-5 w-5" />,
      color: 'blue',
      skills: [
        { name: 'JavaScript', strength: 85, importance: 90, trend: 'stable' },
        { name: 'Python', strength: 75, importance: 85, trend: 'rising' },
        { name: 'React', strength: 80, importance: 75, trend: 'rising' },
        { name: 'Node.js', strength: 70, importance: 70, trend: 'stable' },
        { name: 'TypeScript', strength: 65, importance: 80, trend: 'rising' }
      ]
    },
    {
      name: 'Soft Skills',
      icon: <Users className="h-5 w-5" />,
      color: 'green',
      skills: [
        { name: 'Leadership', strength: 88, importance: 95, trend: 'stable' },
        { name: 'Communication', strength: 92, importance: 90, trend: 'stable' },
        { name: 'Problem Solving', strength: 85, importance: 85, trend: 'stable' },
        { name: 'Team Collaboration', strength: 90, importance: 80, trend: 'stable' }
      ]
    },
    {
      name: 'Industry Skills',
      icon: <Zap className="h-5 w-5" />,
      color: 'purple',
      skills: [
        { name: 'Agile/Scrum', strength: 82, importance: 75, trend: 'stable' },
        { name: 'Project Management', strength: 78, importance: 85, trend: 'rising' },
        { name: 'Data Analysis', strength: 70, importance: 80, trend: 'rising' },
        { name: 'Cloud Computing', strength: 65, importance: 85, trend: 'rising' }
      ]
    }
  ], []);

  const overallSkillScore = useMemo(() => {
    const allSkills = skillCategories.flatMap(cat => cat.skills);
    const totalWeight = allSkills.reduce((sum, skill) => sum + skill.importance, 0);
    const weightedScore = allSkills.reduce((sum, skill) =>
      sum + (skill.strength * skill.importance / 100), 0
    );
    return Math.round(weightedScore / totalWeight * 100);
  }, [skillCategories]);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = (trend: 'rising' | 'stable' | 'declining') => {
    if (trend === 'rising') return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend === 'declining') return <TrendingUp className="h-3 w-3 text-red-500 transform rotate-180" />;
    return <div className="h-3 w-3 rounded-full bg-gray-400" />;
  };

  return (
    <div className="skills-analysis bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Star className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Skills Analysis</h2>
            <p className="text-sm text-gray-500">Strength assessment and market trends</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{overallSkillScore}/100</div>
            <div className="text-sm text-gray-500">Overall Skills Score</div>
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
          {/* Skills Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {skillCategories.map((category) => (
              <div key={category.name} className="space-y-4">
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${getColorClasses(category.color)}`}>
                  {category.icon}
                  <span className="font-medium">{category.name}</span>
                </div>

                <div className="space-y-3">
                  {category.skills.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                          {getTrendIcon(skill.trend)}
                        </div>
                        <span className="text-sm text-gray-500">{skill.strength}%</span>
                      </div>

                      {/* Strength Bar */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              skill.strength >= 80 ? 'bg-green-500' :
                              skill.strength >= 60 ? 'bg-blue-500' :
                              skill.strength >= 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${skill.strength}%` }}
                          />
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.ceil(skill.importance / 20)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Importance indicator */}
                      <div className="text-xs text-gray-500">
                        Market importance: {skill.importance}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Skills Insights */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Excellent communication and leadership abilities</li>
                  <li>• Strong technical foundation in modern frameworks</li>
                  <li>• Well-balanced soft and technical skill combination</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Growth Opportunities</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Expand cloud computing expertise (rising trend)</li>
                  <li>• Strengthen data analysis capabilities</li>
                  <li>• Consider advanced TypeScript certification</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Skills Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Skill Enhancement Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">High Priority</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      Cloud Computing skills are highly valued in your target industry.
                      Consider AWS or Azure certifications to boost your profile.
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">Medium Priority</div>
                    <div className="text-sm text-blue-700 mt-1">
                      Your TypeScript skills show good potential. Deepening this knowledge
                      will complement your React expertise.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Gap Analysis */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Gap Analysis</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between items-center">
                <span>Skills matching industry requirements:</span>
                <span className="font-medium text-green-600">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Future-ready skills coverage:</span>
                <span className="font-medium text-blue-600">72%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Competitive advantage potential:</span>
                <span className="font-medium text-purple-600">78%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};