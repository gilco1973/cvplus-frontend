/**
 * PortalQRIntegration.example.tsx - Usage Examples
 * 
 * Comprehensive examples demonstrating the enhanced QR code integration
 * for portals with various configurations and use cases.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { PortalQRIntegration } from './PortalQRIntegration';
import { PortalConfig, QRCodeConfig } from '../../../types/portal-types';
import { PortalQRIntegrationProps } from '../../../types/portal-component-props';

// ============================================================================
// EXAMPLE DATA
// ============================================================================

const mockPortalConfig: PortalConfig = {
  id: 'example-portal-123',
  name: 'John Doe Professional',
  description: 'Senior Software Engineer & Technology Leader',
  visibility: 'public',
  customDomain: 'johndoe.cvplus.app',
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter',
    layout: 'modern',
    animations: true,
    darkMode: true
  },
  features: {
    aiChat: true,
    qrCode: true,
    contactForm: true,
    calendar: true,
    portfolio: true,
    socialLinks: true,
    testimonials: true,
    analytics: true
  },
  metadata: {
    title: 'John Doe - Senior Software Engineer',
    description: 'Experienced technology leader specializing in full-stack development, cloud architecture, and team leadership.',
    keywords: ['Software Engineer', 'Technology Leader', 'Full Stack', 'Cloud Architecture'],
    ogImage: 'https://example.com/johndoe-og.jpg',
    canonicalUrl: 'https://johndoe.cvplus.app'
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
};

const mockQRConfig: QRCodeConfig = {
  url: 'https://johndoe.cvplus.app',
  size: 256,
  errorCorrectionLevel: 'M',
  colors: {
    foreground: '#000000',
    background: '#FFFFFF'
  },
  includeLogo: true,
  logoUrl: 'https://example.com/johndoe-avatar.jpg',
  logoSizeRatio: 0.2
};

// ============================================================================
// EXAMPLE COMPONENTS
// ============================================================================

/**
 * Basic Portal QR Integration Example
 */
export const BasicPortalQRExample: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Basic Portal QR Code</h3>
      <PortalQRIntegration
        portalConfig={mockPortalConfig}
        qrConfig={mockQRConfig}
        jobId="example-job-123"
        profileId="example-profile-456"
        isEnabled={true}
        mode="preview"
        displaySettings={{
          size: 'medium',
          style: 'card',
          showTitle: true,
          title: 'Scan to Visit My Portal',
          showInstructions: true,
          instructions: 'Point your camera at this QR code to visit my professional portal',
          showDownload: true,
          showShare: true
        }}
        onQRGenerated={(qrData) => {
          console.log('QR Code generated:', qrData);
        }}
        onQRScanned={(scanData) => {
          console.log('QR Code scanned:', scanData);
        }}
      />
    </div>
  );
};

/**
 * Advanced Portal QR with Custom Styling
 */
export const AdvancedPortalQRExample: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Advanced Portal QR Code</h3>
      <PortalQRIntegration
        portalConfig={mockPortalConfig}
        qrConfig={mockQRConfig}
        jobId="example-job-123"
        profileId="example-profile-456"
        isEnabled={true}
        mode="private"
        displaySettings={{
          size: 'large',
          style: 'prominent',
          showTitle: true,
          title: 'Professional Portal Access',
          showInstructions: true,
          instructions: 'Scan for instant access to my complete professional profile',
          showDownload: true,
          showShare: true
        }}
        downloadConfig={{
          formats: ['png', 'svg', 'pdf'],
          defaultFormat: 'png',
          filenameTemplate: '{name}-professional-qr',
          includeMetadata: true,
          customSizes: [128, 256, 512, 1024]
        }}
        analytics={{
          trackGeneration: true,
          trackScans: true,
          provider: 'custom',
          customTracker: (event, data) => {
            console.log(`Analytics Event: ${event}`, data);
          }
        }}
        customization={{
          colors: {
            foreground: mockPortalConfig.theme.primaryColor,
            background: '#FFFFFF',
            gradient: {
              start: mockPortalConfig.theme.primaryColor,
              end: mockPortalConfig.theme.secondaryColor
            }
          },
          logo: {
            enabled: true,
            url: 'https://example.com/johndoe-avatar.jpg',
            size: 0.25,
            style: 'circle'
          },
          border: {
            enabled: true,
            width: 2,
            color: mockPortalConfig.theme.primaryColor,
            style: 'solid'
          },
          shadow: {
            enabled: true,
            color: 'rgba(0, 0, 0, 0.1)',
            blur: 8,
            offset: { x: 0, y: 4 }
          }
        }}
        onQRGenerated={(qrData) => {
          console.log('Advanced QR generated:', qrData);
        }}
        onDownload={(format, blob) => {
          console.log(`Downloaded as ${format}:`, blob.size, 'bytes');
        }}
        onShare={(shareData) => {
          console.log('Shared:', shareData);
        }}
      />
    </div>
  );
};

/**
 * Floating Portal QR Widget
 */
export const FloatingPortalQRExample: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  return (
    <div className="relative p-6 bg-gray-100 rounded-lg min-h-96">
      <h3 className="text-lg font-semibold mb-4">Floating QR Widget Demo</h3>
      <p className="text-gray-600 mb-4">
        This example shows how the QR code can be displayed as a floating widget.
        The QR code will appear in the bottom-right corner of this container.
      </p>
      
      <div className="space-y-4">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isVisible ? 'Hide' : 'Show'} Floating QR
        </button>
        
        <div className="bg-white p-4 rounded border">
          <h4 className="font-medium mb-2">Sample Content</h4>
          <p className="text-sm text-gray-600">
            This represents the main content of your portal. The floating QR code
            provides easy access for visitors to share or bookmark your profile.
          </p>
        </div>
      </div>
      
      {isVisible && (
        <div className="fixed bottom-4 right-4 z-50">
          <PortalQRIntegration
            portalConfig={mockPortalConfig}
            qrConfig={mockQRConfig}
            jobId="example-job-123"
            profileId="example-profile-456"
            isEnabled={true}
            mode="public"
            displaySettings={{
              size: 'small',
              style: 'floating',
              showTitle: false,
              showInstructions: false,
              showDownload: true,
              showShare: true
            }}
            className="floating-qr-widget"
          />
        </div>
      )}
    </div>
  );
};

/**
 * Portal QR with Analytics Dashboard
 */
export const AnalyticsPortalQRExample: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">QR Code with Analytics</h3>
      <PortalQRIntegration
        portalConfig={mockPortalConfig}
        qrConfig={mockQRConfig}
        jobId="example-job-123"
        profileId="example-profile-456"
        isEnabled={true}
        mode="private"
        displaySettings={{
          size: 'medium',
          style: 'card',
          showTitle: true,
          title: 'Portal QR Code - Analytics Enabled',
          showInstructions: true,
          showDownload: true,
          showShare: true
        }}
        analytics={{
          trackGeneration: true,
          trackScans: true,
          provider: 'google'
        }}
        onQRGenerated={(qrData) => {
          console.log('Analytics-enabled QR generated:', qrData);
        }}
        onQRScanned={(scanData) => {
          console.log('QR scan tracked:', scanData);
        }}
      />
    </div>
  );
};

/**
 * Social Sharing Focused QR
 */
export const SocialSharingQRExample: React.FC = () => {
  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Social Sharing QR Code</h3>
      <PortalQRIntegration
        portalConfig={mockPortalConfig}
        qrConfig={mockQRConfig}
        jobId="example-job-123"
        profileId="example-profile-456"
        isEnabled={true}
        mode="public"
        displaySettings={{
          size: 'large',
          style: 'prominent',
          showTitle: true,
          title: 'Share My Professional Profile',
          showInstructions: true,
          instructions: 'Scan or share this QR code to connect with my professional network',
          showDownload: true,
          showShare: true
        }}
        customization={{
          colors: {
            foreground: '#1F2937',
            background: '#FFFFFF',
            gradient: {
              start: '#3B82F6',
              end: '#10B981'
            }
          },
          logo: {
            enabled: true,
            url: 'https://example.com/johndoe-avatar.jpg',
            size: 0.2,
            style: 'rounded'
          },
          border: {
            enabled: true,
            width: 3,
            color: '#3B82F6',
            style: 'solid'
          }
        }}
        onShare={(shareData) => {
          console.log('Social share initiated:', shareData);
        }}
      />
    </div>
  );
};

/**
 * Minimal Portal QR
 */
export const MinimalPortalQRExample: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Minimal QR Code</h3>
      <PortalQRIntegration
        portalConfig={mockPortalConfig}
        qrConfig={mockQRConfig}
        jobId="example-job-123"
        profileId="example-profile-456"
        isEnabled={true}
        mode="public"
        displaySettings={{
          size: 'small',
          style: 'minimal',
          showTitle: false,
          showInstructions: false,
          showDownload: false,
          showShare: false
        }}
        customization={{
          colors: {
            foreground: '#000000',
            background: '#FFFFFF'
          },
          logo: {
            enabled: false
          },
          border: {
            enabled: false
          },
          shadow: {
            enabled: false
          }
        }}
      />
    </div>
  );
};

/**
 * Interactive Demo Container
 */
export const PortalQRIntegrationDemo: React.FC = () => {
  const [activeExample, setActiveExample] = useState('basic');
  
  const examples = [
    { id: 'basic', label: 'Basic QR Code', component: BasicPortalQRExample },
    { id: 'advanced', label: 'Advanced Styling', component: AdvancedPortalQRExample },
    { id: 'floating', label: 'Floating Widget', component: FloatingPortalQRExample },
    { id: 'analytics', label: 'With Analytics', component: AnalyticsPortalQRExample },
    { id: 'social', label: 'Social Sharing', component: SocialSharingQRExample },
    { id: 'minimal', label: 'Minimal Design', component: MinimalPortalQRExample }
  ];
  
  const ActiveComponent = examples.find(ex => ex.id === activeExample)?.component || BasicPortalQRExample;
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Portal QR Integration Examples
        </h2>
        <p className="text-gray-600 mb-6">
          Explore different configurations and use cases for the enhanced Portal QR Integration component.
        </p>
        
        {/* Example Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {examples.map((example) => (
            <button
              key={example.id}
              onClick={() => setActiveExample(example.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeExample === example.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Active Example */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">
            {examples.find(ex => ex.id === activeExample)?.label}
          </h3>
        </div>
        <div className="p-6">
          <ActiveComponent />
        </div>
      </div>
      
      {/* Feature Highlights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h4>
          <p className="text-sm text-gray-600">
            Track QR code scans, visitor behavior, device types, geographic data, and conversion metrics.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-2">Smart Placement</h4>
          <p className="text-sm text-gray-600">
            Multiple placement modes including floating widgets, embedded displays, and modal overlays.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-2">Portal Branding</h4>
          <p className="text-sm text-gray-600">
            Automatic theme integration, custom logos, gradients, and portal-specific styling.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-2">UTM Tracking</h4>
          <p className="text-sm text-gray-600">
            Automatic UTM parameter generation for marketing attribution and campaign tracking.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-2">Social Sharing</h4>
          <p className="text-sm text-gray-600">
            Built-in sharing to Facebook, Twitter, LinkedIn, WhatsApp, and email with custom messaging.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-2">Multiple Formats</h4>
          <p className="text-sm text-gray-600">
            Download QR codes in PNG, SVG, PDF, and JPEG formats with customizable sizes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortalQRIntegrationDemo;