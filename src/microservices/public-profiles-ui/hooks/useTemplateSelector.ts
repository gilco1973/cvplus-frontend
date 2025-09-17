// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts
import { TemplateConfiguration, TemplateType } from '../types/creator.types';

interface UseTemplateSelectorOptions {
  initialTemplate?: TemplateConfiguration;
  showPremiumTemplates?: boolean;
  allowCustomization?: boolean;
}

export const useTemplateSelector = ({
  initialTemplate,
  showPremiumTemplates = true,
  allowCustomization = true,
}: UseTemplateSelectorOptions = {}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfiguration | null>(
    initialTemplate || null
  );
  const [previewTemplate, setPreviewTemplate] = useState<TemplateConfiguration | null>(null);
  const [filterCategory, setFilterCategory] = useState<TemplateType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Mock template data - in real implementation, this would come from API/service
  const availableTemplates = useMemo((): TemplateConfiguration[] => [
    {
      id: 'professional-01',
      name: 'Executive Professional',
      type: 'professional',
      description: 'Clean, corporate design perfect for executives and business professionals',
      thumbnail: '/templates/professional-01-thumb.jpg',
      preview: '/templates/professional-01-preview.jpg',
      features: ['Clean Layout', 'Corporate Colors', 'Skills Matrix', 'Experience Timeline'],
      isPremium: false,
    },
    {
      id: 'creative-01',
      name: 'Creative Portfolio',
      type: 'creative',
      description: 'Vibrant design showcasing creativity with portfolio integration',
      thumbnail: '/templates/creative-01-thumb.jpg',
      preview: '/templates/creative-01-preview.jpg',
      features: ['Portfolio Gallery', 'Vibrant Colors', 'Creative Layouts', 'Media Rich'],
      isPremium: false,
    },
    {
      id: 'minimal-01',
      name: 'Minimal Elegance',
      type: 'minimal',
      description: 'Clean, minimalist design focused on content and readability',
      thumbnail: '/templates/minimal-01-thumb.jpg',
      preview: '/templates/minimal-01-preview.jpg',
      features: ['Minimalist Design', 'Typography Focus', 'Fast Loading', 'Clean Lines'],
      isPremium: false,
    },
    {
      id: 'tech-01',
      name: 'Developer Pro',
      type: 'tech',
      description: 'Tech-focused design with code snippets and project showcases',
      thumbnail: '/templates/tech-01-thumb.jpg',
      preview: '/templates/tech-01-preview.jpg',
      features: ['Code Snippets', 'GitHub Integration', 'Tech Stack Display', 'Dark Mode'],
      isPremium: true,
    },
    {
      id: 'executive-01',
      name: 'C-Suite Elite',
      type: 'executive',
      description: 'Sophisticated design for senior executives and board members',
      thumbnail: '/templates/executive-01-thumb.jpg',
      preview: '/templates/executive-01-preview.jpg',
      features: ['Luxury Design', 'Achievement Focus', 'Leadership Emphasis', 'Awards Section'],
      isPremium: true,
    },
  ], []);

  // Filtered templates based on search and category
  const filteredTemplates = useMemo(() => {
    let filtered = availableTemplates;

    // Filter by premium access
    if (!showPremiumTemplates) {
      filtered = filtered.filter(template => !template.isPremium);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(template => template.type === filterCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        template =>
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [availableTemplates, showPremiumTemplates, filterCategory, searchQuery]);

  // Select template
  const selectTemplate = useCallback((template: TemplateConfiguration) => {
    setSelectedTemplate(template);
    setShowPreview(false);
    setPreviewTemplate(null);
  }, []);

  // Preview template (hover or click for preview)
  const previewTemplateHandler = useCallback((template: TemplateConfiguration | null) => {
    setPreviewTemplate(template);
    setShowPreview(!!template);
  }, []);

  // Close preview
  const closePreview = useCallback(() => {
    setShowPreview(false);
    setPreviewTemplate(null);
  }, []);

  // Update search query
  const updateSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Update filter category
  const updateFilter = useCallback((category: TemplateType | 'all') => {
    setFilterCategory(category);
  }, []);

  // Get template by ID
  const getTemplateById = useCallback(
    (id: string): TemplateConfiguration | undefined => {
      return availableTemplates.find(template => template.id === id);
    },
    [availableTemplates]
  );

  // Get recommended templates based on profile data
  const getRecommendedTemplates = useCallback(
    (profileData?: any): TemplateConfiguration[] => {
      // Simple recommendation logic - can be enhanced with ML
      let recommended = [...availableTemplates];

      if (profileData?.industry) {
        const industry = profileData.industry.toLowerCase();
        if (industry.includes('tech') || industry.includes('software')) {
          recommended = recommended.filter(t => t.type === 'tech' || t.type === 'minimal');
        } else if (industry.includes('design') || industry.includes('creative')) {
          recommended = recommended.filter(t => t.type === 'creative' || t.type === 'minimal');
        } else if (industry.includes('finance') || industry.includes('consulting')) {
          recommended = recommended.filter(t => t.type === 'professional' || t.type === 'executive');
        }
      }

      return recommended.slice(0, 3); // Return top 3 recommendations
    },
    [availableTemplates]
  );

  // Check if template requires premium
  const requiresPremium = useCallback(
    (template: TemplateConfiguration): boolean => {
      return template.isPremium;
    },
    []
  );

  return {
    selectedTemplate,
    previewTemplate,
    filteredTemplates,
    availableTemplates,
    filterCategory,
    searchQuery,
    showPreview,
    selectTemplate,
    previewTemplateHandler,
    closePreview,
    updateSearch,
    updateFilter,
    getTemplateById,
    getRecommendedTemplates,
    requiresPremium,
    hasResults: filteredTemplates.length > 0,
    categories: ['all', 'professional', 'creative', 'minimal', 'tech', 'executive'] as const,
  };
};