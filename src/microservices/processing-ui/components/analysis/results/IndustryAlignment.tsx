/**
 * Industry Alignment Component
 * Shows how well the CV aligns with target industry requirements
 */

import React, { useMemo } from 'react';
import { ChevronDown, ChevronUp, Building, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import type { CVAnalysisResults } from '../../../../types/cv.types';

interface IndustryAlignmentProps {
  analysisResults: CVAnalysisResults;
  expanded: boolean;
  onToggle: () => void;
}

interface IndustryMetric {
  category: string;
  currentScore: number;
  industryAverage: number;
  trend: 'above' | 'at' | 'below';
  importance: number;
}

interface IndustryRequirement {
  skill: string;
  required: boolean;
  present: boolean;
  strength: number;
  marketDemand: number;
}

export const IndustryAlignment: React.FC<IndustryAlignmentProps> = ({
  analysisResults,
  expanded,
  onToggle
}) => {
  // Mock industry data - in production would come from market analysis
  const targetIndustry = 'Technology';
  const industryAlignment = 87;

  const industryMetrics = useMemo<IndustryMetric[]>(() => [
    {
      category: 'Technical Skills',
      currentScore: 85,
      industryAverage: 75,
      trend: 'above',
      importance: 95
    },
    {
      category: 'Leadership Experience',
      currentScore: 78,
      industryAverage: 70,
      trend: 'above',
      importance: 85
    },
    {
      category: 'Industry Certifications',
      currentScore: 60,
      industryAverage: 80,
      trend: 'below',
      importance: 75
    },
    {
      category: 'Project Management',
      currentScore: 82,
      industryAverage: 72,
      trend: 'above',
      importance: 80
    },
    {
      category: 'Domain Knowledge',
      currentScore: 75,
      industryAverage: 78,
      trend: 'below',
      importance: 70
    }
  ], []);

  const industryRequirements = useMemo<IndustryRequirement[]>(() => [
    { skill: 'Cloud Computing', required: true, present: true, strength: 75, marketDemand: 95 },
    { skill: 'Agile Methodologies', required: true, present: true, strength: 85, marketDemand: 90 },
    { skill: 'Data Analysis', required: false, present: true, strength: 70, marketDemand: 85 },
    { skill: 'Security Awareness', required: true, present: false, strength: 0, marketDemand: 90 },
    { skill: 'DevOps Practices', required: false, present: true, strength: 65, marketDemand: 80 },
    { skill: 'API Development', required: true, present: true, strength: 80, marketDemand: 85 }
  ], []);

  const getTrendIcon = (trend: 'above' | 'at' | 'below') => {
    if (trend === 'above') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'below') return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
    return <div className="h-4 w-4 rounded-full bg-gray-400" />;
  };

  const getAlignmentColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const missingRequirements = useMemo(() =>
    industryRequirements.filter(req => req.required && !req.present),
    [industryRequirements]
  );

  const strengths = useMemo(() =>
    industryRequirements.filter(req => req.present && req.strength >= 75),
    [industryRequirements]
  );

  return (
    <div className="industry-alignment bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Building className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Industry Alignment</h2>
            <p className="text-sm text-gray-500">Fit assessment for {targetIndustry} industry</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`text-center px-4 py-2 rounded-lg ${getAlignmentColor(industryAlignment)}`}>
            <div className="text-2xl font-bold">{industryAlignment}%</div>
            <div className="text-sm">Industry Fit</div>
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
          {/* Industry Metrics Comparison */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Industry Benchmarking</h3>
            <div className="space-y-4">
              {industryMetrics.map((metric) => (
                <div key={metric.category} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{metric.category}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">You: {metric.currentScore}%</span>
                      <span className="text-gray-500">Industry: {metric.industryAverage}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Your Score */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-16">You</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.currentScore >= metric.industryAverage ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${metric.currentScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{metric.currentScore}</span>
                    </div>

                    {/* Industry Average */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-16">Industry</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${metric.industryAverage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{metric.industryAverage}</span>
                    </div>
                  </div>

                  {/* Importance indicator */}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Importance to industry: {metric.importance}%</span>
                    <span className={`font-medium ${
                      metric.trend === 'above' ? 'text-green-600' :
                      metric.trend === 'below' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.trend === 'above' ? '↑ Above average' :
                       metric.trend === 'below' ? '↓ Below average' : '→ At average'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Skills Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Skills Requirements Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Missing Requirements */}
              {missingRequirements.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-red-700 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Missing Required Skills</span>
                  </h4>
                  <div className="space-y-2">
                    {missingRequirements.map((req) => (
                      <div key={req.skill} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-red-700">{req.skill}</span>
                          <span className="text-sm text-red-600">Required</span>
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          Market demand: {req.marketDemand}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              <div className="space-y-3">
                <h4 className="font-medium text-green-700 flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Your Competitive Strengths</span>
                </h4>
                <div className="space-y-2">
                  {strengths.map((strength) => (
                    <div key={strength.skill} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-700">{strength.skill}</span>
                        <span className="text-sm text-green-600">{strength.strength}%</span>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Market demand: {strength.marketDemand}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Coverage Overview */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Coverage Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {industryRequirements.filter(r => r.required && r.present).length}
                </div>
                <div className="text-sm text-gray-600">Required Skills Met</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {missingRequirements.length}
                </div>
                <div className="text-sm text-gray-600">Skills Missing</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {industryRequirements.filter(r => !r.required && r.present).length}
                </div>
                <div className="text-sm text-gray-600">Bonus Skills</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(industryRequirements.reduce((acc, r) => acc + (r.present ? r.marketDemand : 0), 0) / industryRequirements.length)}%
                </div>
                <div className="text-sm text-gray-600">Market Relevance</div>
              </div>
            </div>
          </div>

          {/* Industry Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Industry-Specific Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Short-term Actions</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Obtain security awareness certification</li>
                  <li>• Strengthen cloud computing expertise</li>
                  <li>• Highlight existing Agile experience</li>
                </ul>
              </div>
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Long-term Growth</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Pursue advanced DevOps certifications</li>
                  <li>• Develop domain-specific knowledge</li>
                  <li>• Build thought leadership presence</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Market Trends */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Trends Impact</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Emerging Technologies:</strong> AI/ML integration is becoming increasingly important.
                Consider adding relevant experience or certifications.
              </p>
              <p>
                <strong>Remote Work Adaptation:</strong> Your collaboration and communication skills
                align well with distributed team requirements.
              </p>
              <p>
                <strong>Sustainability Focus:</strong> Green technology and sustainable practices
                are gaining importance in hiring decisions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};