/**
 * Results Page Header Component
 */

import { useNavigate } from 'react-router-dom';

export const ResultsPageHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-300 hover:text-gray-100"
          >
            <div className="w-5 h-5">🏠</div>
            <span>Home</span>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-100">Your Enhanced CV is Ready!</h1>
            <p className="text-sm text-gray-400 mt-1">Download, share, or continue customizing</p>
          </div>
          <div className="w-20"></div>
        </div>
      </div>
    </header>
  );
};