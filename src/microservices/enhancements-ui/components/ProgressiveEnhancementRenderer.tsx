/**
 * Progressive Enhancement Renderer Component
 *
 * Advanced React component for rendering enhanced HTML content with embedded
 * React components for calendar integration and progressive enhancements.
 *
 * @author Gil Klainert
 * @version 3.0.0 - Migrated to Enhancements Module
 */

import React, { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AvailabilityCalendarWrapper } from './AvailabilityCalendarWrapper';

export interface ProgressiveEnhancementRendererProps {
  /** Enhanced HTML content with embedded React component placeholders */
  htmlContent: string;
  /** Job ID for context-specific enhancement features */
  jobId?: string;
  /** Additional CSS classes for styling */
  className?: string;
  /** Optional event callbacks for component lifecycle */
  onComponentMounted?: (componentType: string, elementId: string) => void;
  onComponentUnmounted?: (componentType: string, elementId: string) => void;
}

/**
 * Advanced progressive enhancement renderer that seamlessly integrates
 * static HTML content with dynamic React components for enhanced user experience.
 *
 * Features:
 * - Automatic React component replacement for enhancement placeholders
 * - Calendar integration with multiple provider support
 * - Dynamic component lifecycle management
 * - Memory leak prevention through proper cleanup
 * - Error boundary protection for individual components
 *
 * Usage:
 * ```tsx
 * <ProgressiveEnhancementRenderer
 *   htmlContent="<div data-feature='availability-calendar'>...</div>"
 *   jobId="job-123"
 *   className="enhanced-content"
 * />
 * ```
 */
export const ProgressiveEnhancementRenderer: React.FC<ProgressiveEnhancementRendererProps> = ({
  htmlContent,
  jobId,
  className = '',
  onComponentMounted,
  onComponentUnmounted
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootsRef = useRef<Map<Element, Root>>(new Map());

  useEffect(() => {
    if (!containerRef.current || !htmlContent) return;

    // Clean up any existing roots before setting new content
    rootsRef.current.forEach((root, element) => {
      const componentType = element.getAttribute('data-component-type') || 'unknown';
      const elementId = element.getAttribute('data-element-id') || 'unknown';

      try {
        root.unmount();
        onComponentUnmounted?.(componentType, elementId);
      } catch (error) {
        console.warn('⚠️ Error unmounting React component:', error);
      }
    });
    rootsRef.current.clear();

    // Set the HTML content first
    containerRef.current.innerHTML = htmlContent;

    // Find all enhancement placeholders and replace them with React components
    const placeholders = containerRef.current.querySelectorAll(
      '[data-feature="availability-calendar"], #availability-calendar-placeholder, [data-enhancement="calendar"], [data-enhancement="booking"]'
    );

    placeholders.forEach((placeholder, index) => {
      try {
        const professionalName = placeholder.getAttribute('data-professional-name') || 'Professional';
        const professionalEmail = placeholder.getAttribute('data-professional-email') || 'contact@example.com';
        const componentType = placeholder.getAttribute('data-feature') || placeholder.getAttribute('data-enhancement') || 'calendar';
        const elementId = placeholder.getAttribute('data-element-id') || `enhancement-${index}`;

        // Create a new container for the React component
        const reactContainer = document.createElement('div');
        reactContainer.setAttribute('data-component-type', componentType);
        reactContainer.setAttribute('data-element-id', elementId);
        placeholder.parentNode?.replaceChild(reactContainer, placeholder);

        // Create root and render the appropriate React component
        const root = createRoot(reactContainer);
        rootsRef.current.set(reactContainer, root);

        // Render component based on type
        switch (componentType) {
          case 'availability-calendar':
          case 'calendar':
          case 'booking':
            root.render(
              <AvailabilityCalendarWrapper
                professionalName={professionalName}
                professionalEmail={professionalEmail}
                jobId={jobId}
                className="my-8"
              />
            );
            break;

          default:
            console.warn(`⚠️ Unknown enhancement component type: ${componentType}`);
            root.render(
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Unknown enhancement component: {componentType}
                </p>
              </div>
            );
        }

        onComponentMounted?.(componentType, elementId);

      } catch (error) {
        console.error('❌ Error rendering enhancement component:', error);

        // Render error fallback
        const errorContainer = document.createElement('div');
        errorContainer.className = 'p-4 bg-red-50 border border-red-200 rounded-lg';
        errorContainer.innerHTML = `
          <p class="text-red-800 text-sm">
            ❌ Error loading enhancement component
          </p>
        `;
        placeholder.parentNode?.replaceChild(errorContainer, placeholder);
      }
    });

    // Cleanup function to unmount React components when content changes
    return () => {
      rootsRef.current.forEach((root, element) => {
        const componentType = element.getAttribute('data-component-type') || 'unknown';
        const elementId = element.getAttribute('data-element-id') || 'unknown';

        try {
          root.unmount();
          onComponentUnmounted?.(componentType, elementId);
        } catch (error) {
          console.warn('⚠️ Error during cleanup:', error);
        }
      });
      rootsRef.current.clear();
    };
  }, [htmlContent, jobId, onComponentMounted, onComponentUnmounted]);

  return (
    <div
      ref={containerRef}
      className={`progressive-enhancement-container ${className}`}
      data-testid="progressive-enhancement-renderer"
    />
  );
};

export default ProgressiveEnhancementRenderer;