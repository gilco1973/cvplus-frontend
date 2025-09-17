import React, { useState, useCallback } from 'react';
import { usePublicProfileCreator } from '../hooks/usePublicProfileCreator';
import { TemplateSelector } from './TemplateSelector';
import { ProfileEditor } from './ProfileEditor';
import { PreviewPanel } from './PreviewPanel';
import { StepNavigation } from './StepNavigation';
import { NavigationFooter } from './NavigationFooter';
import { PublicProfileCreatorProps } from '../types/creator.types';
import { PublicProfileData } from '../../types/profile.types';

type CreatorStep = 'template' | 'editor' | 'preview' | 'settings' | 'export';

export const PublicProfileCreator: React.FC<PublicProfileCreatorProps> = ({
  userId,
  existingProfile,
  onSave,
  onCancel,
  onExport,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState<CreatorStep>('template');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    state,
    updateProfileData,
    selectTemplate,
    updateBrandingSettings,
    exportProfile,
    isValid,
    hasWarnings,
  } = usePublicProfileCreator({
    userId,
    existingProfile,
    autoSave: false,
  });

  const steps: CreatorStep[] = ['template', 'editor', 'preview', 'settings', 'export'];

  const handleNext = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  }, [currentStep, steps]);

  const handlePrevious = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep, steps]);

  const handleStepClick = useCallback((step: CreatorStep) => {
    const stepIndex = steps.indexOf(step);
    const currentIndex = steps.indexOf(currentStep);
    if (stepIndex <= currentIndex || stepIndex <= 1) {
      setCurrentStep(step);
    }
  }, [currentStep, steps]);

  const handleSave = useCallback(async () => {
    if (!isValid) {
      setSaveError('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const profileData: PublicProfileData = {
        ...existingProfile,
        ...state.profileData,
        id: existingProfile?.id || `profile-${Date.now()}`,
        userId,
        slug: state.profileData.slug || `user-${userId}`,
        isPublic: state.profileData.isPublic ?? true,
        createdAt: existingProfile?.createdAt || new Date(),
        updatedAt: new Date(),
      } as PublicProfileData;

      await onSave(profileData);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  }, [isValid, state.profileData, existingProfile, userId, onSave]);

  const canProceedToNext = useCallback(() => {
    switch (currentStep) {
      case 'template':
        return !!state.selectedTemplate;
      case 'editor':
        return !!(state.profileData.name && state.profileData.title);
      default:
        return true;
    }
  }, [currentStep, state.selectedTemplate, state.profileData]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'template':
        return (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Template</h2>
                <p className="text-gray-600">Select a professional template that matches your style and industry.</p>
              </div>
              <TemplateSelector
                onTemplateSelect={selectTemplate}
                selectedTemplate={state.selectedTemplate}
                showPremiumTemplates={true}
              />
            </div>
          </div>
        );

      case 'editor':
        return (
          <div className="h-full flex">
            <div className="flex-1 overflow-auto">
              <ProfileEditor
                profileData={state.profileData}
                onUpdate={updateProfileData}
                validationErrors={state.validationErrors}
                className="h-full"
              />
            </div>
            <div className="w-96 border-l bg-gray-50">
              <PreviewPanel
                profileData={state.profileData}
                template={state.selectedTemplate}
                branding={state.brandingSettings}
                className="h-full"
              />
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="h-full">
            <PreviewPanel
              profileData={state.profileData}
              template={state.selectedTemplate}
              branding={state.brandingSettings}
              fullScreen={true}
              className="h-full"
            />
          </div>
        );

      case 'settings':
        return (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Branding & Appearance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                      <input
                        type="color"
                        value={state.brandingSettings.primaryColor}
                        onChange={(e) => updateBrandingSettings({ primaryColor: e.target.value })}
                        className="w-full h-10 rounded border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                      <input
                        type="color"
                        value={state.brandingSettings.secondaryColor}
                        onChange={(e) => updateBrandingSettings({ secondaryColor: e.target.value })}
                        className="w-full h-10 rounded border border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Export & Share</h2>
                <p className="text-gray-600">Choose how you want to share your professional profile.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border p-6 text-center">
                  <div className="text-3xl mb-4">🔗</div>
                  <h3 className="font-semibold mb-2">Public URL</h3>
                  <p className="text-gray-600 text-sm mb-4">Share your profile with a public link</p>
                  <button
                    onClick={() => exportProfile(state.exportOptions)}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  >
                    Generate URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`public-profile-creator flex flex-col h-full ${className}`}>
      <StepNavigation
        currentStep={currentStep}
        onStepClick={handleStepClick}
        onCancel={onCancel}
      />

      <div className="flex-1 overflow-hidden">
        {renderStepContent()}
      </div>

      <NavigationFooter
        currentStep={currentStep}
        canProceed={canProceedToNext()}
        isValid={isValid}
        hasWarnings={hasWarnings}
        isDirty={state.isDirty}
        isSaving={isSaving}
        saveError={saveError}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSave={handleSave}
      />
    </div>
  );
};