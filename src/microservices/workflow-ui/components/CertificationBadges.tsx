import React, { useState } from 'react';
import { CertificationBadge, BadgeType } from '../../types/Certification';
import { useCertificationBadges } from '../hooks/useCertificationBadges';

interface CertificationBadgesProps {
  userId: string;
  displayMode?: 'grid' | 'list' | 'compact';
  showProgress?: boolean;
  maxBadges?: number;
}

/**
 * Certification Badges Component
 * 
 * Displays user certification badges with various display modes,
 * progress tracking, and badge verification capabilities.
 */
export const CertificationBadges: React.FC<CertificationBadgesProps> = ({
  userId,
  displayMode = 'grid',
  showProgress = true,
  maxBadges
}) => {
  const [selectedBadge, setSelectedBadge] = useState<CertificationBadge | null>(null);
  
  const { 
    badges, 
    badgeProgress, 
    availableBadgeTypes,
    isLoading, 
    error,
    verifyBadge 
  } = useCertificationBadges(userId);

  const displayBadges = maxBadges ? badges.slice(0, maxBadges) : badges;

  const getBadgeIcon = (badgeType: BadgeType) => {
    // TODO: Implement badge icons mapping
    return '🏆'; // Placeholder
  };

  const getBadgeColor = (badgeType: BadgeType) => {
    const colors = {
      'cv-completion': 'bg-blue-500',
      'feature-master': 'bg-green-500',
      'template-expert': 'bg-purple-500',
      'premium-user': 'bg-yellow-500',
      'social-sharer': 'bg-pink-500'
    };
    return colors[badgeType as keyof typeof colors] || 'bg-gray-500';
  };

  const handleBadgeClick = (badge: CertificationBadge) => {
    setSelectedBadge(badge);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading badges...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-600 font-medium">Failed to load badges</div>
        <div className="text-red-700 text-sm mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Certification Badges
        </h3>
        <p className="text-sm text-gray-500">
          {badges.length} badge{badges.length !== 1 ? 's' : ''} earned
        </p>
      </div>

      {/* Badges Display */}
      <div className="p-6">
        {displayMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayBadges.map((badge) => (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${getBadgeColor(badge.badgeType)}`}>
                  {getBadgeIcon(badge.badgeType)}
                </div>
                <h4 className="text-sm font-medium text-gray-900 mt-2 text-center">
                  {badge.name}
                </h4>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {new Date(badge.issuedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {displayMode === 'list' && (
          <div className="space-y-3">
            {displayBadges.map((badge) => (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getBadgeColor(badge.badgeType)}`}>
                  {getBadgeIcon(badge.badgeType)}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {badge.name}
                  </h4>
                  {badge.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {badge.description}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(badge.issuedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {displayMode === 'compact' && (
          <div className="flex flex-wrap gap-2">
            {displayBadges.map((badge) => (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm cursor-pointer hover:scale-110 transition-transform ${getBadgeColor(badge.badgeType)}`}
                title={badge.name}
              >
                {getBadgeIcon(badge.badgeType)}
              </div>
            ))}
          </div>
        )}

        {displayBadges.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No badges earned yet</div>
            <div className="text-sm text-gray-500">
              Complete CV features to earn your first badge!
            </div>
          </div>
        )}
      </div>

      {/* Progress Section */}
      {showProgress && badgeProgress.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Badge Progress
          </h4>
          <div className="space-y-3">
            {badgeProgress.slice(0, 3).map((progress) => (
              <div key={progress.badgeType}>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>{progress.badgeType.replace('-', ' ').toUpperCase()}</span>
                  <span>{progress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getBadgeColor(progress.badgeType)}`}
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Badge Details
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="text-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-3 ${getBadgeColor(selectedBadge.badgeType)}`}>
                  {getBadgeIcon(selectedBadge.badgeType)}
                </div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {selectedBadge.name}
                </h4>
                {selectedBadge.description && (
                  <p className="text-gray-600 mt-2">
                    {selectedBadge.description}
                  </p>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Badge Type:</span>
                  <span className="text-gray-900">{selectedBadge.badgeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issued:</span>
                  <span className="text-gray-900">
                    {new Date(selectedBadge.issuedAt).toLocaleDateString()}
                  </span>
                </div>
                {selectedBadge.verificationCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verification:</span>
                    <span className="text-gray-900 font-mono text-xs">
                      {selectedBadge.verificationCode.slice(0, 8)}...
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedBadge.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedBadge.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {selectedBadge.verificationCode && (
                <button
                  onClick={() => verifyBadge(selectedBadge.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Verify Badge
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};