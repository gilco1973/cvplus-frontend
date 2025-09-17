import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIChatAssistant, type AIChatAssistantProps, type ChatMessage } from '../AIChatAssistant';

// Mock Firebase modules
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(),
  connectFunctionsEmulator: vi.fn()
}));

vi.mock('../../../lib/firebase', () => ({
  functions: {}
}));

// Mock the specific hook
const mockCallFunction = vi.fn();
vi.mock('../../../hooks/useFeatureData', () => ({
  useFirebaseFunction: () => ({
    callFunction: mockCallFunction,
    loading: false,
    error: null
  })
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatString) => {
    if (formatString === 'HH:mm') return '12:34';
    if (formatString === 'yyyy-MM-dd-HH-mm') return '2024-01-01-12-34';
    return '12:34';
  })
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock DOM methods
HTMLElement.prototype.scrollIntoView = vi.fn();
HTMLFormElement.prototype.requestSubmit = vi.fn();

// Mock document methods
Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName) => {
    const element = {
      tagName: tagName.toUpperCase(),
      href: '',
      download: '',
      click: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn()
    };
    return element;
  })
});

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn()
});

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn()
});

describe('AIChatAssistant', () => {
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
      autoGreeting: true,
      showTypingIndicator: true,
      enableVoice: false,
      maxMessages: 100
    },
    onUpdate: vi.fn(),
    onError: vi.fn(),
    mode: 'private'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCallFunction.mockResolvedValue({ message: 'Test AI response' });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Component Rendering', () => {
    it('renders successfully with default props', () => {
      render(<AIChatAssistant {...mockProps} />);
      
      expect(screen.getByText('AI Chat Assistant')).toBeInTheDocument();
      expect(screen.getByText('CV Assistant')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ask anything about this CV...')).toBeInTheDocument();
    });

    it('renders greeting message on mount when autoGreeting is enabled', async () => {
      render(<AIChatAssistant {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Hello! I'm your AI assistant/)).toBeInTheDocument();
      });
    });

    it('does not render greeting when autoGreeting is disabled', () => {
      const propsWithoutGreeting = {
        ...mockProps,
        customization: { ...mockProps.customization, autoGreeting: false }
      };
      
      render(<AIChatAssistant {...propsWithoutGreeting} />);
      
      expect(screen.queryByText(/Hello! I'm your AI assistant/)).not.toBeInTheDocument();
    });

    it('returns null when isEnabled is false', () => {
      const { container } = render(<AIChatAssistant {...mockProps} isEnabled={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('displays quick reply buttons initially', () => {
      render(<AIChatAssistant {...mockProps} />);
      
      expect(screen.getByText('Tell me about your work experience')).toBeInTheDocument();
      expect(screen.getByText('What are your key skills?')).toBeInTheDocument();
      expect(screen.getByText('Describe your biggest achievements')).toBeInTheDocument();
    });
  });

  describe('Message Handling', () => {
    it('sends a message when form is submitted', async () => {
      const user = userEvent.setup();
      mockCallFunction.mockResolvedValue({ message: 'AI response' });
      
      render(<AIChatAssistant {...mockProps} />);
      
      const input = screen.getByPlaceholderText('Ask anything about this CV...');
      const sendButton = screen.getByRole('button', { name: /send message/i });
      
      await user.type(input, 'What are your skills?');
      await user.click(sendButton);
      
      expect(mockCallFunction).toHaveBeenCalledWith('getChatResponse', {
        profileId: 'test-profile-id',
        jobId: 'test-job-id',
        message: 'What are your skills?',
        conversationHistory: expect.any(Array),
        assistantPersonality: 'professional',
        knowledgeBase: 'mock-cv-data'
      });
    });

    it('sends message when Enter key is pressed', async () => {
      const user = userEvent.setup();
      mockCallFunction.mockResolvedValue({ message: 'AI response' });
      
      render(<AIChatAssistant {...mockProps} />);
      
      const input = screen.getByPlaceholderText('Ask anything about this CV...');
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      expect(mockCallFunction).toHaveBeenCalled();
    });

    it('does not send message when Shift+Enter is pressed', async () => {
      const user = userEvent.setup();
      
      render(<AIChatAssistant {...mockProps} />);
      
      const input = screen.getByPlaceholderText('Ask anything about this CV...');
      
      await user.type(input, 'Test message');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      
      expect(mockCallFunction).not.toHaveBeenCalled();
    });

    it('handles quick reply button clicks', async () => {
      const user = userEvent.setup();
      mockCallFunction.mockResolvedValue({ message: 'AI response about skills' });
      
      render(<AIChatAssistant {...mockProps} />);
      
      const quickReplyButton = screen.getByText('What are your key skills?');
      await user.click(quickReplyButton);
      
      expect(mockCallFunction).toHaveBeenCalledWith('getChatResponse', {
        profileId: 'test-profile-id',
        jobId: 'test-job-id',
        message: 'What are your key skills?',
        conversationHistory: expect.any(Array),
        assistantPersonality: 'professional',
        knowledgeBase: 'mock-cv-data'
      });
    });

    it('displays typing indicator during AI response', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers();
      
      // Mock a delayed response
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockCallFunction.mockReturnValue(delayedPromise);
      
      render(<AIChatAssistant {...mockProps} />);
      
      const input = screen.getByPlaceholderText('Ask anything about this CV...');
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      // Fast-forward past the initial delay
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        // Look for animated dots that indicate typing
        const typingDots = document.querySelector('.animate-bounce');
        expect(typingDots).toBeInTheDocument();
      });
      
      // Resolve the promise and clean up
      resolvePromise!({ message: 'AI response' });
      vi.useRealTimers();
    });
  });

  describe('Message Display', () => {
    it('displays user and AI messages with correct styling', async () => {
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
          type: 'text',
          status: 'delivered'
        },
        {
          id: 'msg2',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: new Date(),
          type: 'text',
          status: 'delivered'
        }
      ];
      
      const propsWithHistory = {
        ...mockProps,
        data: { ...mockProps.data, conversationHistory: mockMessages }
      };
      
      render(<AIChatAssistant {...propsWithHistory} />);
      
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('shows message status indicators for user messages', async () => {
      const messageWithStatus: ChatMessage = {
        id: 'msg1',
        role: 'user',
        content: 'Test message',
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      };
      
      const propsWithStatus = {
        ...mockProps,
        data: { ...mockProps.data, conversationHistory: [messageWithStatus] }
      };
      
      render(<AIChatAssistant {...propsWithStatus} />);
      
      // Look for status indicator (gray dot for 'sent' status)
      const statusIndicator = document.querySelector('.bg-gray-400.rounded-full');
      expect(statusIndicator).toBeInTheDocument();
    });

    it('displays quick-reply messages with special styling', async () => {
      const quickReplyMessage: ChatMessage = {
        id: 'msg1',
        role: 'user',
        content: 'What are your key skills?',
        timestamp: new Date(),
        type: 'quick-reply',
        status: 'delivered'
      };
      
      const propsWithQuickReply = {
        ...mockProps,
        data: { ...mockProps.data, conversationHistory: [quickReplyMessage] }
      };
      
      render(<AIChatAssistant {...propsWithQuickReply} />);
      
      const quickReplyElement = screen.getByText('What are your key skills?');
      expect(quickReplyElement.closest('.bg-blue-100')).toBeInTheDocument();
    });
  });

  describe('Character Limit', () => {
    it('displays character count', () => {
      render(<AIChatAssistant {...mockProps} />);
      
      expect(screen.getByText('0/500 characters')).toBeInTheDocument();
    });

    it('updates character count as user types', async () => {
      const user = userEvent.setup();
      
      render(<AIChatAssistant {...mockProps} />);
      
      const input = screen.getByPlaceholderText('Ask anything about this CV...');
      await user.type(input, 'Hello');
      
      expect(screen.getByText('5/500 characters')).toBeInTheDocument();
    });

    it('enforces maximum character limit', async () => {
      const user = userEvent.setup();
      
      render(<AIChatAssistant {...mockProps} />);
      
      const input = screen.getByPlaceholderText('Ask anything about this CV...') as HTMLTextAreaElement;
      
      // Try to type more than 500 characters
      const longText = 'a'.repeat(600);
      await user.type(input, longText);
      
      expect(input.value.length).toBeLessThanOrEqual(500);
    });
  });

  describe('Export and Clear Functions', () => {
    it('exports conversation when export button is clicked', async () => {
      const user = userEvent.setup();
      
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
          type: 'text',
          status: 'delivered'
        }
      ];
      
      const propsWithMessages = {
        ...mockProps,
        data: { ...mockProps.data, conversationHistory: mockMessages }
      };
      
      render(<AIChatAssistant {...propsWithMessages} />);
      
      const exportButton = screen.getByTitle('Export conversation');
      await user.click(exportButton);
      
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('clears conversation when clear button is clicked', async () => {
      const user = userEvent.setup();
      
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
          type: 'text',
          status: 'delivered'
        }
      ];
      
      const propsWithMessages = {
        ...mockProps,
        data: { ...mockProps.data, conversationHistory: mockMessages }
      };
      
      render(<AIChatAssistant {...propsWithMessages} />);
      
      const clearButton = screen.getByTitle('Clear conversation');
      await user.click(clearButton);
      
      // Quick replies should appear again after clearing
      await waitFor(() => {
        expect(screen.getByText('Tell me about your work experience')).toBeInTheDocument();
      });
    });
  });

  describe('Voice Recording', () => {
    it('shows voice button when enableVoice is true', () => {
      const propsWithVoice = {
        ...mockProps,
        customization: { ...mockProps.customization, enableVoice: true }
      };
      
      render(<AIChatAssistant {...propsWithVoice} />);
      
      expect(screen.getByTitle('Start voice recording')).toBeInTheDocument();
    });

    it('does not show voice button when enableVoice is false', () => {
      render(<AIChatAssistant {...mockProps} />);
      
      expect(screen.queryByTitle('Start voice recording')).not.toBeInTheDocument();
    });

    it('toggles voice recording state when clicked', async () => {
      const user = userEvent.setup();
      
      const propsWithVoice = {
        ...mockProps,
        customization: { ...mockProps.customization, enableVoice: true }
      };
      
      render(<AIChatAssistant {...propsWithVoice} />);
      
      const voiceButton = screen.getByTitle('Start voice recording');
      await user.click(voiceButton);
      
      expect(screen.getByTitle('Stop recording')).toBeInTheDocument();
    });
  });

  describe('Copy Message Functionality', () => {
    it('copies message to clipboard when copy button is clicked', async () => {
      const user = userEvent.setup();
      
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg1',
          role: 'assistant',
          content: 'Test message to copy',
          timestamp: new Date(),
          type: 'text',
          status: 'delivered'
        }
      ];
      
      const propsWithMessages = {
        ...mockProps,
        data: { ...mockProps.data, conversationHistory: mockMessages }
      };
      
      render(<AIChatAssistant {...propsWithMessages} />);
      
      // Hover over message to show actions
      const messageContainer = screen.getByText('Test message to copy').closest('div');
      if (messageContainer) {
        await user.hover(messageContainer);
        
        const copyButton = screen.getByTitle('Copy message');
        await user.click(copyButton);
        
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test message to copy');
      }
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      const mockError = new Error('API Error');
      mockCallFunction.mockRejectedValue(mockError);
      
      render(<AIChatAssistant {...mockProps} />);
      
      const input = screen.getByPlaceholderText('Ask anything about this CV...');
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/I apologize, but I encountered an error/)).toBeInTheDocument();
      });
      
      expect(mockProps.onError).toHaveBeenCalledWith(mockError);
    });

    it('displays error status for failed messages', async () => {
      const user = userEvent.setup();
      mockCallFunction.mockRejectedValue(new Error('Network error'));
      
      render(<AIChatAssistant {...mockProps} />);
      
      const input = screen.getByPlaceholderText('Ask anything about this CV...');
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        // Look for error status indicator (red dot)
        const errorIndicator = document.querySelector('.bg-red-500.rounded-full');
        expect(errorIndicator).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<AIChatAssistant {...mockProps} />);
      
      expect(screen.getByRole('log', { name: /chat messages/i })).toBeInTheDocument();
      expect(screen.getByLabelText('Type your message')).toBeInTheDocument();
      expect(screen.getByLabelText('Send message')).toBeInTheDocument();
    });

    it('maintains keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<AIChatAssistant {...mockProps} />);
      
      // Tab to input field
      await user.tab();
      expect(screen.getByPlaceholderText('Ask anything about this CV...')).toHaveFocus();
      
      // Tab to send button
      await user.tab();
      await user.tab(); // Skip character counter
      expect(screen.getByLabelText('Send message')).toHaveFocus();
    });
  });

  describe('Theme Support', () => {
    it('applies minimal theme classes', () => {
      const propsWithMinimalTheme = {
        ...mockProps,
        customization: { ...mockProps.customization, theme: 'minimal' as const }
      };
      
      render(<AIChatAssistant {...propsWithMinimalTheme} />);
      
      const chatContainer = document.querySelector('.ai-chat-assistant');
      expect(chatContainer).toHaveClass('border-gray-200');
    });

    it('applies conversation theme classes', () => {
      const propsWithConversationTheme = {
        ...mockProps,
        customization: { ...mockProps.customization, theme: 'conversation' as const }
      };
      
      render(<AIChatAssistant {...propsWithConversationTheme} />);
      
      const chatContainer = document.querySelector('.ai-chat-assistant');
      expect(chatContainer).toHaveClass('border-blue-200');
    });
  });

  describe('Assistant Personality', () => {
    it('displays correct personality mode', () => {
      render(<AIChatAssistant {...mockProps} />);
      
      expect(screen.getByText('Professional mode')).toBeInTheDocument();
    });

    it('shows friendly personality greeting', async () => {
      const friendlyProps = {
        ...mockProps,
        data: { ...mockProps.data, assistantPersonality: 'friendly' as const }
      };
      
      render(<AIChatAssistant {...friendlyProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Hi there! 👋/)).toBeInTheDocument();
      });
    });

    it('shows concise personality greeting', async () => {
      const conciseProps = {
        ...mockProps,
        data: { ...mockProps.data, assistantPersonality: 'concise' as const }
      };
      
      render(<AIChatAssistant {...conciseProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Hello! Ask me anything about this CV/)).toBeInTheDocument();
      });
    });
  });

  describe('Message Limits', () => {
    it('limits conversation to maxMessages', async () => {
      const user = userEvent.setup();
      mockCallFunction.mockResolvedValue({ message: 'AI response' });
      
      const propsWithLimit = {
        ...mockProps,
        customization: { ...mockProps.customization, maxMessages: 3 }
      };
      
      render(<AIChatAssistant {...propsWithLimit} />);
      
      // Send multiple messages to exceed limit
      for (let i = 0; i < 5; i++) {
        const input = screen.getByPlaceholderText('Ask anything about this CV...');
        await user.clear(input);
        await user.type(input, `Message ${i}`);
        await user.keyboard('{Enter}');
        
        await waitFor(() => {
          expect(mockCallFunction).toHaveBeenCalled();
        });
        
        mockCallFunction.mockClear();
      }
      
      // Should not have more than maxMessages * 2 (user + AI responses)
      const allMessages = screen.getAllByText(/Message|AI response/);
      expect(allMessages.length).toBeLessThanOrEqual(6); // 3 max messages * 2 (user + AI)
    });
  });
});