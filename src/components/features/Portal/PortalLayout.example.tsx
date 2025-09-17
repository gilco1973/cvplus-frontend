import React from 'react';
import { PortalLayout } from './PortalLayout';
import { PortalConfig, DeploymentStatus } from '../../../types/portal-types';

/**
 * PortalLayout Example/Demo Component
 * 
 * Demonstrates how to use the PortalLayout component with various configurations
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

// Example portal configuration
const examplePortalConfig: PortalConfig = {
  id: 'example-portal-123',
  name: 'John Doe - Software Engineer',
  description: 'Full-Stack Developer specializing in React and Node.js',
  visibility: 'public',
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#60A5FA',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter, sans-serif',
    layout: 'modern',
    animations: true,
    darkMode: false
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
    title: 'John Doe - Software Engineer Portfolio',
    description: 'Experienced full-stack developer with expertise in modern web technologies',
    keywords: ['software engineer', 'react', 'nodejs', 'typescript', 'full-stack'],
    ogImage: 'https://example.com/john-doe-og.jpg'
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
};

// Example deployment status
const exampleDeploymentStatus: DeploymentStatus = {
  phase: 'building',
  progress: 65,
  currentOperation: 'Building React application...',
  startedAt: new Date(Date.now() - 30000), // 30 seconds ago
  estimatedCompletion: new Date(Date.now() + 60000), // 1 minute from now
  logs: [
    {
      timestamp: new Date(Date.now() - 30000),
      level: 'info',
      message: 'Starting deployment process'
    },
    {
      timestamp: new Date(Date.now() - 25000),
      level: 'info',
      message: 'Validating portal configuration'
    },
    {
      timestamp: new Date(Date.now() - 20000),
      level: 'success',
      message: 'Configuration validated successfully'
    },
    {
      timestamp: new Date(Date.now() - 10000),
      level: 'info',
      message: 'Building React application...'
    }
  ]
};

// Example with successful deployment
const exampleCompletedDeployment: DeploymentStatus = {
  phase: 'completed',
  progress: 100,
  currentOperation: 'Deployment completed successfully',
  startedAt: new Date(Date.now() - 120000), // 2 minutes ago
  url: 'https://johndoe-portfolio.cvplus.app',
  logs: [
    {
      timestamp: new Date(Date.now() - 120000),
      level: 'info',
      message: 'Starting deployment process'
    },
    {
      timestamp: new Date(Date.now() - 60000),
      level: 'info',
      message: 'Building application'
    },
    {
      timestamp: new Date(Date.now() - 30000),
      level: 'info',
      message: 'Deploying to HuggingFace Spaces'
    },
    {
      timestamp: new Date(),
      level: 'success',
      message: 'Portal deployed successfully'
    }
  ]
};

/**
 * Basic Portal Layout Example
 */
export const BasicPortalLayoutExample: React.FC = () => {
  return (
    <PortalLayout
      portalConfig={examplePortalConfig}
      layoutConfig={{
        header: {
          showAvatar: true,
          showName: true,
          showTitle: true,
          position: 'sticky'
        },
        footer: {
          show: true,
          showBranding: true,
          showSocialLinks: true
        },
        main: {
          maxWidth: '7xl',
          padding: '4',
          containerClass: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
        }
      }}
      seoConfig={{
        title: 'John Doe - Portfolio',
        description: 'Professional portfolio of John Doe, Software Engineer',
        keywords: ['portfolio', 'software engineer', 'react', 'nodejs'],
        openGraph: {
          title: 'John Doe - Software Engineer',
          description: 'Check out my professional portfolio',
          image: 'https://example.com/og-image.jpg',
          url: 'https://johndoe-portfolio.cvplus.app'
        }
      }}
      onLayoutReady={() => console.log('Portal layout ready')}
      onNavigationChange={(section) => console.log('Navigation changed to:', section)}
      onPortalSuccess={(result) => console.log('Portal success:', result)}
      onPortalError={(error) => console.error('Portal error:', error)}
    >
      <div className="space-y-8 py-8">
        <section id="home" className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to My Portfolio
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            I'm a passionate software engineer with over 5 years of experience 
            building scalable web applications using modern technologies.
          </p>
        </section>
        
        <section id="about" className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About Me</h2>
          <p className="text-gray-700 leading-relaxed">
            I specialize in full-stack development with expertise in React, Node.js, 
            TypeScript, and cloud technologies. I love creating user-friendly 
            applications that solve real-world problems.
          </p>
        </section>
        
        <section id="experience" className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Experience</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900">Senior Software Engineer</h3>
              <p className="text-gray-600">TechCorp Inc. • 2022 - Present</p>
              <p className="text-gray-700 mt-2">
                Leading a team of 5 developers in building scalable web applications 
                serving over 100k users.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900">Software Engineer</h3>
              <p className="text-gray-600">StartupXYZ • 2020 - 2022</p>
              <p className="text-gray-700 mt-2">
                Developed and maintained React applications with Node.js backends, 
                implementing modern CI/CD practices.
              </p>
            </div>
          </div>
        </section>
        
        <section id="contact" className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
          <p className="text-blue-100 mb-6">
            I'm always interested in new opportunities and exciting projects. 
            Let's connect and discuss how we can work together!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Send Message
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
              View Resume
            </button>
          </div>
        </section>
      </div>
    </PortalLayout>
  );
};

/**
 * Portal Layout with Deployment Status
 */
export const PortalLayoutWithDeploymentExample: React.FC = () => {
  return (
    <PortalLayout
      portalConfig={examplePortalConfig}
      deploymentStatus={exampleDeploymentStatus}
      layoutConfig={{
        header: {
          showAvatar: true,
          showName: true,
          showTitle: true
        },
        footer: {
          show: true,
          showBranding: true
        }
      }}
      onPortalSuccess={(result) => {
        console.log('Portal operation successful:', result);
      }}
      onPortalError={(error) => {
        console.error('Portal error occurred:', error);
      }}
    >
      <div className="space-y-6 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Portal Deployment in Progress
          </h1>
          <p className="text-gray-600">
            Your portal is being built and deployed. You'll be able to access it once the process completes.
          </p>
        </div>
      </div>
    </PortalLayout>
  );
};

/**
 * Portal Layout with Completed Deployment
 */
export const PortalLayoutDeployedExample: React.FC = () => {
  return (
    <PortalLayout
      portalConfig={examplePortalConfig}
      deploymentStatus={exampleCompletedDeployment}
      portalUrl="https://johndoe-portfolio.cvplus.app"
      layoutConfig={{
        header: {
          showAvatar: true,
          showName: true,
          showTitle: true
        },
        footer: {
          show: true,
          showBranding: true,
          showSocialLinks: true
        }
      }}
      mode="preview"
    >
      <div className="space-y-6 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Portal Successfully Deployed!
          </h1>
          <p className="text-gray-600 mb-6">
            Your professional portal is now live and accessible to the world.
          </p>
          <a 
            href="https://johndoe-portfolio.cvplus.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Visit Your Portal
          </a>
        </div>
      </div>
    </PortalLayout>
  );
};

/**
 * Portal Layout with Dark Theme
 */
export const DarkThemePortalExample: React.FC = () => {
  const darkPortalConfig = {
    ...examplePortalConfig,
    theme: {
      ...examplePortalConfig.theme,
      darkMode: true,
      backgroundColor: '#111827',
      textColor: '#F9FAFB'
    }
  };
  
  return (
    <PortalLayout
      portalConfig={darkPortalConfig}
      className="dark"
    >
      <div className="space-y-8 py-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Dark Theme Portal
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Experience the portal in dark mode with automatic theme detection 
            and manual theme switching capabilities.
          </p>
        </section>
        
        <section className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Features</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Automatic dark mode detection</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Manual theme switching</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Responsive design</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span>Real-time deployment tracking</span>
            </li>
          </ul>
        </section>
      </div>
    </PortalLayout>
  );
};

/**
 * Minimal Portal Layout Example
 */
export const MinimalPortalExample: React.FC = () => {
  const minimalConfig = {
    ...examplePortalConfig,
    theme: {
      ...examplePortalConfig.theme,
      layout: 'minimal' as const,
      animations: false
    }
  };
  
  return (
    <PortalLayout
      portalConfig={minimalConfig}
      layoutConfig={{
        header: {
          showAvatar: false,
          showName: true,
          showTitle: false
        },
        footer: {
          show: true,
          showBranding: false
        }
      }}
    >
      <div className="space-y-6 py-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Minimal Design
          </h1>
          <p className="text-gray-600">
            Clean, distraction-free layout focusing on content.
          </p>
        </section>
        
        <section className="prose max-w-none">
          <p className="text-gray-700">
            This minimal layout removes unnecessary elements and focuses on 
            presenting your content in the clearest way possible.
          </p>
        </section>
      </div>
    </PortalLayout>
  );
};

// Export all examples
export default {
  BasicPortalLayoutExample,
  PortalLayoutWithDeploymentExample,
  PortalLayoutDeployedExample,
  DarkThemePortalExample,
  MinimalPortalExample
};