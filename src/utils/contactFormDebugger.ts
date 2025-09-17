/**
 * Contact Form Debug Utility
 * Specifically debug why ContactForm React components aren't rendering
 */

export interface DebugInfo {
  timestamp: string;
  placeholdersFound: number;
  placeholders: Array<{
    element: Element;
    componentName: string | null;
    props: string | null;
    parsedProps: any;
    hasCorrectClass: boolean;
  }>;
  rendererAvailable: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Debug contact form component rendering
 */
export function debugContactFormRendering(container?: Element): DebugInfo {
  const debugInfo: DebugInfo = {
    timestamp: new Date().toISOString(),
    placeholdersFound: 0,
    placeholders: [],
    rendererAvailable: false,
    errors: [],
    warnings: []
  };

  try {
    // Check if renderer is available
    debugInfo.rendererAvailable = typeof (window as any).initializeReactComponents === 'function';
    
    if (!debugInfo.rendererAvailable) {
      debugInfo.errors.push('initializeReactComponents not available on window');
    }

    // Find placeholders - scope to container if provided
    const searchScope = container || document;
    const placeholders = searchScope.querySelectorAll('.react-component-placeholder');
    debugInfo.placeholdersFound = placeholders.length;

    console.warn(`🔍 [DEBUG] Found ${placeholders.length} placeholders in ${container ? 'container' : 'document'}`);

    placeholders.forEach((placeholder, index) => {
      const componentName = placeholder.getAttribute('data-component');
      const propsAttr = placeholder.getAttribute('data-props');
      let parsedProps = null;

      // Try to parse props
      if (propsAttr) {
        try {
          parsedProps = JSON.parse(propsAttr);
        } catch (error) {
          debugInfo.errors.push(`Failed to parse props for placeholder ${index + 1}: ${error}`);
        }
      }

      const placeholderInfo = {
        element: placeholder,
        componentName,
        props: propsAttr,
        parsedProps,
        hasCorrectClass: placeholder.classList.contains('react-component-placeholder')
      };

      debugInfo.placeholders.push(placeholderInfo);

      console.warn(`📦 [DEBUG] Placeholder ${index + 1}:`, {
        componentName,
        hasProps: !!propsAttr,
        propsLength: propsAttr?.length || 0,
        hasCorrectClass: placeholderInfo.hasCorrectClass,
        innerHTML: placeholder.innerHTML.substring(0, 200) + (placeholder.innerHTML.length > 200 ? '...' : '')
      });

      // Special check for ContactForm
      if (componentName === 'ContactForm') {
        console.warn(`🎯 [DEBUG] ContactForm placeholder found:`, {
          parsedProps,
          elementId: placeholder.id,
          classes: Array.from(placeholder.classList)
        });
      }
    });

    // Check if loading spinner is still present
    const loadingSpinners = searchScope.querySelectorAll('.component-loading');
    if (loadingSpinners.length > 0) {
      debugInfo.warnings.push(`${loadingSpinners.length} loading spinners still present`);
      console.warn(`⏳ [DEBUG] Found ${loadingSpinners.length} loading spinners`);
    }

  } catch (error) {
    debugInfo.errors.push(`Debug function failed: ${error}`);
    console.error('🚨 [DEBUG] Debug function failed:', error);
  }

  return debugInfo;
}

/**
 * Force initialize React components with enhanced debugging
 */
export function forceInitializeWithDebug(container?: Element): void {
  console.warn('🚀 [DEBUG] Force initializing React components...');
  
  const debugInfo = debugContactFormRendering(container);
  
  if (debugInfo.rendererAvailable) {
    try {
      if (container) {
        // If container is provided, initialize components within that container
        const placeholders = container.querySelectorAll('.react-component-placeholder');
        console.warn(`🎯 [DEBUG] Manually rendering ${placeholders.length} components in container`);
        
        placeholders.forEach((placeholder) => {
          const componentName = placeholder.getAttribute('data-component');
          const propsJson = placeholder.getAttribute('data-props');
          
          if (componentName && (window as any).renderReactComponent) {
            let props = {};
            if (propsJson) {
              try {
                props = JSON.parse(propsJson);
              } catch (error) {
                console.error(`🚨 [DEBUG] Failed to parse props for ${componentName}:`, error);
                return;
              }
            }
            
            console.warn(`🔄 [DEBUG] Rendering ${componentName} with props:`, props);
            (window as any).renderReactComponent(componentName, props, placeholder);
          }
        });
      } else {
        // Use global initialization
        (window as any).initializeReactComponents();
      }
    } catch (error) {
      console.error('🚨 [DEBUG] Failed to force initialize:', error);
    }
  } else {
    console.error('🚨 [DEBUG] Component renderer not available - check if componentRenderer.ts is loaded');
  }
}

/**
 * Enhanced component initialization with debugging
 */
export function initializeWithDebug(container?: Element, retryCount = 0): void {
  const maxRetries = 3;
  
  console.warn(`🔄 [DEBUG] Initialize attempt ${retryCount + 1}/${maxRetries + 1}`);
  
  if (retryCount === 0) {
    // First attempt - immediate
    forceInitializeWithDebug(container);
  } else if (retryCount <= maxRetries) {
    // Retry with increasing delays
    const delay = retryCount * 500; // 500ms, 1000ms, 1500ms
    setTimeout(() => {
      console.warn(`🔄 [DEBUG] Retry ${retryCount} after ${delay}ms delay`);
      forceInitializeWithDebug(container);
      
      // Check if components were rendered
      setTimeout(() => {
        const remainingPlaceholders = (container || document).querySelectorAll('.react-component-placeholder .component-loading');
        if (remainingPlaceholders.length > 0 && retryCount < maxRetries) {
          console.warn(`⚠️ [DEBUG] Still ${remainingPlaceholders.length} loading placeholders, retrying...`);
          initializeWithDebug(container, retryCount + 1);
        }
      }, 100);
      
    }, delay);
  } else {
    console.error('🚨 [DEBUG] Max retries exceeded, component initialization failed');
    
    // Show error in remaining placeholders
    const remainingPlaceholders = (container || document).querySelectorAll('.react-component-placeholder .component-loading');
    remainingPlaceholders.forEach((loading) => {
      loading.innerHTML = `
        <div style="color: #dc2626; text-align: center;">
          <p>⚠️ Component failed to load</p>
          <p style="font-size: 0.8em;">Contact form temporarily unavailable</p>
        </div>
      `;
    });
  }
}

// Make debug functions available globally
if (typeof window !== 'undefined') {
  (window as any).debugContactFormRendering = debugContactFormRendering;
  (window as any).forceInitializeWithDebug = forceInitializeWithDebug;
  (window as any).initializeWithDebug = initializeWithDebug;
}