/**
 * Contact Form Header Component
 * Header section for the contact form with title and description
 */
import React from 'react';
import { Mail } from 'lucide-react';
import { ContactFormHeaderProps } from './types';

export const ContactFormHeader: React.FC<ContactFormHeaderProps> = ({
  title,
  contactName,
  mode
}) => {
  const getModeSpecificStyling = () => {
    switch (mode) {
      case 'public':
        return 'text-blue-600 dark:text-blue-400';
      case 'preview':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-cyan-600 dark:text-cyan-400';
    }
  };

  return (
    <div className="contact-form-header text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className={`p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg`}>
          <Mail className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <h2 className={`text-3xl font-bold ${getModeSpecificStyling()}`}>
          {title}
        </h2>
      </div>
      <p className="text-slate-600 dark:text-slate-300 text-lg max-w-md mx-auto">
        Interested in connecting with <span className="font-semibold">{contactName}</span>? 
        Send a message and start the conversation!
      </p>
      {mode === 'preview' && (
        <div className="mt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
            Preview Mode
          </span>
        </div>
      )}
    </div>
  );
};