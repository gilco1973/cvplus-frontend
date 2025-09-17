import React, { useState, useEffect } from 'react';
import { Globe, Settings, BarChart3 } from 'lucide-react';
import { FeatureWrapper } from '../../Common/FeatureWrapper';
import { LoadingSpinner } from '../../Common/LoadingSpinner';
import { ErrorBoundary, FunctionalErrorBoundary } from '../../Common/ErrorBoundary';
import { SocialLinksProps } from './types';
import { SOCIAL_PLATFORMS } from './constants';
import { 
  useSocialMediaTracking, 
  useSocialMediaValidation, 
  useSocialMediaAnalytics 
} from './hooks';
import { SocialLinkRenderer } from './SocialLinkRenderer';
import { SettingsPanel } from './SettingsPanel';
import { AnalyticsDisplay } from './AnalyticsDisplay';
import { ValidationResults } from './ValidationResults';

export const SocialMediaLinks: React.FC<SocialLinksProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization = {},
  onUpdate,
  onError,
  className = '',
  mode = 'private'
}) => {
  const {
    style = 'buttons',
    size = 'medium'
  } = customization;

  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Custom hooks
  const { handleLinkClick } = useSocialMediaTracking();
  const { validationResults, isValidating, validateLinks, getLinkStatus } = useSocialMediaValidation();
  const { analytics, loadAnalytics } = useSocialMediaAnalytics();

  // Initialize analytics
  useEffect(() => {
    if (isEnabled && data && Object.keys(data).length > 0) {
      loadAnalytics(jobId, profileId);
    }
  }, [isEnabled, data, loadAnalytics, jobId, profileId]);

  if (!isEnabled) {
    return null;
  }

  const availableLinks = SOCIAL_PLATFORMS.filter(platform => 
    data[platform.key] && data[platform.key]?.trim()
  );

  if (availableLinks.length === 0) {
    return (
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Social Media Links"
        description="No social media links configured"
      >
        <div className="text-center py-8">
          <Globe className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Add your social media profiles to connect with visitors
          </p>
        </div>
      </FeatureWrapper>
    );
  }

  const handleValidateLinks = () => {
    validateLinks(data, jobId, profileId, (error) => {
      setError(error);
      onError?.(error);
    });
  };

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Social Media Links"
        description="Connect with me on social media"
        isLoading={isValidating}
        error={error}
        onRetry={handleValidateLinks}
      >
        <div className="space-y-6">
          {/* Links Display */}
          <div className={`
            ${style === 'cards' 
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4' 
              : 'flex flex-wrap gap-3 justify-center'
            }
          `}>
            {availableLinks.map(platform => 
              <SocialLinkRenderer
                key={platform.key}
                platform={platform}
                url={data[platform.key]!}
                customization={customization}
                analytics={analytics[platform.key]}
                linkStatus={getLinkStatus(platform.key, data[platform.key]!)}
                mode={mode}
                onLinkClick={() => handleLinkClick(
                  platform.name, 
                  data[platform.key]!, 
                  jobId, 
                  profileId, 
                  customization.openInNewTab ?? true
                )}
              />
            )}
          </div>

          {/* Private Mode Controls */}
          {mode === 'private' && (
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={handleValidateLinks}
                disabled={isValidating}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                {isValidating ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                Validate Links
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && mode === 'private' && (
            <SettingsPanel
              customization={customization}
              onUpdate={onUpdate}
            />
          )}

          {/* Analytics */}
          {Object.keys(analytics).length > 0 && mode === 'private' && (
            <AnalyticsDisplay analytics={analytics} />
          )}

          {/* Validation Results */}
          {Object.keys(validationResults).length > 0 && mode === 'private' && (
            <ValidationResults 
              validationResults={validationResults}
              getLinkStatus={getLinkStatus}
            />
          )}

          {/* Error Display */}
          <FunctionalErrorBoundary 
            error={error} 
            onRetry={handleValidateLinks}
            title="Social Media Links Error"
          />
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};
