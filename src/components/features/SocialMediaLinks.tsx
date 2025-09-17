import React from 'react';
import { ExternalLink, Share2, Users } from 'lucide-react';

interface PlatformIconProps {
  platform: string;
  className?: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = "w-6 h-6" }) => {
  const iconProps = {
    className,
    fill: "currentColor",
    viewBox: "0 0 24 24"
  };

  switch (platform.toLowerCase()) {
    case 'linkedin':
      return (
        <svg {...iconProps}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    case 'github':
      return (
        <svg {...iconProps}>
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      );
    case 'twitter':
    case 'x':
      return (
        <svg {...iconProps}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg {...iconProps}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg {...iconProps}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg {...iconProps}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...iconProps}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      );
    case 'behance':
      return (
        <svg {...iconProps}>
          <path d="M7.799 5.698c.589 0 1.106.085 1.552.255s.821.398 1.129.686c.308.288.544.628.708 1.02s.246.816.246 1.275c0 .462-.154.924-.462 1.386s-.738.83-1.292 1.105c.77.077 1.386.385 1.849.924s.693 1.193.693 1.962c0 .539-.108 1.024-.323 1.456s-.515.798-.9 1.098c-.385.3-.854.531-1.407.693s-1.139.246-1.759.246H0V5.698h7.799zm-.831 3.736c.462 0 .847-.123 1.156-.369s.462-.616.462-1.124-.154-.847-.462-1.086c-.308-.238-.693-.354-1.156-.354H3.077v2.933h3.891zm.293 4.244c.508 0 .924-.139 1.248-.416s.485-.693.485-1.248c0-.539-.162-.947-.485-1.225s-.74-.416-1.248-.416H3.077v3.305h4.184zM15.692 9.008h5.539v1.709h-5.539V9.008zM24 16.498c0 .154-.016.293-.046.416H17.23c.046.462.231.824.554 1.086s.723.393 1.201.393c.385 0 .724-.077 1.017-.231s.508-.339.647-.554h2.186c-.339.924-.847 1.633-1.524 2.126s-1.517.739-2.526.739c-.631 0-1.201-.108-1.71-.323s-.939-.508-1.294-.877c-.354-.369-.631-.8-.831-1.294s-.3-1.017-.3-1.571c0-.554.1-1.078.3-1.571s.477-.925.831-1.294c.354-.369.785-.662 1.294-.877s1.079-.323 1.71-.323c.6 0 1.148.108 1.64.323s.916.508 1.271.877c.354.369.631.8.831 1.294s.3 1.048.3 1.663zm-2.371-1.848c-.077-.431-.277-.754-.6-.969s-.708-.323-1.156-.323c-.446 0-.823.108-1.132.323s-.508.538-.6.969h3.488z"/>
        </svg>
      );
    case 'dribbble':
      return (
        <svg {...iconProps}>
          <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm9.568 7.375c.53 1.595.815 3.296.815 5.071 0 .253-.013.506-.031.756-.017.004-.357-.078-1.033-.229a16.56 16.56 0 0 0-3.337-.544c-.225-2.03-.764-3.956-1.528-5.697 2.123-1.046 3.76-1.617 4.114-1.357zm-5.568-5.15c1.4.268 2.684.834 3.76 1.617-.277.185-1.577.65-3.45 1.54-.987-1.812-2.088-3.352-3.169-4.54.943-.393 1.94-.617 2.859-.617zm-4.276.543c1.065 1.175 2.157 2.702 3.14 4.498-1.969.753-4.233 1.151-6.565 1.151-.221 0-.442-.005-.662-.014C1.986 6.35 3.845 3.678 6.724 2.393zm-4.538 9.607v-.121a.758.758 0 0 0 .662-.662c2.364 0 4.66-.4 6.655-1.153.775 1.75 1.318 3.681 1.543 5.728-2.425 1.128-4.252 3.073-5.183 5.324a9.556 9.556 0 0 1-3.677-9.116zm5.26 9.116c.832-2.125 2.543-3.97 4.783-5.02.43 1.998.653 4.09.653 6.23 0 .39-.017.777-.05 1.162a9.51 9.51 0 0 1-5.386-2.372zm7.332 1.372c.023-.387.035-.776.035-1.166 0-2.124-.22-4.202-.644-6.188 1.03.152 2.043.344 3.01.572.97.228 1.65.423 2.04.583-.234 2.825-1.305 5.386-3.441 7.199z"/>
        </svg>
      );
    case 'medium':
      return (
        <svg {...iconProps}>
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
        </svg>
      );
    case 'stack overflow':
      return (
        <svg {...iconProps}>
          <path d="M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.093-10.473-2.201zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.154Z"/>
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 12h8m-4-4v8"/>
        </svg>
      );
  }
};

interface SocialMediaProfile {
  platform: string;
  url: string;
  username?: string;
  verified?: boolean;
  followerCount?: number;
}

interface SocialMediaLinksProps {
  profileId: string;
  socialLinks: SocialMediaProfile[];
  isEditable?: boolean;
  customization?: {
    iconSize?: 'sm' | 'md' | 'lg';
    layout?: 'horizontal' | 'vertical' | 'grid';
    showLabels?: boolean;
    theme?: 'light' | 'dark' | 'auto';
  };
  onLinksUpdate?: (links: SocialMediaProfile[]) => void;
}

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  profileId,
  socialLinks,
  isEditable = false,
  customization = {},
  onLinksUpdate
}) => {
  const {
    iconSize = 'md',
    layout = 'grid',
    showLabels = true
  } = customization;

  if (!socialLinks || socialLinks.length === 0) {
    return (
      <div className="social-links-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-blue-200 dark:border-slate-700">
        <div className="text-center">
          <div className="p-4 bg-blue-100 dark:bg-slate-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Share2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No Social Media Profiles</h3>
          <p className="text-slate-600 dark:text-slate-300">
            {isEditable ? 'Add your social media profiles to showcase your online presence.' : 'No social media profiles available.'}
          </p>
        </div>
      </div>
    );
  }

  const getSizeClasses = () => {
    switch (iconSize) {
      case 'sm': return { icon: 'w-8 h-8', svg: 'w-4 h-4', container: 'p-2' };
      case 'lg': return { icon: 'w-16 h-16', svg: 'w-8 h-8', container: 'p-4' };
      default: return { icon: 'w-12 h-12', svg: 'w-6 h-6', container: 'p-3' };
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal': return 'flex flex-wrap gap-4 justify-center';
      case 'vertical': return 'flex flex-col gap-4 max-w-sm mx-auto';
      default: return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    }
  };

  const sizeClasses = getSizeClasses();

  const handleLinkClick = (link: SocialMediaProfile) => {
    // Track click analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'social_link_click', {
        platform: link.platform.toLowerCase(),
        url: link.url,
        profile_id: profileId
      });
    }
  };

  return (
    <div className="social-links-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-blue-200 dark:border-slate-700 shadow-lg">
      <div className="social-links-header text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-500 rounded-full">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Connect with Me</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-lg">
          Find me on these platforms and let's connect!
        </p>
      </div>

      <div className={`social-links-grid ${getLayoutClasses()}`}>
        {socialLinks.map((link, index) => (
          <SocialLink
            key={`${link.platform}-${index}`}
            link={link}
            sizeClasses={sizeClasses}
            showLabels={showLabels}
            onClick={() => handleLinkClick(link)}
          />
        ))}
      </div>
    </div>
  );
};

interface SocialLinkProps {
  link: SocialMediaProfile;
  sizeClasses: {
    icon: string;
    svg: string;
    container: string;
  };
  showLabels: boolean;
  onClick: () => void;
}

const SocialLink: React.FC<SocialLinkProps> = ({ link, sizeClasses, showLabels, onClick }) => {
  const platformColor = getPlatformColor(link.platform);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="social-link group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer"
      title={`Follow on ${link.platform}`}
    >
      <div
        className={`social-icon ${sizeClasses.icon} ${sizeClasses.container} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}
        style={{ backgroundColor: platformColor }}
      >
        <PlatformIcon 
          platform={link.platform} 
          className={sizeClasses.svg} 
        />
      </div>

      {showLabels && (
        <div className="social-info flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="platform-name font-semibold text-slate-800 dark:text-slate-100 truncate">
              {link.platform}
            </span>
            {link.verified && (
              <span className="verified text-blue-500 text-sm" title="Verified">
                ✓
              </span>
            )}
          </div>
          {link.username && (
            <div className="username text-sm text-slate-500 dark:text-slate-400 truncate">
              @{link.username}
            </div>
          )}
          {link.followerCount && (
            <div className="followers text-xs text-slate-400 dark:text-slate-500">
              {formatNumber(link.followerCount)} followers
            </div>
          )}
        </div>
      )}

      <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors duration-200" />
    </a>
  );
};

function getPlatformColor(platform: string): string {
  const colorMap: { [key: string]: string } = {
    'LinkedIn': '#0077B5',
    'GitHub': '#333333',
    'Twitter': '#000000',
    'X': '#000000',
    'Instagram': '#E4405F',
    'Facebook': '#1877F2',
    'YouTube': '#FF0000',
    'TikTok': '#000000',
    'Behance': '#1769FF',
    'Dribbble': '#EA4C89',
    'Medium': '#000000',
    'Stack Overflow': '#F58025'
  };

  return colorMap[platform] || '#6B7280';
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}