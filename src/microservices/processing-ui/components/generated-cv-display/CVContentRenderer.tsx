/**
 * CV Content Renderer Component
 *
 * Renders the final CV content with proper styling, interactive elements,
 * and print optimization.
 */

import React, { useRef, useEffect } from 'react';
import { FileText, AlertTriangle, Sparkles } from 'lucide-react';

import type { Job } from '../../types/job';
import type { AnalysisResult } from '../../types/analysis';

interface CVContentRendererProps {
  job: Job;
  content: any;
  analysis?: AnalysisResult;
  className?: string;
}

/**
 * CV Content Renderer Component
 */
export const CVContentRenderer: React.FC<CVContentRendererProps> = ({
  job,
  content,
  analysis,
  className = ''
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize interactive components after render
  useEffect(() => {
    if (content?.html && contentRef.current) {
      // Initialize any interactive components
      const timer = setTimeout(() => {
        initializeInteractiveElements(contentRef.current);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [content?.html]);

  // Initialize interactive elements in the CV
  const initializeInteractiveElements = (container: HTMLElement | null) => {
    if (!container) return;

    try {
      // Initialize tooltips
      const tooltipElements = container.querySelectorAll('[data-tooltip]');
      tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', handleTooltipShow);
        element.addEventListener('mouseleave', handleTooltipHide);
      });

      // Initialize expandable sections
      const expandableElements = container.querySelectorAll('[data-expandable]');
      expandableElements.forEach(element => {
        element.addEventListener('click', handleSectionToggle);
      });

      // Initialize copy-to-clipboard buttons
      const copyElements = container.querySelectorAll('[data-copy]');
      copyElements.forEach(element => {
        element.addEventListener('click', handleCopyToClipboard);
      });

      // Initialize smooth scrolling for internal links
      const internalLinks = container.querySelectorAll('a[href^="#"]');
      internalLinks.forEach(link => {
        link.addEventListener('click', handleInternalNavigation);
      });

      console.log('🎨 [CV-RENDERER] Interactive elements initialized');
    } catch (error) {
      console.error('Failed to initialize interactive elements:', error);
    }
  };

  // Event handlers for interactive elements
  const handleTooltipShow = (event: Event) => {
    const element = event.currentTarget as HTMLElement;
    const tooltipText = element.getAttribute('data-tooltip');
    if (!tooltipText) return;

    // Create and show tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'cv-tooltip';
    tooltip.textContent = tooltipText;
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1000;
      pointer-events: none;
    `;

    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;

    element.setAttribute('data-tooltip-element', tooltip.id);
  };

  const handleTooltipHide = (event: Event) => {
    const tooltips = document.querySelectorAll('.cv-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
  };

  const handleSectionToggle = (event: Event) => {
    const element = event.currentTarget as HTMLElement;
    const targetId = element.getAttribute('data-expandable');
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    const isExpanded = target.style.display !== 'none';
    target.style.display = isExpanded ? 'none' : 'block';
    element.setAttribute('aria-expanded', (!isExpanded).toString());
  };

  const handleCopyToClipboard = async (event: Event) => {
    const element = event.currentTarget as HTMLElement;
    const textToCopy = element.getAttribute('data-copy') || element.textContent || '';

    try {
      await navigator.clipboard.writeText(textToCopy);

      // Show feedback
      const originalText = element.textContent;
      element.textContent = 'Copied!';
      element.style.color = 'green';

      setTimeout(() => {
        element.textContent = originalText;
        element.style.color = '';
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleInternalNavigation = (event: Event) => {
    event.preventDefault();
    const link = event.currentTarget as HTMLAnchorElement;
    const targetId = link.getAttribute('href')?.substring(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Get HTML content from various sources
  const getHTMLContent = () => {
    // Priority order: direct HTML, generated content, fallback
    if (content?.html) return content.html;
    if (job.generatedCV?.html) return job.generatedCV.html;
    if (job.generatedCV?.content?.html) return job.generatedCV.content.html;
    return null;
  };

  const htmlContent = getHTMLContent();

  // Handle missing content
  if (!htmlContent) {
    return (
      <div className={`cv-content-renderer ${className}`}>
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-xl">
          <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No CV Content Available
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            The CV content is still being generated or there was an issue during processing.
            Please wait a moment and refresh, or try regenerating the CV.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Job Status: <span className="font-medium">{job.status}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`cv-content-renderer ${className}`}>
      {/* Analysis banner (if available) */}
      {analysis && (
        <div className="mb-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h4 className="text-sm font-semibold text-cyan-300">
                AI Analysis Score: {analysis.score}/100
              </h4>
              <p className="text-xs text-gray-400">
                Grade: {analysis.grade} • {analysis.insights?.length || 0} insights available
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main CV content */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden print:shadow-none print:bg-white">
        <div
          ref={contentRef}
          className="cv-content-display p-8 print:p-0"
          style={{
            minHeight: '800px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            lineHeight: '1.6',
            color: '#333',
            // Print-specific styles
            '@media print': {
              fontSize: '11pt',
              lineHeight: '1.4',
              color: '#000',
              padding: '0',
              margin: '0',
              boxShadow: 'none',
              background: 'white',
            } as any
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* Print styles */}
      <style jsx>{`
        @media print {
          .cv-content-renderer {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .cv-content-display {
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
            color: #000 !important;
          }

          .cv-tooltip {
            display: none !important;
          }

          [data-print-hidden] {
            display: none !important;
          }

          a {
            color: #000 !important;
            text-decoration: none !important;
          }

          .text-cyan-400, .text-blue-400, .text-green-400 {
            color: #000 !important;
          }

          .bg-cyan-500, .bg-blue-500, .bg-green-500 {
            background: transparent !important;
            border: 1px solid #000 !important;
          }
        }
      `}</style>
    </div>
  );
};