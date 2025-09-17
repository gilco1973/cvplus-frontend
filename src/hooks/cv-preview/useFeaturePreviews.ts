import { useCallback } from 'react';
import type { FeaturePreviewData } from '../../types/cv-preview';

export const useFeaturePreviews = (previewData: unknown) => {
  const getMockFeatureData = useCallback((featureId: string): FeaturePreviewData => {
    switch (featureId) {
      case 'language-proficiency':
        return {
          languages: [
            { name: 'English', level: 'Native' },
            { name: 'Hebrew', level: 'Fluent' },
            { name: 'Spanish', level: 'Professional' }
          ]
        };
        
      case 'certification-badges':
        return {
          certifications: [
            { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023', verified: true },
            { name: 'Microsoft Azure Fundamentals', issuer: 'Microsoft', year: '2022', verified: true },
            { name: 'Google Cloud Platform Professional', issuer: 'Google', year: '2023', verified: false }
          ]
        };
        
      case 'social-media-links':
        return {
          socialLinks: {
            linkedin: 'https://linkedin.com/in/professional-profile',
            github: 'https://github.com/developer-profile',
            twitter: 'https://twitter.com/professional'
          }
        };
        
      case 'achievements-showcase': {
        // Use real achievements from experience data
        const realAchievements = previewData?.experience?.flatMap((exp: unknown) => 
          exp.achievements?.map((achievement: string) => ({
            title: achievement,
            category: 'Professional',
            impact: 'Real'
          })) || []
        ) || [];
        
        return {
          keyAchievements: realAchievements.length > 0 ? realAchievements.slice(0, 3) : [
            { title: 'Real achievements will be extracted from your experience', category: 'Info', impact: 'Preview' }
          ]
        };
      }
        
      default:
        return {};
    }
  }, [previewData]);

  const generateFeaturePreview = useCallback((featureId: string, isEnabled: boolean, isCollapsed: boolean): string => {
    if (!isEnabled) return '';
    
    const mockData = getMockFeatureData(featureId);
    
    switch (featureId) {
      case 'language-proficiency':
        return `
          <div class="language-section feature-preview" data-feature="${featureId}">
            <div class="feature-preview-banner">
              <span>📋 Preview: This feature will show when you have language skills in your CV</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('${featureId}')">
              🌐 Languages
              <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
              <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                ${mockData.languages?.map((lang: unknown) => `
                  <span style="background: #2563eb; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">${lang.name}</span>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      
      case 'certification-badges':
        return `
          <div class="certification-section feature-preview" data-feature="${featureId}">
            <div class="feature-preview-banner">
              <span>📋 Preview: This feature will show when you have certifications in your CV</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('${featureId}')">
              🏆 Certifications
              <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
              <div class="certification-grid">
                ${mockData.certifications?.map((cert: unknown) => `
                  <div class="certification-badge">
                    <div class="badge-icon">${cert.verified ? '✅' : '📋'}</div>
                    <div class="badge-content">
                      <h4 class="cert-name">${cert.name}</h4>
                      <p class="cert-issuer">${cert.issuer}</p>
                      <span class="cert-year">${cert.year}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      
      case 'social-media-links':
        return `
          <div class="social-section feature-preview" data-feature="${featureId}">
            <div class="feature-preview-banner">
              <span>📋 Preview: Links will be populated from your CV data</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('${featureId}')">
              🔗 Professional Links
              <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
              <div class="social-links">
                <a href="#" class="social-link linkedin">LinkedIn</a>
                <a href="#" class="social-link github">GitHub</a>
                <a href="#" class="social-link email">Email</a>
              </div>
            </div>
          </div>
        `;
      
      case 'achievements-showcase':
        return `
          <div class="achievements-section feature-preview" data-feature="${featureId}">
            <div class="feature-preview-banner">
              <span>📋 Preview: AI will extract and highlight your top achievements</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('${featureId}')">
              ⭐ Key Achievements
              <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
              <div class="achievements-grid">
                ${mockData.keyAchievements?.map((achievement: unknown) => `
                  <div class="achievement-card">
                    <div class="achievement-icon">🎯</div>
                    <div class="achievement-content">
                      <h4 class="achievement-title">${achievement.title}</h4>
                      <span class="achievement-category">${achievement.category}</span>
                      <span class="achievement-impact impact-${achievement.impact.toLowerCase()}">${achievement.impact} Impact</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;

      case 'interactive-timeline':
        return `
          <div class="timeline-section feature-preview" data-feature="${featureId}">
            <div class="feature-preview-banner">
              <span>📋 Preview: Interactive timeline of your career journey</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('${featureId}')">
              📅 Career Timeline
              <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
              <div class="timeline-container">
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <h4>Senior Software Engineer</h4>
                    <p>2023 - Present</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <h4>Software Engineer</h4>
                    <p>2021 - 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'skills-chart':
        return `
          <div class="skills-chart-section feature-preview" data-feature="${featureId}">
            <div class="feature-preview-banner">
              <span>📋 Preview: Visual skills proficiency chart</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('${featureId}')">
              📊 Skills Chart
              <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
              <div class="skills-chart">
                <div class="skill-bar">
                  <span>JavaScript</span>
                  <div class="progress"><div class="fill" style="width: 90%"></div></div>
                </div>
                <div class="skill-bar">
                  <span>Python</span>
                  <div class="progress"><div class="fill" style="width: 85%"></div></div>
                </div>
                <div class="skill-bar">
                  <span>React</span>
                  <div class="progress"><div class="fill" style="width: 88%"></div></div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'video-introduction':
        return `
          <div class="video-section feature-preview" data-feature="${featureId}">
            <div class="feature-preview-banner">
              <span>📋 Preview: AI-generated video introduction</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('${featureId}')">
              🎥 Video Introduction
              <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
              <div class="video-placeholder">
                <div class="play-button">▶</div>
                <p>AI-generated professional introduction</p>
              </div>
            </div>
          </div>
        `;

      case 'portfolio-gallery':
        return `
          <div class="portfolio-section feature-preview" data-feature="${featureId}">
            <div class="feature-preview-banner">
              <span>📋 Preview: Portfolio gallery with project showcases</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('${featureId}')">
              🎨 Portfolio Gallery
              <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
              <div class="portfolio-grid">
                <div class="portfolio-item">Project 1</div>
                <div class="portfolio-item">Project 2</div>
                <div class="portfolio-item">Project 3</div>
              </div>
            </div>
          </div>
        `;

      case 'contact-form':
        return `
          <div class="contact-section feature-preview" data-feature="${featureId}">
            <div class="feature-preview-banner">
              <span>📋 Preview: Interactive contact form</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('${featureId}')">
              📧 Contact Form
              <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
              <form class="contact-form">
                <input type="text" placeholder="Your Name" />
                <input type="email" placeholder="Your Email" />
                <textarea placeholder="Your Message"></textarea>
                <button type="button">Send Message</button>
              </form>
            </div>
          </div>
        `;

      case 'privacy-mode':
        return `
          <div class="privacy-section feature-preview" data-feature="${featureId}">
            <div class="feature-preview-banner">
              <span>🔒 Preview: Sensitive information will be protected</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('${featureId}')">
              🔒 Privacy Protection Active
              <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}">
              <div class="privacy-info">
                <p>✅ Personal contact information protected</p>
                <p>✅ Addresses and phone numbers masked</p>
                <p>✅ Safe for public sharing</p>
              </div>
            </div>
          </div>
        `;

      case 'availability-calendar': {
        // Return a placeholder that the ProgressiveEnhancementRenderer can replace with the React component
        // Extract professional name and email from preview data if available
        const personalInfo = previewData?.personalInfo || previewData?.personalInformation || {};
        const professionalName = personalInfo.name || 'Professional';
        const professionalEmail = personalInfo.email || 'contact@example.com';
        
        return `
          <div id="availability-calendar-placeholder" data-feature="availability-calendar" data-professional-name="${professionalName}" data-professional-email="${professionalEmail}" class="feature-preview">
            <div class="feature-preview-banner">
              <span>📅 Preview: Interactive availability calendar will load here</span>
            </div>
            <div class="calendar-loading-placeholder">
              <div class="calendar-header">
                <h3>📅 Schedule a Meeting</h3>
                <p>Loading interactive calendar...</p>
              </div>
              <div class="calendar-placeholder-content">
                <div class="placeholder-calendar">📅</div>
                <p class="placeholder-text">Interactive calendar component will render here</p>
              </div>
            </div>
          </div>
        `;
      }

      case 'embed-qr-code':
        return `
          <div class="qr-section feature-preview" data-feature="${featureId}">
            <div class="feature-preview-banner">
              <span>📱 Preview: QR code for easy profile sharing</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('${featureId}')">
              📱 QR Code
              <div class="collapse-icon ${isCollapsed ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${isCollapsed ? 'collapsed' : ''}" style="text-align: center;">
              <div style="width: 120px; height: 120px; background: #f0f0f0; border: 2px dashed #ccc; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; margin: 20px auto;">
                QR Code
              </div>
              <p style="font-size: 12px; color: #666;">Scan to view digital profile</p>
            </div>
          </div>
        `;
      
      default:
        return '';
    }
  }, [getMockFeatureData]);

  return {
    getMockFeatureData,
    generateFeaturePreview
  };
};