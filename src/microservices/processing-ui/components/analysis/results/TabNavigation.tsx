/**
 * Tab Navigation Component
 * Provides tabbed navigation for different analysis sections
 */

import React from 'react';
import { FileText, BarChart3, Users } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'overview' | 'skills' | 'personality' | 'industry' | 'competitive';
  onTabChange: (tab: 'overview' | 'skills' | 'personality' | 'industry' | 'competitive') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'skills', label: 'Skills Analysis', icon: BarChart3 },
    { id: 'personality', label: 'Personality', icon: Users },
    { id: 'industry', label: 'Industry Fit', icon: BarChart3 },
    { id: 'competitive', label: 'Competitive Edge', icon: BarChart3 }
  ] as const;

  return (
    <div className="mb-8">
      <nav className="flex space-x-8 border-b border-gray-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};