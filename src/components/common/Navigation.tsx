import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '../Logo';
import { UserMenu } from '../UserMenu';
import { useAuth } from '../../contexts/AuthContext';
import { designSystem } from '../../config/designSystem';
import { useTranslation } from '../../hooks/useTranslation';
import { LanguageSelector, LanguageSelectorCompact } from '../LanguageSelector';
import toast from 'react-hot-toast';

interface NavigationProps {
  variant?: 'default' | 'transparent' | 'solid';
  className?: string;
}

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  variant = 'default',
  className = ''
}) => {
  const location = useLocation();
  const { user, signInWithGoogle } = useAuth();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks: NavLink[] = [
    { href: '/', label: t('navigation.home') },
    { href: '/features', label: t('navigation.features') },
    { href: '/pricing', label: t('navigation.pricing') },
    { href: '/about', label: t('footer.about') },
    { href: '/faq', label: t('footer.faq') },
  ];

  // Debug user state
  console.log('🧭 Navigation component - user state:', user ? {
    email: user.email,
    uid: user.uid
  } : 'No user');

  // Get variant-specific styling
  const getVariantClasses = () => {
    switch (variant) {
      case 'transparent':
        return {
          background: 'bg-transparent',
          border: 'border-transparent',
          backdrop: '',
        };
      case 'solid':
        return {
          background: 'bg-neutral-800',
          border: 'border-b border-neutral-700',
          backdrop: '',
        };
      default:
        return {
          background: designSystem.components.navigation.header.background,
          border: designSystem.components.navigation.header.border,
          backdrop: 'backdrop-blur-md',
        };
    }
  };

  const variantClasses = getVariantClasses();

  const isActiveRoute = (href: string): boolean => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('Signed in successfully!');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={`${
        designSystem.components.navigation.header.sticky
      } ${variantClasses.background} ${variantClasses.border} ${
        variantClasses.backdrop
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo 
              size="medium" 
              variant="white"
              className="transition-opacity hover:opacity-80"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = isActiveRoute(link.href);
              
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`${
                    designSystem.components.navigation.link.base
                  } ${
                    isActive 
                      ? designSystem.components.navigation.link.active
                      : designSystem.components.navigation.link.default
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* User Authentication */}
            {user ? (
              <UserMenu variant="white" size="default" />
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-3 bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                aria-label={t('auth.continueWith').replace('{{provider}}', 'Google')}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('auth.continueWith').replace('{{provider}}', 'Google')}
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-neutral-300" />
            ) : (
              <Menu className="w-6 h-6 text-neutral-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          
          {/* Mobile menu */}
          <div className="md:hidden fixed top-16 left-0 right-0 bg-neutral-800 border-b border-neutral-700 shadow-lg z-50">
            <nav className="px-4 py-4 space-y-2" aria-label="Mobile navigation">
              {navLinks.map((link) => {
                const isActive = isActiveRoute(link.href);
                
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={closeMobileMenu}
                    className={`${
                      designSystem.components.navigation.link.base
                    } ${
                      designSystem.components.navigation.link.mobile
                    } ${
                      isActive
                        ? 'text-primary-400 bg-primary-400/10'
                        : 'text-neutral-300 hover:text-primary-400 hover:bg-neutral-700'
                    } rounded-lg transition-colors`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
              
              {/* Language Selector - Mobile */}
              <div className="px-4 py-2">
                <LanguageSelectorCompact />
              </div>
              
              {/* Mobile User Authentication */}
              <div className="pt-4 border-t border-neutral-700">
                {user ? (
                  <div className="px-4 py-2">
                    <UserMenu variant="white" size="default" />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleSignIn();
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('auth.continueWith').replace('{{provider}}', 'Google')}
                  </button>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

// Export as default
export default Navigation;