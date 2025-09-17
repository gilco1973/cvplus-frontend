/**
 * PortalChatExample.tsx - Simple Integration Example
 * 
 * Shows a minimal integration of the PortalChatInterface component
 * This can be used as a starting point for implementing the chat feature.
 */

import React from 'react';
import { PortalChatInterface } from './PortalChatInterface';
import { PortalConfig, ChatConfig } from '../../../types/portal-types';

interface PortalChatExampleProps {
  jobId: string;
  profileId: string;
  userName?: string;
  userTitle?: string;
}

export const PortalChatExample: React.FC<PortalChatExampleProps> = ({
  jobId,
  profileId,
  userName = 'Professional',
  userTitle = 'CV Owner'
}) => {
  // Basic portal configuration
  const portalConfig: PortalConfig = {
    id: `portal-${profileId}`,
    name: `${userName} - ${userTitle}`,
    description: `Interactive AI-powered professional profile for ${userName}`,
    visibility: 'public',
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
      title: `${userName} - Professional Profile`,
      description: `Learn about ${userName}'s professional background through AI-powered chat`,
      keywords: ['professional', 'cv', 'ai', 'chat']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Basic chat configuration
  const chatConfig: ChatConfig = {
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
      systemPrompt: `You are an AI assistant helping visitors learn about ${userName}'s professional background. You have access to their CV content and can answer questions about their experience, skills, education, and achievements. Be professional, helpful, and concise in your responses.`,
      contextWindowSize: 4096
    },
    vectorSearch: {
      topK: 5,
      threshold: 0.7,
      algorithm: 'cosine',
      hybridSearch: true
    },
    behavior: {
      welcomeMessage: `👋 Hi! I'm ${userName}'s AI assistant. I can answer questions about their professional background, skills, and experience. What would you like to know?`,
      suggestedQuestions: [
        `What are ${userName}'s key skills?`,
        'Tell me about their work experience',
        'What projects have they worked on?',
        'What is their educational background?',
        'What are their main achievements?'
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

  // Event handlers
  const handleMessageSent = (message: any) => {
    console.log('Message sent:', message);
    // Add analytics tracking here
  };

  const handleMessageReceived = (message: any) => {
    console.log('Message received:', message);
    // Process AI response here
  };

  const handleChatError = (error: any) => {
    console.error('Chat error:', error);
    // Add error reporting here
  };

  const handleChatOpen = () => {
    console.log('Chat session opened');
    // Track engagement metrics
  };

  const handleChatClose = () => {
    console.log('Chat session closed');
    // Save session data
  };

  const handleReactionAdd = (messageId: string, reaction: string) => {
    console.log('Reaction added:', messageId, reaction);
    // Track user feedback
  };

  return (
    <div className="portal-chat-example">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Chat with {userName}'s AI Assistant
        </h2>
        <p className="text-gray-600">
          Ask questions about their professional background, skills, and experience.
        </p>
      </div>
      
      <PortalChatInterface
        portalConfig={portalConfig}
        chatConfig={chatConfig}
        jobId={jobId}
        profileId={profileId}
        isEnabled={true}
        mode="public"
        
        // Enhanced features
        features={{
          typingIndicators: true,
          reactions: true,
          timestamps: true,
          search: false, // Disabled for simple example
          export: false, // Disabled for simple example
          voiceInput: false // Disabled for simple example
        }}
        
        // RAG configuration
        ragConfig={{
          enabled: true,
          showSources: true,
          maxSources: 3,
          similarityThreshold: 0.7
        }}
        
        // UI customization
        uiCustomization={{
          position: 'embedded',
          size: 'medium',
          theme: 'light'
        }}
        
        // Event handlers
        onMessageSent={handleMessageSent}
        onMessageReceived={handleMessageReceived}
        onChatOpen={handleChatOpen}
        onChatClose={handleChatClose}
        onError={handleChatError}
        onReactionAdd={handleReactionAdd}
        
        className="h-[600px] border border-gray-200 rounded-lg shadow-sm"
      />
    </div>
  );
};

export default PortalChatExample;
