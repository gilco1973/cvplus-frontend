import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Target, Crown, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Section } from '../components/layout/Section';
import { RoleProfileIntegration } from '../components/role-profiles/RoleProfileIntegration';
import { getJob, type Job } from '../services/cvService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { designSystem } from '../config/designSystem';

export const RoleSelectionPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobData, setJobData] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [roleDetectionCompleted, setRoleDetectionCompleted] = useState(false);

  // Load job data on component mount
  useEffect(() => {
    const loadJobData = async () => {
      if (!jobId || !user) {
        toast.error('Missing job ID or user authentication');
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const job = await getJob(jobId);
        
        if (!job) {
          toast.error('Job not found');
          navigate('/');
          return;
        }
        
        setJobData(job);
        
        // Check if role selection was already completed
        if (job.roleProfile) {
          setSelectedRole(job.roleProfile);
          setRoleDetectionCompleted(true);
        }
      } catch (error: any) {
        console.error('Error loading job data:', error);
        toast.error('Failed to load CV data');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobData();
  }, [jobId, user, navigate]);

  const handleBack = () => {
    navigate('/');
  };

  const handleContinueToFeatures = (selectedRecommendations: string[], roleContext?: any) => {
    if (!jobId) {
      toast.error('Missing job ID');
      return;
    }

    // Store role context in state or pass to next page
    if (roleContext?.selectedRole) {
      setSelectedRole(roleContext.selectedRole);
      setRoleDetectionCompleted(true);
      
      // Show success message
      toast.success(
        `Role "${roleContext.selectedRole.name}" applied successfully! ${selectedRecommendations.length} recommendations generated.`
      );
    }

    // Navigate to feature selection
    navigate(`/customize/${jobId}`, {
      state: { roleContext, selectedRecommendations }
    });
  };

  const handleSkipRoleSelection = () => {
    if (!jobId) return;
    
    toast('Skipping role analysis - proceeding with standard features');
    navigate(`/customize/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-gray-300">
            <p className="text-lg font-medium">Analyzing your CV...</p>
            <p className="text-sm text-gray-400">Preparing role detection</p>
          </div>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <div className="text-gray-300">
            <p className="text-lg font-medium">CV Data Not Found</p>
            <p className="text-sm text-gray-400">Unable to load your CV for role analysis</p>
          </div>
          <button
            onClick={handleBack}
            className={`${designSystem.components.button.base} ${designSystem.components.button.variants.secondary.default} ${designSystem.components.button.sizes.md}`}
          >
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <Header 
        currentPage="role-selection" 
        jobId={jobId} 
        title="AI Role Detection" 
        subtitle="Discover your professional profile and get personalized recommendations"
        variant="dark" 
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Enhanced Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <div>
                <div className="text-green-400 font-semibold">CV Uploaded</div>
                <div className="text-xs text-gray-500">Analysis ready</div>
              </div>
            </div>
            
            <div className="flex-1 h-1 bg-gray-700 mx-6 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 w-1/2 rounded-full"></div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                roleDetectionCompleted 
                  ? 'bg-green-500 text-white' 
                  : 'bg-cyan-500 text-white animate-pulse'
              }`}>
                {roleDetectionCompleted ? '✓' : '2'}
              </div>
              <div>
                <div className={`font-semibold ${
                  roleDetectionCompleted ? 'text-green-400' : 'text-cyan-400'
                }`}>
                  Role Detection
                </div>
                <div className="text-xs text-gray-500">
                  {roleDetectionCompleted ? 'Completed' : 'In progress'}
                </div>
              </div>
            </div>
            
            <div className="flex-1 h-1 bg-gray-700 mx-6 rounded-full"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 font-bold">
                4
              </div>
              <div>
                <div className="text-gray-400 font-semibold">Select Features</div>
                <div className="text-xs text-gray-500">Next step</div>
              </div>
            </div>
            
            <div className="flex-1 h-1 bg-gray-700 mx-6 rounded-full"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 font-bold">
                5
              </div>
              <div>
                <div className="text-gray-400 font-semibold">Generate CV</div>
                <div className="text-xs text-gray-500">Final step</div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection Hero Section */}
        <Section variant="content" background="transparent" spacing="lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full border border-cyan-500/30 mb-6">
              <Target className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-medium">AI-Powered Role Analysis</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
              Discover Your Professional Profile
            </h1>
            
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our advanced AI analyzes your CV to detect your professional role and provides 
              personalized recommendations to maximize your career potential.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Precise Detection</h3>
              <p className="text-gray-400 text-sm">
                AI analyzes your experience, skills, and achievements to identify your role with high confidence
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Smart Recommendations</h3>
              <p className="text-gray-400 text-sm">
                Get personalized suggestions to enhance your CV based on industry standards and best practices
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Professional Edge</h3>
              <p className="text-gray-400 text-sm">
                Stand out with role-specific optimizations that increase your ATS score and recruiter appeal
              </p>
            </div>
          </div>
        </Section>

        {/* Role Profile Integration - Main Component */}
        <Section variant="content" background="transparent" spacing="lg">
          <RoleProfileIntegration
            job={jobData}
            onContinue={handleContinueToFeatures}
            onBack={handleBack}
            className="animate-fade-in-up"
          />
        </Section>

        {/* Action Bar - Skip Option */}
        <div className="mt-8 text-center">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-3">
              Want to proceed without role analysis? You can always add it later.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Upload
              </button>
              
              <div className="w-px h-6 bg-gray-600 hidden sm:block"></div>
              
              <button
                onClick={handleSkipRoleSelection}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                Skip Role Analysis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Success State */}
        {roleDetectionCompleted && selectedRole && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up">
              <CheckCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Role Applied Successfully!</p>
                <p className="text-sm text-green-100">{selectedRole.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelectionPage;