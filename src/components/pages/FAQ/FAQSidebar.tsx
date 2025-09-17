import React, { useState } from 'react';
import { 
  Phone, Mail, ExternalLink, Clock, 
  HelpCircle, ArrowRight, Tag, TrendingUp 
} from 'lucide-react';
import { FAQSidebarProps } from './types';
import { CallSchedulingWidget } from './CallSchedulingWidget';

export const FAQSidebar: React.FC<FAQSidebarProps> = ({
  categories,
  selectedCategory,
  popularTags,
  onCategorySelect,
  onTagSelect,
  className = ''
}) => {
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);

  return (
    <>
      <aside className={`space-y-6 ${className}`}>
      {/* Quick Actions Card */}
      <div className="bg-gradient-to-br from-cyan-400/10 to-blue-500/10 border border-cyan-400/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Need More Help?
        </h3>
        
        <div className="space-y-3">
          <button 
            onClick={() => {
              const subject = encodeURIComponent('Please contact me');
              const body = encodeURIComponent('Hello CVPlus Support Team,\n\nI would like to request assistance with my account and have some questions about your services.\n\nPlease contact me at your earliest convenience.\n\nThank you for your time.\n\nBest regards');
              const gmailUrl = `https://mail.google.com/mail/?view=cm&to=help@cvplus.ai&su=${subject}&body=${body}`;
              window.open(gmailUrl, '_blank');
            }}
            className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 hover:border-blue-400/30 rounded-xl transition-all duration-200 text-left group"
          >
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
              <Mail className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-100 group-hover:text-white">Email Support</div>
              <div className="text-xs text-gray-400">24-48h response</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
          </button>

          <button 
            onClick={() => setIsSchedulingOpen(true)}
            className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 hover:border-green-400/30 rounded-xl transition-all duration-200 text-left group"
          >
            <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
              <Phone className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-100 group-hover:text-white">Schedule Call</div>
              <div className="text-xs text-gray-400">Book a time that works</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" />
          </button>
        </div>

        {/* Support Hours */}
        <div className="mt-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Support Hours</span>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Mon-Fri: 9AM - 6PM EST</div>
            <div>Sat-Sun: 10AM - 4PM EST</div>
          </div>
        </div>
      </div>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            Popular Topics
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => onTagSelect(tag)}
                className="inline-flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-sm rounded-lg transition-all duration-200 hover:scale-105"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Quick Links */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Categories</h3>
        
        <div className="space-y-2">
          {categories.slice(0, 6).map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`
                w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 text-left
                ${selectedCategory === category.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }
              `}
            >
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-xs text-gray-400">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Try CVPlus CTA */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-purple-400 mb-3">
          Ready to Transform Your CV?
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          Experience the power of AI-driven CV transformation from "Paper to Powerful".
        </p>
        
        <div className="space-y-3">
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg">
            Try CVPlus Free
          </button>
          
          <button className="w-full flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors">
            View Pricing Plans
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Resources</h3>
        
        <div className="space-y-3">
          <a
            href="/help/getting-started"
            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
          >
            <div className="w-2 h-2 bg-cyan-400 rounded-full group-hover:scale-125 transition-transform" />
            <span className="text-sm">Getting Started Guide</span>
          </a>
          
          <a
            href="/help/video-tutorials"
            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:scale-125 transition-transform" />
            <span className="text-sm">Video Tutorials</span>
          </a>
          
          <a
            href="/help/best-practices"
            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full group-hover:scale-125 transition-transform" />
            <span className="text-sm">Best Practices</span>
          </a>
          
          <a
            href="/api-docs"
            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
          >
            <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:scale-125 transition-transform" />
            <span className="text-sm">API Documentation</span>
          </a>
        </div>
      </div>
      </aside>

      {/* Call Scheduling Widget */}
      <CallSchedulingWidget
        isOpen={isSchedulingOpen}
        onClose={() => setIsSchedulingOpen(false)}
      />
    </>
  );
};