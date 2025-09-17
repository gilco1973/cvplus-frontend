import React from 'react';
import { ExternalLink, Share2, Copy, QrCode } from 'lucide-react';

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  username?: string;
}

interface SocialMediaLinksProps {
  links: SocialLink[];
  showQRCodes?: boolean;
  onGenerateQR?: (link: SocialLink) => void;
  onShare?: (link: SocialLink) => void;
  onCopy?: (link: SocialLink) => void;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  links,
  showQRCodes = false,
  onGenerateQR,
  onShare,
  onCopy,
  className = '',
  layout = 'grid'
}) => {
  const handleCopy = async (link: SocialLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      onCopy?.(link);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = async (link: SocialLink) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Connect with me on ${link.name}`,
          text: `Check out my ${link.name} profile`,
          url: link.url
        });
        onShare?.(link);
      } catch (err) {
        console.error('Failed to share link:', err);
      }
    } else {
      // Fallback to copy
      handleCopy(link);
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap gap-4';
      case 'vertical':
        return 'flex flex-col gap-4';
      case 'grid':
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  const getSocialIcon = (iconName: string) => {
    // Map icon names to actual icons or emojis
    const iconMap: Record<string, string> = {
      linkedin: '💼',
      twitter: '🐦',
      github: '🛠️',
      instagram: '📷',
      facebook: '📱',
      youtube: '🎥',
      tiktok: '🎵',
      website: '🌐',
      portfolio: '🎨',
      email: '📧'
    };
    
    return iconMap[iconName.toLowerCase()] || '🔗';
  };

  if (links.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">No social media links available</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className={getLayoutClasses()}>
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
          >
            {/* Social Media Info */}
            <div className="flex items-start gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                style={{ backgroundColor: link.color }}
              >
                <span>{getSocialIcon(link.icon)}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {link.name}
                </h3>
                {link.username && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{link.username}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                  {link.url}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <ExternalLink className="w-3 h-3" />
                Visit
              </a>
              
              <button
                onClick={() => handleCopy(link)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
                title="Copy link"
              >
                <Copy className="w-3 h-3" />
              </button>
              
              {navigator.share && (
                <button
                  onClick={() => handleShare(link)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
                  title="Share link"
                >
                  <Share2 className="w-3 h-3" />
                </button>
              )}
              
              {showQRCodes && onGenerateQR && (
                <button
                  onClick={() => onGenerateQR(link)}
                  className="px-3 py-2 bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-900/30 transition-colors flex items-center gap-2 text-sm"
                  title="Generate QR Code"
                >
                  <QrCode className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};