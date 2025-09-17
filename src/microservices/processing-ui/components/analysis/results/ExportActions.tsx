/**
 * Export Actions Component
 * Handles CV export functionality and sharing options
 */

import React, { useState } from 'react';
import { Download, Share2, Printer, FileText, Link, Mail, MessageCircle } from 'lucide-react';
import type { CVAnalysisResults } from '../../../../types/cv.types';
import type { Job } from '../../../types/job';

interface ExportActionsProps {
  job: Job;
  analysisResults: CVAnalysisResults;
  onExport?: (format: 'pdf' | 'json') => void;
  onShare?: () => void;
  className?: string;
}

type ExportFormat = 'pdf' | 'json' | 'html' | 'docx';
type ShareMethod = 'link' | 'email' | 'linkedin' | 'twitter';

export const ExportActions: React.FC<ExportActionsProps> = ({
  job,
  analysisResults,
  onExport,
  onShare,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');

  const exportOptions: Array<{
    format: ExportFormat;
    label: string;
    description: string;
    icon: React.ReactNode;
    premium?: boolean;
  }> = [
    {
      format: 'pdf',
      label: 'PDF Report',
      description: 'Professional analysis report',
      icon: <FileText className="h-4 w-4" />
    },
    {
      format: 'json',
      label: 'JSON Data',
      description: 'Raw analysis data',
      icon: <Download className="h-4 w-4" />
    },
    {
      format: 'html',
      label: 'Web Report',
      description: 'Interactive HTML report',
      icon: <Link className="h-4 w-4" />,
      premium: true
    },
    {
      format: 'docx',
      label: 'Word Document',
      description: 'Editable report document',
      icon: <FileText className="h-4 w-4" />,
      premium: true
    }
  ];

  const shareOptions: Array<{
    method: ShareMethod;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      method: 'link',
      label: 'Copy Link',
      description: 'Share analysis results',
      icon: <Link className="h-4 w-4" />,
      color: 'blue'
    },
    {
      method: 'email',
      label: 'Email',
      description: 'Send via email',
      icon: <Mail className="h-4 w-4" />,
      color: 'green'
    },
    {
      method: 'linkedin',
      label: 'LinkedIn',
      description: 'Share on LinkedIn',
      icon: <MessageCircle className="h-4 w-4" />,
      color: 'blue'
    },
    {
      method: 'twitter',
      label: 'Twitter',
      description: 'Share on Twitter',
      icon: <MessageCircle className="h-4 w-4" />,
      color: 'blue'
    }
  ];

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      // For PDF and JSON, use the provided callback
      if ((format === 'pdf' || format === 'json') && onExport) {
        await onExport(format);
      } else {
        // For other formats, implement specific logic
        await handleAdvancedExport(format);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAdvancedExport = async (format: ExportFormat) => {
    // Mock implementation for advanced export formats
    switch (format) {
      case 'html':
        // Generate HTML report
        const htmlContent = generateHtmlReport();
        downloadFile(htmlContent, `cv-analysis-${job.id}.html`, 'text/html');
        break;
      case 'docx':
        // Generate Word document (would need docx library)
        console.log('DOCX export not yet implemented');
        break;
    }
  };

  const generateHtmlReport = (): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>CV Analysis Report - ${job.fileName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .score { font-size: 2em; font-weight: bold; color: #007bff; }
        .section { margin-bottom: 30px; padding: 20px; border-left: 4px solid #007bff; }
        .recommendation { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CV Analysis Report</h1>
        <p>File: ${job.fileName}</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>Overall Score</h2>
        <div class="score">${analysisResults.overallScore}/100</div>
        <p>ATS Compatibility: ${analysisResults.atsCompatibility.score}/100</p>
    </div>

    <div class="section">
        <h2>Key Recommendations</h2>
        ${analysisResults.suggestions.map(suggestion =>
          `<div class="recommendation">
            <h3>${suggestion.title}</h3>
            <p>${suggestion.description}</p>
            <small>Priority: ${suggestion.priority}/10 | Section: ${suggestion.section}</small>
          </div>`
        ).join('')}
    </div>

    <div class="section">
        <h2>Keywords Found</h2>
        <p>${analysisResults.keywords.join(', ')}</p>
    </div>
</body>
</html>
    `;
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async (method: ShareMethod) => {
    switch (method) {
      case 'link':
        // Copy share link to clipboard
        const shareUrl = `${window.location.origin}/analysis/${job.id}`;
        await navigator.clipboard.writeText(shareUrl);
        // Show success message
        break;
      case 'email':
        // Open email client
        const subject = `CV Analysis Results - ${job.fileName}`;
        const body = `Check out my CV analysis results: ${analysisResults.overallScore}/100 score!`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;
      case 'linkedin':
        // Share on LinkedIn
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
        window.open(linkedinUrl, '_blank');
        break;
      case 'twitter':
        // Share on Twitter
        const tweetText = `Just analyzed my CV with CVPlus - got a ${analysisResults.overallScore}/100 score! 🚀`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank');
        break;
    }
    setShowShareOptions(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`export-actions bg-white border-t border-gray-200 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Export & Share</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Export Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Download className="h-4 w-4 text-blue-600" />
              <span>Export Analysis</span>
            </h4>

            <div className="space-y-2">
              {exportOptions.map(({ format, label, description, icon, premium }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  disabled={isExporting || (premium && !job.userId)} // Mock premium check
                  className={`w-full flex items-center justify-between p-3 border rounded-lg text-left transition-colors ${
                    premium && !job.userId
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {icon}
                    <div>
                      <div className="font-medium flex items-center space-x-2">
                        <span>{label}</span>
                        {premium && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{description}</div>
                    </div>
                  </div>
                  {isExporting && exportFormat === format && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Print Option */}
            <button
              onClick={handlePrint}
              className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <div>
                <div className="font-medium">Print Report</div>
                <div className="text-sm text-gray-500">Print-friendly analysis report</div>
              </div>
            </button>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Share2 className="h-4 w-4 text-green-600" />
              <span>Share Results</span>
            </h4>

            <div className="space-y-2">
              {shareOptions.map(({ method, label, description, icon, color }) => (
                <button
                  key={method}
                  onClick={() => handleShare(method)}
                  className={`w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg text-left hover:border-${color}-300 hover:bg-${color}-50 transition-colors`}
                >
                  {icon}
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-gray-500">{description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Share Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={onShare}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Quick Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Export Summary */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Export Summary</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <div className="font-medium text-gray-900">Overall Score</div>
              <div>{analysisResults.overallScore}/100</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">ATS Score</div>
              <div>{analysisResults.atsCompatibility.score}/100</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Recommendations</div>
              <div>{analysisResults.suggestions.length} items</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Keywords</div>
              <div>{analysisResults.keywords.length} found</div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 text-xs text-gray-500">
          <p>
            <strong>Privacy Notice:</strong> Exported reports contain analysis data only.
            Original CV content is not included unless explicitly selected.
            Shared links expire after 30 days.
          </p>
        </div>
      </div>
    </div>
  );
};