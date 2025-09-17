import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface NavigationDebuggerProps {
  enabled?: boolean;
  jobId?: string;
}

export const NavigationDebugger: React.FC<NavigationDebuggerProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  jobId 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [storageData, setStorageData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!enabled) return;

    // Track navigation changes
    setNavigationHistory(prev => [...prev, location.pathname].slice(-5)); // Keep last 5

    // Monitor session storage for job data
    if (jobId) {
      const recommendations = sessionStorage.getItem(`recommendations-${jobId}`);
      const improvements = sessionStorage.getItem(`improvements-${jobId}`);
      
      setStorageData({
        recommendations: recommendations ? JSON.parse(recommendations) : null,
        improvements: improvements ? JSON.parse(improvements) : null
      });
    }
  }, [location, enabled, jobId]);

  if (!enabled) return null;

  const isOnPreviewPage = location.pathname.includes('/preview/');
  const isOnAnalysisPage = location.pathname.includes('/analysis/');

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg border border-gray-700 shadow-xl text-xs max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-blue-400" />
        <span className="font-semibold">Navigation Debugger</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {isOnPreviewPage ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <XCircle className="w-3 h-3 text-red-500" />
          )}
          <span>Preview Page: {isOnPreviewPage ? 'Active' : 'Inactive'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {isOnAnalysisPage ? (
            <CheckCircle className="w-3 h-3 text-yellow-500" />
          ) : (
            <XCircle className="w-3 h-3 text-gray-500" />
          )}
          <span>Analysis Page: {isOnAnalysisPage ? 'Active' : 'Inactive'}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Current:</span>
          <div className="text-blue-300 truncate">{location.pathname}</div>
        </div>
        
        <div>
          <span className="text-gray-400">History:</span>
          <div className="max-h-20 overflow-y-auto">
            {navigationHistory.map((path, index) => (
              <div key={index} className="text-gray-300 text-xs truncate">
                {index + 1}. {path}
              </div>
            ))}
          </div>
        </div>
        
        {jobId && (
          <div>
            <span className="text-gray-400">Storage:</span>
            <div className="text-xs">
              <div className="flex items-center gap-1">
                {storageData.recommendations ? (
                  <CheckCircle className="w-2 h-2 text-green-500" />
                ) : (
                  <XCircle className="w-2 h-2 text-red-500" />
                )}
                <span>Recommendations ({Array.isArray(storageData.recommendations) ? storageData.recommendations.length : 0})</span>
              </div>
              <div className="flex items-center gap-1">
                {storageData.improvements ? (
                  <CheckCircle className="w-2 h-2 text-green-500" />
                ) : (
                  <XCircle className="w-2 h-2 text-red-500" />
                )}
                <span>Improvements</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick navigation test */}
        {jobId && !isOnPreviewPage && (
          <button
            onClick={() => {
              console.log('🧪 [DEBUG] Manual navigation test to preview');
              navigate(`/preview/${jobId}`);
            }}
            className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs w-full"
          >
            Test Navigate to Preview
          </button>
        )}
      </div>
    </div>
  );
};