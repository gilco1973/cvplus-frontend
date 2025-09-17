/**
 * LivePreview EditorPanel Component
 *
 * Real-time CV content editor with tabbed interface
 */

import React, { useState } from 'react';
import { User, Edit3, Plus } from 'lucide-react';

interface EditorPanelProps {
  cvData: any;
  onDataChange: (data: any) => void;
}

export const LivePreviewEditor: React.FC<EditorPanelProps> = ({
  cvData,
  onDataChange
}) => {
  const [activeSection, setActiveSection] = useState('personal');

  const updateField = (section: string, field: string, value: any) => {
    const updated = { ...cvData };
    if (!updated[section]) updated[section] = {};
    updated[section][field] = value;
    onDataChange(updated);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex border-b">
        {[
          { id: 'personal', label: 'Personal', icon: User },
          { id: 'summary', label: 'Summary', icon: Edit3 },
          { id: 'experience', label: 'Experience', icon: Plus }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm border-b-2 ${
              activeSection === id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeSection === 'personal' && (
          <>
            <input
              type="text"
              value={cvData.personalInfo?.name || ''}
              onChange={(e) => updateField('personalInfo', 'name', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Full Name"
            />
            <input
              type="email"
              value={cvData.personalInfo?.email || ''}
              onChange={(e) => updateField('personalInfo', 'email', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Email"
            />
            <input
              type="tel"
              value={cvData.personalInfo?.phone || ''}
              onChange={(e) => updateField('personalInfo', 'phone', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Phone"
            />
            <input
              type="text"
              value={cvData.personalInfo?.location || ''}
              onChange={(e) => updateField('personalInfo', 'location', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Location"
            />
          </>
        )}

        {activeSection === 'summary' && (
          <textarea
            value={cvData.summary || ''}
            onChange={(e) => updateField('summary', '', e.target.value)}
            rows={6}
            className="w-full p-2 border rounded resize-vertical"
            placeholder="Professional summary..."
          />
        )}

        {activeSection === 'experience' && (
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              <Plus className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Experience editing coming soon...</p>
              <p className="text-sm">This section will allow adding/editing work experience</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};