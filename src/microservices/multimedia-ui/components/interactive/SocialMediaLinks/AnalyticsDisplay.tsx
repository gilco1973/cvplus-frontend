import React from 'react';
import { BarChart3 } from 'lucide-react';
import { SocialLinkAnalytics } from './types';
import { SOCIAL_PLATFORMS } from './constants';

interface AnalyticsDisplayProps {
  analytics: Record<string, SocialLinkAnalytics>;
}

export const AnalyticsDisplay: React.FC<AnalyticsDisplayProps> = ({ analytics }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Social Media Analytics</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(analytics).map(([platform, data]) => {
          const platformInfo = SOCIAL_PLATFORMS.find(p => p.key === platform);
          if (!platformInfo) return null;
          
          return (
            <div key={platform} className="bg-white dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <platformInfo.icon className="w-4 h-4" style={{ color: platformInfo.color }} />
                <span className="font-medium text-gray-900 dark:text-gray-100">{platformInfo.name}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Clicks: <span className="font-medium">{data.clicks}</span></div>
                <div>Unique: <span className="font-medium">{data.uniqueClicks}</span></div>
                {data.lastClicked && (
                  <div>Last: <span className="font-medium">
                    {new Date(data.lastClicked).toLocaleDateString()}
                  </span></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
