import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';
import { designSystem } from '../../config/designSystem';

interface FooterProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

/**
 * Footer - Consistent footer component with unified styling
 * 
 * Provides standardized footer across all pages with proper branding
 * and navigation links using the unified design system.
 */
export const Footer: React.FC<FooterProps> = ({
  variant = 'default',
  className = ''
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-neutral-800 border-t border-neutral-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {variant === 'default' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <Logo size="medium" variant="white" />
              <p className="text-neutral-400 text-sm max-w-sm">
                Transform your CV from paper to powerful with AI-enhanced professional profiles.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-neutral-200 mb-4">Quick Links</h3>
              <nav className="space-y-2">
                <Link 
                  to="/" 
                  className={designSystem.components.navigation.link.base + ' ' + designSystem.components.navigation.link.default + ' block'}
                >
                  Home
                </Link>
                <Link 
                  to="/features" 
                  className={designSystem.components.navigation.link.base + ' ' + designSystem.components.navigation.link.default + ' block'}
                >
                  Features
                </Link>
                <Link 
                  to="/pricing" 
                  className={designSystem.components.navigation.link.base + ' ' + designSystem.components.navigation.link.default + ' block'}
                >
                  Pricing
                </Link>
                <Link 
                  to="/about" 
                  className={designSystem.components.navigation.link.base + ' ' + designSystem.components.navigation.link.default + ' block'}
                >
                  About
                </Link>
              </nav>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-neutral-200 mb-4">Support</h3>
              <nav className="space-y-2">
                <Link 
                  to="/faq" 
                  className={designSystem.components.navigation.link.base + ' ' + designSystem.components.navigation.link.default + ' block'}
                >
                  FAQ
                </Link>
                <Link 
                  to="/contact" 
                  className={designSystem.components.navigation.link.base + ' ' + designSystem.components.navigation.link.default + ' block'}
                >
                  Contact
                </Link>
                <Link 
                  to="/fair-use-policy" 
                  className={designSystem.components.navigation.link.base + ' ' + designSystem.components.navigation.link.default + ' block'}
                >
                  Fair Use Policy
                </Link>
              </nav>
            </div>
          </div>
        ) : null}
        
        {/* Copyright */}
        <div className={`${variant === 'default' ? 'pt-8 mt-8 border-t border-neutral-700' : ''} text-center`}>
          <p className="text-neutral-400 text-sm">
            &copy; {currentYear} CVPlus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Export as default
export default Footer;