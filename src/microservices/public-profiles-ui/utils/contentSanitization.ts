// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts
  /**
   * Sanitize HTML content to prevent XSS attacks
    */
  static sanitizeHtml(html: string): string {
    // Remove script tags and their content
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove dangerous attributes
    html = html.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, ''); // onclick, onload, etc.
    html = html.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '');
    html = html.replace(/\s*javascript:[^"']*/gi, '');

    // Remove dangerous tags
    const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'meta', 'link'];
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}\\b[^>]*>.*?<\\/${tag}>`, 'gi');
      html = html.replace(regex, '');
    });

    return html;
  }

  /**
   * Sanitize text content
    */
  static sanitizeText(text: string): string {
    if (!text) return '';

    return text
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .substring(0, 10000); // Limit length
  }

  /**
   * Sanitize URL
    */
  static sanitizeUrl(url: string): string {
    if (!url) return '';

    // Remove dangerous protocols
    const cleanUrl = url.replace(/^(javascript|data|vbscript):/i, '');

    try {
      const urlObj = new URL(cleanUrl);
      const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

      if (!allowedProtocols.includes(urlObj.protocol)) {
        return '';
      }

      return urlObj.toString();
    } catch {
      // If not a valid URL, return as is if it looks like a relative path
      if (cleanUrl.startsWith('/') || cleanUrl.startsWith('./') || cleanUrl.startsWith('../')) {
        return cleanUrl;
      }
      return '';
    }
  }

  /**
   * Sanitize email address
    */
  static sanitizeEmail(email: string): string {
    if (!email) return '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();

    if (emailRegex.test(cleanEmail)) {
      return cleanEmail;
    }

    return '';
  }

  /**
   * Sanitize phone number
    */
  static sanitizePhone(phone: string): string {
    if (!phone) return '';

    // Allow only numbers, spaces, hyphens, parentheses, and plus sign
    const cleanPhone = phone.replace(/[^0-9\s\-\(\)\+]/g, '');

    return cleanPhone.trim();
  }

  /**
   * Sanitize social media username
    */
  static sanitizeSocialUsername(username: string): string {
    if (!username) return '';

    // Remove @ symbol if present at the beginning
    let clean = username.startsWith('@') ? username.substring(1) : username;

    // Allow only alphanumeric characters, underscores, dots, and hyphens
    clean = clean.replace(/[^a-zA-Z0-9._-]/g, '');

    return clean.trim();
  }

  /**
   * Sanitize file name
    */
  static sanitizeFileName(fileName: string): string {
    if (!fileName) return '';

    // Remove path separators and dangerous characters
    const clean = fileName
      .replace(/[\/\\:*?"<>|]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
      .trim();

    return clean.substring(0, 255); // Limit length
  }

  /**
   * Sanitize CSS content
    */
  static sanitizeCss(css: string): string {
    if (!css) return '';

    // Remove dangerous CSS properties and values
    css = css.replace(/expression\s*\(/gi, '');
    css = css.replace(/@import/gi, '');
    css = css.replace(/behavior\s*:/gi, '');
    css = css.replace(/binding\s*:/gi, '');
    css = css.replace(/javascript:/gi, '');
    css = css.replace(/vbscript:/gi, '');

    return css.trim();
  }

  /**
   * Sanitize profile data comprehensively
    */
  static sanitizeProfileData(data: any): any {
    if (!data) return data;

    const sanitized = { ...data };

    // Sanitize text fields
    const textFields = ['name', 'title', 'headline', 'summary', 'location'];
    textFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = this.sanitizeText(sanitized[field]);
      }
    });

    // Sanitize URLs
    const urlFields = ['website', 'profileImage', 'backgroundImage'];
    urlFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = this.sanitizeUrl(sanitized[field]);
      }
    });

    // Sanitize email
    if (sanitized.email) {
      sanitized.email = this.sanitizeEmail(sanitized.email);
    }

    // Sanitize phone
    if (sanitized.phone) {
      sanitized.phone = this.sanitizePhone(sanitized.phone);
    }

    // Sanitize social links
    if (sanitized.socialLinks) {
      Object.keys(sanitized.socialLinks).forEach(platform => {
        if (sanitized.socialLinks[platform]) {
          // If it's a full URL, sanitize as URL
          if (sanitized.socialLinks[platform].includes('://')) {
            sanitized.socialLinks[platform] = this.sanitizeUrl(sanitized.socialLinks[platform]);
          } else {
            // If it's just a username, sanitize as username
            sanitized.socialLinks[platform] = this.sanitizeSocialUsername(sanitized.socialLinks[platform]);
          }
        }
      });
    }

    // Sanitize arrays of text
    const arrayFields = ['skills'];
    arrayFields.forEach(field => {
      if (Array.isArray(sanitized[field])) {
        sanitized[field] = sanitized[field].map((item: string) => this.sanitizeText(item));
      }
    });

    // Sanitize complex objects
    if (sanitized.experience && Array.isArray(sanitized.experience)) {
      sanitized.experience = sanitized.experience.map(exp => ({
        ...exp,
        title: this.sanitizeText(exp.title),
        company: this.sanitizeText(exp.company),
        description: this.sanitizeText(exp.description),
        location: this.sanitizeText(exp.location),
      }));
    }

    if (sanitized.education && Array.isArray(sanitized.education)) {
      sanitized.education = sanitized.education.map(edu => ({
        ...edu,
        degree: this.sanitizeText(edu.degree),
        institution: this.sanitizeText(edu.institution),
        fieldOfStudy: this.sanitizeText(edu.fieldOfStudy),
        location: this.sanitizeText(edu.location),
      }));
    }

    if (sanitized.portfolio && Array.isArray(sanitized.portfolio)) {
      sanitized.portfolio = sanitized.portfolio.map(item => ({
        ...item,
        title: this.sanitizeText(item.title),
        description: this.sanitizeText(item.description),
        url: this.sanitizeUrl(item.url),
        imageUrl: this.sanitizeUrl(item.imageUrl),
      }));
    }

    return sanitized;
  }

  /**
   * Validate content length limits
    */
  static validateContentLength(content: string, maxLength: number): boolean {
    return content.length <= maxLength;
  }

  /**
   * Truncate content to specified length
    */
  static truncateContent(content: string, maxLength: number, suffix = '...'): string {
    if (content.length <= maxLength) return content;

    return content.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Check for prohibited content
    */
  static hasProhibitedContent(content: string): boolean {
    const prohibitedPatterns = [
      /(?:https?:\/\/)?(?:www\.)?[\w.-]+\.[\w]{2,}(?:\/[\w.-]*)*\?[\w&=%-]*(?:password|token|key)/i,
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /data:text\/html/i,
    ];

    return prohibitedPatterns.some(pattern => pattern.test(content));
  }
}