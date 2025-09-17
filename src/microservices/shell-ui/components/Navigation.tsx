import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@cvplus/auth';

/**
 * Navigation Component (T062)
 *
 * Main navigation between feature areas with authentication-aware display.
 * Integrates with auth context from @cvplus/auth submodule.
 */
const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'CV Processing', href: '/cv-processing', icon: '📄' },
    { name: 'Multimedia', href: '/multimedia', icon: '🎬' },
    { name: 'Public Profiles', href: '/profiles', icon: '👤' },
    { name: 'Analytics', href: '/analytics', icon: '📊' }
  ];

  return (
    <nav className="w-64 bg-white shadow-lg overflow-y-auto">
      <div className="p-4">
        {/* User info section */}
        {isAuthenticated && user && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user.displayName || user.email}
                </p>
                <p className="text-xs text-gray-500">
                  User Account
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                  {/* Premium feature indicator removed - handled by higher layer modules */}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Footer actions */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          {!isAuthenticated ? (
            <Link
              to="/auth/login"
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Sign In
            </Link>
          ) : (
            <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;