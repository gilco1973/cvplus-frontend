import React from 'react';
import { PublicProfileData } from '../../../types/profile.types';
import { ValidationError } from '../../types/creator.types';

interface ContactSectionProps {
  profileData: Partial<PublicProfileData>;
  onUpdate: (updates: Partial<PublicProfileData>) => void;
  getFieldError: (fieldName: string) => ValidationError | undefined;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profileData.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                getFieldError('email') ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
            />
            {getFieldError('email') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('email')?.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={profileData.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={profileData.website || ''}
              onChange={(e) => handleFieldChange('website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={profileData.socialLinks?.linkedin || ''}
              onChange={(e) => handleFieldChange('socialLinks', {
                ...profileData.socialLinks,
                linkedin: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>
      </div>
    </div>
  );
};