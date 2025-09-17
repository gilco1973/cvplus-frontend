import React from 'react';
import { PublicProfileData } from '../../../types/profile.types';
import { ValidationError } from '../../types/creator.types';

interface BasicInfoSectionProps {
  profileData: Partial<PublicProfileData>;
  onUpdate: (updates: Partial<PublicProfileData>) => void;
  getFieldError: (fieldName: string) => ValidationError | undefined;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  profileData,
  onUpdate,
  getFieldError,
}) => {
  const handleFieldChange = (field: keyof PublicProfileData, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={profileData.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                getFieldError('name') ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Your full name"
            />
            {getFieldError('name') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('name')?.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Title *
            </label>
            <input
              type="text"
              value={profileData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                getFieldError('title') ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Senior Software Engineer"
            />
            {getFieldError('title') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('title')?.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={profileData.location || ''}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headline
            </label>
            <input
              type="text"
              value={profileData.headline || ''}
              onChange={(e) => handleFieldChange('headline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief professional headline"
            />
          </div>
        </div>
      </div>
    </div>
  );
};