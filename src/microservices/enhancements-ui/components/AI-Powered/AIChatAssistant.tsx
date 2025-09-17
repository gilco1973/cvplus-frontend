import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Download, Mic, MicOff, MoreVertical, Copy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { CVFeatureProps } from '../../../types/cv-features';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { useFirebaseFunction } from '../../../hooks/useFeatureData';

// Chat Message Interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'quick-reply' | 'suggestion';
  status?: 'sending' | 'sent' | 'delivered' | 'error';
}

// Component Props Interface
export interface AIChatAssistantProps extends CVFeatureProps {
  data: {
    conversationHistory?: ChatMessage[];
    assistantPersonality?: 'professional' | 'friendly' | 'concise';
    knowledgeBase?: string; // Base64 encoded CV data
    responseTime?: number;
  };
  customization?: {
    theme?: 'minimal' | 'standard' | 'conversation';
    autoGreeting?: boolean;
    showTypingIndicator?: boolean;
    enableVoice?: boolean;
    maxMessages?: number;
  };
}

// Quick Reply Options
const QUICK_REPLIES = [
  "Tell me about your work experience",
  "What are your key skills?",
  "Describe your biggest achievements",
  "What makes you unique?",
  "Explain your career goals",
  "What's your educational background?"
];

// Main Component
export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization = {},
  onUpdate,
  onError,
  className = '',
  mode = 'private'
}) => {
  const {
    conversationHistory = [],
    assistantPersonality = 'professional',
    knowledgeBase,
    responseTime = 2000
  } = data || {};

  const {
    theme = 'standard',
    autoGreeting = true,
    showTypingIndicator = true,
    enableVoice = false,
    maxMessages = 100
  } = customization;

  // State Management
  const [messages, setMessages] = useState<ChatMessage[]>(conversationHistory);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Firebase Function Hook
  const { callFunction, loading: isSubmitting, error: functionError } = useFirebaseFunction();

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Generate message ID
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add initial greeting
  useEffect(() => {
    if (autoGreeting && messages.length === 0) {
      const greetingMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: getGreetingMessage(assistantPersonality),
        timestamp: new Date(),
        type: 'text',
        status: 'delivered'
      };
      setMessages([greetingMessage]);
    }
  }, [autoGreeting, messages.length, assistantPersonality, generateMessageId]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Send Message Handler
  const sendMessage = useCallback(async (messageContent: string, messageType: 'text' | 'quick-reply' = 'text') => {
    if (!messageContent.trim()) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date(),
      type: messageType,
      status: 'sending'
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setShowQuickReplies(false);

    // Update user message status
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg
      ));
    }, 500);

    try {
      // Show typing indicator
      if (showTypingIndicator) {
        setIsTyping(true);
      }

      // Simulate response delay
      await new Promise(resolve => setTimeout(resolve, Math.min(responseTime, 1000)));

      // Call AI chat function
      const response = await callFunction('getChatResponse', {
        profileId,
        jobId,
        message: messageContent,
        conversationHistory: messages.slice(-10), // Last 10 messages for context
        assistantPersonality,
        knowledgeBase
      });

      // Create assistant response
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: response.message || 'I apologize, but I\'m having trouble responding right now. Please try again.',
        timestamp: new Date(),
        type: 'text',
        status: 'delivered'
      };

      // Add assistant message
      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        
        // Update user message status to delivered
        const updatedWithStatus = updated.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'delivered' as const } : msg
        );

        // Limit messages to maxMessages
        if (updatedWithStatus.length > maxMessages) {
          return updatedWithStatus.slice(-maxMessages);
        }
        return updatedWithStatus;
      });

      // Call onUpdate callback
      onUpdate?.({
        conversationHistory: messages,
        lastMessage: assistantMessage
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      // Update user message status to error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'error' as const } : msg
      ));

      // Add error message
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try asking your question again.',
        timestamp: new Date(),
        type: 'text',
        status: 'delivered'
      };

      setMessages(prev => [...prev, errorMessage]);
      
      const errorObj = error instanceof Error ? error : new Error('Chat service unavailable');
      toast.error(errorObj.message);
      onError?.(errorObj);
    } finally {
      setIsTyping(false);
    }
  }, [messages, generateMessageId, showTypingIndicator, responseTime, callFunction, profileId, jobId, assistantPersonality, knowledgeBase, maxMessages, onUpdate, onError]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  }, [inputMessage, sendMessage]);

  // Handle quick reply
  const handleQuickReply = useCallback((reply: string) => {
    sendMessage(reply, 'quick-reply');
  }, [sendMessage]);

  // Handle input key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  }, [inputMessage, sendMessage]);

  // Copy message to clipboard
  const copyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Message copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  }, []);

  // Export conversation
  const exportConversation = useCallback(() => {
    const conversationText = messages
      .map(msg => `${msg.role === 'user' ? 'You' : 'AI Assistant'} (${format(msg.timestamp, 'HH:mm')}):\n${msg.content}\n`)
      .join('\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-conversation-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Conversation exported successfully');
  }, [messages]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setMessages([]);
    setShowQuickReplies(true);
    toast.success('Conversation cleared');
  }, []);

  // Voice recording (placeholder)
  const toggleVoiceRecording = useCallback(() => {
    if (!enableVoice) return;
    
    setIsVoiceRecording(prev => !prev);
    if (isVoiceRecording) {
      toast.success('Voice recording stopped');
    } else {
      toast.success('Voice recording started');
    }
  }, [enableVoice, isVoiceRecording]);

  if (!isEnabled) {
    return null;
  }

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="AI Chat Assistant"
        description="Get instant answers about this CV and career profile"
        isLoading={false}
        error={functionError}
      >
        <div className={`ai-chat-assistant ${getThemeClasses(theme)} h-[600px] flex flex-col`}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">AI</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">CV Assistant</h3>
                <p className="text-xs text-gray-500">
                  {assistantPersonality.charAt(0).toUpperCase() + assistantPersonality.slice(1)} mode
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {messages.length > 0 && (
                <>
                  <button
                    onClick={exportConversation}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Export conversation"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearConversation}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Clear conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
            role="log"
            aria-label="Chat messages"
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={copyMessage}
                theme={theme}
              />
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">AI</span>
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {showQuickReplies && messages.length <= 1 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors text-gray-700 hover:text-blue-700"
                    disabled={isSubmitting || isTyping}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything about this CV..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows={1}
                  disabled={isSubmitting || isTyping}
                  maxLength={500}
                  aria-label="Type your message"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {inputMessage.length}/500 characters
                  </span>
                  {enableVoice && (
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`p-2 rounded-lg transition-colors ${
                        isVoiceRecording 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      disabled={isSubmitting || isTyping}
                      title={isVoiceRecording ? 'Stop recording' : 'Start voice recording'}
                    >
                      {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSubmitting || isTyping}
                className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[48px]"
                aria-label="Send message"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};

// Message Bubble Component
interface MessageBubbleProps {
  message: ChatMessage;
  onCopy: (content: string) => void;
  theme: 'minimal' | 'standard' | 'conversation';
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onCopy, theme }) => {
  const [showActions, setShowActions] = useState(false);
  const isUser = message.role === 'user';
  const isQuickReply = message.type === 'quick-reply';

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />;
      case 'sent':
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
      case 'delivered':
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      case 'error':
        return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-r from-green-500 to-blue-500' 
          : 'bg-gradient-to-r from-blue-500 to-purple-600'
      }`}>
        <span className="text-white text-xs font-semibold">
          {isUser ? 'U' : 'AI'}
        </span>
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-xs sm:max-w-md ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block px-4 py-3 rounded-2xl break-words ${
          isUser
            ? isQuickReply
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
            : 'bg-gray-100 text-gray-900'
        } ${theme === 'minimal' ? 'shadow-sm' : 'shadow-md'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Message Info */}
        <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-500 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <span>{format(message.timestamp, 'HH:mm')}</span>
          {isUser && getStatusIcon()}
          
          {/* Actions */}
          {showActions && (
            <button
              onClick={() => onCopy(message.content)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Copy message"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Functions
const getGreetingMessage = (personality: 'professional' | 'friendly' | 'concise'): string => {
  const greetings = {
    professional: "Hello! I'm your AI assistant, ready to answer questions about this CV and provide insights into the candidate's experience, skills, and qualifications. How may I assist you today?",
    friendly: "Hi there! 👋 I'm here to help you learn more about this CV! Feel free to ask me anything about the candidate's background, experience, or skills. What would you like to know?",
    concise: "Hello! Ask me anything about this CV - experience, skills, education, or achievements."
  };
  
  return greetings[personality];
};

const getThemeClasses = (theme: 'minimal' | 'standard' | 'conversation'): string => {
  const themes = {
    minimal: 'border-gray-200',
    standard: 'border-gray-300 shadow-lg',
    conversation: 'border-blue-200 shadow-xl bg-gradient-to-b from-blue-50 to-white'
  };
  
  return themes[theme];
};

export default AIChatAssistant;

/**
 * Usage Examples:
 * 
 * // Basic usage with minimal configuration
 * <AIChatAssistant 
 *   jobId="job123"
 *   profileId="profile456"
 *   data={{
 *     assistantPersonality: 'professional',
 *     knowledgeBase: encodedCVData
 *   }}
 * />
 * 
 * // Advanced usage with full customization
 * <AIChatAssistant 
 *   jobId="job123"
 *   profileId="profile456"
 *   data={{
 *     conversationHistory: existingMessages,
 *     assistantPersonality: 'friendly',
 *     knowledgeBase: encodedCVData,
 *     responseTime: 1500
 *   }}
 *   customization={{
 *     theme: 'conversation',
 *     autoGreeting: true,
 *     showTypingIndicator: true,
 *     enableVoice: true,
 *     maxMessages: 50
 *   }}
 *   onUpdate={(conversationData) => {
 *     console.log('Conversation updated:', conversationData);
 *   }}
 *   onError={(error) => {
 *     console.error('Chat error:', error);
 *   }}
 *   mode="public"
 *   className="custom-chat-styles"
 * />
 * 
 * // Minimal theme for embedding
 * <AIChatAssistant 
 *   jobId="job123"
 *   profileId="profile456"
 *   customization={{
 *     theme: 'minimal',
 *     autoGreeting: false,
 *     maxMessages: 20
 *   }}
 *   mode="preview"
 * />
 */