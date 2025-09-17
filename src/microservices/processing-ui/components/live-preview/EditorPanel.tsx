/**
 * EditorPanel Component
 *
 * Real-time CV content editor with live preview synchronization
 */

import React, { useState, useCallback } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Plus, Trash2 } from 'lucide-react';
import { EditorPanelProps } from './types';

export const EditorPanel: React.FC<EditorPanelProps> = ({
  cvData,
  onDataChange,
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState<string>('personal');

  const updatePersonalInfo = useCallback((field: string, value: string) => {
    const updated = {
      ...cvData,
      personalInfo: {
        ...cvData.personalInfo,
        [field]: value
      }
    };
    onDataChange(updated);
  }, [cvData, onDataChange]);

  const updateSummary = useCallback((value: string) => {
    const updated = {
      ...cvData,
      summary: value
    };
    onDataChange(updated);
  }, [cvData, onDataChange]);

  const updateExperience = useCallback((index: number, field: string, value: string) => {
    const updated = { ...cvData };
    if (!updated.experience) updated.experience = [];
    if (!updated.experience[index]) updated.experience[index] = {};

    updated.experience[index][field] = value;
    onDataChange(updated);
  }, [cvData, onDataChange]);

  const addExperience = useCallback(() => {
    const updated = {
      ...cvData,
      experience: [
        ...(cvData.experience || []),
        {
          company: '',
          position: '',
          duration: '',
          description: ''
        }
      ]
    };
    onDataChange(updated);
  }, [cvData, onDataChange]);

  const removeExperience = useCallback((index: number) => {
    const updated = {
      ...cvData,
      experience: (cvData.experience || []).filter((_: any, i: number) => i !== index)
    };
    onDataChange(updated);
  }, [cvData, onDataChange]);

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'summary', label: 'Summary', icon: Edit3 },
    { id: 'experience', label: 'Experience', icon: Plus },
  ];

  const renderPersonalInfoEditor = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="inline w-4 h-4 mr-1" />
            Full Name
          </label>
          <input
            type="text"
            value={cvData.personalInfo?.name || ''}
            onChange={(e) => updatePersonalInfo('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="inline w-4 h-4 mr-1" />
            Email
          </label>
          <input
            type="email"
            value={cvData.personalInfo?.email || ''}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="inline w-4 h-4 mr-1" />
            Phone
          </label>
          <input
            type="tel"
            value={cvData.personalInfo?.phone || ''}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline w-4 h-4 mr-1" />
            Location
          </label>
          <input
            type="text"
            value={cvData.personalInfo?.location || ''}
            onChange={(e) => updatePersonalInfo('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="City, Country"
          />
        </div>
      </div>
    </div>
  );

  const renderSummaryEditor = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Professional Summary</h3>
      <div>
        <textarea
          value={cvData.summary || ''}
          onChange={(e) => updateSummary(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          placeholder="Write a brief summary of your professional background, key skills, and career objectives..."
        />
      </div>
    </div>
  );

  const renderExperienceEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
        <button
          onClick={addExperience}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

      {cvData.experience && cvData.experience.length > 0 ? (
        <div className="space-y-6">
          {cvData.experience.map((exp: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
              <button
                onClick={() => removeExperience(index)}
                className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded"
                title="Remove this experience"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={exp.position || ''}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={exp.company || ''}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={exp.duration || ''}
                  onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Jan 2020 - Present"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={exp.description || ''}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder="Describe your role, responsibilities, and achievements..."
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Plus className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No work experience added yet</p>
          <p className="text-sm">Click "Add Experience" to get started</p>
        </div>
      )}
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalInfoEditor();
      case 'summary':
        return renderSummaryEditor();
      case 'experience':
        return renderExperienceEditor();
      default:
        return renderPersonalInfoEditor();
    }
  };

  return (
    <div className={`editor-panel flex flex-col h-full ${className}`}>
      {/* Section Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeSection === section.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {renderActiveSection()}
      </div>
    </div>
  );
};