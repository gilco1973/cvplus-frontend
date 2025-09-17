import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UseAuthReturn } from '../../backend/core-placeholder';

// Placeholder useAuth hook for admin module independence
const useAuth = (): UseAuthReturn => {
  return {
    user: null,
    loading: false,
    error: null,
    logout: async () => {
      // Placeholder logout implementation
      console.log('User logged out');
    },
    signIn: async (email: string, password: string) => {
      console.log('Sign in attempt');
    },
    signUp: async (email: string, password: string) => {
      console.log('Sign up attempt');
    }
  };
};
import { useAdminAuth } from '../hooks/useAdminAuth';

/**
 * Admin Layout Component
 * 
 * Provides consistent layout for all admin pages with navigation sidebar,
 * header, and main content area.
 */

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { adminProfile } = useAdminAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Admin Panel
              </span>
            </div>
            
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <AdminNavItem
              to="/admin"
              icon="📊"
              label="Dashboard"
              isActive={location.pathname === '/admin'}
            />
            
            <AdminNavItem
              to="/admin/users"
              icon="👥"
              label="User Management"
              isActive={location.pathname.startsWith('/admin/users')}
            />
            
            <AdminNavItem
              to="/admin/system"
              icon="⚙️"
              label="System Health"
              isActive={location.pathname.startsWith('/admin/system')}
            />
            
            <AdminNavItem
              to="/admin/analytics"
              icon="📈"
              label="Business Analytics"
              isActive={location.pathname.startsWith('/admin/analytics')}
            />
            
            <AdminNavItem
              to="/admin/moderation"
              icon="🛡️"
              label="Content Moderation"
              isActive={location.pathname.startsWith('/admin/moderation')}
            />
            
            <AdminNavItem
              to="/admin/support"
              icon="🎧"
              label="Support Center"
              isActive={location.pathname.startsWith('/admin/support')}
            />
            
            <AdminNavItem
              to="/admin/security"
              icon="🔒"
              label="Security Audit"
              isActive={location.pathname.startsWith('/admin/security')}
            />
            
            <AdminNavItem
              to="/admin/settings"
              icon="⚙️"
              label="Admin Settings"
              isActive={location.pathname.startsWith('/admin/settings')}
            />
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.displayName || user?.email}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {adminProfile?.role || 'Admin'}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link
                to="/"
                className="flex-1 text-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-600 rounded-md hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
              >
                Main App
              </Link>
              
              <button
                onClick={logout}
                className="flex-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-md hover:border-red-300 dark:hover:border-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Header content */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    System Operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

/**
 * Admin Navigation Item Component
 */
interface AdminNavItemProps {
  to: string;
  icon: string;
  label: string;
  isActive: boolean;
}

const AdminNavItem: React.FC<AdminNavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default AdminLayout;