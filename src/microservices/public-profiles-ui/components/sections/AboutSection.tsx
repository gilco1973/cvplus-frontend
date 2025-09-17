import React from 'react';
import { PublicProfileData } from '../../../types/profile.types';

interface AboutSectionProps {
  profileData: Partial<PublicProfileData>;
  onUpdate: (updates: Partial<PublicProfileData>) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  profileData,
  onUpdate,
}) => {
  const handleFieldChange = (field: keyof PublicProfileData, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Summary
          </label>
          <textarea
            value={profileData.summary || ''}
            onChange={(e) => handleFieldChange('summary', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write a compelling professional summary that highlights your key achievements, skills, and career objectives..."
          />
          <div className="mt-2 text-sm text-gray-500">
            {profileData.summary?.length || 0} / 1000 characters
          </div>
        </div>
      </div>
    </div>
  );
};