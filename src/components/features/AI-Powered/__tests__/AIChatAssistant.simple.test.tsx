import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIChatAssistant, type AIChatAssistantProps } from '../AIChatAssistant';

// Mock Firebase modules
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(),
  connectFunctionsEmulator: vi.fn(),
  getFunctions: vi.fn(() => ({})),
  initializeAppCheck: vi.fn(),
  onCall: vi.fn()
}));

vi.mock('../../../lib/firebase', () => ({
  functions: {},
  auth: {},
  db: {},
  storage: {},
  analytics: {}
}));

// Mock the specific hook
vi.mock('../../../hooks/useFeatureData', () => ({
  useFirebaseFunction: () => ({
    callFunction: vi.fn().mockResolvedValue({ message: 'Test response' }),
    loading: false,
    error: null
  })
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => '12:34')
}));

// Mock DOM methods
HTMLElement.prototype.scrollIntoView = vi.fn();
HTMLFormElement.prototype.requestSubmit = vi.fn();

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
});

global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('AIChatAssistant - Basic Tests', () => {
  const mockProps: AIChatAssistantProps = {
    jobId: 'test-job-id',
    profileId: 'test-profile-id',
    isEnabled: true,
    data: {
      conversationHistory: [],
      assistantPersonality: 'professional',
      knowledgeBase: 'mock-cv-data',
      responseTime: 1000
    },
    customization: {
      theme: 'standard',
      autoGreeting: false, // Disable to simplify initial test
      showTypingIndicator: true,
      enableVoice: false,
      maxMessages: 100
    },
    onUpdate: vi.fn(),
    onError: vi.fn(),
    mode: 'private'
  };

  it('renders the component successfully', () => {
    render(<AIChatAssistant {...mockProps} />);
    
    expect(screen.getByText('AI Chat Assistant')).toBeInTheDocument();
    expect(screen.getByText('CV Assistant')).toBeInTheDocument();
  });

  it('renders input field', () => {
    render(<AIChatAssistant {...mockProps} />);
    
    expect(screen.getByPlaceholderText('Ask anything about this CV...')).toBeInTheDocument();
  });

  it('renders quick reply buttons', () => {
    render(<AIChatAssistant {...mockProps} />);
    
    expect(screen.getByText('Tell me about your work experience')).toBeInTheDocument();
    expect(screen.getByText('What are your key skills?')).toBeInTheDocument();
  });

  it('shows character counter', () => {
    render(<AIChatAssistant {...mockProps} />);
    
    expect(screen.getByText('0/500 characters')).toBeInTheDocument();
  });

  it('returns null when disabled', () => {
    const { container } = render(
      <AIChatAssistant {...mockProps} isEnabled={false} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('displays personality mode', () => {
    render(<AIChatAssistant {...mockProps} />);
    
    expect(screen.getByText('Professional mode')).toBeInTheDocument();
  });

  it('shows send button', () => {
    render(<AIChatAssistant {...mockProps} />);
    
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });
});