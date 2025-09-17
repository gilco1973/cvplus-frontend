/**
 * Error Recovery Dialog Component
 * 
 * Provides user-friendly error recovery interface with clear options,
 * progress preservation indicators, and actionable recovery steps.
 */

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  X,
  Save,
  Shield,
  Zap
} from 'lucide-react';
import { ErrorType, ErrorSeverity, type ClassifiedError } from '../../services/error-recovery/ErrorClassification';
import type { ProcessingCheckpoint } from '../../services/error-recovery/CheckpointManager';
import type { RetryResult } from '../../services/error-recovery/RetryMechanism';

interface ErrorRecoveryDialogProps {
  error: ClassifiedError;
  checkpoint?: ProcessingCheckpoint | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => Promise<void>;
  onRestoreCheckpoint?: () => Promise<void>;
  onReportError?: (error: ClassifiedError) => void;
  retryResult?: RetryResult<unknown>;
  isRetrying?: boolean;
  showCheckpointInfo?: boolean;
}

export const ErrorRecoveryDialog: React.FC<ErrorRecoveryDialogProps> = ({
  error,
  checkpoint,
  isOpen,
  onClose,
  onRetry,
  onRestoreCheckpoint,
  onReportError,
  retryResult,
  isRetrying = false,
  showCheckpointInfo = true
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedAction('');
      setShowDetails(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getSeverityIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case ErrorSeverity.MEDIUM:
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case ErrorSeverity.HIGH:
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case ErrorSeverity.CRITICAL:
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getSeverityColor = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return 'yellow';
      case ErrorSeverity.MEDIUM:
        return 'orange';
      case ErrorSeverity.HIGH:
        return 'red';
      case ErrorSeverity.CRITICAL:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getErrorTypeDisplay = () => {
    const typeDisplayMap = {
      [ErrorType.NETWORK]: 'Connection Issue',
      [ErrorType.API_RATE_LIMIT]: 'Service Busy',
      [ErrorType.AUTHENTICATION]: 'Authentication Required',
      [ErrorType.PROCESSING]: 'Processing Error',
      [ErrorType.VALIDATION]: 'Input Validation',
      [ErrorType.STORAGE]: 'File Access Issue',
      [ErrorType.TIMEOUT]: 'Request Timeout',
      [ErrorType.QUOTA_EXCEEDED]: 'Usage Limit Reached',
      [ErrorType.UNKNOWN]: 'Unexpected Error'
    };
    return typeDisplayMap[error.type] || 'Error';
  };

  const handleActionClick = async (action: string) => {
    setSelectedAction(action);
    
    switch (action) {
      case 'retry':
        await onRetry();
        break;
      case 'restore':
        if (onRestoreCheckpoint) {
          await onRestoreCheckpoint();
        }
        break;
      case 'report':
        if (onReportError) {
          onReportError(error);
        }
        break;
    }
  };

  const renderRecoveryOptions = () => {
    const options = [];

    // Retry option
    if (error.retryable && !isRetrying) {
      options.push(
        <button
          key="retry"
          onClick={() => handleActionClick('retry')}
          disabled={isRetrying}
          className="flex items-center space-x-3 w-full p-4 bg-blue-50 hover:bg-blue-100 
                     border border-blue-200 rounded-lg transition-colors text-left"
        >
          <RefreshCw className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">Try Again</h3>
            <p className="text-sm text-blue-700">
              Retry the operation that failed
              {error.maxRetries > 0 && ` (${error.maxRetries} attempts remaining)`}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-600 ml-auto" />
        </button>
      );
    }

    // Checkpoint restore option
    if (checkpoint && showCheckpointInfo && onRestoreCheckpoint) {
      options.push(
        <button
          key="restore"
          onClick={() => handleActionClick('restore')}
          disabled={isRetrying}
          className="flex items-center space-x-3 w-full p-4 bg-green-50 hover:bg-green-100 
                     border border-green-200 rounded-lg transition-colors text-left"
        >
          <Save className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-medium text-green-900">Restore Progress</h3>
            <p className="text-sm text-green-700">
              Continue from {checkpoint.metadata.step} ({checkpoint.metadata.progress}% complete)
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-green-600 ml-auto" />
        </button>
      );
    }

    // Report error option
    if (error.supportTicketRequired || error.severity === ErrorSeverity.CRITICAL) {
      options.push(
        <button
          key="report"
          onClick={() => handleActionClick('report')}
          className="flex items-center space-x-3 w-full p-4 bg-purple-50 hover:bg-purple-100 
                     border border-purple-200 rounded-lg transition-colors text-left"
        >
          <Shield className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-medium text-purple-900">Get Help</h3>
            <p className="text-sm text-purple-700">
              Report this issue to our support team
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-600 ml-auto" />
        </button>
      );
    }

    return options;
  };

  const renderActionableSteps = () => {
    if (!error.actionableSteps || error.actionableSteps.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="font-medium text-gray-900 mb-2">What you can do:</h4>
        <ul className="space-y-2">
          {error.actionableSteps.map((step, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderRetryProgress = () => {
    if (!retryResult || !retryResult.attempts.length) return null;

    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Recovery Progress</h4>
        <div className="space-y-2">
          {retryResult.attempts.map((attempt, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              {attempt.success ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span className="text-gray-700">
                Attempt {attempt.attemptNumber}
                {attempt.success ? ' - Success' : ` - ${attempt.error?.message}`}
              </span>
            </div>
          ))}
          {retryResult.recoveredFromCheckpoint && (
            <div className="flex items-center space-x-2 text-sm">
              <Save className="w-4 h-4 text-blue-500" />
              <span className="text-blue-700">Recovered from checkpoint</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 bg-${getSeverityColor()}-50 rounded-t-xl border-b`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {getSeverityIcon()}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getErrorTypeDisplay()}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Error ID: {error.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User-friendly message */}
          <div className="mb-6">
            <p className="text-gray-800 leading-relaxed">
              {error.userMessage}
            </p>
            {renderActionableSteps()}
          </div>

          {/* Checkpoint info */}
          {checkpoint && showCheckpointInfo && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Save className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Progress Saved</span>
              </div>
              <p className="text-sm text-blue-700">
                Your progress has been saved at "{checkpoint.metadata.step}". 
                You can continue from where you left off.
              </p>
              <div className="mt-2 bg-blue-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${checkpoint.metadata.progress}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {checkpoint.metadata.progress}% Complete
              </p>
            </div>
          )}

          {/* Recovery options */}
          <div className="space-y-3 mb-6">
            <h3 className="font-medium text-gray-900">Recovery Options</h3>
            {renderRecoveryOptions()}
          </div>

          {/* Retry progress */}
          {renderRetryProgress()}

          {/* Retry indicator */}
          {isRetrying && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="animate-spin">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <span className="font-medium text-yellow-900">Attempting Recovery</span>
                  <p className="text-sm text-yellow-700">
                    {selectedAction === 'retry' && 'Retrying the operation...'}
                    {selectedAction === 'restore' && 'Restoring from checkpoint...'}
                    {!selectedAction && 'Processing recovery...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error details toggle */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
            >
              <span>{showDetails ? 'Hide' : 'Show'} technical details</span>
              <ArrowRight className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </button>
            
            {showDetails && (
              <div className="mt-3 p-3 bg-gray-50 rounded text-xs font-mono">
                <div><strong>Type:</strong> {error.type}</div>
                <div><strong>Severity:</strong> {error.severity}</div>
                <div><strong>Recoverable:</strong> {error.recoverable ? 'Yes' : 'No'}</div>
                <div><strong>Retryable:</strong> {error.retryable ? 'Yes' : 'No'}</div>
                <div><strong>Operation:</strong> {error.context.operation}</div>
                <div><strong>Timestamp:</strong> {error.context.timestamp.toISOString()}</div>
                {error.originalError.stack && (
                  <div className="mt-2">
                    <strong>Stack:</strong>
                    <pre className="mt-1 text-xs overflow-x-auto">
                      {error.originalError.stack.split('\n').slice(0, 5).join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            disabled={isRetrying}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
