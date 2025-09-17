/**
 * CVPersonalInfo Component
 * 
 * Displays personal information section with clean JSON data integration.
 * Replaces HTML-based personal info with pure React implementation.
 */

import React, { memo, useState, useCallback } from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar, Award } from 'lucide-react';

// Utility function to highlight placeholders in text
const highlightPlaceholders = (text: string): React.ReactNode[] => {
  if (!text) return [text];
  
  return text.split(/(\[INSERT[^\]]*\]|\[ADD[^\]]*\]|\[NUMBER[^\]]*\])/).map((part, index) => 
    /\[(INSERT|ADD|NUMBER)[^\]]*\]/.test(part) ? (
      <span key={index} className="bg-yellow-200 px-1 py-0.5 rounded text-black font-medium border">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};
import { ProfilePictureUpload } from '../../components/ProfilePictureUpload';
import { CVUpdateService } from '../../services/cvUpdateService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface PersonalInfoData {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  avatar?: string;
  yearsExperience?: number;
  certifications?: string[];
  languages?: Array<{
    name: string;
    level: string;
  }>;
  [key: string]: any;
}

interface CVPersonalInfoProps {
  data: PersonalInfoData;
  jobId?: string;
  metadata?: {
    jobId: string;
    status: string;
    lastUpdated: string;
    userId: string;
  };
  className?: string;
}

export const CVPersonalInfo: React.FC<CVPersonalInfoProps> = memo(({
  data,
  jobId,
  metadata,
  className = ''
}) => {
  const { user } = useAuth();
  const [currentAvatar, setCurrentAvatar] = useState(data.avatar || '');
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // Handle profile picture update
  const handleProfilePictureUpdate = useCallback(async (imageUrl: string, imagePath: string) => {
    if (!jobId || !user) {
      toast.error('Unable to update profile picture');
      return;
    }

    setIsUpdatingAvatar(true);
    
    try {
      const response = await CVUpdateService.updateProfilePictureOptimistic(
        jobId,
        imageUrl,
        imagePath,
        setCurrentAvatar
      );
      
      if (response.success) {
        setCurrentAvatar(imageUrl);
      }
    } catch (error) {
      console.error('Profile picture update failed:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUpdatingAvatar(false);
    }
  }, [jobId, user]);

  // Debug logging for comparison purposes
  if (process.env.NODE_ENV === 'development') {
    console.log('[CVPersonalInfo] Raw data received:', {
      name: data.name,
      title: data.title,
      rawDataKeys: Object.keys(data),
      hasTitle: 'title' in data && data.title,
      titleValue: data.title
    });
  }

  // Safely extract data with fallbacks
  const {
    name = 'Professional Name',
    title = data.title || 'Professional Title',
    email = '',
    phone = '',
    location = '',
    website = '',
    linkedin = '',
    github = '',
    summary = '',
    avatar = '',
    yearsExperience = 0,
    certifications = [],
    languages = []
  } = data;

  // Format experience display
  const experienceText = yearsExperience > 0 
    ? `${yearsExperience} ${yearsExperience === 1 ? 'year' : 'years'} experience`
    : '';

  // Contact info items with icons
  const contactItems = [
    { icon: Mail, text: email, href: `mailto:${email}`, show: !!email },
    { icon: Phone, text: phone, href: `tel:${phone}`, show: !!phone },
    { icon: MapPin, text: location, href: null, show: !!location },
    { icon: Globe, text: website, href: website, show: !!website },
    { icon: Linkedin, text: 'LinkedIn Profile', href: linkedin, show: !!linkedin },
    { icon: Github, text: 'GitHub Profile', href: github, show: !!github },
  ].filter(item => item.show);

  return (
    <section className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Profile Picture with Upload */}
          <div className="flex-shrink-0 relative">
            <div 
              className="relative group"
              onMouseEnter={() => {
                // Show upload circle on hover of profile picture area
                const uploadCircle = document.querySelector('.profile-upload-circle') as HTMLElement;
                if (uploadCircle) {
                  uploadCircle.style.opacity = '1';
                }
              }}
              onMouseLeave={() => {
                // Hide upload circle when not hovering
                const uploadCircle = document.querySelector('.profile-upload-circle') as HTMLElement;
                if (uploadCircle && !uploadCircle.matches(':hover')) {
                  uploadCircle.style.opacity = '0';
                }
              }}
            >
              {/* Display current avatar or initials */}
              {currentAvatar || avatar ? (
                <img
                  src={currentAvatar || avatar}
                  alt={`${name} profile picture`}
                  className={`w-24 h-24 rounded-full border-4 border-white/20 object-cover transition-opacity duration-200 ${
                    isUpdatingAvatar ? 'opacity-50' : ''
                  }`}
                  onError={(e) => {
                    // Fallback to initials if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              {/* Initials fallback */}
              <div 
                className={`w-24 h-24 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center text-2xl font-bold transition-opacity duration-200 ${
                  currentAvatar || avatar ? 'hidden' : ''
                } ${
                  isUpdatingAvatar ? 'opacity-50' : ''
                }`}
              >
                {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              
              {/* Upload overlay */}
              {user && (
                <div className="absolute inset-0">
                  <ProfilePictureUpload
                    currentImageUrl={currentAvatar || avatar}
                    onImageUpdate={handleProfilePictureUpdate}
                    userId={user.uid}
                    jobId={jobId}
                    size="large"
                    disabled={isUpdatingAvatar}
                    className=""
                    showUserInfo={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Name and title */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{name}</h1>
            <h2 className="text-xl text-white/90 font-medium mb-3">{highlightPlaceholders(title)}</h2>
            
            {/* Experience badge */}
            {experienceText && (
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                <Calendar className="w-4 h-4" />
                {experienceText}
              </div>
            )}
            
            {/* Certifications count */}
            {certifications.length > 0 && (
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm ml-2">
                <Award className="w-4 h-4" />
                {certifications.length} {certifications.length === 1 ? 'Certification' : 'Certifications'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {contactItems.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactItems.map((item, index) => {
              const IconComponent = item.icon;
              const content = (
                <div className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-600 transition-colors">
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.text}</span>
                </div>
              );

              return item.href ? (
                <a
                  key={index}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block hover:bg-gray-100 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors"
                >
                  {content}
                </a>
              ) : (
                <div key={index} className="block px-2 py-1">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Professional Summary */}
      {summary && (
        <div className="px-6 py-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-gray-700 leading-relaxed">{highlightPlaceholders(summary)}</p>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((language, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100"
              >
                <span className="font-medium">{language.name}</span>
                <span className="text-blue-500">•</span>
                <span className="text-xs">{language.level}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Certifications Preview */}
      {certifications.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {certifications.slice(0, 3).map((cert, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100"
              >
                <Award className="w-3 h-3" />
                {cert}
              </span>
            ))}
            {certifications.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{certifications.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

    </section>
  );
});

CVPersonalInfo.displayName = 'CVPersonalInfo';

export default CVPersonalInfo;