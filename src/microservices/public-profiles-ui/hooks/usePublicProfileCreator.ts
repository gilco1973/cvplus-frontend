// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts
import {
  PublicProfileCreatorState,
  TemplateConfiguration,
  BrandingSettings,
  ValidationError,
  ExportOptions,
} from '../types/creator.types';
import { PublicProfileData } from '../../types/profile.types';

interface UsePublicProfileCreatorOptions {
  userId: string;
  existingProfile?: PublicProfileData;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export const usePublicProfileCreator = ({
  userId,
  existingProfile,
  autoSave = false,
  autoSaveDelay = 3000,
}: UsePublicProfileCreatorOptions) => {
  const autoSaveTimeout = useRef<NodeJS.Timeout>();

  // Initialize state
  const [state, setState] = useState<PublicProfileCreatorState>({
    profileData: existingProfile || {},
    selectedTemplate: null,
    brandingSettings: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E293B',
      accentColor: '#F59E0B',
      fontFamily: 'Inter',
    },
    previewConfig: {
      device: 'desktop',
      zoom: 1,
      showGrid: false,
      showRulers: false,
    },
    isEditing: false,
    isDirty: false,
    validationErrors: [],
    exportOptions: {
      format: 'url',
      includeAnalytics: true,
      passwordProtected: false,
    },
  });

  // Validation rules
  const validateProfile = useCallback(
    (profileData: Partial<PublicProfileData>): ValidationError[] => {
      const errors: ValidationError[] = [];

      if (!profileData.name?.trim()) {
        errors.push({
          field: 'name',
          message: 'Name is required',
          severity: 'error',
        });
      }

      if (!profileData.title?.trim()) {
        errors.push({
          field: 'title',
          message: 'Professional title is required',
          severity: 'error',
        });
      }

      if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
        errors.push({
          field: 'email',
          message: 'Invalid email format',
          severity: 'error',
        });
      }

      if (profileData.website && !isValidUrl(profileData.website)) {
        errors.push({
          field: 'website',
          message: 'Invalid website URL',
          severity: 'error',
        });
      }

      return errors;
    },
    []
  );

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    if (autoSave && state.isDirty) {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
      autoSaveTimeout.current = setTimeout(() => {
        // Auto-save logic would go here
        console.log('Auto-saving profile...');
      }, autoSaveDelay);
    }
  }, [autoSave, autoSaveDelay, state.isDirty]);

  // Update profile data
  const updateProfileData = useCallback(
    (updates: Partial<PublicProfileData>) => {
      setState(prev => ({
        ...prev,
        profileData: { ...prev.profileData, ...updates },
        isDirty: true,
        validationErrors: validateProfile({
          ...prev.profileData,
          ...updates,
        }),
      }));
      triggerAutoSave();
    },
    [validateProfile, triggerAutoSave]
  );

  // Select template
  const selectTemplate = useCallback((template: TemplateConfiguration) => {
    setState(prev => ({
      ...prev,
      selectedTemplate: template,
      isDirty: true,
    }));
  }, []);

  // Update branding settings
  const updateBrandingSettings = useCallback(
    (updates: Partial<BrandingSettings>) => {
      setState(prev => ({
        ...prev,
        brandingSettings: { ...prev.brandingSettings, ...updates },
        isDirty: true,
      }));
      triggerAutoSave();
    },
    [triggerAutoSave]
  );

  // Toggle editing mode
  const setEditingMode = useCallback((editing: boolean) => {
    setState(prev => ({ ...prev, isEditing: editing }));
  }, []);

  // Update preview configuration
  const updatePreviewConfig = useCallback((device: 'desktop' | 'tablet' | 'mobile', zoom?: number) => {
    setState(prev => ({
      ...prev,
      previewConfig: {
        ...prev.previewConfig,
        device,
        ...(zoom && { zoom }),
      },
    }));
  }, []);

  // Export profile
  const exportProfile = useCallback(async (options: ExportOptions): Promise<string> => {
    setState(prev => ({ ...prev, exportOptions: options }));

    // Export logic would be implemented here
    // This would integrate with the export service
    const exportUrl = `https://profiles.cvplus.com/${state.profileData.slug}`;

    return exportUrl;
  }, [state.profileData.slug]);

  // Save profile
  const saveProfile = useCallback(async (): Promise<boolean> => {
    const errors = validateProfile(state.profileData);
    if (errors.length > 0) {
      setState(prev => ({ ...prev, validationErrors: errors }));
      return false;
    }

    try {
      // Save logic would be implemented here
      setState(prev => ({ ...prev, isDirty: false }));
      return true;
    } catch (error) {
      console.error('Failed to save profile:', error);
      return false;
    }
  }, [state.profileData, validateProfile]);

  // Reset to original state
  const resetProfile = useCallback(() => {
    setState(prev => ({
      ...prev,
      profileData: existingProfile || {},
      isDirty: false,
      validationErrors: [],
    }));
  }, [existingProfile]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, []);

  return {
    state,
    updateProfileData,
    selectTemplate,
    updateBrandingSettings,
    setEditingMode,
    updatePreviewConfig,
    exportProfile,
    saveProfile,
    resetProfile,
    isValid: state.validationErrors.filter(e => e.severity === 'error').length === 0,
    hasWarnings: state.validationErrors.some(e => e.severity === 'warning'),
  };
};

// Utility function
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};