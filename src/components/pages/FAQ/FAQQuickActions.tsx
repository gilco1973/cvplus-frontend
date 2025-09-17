import React from 'react';
import { Sparkles, CreditCard, MessageCircle, ArrowRight, Zap, Users } from 'lucide-react';
import { QuickActionsProps } from './types';

export const FAQQuickActions: React.FC<QuickActionsProps> = ({
  onTryNow,
  onViewPricing,
  onContactSupport,
  className = ''
}) => {
  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 ${className}`}>
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl mb-4">
          <Sparkles className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Ready to Get Started?
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Transform your traditional CV into a powerful, AI-enhanced professional profile in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Try Now Button */}
        <button
          onClick={onTryNow}
          className="group relative overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-400/20"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Try CVPlus Free</h3>
            <p className="text-cyan-100 text-sm mb-3">Start your transformation</p>
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
          
          {/* Hover effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* View Pricing Button */}
        <button
          onClick={onViewPricing}
          className="group relative overflow-hidden bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-cyan-400/50 text-white p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-700 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-500 rounded-lg mb-3 mx-auto transition-all duration-300">
              <CreditCard className="w-6 h-6 text-gray-300 group-hover:text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-1">View Pricing</h3>
            <p className="text-gray-400 group-hover:text-gray-300 text-sm mb-3">Choose your plan</p>
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-300 group-hover:text-cyan-400">
              See Plans
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </button>

        {/* Contact Support Button */}
        <button
          onClick={onContactSupport}
          className="group relative overflow-hidden bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-green-400/50 text-white p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-700 group-hover:bg-gradient-to-br group-hover:from-green-500 group-hover:to-emerald-500 rounded-lg mb-3 mx-auto transition-all duration-300">
              <MessageCircle className="w-6 h-6 text-gray-300 group-hover:text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Get Support</h3>
            <p className="text-gray-400 group-hover:text-gray-300 text-sm mb-3">We're here to help</p>
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-300 group-hover:text-green-400">
              Contact Us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </button>
      </div>

      {/* Features Highlight */}
      <div className="border-t border-gray-700 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xs text-gray-300 font-medium">AI Analysis</div>
          </div>
          
          <div className="space-y-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xs text-gray-300 font-medium">Quick Setup</div>
          </div>
          
          <div className="space-y-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
              <Users className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-xs text-gray-300 font-medium">Expert Support</div>
          </div>
          
          <div className="space-y-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
              <CreditCard className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xs text-gray-300 font-medium">Flexible Plans</div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 mb-2">Trusted by professionals worldwide</p>
        <div className="flex items-center justify-center gap-4 text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs">10k+ CVs transformed</span>
          </div>
          <div className="w-px h-3 bg-gray-600" />
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse animation-delay-500" />
            <span className="text-xs">4.9/5 rating</span>
          </div>
        </div>
      </div>
    </div>
  );
};