import React, { useState } from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { designSystem } from '../config/designSystem';
import { useExternalData, type ExternalDataSource as _ExternalDataSource } from '../hooks/useExternalData';
import { ExternalDataPreview } from './ExternalDataPreview';
import { SourceSelector } from './external/SourceSelector';
import { PrivacyNotice } from './external/PrivacyNotice';
import { DataSummary } from './external/DataSummary';
import { ExternalDataActions } from './external/ExternalDataActions';
import { ExternalDataSourcesGate } from './premium/PremiumGate';
import { SmartIncentiveManager } from './premium/SmartIncentiveManager';
import { FeatureEngagementTracker } from './premium/ProgressiveRevelationManager';
import { useProgressiveRevelation } from '../hooks/useProgressiveRevelation';

// Type for incentive objects
interface IncentiveData {
  id: string;
  type: string;
  message: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

interface ExternalDataSourcesProps {
  jobId: string;
  onDataEnriched?: (data: unknown[]) => void;
  onSkip?: () => void;
  className?: string;
}

// Internal component without premium gate
const ExternalDataSourcesCore: React.FC<ExternalDataSourcesProps> = ({
  jobId,
  onDataEnriched,
  onSkip,
  className = ''
}) => {

  const {
    sources,
    isLoading,
    isPrivacyAccepted,
    enrichedData,
    error,
    stats,
    updateSource,
    toggleSource,
    fetchExternalData,
    clearData,
    setIsPrivacyAccepted
  } = useExternalData(jobId);
  
  const { trackInteraction: trackProgressiveInteraction } = useProgressiveRevelation('externalDataSources');
  
  const [showPreview, setShowPreview] = useState(false);
  
  // Handle fetch data with progressive revelation tracking
  const handleFetchData = async () => {
    trackProgressiveInteraction('fetch_attempt');
    await fetchExternalData();
    if (enrichedData.length > 0) {
      setShowPreview(true);
      trackProgressiveInteraction('data_fetched');
    }
  };
  
  // Handle continue with enriched data
  const handleContinue = () => {
    trackProgressiveInteraction('continue_action');
    if (onDataEnriched && enrichedData.length > 0) {
      onDataEnriched(enrichedData);
      trackProgressiveInteraction('data_used');
    } else if (onSkip) {
      onSkip();
      trackProgressiveInteraction('skipped');
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-100 mb-2">
              Enrich Your CV with External Data
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Enhance your CV by automatically importing data from your professional profiles.
              We'll find additional projects, certifications, and achievements to make your CV more comprehensive.
            </p>
          </div>
        </div>
      </div>
      
      {/* Source Selection */}
      <SourceSelector
        sources={sources}
        isLoading={isLoading}
        onToggleSource={toggleSource}
        onUpdateSource={updateSource}
      />
      
      {/* Privacy Notice */}
      <PrivacyNotice
        isAccepted={isPrivacyAccepted}
        onAcceptanceChange={setIsPrivacyAccepted}
      />
      
      {/* Error Display */}
      {error && (
        <div className={`${designSystem.components.status.error} rounded-lg p-4`}>
          <p>{error}</p>
          <button onClick={clearData} className="mt-2 text-sm underline hover:no-underline">
            Clear and try again
          </button>
        </div>
      )}
      
      {/* Data Summary */}
      {stats.totalItems > 0 && (
        <DataSummary stats={stats} enrichedData={enrichedData} />
      )}
      
      {/* Preview Toggle */}
      {enrichedData.length > 0 && (
        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              setShowPreview(!showPreview);
              trackProgressiveInteraction(showPreview ? 'preview_hidden' : 'preview_shown');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 hover:text-white"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      )}
      
      {/* Data Preview */}
      {showPreview && enrichedData.length > 0 && (
        <ExternalDataPreview
          data={enrichedData}
          onSelectionChange={(selectedItems) => {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Preview selection changed:', selectedItems);
            }
          }}
          className="animate-fade-in-up"
        />
      )}
      
      {/* Action Buttons */}
      <ExternalDataActions
        isLoading={isLoading}
        enrichedData={enrichedData}
        stats={stats}
        isPrivacyAccepted={isPrivacyAccepted}
        onSkip={onSkip}
        onFetchData={handleFetchData}
        onContinue={handleContinue}
        onClearAndRefetch={() => {
          clearData();
          setShowPreview(false);
          trackProgressiveInteraction('data_cleared');
        }}
      />
    </div>
  );
};

// Main exported component with premium gate and smart incentives
export const ExternalDataSources: React.FC<ExternalDataSourcesProps> = (props) => {
  const { 
    trackInteraction,
    shouldShowUpgradePrompt,
    personalizedMessage: _personalizedMessage 
  } = useProgressiveRevelation('externalDataSources');
  
  const handleAnalyticsEvent = (event: string, data?: Record<string, unknown>) => {
    // Track premium upgrade interactions
    if (process.env.NODE_ENV === 'development') {
      console.warn('ExternalDataSources Analytics:', { event, data });
    }
    // TODO: Integrate with actual analytics service
  };
  
  const handleIncentiveShown = (incentive: IncentiveData) => {
    trackInteraction('incentive_view');
    if (process.env.NODE_ENV === 'development') {
      console.warn('Smart Incentive Shown:', incentive);
    }
  };
  
  const handleIncentiveClicked = (incentive: IncentiveData) => {
    trackInteraction('incentive_click');
    if (process.env.NODE_ENV === 'development') {
      console.warn('Smart Incentive Clicked:', incentive);
    }
  };
  
  const handleIncentiveDismissed = (incentive: IncentiveData) => {
    trackInteraction('incentive_dismiss');
    if (process.env.NODE_ENV === 'development') {
      console.warn('Smart Incentive Dismissed:', incentive);
    }
  };

  return (
    <FeatureEngagementTracker 
      featureName="externalDataSources"
      trackHover={true}
      trackClicks={true}
    >
      <div className="relative">
        <ExternalDataSourcesGate 
          showPreview={true}
          previewOpacity={0.3}
          className={props.className}
          onAnalyticsEvent={handleAnalyticsEvent}
          onAccessDenied={() => {
            toast.error('External data sources are available with Premium access');
            trackInteraction('access_denied');
          }}
        >
          <ExternalDataSourcesCore {...props} />
        </ExternalDataSourcesGate>
        
        {/* Smart Incentive Manager */}
        {shouldShowUpgradePrompt && (
          <div className="mt-6">
            <SmartIncentiveManager
              featureName="externalDataSources"
              onIncentiveShown={handleIncentiveShown}
              onIncentiveClicked={handleIncentiveClicked}
              onIncentiveDismissed={handleIncentiveDismissed}
              enableABTesting={true}
              variant="default"
            />
          </div>
        )}
      </div>
    </FeatureEngagementTracker>
  );
};
