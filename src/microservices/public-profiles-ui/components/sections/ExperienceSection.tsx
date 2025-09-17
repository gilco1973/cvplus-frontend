import React from 'react';
import { PublicProfileData } from '../../../types/profile.types';

interface ExperienceSectionProps {
  profileData: Partial<PublicProfileData>;
  onUpdate: (updates: Partial<PublicProfileData>) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  profileData,
  onUpdate,
}) => {
  const handleArrayFieldAdd = (field: keyof PublicProfileData, item: any) => {
    const currentArray = (profileData[field] as any[]) || [];
    onUpdate({ [field]: [...currentArray, item] });
  };

  const handleArrayFieldUpdate = (field: keyof PublicProfileData, index: number, item: any) => {
    const currentArray = (profileData[field] as any[]) || [];
    const updatedArray = [...currentArray];
    updatedArray[index] = item;
    onUpdate({ [field]: updatedArray });
  };

  const handleArrayFieldRemove = (field: keyof PublicProfileData, index: number) => {
    const currentArray = (profileData[field] as any[]) || [];
    const updatedArray = currentArray.filter((_, i) => i !== index);
    onUpdate({ [field]: updatedArray });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
        <button
          onClick={() => handleArrayFieldAdd('experience', {
            id: Date.now().toString(),
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            description: '',
            isCurrentRole: false,
          })}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Experience
        </button>
      </div>

      <div className="space-y-6">
        {(profileData.experience || []).map((exp, index) => (
          <div key={exp.id || index} className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Experience #{index + 1}</h3>
              <button
                onClick={() => handleArrayFieldRemove('experience', index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={exp.title || ''}
                onChange={(e) => handleArrayFieldUpdate('experience', index, { ...exp, title: e.target.value })}
                placeholder="Job Title"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={exp.company || ''}
                onChange={(e) => handleArrayFieldUpdate('experience', index, { ...exp, company: e.target.value })}
                placeholder="Company"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={exp.startDate || ''}
                onChange={(e) => handleArrayFieldUpdate('experience', index, { ...exp, startDate: e.target.value })}
                placeholder="Start Date (e.g., Jan 2020)"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={exp.endDate || ''}
                onChange={(e) => handleArrayFieldUpdate('experience', index, { ...exp, endDate: e.target.value })}
                placeholder="End Date (or 'Present')"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <textarea
              value={exp.description || ''}
              onChange={(e) => handleArrayFieldUpdate('experience', index, { ...exp, description: e.target.value })}
              rows={3}
              placeholder="Describe your key achievements and responsibilities..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}

        {(!profileData.experience || profileData.experience.length === 0) && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-400 text-4xl mb-2">💼</div>
            <p className="text-gray-600">No experience added yet</p>
            <p className="text-gray-500 text-sm">Click "Add Experience" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};