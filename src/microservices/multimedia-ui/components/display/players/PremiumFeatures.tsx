import React from 'react';

interface PremiumFeaturesProps {
  isPremiumUser: boolean;
  onUpgradeClick: () => void;
}

/**
 * PremiumFeatures Component
 *
 * Displays premium feature upsell for free users.
 * Shows available premium benefits and upgrade call-to-action.
 */
export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({
  isPremiumUser,
  onUpgradeClick,
}) => {
  if (isPremiumUser) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-1">Unlock Premium Features</h4>
          <p className="text-sm text-blue-700">
            Get download access, keyboard shortcuts, and advanced playlist features
          </p>

          {/* Feature list */}
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              'Download Media',
              'Keyboard Shortcuts',
              'Advanced Queue',
              'Playlist Export',
              'Quality Controls',
            ].map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                ✨ {feature}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={onUpgradeClick}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default PremiumFeatures;