import React from 'react';
import { PublicProfileData } from '../../../types/profile.types';

interface PortfolioSectionProps {
  profileData: Partial<PublicProfileData>;
  onUpdate: (updates: Partial<PublicProfileData>) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
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
        <h2 className="text-xl font-semibold text-gray-900">Portfolio</h2>
        <button
          onClick={() => handleArrayFieldAdd('portfolio', {
            id: Date.now().toString(),
            title: '',
            description: '',
            url: '',
            imageUrl: '',
            technologies: [],
          })}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Project
        </button>
      </div>

      <div className="space-y-6">
        {(profileData.portfolio || []).map((item, index) => (
          <div key={item.id || index} className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Project #{index + 1}</h3>
              <button
                onClick={() => handleArrayFieldRemove('portfolio', index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => handleArrayFieldUpdate('portfolio', index, { ...item, title: e.target.value })}
                placeholder="Project Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <textarea
                value={item.description || ''}
                onChange={(e) => handleArrayFieldUpdate('portfolio', index, { ...item, description: e.target.value })}
                rows={3}
                placeholder="Project description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  value={item.url || ''}
                  onChange={(e) => handleArrayFieldUpdate('portfolio', index, { ...item, url: e.target.value })}
                  placeholder="Project URL"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="url"
                  value={item.imageUrl || ''}
                  onChange={(e) => handleArrayFieldUpdate('portfolio', index, { ...item, imageUrl: e.target.value })}
                  placeholder="Image URL"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ))}

        {(!profileData.portfolio || profileData.portfolio.length === 0) && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-400 text-4xl mb-2">🎨</div>
            <p className="text-gray-600">No portfolio items added yet</p>
            <p className="text-gray-500 text-sm">Click "Add Project" to showcase your work</p>
          </div>
        )}
      </div>
    </div>
  );
};