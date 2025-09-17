import React from 'react';
import { PublicProfileData } from '../../../types/profile.types';

interface SkillsSectionProps {
  profileData: Partial<PublicProfileData>;
  onUpdate: (updates: Partial<PublicProfileData>) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  profileData,
  onUpdate,
}) => {
  const handleFieldChange = (field: keyof PublicProfileData, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills (comma-separated)
          </label>
          <textarea
            value={(profileData.skills || []).join(', ')}
            onChange={(e) => {
              const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
              handleFieldChange('skills', skills);
            }}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="JavaScript, React, Node.js, Python, AWS, Docker..."
          />
          <div className="mt-2 text-sm text-gray-500">
            {profileData.skills?.length || 0} skills added
          </div>
        </div>

        {/* Skills Preview */}
        {profileData.skills && profileData.skills.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};