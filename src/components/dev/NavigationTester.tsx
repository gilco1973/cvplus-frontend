/**
 * Navigation Tester Component
 * Development tool to test navigation functionality
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { robustNavigation } from '../../utils/robustNavigation';
import { navigationDebugger } from '../../utils/navigationDebugger';

interface NavigationTesterProps {
  jobId?: string;
  className?: string;
}

export const NavigationTester: React.FC<NavigationTesterProps> = ({
  jobId = 'test-job-123',
  className = ''
}) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  const testDirectNavigation = async () => {
    setIsNavigating(true);
    setLastResult('Testing direct navigation...');
    
    try {
      const targetPath = `/preview/${jobId}`;
      navigate(targetPath);
      
      setTimeout(() => {
        const success = window.location.pathname === targetPath;
        setLastResult(success ? 'Direct navigation: SUCCESS' : 'Direct navigation: FAILED');
        setIsNavigating(false);
      }, 200);
      
    } catch (error) {
      setLastResult(`Direct navigation: ERROR - ${(error as Error).message}`);
      setIsNavigating(false);
    }
  };

  const testRobustNavigation = async () => {
    setIsNavigating(true);
    setLastResult('Testing robust navigation...');
    
    try {
      const success = await robustNavigation.navigateToPreview(
        navigate,
        jobId,
        ['test-rec-1', 'test-rec-2'],
        {
          replace: true,
          timeout: 200,
          maxRetries: 2,
          onSuccess: () => setLastResult('Robust navigation: SUCCESS'),
          onFailure: (error) => setLastResult(`Robust navigation: FAILED - ${error.message}`)
        }
      );
      
      if (success) {
        setLastResult('Robust navigation: SUCCESS');
      } else {
        setLastResult('Robust navigation: FAILED');
      }
      
    } catch (error) {
      setLastResult(`Robust navigation: ERROR - ${(error as Error).message}`);
    } finally {
      setIsNavigating(false);
    }
  };

  const testValidation = () => {
    const isValid = robustNavigation.validateRoute(jobId);
    setLastResult(`Route validation: ${isValid ? 'VALID' : 'INVALID'}`);
  };

  const showDebugReport = () => {
    navigationDebugger.printReport();
    setLastResult('Debug report printed to console');
  };

  const clearDebugLogs = () => {
    navigationDebugger.clearLogs();
    setLastResult('Debug logs cleared');
  };

  const emergencyNavigate = () => {
    robustNavigation.emergencyNavigate(jobId);
    setLastResult('Emergency navigation initiated');
  };

  return (
    <div className={`bg-gray-800 border border-gray-600 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        🧪 Navigation Tester
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Job ID:</span>
          <code className="bg-gray-700 px-2 py-1 rounded text-sm text-green-400">
            {jobId}
          </code>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Current Path:</span>
          <code className="bg-gray-700 px-2 py-1 rounded text-sm text-blue-400">
            {window.location.pathname}
          </code>
        </div>
        
        {lastResult && (
          <div className="bg-gray-700 p-2 rounded">
            <span className="text-sm text-gray-300">{lastResult}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={testDirectNavigation}
            disabled={isNavigating}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Direct Nav
          </button>
          
          <button
            onClick={testRobustNavigation}
            disabled={isNavigating}
            className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Robust Nav
          </button>
          
          <button
            onClick={testValidation}
            disabled={isNavigating}
            className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Validate Route
          </button>
          
          <button
            onClick={emergencyNavigate}
            disabled={isNavigating}
            className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Emergency Nav
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-600">
          <button
            onClick={showDebugReport}
            className="px-3 py-2 text-xs bg-gray-600 text-gray-300 rounded hover:bg-gray-500"
          >
            Show Debug Report
          </button>
          
          <button
            onClick={clearDebugLogs}
            className="px-3 py-2 text-xs bg-gray-600 text-gray-300 rounded hover:bg-gray-500"
          >
            Clear Debug Logs
          </button>
        </div>
      </div>
      
      {isNavigating && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">Testing navigation...</span>
        </div>
      )}
    </div>
  );
};