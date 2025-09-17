import React, { useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Upload, Crown } from 'lucide-react';
import { useUsageLimits, usePolicyStatus } from '../../hooks/usePremiumStatus';
import { useAuth } from '../../contexts/AuthContext';

interface PreUploadPolicyCheckProps {
  onUploadAllowed: () => void;
  onUploadBlocked: (reason: string) => void;
  className?: string;
}

interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
  } | null;
}

export const PreUploadPolicyCheck: React.FC<PreUploadPolicyCheckProps> = ({
  onUploadAllowed,
  onUploadBlocked,
  className = ''
}) => {
  const { user } = useAuth();
  const { 
    canUpload, 
    remainingUploads, 
    usagePercentage, 
    isApproachingLimit,
    usageStats,
    isLoading: usageLoading 
  } = useUsageLimits();
  
  const { 
    hasActiveViolations, 
    hasWarnings, 
    violations,
    isLoading: violationsLoading 
  } = usePolicyStatus();

  const [fileValidation, setFileValidation] = useState<FileValidationResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // File validation logic
  const validateFile = useCallback((file: File): FileValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // File size check (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      errors.push('File size exceeds 10MB limit');
    }

    // File type check
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported. Please upload PDF, DOC, DOCX, or TXT files only.');
    }

    // File name validation
    if (file.name.length > 255) {
      errors.push('File name is too long (max 255 characters)');
    }

    // Suspicious file name patterns
    const suspiciousPatterns = [
      /template/i,
      /example/i,
      /sample/i,
      /test/i,
      /dummy/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      warnings.push('File name suggests this might be a template or sample CV');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };
  }, []);

  // Handle file selection or drop
  const handleFileSelect = useCallback((file: File) => {
    if (!user) {
      onUploadBlocked('Please log in to upload your CV');
      return;
    }

    // Check for active policy violations
    if (hasActiveViolations) {
      onUploadBlocked('Upload blocked due to active policy violations. Please resolve violations first.');
      return;
    }

    // Check usage limits
    if (!canUpload) {
      const reason = usageStats?.subscriptionStatus === 'free' 
        ? 'Monthly upload limit reached. Upgrade to Premium for unlimited refinements.'
        : 'Monthly unique CV limit reached. You can refine existing CVs or wait until next month.';
      onUploadBlocked(reason);
      return;
    }

    // Validate file
    const validation = validateFile(file);
    setFileValidation(validation);

    if (!validation.valid) {
      onUploadBlocked(`File validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    // Show warnings if any but allow upload
    if (validation.warnings.length > 0) {
      // Could show a confirmation dialog here
      console.warn('File warnings:', validation.warnings);
    }

    // All checks passed
    onUploadAllowed();
  }, [user, hasActiveViolations, canUpload, usageStats, validateFile, onUploadAllowed, onUploadBlocked]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // File input handler
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Status indicator component
  const StatusIndicator = () => {
    if (usageLoading || violationsLoading) {
      return (
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
          <span className="text-sm">Checking upload eligibility...</span>
        </div>
      );
    }

    if (hasActiveViolations) {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <XCircle className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Upload Blocked</p>
            <p className="text-xs">Active policy violations must be resolved</p>
          </div>
        </div>
      );
    }

    if (!canUpload) {
      return (
        <div className="flex items-center space-x-2 text-orange-600">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Upload Limit Reached</p>
            <p className="text-xs">
              {usageStats?.subscriptionStatus === 'free' 
                ? 'Upgrade to Premium for unlimited refinements'
                : 'Monthly unique CV limit reached'}
            </p>
          </div>
        </div>
      );
    }

    if (isApproachingLimit) {
      return (
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Approaching Limit</p>
            <p className="text-xs">{remainingUploads} upload{remainingUploads !== 1 ? 's' : ''} remaining this month</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <div>
          <p className="text-sm font-medium">Ready to Upload</p>
          <p className="text-xs">
            {usageStats?.subscriptionStatus === 'premium' 
              ? 'Premium: Unlimited refinements'
              : `${remainingUploads} upload${remainingUploads !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
      </div>
    );
  };

  // Usage stats component
  const UsageStats = () => {
    if (!usageStats) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Monthly Usage</h4>
          {usageStats.subscriptionStatus === 'premium' && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <Crown className="h-4 w-4" />
              <span className="text-xs font-medium">Premium</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Uploads this month</span>
            <span className="font-medium">{usageStats.currentMonthUploads}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Unique CVs</span>
            <span className="font-medium">{usageStats.uniqueCVsThisMonth}</span>
          </div>
          
          {usageStats.subscriptionStatus === 'free' && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining</span>
                <span className="font-medium">{remainingUploads}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    usagePercentage >= 100 ? 'bg-red-500' : 
                    usagePercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, usagePercentage)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Indicator */}
      <StatusIndicator />

      {/* Usage Statistics */}
      <UsageStats />

      {/* Active Violations Warning */}
      {hasActiveViolations && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Active Policy Violations</h4>
              <div className="mt-2 space-y-1">
                {violations.slice(0, 2).map((violation, index) => (
                  <p key={index} className="text-xs text-red-700">
                    • {violation.message}
                  </p>
                ))}
                {violations.length > 2 && (
                  <p className="text-xs text-red-600">
                    +{violations.length - 2} more violations
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {hasWarnings && !hasActiveViolations && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800">Policy Warnings</h4>
              <p className="text-xs text-yellow-700 mt-1">
                Previous uploads had minor policy issues. Please ensure compliance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${canUpload && !hasActiveViolations ? 'hover:border-gray-400 cursor-pointer' : 'opacity-50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className={`mx-auto h-12 w-12 ${canUpload ? 'text-gray-400' : 'text-gray-300'}`} />
        <div className="mt-4">
          <label htmlFor="file-upload" className={canUpload ? 'cursor-pointer' : 'cursor-not-allowed'}>
            <span className="text-lg font-medium text-gray-900">
              {dragOver ? 'Drop your CV here' : 'Choose your CV file'}
            </span>
            <p className="text-sm text-gray-500 mt-1">
              PDF, DOC, DOCX, or TXT up to 10MB
            </p>
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileInput}
            disabled={!canUpload || hasActiveViolations}
          />
        </div>
      </div>

      {/* File Validation Results */}
      {fileValidation && (
        <div className="space-y-2">
          {fileValidation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-red-800">File Validation Errors</h4>
              <ul className="mt-1 space-y-1">
                {fileValidation.errors.map((error, index) => (
                  <li key={index} className="text-xs text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {fileValidation.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-yellow-800">File Warnings</h4>
              <ul className="mt-1 space-y-1">
                {fileValidation.warnings.map((warning, index) => (
                  <li key={index} className="text-xs text-yellow-700">• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};