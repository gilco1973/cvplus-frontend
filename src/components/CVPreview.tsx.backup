import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Save, X, Eye, EyeOff } from 'lucide-react';
import type { Job } from '../services/cvService';
import { analyzeAchievements } from '../services/cvService';
import { SectionEditor } from './SectionEditor';
import { QRCodeEditor } from './QRCodeEditor';

interface CVPreviewProps {
  job: Job;
  selectedTemplate: string;
  selectedFeatures: Record<string, boolean>;
  appliedImprovements?: any; // LLM-improved content from analysis step
  onUpdate?: (updates: Partial<Job['parsedData']>) => void;
  onFeatureToggle?: (feature: string, enabled: boolean) => void;
  className?: string;
}


export const CVPreview: React.FC<CVPreviewProps> = ({
  job,
  selectedTemplate,
  selectedFeatures,
  appliedImprovements,
  onUpdate,
  onFeatureToggle,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showFeaturePreviews, setShowFeaturePreviews] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isEditingQRCode, setIsEditingQRCode] = useState(false);
  const [showPreviewBanner, setShowPreviewBanner] = useState(true);
  // Use improved content if available, otherwise fall back to original
  const baseData = appliedImprovements || job.parsedData;
  const [previewData, setPreviewData] = useState(baseData);
  
  // Update preview data when improvements change
  useEffect(() => {
    const newBaseData = appliedImprovements || job.parsedData;
    setPreviewData(newBaseData);
  }, [appliedImprovements, job.parsedData]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  // ATS analysis is now handled in CVAnalysisResults component
  
  // Achievement highlighting state
  const [achievementAnalysis, setAchievementAnalysis] = useState<any>(null);
  const [achievementLoading, setAchievementLoading] = useState(false);
  const [achievementError, setAchievementError] = useState<string | null>(null);
  const [qrCodeSettings, setQrCodeSettings] = useState(() => {
    // Initialize from job data if available, otherwise use defaults
    const savedSettings = (job.parsedData as any)?.qrCodeSettings;
    return savedSettings || {
      url: `https://getmycv-ai.web.app/cv/${job.id}`,
      type: 'profile' as 'profile' | 'linkedin' | 'portfolio' | 'contact' | 'custom',
      customText: 'View my Professional CV'
    };
  });
  const previewRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<number | undefined>(undefined);

  // Mock data for feature previews when actual data is missing
  const getMockFeatureData = (featureId: string) => {
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
      case 'achievements-showcase':
        // Use real achievements from experience data
        const realAchievements = previewData?.experience?.flatMap((exp: any) => 
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
      default:
        return {};
    }
  };

  // Generate feature preview HTML
  const generateFeaturePreview = (featureId: string) => {
    if (!selectedFeatures[featureId.replace(/-/g, '')]) return '';
    
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
              <div class="collapse-icon ${collapsedSections[featureId] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections[featureId] ? 'collapsed' : ''}">
              <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                ${mockData.languages?.map((lang: any) => `
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
              <div class="collapse-icon ${collapsedSections[featureId] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections[featureId] ? 'collapsed' : ''}">
              <div class="certification-grid">
                ${mockData.certifications?.map((cert: any) => `
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
              <div class="collapse-icon ${collapsedSections[featureId] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections[featureId] ? 'collapsed' : ''}">
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
              <div class="collapse-icon ${collapsedSections[featureId] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections[featureId] ? 'collapsed' : ''}">
              <div class="achievements-grid">
                ${mockData.keyAchievements?.map((achievement: any) => `
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
      
      default:
        return '';
    }
  };

  // ATS Analysis is now handled in CVAnalysisResults component
  // This preview will show the CV with improvements already applied

  // Generate preview HTML with selected features
  const generatePreviewHTML = () => {
    const personalInfo = previewData?.personalInfo;
    const experience = previewData?.experience || [];
    const education = previewData?.education || [];
    const skills = previewData?.skills;
    
    return `
      <div class="cv-preview-container ${selectedTemplate}">
        <style>
          .cv-preview-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #111827;
            background: #ffffff;
            padding: 40px;
            margin: 0 auto;
            box-shadow: 0 4px 25px rgba(0,0,0,0.15);
            border-radius: 12px;
            border: 1px solid #e5e7eb;
          }
          
          .feature-preview {
            border: 2px solid #4299e1;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            position: relative;
            box-shadow: 0 2px 8px rgba(66, 153, 225, 0.1);
          }
          
          .feature-preview-banner {
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 24px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
            display: inline-block;
            animation: pulse 2s infinite;
            box-shadow: 0 2px 4px rgba(66, 153, 225, 0.3);
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .cv-preview-container h1, .cv-preview-container h2, .cv-preview-container h3 {
            color: #1f2937;
            font-weight: 700;
          }
          
          .cv-preview-container h1 {
            font-size: 2.25rem;
            margin-bottom: 0.5rem;
          }
          
          .cv-preview-container h2 {
            font-size: 1.5rem;
            margin: 1.5rem 0 0.75rem 0;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 0.25rem;
          }
          
          .cv-preview-container h3 {
            font-size: 1.125rem;
            margin: 1rem 0 0.5rem 0;
          }
          
          .cv-preview-container p, .cv-preview-container li {
            color: #374151;
            font-size: 0.875rem;
            line-height: 1.5;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          .feature-preview {
            transition: all 0.3s ease;
          }
          
          .feature-preview.opacity-50 {
            opacity: 0.5;
            transform: scale(0.98);
          }
          
          .editable-section {
            transition: all 0.3s ease;
          }
          
          .editable-section:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
          }
          
          .section-title {
            font-size: 24px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 20px;
            border-bottom: 3px solid #4299e1;
            padding-bottom: 10px;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .section-title:hover {
            color: #3182ce;
          }
          
          .section-title .collapse-icon {
            margin-left: auto;
            width: 20px;
            height: 20px;
            color: #4299e1;
            transition: transform 0.3s ease;
          }
          
          .section-title .collapse-icon.collapsed {
            transform: rotate(-90deg);
          }
          
          .section-content {
            transition: all 0.3s ease;
            overflow: hidden;
          }
          
          .section-content.collapsed {
            max-height: 0;
            opacity: 0;
            margin-top: 0;
            padding-top: 0;
          }
          
          .section-content:not(.collapsed) {
            max-height: none;
            opacity: 1;
          }
          
          .editable-section {
            position: relative;
            border: 2px solid transparent;
            border-radius: 4px;
            padding: 8px;
            transition: all 0.3s ease;
          }
          
          .editable-section:hover {
            border-color: #4299e1;
            background: rgba(66, 153, 225, 0.08);
          }
          
          .edit-overlay {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #4299e1;
            color: #ffffff;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease;
            box-shadow: 0 2px 8px rgba(66, 153, 225, 0.4);
          }
          
          .editable-section:hover .edit-overlay {
            opacity: 1;
          }
          
          .header-section {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 24px;
            border-bottom: 3px solid #e2e8f0;
          }
          
          .name {
            font-size: 40px;
            font-weight: 800;
            color: #1a202c;
            margin-bottom: 12px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          
          .contact-info {
            display: flex;
            justify-content: center;
            gap: 24px;
            flex-wrap: wrap;
            font-size: 15px;
            color: #4a5568;
            font-weight: 500;
          }
          
          .experience-item, .education-item {
            margin-bottom: 28px;
            padding-left: 24px;
            border-left: 4px solid #4299e1;
            position: relative;
          }
          
          .position, .degree {
            font-size: 20px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 6px;
          }
          
          .company, .institution {
            font-size: 17px;
            color: #3182ce;
            margin-bottom: 6px;
            font-weight: 600;
          }
          
          .duration {
            font-size: 14px;
            color: #718096;
            margin-bottom: 12px;
            font-weight: 500;
          }
          
          .description {
            margin-bottom: 12px;
            color: #2d3748;
            line-height: 1.7;
          }
          
          .achievements {
            list-style: none;
            padding: 0;
          }
          
          .achievements li {
            margin-bottom: 10px;
            padding-left: 24px;
            position: relative;
            color: #2d3748;
            line-height: 1.6;
          }
          
          .achievements li::before {
            content: '▸';
            position: absolute;
            left: 0;
            color: #4299e1;
            font-weight: bold;
            font-size: 16px;
          }
          
          .skills-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
          
          .skill-category {
            background: #f7fafc;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          
          .skill-category h4 {
            color: #1a202c;
            margin-bottom: 12px;
            font-weight: 700;
            font-size: 18px;
          }
          
          .skill-list {
            list-style: none;
            padding: 0;
          }
          
          .skill-list li {
            margin-bottom: 8px;
            color: #2d3748;
            font-weight: 500;
          }
          
          /* Feature-specific styles */
          .language-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .language-item {
            background: #ffffff;
            padding: 18px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          
          .language-name {
            font-weight: 600;
            display: block;
            margin-bottom: 5px;
          }
          
          .language-level {
            font-size: 13px;
            color: #718096;
            margin-bottom: 12px;
            font-weight: 500;
          }
          
          .language-bar {
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
          }
          
          .language-fill {
            height: 100%;
            background: linear-gradient(90deg, #4299e1, #3182ce);
            transition: width 0.3s ease;
          }
          
          .certification-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
          }
          
          .certification-badge {
            display: flex;
            align-items: center;
            padding: 24px;
            background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
            border-radius: 16px;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
          }
          
          .badge-icon {
            font-size: 24px;
            margin-right: 15px;
          }
          
          .cert-name {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 5px 0;
          }
          
          .cert-issuer {
            margin: 0 0 5px 0;
            opacity: 0.8;
          }
          
          .cert-year {
            font-size: 12px;
            opacity: 0.7;
            background: rgba(255,255,255,0.2);
            padding: 2px 8px;
            border-radius: 10px;
          }
          
          .social-links {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .social-link {
            padding: 8px 16px;
            border-radius: 20px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: transform 0.3s ease;
          }
          
          .social-link.linkedin {
            background: #0077b5;
            color: #ffffff;
          }
          
          .social-link.github {
            background: #2d3748;
            color: #ffffff;
          }
          
          .social-link.email {
            background: #ea4335;
            color: #ffffff;
          }
          
          .achievements-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
          }
          
          .achievement-card {
            display: flex;
            align-items: flex-start;
            padding: 24px;
            background: #f7fafc;
            border-radius: 16px;
            border-left: 5px solid #4299e1;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          
          .achievement-icon {
            font-size: 24px;
            margin-right: 15px;
          }
          
          .achievement-title {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #2c3e50;
          }
          
          .achievement-category {
            background: #e3f2fd;
            color: #1565c0;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-right: 8px;
          }
          
          .achievement-impact {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          
          .impact-high {
            background: #fff3cd;
            color: #856404;
          }
          
          .impact-critical {
            background: #f8d7da;
            color: #721c24;
          }
          
          .impact-medium {
            background: #d1ecf1;
            color: #0c5460;
          }
          
          /* Template-specific styles */
          
          /* Modern Template */
          .cv-preview-container.modern {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          
          .cv-preview-container.modern .name {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
            font-size: 42px;
          }
          
          .cv-preview-container.modern .section-title {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            border-bottom: 2px solid #667eea;
          }
          
          .cv-preview-container.modern .editable-section:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.15);
          }
          
          /* Classic Template */
          .cv-preview-container.classic {
            background: #ffffff;
            border: 2px solid #2c3e50;
            border-radius: 0;
            box-shadow: 0 0 0 rgba(0,0,0,0);
            font-family: 'Times New Roman', Times, serif;
          }
          
          .cv-preview-container.classic .name {
            color: #2c3e50;
            font-weight: 700;
            font-size: 36px;
            text-align: center;
            border-bottom: 3px double #2c3e50;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          
          .cv-preview-container.classic .section-title {
            color: #2c3e50;
            border-bottom: 1px solid #2c3e50;
            font-size: 20px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .cv-preview-container.classic .editable-section:hover {
            transform: none;
            box-shadow: 0 0 0 2px #2c3e50;
          }
          
          /* Creative Template */
          .cv-preview-container.creative {
            background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
            background-size: 400% 400%;
            animation: gradientShift 8s ease infinite;
            color: #ffffff;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          }
          
          .cv-preview-container.creative .name {
            color: #ffffff;
            font-weight: 900;
            font-size: 48px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            transform: rotate(-2deg);
            display: inline-block;
          }
          
          .cv-preview-container.creative .section-title {
            color: #ffffff;
            border-bottom: 3px solid #ffffff;
            font-size: 26px;
            font-weight: 800;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            transform: rotate(-1deg);
          }
          
          .cv-preview-container.creative .editable-section:hover {
            transform: translateY(-5px) rotate(1deg);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          }
          
          .cv-preview-container.creative p,
          .cv-preview-container.creative li,
          .cv-preview-container.creative span {
            color: #ffffff;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        </style>
        
        <!-- Header Section -->
        <div class="header-section editable-section" data-section="personalInfo">
          <div class="edit-overlay" onclick="editSection('personalInfo')">✏️</div>
          <h1 class="name">${personalInfo?.name || 'Your Name'}</h1>
          <div class="contact-info">
            ${personalInfo?.email ? `<span>✉ ${personalInfo.email}</span>` : ''}
            ${personalInfo?.phone ? `<span>☎ ${personalInfo.phone}</span>` : ''}
            ${personalInfo?.location ? `<span>📍 ${personalInfo.location}</span>` : ''}
          </div>
        </div>
        
        <!-- QR Code Preview -->
        ${selectedFeatures.embedQRCode ? `
          <div class="feature-preview" data-feature="qr-code">
            <div class="feature-preview-banner">
              <span>📋 Preview: QR Code will link to ${qrCodeSettings.url}</span>
              <button onclick="editQRCode()" style="margin-left: 10px; padding: 4px 10px; background: #4299e1; color: #ffffff; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">✏️ Edit URL</button>
            </div>
            <h3 class="section-title" onclick="toggleSection('qr-code')">
              📱 QR Code
              <div class="collapse-icon ${collapsedSections['qr-code'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['qr-code'] ? 'collapsed' : ''}" style="text-align: center; margin: 20px 0;">
              <div style="width: 120px; height: 120px; background: #f0f0f0; border: 2px dashed #ccc; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; margin: 0 auto;">
                📱 QR Code
              </div>
              <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; font-size: 12px;">
                <div><strong>Destination:</strong> ${qrCodeSettings.type.charAt(0).toUpperCase() + qrCodeSettings.type.slice(1)}</div>
                <div style="margin-top: 5px; word-break: break-all;"><strong>URL:</strong> ${qrCodeSettings.url}</div>
                <div style="margin-top: 5px;"><strong>Text:</strong> ${qrCodeSettings.customText}</div>
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- Summary Section -->
        ${previewData?.summary ? `
          <div class="section editable-section" data-section="summary">
            <div class="edit-overlay" onclick="editSection('summary')">✏️</div>
            <h2 class="section-title" onclick="toggleSection('summary')">
              Professional Summary
              <div class="collapse-icon ${collapsedSections.summary ? 'collapsed' : ''}">▼</div>
            </h2>
            <div class="section-content ${collapsedSections.summary ? 'collapsed' : ''}">
              <p class="summary">${previewData.summary}</p>
            </div>
          </div>
        ` : ''}
        
        <!-- Experience Section -->
        <div class="section editable-section" data-section="experience">
          <div class="edit-overlay" onclick="editSection('experience')">✏️</div>
          <h2 class="section-title" onclick="toggleSection('experience')">
            Experience
            <div class="collapse-icon ${collapsedSections.experience ? 'collapsed' : ''}">▼</div>
          </h2>
          <div class="section-content ${collapsedSections.experience ? 'collapsed' : ''}">
            ${experience.map((exp: any) => `
              <div class="experience-item">
                <h3 class="position">${exp.position}</h3>
                <div class="company">${exp.company}</div>
                <div class="duration">${exp.duration}</div>
                ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
                ${exp.achievements && exp.achievements.length > 0 ? `
                  <ul class="achievements">
                    ${exp.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Education Section -->
        ${education.length > 0 ? `
          <div class="section editable-section" data-section="education">
            <div class="edit-overlay" onclick="editSection('education')">✏️</div>
            <h2 class="section-title" onclick="toggleSection('education')">
              Education
              <div class="collapse-icon ${collapsedSections.education ? 'collapsed' : ''}">▼</div>
            </h2>
            <div class="section-content ${collapsedSections.education ? 'collapsed' : ''}">
              ${education.map((edu: any) => `
                <div class="education-item">
                  <h3 class="degree">${edu.degree}</h3>
                  <div class="institution">${edu.institution}</div>
                  ${edu.year ? `<div class="duration">${edu.year}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Skills Section -->
        ${skills ? `
          <div class="section editable-section" data-section="skills">
            <div class="edit-overlay" onclick="editSection('skills')">✏️</div>
            <h2 class="section-title" onclick="toggleSection('skills')">
              Skills
              <div class="collapse-icon ${collapsedSections.skills ? 'collapsed' : ''}">▼</div>
            </h2>
            <div class="section-content ${collapsedSections.skills ? 'collapsed' : ''}">
              <div class="skills-section">
                ${skills.technical && skills.technical.length > 0 ? `
                  <div class="skill-category">
                    <h4>Technical Skills</h4>
                    <ul class="skill-list">
                      ${skills.technical.map((skill: string) => `<li>${skill}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                ${skills.soft && skills.soft.length > 0 ? `
                  <div class="skill-category">
                    <h4>Soft Skills</h4>
                    <ul class="skill-list">
                      ${skills.soft.map((skill: string) => `<li>${skill}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- Interactive Timeline Preview -->
        ${selectedFeatures.interactiveTimeline ? `
          <div class="feature-preview" data-feature="interactive-timeline">
            <div class="feature-preview-banner">
              <span>📋 Preview: Interactive timeline will be generated from your experience</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('interactive-timeline')">
              🕒 Career Timeline
              <div class="collapse-icon ${collapsedSections['interactive-timeline'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['interactive-timeline'] ? 'collapsed' : ''}" style="border-left: 2px solid #3498db; padding-left: 20px; margin-left: 10px;">
              ${experience.slice(0, 3).map((exp: any) => `
                <div style="margin-bottom: 20px; cursor: pointer; padding: 10px; border-radius: 8px; background: #f8f9fa;">
                  <h4 style="margin: 0; color: #2c3e50;">${exp.position}</h4>
                  <p style="margin: 5px 0; color: #3498db;">${exp.company}</p>
                  <span style="font-size: 12px; color: #666;">${exp.duration}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Skills Chart Preview -->
        ${selectedFeatures.skillsChart ? `
          <div class="feature-preview" data-feature="skills-chart">
            <div class="feature-preview-banner">
              <span>📋 Preview: Skills will be displayed as organized tags</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('skills-chart')">
              📊 Technical Skills
              <div class="collapse-icon ${collapsedSections['skills-chart'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['skills-chart'] ? 'collapsed' : ''}">
              ${skills?.technical?.slice(0, 8).map((skill: string) => `
                <div style="margin-bottom: 12px;">
                  <span style="display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-right: 8px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">${skill}</span>
                </div>
              `).join('') || ''}
            </div>
          </div>
        ` : ''}
        
        <!-- Feature Previews -->
        ${showFeaturePreviews ? [
          'language-proficiency',
          'certification-badges', 
          'social-media-links',
          'achievements-showcase'
        ].map(featureId => generateFeaturePreview(featureId)).join('') : ''}
        
        <!-- Contact Form Preview -->
        ${selectedFeatures.contactForm ? `
          <div class="feature-preview" data-feature="contact-form">
            <div class="feature-preview-banner">
              <span>📋 Preview: Contact form will allow visitors to reach you directly</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('contact-form')">
              📧 Get in Touch
              <div class="collapse-icon ${collapsedSections['contact-form'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['contact-form'] ? 'collapsed' : ''}" style="max-width: 500px; margin: 0 auto;">
              <input type="text" placeholder="Your Name" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px;" readonly>
              <input type="email" placeholder="Your Email" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px;" readonly>
              <textarea placeholder="Your Message" rows="4" style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px;" readonly></textarea>
              <button style="background: #3498db; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: not-allowed;" disabled>Send Message</button>
            </div>
          </div>
        ` : ''}
        
        <!-- Podcast Preview -->
        ${selectedFeatures.generatePodcast ? `
          <div class="feature-preview" data-feature="podcast">
            <div class="feature-preview-banner">
              <span>📋 Preview: AI will generate a career podcast from your experience</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('podcast')">
              🎙️ AI Career Podcast
              <div class="collapse-icon ${collapsedSections['podcast'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['podcast'] ? 'collapsed' : ''}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; text-align: center;">
              <p style="margin-bottom: 15px;">Listen to an AI-generated summary of your career journey</p>
              <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                <span>🎵 ▶️ ⏸️ ⏹️ 🔊</span>
              </div>
              <p style="font-size: 12px; opacity: 0.8;">Audio will be generated after CV creation</p>
            </div>
          </div>
        ` : ''}
        
        <!-- Video Introduction Preview -->
        ${selectedFeatures.videoIntroduction ? `
          <div class="feature-preview" data-feature="video-introduction">
            <div class="feature-preview-banner">
              <span>📋 Preview: AI will generate a professional video introduction</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('video-introduction')">
              🎥 Video Introduction
              <div class="collapse-icon ${collapsedSections['video-introduction'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['video-introduction'] ? 'collapsed' : ''}" style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white;">
              <div style="width: 300px; height: 169px; background: rgba(0,0,0,0.3); border-radius: 8px; margin: 0 auto; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <div style="font-size: 48px;">🎬</div>
              </div>
              <p style="margin-bottom: 10px; font-weight: 600;">Personal Video Introduction</p>
              <p style="font-size: 12px; opacity: 0.8;">AI-generated 60-second professional introduction</p>
            </div>
          </div>
        ` : ''}
        
        <!-- Portfolio Gallery Preview -->
        ${selectedFeatures.portfolioGallery ? `
          <div class="feature-preview" data-feature="portfolio-gallery">
            <div class="feature-preview-banner">
              <span>📋 Preview: Interactive gallery showcasing your work and projects</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('portfolio-gallery')">
              🖼️ Portfolio Gallery
              <div class="collapse-icon ${collapsedSections['portfolio-gallery'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['portfolio-gallery'] ? 'collapsed' : ''}">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
                <div style="aspect-ratio: 16/9; background: linear-gradient(45deg, #f0f0f0, #e0e0e0); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666;">
                  🖼️ Project 1
                </div>
                <div style="aspect-ratio: 16/9; background: linear-gradient(45deg, #f0f0f0, #e0e0e0); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666;">
                  🖼️ Project 2
                </div>
                <div style="aspect-ratio: 16/9; background: linear-gradient(45deg, #f0f0f0, #e0e0e0); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666;">
                  🖼️ Project 3
                </div>
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- Testimonials Carousel Preview -->
        ${selectedFeatures.testimonialsCarousel ? `
          <div class="feature-preview" data-feature="testimonials-carousel">
            <div class="feature-preview-banner">
              <span>📋 Preview: Rotating testimonials and recommendations</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('testimonials-carousel')">
              💬 Testimonials
              <div class="collapse-icon ${collapsedSections['testimonials-carousel'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['testimonials-carousel'] ? 'collapsed' : ''}" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #3498db;">
              <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="width: 50px; height: 50px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  👤
                </div>
                <div>
                  <h4 style="margin: 0; color: #2c3e50; font-size: 16px;">John Smith</h4>
                  <p style="margin: 0; color: #666; font-size: 14px;">Senior Manager, TechCorp</p>
                </div>
              </div>
              <blockquote style="margin: 0; font-style: italic; color: #555; line-height: 1.6;">
                "An exceptional professional with outstanding technical skills and leadership qualities. Highly recommended for any challenging project."
              </blockquote>
              <div style="text-align: center; margin-top: 15px;">
                <span style="color: #3498db;">● ○ ○</span>
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- Availability Calendar Preview -->
        ${selectedFeatures.availabilityCalendar ? `
          <div class="feature-preview" data-feature="availability-calendar">
            <div class="feature-preview-banner">
              <span>📋 Preview: Visitors can see your availability and schedule meetings</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('availability-calendar')">
              📅 Interview Availability
              <div class="collapse-icon ${collapsedSections['availability-calendar'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['availability-calendar'] ? 'collapsed' : ''}" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border: 1px solid #e9ecef;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px;">Schedule an Interview</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">Click on an available time slot below</p>
              </div>
              
              <!-- Calendar Grid -->
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 15px; font-size: 12px;">
                <div style="padding: 8px; text-align: center; font-weight: 600; color: #666;">Mon</div>
                <div style="padding: 8px; text-align: center; font-weight: 600; color: #666;">Tue</div>
                <div style="padding: 8px; text-align: center; font-weight: 600; color: #666;">Wed</div>
                <div style="padding: 8px; text-align: center; font-weight: 600; color: #666;">Thu</div>
                <div style="padding: 8px; text-align: center; font-weight: 600; color: #666;">Fri</div>
                <div style="padding: 8px; text-align: center; font-weight: 600; color: #666;">Sat</div>
                <div style="padding: 8px; text-align: center; font-weight: 600; color: #666;">Sun</div>
                
                <!-- Calendar Days -->
                <div style="padding: 8px; text-align: center; color: #ccc;">28</div>
                <div style="padding: 8px; text-align: center; color: #ccc;">29</div>
                <div style="padding: 8px; text-align: center; color: #ccc;">30</div>
                <div style="padding: 8px; text-align: center; color: #333;">1</div>
                <div style="padding: 8px; text-align: center; color: #333;">2</div>
                <div style="padding: 8px; text-align: center; color: #333;">3</div>
                <div style="padding: 8px; text-align: center; color: #333;">4</div>
                
                <div style="padding: 8px; text-align: center; color: #333;">5</div>
                <div style="padding: 8px; text-align: center; color: #333;">6</div>
                <div style="padding: 8px; text-align: center; background: #e3f2fd; color: #1976d2; border-radius: 4px; cursor: pointer;">7</div>
                <div style="padding: 8px; text-align: center; color: #333;">8</div>
                <div style="padding: 8px; text-align: center; background: #e3f2fd; color: #1976d2; border-radius: 4px; cursor: pointer;">9</div>
                <div style="padding: 8px; text-align: center; color: #333;">10</div>
                <div style="padding: 8px; text-align: center; color: #333;">11</div>
                
                <div style="padding: 8px; text-align: center; background: #e3f2fd; color: #1976d2; border-radius: 4px; cursor: pointer;">12</div>
                <div style="padding: 8px; text-align: center; color: #333;">13</div>
                <div style="padding: 8px; text-align: center; background: #e3f2fd; color: #1976d2; border-radius: 4px; cursor: pointer;">14</div>
                <div style="padding: 8px; text-align: center; color: #333;">15</div>
                <div style="padding: 8px; text-align: center; color: #333;">16</div>
                <div style="padding: 8px; text-align: center; color: #333;">17</div>
                <div style="padding: 8px; text-align: center; color: #333;">18</div>
              </div>
              
              <!-- Time Slots -->
              <div style="border-top: 1px solid #e9ecef; padding-top: 15px;">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #2c3e50; font-size: 14px;">Available Time Slots:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <button style="padding: 6px 12px; background: #e3f2fd; color: #1976d2; border: 1px solid #bbdefb; border-radius: 6px; font-size: 12px; cursor: pointer;">9:00 AM</button>
                  <button style="padding: 6px 12px; background: #e3f2fd; color: #1976d2; border: 1px solid #bbdefb; border-radius: 6px; font-size: 12px; cursor: pointer;">11:00 AM</button>
                  <button style="padding: 6px 12px; background: #e3f2fd; color: #1976d2; border: 1px solid #bbdefb; border-radius: 6px; font-size: 12px; cursor: pointer;">2:00 PM</button>
                  <button style="padding: 6px 12px; background: #e3f2fd; color: #1976d2; border: 1px solid #bbdefb; border-radius: 6px; font-size: 12px; cursor: pointer;">4:00 PM</button>
                </div>
                <p style="margin: 10px 0 0 0; font-size: 11px; color: #666; font-style: italic;">All times shown in your local timezone</p>
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- ATS Analysis moved to CVAnalysisResults component -->
        
        <!-- Keyword Enhancement Preview -->
        ${selectedFeatures.keywordEnhancement ? `
          <div class="feature-preview" data-feature="keyword-enhancement">
            <div class="feature-preview-banner">
              <span>🎯 Enhanced: Keyword optimization powered by job market analysis</span>
              <button onclick="window.location.href='/keywords/${job.id}'" style="margin-left: 10px; padding: 4px 10px; background: #ed8936; color: #ffffff; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">Advanced →</button>
            </div>
            <h3 class="section-title" onclick="toggleSection('keyword-enhancement')">
              🎯 Smart Keywords
              <div class="collapse-icon ${collapsedSections['keyword-enhancement'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['keyword-enhancement'] ? 'collapsed' : ''}" style="background: #fff3e0; padding: 20px; border-radius: 12px; border-left: 4px solid #ff9800;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div>
                  <p style="margin: 0 0 8px 0; color: #e65100; font-weight: 600; font-size: 14px;">Industry Keywords:</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    <span style="background: #4caf50; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">Software Development</span>
                    <span style="background: #4caf50; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">Agile</span>
                    <span style="background: #4caf50; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">API Design</span>
                  </div>
                </div>
                <div>
                  <p style="margin: 0 0 8px 0; color: #d32f2f; font-weight: 600; font-size: 14px;">Missing Keywords:</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    <span style="background: #f44336; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">Machine Learning</span>
                    <span style="background: #f44336; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">DevOps</span>
                    <span style="background: #f44336; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">Cloud Architecture</span>
                  </div>
                </div>
              </div>
              <div style="text-align: center; padding: 10px; background: rgba(255,152,0,0.1); border-radius: 8px;">
                <p style="margin: 0; color: #e65100; font-size: 13px; font-weight: 600;">💡 Tip: Use Advanced Keyword Optimization to analyze specific job descriptions</p>
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- Achievement Highlighting Preview -->
        ${selectedFeatures.achievementHighlighting ? `
          <div class="feature-preview" data-feature="achievement-highlighting">
            <div class="feature-preview-banner">
              <span>🏆 Real achievement analysis extracting impact metrics from your CV</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('achievement-highlighting')">
              🏆 Achievement Analysis
              <div class="collapse-icon ${collapsedSections['achievement-highlighting'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['achievement-highlighting'] ? 'collapsed' : ''}" style="background: #f3e5f5; padding: 20px; border-radius: 12px; border-left: 4px solid #9c27b0;">
              ${!achievementAnalysis && !achievementLoading ? `
                <div style="text-align: center; padding: 20px;">
                  <div style="margin-bottom: 15px;">
                    <div style="width: 50px; height: 50px; background: #9c27b0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; color: white; font-size: 20px;">
                      🏆
                    </div>
                    <p style="color: #666; margin: 0; font-size: 14px;">Achievement analysis will run automatically</p>
                  </div>
                </div>
              ` : ''}
              
              ${achievementLoading ? `
                <div style="text-align: center; padding: 20px;">
                  <div style="width: 40px; height: 40px; border: 3px solid #9c27b0; border-radius: 50%; border-top-color: transparent; margin: 0 auto 10px; animation: spin 1s linear infinite;"></div>
                  <p style="color: #666; margin: 0;">Analyzing achievements and impact metrics...</p>
                  <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">Extracting quantifiable results</p>
                </div>
              ` : ''}
              
              ${achievementError ? `
                <div style="text-align: center; padding: 20px; color: #f44336;">
                  <div style="margin-bottom: 15px;">
                    <div style="width: 50px; height: 50px; background: #f44336; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; color: white; font-size: 20px;">
                      ⚠️
                    </div>
                    <p style="margin: 0; font-weight: 600;">Analysis Failed</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${achievementError}</p>
                  </div>
                  <div onclick="window.handleAchievementAnalysis && window.handleAchievementAnalysis()" style="background: #9c27b0; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; display: inline-block;">
                    🔄 Retry Analysis
                  </div>
                </div>
              ` : ''}
              
              ${achievementAnalysis ? `
                <div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="text-align: center; padding: 15px; background: rgba(156,39,176,0.1); border-radius: 8px;">
                      <div style="font-size: 24px; font-weight: bold; color: #9c27b0; margin-bottom: 5px;">${achievementAnalysis.stats?.total || 0}</div>
                      <div style="font-size: 12px; color: #666;">Total Achievements</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(156,39,176,0.1); border-radius: 8px;">
                      <div style="font-size: 24px; font-weight: bold; color: #9c27b0; margin-bottom: 5px;">${achievementAnalysis.stats?.withMetrics || 0}</div>
                      <div style="font-size: 12px; color: #666;">With Metrics</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(156,39,176,0.1); border-radius: 8px;">
                      <div style="font-size: 24px; font-weight: bold; color: #9c27b0; margin-bottom: 5px;">${achievementAnalysis.stats?.highImpact || 0}</div>
                      <div style="font-size: 12px; color: #666;">High Impact</div>
                    </div>
                  </div>
                  
                  ${achievementAnalysis.achievements && achievementAnalysis.achievements.length > 0 ? `
                    <div style="margin-bottom: 15px;">
                      <h5 style="color: #9c27b0; margin-bottom: 10px; font-size: 14px;">🎯 Top Achievements:</h5>
                      ${achievementAnalysis.achievements.slice(0, 3).map((achievement: any) => `
                        <div style="margin-bottom: 12px; padding: 12px; background: rgba(255,255,255,0.5); border-radius: 6px; border-left: 3px solid #9c27b0;">
                          <div style="font-weight: 600; color: #333; margin-bottom: 4px;">${achievement.title}</div>
                          <div style="font-size: 12px; color: #666; margin-bottom: 6px;">${achievement.company} • ${achievement.category}</div>
                          <div style="font-size: 11px; color: #9c27b0;">Impact Score: ${achievement.significance}/10</div>
                          ${achievement.metrics ? `
                            <div style="margin-top: 6px;">
                              ${achievement.metrics.slice(0, 2).map((metric: string) => `
                                <span style="background: #9c27b0; color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-right: 4px;">${metric}</span>
                              `).join('')}
                            </div>
                          ` : ''}
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                  
                  ${achievementAnalysis.recommendations && achievementAnalysis.recommendations.length > 0 ? `
                    <div style="margin-bottom: 15px;">
                      <h5 style="color: #f57c00; margin-bottom: 8px; font-size: 14px;">💡 Recommendations:</h5>
                      <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 13px;">
                        ${achievementAnalysis.recommendations.slice(0, 3).map((rec: string) => `<li style="margin-bottom: 4px;">${rec}</li>`).join('')}
                      </ul>
                    </div>
                  ` : ''}
                  
                  <div style="text-align: center; margin-top: 15px;">
                    <div onclick="window.handleAchievementAnalysis && window.handleAchievementAnalysis()" style="background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; display: inline-block;">
                      🔄 Re-analyze
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        <!-- Skills Visualization Preview -->
        ${selectedFeatures.skillsVisualization ? `
          <div class="feature-preview" data-feature="skills-visualization">
            <div class="feature-preview-banner">
              <span>📋 Preview: Transform skill lists into engaging visual charts</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('skills-visualization')">
              📊 Visual Skills
              <div class="collapse-icon ${collapsedSections['skills-visualization'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['skills-visualization'] ? 'collapsed' : ''}" style="background: #e1f5fe; padding: 20px; border-radius: 12px; border-left: 4px solid #03a9f4;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div>
                  <h5 style="margin: 0 0 10px 0; color: #0277bd;">Technical Skills</h5>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <span style="background: #03a9f4; color: white; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 600;">JavaScript</span>
                    <span style="background: #03a9f4; color: white; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 600;">React</span>
                    <span style="background: #03a9f4; color: white; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 600;">Node.js</span>
                  </div>
                </div>
                <div>
                  <h5 style="margin: 0 0 10px 0; color: #0277bd;">Soft Skills</h5>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    <span style="background: #03a9f4; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px;">Leadership</span>
                    <span style="background: #03a9f4; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px;">Communication</span>
                    <span style="background: #03a9f4; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px;">Problem Solving</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}
        
        <!-- Privacy Mode Preview -->
        ${selectedFeatures.privacyMode ? `
          <div class="feature-preview" data-feature="privacy-mode">
            <div class="feature-preview-banner">
              <span>📋 Preview: Personal information protected for public sharing</span>
            </div>
            <h3 class="section-title" onclick="toggleSection('privacy-mode')">
              🛡️ Privacy Protection
              <div class="collapse-icon ${collapsedSections['privacy-mode'] ? 'collapsed' : ''}">▼</div>
            </h3>
            <div class="section-content ${collapsedSections['privacy-mode'] ? 'collapsed' : ''}" style="background: #ffebee; padding: 20px; border-radius: 12px; border-left: 4px solid #f44336;">
              <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="width: 50px; height: 50px; background: #f44336; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                  🛡️
                </div>
                <div>
                  <h4 style="margin: 0; color: #c62828;">Privacy Mode Active</h4>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Sensitive information masked</p>
                </div>
              </div>
              <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ffcdd2;">
                <p style="margin: 0 0 10px 0; color: #333;"><strong>Name:</strong> J*** D***</p>
                <p style="margin: 0 0 10px 0; color: #333;"><strong>Email:</strong> j****@*****.com</p>
                <p style="margin: 0 0 10px 0; color: #333;"><strong>Phone:</strong> +1 (***) ***-1234</p>
                <p style="margin: 0; color: #333;"><strong>Address:</strong> New York, NY</p>
              </div>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 12px; font-style: italic;">Personal details masked while maintaining professional appeal</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.innerHTML = generatePreviewHTML();
      
      // Add click handlers for editing
      const editButtons = previewRef.current.querySelectorAll('.edit-overlay');
      editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const section = (e.target as HTMLElement).closest('.editable-section')?.getAttribute('data-section');
          if (section) {
            setEditingSection(section);
            setIsEditing(true);
          }
        });
      });

      // Add click handlers for collapsing sections
      const sectionTitles = previewRef.current.querySelectorAll('.section-title');
      sectionTitles.forEach(title => {
        title.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const sectionElement = (e.target as HTMLElement).closest('.section, .feature-preview');
          const sectionId = sectionElement?.getAttribute('data-section') || 
                           sectionElement?.getAttribute('data-feature') ||
                           (e.target as HTMLElement).textContent?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
          
          if (sectionId) {
            toggleSection(sectionId);
          }
        });
      });

      // Add global functions for QR code editing
      (window as any).editQRCode = () => {
        setIsEditingQRCode(true);
      };

      // Add smooth animations for feature previews
      const featurePreviews = previewRef.current.querySelectorAll('.feature-preview');
      featurePreviews.forEach((preview, index) => {
        (preview as HTMLElement).style.animationDelay = `${index * 200}ms`;
        preview.classList.add('animate-fade-in-up');
      });
    }
  }, [previewData, selectedTemplate, selectedFeatures, showFeaturePreviews, collapsedSections, achievementLoading, achievementAnalysis, achievementError]);

  // Real-time feature updates
  useEffect(() => {
    if (previewRef.current) {
      // Smoothly update only feature previews when selectedFeatures changes
      const featurePreviews = previewRef.current.querySelectorAll('.feature-preview');
      featurePreviews.forEach(preview => {
        const featureId = preview.getAttribute('data-feature');
        if (featureId) {
          const isEnabled = selectedFeatures[featureId.replace(/-/g, '')];
          if (!isEnabled) {
            preview.classList.add('opacity-50');
            preview.classList.add('pointer-events-none');
          } else {
            preview.classList.remove('opacity-50');
            preview.classList.remove('pointer-events-none');
          }
        }
      });
    }
  }, [selectedFeatures]);

  // Auto-save functionality
  const triggerAutoSave = (updatedData: any) => {
    if (!autoSaveEnabled) return;
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = window.setTimeout(() => {
      onUpdate?.(updatedData);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && onUpdate) {
          onUpdate(previewData);
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        }
      }
      
      // Escape to close editor
      if (e.key === 'Escape' && isEditing) {
        setIsEditing(false);
        setEditingSection(null);
      }
      
      // Ctrl+E or Cmd+E to toggle edit mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setIsEditing(!isEditing);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, hasUnsavedChanges, previewData, onUpdate]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Toggle section collapse
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Expand all sections
  const expandAllSections = () => {
    setCollapsedSections({});
  };

  // Collapse all sections
  const collapseAllSections = () => {
    const allSections = [
      'summary', 
      'experience', 
      'education', 
      'skills', 
      'interactive-timeline', 
      'skills-chart', 
      'language-proficiency', 
      'certification-badges', 
      'social-media-links', 
      'achievements-showcase',
      'qr-code',
      'contact-form',
      'podcast',
      'video-introduction',
      'portfolio-gallery',
      'testimonials-carousel',
      'availability-calendar',
      'ats-optimization',
      'keyword-enhancement',
      'achievement-highlighting',
      'skills-visualization',
      'privacy-mode'
    ];
    const collapsed: Record<string, boolean> = {};
    allSections.forEach(section => {
      collapsed[section] = true;
    });
    setCollapsedSections(collapsed);
  };

  // Handle QR code settings updates
  const handleQRCodeUpdate = (newSettings: typeof qrCodeSettings) => {
    setQrCodeSettings(newSettings);
    setHasUnsavedChanges(true);
    
    // Trigger auto-save
    if (autoSaveEnabled) {
      triggerAutoSave({ ...previewData, qrCodeSettings: newSettings });
    } else {
      onUpdate?.({ ...previewData, qrCodeSettings: newSettings });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
    
    setIsEditingQRCode(false);
  };

  const handleSectionEdit = (section: string, newValue: any) => {
    const updatedData = { ...previewData };
    
    switch (section) {
      case 'personalInfo':
        updatedData.personalInfo = { ...updatedData.personalInfo, ...newValue };
        break;
      case 'summary':
        updatedData.summary = newValue;
        break;
      case 'experience':
        updatedData.experience = newValue;
        break;
      case 'education':
        updatedData.education = newValue;
        break;
      case 'skills':
        updatedData.skills = { ...updatedData.skills, ...newValue };
        break;
    }
    
    setPreviewData(updatedData);
    setHasUnsavedChanges(true);
    setEditingSection(null);
    setIsEditing(false);
    
    // Trigger auto-save
    if (autoSaveEnabled) {
      triggerAutoSave(updatedData);
    } else {
      // If auto-save is disabled, save immediately
      onUpdate?.(updatedData);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
  };

  // ATS analysis functionality moved to CVAnalysisResults component

  // Handle Achievement analysis
  const handleAchievementAnalysis = async () => {
    if (achievementLoading) return;
    
    setAchievementLoading(true);
    setAchievementError(null);
    
    try {
      const result = await analyzeAchievements(job.id);
      setAchievementAnalysis(result);
    } catch (error: any) {
      setAchievementError(error.message || 'Failed to analyze achievements');
      console.error('Achievement analysis failed:', error);
    } finally {
      setAchievementLoading(false);
    }
  };

  // ATS state debugging removed

  // ATS analysis state management removed

  // ATS analysis auto-triggering removed

  // Auto-trigger achievement analysis when achievement highlighting feature is selected
  useEffect(() => {
    if (selectedFeatures.achievementHighlighting && !achievementAnalysis && !achievementLoading) {
      handleAchievementAnalysis();
    }
  }, [selectedFeatures.achievementHighlighting, job.id]);

  // Expose analysis functions to window for inline HTML calls
  useEffect(() => {
    (window as any).handleAchievementAnalysis = handleAchievementAnalysis;
    
    return () => {
      delete (window as any).handleAchievementAnalysis;
    };
  }, [handleAchievementAnalysis]);

  return (
    <div className={`cv-preview-wrapper ${className}`}>
      {/* Improvements Applied Banner */}
      {appliedImprovements && showPreviewBanner && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 p-4 mb-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✨</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-900">
                  AI Improvements Applied
                </h3>
                <p className="text-sm text-green-700">
                  Your CV content has been enhanced with AI-powered improvements. The preview below shows your optimized CV.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPreviewBanner(false)}
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Preview Controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Live Preview
            {hasUnsavedChanges && (
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full animate-pulse">
                {autoSaveEnabled ? 'Auto-saving...' : 'Unsaved'}
              </span>
            )}
            {lastSaved && !hasUnsavedChanges && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </h3>
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-200">
            {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
              autoSaveEnabled
                ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
            title={autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled'}
          >
            <div className={`w-2 h-2 rounded-full ${autoSaveEnabled ? 'bg-green-400' : 'bg-gray-500'}`} />
            Auto-save
          </button>
          
          <div className="flex items-center gap-1">
            <button
              onClick={expandAllSections}
              className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-l hover:bg-blue-600/30 transition-all"
              title="Expand all sections"
            >
              ▼ All
            </button>
            <button
              onClick={collapseAllSections}
              className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-r hover:bg-blue-600/30 transition-all"
              title="Collapse all sections"
            >
              ▶ All
            </button>
          </div>
          
          <button
            onClick={() => setShowFeaturePreviews(!showFeaturePreviews)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showFeaturePreviews
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showFeaturePreviews ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Previews
          </button>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isEditing
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                : 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
            }`}
            title="Ctrl+E to toggle"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            Edit
          </button>
        </div>
      </div>

      {/* Feature Selection Summary */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-800">Selected Features:</h4>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {Object.values(selectedFeatures).filter(Boolean).length} active
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(selectedFeatures).length === 0 ? (
            <span className="text-xs text-gray-600 italic">No features selected</span>
          ) : (
            Object.entries(selectedFeatures).map(([feature, enabled]) => (
              <span
                key={feature}
                className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                  enabled 
                    ? 'bg-cyan-100 text-cyan-700 border border-cyan-200 scale-100' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 scale-95 opacity-60'
                }`}
              >
                {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
            ))
          )}
        </div>
        {Object.values(selectedFeatures).filter(Boolean).length > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              💡 Preview shows what these features will look like in your generated CV
            </div>
            {onFeatureToggle && (
              <button
                onClick={() => setShowFeaturePreviews(!showFeaturePreviews)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {showFeaturePreviews ? 'Hide Previews' : 'Show Previews'}
              </button>
            )}
          </div>
        )}
        
        {/* Keyboard Shortcuts Help */}
        <div className="mt-2 text-xs text-gray-500 border-t border-gray-700/50 pt-2">
          <div className="flex flex-wrap gap-4">
            <span><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl+E</kbd> Toggle Edit</span>
            <span><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl+S</kbd> Save</span>
            <span><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Esc</kbd> Close Editor</span>
            <span><kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Click</kbd> Section titles to collapse</span>
          </div>
        </div>
      </div>

      {/* CV Preview */}
      <div className="cv-preview-container bg-white rounded-lg shadow-xl overflow-hidden">
        <div 
          ref={previewRef}
          className="cv-preview-content"
          style={{ minHeight: '800px' }}
        />
      </div>

      {/* Edit Modal */}
      {isEditing && editingSection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-gray-100 capitalize">
                Edit {editingSection.replace(/([A-Z])/g, ' $1')}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingSection(null);
                }}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <SectionEditor
                section={editingSection}
                data={previewData?.[editingSection as keyof typeof previewData]}
                onSave={handleSectionEdit}
                onCancel={() => {
                  setIsEditing(false);
                  setEditingSection(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* QR Code Settings Modal */}
      {isEditingQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">QR Code Settings</h3>
              <button
                onClick={() => setIsEditingQRCode(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <QRCodeEditor
              settings={qrCodeSettings}
              jobId={job.id}
              onSave={handleQRCodeUpdate}
              onCancel={() => setIsEditingQRCode(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};