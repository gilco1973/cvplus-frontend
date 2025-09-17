import React, { useState, useCallback } from 'react';
import { AlertTriangle, XCircle, AlertCircle, CheckCircle, X, ExternalLink, MessageCircle } from 'lucide-react';
import { usePolicyStatus } from '../../hooks/usePremiumStatus';

interface PolicyViolationAlertProps {
  className?: string;
  showDismissible?: boolean;
  maxViolations?: number;
  onViolationClick?: (violationId: string) => void;
}

interface Violation {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  message: string;
  details: any;
  createdAt: Date;
  resolvedAt?: Date;
}

export const PolicyViolationAlert: React.FC<PolicyViolationAlertProps> = ({
  className = '',
  showDismissible = false,
  maxViolations = 3,
  onViolationClick
}) => {
  const { 
    violations, 
    hasActiveViolations, 
    hasWarnings, 
    isLoading,
    refreshViolations 
  } = usePolicyStatus();

  const [dismissed, setDismissed] = useState(false);
  const [expandedViolation, setExpandedViolation] = useState<string | null>(null);

  // Get icon for violation severity
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get color scheme for violation severity
  const getSeverityColors = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-red-500',
          bg: 'bg-red-50',
          text: 'text-red-800',
          button: 'bg-red-100 hover:bg-red-200 text-red-800'
        };
      case 'high':
        return {
          border: 'border-red-400',
          bg: 'bg-red-50',
          text: 'text-red-700',
          button: 'bg-red-100 hover:bg-red-200 text-red-700'
        };
      case 'medium':
        return {
          border: 'border-yellow-400',
          bg: 'bg-yellow-50',
          text: 'text-yellow-800',
          button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
        };
      case 'low':
        return {
          border: 'border-blue-400',
          bg: 'bg-blue-50',
          text: 'text-blue-800',
          button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
        };
      default:
        return {
          border: 'border-gray-400',
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          button: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        };
    }
  };

  // Format violation type for display
  const formatViolationType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle violation expansion
  const handleViolationToggle = useCallback((violationId: string) => {
    setExpandedViolation(prev => prev === violationId ? null : violationId);
    if (onViolationClick) {
      onViolationClick(violationId);
    }
  }, [onViolationClick]);

  // Handle dismissal
  const handleDismiss = useCallback(() => {
    setDismissed(true);
    // Auto-show again after 24 hours if violations still exist
    setTimeout(() => {
      if (hasActiveViolations) {
        setDismissed(false);
      }
    }, 24 * 60 * 60 * 1000);
  }, [hasActiveViolations]);

  // Don't show if loading or no violations/warnings
  if (isLoading || (!hasActiveViolations && !hasWarnings)) {
    return null;
  }

  // Don't show if dismissed and dismissible
  if (dismissed && showDismissible) {
    return null;
  }

  const activeViolations = violations.filter(v => v.status === 'active').slice(0, maxViolations);
  const warningViolations = violations.filter(v => 
    ['low', 'medium'].includes(v.severity) && v.status !== 'resolved'
  ).slice(0, maxViolations);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Critical/High Violations */}
      {activeViolations.length > 0 && (
        <div className="border-l-4 border-red-500 bg-red-50 p-4 relative">
          {showDismissible && (
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          <div className="flex items-start space-x-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800">
                Active Policy Violations
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Your account has {activeViolations.length} active policy violation{activeViolations.length !== 1 ? 's' : ''} that require attention.
              </p>
              
              <div className="mt-3 space-y-2">
                {activeViolations.map((violation) => {
                  const colors = getSeverityColors(violation.severity);
                  const isExpanded = expandedViolation === violation.id;
                  
                  return (
                    <div
                      key={violation.id}
                      className={`border ${colors.border} ${colors.bg} rounded-lg p-3 transition-all`}
                    >
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => handleViolationToggle(violation.id)}
                      >
                        <div className="flex items-start space-x-2 flex-1">
                          {getSeverityIcon(violation.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className={`font-medium ${colors.text}`}>
                                {formatViolationType(violation.type)}
                              </p>
                              <span className="px-2 py-1 text-xs font-medium bg-white rounded-full">
                                {violation.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className={`text-sm ${colors.text} mt-1`}>
                              {violation.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(violation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button className={`ml-2 px-3 py-1 text-xs font-medium rounded-md ${colors.button} transition-colors`}>
                          {isExpanded ? 'Less' : 'Details'}
                        </button>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="space-y-2">
                            {violation.details && Object.keys(violation.details).length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">Details:</p>
                                <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                                  {Object.entries(violation.details).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="font-medium">{formatViolationType(key)}:</span>
                                      <span>{String(value).slice(0, 100)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors flex items-center space-x-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>Contact Support</span>
                              </button>
                              
                              <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center space-x-1">
                                <ExternalLink className="w-3 h-3" />
                                <span>Learn More</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {violations.length > maxViolations && (
                <p className="text-sm text-red-600 mt-2">
                  +{violations.length - maxViolations} more violations. 
                  <button 
                    onClick={refreshViolations}
                    className="font-medium hover:underline ml-1"
                  >
                    View all
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warningViolations.length > 0 && !hasActiveViolations && (
        <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 relative">
          {showDismissible && (
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-yellow-800">
                Policy Warnings
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your recent uploads had some minor policy issues. Please review to ensure compliance.
              </p>
              
              <div className="mt-3 space-y-2">
                {warningViolations.slice(0, 2).map((violation) => (
                  <div key={violation.id} className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        {formatViolationType(violation.type)}
                      </p>
                      <p className="text-xs text-yellow-700">
                        {violation.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {warningViolations.length > 2 && (
                <p className="text-sm text-yellow-600 mt-2">
                  +{warningViolations.length - 2} more warnings
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success state when no active violations */}
      {!hasActiveViolations && !hasWarnings && violations.length > 0 && (
        <div className="border-l-4 border-green-400 bg-green-50 p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-medium text-green-800">
                Policy Compliance Good
              </h3>
              <p className="text-sm text-green-700">
                All policy violations have been resolved. Thank you for maintaining compliance!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};