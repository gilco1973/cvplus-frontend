import { useState, useEffect, useCallback } from 'react';
import type { Job } from '../../services/cvService';
import type { CVPreviewState, QRCodeSettings } from '../../types/cv-preview';
import { hasPlaceholders } from '../../utils/placeholderDetection';

export const useCVPreview = (
  job: Job,
  appliedImprovements?: unknown,
  onUpdate?: (updates: Partial<Job['parsedData']>) => void
) => {
  // Initialize base data
  const baseData = appliedImprovements || job.parsedData;

  // Core state
  const [isEditing, setIsEditing] = useState(false);
  const [showFeaturePreviews, setShowFeaturePreviews] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  // Debug logging for feature previews state
  console.warn(`🔍 [CV PREVIEW STATE] showFeaturePreviews: ${showFeaturePreviews}, jobId: ${job.id}`);
  const [isEditingQRCode, setIsEditingQRCode] = useState(false);
  const [showPreviewBanner, setShowPreviewBanner] = useState(true);
  const [showPlaceholderBanner, setShowPlaceholderBanner] = useState(true);
  const [previewData, setPreviewData] = useState(baseData);
  
  // Auto-save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // UI state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // QR Code settings
  const [qrCodeSettings, setQrCodeSettings] = useState<QRCodeSettings>(() => {
    const savedSettings = (job.parsedData as unknown)?.qrCodeSettings;
    return savedSettings || {
      url: `https://getmycv-ai.web.app/cv/${job.id}`,
      type: 'profile' as const,
      customText: 'View my Professional CV'
    };
  });

  // Update preview data when improvements change
  useEffect(() => {
    const newBaseData = appliedImprovements || job.parsedData;
    setPreviewData(newBaseData);
    
    // Check for placeholders and show banner if needed
    if (newBaseData && hasPlaceholders(newBaseData)) {
      setShowPlaceholderBanner(true);
    } else {
      setShowPlaceholderBanner(false);
    }
  }, [appliedImprovements, job.parsedData]);

  // Toggle editing mode
  const toggleEditing = useCallback(() => {
    setIsEditing(prev => !prev);
    if (editingSection) {
      setEditingSection(null);
    }
  }, [editingSection]);

  // Toggle feature previews
  const toggleFeaturePreviews = useCallback(() => {
    setShowFeaturePreviews(prev => !prev);
  }, []);

  // Toggle auto-save
  const toggleAutoSave = useCallback(() => {
    setAutoSaveEnabled(prev => !prev);
  }, []);

  // Close preview banner
  const closeBanner = useCallback(() => {
    setShowPreviewBanner(false);
  }, []);

  // Close placeholder banner
  const closePlaceholderBanner = useCallback(() => {
    setShowPlaceholderBanner(false);
  }, []);

  // Start editing (can be triggered by placeholder banner)
  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Section collapse management
  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  const expandAllSections = useCallback(() => {
    setCollapsedSections({});
  }, []);

  const collapseAllSections = useCallback(() => {
    const allSections = [
      'summary', 'experience', 'education', 'skills', 
      'interactive-timeline', 'skills-chart', 'language-proficiency', 
      'certification-badges', 'social-media-links', 'achievements-showcase',
      'qr-code', 'contact-form', 'podcast', 'video-introduction',
      'portfolio-gallery', 'testimonials-carousel', 'availability-calendar',
      'ats-optimization', 'keyword-enhancement', 'achievement-highlighting',
      'skills-visualization', 'privacy-mode'
    ];
    
    const collapsed: Record<string, boolean> = {};
    allSections.forEach(section => {
      collapsed[section] = true;
    });
    setCollapsedSections(collapsed);
  }, []);

  // Section editing
  const handleSectionEdit = useCallback((section: string, newValue: unknown) => {
    const updatedData = { ...previewData };
    
    switch (section) {
      case 'personalInfo': {
        // Safe spreading with type checks
        const currentPersonalInfo = (updatedData.personalInfo && typeof updatedData.personalInfo === 'object') 
          ? updatedData.personalInfo as Record<string, any> 
          : {};
        const newPersonalInfo = (newValue && typeof newValue === 'object') 
          ? newValue as Record<string, any> 
          : {};
        updatedData.personalInfo = { ...currentPersonalInfo, ...newPersonalInfo };
        break;
      }
      case 'summary':
        updatedData.summary = newValue;
        break;
      case 'experience':
        updatedData.experience = newValue;
        break;
      case 'education':
        updatedData.education = newValue;
        break;
      case 'skills': {
        // Safe spreading with type checks for skills data
        const currentSkills = (updatedData.skills && typeof updatedData.skills === 'object') 
          ? updatedData.skills as Record<string, any> 
          : {};
        const newSkills = (newValue && typeof newValue === 'object') 
          ? newValue as Record<string, any> 
          : {};
        updatedData.skills = { ...currentSkills, ...newSkills };
        break;
      }
    }
    
    setPreviewData(updatedData);
    setHasUnsavedChanges(true);
    setEditingSection(null);
    setIsEditing(false);

    // Trigger callback for parent component
    if (onUpdate) {
      onUpdate(updatedData);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
  }, [previewData, onUpdate]);

  // QR Code settings management
  const handleQRCodeUpdate = useCallback((newSettings: QRCodeSettings) => {
    setQrCodeSettings(newSettings);
    setHasUnsavedChanges(true);
    
    const updatedData = { ...previewData, qrCodeSettings: newSettings };
    
    if (onUpdate) {
      onUpdate(updatedData);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
    
    setIsEditingQRCode(false);
  }, [previewData, onUpdate]);

  // Start editing QR code
  const startEditingQRCode = useCallback(() => {
    setIsEditingQRCode(true);
  }, []);

  // Start editing section
  const startEditingSection = useCallback((section: string) => {
    setEditingSection(section);
    setIsEditing(true);
  }, []);

  const state: CVPreviewState = {
    isEditing,
    showFeaturePreviews,
    editingSection,
    isEditingQRCode,
    showPreviewBanner,
    showPlaceholderBanner,
    previewData,
    hasUnsavedChanges,
    autoSaveEnabled,
    lastSaved,
    collapsedSections
  };

  const actions = {
    toggleEditing,
    toggleFeaturePreviews,
    toggleAutoSave,
    closeBanner,
    closePlaceholderBanner,
    startEditing,
    toggleSection,
    expandAllSections,
    collapseAllSections,
    handleSectionEdit,
    handleQRCodeUpdate,
    startEditingQRCode,
    startEditingSection,
    setEditingSection
  };

  const settings = {
    qrCodeSettings,
    setQrCodeSettings
  };

  return {
    state,
    actions,
    settings
  };
};