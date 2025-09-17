import React from 'react';
import { Routes, Route } from 'react-router-dom';

/**
 * AnalyticsPage - Orchestrates analytics and insights
 *
 * TODO: Will integrate with @cvplus/analytics via orchestration pattern
 * Note: Direct Layer 2 imports removed for architectural compliance
 */

// Temporary placeholder component - will be replaced with orchestration pattern
const AnalyticsDashboard: React.FC<{
  dateRange: string;
  showExportOptions: boolean;
  onMetricsUpdate: (metrics: any) => void;
  className: string;
}> = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
    <p className="text-gray-600">
      Analytics dashboard will be loaded via orchestration pattern.
      Direct Layer 2 import removed for architectural compliance.
    </p>
  </div>
);
const AnalyticsPage: React.FC = () => {
  return (
    <div className="h-full overflow-auto">
      <Routes>
        {/* Main Analytics Route */}
        <Route
          path="/"
          element={
            <div className="max-w-7xl mx-auto p-6">
              <AnalyticsDashboard
                dateRange="30d"
                showExportOptions={true}
                onMetricsUpdate={(metrics) => {
                  console.log('Analytics metrics updated:', metrics);
                }}
                className="w-full"
              />
            </div>
          }
        />

        {/* Detailed Reports Route */}
        <Route
          path="/reports"
          element={
            <div className="max-w-6xl mx-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Reports</h2>
              <p className="text-gray-600">Detailed analytics reports will be implemented here.</p>
            </div>
          }
        />

        {/* Export Data Route */}
        <Route
          path="/export"
          element={
            <div className="max-w-4xl mx-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Analytics Data</h2>
              <p className="text-gray-600">Data export interface will be implemented here.</p>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default AnalyticsPage;