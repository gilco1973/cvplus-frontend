import React from 'react';
import { SocialLinksProps } from './types';

interface SettingsPanelProps {
  customization: SocialLinksProps['customization'];
  onUpdate?: (data: any) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  customization = {},
  onUpdate
}) => {
  const {
    style = 'buttons',
    size = 'medium',
    theme = 'colorful',
    showLabels = true,
    openInNewTab = true
  } = customization;

  const handleStyleChange = (newStyle: string) => {
    onUpdate?.({
      customization: { 
        ...customization, 
        style: newStyle as 'icons' | 'buttons' | 'cards'
      }
    });
  };

  const handleSizeChange = (newSize: string) => {
    onUpdate?.({
      customization: { 
        ...customization, 
        size: newSize as 'small' | 'medium' | 'large'
      }
    });
  };

  const handleThemeChange = (newTheme: string) => {
    onUpdate?.({
      customization: { 
        ...customization, 
        theme: newTheme as 'dark' | 'light' | 'colorful'
      }
    });
  };

  const handleToggleLabels = (showLabels: boolean) => {
    onUpdate?.({
      customization: { 
        ...customization, 
        showLabels
      }
    });
  };

  const handleToggleNewTab = (openInNewTab: boolean) => {
    onUpdate?.({
      customization: { 
        ...customization, 
        openInNewTab
      }
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Link Settings</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Style
          </label>
          <select
            value={style}
            onChange={(e) => handleStyleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="icons">Icons Only</option>
            <option value="buttons">Buttons</option>
            <option value="cards">Cards</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Size
          </label>
          <select
            value={size}
            onChange={(e) => handleSizeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme
          </label>
          <select
            value={theme}
            onChange={(e) => handleThemeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="colorful">Colorful</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => handleToggleLabels(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show Labels</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => handleToggleNewTab(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">New Tab</span>
          </label>
        </div>
      </div>
    </div>
  );
};
