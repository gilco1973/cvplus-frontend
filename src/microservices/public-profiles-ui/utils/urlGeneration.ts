// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts
  private static readonly BASE_URL = 'https://profiles.cvplus.com';
  private static readonly RESERVED_SLUGS = [
    'admin', 'api', 'www', 'mail', 'ftp', 'help', 'support', 'about',
    'privacy', 'terms', 'contact', 'blog', 'news', 'careers', 'login',
    'signup', 'dashboard', 'settings', 'profile', 'profiles', 'public',
    'private', 'assets', 'static', 'cdn', 'images', 'css', 'js'
  ];

  /**
   * Generate a URL-friendly slug from a name
    */
  static generateSlug(name: string, fallbackId?: string): string {
    if (!name) {
      return fallbackId ? `user-${fallbackId}` : 'profile';
    }

    let slug = name
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      // Remove multiple consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '');

    // Ensure slug is not empty
    if (!slug) {
      slug = fallbackId ? `user-${fallbackId}` : 'profile';
    }

    // Ensure slug is not reserved
    if (this.RESERVED_SLUGS.includes(slug)) {
      slug = fallbackId ? `${slug}-${fallbackId}` : `${slug}-profile`;
    }

    // Limit length
    if (slug.length > 50) {
      slug = slug.substring(0, 47) + '...';
      // Remove trailing hyphen if created by truncation
      slug = slug.replace(/-+$/, '');
    }

    return slug;
  }

  /**
   * Generate optimized slug considering SEO
    */
  static generateSeoOptimizedSlug(
    name: string,
    title?: string,
    location?: string,
    fallbackId?: string
  ): string {
    const namePart = this.generateSlug(name, fallbackId);

    if (!title && !location) {
      return namePart;
    }

    const parts = [namePart];

    // Add title if provided and not too long
    if (title) {
      const titleSlug = this.generateSlug(title);
      if (titleSlug.length <= 20 && !titleSlug.includes('manager')) {
        parts.push(titleSlug);
      }
    }

    // Add location if provided and not too long
    if (location) {
      const locationSlug = this.generateSlug(location);
      if (locationSlug.length <= 15) {
        parts.push(locationSlug);
      }
    }

    const fullSlug = parts.join('-');

    // If combined slug is too long, use just name
    if (fullSlug.length > 60) {
      return namePart;
    }

    return fullSlug;
  }

  /**
   * Generate public profile URL
    */
  static generatePublicUrl(slug: string, customDomain?: string): string {
    const domain = customDomain || this.BASE_URL;

    // Ensure domain has protocol
    const fullDomain = domain.startsWith('http') ? domain : `https://${domain}`;

    return `${fullDomain}/${slug}`;
  }

  /**
   * Generate QR code URL
    */
  static generateQrCodeUrl(profileUrl: string): string {
    const encodedUrl = encodeURIComponent(profileUrl);
    return `${this.BASE_URL}/api/qr?url=${encodedUrl}`;
  }

  /**
   * Generate embed widget URL
    */
  static generateEmbedUrl(slug: string, options?: {
    width?: number;
    height?: number;
    theme?: 'light' | 'dark';
    hideHeader?: boolean;
    hideFooter?: boolean;
  }): string {
    const params = new URLSearchParams();

    if (options?.width) params.set('width', options.width.toString());
    if (options?.height) params.set('height', options.height.toString());
    if (options?.theme) params.set('theme', options.theme);
    if (options?.hideHeader) params.set('hideHeader', 'true');
    if (options?.hideFooter) params.set('hideFooter', 'true');

    const queryString = params.toString();
    const base = `${this.BASE_URL}/embed/${slug}`;

    return queryString ? `${base}?${queryString}` : base;
  }

  /**
   * Generate social sharing URLs
    */
  static generateSocialSharingUrls(profileUrl: string, name: string, title?: string) {
    const text = title ? `${name} - ${title}` : name;
    const encodedUrl = encodeURIComponent(profileUrl);
    const encodedText = encodeURIComponent(text);

    return {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      email: `mailto:?subject=${encodedText}&body=Check out my professional profile: ${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText} ${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    };
  }

  /**
   * Generate PDF export URL
    */
  static generatePdfUrl(slug: string, options?: {
    format?: 'A4' | 'Letter';
    orientation?: 'portrait' | 'landscape';
    includeImages?: boolean;
  }): string {
    const params = new URLSearchParams();

    if (options?.format) params.set('format', options.format);
    if (options?.orientation) params.set('orientation', options.orientation);
    if (options?.includeImages !== undefined) {
      params.set('includeImages', options.includeImages.toString());
    }

    const queryString = params.toString();
    const base = `${this.BASE_URL}/api/export/pdf/${slug}`;

    return queryString ? `${base}?${queryString}` : base;
  }

  /**
   * Generate analytics URL
    */
  static generateAnalyticsUrl(slug: string, timeRange = '30d'): string {
    return `${this.BASE_URL}/api/analytics/${slug}?range=${timeRange}`;
  }

  /**
   * Generate contact form submission URL
    */
  static generateContactUrl(slug: string): string {
    return `${this.BASE_URL}/api/contact/${slug}`;
  }

  /**
   * Validate slug format
    */
  static isValidSlug(slug: string): boolean {
    // Check basic format
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) return false;

    // Check length
    if (slug.length < 2 || slug.length > 60) return false;

    // Check for reserved words
    if (this.RESERVED_SLUGS.includes(slug)) return false;

    return true;
  }

  /**
   * Check if slug is available
    */
  static async checkSlugAvailability(slug: string): Promise<boolean> {
    if (!this.isValidSlug(slug)) return false;

    try {
      const response = await fetch(`${this.BASE_URL}/api/check-slug/${slug}`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }
  }

  /**
   * Generate alternative slugs if original is taken
    */
  static generateAlternativeSlugs(originalSlug: string, count = 5): string[] {
    const alternatives = [];

    for (let i = 1; i <= count; i++) {
      alternatives.push(`${originalSlug}-${i}`);
    }

    // Add random suffix alternatives
    for (let i = 0; i < Math.min(count, 3); i++) {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      alternatives.push(`${originalSlug}-${randomSuffix}`);
    }

    return alternatives.slice(0, count);
  }

  /**
   * Parse profile URL to extract slug
    */
  static extractSlugFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment);

      // Assuming profile URLs are in format: domain.com/slug
      if (pathSegments.length === 1) {
        return pathSegments[0];
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Generate canonical URL for SEO
    */
  static generateCanonicalUrl(slug: string, customDomain?: string): string {
    const domain = customDomain || this.BASE_URL;
    return `${domain}/${slug}`;
  }

  /**
   * Generate sitemap entry URL
    */
  static generateSitemapUrl(slug: string): string {
    return `${this.BASE_URL}/${slug}`;
  }
}