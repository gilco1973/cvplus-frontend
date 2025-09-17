import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@cvplus/auth';
import { AdminLayout } from '../components/AdminLayout';
import { SystemHealthCard } from '../components/SystemHealthCard';
import { UserStatsCard } from '../components/UserStatsCard';
import { BusinessMetricsCard } from '../components/BusinessMetricsCard';
// Note: RecentActivityCard and AdminAlertsCard not yet moved to admin module
// import { RecentActivityCard } from '../components/RecentActivityCard';
// import { AdminAlertsCard } from '../components/AdminAlertsCard';
import { useAdminAuth } from '../hooks/useAdminAuth';

/**
 * Main Admin Dashboard Page
 * 
 * Provides comprehensive overview of system health, user statistics,
 * business metrics, and recent admin activities.
 */
export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, adminProfile, loading: adminLoading } = useAdminAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Redirect if not authenticated or not admin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!adminLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Show loading state while checking admin status
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleRefreshDashboard = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Welcome back, {adminProfile?.email || user.email}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Role: <span className="font-medium text-blue-600 dark:text-blue-400">
                {adminProfile?.role || 'Admin'}
              </span>
            </div>
            
            <button
              onClick={handleRefreshDashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>

        {/* Admin Alerts */}
        {/* TODO: AdminAlertsCard not yet moved to admin module */}
        {/* <AdminAlertsCard refreshTrigger={refreshTrigger} /> */}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* System Health */}
          <div className="xl:col-span-1">
            <SystemHealthCard refreshTrigger={refreshTrigger} />
          </div>

          {/* User Statistics */}
          <div className="xl:col-span-1">
            <UserStatsCard refreshTrigger={refreshTrigger} />
          </div>

          {/* Business Metrics */}
          <div className="xl:col-span-1">
            <BusinessMetricsCard refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            {/* TODO: RecentActivityCard not yet moved to admin module */}
            {/* <RecentActivityCard refreshTrigger={refreshTrigger} /> */}
          </div>
          
          {/* Quick Actions Panel */}
          <div className="xl:col-span-1">
            <QuickActionsPanel />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

/**
 * Quick Actions Panel Component
 */
const QuickActionsPanel: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      
      <div className="space-y-3">
        <QuickActionButton
          title="User Management"
          description="Manage user accounts and subscriptions"
          icon="👥"
          href="/admin/users"
        />
        
        <QuickActionButton
          title="System Monitoring"
          description="View system health and performance"
          icon="📊"
          href="/admin/system"
        />
        
        <QuickActionButton
          title="Business Analytics"
          description="View revenue and business metrics"
          icon="📈"
          href="/admin/analytics"
        />
        
        <QuickActionButton
          title="Content Moderation"
          description="Review and moderate user content"
          icon="🛡️"
          href="/admin/moderation"
        />
        
        <QuickActionButton
          title="Support Center"
          description="Manage support tickets and help users"
          icon="🎧"
          href="/admin/support"
        />
      </div>
    </div>
  );
};

/**
 * Quick Action Button Component
 */
interface QuickActionButtonProps {
  title: string;
  description: string;
  icon: string;
  href: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  title,
  description,
  icon,
  href
}) => {
  const handleClick = () => {
    // TODO: Implement navigation or actions
    console.log(`Navigate to: ${href}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 group"
    >
      <div className="flex items-start space-x-3">
        <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </div>
        </div>
      </div>
    </button>
  );
};

export default AdminDashboard;