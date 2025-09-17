/**
 * FileValidator Component
 * 
 * Comprehensive file validation utility with security scanning,
 * format verification, and intelligent error reporting.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Loader2,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  validator: (file: File) => Promise<ValidationResult> | ValidationResult;
}

export interface ValidationResult {
  passed: boolean;
  message: string;
  details?: string;
  suggestedFix?: string;
}

export interface FileValidationReport {
  file: File;
  isValid: boolean;
  overallSeverity: 'error' | 'warning' | 'info' | 'success';
  results: {
    rule: ValidationRule;
    result: ValidationResult;
  }[];
  suggestions: string[];
}

interface FileValidatorProps {
  files: File[];
  rules?: ValidationRule[];
  onValidationComplete?: (reports: FileValidationReport[]) => void;
  onValidationStart?: () => void;
  autoValidate?: boolean;
  showDetails?: boolean;
  className?: string;
}

// Default validation rules
const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'file-size',
    name: 'File Size Check',
    description: 'Validates file size limits',
    severity: 'error',
    validator: (file: File) => {
      const maxSize = 50 * 1024 * 1024; // 50MB
      const warningSize = 10 * 1024 * 1024; // 10MB
      
      if (file.size > maxSize) {
        return {
          passed: false,
          message: `File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          details: `Maximum allowed size is ${maxSize / (1024 * 1024)}MB`,
          suggestedFix: 'Try compressing the file or using a smaller version'
        };
      }
      
      if (file.size > warningSize) {
        return {
          passed: true,
          message: `Large file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          details: 'This file is quite large and may take longer to upload'
        };
      }
      
      return {
        passed: true,
        message: `File size OK: ${(file.size / 1024).toFixed(1)}KB`
      };
    }
  },
  {
    id: 'mime-type',
    name: 'MIME Type Validation',
    description: 'Validates file MIME type and extension match',
    severity: 'warning',
    validator: (file: File) => {
      const extension = file.name.toLowerCase().split('.').pop() || '';
      const mimeType = file.type;
      
      // Common MIME type mappings
      const expectedMimes: Record<string, string[]> = {
        'jpg': ['image/jpeg'],
        'jpeg': ['image/jpeg'],
        'png': ['image/png'],
        'gif': ['image/gif'],
        'webp': ['image/webp'],
        'pdf': ['application/pdf'],
        'doc': ['application/msword'],
        'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'mp4': ['video/mp4'],
        'webm': ['video/webm'],
        'mp3': ['audio/mp3', 'audio/mpeg'],
        'wav': ['audio/wav'],
        'zip': ['application/zip'],
        'txt': ['text/plain']
      };
      
      const expected = expectedMimes[extension];
      if (expected && !expected.includes(mimeType)) {
        return {
          passed: false,
          message: `MIME type mismatch: ${mimeType}`,
          details: `File extension .${extension} should have MIME type: ${expected.join(' or ')}`,
          suggestedFix: 'Verify the file is not corrupted or renamed with wrong extension'
        };
      }
      
      if (!mimeType) {
        return {
          passed: false,
          message: 'No MIME type detected',
          details: 'File may be corrupted or have an unknown format',
          suggestedFix: 'Try re-saving the file in a standard format'
        };
      }
      
      return {
        passed: true,
        message: `MIME type valid: ${mimeType}`
      };
    }
  },
  {
    id: 'filename-security',
    name: 'Filename Security Check',
    description: 'Checks for potentially dangerous filename patterns',
    severity: 'error',
    validator: (file: File) => {
      const filename = file.name;
      
      // Check for dangerous characters
      const dangerousChars = /[<>:"|?*\x00-\x1f]/;
      if (dangerousChars.test(filename)) {
        return {
          passed: false,
          message: 'Filename contains dangerous characters',
          details: 'Filename should not contain: < > : " | ? * or control characters',
          suggestedFix: 'Rename the file to remove special characters'
        };
      }
      
      // Check for suspicious extensions
      const suspiciousExts = /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|app)$/i;
      if (suspiciousExts.test(filename)) {
        return {
          passed: false,
          message: 'Potentially dangerous file type',
          details: 'Executable files are not allowed for security reasons',
          suggestedFix: 'Convert to a safe format like PDF or image'
        };
      }
      
      // Check for very long filenames
      if (filename.length > 255) {
        return {
          passed: false,
          message: 'Filename too long',
          details: 'Filename should be less than 255 characters',
          suggestedFix: 'Rename the file with a shorter name'
        };
      }
      
      return {
        passed: true,
        message: 'Filename security OK'
      };
    }
  },
  {
    id: 'image-dimensions',
    name: 'Image Dimensions Check',
    description: 'Validates image dimensions for images',
    severity: 'info',
    validator: async (file: File) => {
      if (!file.type.startsWith('image/')) {
        return { passed: true, message: 'Not an image file' };
      }
      
      return new Promise<ValidationResult>((resolve) => {
        const img = document.createElement('img') as HTMLImageElement;
        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          const megapixels = (width * height) / 1000000;
          
          if (width < 100 || height < 100) {
            resolve({
              passed: false,
              message: `Image too small: ${width}x${height}px`,
              details: 'Minimum recommended size is 100x100 pixels',
              suggestedFix: 'Use a higher resolution image'
            });
          } else if (megapixels > 50) {
            resolve({
              passed: true,
              message: `Very high resolution: ${width}x${height}px (${megapixels.toFixed(1)}MP)`,
              details: 'This image may take longer to process'
            });
          } else {
            resolve({
              passed: true,
              message: `Image dimensions: ${width}x${height}px (${megapixels.toFixed(1)}MP)`
            });
          }
          
          URL.revokeObjectURL(img.src);
        };
        
        img.onerror = () => {
          resolve({
            passed: false,
            message: 'Could not read image dimensions',
            details: 'Image file may be corrupted',
            suggestedFix: 'Try re-saving the image or using a different format'
          });
          URL.revokeObjectURL(img.src);
        };
        
        img.src = URL.createObjectURL(file);
      });
    }
  },
  {
    id: 'content-sniffing',
    name: 'Content Type Detection',
    description: 'Analyzes file content to detect actual type',
    severity: 'warning',
    validator: async (file: File) => {
      // Read first few bytes to detect file signatures
      const buffer = await file.slice(0, 20).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // Common file signatures
      const signatures = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47],
        'image/gif': [0x47, 0x49, 0x46, 0x38],
        'application/pdf': [0x25, 0x50, 0x44, 0x46],
        'application/zip': [0x50, 0x4B, 0x03, 0x04],
        'video/mp4': [0x00, 0x00, 0x00, undefined, 0x66, 0x74, 0x79, 0x70]
      };
      
      let detectedType = 'unknown';
      
      for (const [type, signature] of Object.entries(signatures)) {
        let matches = true;
        for (let i = 0; i < signature.length; i++) {
          if (signature[i] !== undefined && bytes[i] !== signature[i]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          detectedType = type;
          break;
        }
      }
      
      if (detectedType !== 'unknown' && detectedType !== file.type) {
        return {
          passed: false,
          message: `Content type mismatch: detected ${detectedType}, declared ${file.type}`,
          details: 'File content does not match the declared MIME type',
          suggestedFix: 'Verify the file is not corrupted or mislabeled'
        };
      }
      
      return {
        passed: true,
        message: detectedType !== 'unknown' 
          ? `Content type verified: ${detectedType}`
          : 'Content type could not be verified'
      };
    }
  }
];

const FileValidator: React.FC<FileValidatorProps> = ({
  files,
  rules = DEFAULT_VALIDATION_RULES,
  onValidationComplete,
  onValidationStart,
  autoValidate = true,
  showDetails = true,
  className
}) => {
  const [reports, setReports] = useState<FileValidationReport[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const validationRef = useRef<boolean>(false);

  // Run validation on files
  const validateFiles = useCallback(async () => {
    if (files.length === 0) {
      setReports([]);
      return;
    }
    
    if (validationRef.current) return; // Prevent duplicate validation
    validationRef.current = true;
    
    setIsValidating(true);
    onValidationStart?.();
    
    const newReports: FileValidationReport[] = [];
    
    for (const file of files) {
      const report: FileValidationReport = {
        file,
        isValid: true,
        overallSeverity: 'success',
        results: [],
        suggestions: []
      };
      
      for (const rule of rules) {
        try {
          const result = await rule.validator(file);
          report.results.push({ rule, result });
          
          if (!result.passed) {
            if (rule.severity === 'error') {
              report.isValid = false;
              report.overallSeverity = 'error';
            } else if (rule.severity === 'warning' && report.overallSeverity !== 'error') {
              report.overallSeverity = 'warning';
            }
          }
          
          if (result.suggestedFix) {
            report.suggestions.push(result.suggestedFix);
          }
        } catch (error) {
          report.results.push({
            rule,
            result: {
              passed: false,
              message: 'Validation error',
              details: error instanceof Error ? error.message : 'Unknown error',
              suggestedFix: 'Please try again or contact support'
            }
          });
          report.isValid = false;
          report.overallSeverity = 'error';
        }
      }
      
      newReports.push(report);
    }
    
    setReports(newReports);
    setIsValidating(false);
    onValidationComplete?.(newReports);
    
    // Reset validation lock after a delay
    setTimeout(() => {
      validationRef.current = false;
    }, 1000);
  }, [files, rules, onValidationComplete, onValidationStart]);

  // Auto-validate when files change
  React.useEffect(() => {
    if (autoValidate) {
      validateFiles();
    }
  }, [files, autoValidate, validateFiles]);

  // Get status icon for severity
  const getSeverityIcon = (severity: FileValidationReport['overallSeverity']) => {
    switch (severity) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  // Get file type icon
  const getFileTypeIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (file.type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (file.type.includes('zip') || file.type.includes('archive')) return <Archive className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-gray-900 border border-gray-700 rounded-lg", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-200">File Validation</h3>
            {isValidating && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          
          {!autoValidate && (
            <button
              onClick={validateFiles}
              disabled={isValidating}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isValidating ? 'Validating...' : 'Validate Files'}
            </button>
          )}
        </div>
        
        {/* Summary */}
        {reports.length > 0 && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-gray-400">Files: {reports.length}</span>
            <span className="text-green-400">Valid: {reports.filter(r => r.isValid).length}</span>
            <span className="text-red-400">Invalid: {reports.filter(r => !r.isValid).length}</span>
            <span className="text-yellow-400">Warnings: {reports.filter(r => r.overallSeverity === 'warning').length}</span>
          </div>
        )}
      </div>
      
      {/* File Reports */}
      <div className="divide-y divide-gray-700">
        {reports.map((report, index) => {
          const isExpanded = expandedReport === `${index}`;
          
          return (
            <div key={index} className="p-4">
              {/* File header */}
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setExpandedReport(isExpanded ? null : `${index}`)}
              >
                {getSeverityIcon(report.overallSeverity)}
                {getFileTypeIcon(report.file)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {report.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(report.file.size / 1024).toFixed(1)} KB • {report.file.type || 'Unknown type'}
                  </p>
                </div>
                
                <div className="text-sm text-gray-400">
                  {report.isValid ? 'Valid' : 'Invalid'}
                  {report.overallSeverity === 'warning' && ' (with warnings)'}
                </div>
                
                <div className={cn(
                  "transform transition-transform duration-200",
                  isExpanded ? "rotate-180" : ""
                )}>
                  ↓
                </div>
              </div>
              
              {/* Detailed results */}
              {showDetails && isExpanded && (
                <div className="mt-4 space-y-3">
                  {/* Validation results */}
                  <div className="space-y-2">
                    {report.results.map((resultItem, resultIndex) => {
                      const { rule, result } = resultItem;
                      const severityColor = {
                        error: 'text-red-400',
                        warning: 'text-yellow-400',
                        info: 'text-blue-400'
                      }[rule.severity];
                      
                      return (
                        <div key={resultIndex} className="flex gap-3 text-sm">
                          <div className="flex-shrink-0 mt-0.5">
                            {result.passed ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className={`w-4 h-4 ${severityColor}`} />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <p className="text-gray-200">{rule.name}</p>
                            <p className={cn(
                              "text-xs",
                              result.passed ? "text-gray-400" : severityColor
                            )}>
                              {result.message}
                            </p>
                            
                            {result.details && (
                              <p className="text-xs text-gray-500 mt-1">
                                {result.details}
                              </p>
                            )}
                            
                            {result.suggestedFix && (
                              <p className="text-xs text-blue-400 mt-1">
                                💡 {result.suggestedFix}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Suggestions */}
                  {report.suggestions.length > 0 && (
                    <div className="p-3 bg-blue-900/20 border border-blue-700 rounded">
                      <p className="text-sm font-medium text-blue-400 mb-2">Suggestions:</p>
                      <ul className="text-xs text-blue-300 space-y-1">
                        {report.suggestions.map((suggestion, i) => (
                          <li key={i}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Empty state */}
      {reports.length === 0 && !isValidating && (
        <div className="p-8 text-center text-gray-400">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No files to validate</p>
        </div>
      )}
    </div>
  );
};

export default FileValidator;