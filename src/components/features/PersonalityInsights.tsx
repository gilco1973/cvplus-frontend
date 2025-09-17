import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Brain, Users, Briefcase, TrendingUp, Award } from 'lucide-react';

interface PersonalityInsightsProps {
  traits: {
    leadership: number;
    communication: number;
    innovation: number;
    teamwork: number;
    problemSolving: number;
    attention_to_detail: number;
    adaptability: number;
    strategic_thinking: number;
  };
  workStyle: string[];
  teamCompatibility: string;
  leadershipPotential: number;
  cultureFit: {
    startup: number;
    corporate: number;
    remote: number;
    hybrid: number;
  };
  summary: string;
}

export const PersonalityInsights = ({
  traits,
  workStyle,
  teamCompatibility,
  leadershipPotential,
  cultureFit,
  summary
}: PersonalityInsightsProps) => {
  // Prepare data for radar chart
  const radarData = Object.entries(traits).map(([trait, value]) => ({
    trait: trait.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: value,
    fullMark: 10
  }));

  // Get best culture fit
  const bestCulture = Object.entries(cultureFit).reduce((a, b) => 
    cultureFit[a[0] as keyof typeof cultureFit] > cultureFit[b[0] as keyof typeof cultureFit] ? a : b
  );

  const getLeadershipLevel = (score: number) => {
    if (score >= 8) return { level: 'Executive', color: 'text-purple-400' };
    if (score >= 6) return { level: 'Senior', color: 'text-blue-400' };
    if (score >= 4) return { level: 'Emerging', color: 'text-cyan-400' };
    return { level: 'Contributor', color: 'text-gray-400' };
  };

  const leadership = getLeadershipLevel(leadershipPotential);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-xl p-6 border border-purple-700/30">
        <div className="flex items-start gap-4">
          <Brain className="w-8 h-8 text-purple-400 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">Personality Summary</h3>
            <p className="text-gray-300 leading-relaxed">{summary}</p>
          </div>
        </div>
      </div>

      {/* Traits Radar Chart */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-100 mb-4">Personality Traits Analysis</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis 
                dataKey="trait" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                className="text-xs"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 10]} 
                tick={{ fill: '#6B7280' }}
              />
              <Radar 
                name="Traits" 
                dataKey="value" 
                stroke="#06B6D4" 
                fill="#06B6D4" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Work Style */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-500" />
            Work Style
          </h4>
          <div className="space-y-2">
            {workStyle.map((style, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-gray-200">{style}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Compatibility */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            Team Compatibility
          </h4>
          <p className="text-gray-300 leading-relaxed">{teamCompatibility}</p>
          
          <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Leadership Potential</span>
              <span className={`font-semibold ${leadership.color}`}>{leadership.level}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all"
                style={{ width: `${leadershipPotential * 10}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Culture Fit */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Culture Fit Analysis
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(cultureFit).map(([culture, score]) => {
            const isBest = culture === bestCulture[0];
            return (
              <div 
                key={culture} 
                className={`p-4 rounded-lg text-center ${
                  isBest ? 'bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-700/50' : 'bg-gray-700/50'
                }`}
              >
                {isBest && <Award className="w-5 h-5 text-yellow-500 mx-auto mb-2" />}
                <h5 className="text-sm font-medium text-gray-300 capitalize mb-2">{culture}</h5>
                <div className="text-2xl font-bold text-gray-100">{Math.round(score * 10)}%</div>
                <div className="mt-2 w-full bg-gray-600 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${isBest ? 'bg-cyan-500' : 'bg-gray-400'}`}
                    style={{ width: `${score * 10}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Traits */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-100 mb-4">Your Top Strengths</h4>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(traits)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([trait, score], index) => (
              <div key={trait} className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-cyan-400">#{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-200 capitalize">
                    {trait.replace(/_/g, ' ')}
                  </h5>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-600 rounded-full h-1.5">
                      <div 
                        className="bg-cyan-500 h-1.5 rounded-full"
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{score}/10</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};