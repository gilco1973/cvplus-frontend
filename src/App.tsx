import { createBrowserRouter, RouterProvider, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { HomePage } from './pages/HomePage';
import { AuthProvider } from './contexts/AuthContext';
import { ModuleProvider } from './providers/ModuleProvider';
import { SubscriptionMonitor } from './components/dev/SubscriptionMonitor';
import { SimpleModuleDemo } from './components/dev/SimpleModuleDemo';
import { GlobalLayout } from './components/layout/GlobalLayout';
import { WorkflowLayout as _WorkflowLayout } from './components/layout/WorkflowLayout';
import { I18nProvider } from '@cvplus/i18n/react';
import './i18n/config';

// Lazy load heavy components to reduce initial bundle size
const ProcessingPage = lazy(() => import('./pages/ProcessingPage').then(m => ({ default: m.ProcessingPage })));
const CVAnalysisPage = lazy(() => import('./pages/CVAnalysisPage').then(m => ({ default: m.CVAnalysisPage })));
const CVPreviewPageNew = lazy(() => import('./pages/CVPreviewPageNew').then(m => ({ default: m.CVPreviewPageNew })));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage').then(m => ({ default: m.TemplatesPage })));
const CVFeaturesPage = lazy(() => import('./pages/CVFeaturesPage').then(m => ({ default: m.CVFeaturesPage })));
const FeatureSelectionPage = lazy(() => import('./pages/FeatureSelectionPage').then(m => ({ default: m.FeatureSelectionPage })));
// Removed - RoleSelectionPage functionality integrated into CVAnalysisPage
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const KeywordOptimization = lazy(() => import('./pages/KeywordOptimization').then(m => ({ default: m.KeywordOptimization })));
const FinalResultsPage = lazy(() => import('./pages/FinalResultsPage').then(m => ({ default: m.FinalResultsPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage').then(m => ({ default: m.PaymentSuccessPage })));
const FAQPage = lazy(() => import('./components/pages/FAQ').then(m => ({ default: m.FAQPage })));
const FairUsePolicyPage = lazy(() => import('./pages/FairUsePolicyPage').then(m => ({ default: m.FairUsePolicyPage })));
const I18nTestPage = lazy(() => import('./components/I18nTestPage').then(m => ({ default: m.I18nTestPage })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
  </div>
);

// Redirect component for backward compatibility
const RoleSelectRedirect = () => {
  const { jobId } = useParams<{ jobId: string }>();
  return <Navigate to={`/analysis/${jobId}`} replace />;
};

// Redirect old /select-features routes to /customize for backward compatibility
const FeatureSelectRedirect = () => {
  const { jobId } = useParams<{ jobId: string }>();
  return <Navigate to={`/customize/${jobId}`} replace />;
};

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <GlobalLayout variant="full-width" showFooter={true}>
          <HomePage />
        </GlobalLayout>
      ),
    },
    {
      path: '/features',
      element: (
        <GlobalLayout variant="full-width" showFooter={true}>
          <Suspense fallback={<PageLoader />}>
            <CVFeaturesPage />
          </Suspense>
        </GlobalLayout>
      ),
    },
    {
      path: '/about',
      element: (
        <GlobalLayout variant="default" showFooter={true}>
          <Suspense fallback={<PageLoader />}>
            <AboutPage />
          </Suspense>
        </GlobalLayout>
      ),
    },
    {
      path: '/i18n-test',
      element: (
        <GlobalLayout variant="default" showFooter={false}>
          <Suspense fallback={<PageLoader />}>
            <I18nTestPage />
          </Suspense>
        </GlobalLayout>
      ),
    },
    // Redirect old /role-select routes to /analysis for backward compatibility
    {
      path: '/role-select/:jobId',
      element: <RoleSelectRedirect />,
    },
    {
      path: '/customize/:jobId',
      element: (
        <Suspense fallback={<PageLoader />}>
          <FeatureSelectionPage />
        </Suspense>
      ),
    },
    // Redirect old /select-features routes to /customize for backward compatibility
    {
      path: '/select-features/:jobId',
      element: <FeatureSelectRedirect />,
    },
    {
      path: '/process/:jobId',
      element: (
        <Suspense fallback={<PageLoader />}>
          <ProcessingPage />
        </Suspense>
      ),
    },
    {
      path: '/analysis/:jobId',
      element: (
        <Suspense fallback={<PageLoader />}>
          <CVAnalysisPage />
        </Suspense>
      ),
    },
    {
      path: '/preview/:jobId',
      element: (
        <Suspense fallback={<PageLoader />}>
          <CVPreviewPageNew />
        </Suspense>
      ),
    },
    {
      path: '/results/:jobId',
      element: (
        <Suspense fallback={<PageLoader />}>
          <FinalResultsPage />
        </Suspense>
      ),
    },
    {
      path: '/templates/:jobId',
      element: (
        <Suspense fallback={<PageLoader />}>
          <TemplatesPage />
        </Suspense>
      ),
    },
    {
      path: '/keywords/:id',
      element: (
        <Suspense fallback={<PageLoader />}>
          <KeywordOptimization />
        </Suspense>
      ),
    },
    {
      path: '/faq',
      element: (
        <GlobalLayout variant="default" showFooter={true}>
          <Suspense fallback={<PageLoader />}>
            <FAQPage />
          </Suspense>
        </GlobalLayout>
      ),
    },
    {
      path: '/pricing',
      element: (
        <GlobalLayout variant="default" showFooter={true}>
          <Suspense fallback={<PageLoader />}>
            <PricingPage />
          </Suspense>
        </GlobalLayout>
      ),
    },
    {
      path: '/fair-use-policy',
      element: (
        <GlobalLayout variant="default" showFooter={true}>
          <Suspense fallback={<PageLoader />}>
            <FairUsePolicyPage />
          </Suspense>
        </GlobalLayout>
      ),
    },
    {
      path: '/payment-success',
      element: (
        <GlobalLayout variant="default" showFooter={false}>
          <Suspense fallback={<PageLoader />}>
            <PaymentSuccessPage />
          </Suspense>
        </GlobalLayout>
      ),
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

function App() {
  return (
    <ModuleProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <SubscriptionMonitor />
        <SimpleModuleDemo />
        <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937', // neutral-800
            color: '#f3f4f6', // neutral-100
            border: '1px solid #374151', // neutral-700
          },
        }}
      />
      </AuthProvider>
    </ModuleProvider>
  );
}

export default App
