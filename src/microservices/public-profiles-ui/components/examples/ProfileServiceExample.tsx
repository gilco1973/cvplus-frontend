import React, { useState, useEffect } from 'react';
import {
  useProfileService,
  useProfile,
  useProfileAnalytics
} from '../../hooks/useProfileService';
import {
  PublicProfileData,
  ProfileOptions,
  ProfileUpdate,
  QROptions,
  EmbedOptions,
  PrivacySettings,
  SocialPlatform
} from '../../types/service.types';

/**
 * Example component demonstrating ProfileService usage
 * Shows all major functionality including CRUD operations, analytics, sharing, etc.
 */
export const ProfileServiceExample: React.FC = () => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [embedCode, setEmbedCode] = useState<string>('');

  // Use the ProfileService hook for general operations
  const {
    loading,
    error,
    profiles,
    templates,
    analytics,
    createProfile,
    loadUserProfiles,
    loadTemplates,
    generateShareURL,
    generateQRCode,
    generateEmbedCode,
    updatePrivacySettings,
    trackView,
    trackEngagement,
    clearError
  } = useProfileService();

  // Use profile-specific hook for selected profile
  const {
    profile: selectedProfile,
    loading: profileLoading,
    error: profileError,
    updateProfile,
    loadAnalytics
  } = useProfile(selectedProfileId);

  // Use analytics hook for detailed analytics
  const {
    analytics: detailedAnalytics,
    loading: analyticsLoading,
    error: analyticsError
  } = useProfileAnalytics(selectedProfileId, { days: 30 });

  // Load initial data
  useEffect(() => {
    loadUserProfiles();
    loadTemplates();
  }, [loadUserProfiles, loadTemplates]);

  // Example: Create a new profile
  const handleCreateProfile = async () => {
    clearError();

    const profileData: PublicProfileData = {
      id: '', // Will be generated
      userId: '', // Will be set by service
      name: 'Jane Doe',
      title: 'Senior Software Engineer',
      bio: 'Passionate full-stack developer with expertise in React, Node.js, and cloud technologies. Love building scalable applications that make a difference.',
      location: 'San Francisco, CA',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      experience: [
        {
          id: '1',
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          startDate: '2020-01-01',
          current: true,
          description: 'Led development of microservices architecture serving 1M+ users',
          achievements: [
            'Reduced API response time by 40%',
            'Mentored 5 junior developers',
            'Implemented CI/CD pipeline'
          ],
          skills: ['React', 'Node.js', 'AWS', 'TypeScript'],
          location: 'San Francisco, CA'
        }
      ],
      education: [
        {
          id: '1',
          institution: 'Stanford University',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2016-09-01',
          endDate: '2020-05-01',
          achievements: ['Magna Cum Laude', 'Dean\'s List'],
          description: 'Focused on distributed systems and machine learning'
        }
      ],
      skills: [
        {
          id: '1',
          name: 'React',
          category: 'Frontend',
          proficiency: 'expert',
          years: 4,
          endorsed: true,
          endorsements: 15
        },
        {
          id: '2',
          name: 'Node.js',
          category: 'Backend',
          proficiency: 'advanced',
          years: 3,
          endorsed: true,
          endorsements: 12
        }
      ],
      portfolio: [
        {
          id: '1',
          title: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution built with React and Node.js',
          category: 'Web Application',
          images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800'],
          links: [
            { name: 'Live Demo', url: 'https://demo.example.com' },
            { name: 'GitHub', url: 'https://github.com/example/ecommerce' }
          ],
          technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          dateCreated: '2023-06-01',
          featured: true
        }
      ],
      contact: {
        email: 'jane.doe@example.com',
        website: 'https://janedoe.dev',
        preferredContactMethod: 'email',
        availability: 'Open to opportunities'
      },
      privacy: {
        level: 'public',
        allowSearch: true,
        showContactInfo: true,
        showSocialLinks: true,
        allowDownload: true,
        allowSharing: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published',
      slug: 'jane-doe-senior-software-engineer',
      views: 0,
      template: 'professional'
    };

    const options: ProfileOptions = {
      templateId: 'professional',
      publishImmediately: true,
      seoOptimization: true,
      analyticsEnabled: true
    };

    const result = await createProfile(profileData, options);
    if (result) {
      console.log('Profile created successfully:', result);
      // Refresh profiles list
      await loadUserProfiles();
    }
  };

  // Example: Update profile
  const handleUpdateProfile = async () => {
    if (!selectedProfileId) return;

    clearError();

    const updates: ProfileUpdate = {
      basicInfo: {
        bio: 'Updated bio: Passionate software engineer with 6+ years of experience building scalable web applications.',
        location: 'Austin, TX'
      },
      skills: [
        ...selectedProfile?.skills || [],
        {
          id: Date.now().toString(),
          name: 'Python',
          category: 'Backend',
          proficiency: 'intermediate',
          years: 2,
          endorsed: false,
          endorsements: 0
        }
      ]
    };

    const result = await updateProfile(updates);
    if (result) {
      console.log('Profile updated successfully:', result);
    }
  };

  // Example: Generate share URL
  const handleGenerateShareURL = async (platform: SocialPlatform) => {
    if (!selectedProfileId) return;

    clearError();
    const url = await generateShareURL(selectedProfileId, platform);
    if (url) {
      setShareUrl(url);
      // Open sharing URL in new tab
      window.open(url, '_blank');
    }
  };

  // Example: Generate QR Code
  const handleGenerateQRCode = async () => {
    if (!selectedProfileId) return;

    clearError();
    const options: QROptions = {
      size: 200,
      format: 'png',
      errorCorrection: 'M',
      backgroundColor: '#ffffff',
      foregroundColor: '#000000'
    };

    const result = await generateQRCode(selectedProfileId, options);
    if (result) {
      setQrCode(result.qrCode);
    }
  };

  // Example: Generate embed code
  const handleGenerateEmbedCode = async () => {
    if (!selectedProfileId) return;

    clearError();
    const options: EmbedOptions = {
      width: 400,
      height: 600,
      theme: 'light',
      responsive: true,
      interactive: true
    };

    const code = await generateEmbedCode(selectedProfileId, options);
    if (code) {
      setEmbedCode(code);
    }
  };

  // Example: Update privacy settings
  const handleUpdatePrivacy = async () => {
    if (!selectedProfileId) return;

    clearError();
    const settings: PrivacySettings = {
      level: 'unlisted',
      allowSearch: false,
      showContactInfo: true,
      showSocialLinks: true,
      allowDownload: false,
      allowSharing: true
    };

    await updatePrivacySettings(selectedProfileId, settings);
    console.log('Privacy settings updated');
  };

  // Example: Track view
  const handleTrackView = async () => {
    if (!selectedProfileId) return;

    await trackView(selectedProfileId, {
      sessionId: 'session-123',
      visitorId: 'visitor-456',
      country: 'US',
      device: 'desktop',
      source: 'direct'
    });
    console.log('View tracked');
  };

  // Example: Track engagement
  const handleTrackEngagement = async () => {
    if (!selectedProfileId) return;

    await trackEngagement(selectedProfileId, {
      type: 'click',
      section: 'portfolio',
      element: 'project-1',
      duration: 5000
    });
    console.log('Engagement tracked');
  };

  // Example: Load analytics
  const handleLoadAnalytics = async () => {
    if (!selectedProfileId) return;

    setShowAnalytics(true);
    await loadAnalytics(selectedProfileId, { days: 30 });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          ProfileService Example
        </h1>

        {/* Error Display */}
        {(error || profileError || analyticsError) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error || profileError || analyticsError}
            </div>
          </div>
        )}

        {/* Loading State */}
        {(loading || profileLoading) && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="text-blue-800 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
              Loading...
            </div>
          </div>
        )}

        {/* Profile Operations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Profile Management */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Management
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleCreateProfile}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Create Sample Profile
              </button>

              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Profile</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} - {profile.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleUpdateProfile}
                disabled={!selectedProfileId || loading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Sharing & Embedding */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sharing & Embedding
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleGenerateShareURL('linkedin')}
                  disabled={!selectedProfileId || loading}
                  className="bg-blue-700 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-800 disabled:opacity-50"
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => handleGenerateShareURL('twitter')}
                  disabled={!selectedProfileId || loading}
                  className="bg-blue-400 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-500 disabled:opacity-50"
                >
                  Twitter
                </button>
              </div>

              <button
                onClick={handleGenerateQRCode}
                disabled={!selectedProfileId || loading}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                Generate QR Code
              </button>

              <button
                onClick={handleGenerateEmbedCode}
                disabled={!selectedProfileId || loading}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                Generate Embed Code
              </button>
            </div>
          </div>

          {/* Analytics & Privacy */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Analytics & Privacy
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleTrackView}
                disabled={!selectedProfileId}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Track View
              </button>

              <button
                onClick={handleTrackEngagement}
                disabled={!selectedProfileId}
                className="w-full bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 disabled:opacity-50"
              >
                Track Engagement
              </button>

              <button
                onClick={handleLoadAnalytics}
                disabled={!selectedProfileId || analyticsLoading}
                className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                Load Analytics
              </button>

              <button
                onClick={handleUpdatePrivacy}
                disabled={!selectedProfileId || loading}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Update Privacy
              </button>
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className="mt-8 space-y-6">

          {/* Selected Profile Display */}
          {selectedProfile && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Selected Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {selectedProfile.name}</p>
                  <p><strong>Title:</strong> {selectedProfile.title}</p>
                  <p><strong>Location:</strong> {selectedProfile.location}</p>
                  <p><strong>Status:</strong> {selectedProfile.status}</p>
                </div>
                <div>
                  <p><strong>Views:</strong> {selectedProfile.views}</p>
                  <p><strong>Template:</strong> {selectedProfile.template}</p>
                  <p><strong>Privacy:</strong> {selectedProfile.privacy?.level}</p>
                  <p><strong>Created:</strong> {new Date(selectedProfile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <p><strong>Bio:</strong> {selectedProfile.bio}</p>
              </div>
            </div>
          )}

          {/* Share URL Display */}
          {shareUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Generated Share URL
              </h3>
              <p className="text-blue-800 break-all">{shareUrl}</p>
            </div>
          )}

          {/* QR Code Display */}
          {qrCode && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Generated QR Code
              </h3>
              <img src={qrCode} alt="Profile QR Code" className="max-w-xs mx-auto" />
            </div>
          )}

          {/* Embed Code Display */}
          {embedCode && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Generated Embed Code
              </h3>
              <pre className="text-orange-800 text-sm bg-orange-100 p-3 rounded-md overflow-x-auto">
                {embedCode}
              </pre>
            </div>
          )}

          {/* Analytics Display */}
          {showAnalytics && detailedAnalytics && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-teal-900 mb-4">
                Profile Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Total Views</h4>
                  <p className="text-2xl font-bold text-teal-600">
                    {detailedAnalytics.summary.totalViews.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Unique Visitors</h4>
                  <p className="text-2xl font-bold text-teal-600">
                    {detailedAnalytics.summary.uniqueVisitors.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">Bounce Rate</h4>
                  <p className="text-2xl font-bold text-teal-600">
                    {Math.round(detailedAnalytics.summary.bounceRate * 100)}%
                  </p>
                </div>
              </div>

              {/* Additional analytics data */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Traffic Sources</h4>
                  <div className="space-y-2">
                    {detailedAnalytics.referrers.sources.slice(0, 3).map((source, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{source.source}</span>
                        <span className="font-medium">{source.visitors}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Top Devices</h4>
                  <div className="space-y-2">
                    {detailedAnalytics.devices.devices.slice(0, 3).map((device, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{device.device}</span>
                        <span className="font-medium">{device.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Templates Display */}
          {templates.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Available Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.slice(0, 6).map((template) => (
                  <div key={template.id} className="bg-white rounded-lg p-4 border">
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {template.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        ⭐ {template.metadata.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileServiceExample;