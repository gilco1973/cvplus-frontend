import React from 'react';
import { DynamicQRCode } from './DynamicQRCode';

/**
 * Example usage of the DynamicQRCode component
 * 
 * This file demonstrates how to integrate and use the DynamicQRCode component
 * in different scenarios within the CVPlus application.
 */

// Basic usage example
export const BasicQRCodeExample: React.FC = () => {
  const handleUpdate = (data: any) => {
    console.log('QR Code data updated:', data);
  };

  const handleError = (error: Error) => {
    console.error('QR Code error:', error);
  };

  return (
    <DynamicQRCode
      jobId="example-job-123"
      profileId="example-profile-456"
      isEnabled={true}
      data={{
        url: 'https://example.com/cv/john-doe',
        profileUrl: 'https://example.com/public/john-doe',
        portfolioUrl: 'https://portfolio.johndoe.com',
        linkedinUrl: 'https://linkedin.com/in/johndoe'
      }}
      customization={{
        size: 256,
        style: 'square',
        backgroundColor: '#FFFFFF',
        foregroundColor: '#000000'
      }}
      onUpdate={handleUpdate}
      onError={handleError}
      className="my-custom-qr-code"
      mode="private"
    />
  );
};

// Advanced customization example
export const CustomizedQRCodeExample: React.FC = () => {
  return (
    <DynamicQRCode
      jobId="example-job-456"
      profileId="example-profile-789"
      isEnabled={true}
      data={{
        url: 'https://cvplus.ai/profile/jane-smith',
        profileUrl: 'https://cvplus.ai/public/jane-smith',
        portfolioUrl: 'https://janesmith.dev',
        linkedinUrl: 'https://linkedin.com/in/janesmith'
      }}
      customization={{
        size: 384,
        style: 'rounded',
        backgroundColor: '#F8FAFC',
        foregroundColor: '#1E293B',
        logoUrl: 'https://example.com/logo.png'
      }}
      onUpdate={(data) => {
        // Handle QR code updates - could save to state or database
        console.log('Updated QR data:', data);
      }}
      onError={(error) => {
        // Handle errors - could show user notification
        console.error('QR Code generation failed:', error);
      }}
      className="rounded-lg shadow-lg"
      mode="public"
    />
  );
};

// Circular QR Code with branding
export const BrandedQRCodeExample: React.FC = () => {
  return (
    <DynamicQRCode
      jobId="branded-qr-789"
      profileId="brand-profile-321"
      isEnabled={true}
      data={{
        url: 'https://cvplus.ai/profile/alex-developer',
        profileUrl: 'https://cvplus.ai/public/alex-developer',
        portfolioUrl: 'https://alex.dev',
        linkedinUrl: 'https://linkedin.com/in/alexdev'
      }}
      customization={{
        size: 320,
        style: 'circular',
        backgroundColor: '#FFFFFF',
        foregroundColor: '#3B82F6',
        logoUrl: 'https://cvplus.ai/brand-logo.png'
      }}
      className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl"
      mode="public"
    />
  );
};

// Minimal configuration example
export const MinimalQRCodeExample: React.FC = () => {
  return (
    <DynamicQRCode
      jobId="minimal-example"
      profileId="minimal-profile"
      data={{
        url: 'https://example.com/cv/minimal'
      }}
      // Using all default values for customization
    />
  );
};

// Integration with existing CV components
export const CVIntegratedQRCodeExample: React.FC<{
  cvData: {
    jobId: string;
    profileId: string;
    personalInfo: {
      name: string;
      email: string;
      portfolio?: string;
      linkedin?: string;
    };
  };
}> = ({ cvData }) => {
  const qrData = {
    url: `https://cvplus.ai/cv/${cvData.jobId}`,
    profileUrl: `https://cvplus.ai/public/${cvData.profileId}`,
    portfolioUrl: cvData.personalInfo.portfolio,
    linkedinUrl: cvData.personalInfo.linkedin
  };

  return (
    <div className="cv-section">
      <h3 className="text-xl font-semibold mb-4">Connect with {cvData.personalInfo.name}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <p className="text-gray-600 mb-4">
            Scan the QR code to access my interactive CV and connect with me professionally.
          </p>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Available formats:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Interactive CV Profile</li>
              <li>• Portfolio Gallery</li>
              <li>• Professional Contact</li>
              {cvData.personalInfo.linkedin && <li>• LinkedIn Profile</li>}
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center">
          <DynamicQRCode
            jobId={cvData.jobId}
            profileId={cvData.profileId}
            data={qrData}
            customization={{
              size: 200,
              style: 'rounded',
              backgroundColor: '#F9FAFB',
              foregroundColor: '#374151'
            }}
            className="cv-qr-code"
            mode="public"
          />
        </div>
      </div>
    </div>
  );
};

// Usage with Firebase Functions integration example
export const FirebaseIntegratedQRCodeExample: React.FC = () => {
  const [qrAnalytics, setQrAnalytics] = React.useState(null);
  
  const handleQRUpdate = (data: any) => {
    // This would trigger Firebase Function calls for analytics
    console.log('QR Code updated, triggering analytics...', data);
    
    // Example: You could call a Firebase Function here
    // const trackingFunction = httpsCallable(functions, 'trackQRCodeGeneration');
    // trackingFunction({ jobId: 'example', type: 'generated', timestamp: new Date() });
  };

  return (
    <div className="firebase-qr-example">
      <h4 className="text-lg font-semibold mb-4">QR Code with Firebase Analytics</h4>
      
      <DynamicQRCode
        jobId="firebase-example-123"
        profileId="firebase-profile-456"
        data={{
          url: 'https://cvplus.ai/cv/firebase-user',
          profileUrl: 'https://cvplus.ai/public/firebase-user'
        }}
        customization={{
          size: 256,
          style: 'square',
          backgroundColor: '#FFFFFF',
          foregroundColor: '#DC2626'
        }}
        onUpdate={handleQRUpdate}
        onError={(error) => {
          console.error('Firebase QR Error:', error);
          // Could trigger error reporting to Firebase
        }}
        className="firebase-qr"
        mode="private"
      />
      
      {qrAnalytics && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Analytics Preview</h5>
          <pre className="text-xs text-gray-600">
            {JSON.stringify(qrAnalytics, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Export all examples for documentation
export const QRCodeExamples = {
  BasicQRCodeExample,
  CustomizedQRCodeExample,
  BrandedQRCodeExample,
  MinimalQRCodeExample,
  CVIntegratedQRCodeExample,
  FirebaseIntegratedQRCodeExample
};