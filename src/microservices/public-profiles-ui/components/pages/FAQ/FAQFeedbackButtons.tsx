import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Check } from 'lucide-react';
import { FeedbackButtonsProps } from './types';

export const FAQFeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  faqId,
  isHelpful,
  onFeedback,
  className = ''
}) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedback = async (helpful: boolean) => {
    try {
      await onFeedback(faqId, helpful);
      
      // If marking as not helpful, show feedback form
      if (!helpful) {
        setShowFeedbackForm(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const submitDetailedFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    setIsSubmittingFeedback(true);
    
    try {
      // Here you would typically send the detailed feedback to your backend
      console.log('Detailed feedback submitted:', { faqId, feedback: feedbackText });
      
      setFeedbackSubmitted(true);
      setShowFeedbackForm(false);
      setFeedbackText('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setFeedbackSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting detailed feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Feedback Success Message */}
      {feedbackSubmitted && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg animate-fade-in">
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">
            Thank you for your feedback! We'll use it to improve our FAQs.
          </span>
        </div>
      )}

      {/* Main Feedback Question */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400 font-medium">Was this helpful?</span>
        
        <div className="flex items-center gap-2">
          {/* Thumbs Up */}
          <button
            onClick={() => handleFeedback(true)}
            className={`
              group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
              ${isHelpful === true
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10 border border-transparent hover:border-green-500/20'
              }
            `}
            aria-label="Mark as helpful"
            disabled={isHelpful !== undefined}
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">Yes</span>
          </button>

          {/* Thumbs Down */}
          <button
            onClick={() => handleFeedback(false)}
            className={`
              group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
              ${isHelpful === false
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20'
              }
            `}
            aria-label="Mark as not helpful"
            disabled={isHelpful !== undefined}
          >
            <ThumbsDown className="w-4 h-4" />
            <span className="text-sm font-medium">No</span>
          </button>
        </div>

        {/* Additional Feedback Button */}
        {!showFeedbackForm && (
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 rounded-lg transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Add feedback</span>
          </button>
        )}
      </div>

      {/* Detailed Feedback Form */}
      {showFeedbackForm && (
        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl animate-fade-in-down">
          <div className="mb-3">
            <label htmlFor={`feedback-${faqId}`} className="block text-sm font-medium text-gray-300 mb-2">
              How can we improve this answer?
            </label>
            <textarea
              id={`feedback-${faqId}`}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what information was missing or unclear..."
              className="w-full h-24 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {feedbackText.length}/500 characters
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setShowFeedbackForm(false);
                setFeedbackText('');
              }}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors duration-200"
              disabled={isSubmittingFeedback}
            >
              Cancel
            </button>
            
            <button
              onClick={submitDetailedFeedback}
              disabled={!feedbackText.trim() || isSubmittingFeedback}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isSubmittingFeedback ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};