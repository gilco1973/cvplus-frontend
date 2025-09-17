import React, { useState } from 'react';
import { Upload, Zap, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { generateATSKeywords } from '@cvplus/cv-processing';

interface JobDescriptionParserProps {
  onKeywordsExtracted: (keywords: {
    all: string[];
    missing: string[];
    industry: string[];
    technical: string[];
  }) => void;
  jobId: string;
  className?: string;
}

interface KeywordResults {
  all: string[];
  missing: string[];
  industry: string[];
  technical: string[];
}

export const JobDescriptionParser: React.FC<JobDescriptionParserProps> = ({
  onKeywordsExtracted,
  className = ''
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<KeywordResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateATSKeywords(jobDescription, undefined, targetRole);
      const keywordData = (result && typeof result === 'object' && 'keywords' in result) 
        ? (result as { keywords: KeywordResults }).keywords 
        : result as KeywordResults;
      
      setKeywords(keywordData);
      onKeywordsExtracted(keywordData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job description');
      console.error('Job description analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setJobDescription(text);
      };
      reader.readAsText(file);
    }
  };

  const sampleJobDescriptions = [
    {
      role: 'Software Engineer',
      snippet: 'We are looking for a Software Engineer with experience in React, TypeScript, Node.js, and cloud technologies...'
    },
    {
      role: 'Data Scientist',
      snippet: 'Seeking a Data Scientist proficient in Python, machine learning, SQL, and data visualization tools...'
    },
    {
      role: 'Digital Marketing Manager',
      snippet: 'Looking for a Digital Marketing Manager with expertise in SEO, PPC, social media marketing, and analytics...'
    }
  ];

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-100">Job Description Analyzer</h3>
          <p className="text-gray-400">Extract keywords from job postings to optimize your CV</p>
        </div>
      </div>

      {/* Input Methods */}
      <div className="space-y-4 mb-6">
        {/* Paste Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here..."
            className="w-full h-40 px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-vertical"
          />
        </div>

        {/* File Upload */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-sm text-gray-300">Upload File</span>
            <input
              type="file"
              accept=".txt,.doc,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <span className="text-xs text-gray-500">Supports .txt, .doc, .docx, .pdf files</span>
        </div>

        {/* Target Role (Optional) */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Role (Optional)
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Software Engineer, Data Scientist"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="bg-gray-900 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Quick Start Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sampleJobDescriptions.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setJobDescription(sample.snippet);
                    setTargetRole(sample.role);
                  }}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                >
                  <div className="text-sm font-medium text-blue-400">{sample.role}</div>
                  <div className="text-xs text-gray-500 mt-1">{sample.snippet.substring(0, 60)}...</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !jobDescription.trim()}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Analyze & Extract Keywords
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-red-900/20 border border-red-500 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Results */}
      {keywords && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Keywords Extracted Successfully</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* All Keywords */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                All Keywords ({keywords.all?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {keywords.all?.slice(0, 10).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs"
                  >
                    {keyword}
                  </span>
                ))}
                {(keywords.all?.length || 0) > 10 && (
                  <span className="px-2 py-1 bg-gray-600 text-gray-400 rounded text-xs">
                    +{(keywords.all?.length || 0) - 10} more
                  </span>
                )}
              </div>
            </div>

            {/* Technical Keywords */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                Technical Skills ({keywords.technical?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {keywords.technical?.slice(0, 8).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs"
                  >
                    {keyword}
                  </span>
                ))}
                {(keywords.technical?.length || 0) > 8 && (
                  <span className="px-2 py-1 bg-gray-600 text-gray-400 rounded text-xs">
                    +{(keywords.technical?.length || 0) - 8} more
                  </span>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            {keywords.missing && keywords.missing.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Missing from Your CV ({keywords.missing.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {keywords.missing.slice(0, 8).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                  {keywords.missing.length > 8 && (
                    <span className="px-2 py-1 bg-gray-600 text-gray-400 rounded text-xs">
                      +{keywords.missing.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Industry Keywords */}
            {keywords.industry && keywords.industry.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Industry Terms ({keywords.industry.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {keywords.industry.slice(0, 8).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                  {keywords.industry.length > 8 && (
                    <span className="px-2 py-1 bg-gray-600 text-gray-400 rounded text-xs">
                      +{keywords.industry.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                setJobDescription('');
                setTargetRole('');
                setKeywords(null);
                setError(null);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            >
              Clear & Restart
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
            >
              Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionParser;