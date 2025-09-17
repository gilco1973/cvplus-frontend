/**
 * Feature Checkbox Component
 */

import type { FeatureCheckboxProps } from '../../types/results';

export const FeatureCheckbox = ({ 
  feature, 
  label, 
  description, 
  checked, 
  onChange, 
  featureAvailability, 
  className = '' 
}: FeatureCheckboxProps) => {
  const availability = featureAvailability[feature as keyof typeof featureAvailability];
  const isDisabled = availability && !availability.available;
  
  return (
    <div className={`relative ${className}`}>
      <label className={`flex items-start gap-3 p-4 rounded-lg transition-all cursor-pointer group border-2 ${
        isDisabled 
          ? 'bg-gray-800/50 border-gray-600 opacity-60 cursor-not-allowed' 
          : checked
          ? 'border-blue-400 bg-blue-900/30 text-blue-300'
          : 'border-gray-600 hover:border-gray-500 text-gray-300 bg-gray-700/50 hover:bg-gray-600/50'
      }`}>
        <input 
          type="checkbox" 
          className={`mt-1 h-4 w-4 rounded focus:ring-cyan-500 ${
            isDisabled 
              ? 'text-gray-500 cursor-not-allowed' 
              : 'text-cyan-500'
          }`}
          checked={checked}
          disabled={isDisabled}
          onChange={(e) => !isDisabled && onChange(e.target.checked)}
        />
        <div className="flex-1">
          <span className={`font-medium transition-colors ${
            isDisabled 
              ? 'text-gray-500' 
              : checked
              ? 'text-blue-300'
              : 'text-gray-200 group-hover:text-gray-100'
          }`}>
            {label}
          </span>
          {description && (
            <span className="block text-xs text-gray-400 mt-0.5">{description}</span>
          )}
        </div>
        {isDisabled && (
          <div className="ml-2">
            <div className="group/tooltip relative">
              <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-xs text-gray-400 cursor-help">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-gray-200 text-xs rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
                {availability?.reason}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
        )}
      </label>
    </div>
  );
};