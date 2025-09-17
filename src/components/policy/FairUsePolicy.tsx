import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, Users, FileText, RefreshCw, Ban } from 'lucide-react';

interface FairUsePolicyProps {
  variant?: 'full' | 'summary';
  className?: string;
}

export const FairUsePolicy: React.FC<FairUsePolicyProps> = ({
  variant = 'full',
  className = ''
}) => {
  const acceptableUses = [
    {
      icon: <Users className="w-5 h-5 text-green-400" />,
      title: 'Personal Career Development',
      description: 'Creating and enhancing your own CV for job applications'
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-green-400" />,
      title: 'Unlimited Refinements',
      description: 'Iterating and improving your CV until it\'s perfect'
    },
    {
      icon: <FileText className="w-5 h-5 text-green-400" />,
      title: 'Multiple Versions',
      description: 'Creating different CV versions for various job applications'
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      title: 'Educational Purposes',
      description: 'Learning how to improve CV writing and presentation'
    }
  ];

  const prohibitedUses = [
    {
      icon: <Ban className="w-5 h-5 text-red-400" />,
      title: 'Commercial Services',
      description: 'Using CVPlus to provide CV services to others for profit'
    },
    {
      icon: <Ban className="w-5 h-5 text-red-400" />,
      title: 'Mass Processing',
      description: 'Processing CVs for multiple people without their direct involvement'
    },
    {
      icon: <Ban className="w-5 h-5 text-red-400" />,
      title: 'Automated Systems',
      description: 'Using bots or scripts to automate CV generation at scale'
    },
    {
      icon: <Ban className="w-5 h-5 text-red-400" />,
      title: 'Reselling Access',
      description: 'Sharing or selling your account access to others'
    }
  ];

  if (variant === 'summary') {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 ${className}`}>
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Fair Use Policy</h3>
            <p className="text-gray-300 text-sm mb-4">
              CVPlus is designed for personal career development. Each user should process their own CV directly.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Personal use only</span>
              </div>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Unlimited refinements</span>
              </div>
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <Ban className="w-4 h-4" />
                <span>No commercial use</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-xl ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600/10 to-blue-600/10 p-8 rounded-t-xl border-b border-gray-800">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="w-10 h-10 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Fair Use Policy</h1>
        </div>
        <p className="text-gray-300 text-lg">
          Guidelines for responsible use of CVPlus services
        </p>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Introduction */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-3">Policy Overview</h2>
              <p className="text-gray-300 leading-relaxed">
                CVPlus is designed as a personal career development tool. Our Fair Use Policy ensures that all users 
                have equal access to our AI-powered CV enhancement services while maintaining service quality and 
                preventing abuse. This policy applies to all users, including those on Free and Premium plans.
              </p>
            </div>
          </div>
        </div>

        {/* Acceptable Use */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <CheckCircle className="w-7 h-7 text-green-400" />
            Acceptable Use
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {acceptableUses.map((use, index) => (
              <div key={index} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-start gap-3">
                  {use.icon}
                  <div>
                    <h3 className="font-semibold text-white mb-1">{use.title}</h3>
                    <p className="text-sm text-gray-400">{use.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prohibited Use */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-red-400" />
            Prohibited Use
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {prohibitedUses.map((use, index) => (
              <div key={index} className="bg-red-900/10 rounded-lg p-4 border border-red-900/30">
                <div className="flex items-start gap-3">
                  {use.icon}
                  <div>
                    <h3 className="font-semibold text-white mb-1">{use.title}</h3>
                    <p className="text-sm text-gray-400">{use.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Limits */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Usage Limits</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-gray-300">
                <span className="font-semibold text-white">Free Plan:</span> 3 unique CVs per month, unlimited refinements per CV
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-gray-300">
                <span className="font-semibold text-white">Premium Plan:</span> Unlimited unique CVs, unlimited refinements
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-gray-300">
                <span className="font-semibold text-white">Professional Plan:</span> Custom limits for organizational use
              </p>
            </div>
          </div>
        </div>

        {/* Enforcement */}
        <div className="bg-yellow-900/20 rounded-lg p-6 border border-yellow-700/30">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            Policy Enforcement
          </h2>
          <p className="text-gray-300 mb-4">
            We monitor usage patterns to ensure compliance with this Fair Use Policy. Violations may result in:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span className="text-gray-300">Warning notifications for first-time violations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span className="text-gray-300">Temporary suspension of service for repeated violations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span className="text-gray-300">Permanent account termination for severe or persistent abuse</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span className="text-gray-300">No refunds for terminated accounts due to policy violations</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="text-center pt-8 border-t border-gray-800">
          <p className="text-gray-400 mb-2">
            Questions about our Fair Use Policy?
          </p>
          <a
            href="/contact"
            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            Contact our support team
          </a>
        </div>
      </div>
    </div>
  );
};