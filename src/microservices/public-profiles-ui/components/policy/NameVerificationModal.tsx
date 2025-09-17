import React, { useState, useCallback } from 'react';
import { X, AlertTriangle, User, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NameVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (result: VerificationResult) => void;
  nameVerificationData: {
    extractedName: string;
    accountName: string;
    confidence: number;
    matchType: 'exact' | 'partial' | 'fuzzy' | 'none';
    suggestions?: string[];
  };
}

interface VerificationResult {
  action: 'confirmed' | 'updated_account' | 'explained' | 'cancelled';
  updatedName?: string;
  explanation?: string;
}

export const NameVerificationModal: React.FC<NameVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerificationComplete,
  nameVerificationData
}) => {
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState<'confirm' | 'update' | 'explain' | null>(null);
  const [updatedName, setUpdatedName] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { extractedName, accountName, confidence, matchType, suggestions } = nameVerificationData;

  // Handle action selection
  const handleActionSelect = useCallback((action: 'confirm' | 'update' | 'explain') => {
    setSelectedAction(action);
    
    if (action === 'update' && suggestions && suggestions.length > 0) {
      setUpdatedName(suggestions[0]);
    }
  }, [suggestions]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!selectedAction) return;

    setIsSubmitting(true);

    try {
      let result: VerificationResult;

      switch (selectedAction) {
        case 'confirm':
          result = { action: 'confirmed' };
          break;
        case 'update':
          if (!updatedName.trim()) {
            alert('Please enter the correct name');
            setIsSubmitting(false);
            return;
          }
          result = { action: 'updated_account', updatedName: updatedName.trim() };
          break;
        case 'explain':
          if (!explanation.trim()) {
            alert('Please provide an explanation');
            setIsSubmitting(false);
            return;
          }
          result = { action: 'explained', explanation: explanation.trim() };
          break;
        default:
          result = { action: 'cancelled' };
      }

      onVerificationComplete(result);
    } catch (error) {
      console.error('Error during verification:', error);
      alert('An error occurred during verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAction, updatedName, explanation, onVerificationComplete]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onVerificationComplete({ action: 'cancelled' });
      onClose();
    }
  }, [isSubmitting, onVerificationComplete, onClose]);

  if (!isOpen) return null;

  // Get confidence color and text
  const getConfidenceInfo = (conf: number) => {
    if (conf >= 0.8) return { color: 'text-green-600', text: 'High' };
    if (conf >= 0.5) return { color: 'text-yellow-600', text: 'Medium' };
    return { color: 'text-red-600', text: 'Low' };
  };

  const confidenceInfo = getConfidenceInfo(confidence);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Name Verification Required
                </h3>
                <p className="text-sm text-gray-500">
                  The name in your CV doesn't match your account
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Name comparison */}
          <div className="mb-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Name in CV</p>
                  <p className="text-lg font-semibold text-gray-800">{extractedName}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Account Name</p>
                  <p className="text-lg font-semibold text-gray-800">{accountName}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Match Confidence</span>
                <span className={`text-sm font-medium ${confidenceInfo.color}`}>
                  {confidenceInfo.text} ({Math.round(confidence * 100)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Action selection */}
          <div className="mb-6 space-y-3">
            <p className="text-sm font-medium text-gray-900">How would you like to resolve this?</p>
            
            {/* Confirm CV name is correct */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedAction === 'confirm' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleActionSelect('confirm')}
            >
              <div className="flex items-start space-x-3">
                <CheckCircle className={`w-5 h-5 mt-0.5 ${
                  selectedAction === 'confirm' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">The CV name is correct</p>
                  <p className="text-sm text-gray-600">
                    This is my CV and the name "{extractedName}" is accurate
                  </p>
                </div>
              </div>
            </div>

            {/* Update account name */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedAction === 'update' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleActionSelect('update')}
            >
              <div className="flex items-start space-x-3">
                <User className={`w-5 h-5 mt-0.5 ${
                  selectedAction === 'update' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Update my account name</p>
                  <p className="text-sm text-gray-600">
                    Change my account name to match the CV
                  </p>
                  {selectedAction === 'update' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New account name
                      </label>
                      <input
                        type="text"
                        value={updatedName}
                        onChange={(e) => setUpdatedName(e.target.value)}
                        placeholder="Enter correct name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {suggestions && suggestions.length > 1 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.slice(1).map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => setUpdatedName(suggestion)}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Provide explanation */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedAction === 'explain' 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleActionSelect('explain')}
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  selectedAction === 'explain' ? 'text-orange-600' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Provide explanation</p>
                  <p className="text-sm text-gray-600">
                    Explain why the names are different (e.g., nickname, maiden name)
                  </p>
                  {selectedAction === 'explain' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Explanation
                      </label>
                      <textarea
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        placeholder="Please explain why the names are different..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedAction || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </div>

          {/* Security notice */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <span className="font-medium">Security Notice:</span> Name verification helps prevent unauthorized use of CVs. 
              Your response will be recorded for policy compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};