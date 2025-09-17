import React from 'react';
import { CVFeatureProps } from '../../../types/cv-features';
import { getFeatureComponent } from '../../../utils/featureRegistry';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSpinner } from './LoadingSpinner';

interface FeatureRendererProps extends CVFeatureProps {
  featureName: string;
  fallbackToHTML?: boolean;
  htmlContent?: string;
}

export const FeatureRenderer: React.FC<FeatureRendererProps> = ({
  featureName,
  fallbackToHTML = true,
  htmlContent,
  ...props
}) => {
  // Get the React component for this feature
  const FeatureComponent = getFeatureComponent(featureName);

  // If React component is available, render it
  if (FeatureComponent) {
    return (
      <ErrorBoundary
        onError={(error) => {
          console.error(`Feature ${featureName} error:`, error);
          if (props.onError) {
            props.onError(error);
          }
        }}
      >
        <FeatureComponent {...props} />
      </ErrorBoundary>
    );
  }

  // If no React component but HTML content is available and fallback is enabled
  if (fallbackToHTML && htmlContent) {
    return (
      <div 
        className="cv-feature-html-fallback"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  // Feature not implemented yet - show placeholder
  return (
    <div className="cv-feature-placeholder bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Feature Coming Soon
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        The <strong>{featureName}</strong> feature is being converted to React components.
      </p>
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        In Development
      </div>
    </div>
  );
};

// Batch feature renderer for multiple features
interface BatchFeatureRendererProps {
  features: Array<{
    name: string;
    props: CVFeatureProps;
    htmlContent?: string;
  }>;
  className?: string;
  fallbackToHTML?: boolean;
}

export const BatchFeatureRenderer: React.FC<BatchFeatureRendererProps> = ({
  features,
  className = '',
  fallbackToHTML = true
}) => {
  return (
    <div className={`cv-features-container space-y-6 ${className}`}>
      {features.map((feature, index) => (
        <FeatureRenderer
          key={`${feature.name}-${index}`}
          featureName={feature.name}
          fallbackToHTML={fallbackToHTML}
          htmlContent={feature.htmlContent}
          {...feature.props}
        />
      ))}
    </div>
  );
};

// Feature grid renderer for organized display
interface FeatureGridRendererProps {
  features: Array<{
    name: string;
    props: CVFeatureProps;
    htmlContent?: string;
    category?: string;
  }>;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  fallbackToHTML?: boolean;
}

export const FeatureGridRenderer: React.FC<FeatureGridRendererProps> = ({
  features,
  columns = 2,
  className = '',
  fallbackToHTML = true
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>
      {features.map((feature, index) => (
        <FeatureRenderer
          key={`${feature.name}-${index}`}
          featureName={feature.name}
          fallbackToHTML={fallbackToHTML}
          htmlContent={feature.htmlContent}
          {...feature.props}
        />
      ))}
    </div>
  );
};