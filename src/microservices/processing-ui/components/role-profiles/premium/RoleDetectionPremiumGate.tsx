import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeatureAccess } from '../../../hooks/usePremiumStatus';
import { Sparkles, Target, TrendingUp, Users, Crown, ArrowRight } from 'lucide-react';

interface RoleDetectionPremiumGateProps {
  children: React.ReactNode;
  feature?: 'roleDetection' | 'roleBasedRecommendations' | 'roleProfileApplication';
  title?: string;
  description?: string;
  onSkip?: () => void; // Allow non-premium users to skip this feature
}

export const RoleDetectionPremiumGate: React.FC<RoleDetectionPremiumGateProps> = ({ 
  children, 
  feature = 'roleDetection',
  title = "🎯 AI-Powered Role Detection",
  description = "Unlock intelligent role analysis powered by advanced AI. Discover hidden career opportunities and get personalized recommendations tailored to your experience.",
  onSkip
}) => {
  const { hasAccess, isPremium, isLoading } = useFeatureAccess(feature);
  const navigate = useNavigate();

  // Show loading state while checking premium status
  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-6">
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  // If user has access, render the protected content
  if (hasAccess) {
    return <>{children}</>;
  }

  // Premium upgrade prompt for non-premium users
  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="premium-role-detection-gate">
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-blue-200 rounded-xl p-8 shadow-lg">
        {/* Premium Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-semibold">
            <Crown className="w-4 h-4" />
            Premium Feature
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">{description}</p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-blue-100">
            <Target className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Smart Role Matching</h4>
              <p className="text-gray-600 text-sm">AI analyzes your CV and identifies roles you're qualified for</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-green-100">
            <TrendingUp className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Career Path Insights</h4>
              <p className="text-gray-600 text-sm">Get recommendations for skill development and career growth</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-purple-100">
            <Users className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Industry Intelligence</h4>
              <p className="text-gray-600 text-sm">Access insights from thousands of successful career transitions</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-amber-100">
            <Sparkles className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Personalized Optimization</h4>
              <p className="text-gray-600 text-sm">Tailor your CV for specific roles with AI-powered suggestions</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="text-center space-y-4">
          <button
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            <Crown className="w-5 h-5" />
            Unlock Role Detection
            <ArrowRight className="w-5 h-5" />
          </button>
          
          {/* Skip Option for Non-Premium Users */}
          {onSkip && (
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm px-3">or</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
          )}
          
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
            >
              Skip and Continue with Basic Analysis
            </button>
          )}
          
          <p className="text-gray-500 text-sm mt-3">Join thousands of professionals optimizing their careers</p>
        </div>
      </div>
    </div>
  );
};

export default RoleDetectionPremiumGate;