import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';

// Define proper types for CV sections
interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface Experience {
  position?: string;
  company?: string;
  duration?: string;
  description?: string;
  achievements?: string[];
}

interface Education {
  degree?: string;
  institution?: string;
  year?: string;
}

interface Skills {
  technical?: string[];
  soft?: string[];
}

type CVSectionData = PersonalInfo | string | Experience[] | Education[] | Skills;

interface SectionEditorProps {
  section: string;
  data: CVSectionData;
  onSave: (section: string, newValue: CVSectionData) => void;
  onCancel: () => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  data,
  onSave,
  onCancel
}) => {
  const [editingData, setEditingData] = useState(data);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditingData(data);
    setHasChanges(false);
  }, [data]);

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(editingData) !== JSON.stringify(data));
  }, [editingData, data]);

  // Keyboard shortcuts for editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave(section, editingData);
      }
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingData, onSave, onCancel, section]);

  const handleInputChange = (field: string, value: string) => {
    setEditingData((prev: CVSectionData) => {
      if (typeof prev === 'object' && prev !== null && !Array.isArray(prev)) {
        return {
          ...prev,
          [field]: value
        };
      }
      return prev;
    });
  };


  const handleArrayAdd = (arrayPath: string) => {
    setEditingData((prev: CVSectionData) => {
      if (section === 'experience' && Array.isArray(prev)) {
        const newData = [...prev] as Experience[];
        newData.push({
          position: '',
          company: '',
          duration: '',
          description: '',
          achievements: []
        });
        return newData;
      } else if (section === 'education' && Array.isArray(prev)) {
        const newData = [...prev] as Education[];
        newData.push({
          degree: '',
          institution: '',
          year: ''
        });
        return newData;
      } else if (section === 'skills' && typeof prev === 'object' && prev !== null && !Array.isArray(prev)) {
        const skillsData = prev as Skills;
        if (arrayPath === 'technical') {
          return {
            ...skillsData,
            technical: [...(skillsData.technical || []), '']
          };
        } else if (arrayPath === 'soft') {
          return {
            ...skillsData,
            soft: [...(skillsData.soft || []), '']
          };
        }
      }
      return prev;
    });
  };

  const handleArrayRemove = (arrayPath: string, index: number) => {
    setEditingData((prev: CVSectionData) => {
      if (section === 'experience' && Array.isArray(prev)) {
        const newData = [...prev] as Experience[];
        newData.splice(index, 1);
        return newData;
      } else if (section === 'education' && Array.isArray(prev)) {
        const newData = [...prev] as Education[];
        newData.splice(index, 1);
        return newData;
      } else if (section === 'skills' && typeof prev === 'object' && prev !== null && !Array.isArray(prev)) {
        const skillsData = prev as Skills;
        if (arrayPath === 'technical') {
          const newTechnical = [...(skillsData.technical || [])];
          newTechnical.splice(index, 1);
          return {
            ...skillsData,
            technical: newTechnical
          };
        } else if (arrayPath === 'soft') {
          const newSoft = [...(skillsData.soft || [])];
          newSoft.splice(index, 1);
          return {
            ...skillsData,
            soft: newSoft
          };
        }
      }
      return prev;
    });
  };

  const handleArrayItemChange = (arrayPath: string, index: number, field: string | null, value: string | string[]) => {
    setEditingData((prev: CVSectionData) => {
      if (section === 'experience' && Array.isArray(prev)) {
        const newData = [...prev] as Experience[];
        if (field && typeof value === 'string') {
          newData[index] = {
            ...newData[index],
            [field]: value
          };
        } else if (field === 'achievements' && Array.isArray(value)) {
          newData[index] = {
            ...newData[index],
            achievements: value
          };
        }
        return newData;
      } else if (section === 'education' && Array.isArray(prev)) {
        const newData = [...prev] as Education[];
        if (field && typeof value === 'string') {
          newData[index] = {
            ...newData[index],
            [field]: value
          };
        }
        return newData;
      } else if (section === 'skills' && typeof prev === 'object' && prev !== null && !Array.isArray(prev)) {
        const skillsData = prev as Skills;
        if (arrayPath === 'technical' && typeof value === 'string') {
          const newTechnical = [...(skillsData.technical || [])];
          newTechnical[index] = value;
          return {
            ...skillsData,
            technical: newTechnical
          };
        } else if (arrayPath === 'soft' && typeof value === 'string') {
          const newSoft = [...(skillsData.soft || [])];
          newSoft[index] = value;
          return {
            ...skillsData,
            soft: newSoft
          };
        }
      }
      return prev;
    });
  };

  const renderPersonalInfoEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
        <input
          type="text"
          value={(editingData as PersonalInfo)?.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input
          type="email"
          value={(editingData as PersonalInfo)?.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
        <input
          type="tel"
          value={(editingData as PersonalInfo)?.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
        <input
          type="text"
          value={(editingData as PersonalInfo)?.location || ''}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
    </div>
  );

  const renderSummaryEditor = () => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">Professional Summary</label>
      <textarea
        value={(editingData as string) || ''}
        onChange={(e) => setEditingData(e.target.value)}
        rows={6}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-vertical"
        placeholder="Write a compelling professional summary..."
      />
    </div>
  );

  const renderExperienceEditor = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-200">Experience Entries</h4>
        <button
          onClick={() => handleArrayAdd('experience')}
          className="flex items-center gap-2 px-3 py-1 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Position
        </button>
      </div>
      
      {((editingData as Experience[]) || []).map((exp: Experience, index: number) => (
        <div key={index} className="border border-gray-600 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-gray-200">Position {index + 1}</h5>
            <button
              onClick={() => handleArrayRemove('experience', index)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Position Title</label>
              <input
                type="text"
                value={exp.position || ''}
                onChange={(e) => handleArrayItemChange('experience', index, 'position', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
              <input
                type="text"
                value={exp.company || ''}
                onChange={(e) => handleArrayItemChange('experience', index, 'company', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
            <input
              type="text"
              value={exp.duration || ''}
              onChange={(e) => handleArrayItemChange('experience', index, 'duration', e.target.value)}
              placeholder="e.g., Jan 2020 - Present"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={exp.description || ''}
              onChange={(e) => handleArrayItemChange('experience', index, 'description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-vertical"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Achievements</label>
              <button
                onClick={() => {
                  if (!exp.achievements) exp.achievements = [];
                  handleArrayItemChange('experience', index, 'achievements', [...exp.achievements, '']);
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {(exp.achievements || []).map((achievement: string, achIndex: number) => (
              <div key={achIndex} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => {
                    const newAchievements = [...(exp.achievements || [])];
                    newAchievements[achIndex] = e.target.value;
                    handleArrayItemChange('experience', index, 'achievements', newAchievements);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Describe an achievement..."
                />
                <button
                  onClick={() => {
                    const newAchievements = [...(exp.achievements || [])];
                    newAchievements.splice(achIndex, 1);
                    handleArrayItemChange('experience', index, 'achievements', newAchievements);
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderEducationEditor = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-200">Education Entries</h4>
        <button
          onClick={() => handleArrayAdd('education')}
          className="flex items-center gap-2 px-3 py-1 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>
      
      {((editingData as Education[]) || []).map((edu: Education, index: number) => (
        <div key={index} className="border border-gray-600 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-gray-200">Education {index + 1}</h5>
            <button
              onClick={() => handleArrayRemove('education', index)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Degree</label>
            <input
              type="text"
              value={edu.degree || ''}
              onChange={(e) => handleArrayItemChange('education', index, 'degree', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Institution</label>
            <input
              type="text"
              value={edu.institution || ''}
              onChange={(e) => handleArrayItemChange('education', index, 'institution', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
            <input
              type="text"
              value={edu.year || ''}
              onChange={(e) => handleArrayItemChange('education', index, 'year', e.target.value)}
              placeholder="e.g., 2020 or 2018-2022"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkillsEditor = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-300">Technical Skills</label>
          <button
            onClick={() => handleArrayAdd('technical')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {((editingData as Skills)?.technical || []).map((skill: string, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={skill}
              onChange={(e) => handleArrayItemChange('technical', index, null, e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={() => handleArrayRemove('technical', index)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-300">Soft Skills</label>
          <button
            onClick={() => handleArrayAdd('soft')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {((editingData as Skills)?.soft || []).map((skill: string, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={skill}
              onChange={(e) => handleArrayItemChange('soft', index, null, e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={() => handleArrayRemove('soft', index)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEditor = () => {
    switch (section) {
      case 'personalInfo':
        return renderPersonalInfoEditor();
      case 'summary':
        return renderSummaryEditor();
      case 'experience':
        return renderExperienceEditor();
      case 'education':
        return renderEducationEditor();
      case 'skills':
        return renderSkillsEditor();
      default:
        return <div className="text-gray-400">No editor available for this section.</div>;
    }
  };

  return (
    <div className="space-y-6">
      {renderEditor()}
      
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={() => onSave(section, editingData)}
          disabled={!hasChanges}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            hasChanges 
              ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {hasChanges ? 'Save Changes' : 'No Changes'}
        </button>
      </div>
    </div>
  );
};