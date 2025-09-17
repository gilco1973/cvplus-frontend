import React, { useState, useCallback, useEffect } from 'react';
import { usePublicProfileCreator } from '../hooks/usePublicProfileCreator';
import { TemplateSelector } from './TemplateSelector';
import { ProfileEditor } from './ProfileEditor';
import { PreviewPanel } from './PreviewPanel';
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
    setEditingMode,
    updatePreviewConfig,
    exportProfile,
    saveProfile,
    resetProfile,
    isValid,
    hasWarnings,
  } = usePublicProfileCreator({
    userId,
    existingProfile,
    autoSave: false,
  });

  // Step navigation
  const steps: { id: CreatorStep; label: string; icon: string }[] = [
    { id: 'template', label: 'Template', icon: '🎨' },
    { id: 'editor', label: 'Content', icon: '✏️' },
    { id: 'preview', label: 'Preview', icon: '👀' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'export', label: 'Export', icon: '🚀' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  }, [currentStepIndex, steps]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  }, [currentStepIndex, steps]);

  const handleStepClick = useCallback((step: CreatorStep) => {
    // Allow navigation to completed steps or current step
    const stepIndex = steps.findIndex(s => s.id === step);
    if (stepIndex <= currentStepIndex || stepIndex <= 1) {
      setCurrentStep(step);
    }
  }, [currentStepIndex, steps]);

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

  const handleExport = useCallback(async () => {
    try {
      const exportUrl = await exportProfile(state.exportOptions);
      await onExport(state.exportOptions);
      return exportUrl;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, [exportProfile, state.exportOptions, onExport]);

  // Determine if next button should be enabled
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

  return (
    <div className={`public-profile-creator flex flex-col h-full ${className}`}>
      {/* Header with Steps */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Create Public Profile</h1>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 cursor-pointer ${
                index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
              }`}
              onClick={() => handleStepClick(step.id)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : index === currentStepIndex
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {index < currentStepIndex ? '✓' : step.icon}
              </div>
              <span className={`hidden sm:inline text-sm font-medium ${
                index === currentStepIndex ? 'text-blue-600' : ''
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block w-8 h-0.5 ${
                  index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Template Selection */}
        {currentStep === 'template' && (
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
        )}

        {/* Content Editor */}
        {currentStep === 'editor' && (
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
        )}

        {/* Preview Mode */}
        {currentStep === 'preview' && (
          <div className="h-full">
            <PreviewPanel
              profileData={state.profileData}
              template={state.selectedTemplate}
              branding={state.brandingSettings}
              fullScreen={true}
              className="h-full"
            />
          </div>
        )}

        {/* Settings & Branding */}
        {currentStep === 'settings' && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>

                {/* Branding Settings */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Branding & Appearance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <input
                        type="color"
                        value={state.brandingSettings.primaryColor}
                        onChange={(e) => updateBrandingSettings({ primaryColor: e.target.value })}
                        className="w-full h-10 rounded border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Color
                      </label>
                      <input
                        type="color"
                        value={state.brandingSettings.secondaryColor}
                        onChange={(e) => updateBrandingSettings({ secondaryColor: e.target.value })}
                        className="w-full h-10 rounded border border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">SEO & Visibility</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={state.profileData.isPublic ? 'public' : 'private'}
                        onChange={(e) => updateProfileData({ isPublic: e.target.value === 'public' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="public">Public - Visible to everyone</option>
                        <option value="private">Private - Only accessible via direct link</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export & Share */}
        {currentStep === 'export' && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Export & Share</h2>
                <p className="text-gray-600">Choose how you want to share your professional profile.</p>
              </div>

              {/* Export Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border p-6 text-center">
                  <div className="text-3xl mb-4">🔗</div>
                  <h3 className="font-semibold mb-2">Public URL</h3>
                  <p className="text-gray-600 text-sm mb-4">Share your profile with a public link</p>
                  <button
                    onClick={handleExport}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  >
                    Generate URL
                  </button>
                </div>

                <div className="bg-white rounded-lg border p-6 text-center">
                  <div className="text-3xl mb-4">📄</div>
                  <h3 className="font-semibold mb-2">PDF Export</h3>
                  <p className="text-gray-600 text-sm mb-4">Download as a PDF document</p>
                  <button
                    onClick={() => console.log('PDF export')}
                    className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                  >
                    Download PDF
                  </button>
                </div>

                <div className="bg-white rounded-lg border p-6 text-center">
                  <div className="text-3xl mb-4">📱</div>
                  <h3 className="font-semibold mb-2">QR Code</h3>
                  <p className="text-gray-600 text-sm mb-4">Generate QR code for easy sharing</p>
                  <button
                    onClick={() => console.log('QR code')}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                  >
                    Generate QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Navigation */}
      <div className="border-t bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasWarnings && (
              <span className="text-yellow-600 text-sm">⚠️ Has warnings</span>
            )}
            {!isValid && (
              <span className="text-red-600 text-sm">❌ Validation errors</span>
            )}
            {state.isDirty && (
              <span className="text-blue-600 text-sm">📝 Unsaved changes</span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Previous
              </button>
            )}

            {currentStepIndex < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className={`px-6 py-2 rounded font-medium ${
                  canProceedToNext()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!isValid || isSaving}
                className={`px-6 py-2 rounded font-medium ${
                  isValid && !isSaving
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            )}
          </div>
        </div>

        {saveError && (
          <div className="mt-2 text-red-600 text-sm">{saveError}</div>
        )}
      </div>
    </div>
  );
};