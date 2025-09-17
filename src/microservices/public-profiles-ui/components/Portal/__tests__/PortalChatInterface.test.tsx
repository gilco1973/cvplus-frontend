/**
 * PortalChatInterface Test Suite
 * 
 * Basic compilation and rendering tests for the PortalChatInterface component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PortalChatInterface } from '../PortalChatInterface';
import { PortalChatInterfaceProps } from '../../../../types/portal-component-props';

// Mock Firebase
vi.mock('../../../../hooks/useFeatureData', () => ({
  useFirebaseFunction: () => ({
    callFunction: vi.fn(),
    loading: false,
    error: null
  })
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock DOM methods
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true
});

// Mock speech recognition
Object.defineProperty(window, 'SpeechRecognition', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn()
  },
  writable: true
});

const mockPortalConfig = {
  id: 'test-portal',
  name: 'Test Portal',
  visibility: 'public' as const,
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundColor: '#FFFFFF',
    textColor: '#111827',
    fontFamily: 'Inter',
    layout: 'modern' as const,
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
    title: 'Test Portal',
    description: 'Test Description',
    keywords: ['test']
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockChatConfig = {
  enableRAG: true,
  model: {
    modelName: 'claude-3-sonnet',
    parameters: {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0
    },
    systemPrompt: 'You are a helpful assistant.',
    contextWindowSize: 4096
  },
  vectorSearch: {
    topK: 5,
    threshold: 0.7,
    algorithm: 'cosine' as const,
    hybridSearch: false
  },
  behavior: {
    welcomeMessage: 'Hello! How can I help you?',
    suggestedQuestions: ['What are your skills?'],
    showTyping: true,
    messageTimeout: 30000,
    autoScroll: true,
    enableReactions: true
  },
  rateLimiting: {
    messagesPerMinute: 10,
    messagesPerHour: 100,
    enabled: true,
    rateLimitMessage: 'Too many messages'
  }
};

const mockProps: PortalChatInterfaceProps = {
  portalConfig: mockPortalConfig,
  chatConfig: mockChatConfig,
  jobId: 'test-job-id',
  profileId: 'test-profile-id',
  isEnabled: true,
  mode: 'private'
};

describe('PortalChatInterface', () => {
  it('renders without crashing', () => {
    render(<PortalChatInterface {...mockProps} />);
    expect(screen.getByText('AI Chat Assistant')).toBeInTheDocument();
  });

  it('displays connecting state initially', () => {
    render(<PortalChatInterface {...mockProps} />);
    expect(screen.getByText('Connecting to AI assistant...')).toBeInTheDocument();
  });

  it('renders chat interface elements', () => {
    render(<PortalChatInterface {...mockProps} />);
    
    // Check for input placeholder
    expect(screen.getByPlaceholderText('Type your question about this CV...')).toBeInTheDocument();
    
    // Check for send button
    expect(screen.getByTitle('Send message')).toBeInTheDocument();
  });

  it('renders with custom UI configuration', () => {
    const propsWithCustomUI = {
      ...mockProps,
      uiCustomization: {
        title: 'Custom Chat Title'
      }
    };
    
    render(<PortalChatInterface {...propsWithCustomUI} />);
    expect(screen.getByText('Custom Chat Title')).toBeInTheDocument();
  });

  it('renders suggested questions when provided', () => {
    const propsWithSuggestions = {
      ...mockProps,
      initialState: {
        suggestedQuestions: ['What is your experience?', 'Tell me about your skills']
      }
    };
    
    render(<PortalChatInterface {...propsWithSuggestions} />);
    expect(screen.getByText('What is your experience?')).toBeInTheDocument();
    expect(screen.getByText('Tell me about your skills')).toBeInTheDocument();
  });
});
