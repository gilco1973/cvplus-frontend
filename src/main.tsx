import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupCriticalErrorHandling } from './utils/critical-error-handler'

// Setup critical error handling immediately
setupCriticalErrorHandling();

// Import debugging utilities in development
if (import.meta.env.DEV) {
  import('./utils/debugRecommendations');
  import('./utils/testRecommendationBlocking');
}

// Legacy component renderer no longer needed with React SPA
// import('./utils/componentRendererFix');

// Import contact form debugger in development
if (import.meta.env.DEV) {
  import('./utils/contactFormDebugger');
  import('./utils/testContactFormRendering');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
