import React, { useState, useEffect } from 'react';
import { CVFeatureProps } from '../../../types/cv-features';
import { useFeatureData } from '../../../hooks/useFeatureData';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface PublicProfileData {
  profileUrl: string;
  customSlug: string;
  isActive: boolean;
  analytics: {
    totalViews: number;
    uniqueVisitors: number;
    viewsThisMonth: number;
    averageTimeOnPage: number;
    topReferrers: string[];
    geographicData: { country: string; views: number }[];
    deviceTypes: { device: string; percentage: number }[];
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage: string;
  };
  privacy: {
    showContactInfo: boolean;
    showExperience: boolean;
    showEducation: boolean;
    showSkills: boolean;
    showProjects: boolean;
    passwordProtected: boolean;
    allowedDomains: string[];
  };
  customizations: {
    theme: 'professional' | 'creative' | 'minimal' | 'modern';
    primaryColor: string;
    font: string;
    showBranding: boolean;
    customCSS?: string;
  };
  tracking: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    linkedinInsightTag?: string;
  };
}

interface PublicProfileProps extends CVFeatureProps {
  showAnalytics?: boolean;
  showCustomization?: boolean;
  showSEOSettings?: boolean;
  allowPasswordProtection?: boolean;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization,
  onUpdate,
  onError,
  className = '',
  mode = 'private',
  showAnalytics = true,
  showCustomization = true,
  showSEOSettings = true,
  allowPasswordProtection = true
}) => {
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [customSlugInput, setCustomSlugInput] = useState('');
  const [isValidatingSlug, setIsValidatingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const {
    data: profileData,
    loading,
    error,
    refetch
  } = useFeatureData(
    'getPublicProfile',
    { jobId, profileId },
    { enabled: isEnabled }
  );

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setCustomSlugInput(profileData.customSlug || '');
      onUpdate?.(profileData);
    }
  }, [profileData, onUpdate]);

  const validateSlug = async (slug: string) => {
    if (!slug || slug === profile?.customSlug) {
      setSlugAvailable(null);
      return;
    }

    setIsValidatingSlug(true);
    try {
      const response = await fetch(`/api/validateSlug?slug=${encodeURIComponent(slug)}`);
      const result = await response.json();
      setSlugAvailable(result.available);
    } catch (err) {
      console.error('Slug validation failed:', err);
      setSlugAvailable(false);
    } finally {
      setIsValidatingSlug(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (customSlugInput !== profile?.customSlug) {
        validateSlug(customSlugInput);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [customSlugInput, profile?.customSlug]);

  const generateProfile = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generatePublicProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          profileId,
          customSlug: customSlugInput,
          settings: {
            theme: 'professional',
            privacy: {
              showContactInfo: true,
              showExperience: true,
              showEducation: true,
              showSkills: true,
              showProjects: true,
              passwordProtected: false,
              allowedDomains: []
            }
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(result.profile);
        onUpdate?.({ profile: result.profile, generated: true });
      } else {
        throw new Error('Failed to generate public profile');
      }
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateProfileSettings = async (settings: Partial<PublicProfileData>) => {
    try {
      const response = await fetch('/api/updatePublicProfile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          profileId,
          updates: settings
        })
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(result.profile);
        onUpdate?.(result.profile);
      } else {
        throw new Error('Failed to update profile settings');
      }
    } catch (err) {
      onError?.(err as Error);
    }
  };

  const toggleProfileStatus = () => {
    if (profile) {
      updateProfileSettings({ isActive: !profile.isActive });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <FeatureWrapper className={className} title="Public Profile">
        <LoadingSpinner message="Loading public profile..." />
      </FeatureWrapper>
    );
  }

  if (error) {
    return (
      <FeatureWrapper className={className} title="Public Profile">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          <p className="font-medium">Failed to Load Profile</p>
          <p className="text-sm mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </FeatureWrapper>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈', show: showAnalytics },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'seo', label: 'SEO', icon: '🔍', show: showSEOSettings },
    { id: 'customization', label: 'Design', icon: '🎨', show: showCustomization }
  ].filter(tab => tab.show !== false);

  return (
    <FeatureWrapper className={className} title="Public Profile Management">
      <div className="space-y-6">
        {profile ? (
          <>
            {/* Profile Status Header */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Public Profile Status
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your professional profile is {profile.isActive ? 'live' : 'inactive'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {profile.isActive ? '🟢 Live' : '⚪ Inactive'}
                  </span>
                  <button
                    onClick={toggleProfileStatus}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      profile.isActive
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {profile.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile URL
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={profile.profileUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-600"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(profile.profileUrl)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Slug
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customSlugInput}
                      onChange={(e) => setCustomSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your-custom-slug"
                    />
                    {isValidatingSlug && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                      </div>
                    )}
                    {slugAvailable === true && (
                      <div className="absolute right-3 top-3 text-green-500">✓</div>
                    )}
                    {slugAvailable === false && (
                      <div className="absolute right-3 top-3 text-red-500">✗</div>
                    )}
                  </div>
                  {slugAvailable === false && (
                    <p className="text-xs text-red-600 mt-1">This slug is already taken</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <a
                  href={profile.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Profile
                </a>
                <button
                  onClick={() => setShowQRCode(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  QR Code
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              <div 
                key={activeTab}
                className="animate-fade-in min-h-[400px]"
              >
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg border">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {formatNumber(profile.analytics.totalViews)}
                      </div>
                      <div className="text-sm text-gray-600">Total Views</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {formatNumber(profile.analytics.uniqueVisitors)}
                      </div>
                      <div className="text-sm text-gray-600">Unique Visitors</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {formatTime(profile.analytics.averageTimeOnPage)}
                      </div>
                      <div className="text-sm text-gray-600">Avg. Time on Page</div>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && showAnalytics && (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatNumber(profile.analytics.viewsThisMonth)}
                        </div>
                        <div className="text-sm text-gray-600">Views This Month</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-gray-900">
                          {profile.analytics.topReferrers.length}
                        </div>
                        <div className="text-sm text-gray-600">Traffic Sources</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-gray-900">
                          {profile.analytics.geographicData.length}
                        </div>
                        <div className="text-sm text-gray-600">Countries</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-2xl font-bold text-gray-900">
                          {profile.analytics.deviceTypes.length}
                        </div>
                        <div className="text-sm text-gray-600">Device Types</div>
                      </div>
                    </div>

                    {/* Top Referrers */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Top Traffic Sources
                      </h4>
                      <div className="space-y-2">
                        {profile.analytics.topReferrers.map((referrer, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <span className="text-gray-700">{referrer}</span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${Math.max(10, 100 - index * 20)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Geographic Data */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Geographic Distribution
                      </h4>
                      <div className="space-y-2">
                        {profile.analytics.geographicData.slice(0, 5).map((geo, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <span className="text-gray-700">{geo.country}</span>
                            <span className="font-medium text-gray-900">
                              {formatNumber(geo.views)} views
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Privacy Settings */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Privacy Settings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(profile.privacy).map(([key, value]) => {
                          if (key === 'allowedDomains') return null;
                          
                          return (
                            <label key={key} className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={value as boolean}
                                onChange={(e) => updateProfileSettings({
                                  privacy: {
                                    ...profile.privacy,
                                    [key]: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tracking Settings */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Analytics Tracking
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Google Analytics ID
                          </label>
                          <input
                            type="text"
                            value={profile.tracking.googleAnalyticsId || ''}
                            onChange={(e) => updateProfileSettings({
                              tracking: {
                                ...profile.tracking,
                                googleAnalyticsId: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="GA-XXXXXXXXX-X"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'seo' && showSEOSettings && (
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      SEO Settings
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={profile.seoSettings.metaTitle}
                          onChange={(e) => updateProfileSettings({
                            seoSettings: {
                              ...profile.seoSettings,
                              metaTitle: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength={60}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {60 - profile.seoSettings.metaTitle.length} characters remaining
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Meta Description
                        </label>
                        <textarea
                          value={profile.seoSettings.metaDescription}
                          onChange={(e) => updateProfileSettings({
                            seoSettings: {
                              ...profile.seoSettings,
                              metaDescription: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          maxLength={160}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {160 - profile.seoSettings.metaDescription.length} characters remaining
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Keywords
                        </label>
                        <input
                          type="text"
                          value={profile.seoSettings.keywords.join(', ')}
                          onChange={(e) => updateProfileSettings({
                            seoSettings: {
                              ...profile.seoSettings,
                              keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'customization' && showCustomization && (
                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Theme
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(['professional', 'creative', 'minimal', 'modern'] as const).map(theme => (
                          <button
                            key={theme}
                            onClick={() => updateProfileSettings({
                              customizations: {
                                ...profile.customizations,
                                theme
                              }
                            })}
                            className={`p-4 border-2 rounded-lg text-center transition-colors ${
                              profile.customizations.theme === theme
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium capitalize mb-1">{theme}</div>
                            <div className="text-xs text-gray-600">
                              {theme === 'professional' && 'Clean & corporate'}
                              {theme === 'creative' && 'Bold & colorful'}
                              {theme === 'minimal' && 'Simple & elegant'}
                              {theme === 'modern' && 'Contemporary design'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Customization */}
                    <div className="bg-white p-6 rounded-lg border">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Brand Colors
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Primary Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={profile.customizations.primaryColor}
                              onChange={(e) => updateProfileSettings({
                                customizations: {
                                  ...profile.customizations,
                                  primaryColor: e.target.value
                                }
                              })}
                              className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={profile.customizations.primaryColor}
                              onChange={(e) => updateProfileSettings({
                                customizations: {
                                  ...profile.customizations,
                                  primaryColor: e.target.value
                                }
                              })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Font Family
                          </label>
                          <select
                            value={profile.customizations.font}
                            onChange={(e) => updateProfileSettings({
                              customizations: {
                                ...profile.customizations,
                                font: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Poppins">Poppins</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* No Profile - Generation Interface */
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-5 0-9-4-9-9m9 9c5 0 9-4 9-9m-9 9V3m0 9H3" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Create Your Public Profile
              </h3>
              <p className="text-gray-600 mb-6">
                Generate a professional public profile that you can share with employers and clients
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom URL Slug (Optional)
                </label>
                <div className="flex">
                  <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-sm">
                    cvplus.ai/
                  </span>
                  <input
                    type="text"
                    value={customSlugInput}
                    onChange={(e) => setCustomSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your-name"
                  />
                </div>
                {slugAvailable === false && (
                  <p className="text-xs text-red-600 mt-1">This slug is already taken</p>
                )}
              </div>

              <button
                onClick={generateProfile}
                disabled={isGenerating || slugAvailable === false}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  isGenerating || slugAvailable === false
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Generating Profile...
                  </div>
                ) : (
                  'Create Public Profile'
                )}
              </button>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        <div>
          {showQRCode && profile && (
            <div className="animate-fade-in fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowQRCode(false)}
            >
              <div 
                className="bg-white rounded-lg p-6 max-w-sm w-full animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Profile QR Code
                  </h3>
                  <div className="bg-white p-4 border rounded-lg mb-4">
                    {/* QR Code would be generated here */}
                    <div className="w-48 h-48 mx-auto bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-500">QR Code</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan to view profile
                  </p>
                  <button
                    onClick={() => setShowQRCode(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </FeatureWrapper>
  );
};

export default PublicProfile;