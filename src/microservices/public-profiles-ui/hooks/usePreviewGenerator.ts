// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts
import { PreviewConfiguration, BrandingSettings } from '../types/creator.types';
import { TemplateDefinition } from '../types/template.types';
import { PublicProfileData } from '../../types/profile.types';

interface UsePreviewGeneratorOptions {
  profileData: Partial<PublicProfileData>;
  template: TemplateDefinition | null;
  branding: BrandingSettings;
  updateDelay?: number;
}

export const usePreviewGenerator = ({
  profileData,
  template,
  branding,
  updateDelay = 300,
}: UsePreviewGeneratorOptions) => {
  const [previewConfig, setPreviewConfig] = useState<PreviewConfiguration>({
    device: 'desktop',
    zoom: 1,
    showGrid: false,
    showRulers: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewCss, setPreviewCss] = useState<string>('');
  const [previewError, setPreviewError] = useState<string | null>(null);

  const updateTimeout = useRef<NodeJS.Timeout>();
  const previewFrame = useRef<HTMLIFrameElement | null>(null);

  // Device breakpoints matching Tailwind CSS
  const breakpoints = useMemo(() => ({
    mobile: 640,
    tablet: 1024,
    desktop: 1280,
  }), []);

  // Generate preview HTML
  const generatePreviewHtml = useCallback(async (): Promise<string> => {
    if (!template || !profileData.name) {
      return '<div class="preview-placeholder">Select a template to preview</div>';
    }

    // This would integrate with the template engine
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${profileData.name} - Profile Preview</title>
        <style>${generatePreviewCss()}</style>
      </head>
      <body>
        <div class="profile-container ${template.category}">
          <header class="profile-header">
            <div class="profile-image-container">
              ${profileData.profileImage ?
                `<img src="${profileData.profileImage}" alt="${profileData.name}" class="profile-image" />` :
                `<div class="profile-image-placeholder"></div>`
              }
            </div>
            <div class="profile-info">
              <h1 class="profile-name">${profileData.name || 'Your Name'}</h1>
              <h2 class="profile-title">${profileData.title || 'Your Professional Title'}</h2>
              <p class="profile-headline">${profileData.headline || 'Your professional headline...'}</p>
            </div>
          </header>

          <section class="profile-summary">
            <h3>About</h3>
            <p>${profileData.summary || 'Your professional summary will appear here...'}</p>
          </section>

          <section class="profile-skills">
            <h3>Skills</h3>
            <div class="skills-container">
              ${(profileData.skills || ['Skill 1', 'Skill 2', 'Skill 3'])
                .map(skill => `<span class="skill-tag">${skill}</span>`)
                .join('')}
            </div>
          </section>

          <section class="profile-experience">
            <h3>Experience</h3>
            <div class="experience-list">
              ${(profileData.experience || []).length > 0 ?
                profileData.experience.map((exp: any) => `
                  <div class="experience-item">
                    <h4>${exp.title}</h4>
                    <p class="company">${exp.company}</p>
                    <p class="duration">${exp.startDate} - ${exp.endDate || 'Present'}</p>
                  </div>
                `).join('') :
                '<p class="placeholder">Your experience will be displayed here...</p>'
              }
            </div>
          </section>
        </div>
      </body>
      </html>
    `;

    return html;
  }, [template, profileData, branding]);

  // Generate preview CSS
  const generatePreviewCss = useCallback((): string => {
    if (!template) return '';

    const css = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: ${branding.fontFamily}, sans-serif;
        line-height: 1.6;
        color: ${branding.secondaryColor};
        background: white;
      }

      .profile-container {
        max-width: 100%;
        padding: 2rem;
        ${previewConfig.device === 'mobile' ? 'padding: 1rem;' : ''}
      }

      .profile-header {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2rem;
        ${previewConfig.device === 'mobile' ? 'flex-direction: column; text-align: center;' : ''}
      }

      .profile-image {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid ${branding.primaryColor};
      }

      .profile-image-placeholder {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: ${branding.primaryColor}20;
        border: 4px solid ${branding.primaryColor};
      }

      .profile-name {
        font-size: ${previewConfig.device === 'mobile' ? '1.5rem' : '2rem'};
        font-weight: bold;
        color: ${branding.primaryColor};
        margin-bottom: 0.5rem;
      }

      .profile-title {
        font-size: ${previewConfig.device === 'mobile' ? '1rem' : '1.25rem'};
        color: ${branding.secondaryColor};
        margin-bottom: 0.5rem;
      }

      .profile-headline {
        color: ${branding.secondaryColor}80;
        max-width: 500px;
      }

      section {
        margin-bottom: 2rem;
      }

      h3 {
        color: ${branding.primaryColor};
        border-bottom: 2px solid ${branding.primaryColor};
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
        font-size: 1.25rem;
      }

      .skills-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .skill-tag {
        background: ${branding.primaryColor};
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .experience-item {
        padding: 1rem 0;
        border-bottom: 1px solid ${branding.secondaryColor}20;
      }

      .experience-item h4 {
        color: ${branding.primaryColor};
        margin-bottom: 0.25rem;
      }

      .company {
        font-weight: 600;
        color: ${branding.secondaryColor};
        margin-bottom: 0.25rem;
      }

      .duration {
        color: ${branding.secondaryColor}80;
        font-size: 0.875rem;
      }

      .placeholder {
        color: ${branding.secondaryColor}60;
        font-style: italic;
      }

      .preview-placeholder {
        text-align: center;
        padding: 4rem 2rem;
        color: ${branding.secondaryColor}60;
        font-size: 1.125rem;
      }

      ${template.category === 'creative' ? `
        .profile-container {
          background: linear-gradient(135deg, ${branding.primaryColor}10, ${branding.accentColor}10);
        }
      ` : ''}

      ${template.category === 'minimal' ? `
        .profile-header {
          border-bottom: 1px solid ${branding.secondaryColor}20;
          padding-bottom: 2rem;
        }
      ` : ''}
    `;

    return css;
  }, [template, branding, previewConfig]);

  // Update preview with debouncing
  const updatePreview = useCallback(async () => {
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }

    updateTimeout.current = setTimeout(async () => {
      setIsGenerating(true);
      setPreviewError(null);

      try {
        const html = await generatePreviewHtml();
        const css = generatePreviewCss();

        setPreviewHtml(html);
        setPreviewCss(css);
      } catch (error) {
        setPreviewError(error instanceof Error ? error.message : 'Preview generation failed');
      } finally {
        setIsGenerating(false);
      }
    }, updateDelay);
  }, [generatePreviewHtml, generatePreviewCss, updateDelay]);

  // Update device preview
  const updateDevice = useCallback((device: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewConfig(prev => ({ ...prev, device }));
  }, []);

  // Update zoom level
  const updateZoom = useCallback((zoom: number) => {
    setPreviewConfig(prev => ({ ...prev, zoom: Math.max(0.25, Math.min(2, zoom)) }));
  }, []);

  // Toggle grid/rulers
  const toggleGrid = useCallback(() => {
    setPreviewConfig(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const toggleRulers = useCallback(() => {
    setPreviewConfig(prev => ({ ...prev, showRulers: !prev.showRulers }));
  }, []);

  // Get device dimensions
  const getDeviceDimensions = useCallback(() => {
    switch (previewConfig.device) {
      case 'mobile':
        return { width: 375, height: 812 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
      default:
        return { width: 1200, height: 800 };
    }
  }, [previewConfig.device]);

  // Update preview when dependencies change
  useEffect(() => {
    updatePreview();
  }, [profileData, template, branding, previewConfig, updatePreview]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
    };
  }, []);

  return {
    previewConfig,
    previewHtml,
    previewCss,
    isGenerating,
    previewError,
    previewFrame,
    updateDevice,
    updateZoom,
    toggleGrid,
    toggleRulers,
    getDeviceDimensions,
    breakpoints,
    refresh: updatePreview,
  };
};