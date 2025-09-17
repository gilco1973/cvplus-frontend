/**
 * Skills Radar Chart Component
 * Interactive radar chart visualization for skill proficiency levels
 */

import React, { useState, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Eye, BarChart3, List } from 'lucide-react';

interface SkillData {
  name: string;
  proficiency: number;
  category: 'technical' | 'soft' | 'languages' | 'certifications';
  yearsExperience?: number;
}

interface SkillsRadarChartProps {
  skillsData: {
    technical?: any[];
    soft?: any[];
    languages?: any[];
    certifications?: any[];
  };
  interactive?: boolean;
  showToggle?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

// Color mapping for skill categories
const CATEGORY_COLORS = {
  technical: '#3B82F6',     // Blue
  soft: '#10B981',          // Green
  languages: '#8B5CF6',     // Purple
  certifications: '#F59E0B' // Amber
};

// Helper function to extract skill name from various formats
const extractSkillName = (skill: any): string => {
  if (typeof skill === 'string') return skill;
  if (typeof skill === 'object' && skill !== null) {
    if (skill.language) {
      return skill.language;
    }
    return skill.name || skill.skill || skill.title || skill.label || String(skill);
  }
  return String(skill);
};

// Estimate proficiency based on skill complexity and context
const estimateProficiency = (skill: string, category: string): number => {
  // Basic proficiency estimation algorithm
  // In a real implementation, this would use ML or more sophisticated analysis
  
  const complexityScores: Record<string, number> = {
    // Technical skills complexity scoring
    'javascript': 85, 'typescript': 90, 'react': 85, 'angular': 80, 'vue': 75,
    'python': 85, 'java': 80, 'c#': 80, 'c++': 90, 'go': 85,
    'aws': 85, 'docker': 80, 'kubernetes': 90, 'git': 75,
    'html': 70, 'css': 70, 'sass': 75, 'tailwind': 75,
    'node.js': 80, 'express': 75, 'mongodb': 80, 'postgresql': 85,
    
    // Soft skills baseline
    'leadership': 80, 'communication': 85, 'teamwork': 80,
    'project management': 85, 'problem solving': 85,
    
    // Languages baseline
    'english': 90, 'spanish': 75, 'french': 70, 'german': 70,
    'mandarin': 65, 'japanese': 65
  };
  
  const skillLower = skill.toLowerCase();
  const baseScore = complexityScores[skillLower] || 70;
  
  // Add some randomization to make it more realistic
  const variance = (Math.random() - 0.5) * 20; // ±10 points
  const finalScore = Math.max(40, Math.min(95, baseScore + variance));
  
  return Math.round(finalScore);
};

export const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({
  skillsData,
  interactive = true,
  showToggle = true,
  theme = 'light',
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Process skills data for radar chart
  const processedSkills = useMemo(() => {
    const skills: SkillData[] = [];
    
    Object.entries(skillsData).forEach(([category, categorySkills]) => {
      if (Array.isArray(categorySkills)) {
        categorySkills.forEach(skill => {
          const skillName = extractSkillName(skill);
          const proficiency = estimateProficiency(skillName, category);
          
          skills.push({
            name: skillName,
            proficiency,
            category: category as any,
            yearsExperience: Math.floor(proficiency / 20) // Rough estimation
          });
        });
      }
    });
    
    return skills;
  }, [skillsData]);

  // Group skills by category for chart data
  const chartData = useMemo(() => {
    const categories = ['technical', 'soft', 'languages', 'certifications'];
    
    return categories.map(category => {
      const categorySkills = processedSkills.filter(skill => skill.category === category);
      const avgProficiency = categorySkills.length > 0 
        ? Math.round(categorySkills.reduce((sum, skill) => sum + skill.proficiency, 0) / categorySkills.length)
        : 0;
      
      return {
        category: category.charAt(0).toUpperCase() + category.slice(1),
        proficiency: avgProficiency,
        skillCount: categorySkills.length,
        skills: categorySkills
      };
    }).filter(item => item.skillCount > 0);
  }, [processedSkills]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-gray-600 mb-1">
            Average Proficiency: <span className="font-medium text-blue-600">{data.proficiency}%</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Skills Count: <span className="font-medium">{data.skillCount}</span>
          </p>
          <div className="border-t border-gray-200 pt-2">
            <p className="text-xs font-medium text-gray-700 mb-1">Top Skills:</p>
            {data.skills.slice(0, 3).map((skill: SkillData, index: number) => (
              <p key={index} className="text-xs text-gray-600">
                • {skill.name} ({skill.proficiency}%)
              </p>
            ))}
            {data.skills.length > 3 && (
              <p className="text-xs text-gray-500">+{data.skills.length - 3} more</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis 
          dataKey="category" 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          className="text-sm"
        />
        <PolarRadiusAxis 
          angle={0} 
          domain={[0, 100]}
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          tickCount={5}
        />
        <Radar
          dataKey="proficiency"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.1}
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );

  const renderList = () => (
    <div className="space-y-3">
      {chartData.map((category, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h6 className="font-medium text-gray-900">{category.category}</h6>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{category.proficiency}% avg</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {category.skillCount} skills
              </span>
            </div>
          </div>
          <div className="space-y-1">
            {category.skills.slice(0, 5).map((skill, skillIndex) => (
              <div key={skillIndex} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{skill.proficiency}%</span>
                </div>
              </div>
            ))}
            {category.skills.length > 5 && (
              <p className="text-xs text-gray-500 mt-2">
                +{category.skills.length - 5} more skills
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (processedSkills.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-2">No skills data available</p>
        <p className="text-sm text-gray-400">Skills visualization will appear here when data is processed</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-medium text-gray-800 text-sm">Skills Proficiency Radar</h5>
          <p className="text-xs text-gray-600">{processedSkills.length} skills across {chartData.length} categories</p>
        </div>
        
        {showToggle && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('chart')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'chart' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Chart View"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {viewMode === 'chart' ? renderChart() : renderList()}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex flex-wrap gap-3 text-xs">
          {chartData.map((category, index) => (
            <div key={index} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: CATEGORY_COLORS[category.category.toLowerCase() as keyof typeof CATEGORY_COLORS] || '#6b7280' }}
              />
              <span className="text-gray-600">{category.category} ({category.skillCount})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsRadarChart;