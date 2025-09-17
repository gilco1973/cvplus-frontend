/**
 * PortalChatDemo.tsx - Demonstration Component
 * 
 * Shows how to use the PortalChatInterface component with various configurations.
 * This serves as both a demo and usage example.
 */

import React, { useState } from 'react';
import { PortalChatInterface } from './PortalChatInterface';
import { PortalConfig, ChatConfig } from '../../../types/portal-types';
import { PortalChatInterfaceProps } from '../../../types/portal-component-props';

// Demo portal configuration
const demoPortalConfig: PortalConfig = {
  id: 'demo-portal-123',
  name: 'John Doe - Senior Developer',
  description: 'Interactive AI-powered professional profile',
  visibility: 'public',
  customDomain: 'johndoe.cvplus.com',
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundColor: '#FFFFFF',
    textColor: '#111827',
    fontFamily: 'Inter, system-ui, sans-serif',
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
    title: 'John Doe - Senior Developer | CVPlus',
    description: 'Interactive AI-powered CV with chat assistant, portfolio gallery, and professional insights.',
    keywords: ['senior developer', 'react', 'typescript', 'ai', 'portfolio'],
    ogImage: '/images/john-doe-og.jpg',
    canonicalUrl: 'https://johndoe.cvplus.com'
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date()
};

// Demo chat configuration
const demoChatConfig: ChatConfig = {
  enableRAG: true,
  model: {
    modelName: 'claude-3-sonnet-20240229',
    parameters: {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0
    },
    systemPrompt: `You are an AI assistant helping visitors learn about John Doe's professional background. 
    You have access to his CV content and can answer questions about his experience, skills, education, and achievements. 
    Be professional, helpful, and concise in your responses.`,
    contextWindowSize: 4096
  },
  vectorSearch: {
    topK: 5,
    threshold: 0.7,
    algorithm: 'cosine',
    hybridSearch: true,
    filters: {
      sections: ['experience', 'skills', 'education', 'achievements']
    }
  },
  behavior: {
    welcomeMessage: "👋 Hi! I'm John's AI assistant. I can answer questions about his professional background, skills, and experience. What would you like to know?",
    suggestedQuestions: [
      "What are John's key technical skills?",
      "Tell me about his work experience",
      "What projects has John worked on?",
      "What is John's educational background?",
      "What are his main achievements?"
    ],
    showTyping: true,
    messageTimeout: 30000,
    autoScroll: true,
    enableReactions: true
  },
  rateLimiting: {
    messagesPerMinute: 10,
    messagesPerHour: 100,
    enabled: true,
    rateLimitMessage: 'You\'ve reached the message limit. Please wait a moment before sending another message.'
  }
};

interface ChatDemoConfig {
  id: string;
  name: string;
  description: string;
  features: string[];
  config: Partial<PortalChatInterfaceProps>;
}

const chatDemoConfigs: ChatDemoConfig[] = [
  {
    id: 'standard',
    name: 'Standard Chat',
    description: 'Basic chat interface with RAG and suggested questions',
    features: ['RAG responses', 'Message history', 'Typing indicators', 'Suggested questions'],
    config: {
      portalConfig: demoPortalConfig,
      chatConfig: demoChatConfig,
      jobId: 'demo-job-123',
      profileId: 'demo-profile-123',
      mode: 'public'
    }
  },
  {
    id: 'enhanced',
    name: 'Enhanced Chat',
    description: 'Full-featured chat with voice input, reactions, and export',
    features: ['All standard features', 'Voice input', 'Message reactions', 'Export conversations', 'Search messages'],
    config: {
      portalConfig: demoPortalConfig,
      chatConfig: demoChatConfig,
      jobId: 'demo-job-123',
      profileId: 'demo-profile-123',
      mode: 'public',
      features: {
        typingIndicators: true,
        reactions: true,
        timestamps: true,
        search: true,
        export: true,
        voiceInput: true,
        fileUploads: false
      },
      ragConfig: {
        enabled: true,
        showSources: true,
        maxSources: 5,
        similarityThreshold: 0.7
      }
    }
  },
  {
    id: 'minimal',
    name: 'Minimal Chat',
    description: 'Simplified chat interface for basic Q&A',
    features: ['Basic messaging', 'Simple responses', 'No advanced features'],
    config: {
      portalConfig: demoPortalConfig,
      chatConfig: {
        ...demoChatConfig,
        behavior: {
          welcomeMessage: 'Hello! Ask me about John\'s professional background.',
          suggestedQuestions: ['What are his skills?', 'Tell me about his experience'],
          showTyping: false,
          messageTimeout: 60000,
          autoScroll: true,
          enableReactions: false
        }
      },
      jobId: 'demo-job-123',
      profileId: 'demo-profile-123',
      mode: 'public',
      features: {
        typingIndicators: false,
        reactions: false,
        timestamps: false,
        search: false,
        export: false,
        voiceInput: false
      },
      uiCustomization: {
        size: 'small',
        theme: 'light',
        colors: {
          primary: '#6B7280',
          secondary: '#9CA3AF'
        }
      }
    }
  },
  {
    id: 'professional',
    name: 'Professional Chat',
    description: 'Corporate-style chat with formal tone and analytics',
    features: ['Professional styling', 'Analytics tracking', 'Formal responses', 'Rate limiting'],
    config: {
      portalConfig: demoPortalConfig,
      chatConfig: {
        ...demoChatConfig,
        model: {
          ...demoChatConfig.model,
          systemPrompt: `You are a professional AI assistant representing John Doe's career profile. 
          Provide formal, detailed responses about his professional qualifications, experience, and achievements. 
          Maintain a corporate tone and focus on business-relevant information.`
        },
        behavior: {
          welcomeMessage: 'Good day! I am here to provide information about John Doe\'s professional qualifications and experience. How may I assist you?',
          suggestedQuestions: [
            'What are Mr. Doe\'s core competencies?',
            'Please describe his leadership experience',
            'What are his notable professional achievements?',
            'What industries has he worked in?'
          ],
          showTyping: true,
          messageTimeout: 45000,
          autoScroll: true,
          enableReactions: true
        }
      },
      jobId: 'demo-job-123',
      profileId: 'demo-profile-123',
      mode: 'public',
      rateLimiting: {
        enabled: true,
        messagesPerMinute: 5,
        warningMessage: 'Please allow time between questions for thorough responses.',
        blockedMessage: 'Rate limit exceeded. Please wait before continuing the conversation.'
      },
      uiCustomization: {
        theme: 'light',
        colors: {
          primary: '#1F2937',
          secondary: '#374151',
          background: '#F9FAFB'
        },
        typography: {
          fontFamily: 'Georgia, serif',
          fontSize: '16px'
        }
      }
    }
  }
];

export const PortalChatDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>('standard');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentDemo = chatDemoConfigs.find(demo => demo.id === selectedDemo) || chatDemoConfigs[0];

  const handleMessageSent = (message: any) => {
    console.log('Message sent:', message);
  };

  const handleMessageReceived = (message: any) => {
    console.log('Message received:', message);
  };

  const handleChatError = (error: any) => {
    console.error('Chat error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Portal Chat Interface Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience different configurations of the RAG-based AI chat interface. 
            Each demo showcases different features and styling options.
          </p>
        </div>

        {/* Demo Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {chatDemoConfigs.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setSelectedDemo(demo.id)}
                className={`
                  px-6 py-3 rounded-lg border-2 transition-all
                  ${selectedDemo === demo.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <div className="font-semibold">{demo.name}</div>
                <div className="text-sm opacity-75">{demo.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Demo Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {currentDemo.name}
              </h3>
              <p className="text-gray-600 mb-6">
                {currentDemo.description}
              </p>
              
              <h4 className="font-medium text-gray-900 mb-3">Features:</h4>
              <ul className="space-y-2">
                {currentDemo.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
                </button>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className={`lg:col-span-2 ${
            isFullscreen ? 'fixed inset-0 z-50 p-4 bg-white' : ''
          }`}>
            <PortalChatInterface
              {...currentDemo.config}
              onMessageSent={handleMessageSent}
              onMessageReceived={handleMessageReceived}
              onError={handleChatError}
              className={isFullscreen ? 'h-full' : ''}
            />
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Usage Instructions
          </h3>
          <div className="prose text-gray-600">
            <p className="mb-4">
              To use the PortalChatInterface in your application, import it and provide the required configuration:
            </p>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { PortalChatInterface } from '@/components/features/Portal';

const MyComponent = () => {
  const portalConfig = {
    id: 'my-portal',
    name: 'My Professional Profile',
    // ... other portal config
  };

  const chatConfig = {
    enableRAG: true,
    model: {
      modelName: 'claude-3-sonnet',
      // ... model config
    },
    // ... other chat config
  };

  return (
    <PortalChatInterface
      portalConfig={portalConfig}
      chatConfig={chatConfig}
      jobId="your-job-id"
      profileId="your-profile-id"
      onMessageSent={(message) => console.log('Sent:', message)}
      onMessageReceived={(message) => console.log('Received:', message)}
      onError={(error) => console.error('Error:', error)}
    />
  );
};`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalChatDemo;
