import React, { useState, useCallback } from 'react';
import { PublicProfileData } from '../../types/profile.types';
import { ValidationError } from '../types/creator.types';

interface ProfileEditorProps {
  profileData: Partial<PublicProfileData>;
  onUpdate: (updates: Partial<PublicProfileData>) => void;
  validationErrors?: ValidationError[];
  className?: string;
}

type EditorSection = 'basic' | 'about' | 'experience' | 'skills' | 'portfolio' | 'contact';

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profileData,
  onUpdate,
  validationErrors = [],
  className = '',
}) => {
  const [activeSection, setActiveSection] = useState<EditorSection>('basic');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const sections = [
    { id: 'basic' as EditorSection, label: 'Basic Info', icon: '👤', required: true },
    { id: 'about' as EditorSection, label: 'About', icon: '📝', required: true },
    { id: 'experience' as EditorSection, label: 'Experience', icon: '💼', required: false },
    { id: 'skills' as EditorSection, label: 'Skills', icon: '⚡', required: false },
    { id: 'portfolio' as EditorSection, label: 'Portfolio', icon: '🎨', required: false },
    { id: 'contact' as EditorSection, label: 'Contact', icon: '📞', required: false },
  ];

  const getFieldError = useCallback((fieldName: string) => {
    return validationErrors.find(error => error.field === fieldName);
  }, [validationErrors]);

  const handleFieldChange = useCallback((field: keyof PublicProfileData, value: any) => {
    onUpdate({ [field]: value });
  }, [onUpdate]);

  const handleArrayFieldAdd = useCallback((field: keyof PublicProfileData, item: any) => {
    const currentArray = (profileData[field] as any[]) || [];
    handleFieldChange(field, [...currentArray, item]);
  }, [profileData, handleFieldChange]);

  const handleArrayFieldUpdate = useCallback((field: keyof PublicProfileData, index: number, item: any) => {
    const currentArray = (profileData[field] as any[]) || [];
    const updatedArray = [...currentArray];
    updatedArray[index] = item;
    handleFieldChange(field, updatedArray);
  }, [profileData, handleFieldChange]);

  const handleArrayFieldRemove = useCallback((field: keyof PublicProfileData, index: number) => {
    const currentArray = (profileData[field] as any[]) || [];
    const updatedArray = currentArray.filter((_, i) => i !== index);
    handleFieldChange(field, updatedArray);
  }, [profileData, handleFieldChange]);

  return (
    <div className={`profile-editor flex h-full ${className}`}>
      {/* Section Navigation */}
      <div className="w-64 border-r bg-gray-50 p-4">
        <div className="space-y-2">
          {sections.map((section) => {
            const hasError = validationErrors.some(error =>
              error.field.startsWith(section.id) ||
              (section.id === 'basic' && ['name', 'title'].includes(error.field))
            );

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{section.label}</div>
                  {section.required && (
                    <div className="text-xs text-red-500">Required</div>
                  )}
                </div>
                {hasError && (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Editor */}
      <div className="flex-1 overflow-auto p-6">
        {/* Basic Information */}
        {activeSection === 'basic' && (
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
        )}

        {/* About Section */}
        {activeSection === 'about' && (
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
        )}

        {/* Experience Section */}
        {activeSection === 'experience' && (
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
        )}

        {/* Skills Section */}
        {activeSection === 'skills' && (
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
        )}

        {/* Portfolio Section */}
        {activeSection === 'portfolio' && (
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
        )}

        {/* Contact Section */}
        {activeSection === 'contact' && (
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
        )}
      </div>
    </div>
  );
};