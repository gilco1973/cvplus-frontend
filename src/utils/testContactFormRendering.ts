/**
 * Test Contact Form Rendering
 * Standalone test to verify contact form component rendering works
 */
import { logger } from './logger';

export function testContactFormRendering(): void {
  const testLog = logger.test('ContactFormRendering');
  testLog.start('Starting contact form rendering test');
  
  // Create a test container
  const testContainer = document.createElement('div');
  testContainer.id = 'contact-form-test';
  testContainer.innerHTML = `
    <div class="react-component-placeholder" 
         data-component="ContactForm" 
         data-props='{"jobId":"test-123","profileId":"test-123","data":{"contactName":"Test User"},"isEnabled":true,"customization":{"title":"Get in Touch","buttonText":"Send Message"},"mode":"public"}'
         id="contact-form-test-123">
      <div class="component-loading">
        <div class="loading-spinner"></div>
        <p>Loading contact form...</p>
      </div>
    </div>
  `;
  
  // Append to body
  document.body.appendChild(testContainer);
  console.warn('📦 [TEST] Test container added to DOM');
  
  // Test 1: Check if component renderer is available
  const rendererAvailable = typeof (window as any).initializeReactComponents === 'function';
  console.warn('🔧 [TEST] Component renderer available:', rendererAvailable);
  
  if (rendererAvailable) {
    // Test 2: Try to render the component
    setTimeout(() => {
      console.warn('🚀 [TEST] Calling initializeReactComponents...');
      (window as any).initializeReactComponents();
      
      // Test 3: Check if component was rendered
      setTimeout(() => {
        const loadingDiv = testContainer.querySelector('.component-loading');
        const hasLoadingDiv = !!loadingDiv;
        console.warn('⏳ [TEST] Loading div still present:', hasLoadingDiv);
        
        if (hasLoadingDiv) {
          console.warn('❌ [TEST] Component rendering FAILED - loading div still present');
          
          // Debug the placeholder
          const placeholder = testContainer.querySelector('.react-component-placeholder');
          if (placeholder) {
            console.warn('📋 [TEST] Placeholder details:', {
              componentName: placeholder.getAttribute('data-component'),
              propsLength: placeholder.getAttribute('data-props')?.length,
              innerHTML: placeholder.innerHTML.substring(0, 200)
            });
          }
        } else {
          console.warn('✅ [TEST] Component rendering SUCCESS - loading div removed');
        }
        
        // Clean up test
        setTimeout(() => {
          document.body.removeChild(testContainer);
          console.warn('🧹 [TEST] Test container cleaned up');
        }, 2000);
        
      }, 1000);
    }, 500);
  } else {
    console.warn('❌ [TEST] Component renderer not available - cannot test rendering');
    document.body.removeChild(testContainer);
  }
}

// Test contact form component import
export async function testContactFormImport(): Promise<void> {
  console.warn('📦 [TEST] Testing ContactForm import...');
  
  try {
    const { ContactForm } = await import('../components/features/ContactForm');
    console.warn('✅ [TEST] ContactForm import SUCCESS:', !!ContactForm);
    
    // Test if we can create a React element
    const React = await import('react');
    if (React.default) {
      const element = React.default.createElement(ContactForm, {
        jobId: 'test',
        profileId: 'test',
        data: { contactName: 'Test' },
        isEnabled: true,
        mode: 'public'
      });
      console.warn('✅ [TEST] ContactForm React element creation SUCCESS:', !!element);
    }
  } catch (error) {
    console.warn('❌ [TEST] ContactForm import FAILED:', error);
  }
}

// Make test functions available globally in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).testContactFormRendering = testContactFormRendering;
  (window as any).testContactFormImport = testContactFormImport;
  
  // Auto-run tests disabled to reduce console noise
  // Uncomment the lines below to enable auto-testing
  /*
  setTimeout(() => {
    console.warn('🧪 [AUTO-TEST] Running contact form tests...');
    testContactFormImport();
    testContactFormRendering();
  }, 2000);
  */
}