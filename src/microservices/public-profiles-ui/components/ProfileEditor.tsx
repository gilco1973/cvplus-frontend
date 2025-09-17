import React, { useState, useCallback } from 'react';
import { PublicProfileData } from '../../types/profile.types';
import { ValidationError } from '../types/creator.types';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { AboutSection } from './sections/AboutSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { SkillsSection } from './sections/SkillsSection';
import { PortfolioSection } from './sections/PortfolioSection';
import { ContactSection } from './sections/ContactSection';

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

  const renderActiveSection = () => {
    const commonProps = { profileData, onUpdate };

    switch (activeSection) {
      case 'basic':
        return <BasicInfoSection {...commonProps} getFieldError={getFieldError} />;
      case 'about':
        return <AboutSection {...commonProps} />;
      case 'experience':
        return <ExperienceSection {...commonProps} />;
      case 'skills':
        return <SkillsSection {...commonProps} />;
      case 'portfolio':
        return <PortfolioSection {...commonProps} />;
      case 'contact':
        return <ContactSection {...commonProps} getFieldError={getFieldError} />;
      default:
        return <BasicInfoSection {...commonProps} getFieldError={getFieldError} />;
    }
  };

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
        {renderActiveSection()}
      </div>
    </div>
  );
};