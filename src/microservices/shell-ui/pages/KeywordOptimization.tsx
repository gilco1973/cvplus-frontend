import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Zap, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import JobDescriptionParser from '../components/JobDescriptionParser';
import KeywordManager from '../components/KeywordManager';
import { useJob } from '../hooks/useJob';
import { analyzeATSCompatibility } from '../services/cvService';
import { designSystem } from '../config/designSystem';

interface KeywordResults {
  all: string[];
  missing: string[];
  industry: string[];
  technical: string[];
}

interface Keyword {
  id: string;
  text: string;
  category: 'technical' | 'soft' | 'industry' | 'custom';
  priority: 'high' | 'medium' | 'low';
  inCV: boolean;
  frequency: number;
  suggested?: boolean;
}

export const KeywordOptimization: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { job, loading: jobLoading } = useJob(id!);
  
  const [currentStep, setCurrentStep] = useState<'analyze' | 'manage' | 'optimize'>('analyze');
  const [extractedKeywords, setExtractedKeywords] = useState<KeywordResults | null>(null);
  const [managedKeywords, setManagedKeywords] = useState<Keyword[]>([]);
  const [atsScore, setAtsScore] = useState<any>(null);
  const [optimizing, setOptimizing] = useState(false);

  // Analyze current CV for ATS compatibility
  useEffect(() => {
    if (job?.id) {
      analyzeATSCompatibility(job.id)
        .then((result) => {
          console.log('KeywordOptimization: ATS analysis raw result:', result);
          const atsScore = (result as unknown).result?.atsScore || (result as unknown).atsScore;
          console.log('KeywordOptimization: Extracted atsScore:', atsScore);
          setAtsScore(atsScore);
        })
        .catch((error) => {
          console.error('Failed to analyze ATS compatibility:', error);
        });
    }
  }, [job?.id]);

  const handleKeywordsExtracted = (keywords: KeywordResults) => {
    setExtractedKeywords(keywords);
    setCurrentStep('manage');
  };

  const handleKeywordsManaged = (keywords: Keyword[]) => {
    setManagedKeywords(keywords);
  };

  const handleOptimizeCV = async () => {
    if (!job?.id || !managedKeywords.length) return;

    setOptimizing(true);
    try {
      // Get high priority missing keywords
      const missingKeywords = managedKeywords
        .filter(k => !k.inCV && (k.priority === 'high' || k.priority === 'medium'))
        .map(k => k.text);

      if (missingKeywords.length > 0) {
        // Re-analyze with target keywords
        console.log('KeywordOptimization: Re-analyzing with keywords:', missingKeywords);
        const result = await analyzeATSCompatibility(job.id, undefined, missingKeywords);
        console.log('KeywordOptimization: Re-analysis raw result:', result);
        const atsScore = (result as unknown).result?.atsScore || (result as unknown).atsScore;
        console.log('KeywordOptimization: Re-analysis extracted atsScore:', atsScore);
        setAtsScore(atsScore);
      }

      setCurrentStep('optimize');
    } catch (error) {
      console.error('Failed to optimize CV:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'analyze': return 33;
      case 'manage': return 66;
      case 'optimize': return 100;
      default: return 33;
    }
  };

  const getOptimizationSuggestions = () => {
    if (!managedKeywords.length) return [];

    const missingHighPriority = managedKeywords.filter(k => !k.inCV && k.priority === 'high');
    const missingMediumPriority = managedKeywords.filter(k => !k.inCV && k.priority === 'medium');

    const suggestions = [];

    if (missingHighPriority.length > 0) {
      suggestions.push({
        type: 'high',
        title: 'Critical Keywords Missing',
        description: `Add these ${missingHighPriority.length} high-priority keywords to your CV`,
        keywords: missingHighPriority.slice(0, 5),
        impact: 'High impact on ATS scoring'
      });
    }

    if (missingMediumPriority.length > 0) {
      suggestions.push({
        type: 'medium',
        title: 'Recommended Keywords',
        description: `Consider adding these ${missingMediumPriority.length} keywords for better optimization`,
        keywords: missingMediumPriority.slice(0, 5),
        impact: 'Medium impact on ATS scoring'
      });
    }

    return suggestions;
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your CV...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">CV not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      {/* Header */}
      <div className="bg-neutral-800 border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/results/${job.id}`)}
                className="flex items-center gap-2 text-gray-400 hover:text-neutral-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Results
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-100">Keyword Optimization</h1>
                <p className="text-gray-400">Optimize your CV for ATS systems and target roles</p>
              </div>
            </div>
            {atsScore && (
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${
                  atsScore.overall >= 80 ? 'text-green-400' : 
                  atsScore.overall >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {atsScore.overall}%
                </div>
                <div className="text-sm text-gray-400">Current ATS Score</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-neutral-800 border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-300">Progress</span>
            <span className="text-sm text-gray-400">{getStepProgress()}%</span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span className={currentStep === 'analyze' ? 'text-blue-400' : ''}>1. Analyze Job</span>
            <span className={currentStep === 'manage' ? 'text-blue-400' : ''}>2. Manage Keywords</span>
            <span className={currentStep === 'optimize' ? 'text-blue-400' : ''}>3. Optimize CV</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Job Description Analysis */}
        {currentStep === 'analyze' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-neutral-100 mb-2">Analyze Target Job</h2>
              <p className="text-xl text-gray-400">
                Paste a job description to extract relevant keywords and requirements
              </p>
            </div>
            
            <JobDescriptionParser
              onKeywordsExtracted={handleKeywordsExtracted}
              jobId={job.id}
            />
          </div>
        )}

        {/* Step 2: Keyword Management */}
        {currentStep === 'manage' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h2 className="text-3xl font-bold text-neutral-100">Manage Keywords</h2>
              </div>
              <p className="text-xl text-gray-400">
                Review extracted keywords and customize your keyword strategy
              </p>
            </div>

            <KeywordManager
              extractedKeywords={extractedKeywords || undefined}
              onKeywordsChange={handleKeywordsManaged}
            />

            {managedKeywords.length > 0 && (
              <div className="text-center">
                <button
                  onClick={handleOptimizeCV}
                  disabled={optimizing}
                  className="px-8 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-600 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
                >
                  {optimizing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 inline-block mr-2" />
                      Optimize My CV
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Optimization Results */}
        {currentStep === 'optimize' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-neutral-100 mb-2">Optimization Complete</h2>
              <p className="text-xl text-gray-400">
                Here's how to improve your CV based on the keyword analysis
              </p>
            </div>

            {/* Optimization Suggestions */}
            <div className="space-y-6">
              {getOptimizationSuggestions().map((suggestion, index) => (
                <div key={index} className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                      suggestion.type === 'high' ? 'bg-red-600' : 'bg-yellow-600'
                    }`}>
                      {suggestion.type === 'high' ? 
                        <AlertTriangle className="w-6 h-6 text-white" /> : 
                        <Target className="w-6 h-6 text-white" />
                      }
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                        {suggestion.title}
                      </h3>
                      <p className="text-gray-400 mb-4">{suggestion.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {suggestion.keywords.map((keyword, keyIndex) => (
                          <span
                            key={keyIndex}
                            className={`px-3 py-1 rounded-full text-sm ${
                              suggestion.type === 'high' 
                                ? 'bg-red-600/20 text-red-300' 
                                : 'bg-yellow-600/20 text-yellow-300'
                            }`}
                          >
                            {keyword.text}
                          </span>
                        ))}
                      </div>
                      <p className={`text-sm ${
                        suggestion.type === 'high' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {suggestion.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(`/results/${job.id}`)}
                className="px-6 py-3 bg-semantic-success-500 hover:bg-semantic-success-600 rounded-lg font-medium text-white transition-colors"
              >
                Apply Changes to CV
              </button>
              <button
                onClick={() => setCurrentStep('manage')}
                className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg font-medium text-neutral-300 transition-colors"
              >
                Refine Keywords
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordOptimization;