import React, { useState } from 'react';
import ATSOptimization, { type ATSOptimizationProps } from '../AI-Powered/ATSOptimization';
import type { EnhancedATSResult } from '../../../types/ats';
import { Settings, Play, RotateCcw } from 'lucide-react';

// Example data for demonstration
const exampleBasicData = {
  score: 72,
  keywords: [
    'JavaScript', 'React', 'TypeScript', 'Node.js', 'Python',
    'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL'
  ],
  suggestions: [
    'Add more quantifiable achievements to your experience section',
    'Include industry-specific certifications in your education',
    'Optimize your professional summary with relevant keywords',
    'Improve the formatting of your contact information',
    'Add technical project descriptions with measurable outcomes'
  ],
  compatibilityReport: {
    overallScore: 72,
    keywordDensity: 78,
    formatScore: 68,
    sectionScore: 75,
    recommendations: [
      'Improve document structure for better ATS parsing',
      'Add missing keywords from job description',
      'Standardize section headers',
      'Include more specific technical skills'
    ]
  }
};

const exampleEnhancedData = {
  ...exampleBasicData,
  score: 78,
  enhancedResult: {
    passes: true,
    advancedScore: {
      overall: 78,
      confidence: 0.87,
      breakdown: {
        parsing: 85,
        keywords: 72,
        formatting: 76,
        content: 82,
        specificity: 70
      },
      atsSystemScores: {
        workday: 80,
        greenhouse: 75,
        lever: 78,
        bamboohr: 76,
        taleo: 73,
        generic: 78
      },
      recommendations: [
        {
          id: 'rec-1',
          priority: 1,
          category: 'keywords',
          title: 'Add Cloud Computing Keywords',
          description: 'Include specific cloud platform technologies like AWS, Azure, or Google Cloud to improve relevance for modern tech roles.',
          impact: 'high',
          estimatedScoreImprovement: 12,
          actionRequired: 'add',
          section: 'skills',
          currentContent: 'Technical Skills: JavaScript, React, Node.js',
          suggestedContent: 'Technical Skills: JavaScript, React, Node.js, AWS, Docker, Kubernetes',
          keywords: ['AWS', 'Docker', 'Kubernetes', 'Azure', 'Google Cloud'],
          atsSystemsAffected: ['workday', 'greenhouse', 'lever']
        },
        {
          id: 'rec-2',
          priority: 2,
          category: 'content',
          title: 'Quantify Project Achievements',
          description: 'Add specific metrics and outcomes to your project descriptions to demonstrate measurable impact.',
          impact: 'high',
          estimatedScoreImprovement: 8,
          actionRequired: 'modify',
          section: 'experience',
          currentContent: 'Developed web applications using React',
          suggestedContent: 'Developed 5+ web applications using React, improving user engagement by 40% and reducing load time by 25%',
          keywords: ['metrics', 'performance', 'engagement'],
          atsSystemsAffected: ['bamboohr', 'taleo']
        },
        {
          id: 'rec-3',
          priority: 3,
          category: 'formatting',
          title: 'Standardize Section Headers',
          description: 'Use conventional section headers that ATS systems can easily recognize and parse.',
          impact: 'medium',
          estimatedScoreImprovement: 5,
          actionRequired: 'modify',
          section: 'formatting',
          currentContent: 'Work History, Educational Background',
          suggestedContent: 'Experience, Education',
          keywords: ['section headers', 'formatting'],
          atsSystemsAffected: ['generic', 'taleo']
        },
        {
          id: 'rec-4',
          priority: 2,
          category: 'specificity',
          title: 'Add Industry Certifications',
          description: 'Include relevant professional certifications to demonstrate expertise and continuous learning.',
          impact: 'medium',
          estimatedScoreImprovement: 6,
          actionRequired: 'add',
          section: 'certifications',
          suggestedContent: 'AWS Certified Developer, React Developer Certification',
          keywords: ['AWS', 'certification', 'developer'],
          atsSystemsAffected: ['workday', 'greenhouse']
        },
        {
          id: 'rec-5',
          priority: 4,
          category: 'parsing',
          title: 'Optimize Contact Information',
          description: 'Ensure contact information is in a standard format that ATS can easily extract.',
          impact: 'low',
          estimatedScoreImprovement: 3,
          actionRequired: 'modify',
          section: 'contact',
          keywords: ['contact', 'phone', 'email'],
          atsSystemsAffected: ['generic']
        }
      ],
      competitorBenchmark: {
        benchmarkScore: 78,
        industryAverage: 68,
        topPercentile: 92,
        gapAnalysis: {
          missingKeywords: ['Python', 'Machine Learning', 'DevOps', 'Agile', 'Scrum'],
          weakAreas: ['technical certifications', 'project management skills', 'soft skills'],
          strengthAreas: ['frontend development', 'JavaScript ecosystem', 'web technologies']
        }
      }
    },
    semanticAnalysis: {
      primaryKeywords: [
        { 
          keyword: 'JavaScript', 
          relevanceScore: 0.95, 
          frequency: 8, 
          variations: ['JS', 'ECMAScript'], 
          context: ['skills', 'experience', 'projects'], 
          atsImportance: 0.9, 
          competitorUsage: 0.85 
        },
        { 
          keyword: 'React', 
          relevanceScore: 0.92, 
          frequency: 6, 
          variations: ['ReactJS', 'React.js'], 
          context: ['skills', 'experience'], 
          atsImportance: 0.88, 
          competitorUsage: 0.80 
        },
        { 
          keyword: 'Node.js', 
          relevanceScore: 0.87, 
          frequency: 4, 
          variations: ['NodeJS', 'Node'], 
          context: ['skills', 'projects'], 
          atsImportance: 0.82, 
          competitorUsage: 0.75 
        },
        { 
          keyword: 'TypeScript', 
          relevanceScore: 0.84, 
          frequency: 3, 
          variations: ['TS'], 
          context: ['skills'], 
          atsImportance: 0.78, 
          competitorUsage: 0.70 
        }
      ],
      semanticMatches: [],
      contextualRelevance: 0.83,
      densityOptimization: {
        current: 0.06,
        recommended: 0.09,
        sections: { 
          skills: 0.12, 
          experience: 0.05, 
          projects: 0.07, 
          summary: 0.04 
        }
      },
      synonymMapping: {
        'JavaScript': ['JS', 'ECMAScript', 'ES6', 'ES2020'],
        'React': ['ReactJS', 'React.js'],
        'Node.js': ['NodeJS', 'Node']
      },
      industrySpecificTerms: [
        'Frontend Development',
        'Full Stack Development',
        'Web Development',
        'Single Page Application',
        'RESTful APIs',
        'GraphQL',
        'Microservices',
        'CI/CD',
        'Test-Driven Development',
        'Responsive Design'
      ]
    }
  } as EnhancedATSResult
};

// Configuration presets
const configurationPresets = {
  minimal: {
    showScore: true,
    showKeywords: false,
    showSuggestions: false,
    interactive: false,
    compactMode: true,
    showBenchmark: false,
    enableExport: false
  },
  standard: {
    showScore: true,
    showKeywords: true,
    showSuggestions: true,
    interactive: true,
    compactMode: false,
    showBenchmark: true,
    enableExport: true
  },
  advanced: {
    showScore: true,
    showKeywords: true,
    showSuggestions: true,
    interactive: true,
    compactMode: false,
    showBenchmark: true,
    enableExport: true,
    theme: 'auto' as const
  }
};

const ATSOptimizationExample: React.FC = () => {
  const [dataType, setDataType] = useState<'basic' | 'enhanced'>('enhanced');
  const [preset, setPreset] = useState<keyof typeof configurationPresets>('standard');
  const [customConfig, setCustomConfig] = useState(configurationPresets.standard);
  const [showConfig, setShowConfig] = useState(false);
  const [appliedRecommendations, setAppliedRecommendations] = useState<string[]>([]);

  const currentData = dataType === 'enhanced' ? exampleEnhancedData : exampleBasicData;
  
  const handleUpdate = (data: any) => {
    console.log('ATS Optimization Updated:', data);
    if (data.appliedRecommendation) {
      setAppliedRecommendations(prev => [...prev, data.appliedRecommendation]);
    }
  };

  const handleError = (error: Error) => {
    console.error('ATS Optimization Error:', error);
  };

  const resetExample = () => {
    setAppliedRecommendations([]);
    setDataType('enhanced');
    setPreset('standard');
    setCustomConfig(configurationPresets.standard);
  };

  const exampleProps: ATSOptimizationProps = {
    jobId: 'example-job-123',
    profileId: 'example-profile-456',
    data: currentData,
    customization: customConfig,
    onUpdate: handleUpdate,
    onError: handleError,
    mode: 'preview'
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-4">ATS Optimization Component Demo</h1>
        <p className="text-lg opacity-90 mb-6">
          Experience the powerful ATS optimization features with interactive analytics, 
          keyword analysis, and AI-powered recommendations.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">78%</div>
            <div className="text-sm opacity-90">Average ATS Score</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm opacity-90">AI Recommendations</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <div className="text-2xl font-bold">6</div>
            <div className="text-sm opacity-90">ATS Systems</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Demo Controls</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {showConfig ? 'Hide' : 'Show'} Config
            </button>
            <button
              onClick={resetExample}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Data Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dataType"
                  value="basic"
                  checked={dataType === 'basic'}
                  onChange={(e) => setDataType(e.target.value as 'basic' | 'enhanced')}
                  className="mr-2"
                />
                Basic ATS Data
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dataType"
                  value="enhanced"
                  checked={dataType === 'enhanced'}
                  onChange={(e) => setDataType(e.target.value as 'basic' | 'enhanced')}
                  className="mr-2"
                />
                Enhanced AI Analysis
              </label>
            </div>
          </div>

          {/* Preset Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Configuration Preset
            </label>
            <select
              value={preset}
              onChange={(e) => {
                const newPreset = e.target.value as keyof typeof configurationPresets;
                setPreset(newPreset);
                setCustomConfig(configurationPresets[newPreset]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="minimal">Minimal</option>
              <option value="standard">Standard</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Quick Stats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demo Stats
            </label>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Applied Recommendations: {appliedRecommendations.length}</div>
              <div>Data Mode: {dataType === 'enhanced' ? 'AI Enhanced' : 'Basic'}</div>
              <div>Interactive: {customConfig.interactive ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>

        {/* Advanced Configuration */}
        {showConfig && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Configuration</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(customConfig).map(([key, value]) => {
                if (typeof value === 'boolean') {
                  return (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setCustomConfig(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </label>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Component Demo */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Play className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Live Component Demo</h2>
        </div>
        
        <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
          <ATSOptimization {...exampleProps} />
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Analytics</h3>
          <p className="text-gray-600 text-sm">
            Comprehensive ATS score breakdown with radar charts, system compatibility, 
            and industry benchmarking.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Play className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Recommendations</h3>
          <p className="text-gray-600 text-sm">
            Smart suggestions with priority ranking, estimated impact, and 
            one-click application for CV optimization.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <RotateCcw className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
          <p className="text-gray-600 text-sm">
            Live score updates, keyword analysis, and semantic matching 
            with industry-specific term recognition.
          </p>
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-gray-900 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Usage Example</h3>
        <pre className="text-sm overflow-x-auto">
          <code>{`import ATSOptimization from './components/features/AI-Powered/ATSOptimization';

// Basic usage
<ATSOptimization
  jobId="your-job-id"
  profileId="your-profile-id"
  data={{
    score: 78,
    keywords: ['JavaScript', 'React', 'TypeScript'],
    suggestions: ['Add cloud keywords', 'Quantify achievements'],
    compatibilityReport: { /* ATS report data */ }
  }}
  customization={{
    showScore: true,
    showKeywords: true,
    showSuggestions: true,
    interactive: true
  }}
  onUpdate={(data) => console.log('Updated:', data)}
  onError={(error) => console.error('Error:', error)}
/>`}</code>
        </pre>
      </div>
    </div>
  );
};

export default ATSOptimizationExample;