import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../common/Button';
import { UserMenu } from '../UserMenu';
import { useAuth } from '../../contexts/AuthContext';
import { designSystem } from '../../config/designSystem';
import toast from 'react-hot-toast';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{
    href: string;
    label: string;
    external?: boolean;
  }>;
}

/**
 * MobileNavigation - Consistent mobile menu implementation
 * 
 * Provides standardized mobile navigation with overlay, proper accessibility,
 * and unified styling that matches the desktop navigation.
 */
export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  navLinks
}) => {
  const location = useLocation();
  const { user, signInWithGoogle } = useAuth();

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
      onClose();
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Mobile menu panel */}
      <div className="md:hidden fixed top-16 left-0 right-0 bg-neutral-800 border-b border-neutral-700 shadow-lg z-50">
        <nav className="px-4 py-4 space-y-2" aria-label="Mobile navigation">
          {navLinks.map((link) => {
            const isActive = isActiveRoute(link.href);
            
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={onClose}
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
          
          {/* Mobile User Authentication */}
          <div className="pt-4 border-t border-neutral-700">
            {user ? (
              <div className="px-4 py-2">
                <UserMenu variant="white" size="default" />
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleSignIn}
                aria-label="Sign in with Google"
              >
                Sign In
              </Button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

// Export as default
export default MobileNavigation;