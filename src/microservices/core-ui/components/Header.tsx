import React from 'react';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';
import { Navigation } from './common/Navigation';

interface HeaderProps {
  variant?: 'default' | 'transparent' | 'solid';
  showNavigation?: boolean;
  showUserMenu?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  showNavigation = true,
  showUserMenu = true,
  className = ''
}) => {
  const getHeaderClasses = () => {
    const baseClasses = 'sticky top-0 z-50 w-full transition-all duration-200';

    switch (variant) {
      case 'transparent':
        return `${baseClasses} bg-transparent`;
      case 'solid':
        return `${baseClasses} bg-white border-b border-gray-200 shadow-sm`;
      default:
        return `${baseClasses} bg-white/95 backdrop-blur-sm border-b border-gray-200`;
    }
  };

  return (
    <header className={`${getHeaderClasses()} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo
              size="medium"
              variant={variant === 'transparent' ? 'white' : 'default'}
            />
          </div>

          {/* Navigation */}
          {showNavigation && (
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <Navigation variant={variant} />
            </div>
          )}

          {/* User Menu */}
          {showUserMenu && (
            <div className="flex-shrink-0">
              <UserMenu
                variant={variant === 'transparent' ? 'white' : 'default'}
                size="default"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;