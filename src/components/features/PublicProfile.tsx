import { useState } from 'react';
import { QrCode, Copy, Share2, Eye, Mail, Shield, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface PublicProfileProps {
  profile?: {
    slug: string;
    publicUrl: string;
    qrCodeUrl?: string;
    settings: {
      showContactForm: boolean;
      showCalendar: boolean;
      showChat: boolean;
      customBranding: boolean;
      analytics: boolean;
    };
    createdAt: Date;
  };
  analytics?: {
    profileViews: number;
    qrCodeScans: number;
    contactFormSubmissions: number;
    lastViewedAt?: Date;
  };
  onCreateProfile: () => Promise<void>;
  onUpdateSettings: (settings: unknown) => Promise<void>;
}

export const PublicProfile = ({ 
  profile, 
  analytics,
  onCreateProfile, 
  onUpdateSettings 
}: PublicProfileProps) => {
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState(profile?.settings || {
    showContactForm: true,
    showCalendar: false,
    showChat: true,
    customBranding: false,
    analytics: true
  });

  const publicUrl = profile?.publicUrl || '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Professional CV',
          text: 'Check out my professional CV',
          url: publicUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await onUpdateSettings(newSettings);
      toast.success('Settings updated');
    } catch {
      toast.error('Failed to update settings');
      setSettings(settings); // Revert on error
    }
  };

  if (!profile) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-100 mb-2">No Public Profile Yet</h3>
        <p className="text-gray-400 mb-6">
          Create a public profile to share your CV with a unique link and QR code.
        </p>
        <button
          onClick={onCreateProfile}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
        >
          Create Public Profile
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-700/30">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-100 mb-2">Your Public CV Profile</h3>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={publicUrl}
                readOnly
                className="flex-1 bg-gray-700/50 text-gray-200 px-4 py-2 rounded-lg text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-300" />}
              </button>
              <button
                onClick={shareProfile}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-gray-300" />
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5 text-gray-300" />
              </a>
            </div>
            <p className="text-sm text-gray-400">
              Created {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
          {profile.qrCodeUrl && (
            <div className="ml-6">
              <img 
                src={profile.qrCodeUrl} 
                alt="QR Code" 
                className="w-32 h-32 bg-white p-2 rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <Eye className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-100">{analytics.profileViews || 0}</div>
            <p className="text-sm text-gray-400">Profile Views</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <QrCode className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-100">{analytics.qrCodeScans || 0}</div>
            <p className="text-sm text-gray-400">QR Scans</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <Mail className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-100">{analytics.contactFormSubmissions || 0}</div>
            <p className="text-sm text-gray-400">Messages</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Last Viewed</div>
            <div className="text-sm font-medium text-gray-200">
              {analytics.lastViewedAt 
                ? new Date(analytics.lastViewedAt).toLocaleDateString()
                : 'Never'
              }
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-100 mb-4">Profile Settings</h4>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-200">Show Contact Form</span>
              <p className="text-sm text-gray-400">Allow visitors to send you messages</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showContactForm}
              onChange={(e) => updateSetting('showContactForm', e.target.checked)}
              className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-200">Enable Chat</span>
              <p className="text-sm text-gray-400">AI-powered chat to answer questions about your CV</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showChat}
              onChange={(e) => updateSetting('showChat', e.target.checked)}
              className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-200">Show Calendar</span>
              <p className="text-sm text-gray-400">Let recruiters schedule meetings directly</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showCalendar}
              onChange={(e) => updateSetting('showCalendar', e.target.checked)}
              className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-200">Custom Branding</span>
              <p className="text-sm text-gray-400">Use custom colors and fonts</p>
            </div>
            <input
              type="checkbox"
              checked={settings.customBranding}
              onChange={(e) => updateSetting('customBranding', e.target.checked)}
              className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-gray-200">Analytics Tracking</span>
              <p className="text-sm text-gray-400">Track views and interactions</p>
            </div>
            <input
              type="checkbox"
              checked={settings.analytics}
              onChange={(e) => updateSetting('analytics', e.target.checked)}
              className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
          </label>
        </div>
      </div>

      {/* QR Code Download */}
      {profile.qrCodeUrl && (
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">QR Code for Easy Sharing</h4>
          <img 
            src={profile.qrCodeUrl} 
            alt="QR Code" 
            className="w-48 h-48 bg-white p-4 rounded-lg mx-auto mb-4"
          />
          <a
            href={profile.qrCodeUrl}
            download={`cv-qr-${profile.slug}.png`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
          >
            <QrCode className="w-5 h-5" />
            Download QR Code
          </a>
        </div>
      )}
    </div>
  );
};