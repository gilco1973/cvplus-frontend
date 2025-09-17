import React from 'react';
import { CheckCircle, AlertCircle, RefreshCw, FileText } from 'lucide-react';

interface UsageLimitsDisplayProps {
  variant?: 'compact' | 'detailed';
  showTitle?: boolean;
  className?: string;
}

export const UsageLimitsDisplay: React.FC<UsageLimitsDisplayProps> = ({
  variant = 'detailed',
  showTitle = true,
  className = ''
}) => {
  const limits = {
    uniqueCVs: {
      free: 3,
      premium: 'Unlimited',
      period: 'per month'
    },
    refinements: {
      free: 'Unlimited',
      premium: 'Unlimited',
      description: 'for the same CV'
    },
    features: {
      free: ['Basic AI Analysis', 'Standard Templates', 'PDF Export'],
      premium: ['Advanced AI Analysis', 'All Premium Templates', 'All Export Formats', 'Priority Support']
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 ${className}`}>
        <div className="flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <span className="font-semibold text-white">Free Plan:</span> {limits.uniqueCVs.free} unique CVs per month, unlimited refinements for each CV
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
      {showTitle && (
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-cyan-400" />
          Usage Limits Explained
        </h3>
      )}
      
      <div className="space-y-6">
        {/* Unique CVs Limit */}
        <div className="flex items-start gap-4">
          <FileText className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-white mb-2">Unique CV Uploads</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Free Plan:</span>
                <span className="text-cyan-400 font-semibold">{limits.uniqueCVs.free} CVs {limits.uniqueCVs.period}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Premium Plan:</span>
                <span className="text-green-400 font-semibold">{limits.uniqueCVs.premium}</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Each unique CV upload counts toward your monthly limit. Different people's CVs or your CV for different roles count as separate unique CVs.
            </p>
          </div>
        </div>

        {/* Refinements */}
        <div className="flex items-start gap-4">
          <RefreshCw className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-white mb-2">CV Refinements</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Both Plans:</span>
                <span className="text-green-400 font-semibold">Unlimited refinements per CV</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Once you upload a CV, you can refine, enhance, and regenerate it unlimited times without using additional quota. Perfect for iterating until you get the perfect result!
            </p>
          </div>
        </div>

        {/* What counts as a unique CV */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            What counts as a unique CV?
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span className="text-gray-300">
                <span className="font-semibold text-white">New Person:</span> Each different person's CV is unique
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span className="text-gray-300">
                <span className="font-semibold text-white">New Role:</span> Same person applying for a different position
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span className="text-gray-300">
                <span className="font-semibold text-white">Major Changes:</span> Significant content changes (&gt;30% different)
              </span>
            </div>
          </div>
        </div>

        {/* What doesn't count */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-green-400" />
            What doesn't use quota?
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span className="text-gray-300">Refining existing CV recommendations</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span className="text-gray-300">Regenerating enhanced content</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span className="text-gray-300">Changing formatting or templates</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span className="text-gray-300">Minor edits and updates to the same CV</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};