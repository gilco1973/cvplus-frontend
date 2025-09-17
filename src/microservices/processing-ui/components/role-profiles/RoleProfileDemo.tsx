import React, { useState } from 'react';
import { Header } from '../Header';
import { RoleProfileIntegration } from './RoleProfileIntegration';
import { designSystem } from '../../config/designSystem';
import { ArrowLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Job } from '../../services/cvService';

/**
 * Demo component showing how to integrate role profile system with CVAnalysisPage
 * This can be used as a reference for implementing role profiles in the main flow
 */
export const RoleProfileDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'analysis' | 'role-profiles' | 'preview'>('analysis');
  
  // Mock job data for demo purposes
  const mockJob: Job = {
    id: 'demo-job-123',
    userId: 'demo-user',
    status: 'analyzed',
    originalFileName: 'demo-cv.pdf',
    processedAt: new Date(),
    parsedData: {
      summary: 'Experienced software engineer with 5+ years in full-stack development',
      experience: [
        {
          position: 'Senior Software Engineer',
          company: 'Tech Corp',
          duration: '2 years',
          description: 'Led development of microservices architecture'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
      education: [
        {
          degree: 'Bachelor of Computer Science',
          institution: 'University of Technology',
          year: '2018'
        }
      ]
    }
  };

  const handleContinueFromAnalysis = () => {
    setCurrentStep('role-profiles');
    toast.success('Proceeding to role-enhanced analysis', { icon: '🚀' });
  };

  const handleContinueToPreview = (selectedRecommendations: string[], roleContext?: any) => {
    console.log('Demo: Continuing to preview with:', {
      selectedRecommendations: selectedRecommendations.length,
      roleContext
    });
    
    setCurrentStep('preview');
    toast.success(
      `Preview ready with ${selectedRecommendations.length} role-enhanced recommendations!`,
      { icon: '✨', duration: 5000 }
    );
  };

  const handleBack = () => {
    if (currentStep === 'role-profiles') {
      setCurrentStep('analysis');
    } else if (currentStep === 'preview') {
      setCurrentStep('role-profiles');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <Header 
        currentPage="analysis" 
        jobId={mockJob.id}
        title="Role Profile System Demo"
        subtitle="Experience the enhanced CV analysis with AI role detection"
        variant="dark"
        showBreadcrumbs={true}
      />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { id: 'analysis', label: 'CV Analysis', icon: '📊' },
              { id: 'role-profiles', label: 'Role Enhancement', icon: '🎯' },
              { id: 'preview', label: 'Enhanced CV', icon: '✨' }
            ].map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = 
                (step.id === 'analysis' && currentStep !== 'analysis') ||
                (step.id === 'role-profiles' && currentStep === 'preview');
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${
                    isActive 
                      ? 'bg-primary-900/30 border-primary-500/50 text-primary-300'
                      : isCompleted
                      ? 'bg-green-900/30 border-green-500/50 text-green-300'
                      : 'bg-gray-800 border-gray-600 text-gray-400'
                  }`}>
                    <span className="text-lg">{step.icon}</span>
                    <span className="font-medium">{step.label}</span>
                  </div>
                  
                  {index < 2 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-600'
                    }`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'analysis' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Mock Traditional Analysis Results */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-gray-100 mb-4">Traditional CV Analysis Complete</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-300">72%</div>
                  <div className="text-sm text-gray-400">ATS Score</div>
                </div>
                <div className="text-center p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-orange-300">15</div>
                  <div className="text-sm text-gray-400">Improvements Found</div>
                </div>
                <div className="text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-300">+13%</div>
                  <div className="text-sm text-gray-400">Potential Boost</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-gray-100">New: Role-Enhanced Analysis</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Get personalized recommendations based on your career role with our AI-powered role detection system.
                  This can increase your ATS compatibility by an additional 15-25%.
                </p>
                <button
                  onClick={handleContinueFromAnalysis}
                  className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.lg} flex items-center gap-3`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Try Role-Enhanced Analysis</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'role-profiles' && (
          <RoleProfileIntegration
            job={mockJob}
            onContinue={handleContinueToPreview}
            onBack={handleBack}
            className="animate-fade-in-up"
          />
        )}

        {currentStep === 'preview' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Mock Enhanced Preview */}
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-100">Enhanced CV Ready!</h2>
                  <p className="text-green-300">Your CV has been enhanced with role-specific improvements</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-300">87%</div>
                  <div className="text-sm text-gray-400">New ATS Score</div>
                </div>
                <div className="text-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-300">22</div>
                  <div className="text-sm text-gray-400">Enhancements Applied</div>
                </div>
                <div className="text-center p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-300">Software Engineer</div>
                  <div className="text-sm text-gray-400">Detected Role</div>
                </div>
                <div className="text-center p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                  <div className="text-2xl font-bold text-orange-300">+15%</div>
                  <div className="text-sm text-gray-400">Role Boost</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className={`${designSystem.components.button.base} ${designSystem.components.button.variants.ghost.default} ${designSystem.components.button.sizes.md} flex items-center gap-2`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Role Analysis</span>
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toast.success('Download would start here!')}
                  className={`${designSystem.components.button.base} ${designSystem.components.button.variants.secondary.default} ${designSystem.components.button.sizes.md}`}
                >
                  Download Enhanced CV
                </button>
                <button
                  onClick={() => toast.success('Sharing options would appear here!')}
                  className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.md}`}
                >
                  Share & Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoleProfileDemo;