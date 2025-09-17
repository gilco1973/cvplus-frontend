import React, { useCallback } from 'react';
import { ExternalLink, Share2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { SocialPlatform, SocialLinkAnalytics, SocialLinksProps } from './types';
import { SIZE_CLASSES } from './constants';
import { useSocialMediaShare } from './hooks';

interface SocialLinkRendererProps {
  platform: SocialPlatform;
  url: string;
  customization: SocialLinksProps['customization'];
  analytics?: SocialLinkAnalytics;
  linkStatus: any;
  mode: 'public' | 'private' | 'preview';
  onLinkClick: () => void;
}

export const SocialLinkRenderer: React.FC<SocialLinkRendererProps> = ({
  platform,
  url,
  customization = {},
  analytics,
  linkStatus,
  mode,
  onLinkClick
}) => {
  const {
    style = 'buttons',
    size = 'medium',
    theme = 'colorful',
    showLabels = true,
    animateHover = true
  } = customization;

  const { handleShare } = useSocialMediaShare();
  const IconComponent = platform.icon;
  const sizeConfig = SIZE_CLASSES[size];
  
  const baseClasses = `
    relative group inline-flex items-center justify-center transition-all duration-200
    ${animateHover ? 'hover:scale-105 hover:shadow-lg' : ''}
    ${sizeConfig.container} ${sizeConfig.spacing}
  `;
  
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700';
      case 'light':
        return 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50';
      default: // colorful
        return 'hover:shadow-lg';
    }
  };
  
  const getColorStyle = () => {
    if (theme === 'colorful') {
      return {
        backgroundColor: `${platform.color}15`,
        borderColor: `${platform.color}30`,
        color: platform.color
      };
    }
    return {};
  };

  const getStatusIcon = () => {
    if (!linkStatus) return null;
    
    const iconProps = {
      className: `w-3 h-3 ${linkStatus.color}`,
      title: linkStatus.tooltip
    };

    switch (linkStatus.icon) {
      case 'CheckCircle':
        return <CheckCircle {...iconProps} />;
      case 'AlertTriangle':
        return <AlertTriangle {...iconProps} />;
      case 'Clock':
        return <Clock {...iconProps} />;
      default:
        return null;
    }
  };

  const commonProps = {
    onClick: onLinkClick,
    className: `${baseClasses} ${getThemeClasses()} ${style === 'cards' ? 'rounded-lg' : style === 'buttons' ? 'rounded-md' : 'rounded-full'}`,
    style: getColorStyle(),
    title: `Visit my ${platform.name} profile`,
    'aria-label': `Visit ${platform.name} profile`
  };

  const content = (
    <>
      <div className="flex items-center gap-2">
        <IconComponent className={sizeConfig.icon} />
        {showLabels && style !== 'icons' && (
          <span className={`font-medium ${sizeConfig.text}`}>
            {platform.name}
          </span>
        )}
        {getStatusIcon()}
      </div>
      
      {/* Analytics badge */}
      {analytics && analytics.clicks > 0 && mode === 'private' && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {analytics.clicks > 99 ? '99+' : analytics.clicks}
        </div>
      )}
      
      {/* External link indicator */}
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1" />
    </>
  );

  if (style === 'cards') {
    return (
      <div className="flex flex-col items-center space-y-2">
        <button {...commonProps}>
          {content}
        </button>
        {showLabels && (
          <span className={`${sizeConfig.text} text-gray-600 dark:text-gray-400`}>
            {platform.name}
          </span>
        )}
        {mode === 'private' && (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare(platform.name, url);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Share this profile"
            >
              <Share2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button {...commonProps}>
      {content}
    </button>
  );
};
