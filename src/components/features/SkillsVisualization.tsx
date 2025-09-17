import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Code, Briefcase, Globe, TrendingUp, Users, Award } from 'lucide-react';

interface SkillsVisualizationProps {
  technical: Array<{
    name: string;
    skills: Array<{
      name: string;
      level: number;
      yearsOfExperience?: number;
      lastUsed?: Date;
      endorsed?: boolean;
    }>;
  }>;
  soft: Array<{
    name: string;
    skills: Array<{
      name: string;
      level: number;
      yearsOfExperience?: number;
    }>;
  }>;
  languages: Array<{
    language: string;
    proficiency: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic';
    certifications?: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: Date;
    expiryDate?: Date;
    credentialId?: string;
    verificationUrl?: string;
    badge?: string;
  }>;
}

export const SkillsVisualization = ({
  technical,
  soft,
  languages,
  certifications
}: SkillsVisualizationProps) => {
  // Prepare data for technical skills chart
  const technicalChartData = technical.flatMap(category => 
    category.skills.map(skill => ({
      name: skill.name,
      level: skill.level,
      category: category.name
    }))
  ).sort((a, b) => b.level - a.level).slice(0, 10);

  // Colors for different categories
  const categoryColors: Record<string, string> = {
    'Programming': '#06B6D4',
    'Frameworks': '#8B5CF6',
    'Databases': '#10B981',
    'Cloud': '#F59E0B',
    'Tools': '#EF4444',
    'Other': '#6B7280'
  };

  const getSkillColor = (category: string) => categoryColors[category] || categoryColors['Other'];

  const getProficiencyLevel = (proficiency: string) => {
    const levels: Record<string, number> = {
      'native': 100,
      'fluent': 90,
      'professional': 75,
      'conversational': 50,
      'basic': 25
    };
    return levels[proficiency] || 0;
  };

  const getProficiencyColor = (proficiency: string) => {
    const colors: Record<string, string> = {
      'native': 'text-green-400',
      'fluent': 'text-blue-400',
      'professional': 'text-cyan-400',
      'conversational': 'text-yellow-400',
      'basic': 'text-gray-400'
    };
    return colors[proficiency] || 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Technical Skills Chart */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-cyan-500" />
          Top Technical Skills
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={technicalChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" domain={[0, 10]} tick={{ fill: '#9CA3AF' }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#9CA3AF' }} width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '0.5rem' 
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="level" radius={[0, 4, 4, 0]}>
                {technicalChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getSkillColor(entry.category)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Category Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {Object.entries(categoryColors).slice(0, -1).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-gray-400">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills by Category */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Technical Skills */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-500" />
            Technical Expertise
          </h4>
          <div className="space-y-4">
            {technical.map((category, catIndex) => (
              <div key={catIndex}>
                <h5 className="text-sm font-medium text-gray-300 mb-2">{category.name}</h5>
                <div className="space-y-2">
                  {category.skills.slice(0, 3).map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-200">{skill.name}</span>
                          {skill.endorsed && <Award className="w-3 h-3 text-yellow-500" />}
                          {skill.yearsOfExperience && (
                            <span className="text-xs text-gray-500">
                              {skill.yearsOfExperience}y exp
                            </span>
                          )}
                        </div>
                        <div className="mt-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${skill.level * 10}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-4">{skill.level}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            Soft Skills
          </h4>
          <div className="space-y-4">
            {soft.map((category, catIndex) => (
              <div key={catIndex}>
                <h5 className="text-sm font-medium text-gray-300 mb-2">{category.name}</h5>
                <div className="space-y-2">
                  {category.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-gray-200">{skill.name}</span>
                        <div className="mt-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            style={{ width: `${skill.level * 10}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-4">{skill.level}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Languages */}
      {languages.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Language Proficiency
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((lang, index) => (
              <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-200">{lang.language}</h5>
                  <span className={`text-sm capitalize ${getProficiencyColor(lang.proficiency)}`}>
                    {lang.proficiency}
                  </span>
                </div>
                <div className="bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${getProficiencyLevel(lang.proficiency)}%` }}
                  />
                </div>
                {lang.certifications && lang.certifications.length > 0 && (
                  <div className="mt-2">
                    {lang.certifications.map((cert, certIndex) => (
                      <span key={certIndex} className="text-xs text-gray-400">
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Professional Certifications
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {certifications.map((cert, index) => {
              const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    isExpired 
                      ? 'bg-red-900/10 border-red-700/30' 
                      : 'bg-gray-700/50 border-gray-600/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-200">{cert.name}</h5>
                      <p className="text-sm text-gray-400 mt-1">{cert.issuer}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Issued: {new Date(cert.date).toLocaleDateString()}</span>
                        {cert.expiryDate && (
                          <span className={isExpired ? 'text-red-400' : ''}>
                            {isExpired ? 'Expired' : 'Expires'}: {new Date(cert.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {cert.credentialId && (
                        <p className="text-xs text-gray-500 mt-1">ID: {cert.credentialId}</p>
                      )}
                    </div>
                    {cert.badge && (
                      <img src={cert.badge} alt={cert.name} className="w-12 h-12 object-contain" />
                    )}
                  </div>
                  {cert.verificationUrl && (
                    <a 
                      href={cert.verificationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Verify Certificate
                      <TrendingUp className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">
            {technical.reduce((sum, cat) => sum + cat.skills.length, 0)}
          </div>
          <p className="text-sm text-gray-400 mt-1">Technical Skills</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-400">
            {soft.reduce((sum, cat) => sum + cat.skills.length, 0)}
          </div>
          <p className="text-sm text-gray-400 mt-1">Soft Skills</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{languages.length}</div>
          <p className="text-sm text-gray-400 mt-1">Languages</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{certifications.length}</div>
          <p className="text-sm text-gray-400 mt-1">Certifications</p>
        </div>
      </div>
    </div>
  );
};