/**
 * PortalChatInterface.tsx - RAG-based AI Chat Component
 * 
 * Interactive AI chat interface for CV-related inquiries using RAG (Retrieval-Augmented Generation)
 * with CV content embeddings for intelligent Q&A. Provides real-time chat functionality,
 * conversation management, and context-aware responses.
 * 
 * Features:
 * - RAG-based AI responses using vector embeddings from CV content
 * - Real-time typing indicators and professional conversation templates
 * - Chat history persistence and management across sessions
 * - Voice interaction support with speech-to-text
 * - Multi-language support for international users
 * - Message reactions, feedback system, and conversation export
 * - Mobile-responsive design with touch-friendly interactions
 * - Rate limiting, usage tracking, and conversation analytics
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Download,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share2,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PortalChatInterfaceProps } from '../../../types/portal-component-props';
import { ChatMessage, ChatError, RAGSourceDocument } from '../../../types/portal-types';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { useFirebaseFunction } from '../../../hooks/useFeatureData';

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

interface ChatState {
  sessionId: string | null;
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  currentVoiceInput: boolean;
  isFullscreen: boolean;
}

interface ChatInputState {
  text: string;
  isValid: boolean;
  wordCount: number;
  characterCount: number;
}

interface RateLimitState {
  remainingMessages: number;
  resetTime: Date | null;
  isLimited: boolean;
}

interface ConversationExport {
  format: 'json' | 'txt' | 'pdf';
  includeMetadata: boolean;
  includeTimestamps: boolean;
  includeSourceDocuments: boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Message bubble component with rich formatting and metadata
 */
const MessageBubble: React.FC<{
  message: ChatMessage;
  showTimestamp: boolean;
  showSources: boolean;
  onReaction: (messageId: string, reaction: string) => void;
  onCopy: (content: string) => void;
  onSpeak: (content: string) => void;
}> = ({ message, showTimestamp, showSources, onReaction, onCopy, onSpeak }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`animate-fade-in flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
          : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
        }
      `}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        {/* Message Bubble */}
        <div className={`
          inline-block px-4 py-3 rounded-2xl shadow-sm
          ${isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
          }
        `}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {/* Confidence Score */}
          {message.metadata?.confidence && !isUser && (
            <div className="mt-2 text-xs text-gray-500">
              Confidence: {Math.round(message.metadata.confidence * 100)}%
            </div>
          )}
        </div>

        {/* Source Documents */}
        {showSources && message.sourceDocuments && message.sourceDocuments.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500 mb-1">Sources:</p>
            {message.sourceDocuments.map((doc, index) => (
              <div key={index} className="text-xs bg-gray-50 border rounded p-2">
                <div className="font-medium text-gray-700">{doc.section}</div>
                <div className="text-gray-600 truncate">{doc.content}</div>
                <div className="text-gray-400 mt-1">
                  Relevance: {Math.round(doc.score * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message Metadata */}
        <div className={`mt-2 flex items-center gap-2 text-xs text-gray-500 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          {/* Timestamp */}
          {showTimestamp && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}

          {/* Status Icon */}
          <span className="flex items-center gap-1">
            {message.status === 'sending' && <Loader2 className="w-3 h-3 animate-spin" />}
            {message.status === 'sent' && <CheckCircle className="w-3 h-3 text-gray-400" />}
            {message.status === 'error' && <XCircle className="w-3 h-3 text-red-400" />}
          </span>

          {/* Processing Time */}
          {message.metadata?.processingTime && (
            <span className="text-gray-400">
              {message.metadata.processingTime}ms
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {!isUser && message.status === 'sent' && (
          <div className="mt-2 flex items-center gap-1">
            <button
              onClick={() => onCopy(message.content)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy message"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={() => onSpeak(message.content)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Read aloud"
            >
              <Volume2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onReaction(message.id, 'thumbs_up')}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Helpful"
            >
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onReaction(message.id, 'thumbs_down')}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Not helpful"
            >
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Reactions Display */}
        {message.metadata?.reactions && message.metadata.reactions.length > 0 && (
          <div className="mt-2 flex items-center gap-1">
            {message.metadata.reactions.map((reaction, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {reaction.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Typing indicator animation
 */
const TypingIndicator: React.FC = () => (
  <div className="animate-fade-in">
    }
    }
    className="flex items-center gap-3 mb-4"
  >
    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  </div>
);

/**
 * Suggested questions component
 */
const SuggestedQuestions: React.FC<{
  questions: string[];
  onQuestionClick: (question: string) => void;
  isDisabled: boolean;
}> = ({ questions, onQuestionClick, isDisabled }) => {
  if (questions.length === 0) return null;

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <p className="text-xs text-gray-600 mb-3 font-medium">Suggested questions:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            disabled={isDisabled}
            className="
              text-left text-sm p-3 bg-white border border-gray-200 rounded-lg
              hover:border-blue-300 hover:shadow-sm transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            "
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Rate limit warning component
 */
const RateLimitWarning: React.FC<{
  rateLimitState: RateLimitState;
}> = ({ rateLimitState }) => {
  if (!rateLimitState.isLimited) return null;

  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mx-4 mb-4">
      <div className="flex items-center gap-2 text-amber-800">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">
          Rate limit reached. Please wait before sending another message.
        </span>
      </div>
      {rateLimitState.resetTime && (
        <p className="text-xs text-amber-600 mt-1">
          Next message available at {rateLimitState.resetTime.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PortalChatInterface: React.FC<PortalChatInterfaceProps> = ({
  portalConfig,
  chatConfig,
  initialState,
  uiCustomization = {},
  features = {},
  ragConfig = {},
  rateLimiting = {},
  advanced = {},
  onMessageSent,
  onMessageReceived,
  onTypingStart,
  onTypingEnd,
  onChatOpen,
  onChatClose,
  onError,
  onReactionAdd,
  onFileUpload,
  className = '',
  mode = 'private'
}) => {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const [chatState, setChatState] = useState<ChatState>({
    sessionId: null,
    messages: initialState?.messages || [],
    isTyping: false,
    isConnected: false,
    currentVoiceInput: false,
    isFullscreen: false
  });

  const [inputState, setInputState] = useState<ChatInputState>({
    text: '',
    isValid: true,
    wordCount: 0,
    characterCount: 0
  });

  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    remainingMessages: rateLimiting.messagesPerMinute || 10,
    resetTime: null,
    isLimited: false
  });

  const [voiceRecognition, setVoiceRecognition] = useState<SpeechRecognition | null>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);

  // ========================================================================
  // REFS AND HOOKS
  // ========================================================================

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { callFunction, loading: functionLoading, error: functionError } = useFirebaseFunction();

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const isInputDisabled = useMemo(() => {
    return (
      functionLoading ||
      chatState.isTyping ||
      rateLimitState.isLimited ||
      !chatState.isConnected
    );
  }, [functionLoading, chatState.isTyping, rateLimitState.isLimited, chatState.isConnected]);

  const suggestedQuestions = useMemo(() => {
    if (chatState.messages.length > 0) return [];
    return initialState?.suggestedQuestions || chatConfig.behavior?.suggestedQuestions || [
      "What are the key skills highlighted in this CV?",
      "Tell me about the work experience",
      "What achievements are mentioned?",
      "What education background is included?"
    ];
  }, [chatState.messages.length, initialState?.suggestedQuestions, chatConfig.behavior]);

  const canSendMessage = useMemo(() => {
    return (
      inputState.text.trim().length > 0 &&
      inputState.text.trim().length <= 1000 &&
      !isInputDisabled
    );
  }, [inputState.text, isInputDisabled]);

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ 
        behavior: chatConfig.behavior?.autoScroll !== false ? 'smooth' : 'auto' 
      });
    }
  }, [chatConfig.behavior]);

  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const speakText = useCallback((text: string) => {
    if (speechSynthesis && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast.error('Speech synthesis not supported');
    }
  }, [speechSynthesis]);

  // ========================================================================
  // CHAT FUNCTIONS
  // ========================================================================

  const initializeSession = useCallback(async () => {
    try {
      setChatState(prev => ({ ...prev, isConnected: false }));
      
      const result = await callFunction('startChatSession', {
        portalId: portalConfig.id,
        ragConfig: {
          enabled: ragConfig.enabled !== false,
          maxSources: ragConfig.maxSources || 3,
          similarityThreshold: ragConfig.similarityThreshold || 0.7
        }
      });

      const sessionId = result.sessionId;
      setChatState(prev => ({
        ...prev,
        sessionId,
        isConnected: true,
        messages: initialState?.welcomeMessage ? [{
          id: generateMessageId(),
          content: initialState.welcomeMessage,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'text',
          status: 'sent'
        }] : []
      }));

      onChatOpen?.();
      toast.success('Chat session started');
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      const chatError: ChatError = {
        code: 'CHAT_SERVICE_ERROR',
        message: 'Failed to start chat session',
        chatOperation: 'send_message',
        component: 'PortalChatInterface',
        timestamp: new Date()
      };
      onError?.(chatError);
      toast.error('Failed to start chat session');
    }
  }, [callFunction, portalConfig.id, ragConfig, initialState, generateMessageId, onChatOpen, onError]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || inputState.text.trim();
    if (!text || !chatState.sessionId || !canSendMessage) return;

    // Check rate limiting
    if (rateLimitState.isLimited) {
      toast.error(rateLimiting.blockedMessage || 'Rate limit exceeded. Please wait.');
      return;
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      content: text,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    };

    // Add user message to chat
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true
    }));

    // Clear input
    setInputState({ text: '', isValid: true, wordCount: 0, characterCount: 0 });
    
    // Trigger callbacks
    onMessageSent?.(userMessage);
    onTypingStart?.();

    try {
      // Update user message status
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      }));

      // Call AI service
      const startTime = Date.now();
      const result = await callFunction('sendChatMessage', {
        sessionId: chatState.sessionId,
        message: text,
        options: {
          enableRAG: ragConfig.enabled !== false,
          maxSources: ragConfig.maxSources || 3,
          similarityThreshold: ragConfig.similarityThreshold || 0.7,
          includeSourceDocuments: ragConfig.showSources !== false
        }
      });

      const processingTime = Date.now() - startTime;

      // Create assistant response
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        content: result.response,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text',
        status: 'sent',
        metadata: {
          processingTime,
          confidence: result.confidence,
          tokenUsage: result.tokenUsage
        },
        sourceDocuments: result.sourceDocuments
      };

      // Add assistant message
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false
      }));

      onMessageReceived?.(assistantMessage);
      onTypingEnd?.();

      // Update rate limiting
      setRateLimitState(prev => ({
        ...prev,
        remainingMessages: Math.max(0, prev.remainingMessages - 1),
        isLimited: prev.remainingMessages <= 1
      }));

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Update user message status to error
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
        ),
        isTyping: false
      }));

      const chatError: ChatError = {
        code: 'CHAT_SERVICE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to send message',
        chatOperation: 'send_message',
        messageId: userMessage.id,
        component: 'PortalChatInterface',
        timestamp: new Date()
      };
      
      onError?.(chatError);
      onTypingEnd?.();
      toast.error('Failed to send message. Please try again.');
    }
  }, [
    inputState.text,
    chatState.sessionId,
    canSendMessage,
    rateLimitState.isLimited,
    rateLimiting.blockedMessage,
    generateMessageId,
    onMessageSent,
    onTypingStart,
    ragConfig,
    callFunction,
    onMessageReceived,
    onTypingEnd,
    onError
  ]);

  const handleReaction = useCallback(async (messageId: string, reaction: string) => {
    try {
      await callFunction('addMessageReaction', {
        sessionId: chatState.sessionId,
        messageId,
        reaction
      });
      
      onReactionAdd?.(messageId, reaction);
      toast.success('Feedback recorded');
    } catch (error) {
      console.error('Failed to add reaction:', error);
      toast.error('Failed to record feedback');
    }
  }, [chatState.sessionId, callFunction, onReactionAdd]);

  const exportConversation = useCallback(async (options: ConversationExport) => {
    try {
      const exportData = {
        portalId: portalConfig.id,
        sessionId: chatState.sessionId,
        messages: chatState.messages,
        exportOptions: options,
        exportedAt: new Date()
      };

      let exportContent: string;
      let filename: string;
      let mimeType: string;

      switch (options.format) {
        case 'json':
          exportContent = JSON.stringify(exportData, null, 2);
          filename = `chat-conversation-${Date.now()}.json`;
          mimeType = 'application/json';
          break;
        case 'txt':
          exportContent = chatState.messages
            .map(msg => `[${msg.timestamp.toLocaleString()}] ${msg.sender}: ${msg.content}`)
            .join('\n\n');
          filename = `chat-conversation-${Date.now()}.txt`;
          mimeType = 'text/plain';
          break;
        case 'pdf':
          // For PDF, we'd need to call a backend service
          const pdfResult = await callFunction('exportChatToPDF', exportData);
          // Handle PDF download
          toast.success('PDF export initiated');
          return;
        default:
          throw new Error('Unsupported export format');
      }

      const blob = new Blob([exportContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Conversation exported successfully');
    } catch (error) {
      console.error('Failed to export conversation:', error);
      toast.error('Failed to export conversation');
    }
  }, [portalConfig.id, chatState.sessionId, chatState.messages, callFunction]);

  // ========================================================================
  // VOICE FUNCTIONALITY
  // ========================================================================

  const startVoiceRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setChatState(prev => ({ ...prev, currentVoiceInput: true }));
        toast.success('Voice recording started');
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInputState(prev => ({
          ...prev,
          text: transcript,
          wordCount: transcript.split(' ').length,
          characterCount: transcript.length
        }));
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setChatState(prev => ({ ...prev, currentVoiceInput: false }));
        toast.error('Voice recognition failed');
      };

      recognition.onend = () => {
        setChatState(prev => ({ ...prev, currentVoiceInput: false }));
      };

      recognition.start();
      setVoiceRecognition(recognition);
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      toast.error('Failed to start voice recognition');
    }
  }, []);

  const stopVoiceRecognition = useCallback(() => {
    if (voiceRecognition) {
      voiceRecognition.stop();
      setVoiceRecognition(null);
    }
    setChatState(prev => ({ ...prev, currentVoiceInput: false }));
  }, [voiceRecognition]);

  // ========================================================================
  // INPUT HANDLERS
  // ========================================================================

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = text.length;
    
    setInputState({
      text,
      isValid: characterCount <= 1000,
      wordCount,
      characterCount
    });
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSendMessage) {
        sendMessage();>, [canSendMessage, sendMessage]);

  const handleSuggestedQuestionClick = useCallback((question: string) => {
    setInputState({
      text: question,
      isValid: true,
      wordCount: question.split(' ').length,
      characterCount: question.length
    });
    sendMessage(question);
  }, [sendMessage]);

  // ========================================================================
  // SEARCH FUNCTIONALITY
  // ========================================================================

  const handleSearchMessages = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredMessages([]);
      return;
    }

    const filtered = chatState.messages.filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase()) ||
      message.sourceDocuments?.some(doc => 
        doc.content.toLowerCase().includes(query.toLowerCase())
      )
    );
    setFilteredMessages(filtered);
  }, [chatState.messages]);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, scrollToBottom]);

  useEffect(() => {
    if (!chatState.sessionId && chatState.isConnected === false) {
      initializeSession();
    }
  }, [chatState.sessionId, chatState.isConnected, initializeSession]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Rate limiting reset timer
  useEffect(() => {
    if (rateLimitState.isLimited && rateLimiting.messagesPerMinute) {
      const resetTime = new Date(Date.now() + 60000); // 1 minute from now
      setRateLimitState(prev => ({ ...prev, resetTime }));
      
      const timer = setTimeout(() => {
        setRateLimitState({
          remainingMessages: rateLimiting.messagesPerMinute,
          resetTime: null,
          isLimited: false
        });
      }, 60000);

      return () => clearTimeout(timer);
    }
  }, [rateLimitState.isLimited, rateLimiting.messagesPerMinute]);

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderChatHeader = () => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {uiCustomization.title || 'AI Assistant'}
          </h3>
          <p className="text-sm text-gray-500">
            {chatState.isConnected ? 'Online' : 'Connecting...'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {features?.search && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Search messages"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
        
        {features?.export && (
          <button
            onClick={() => exportConversation({ 
              format: 'txt', 
              includeMetadata: true, 
              includeTimestamps: true, 
              includeSourceDocuments: true 
            })}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Export conversation"
          >
            <Download className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => setChatState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title={chatState.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {chatState.isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderChatInput = () => (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* Input Area */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={inputState.text}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your question about this CV..."
            disabled={isInputDisabled}
            rows={1}
            className="
              w-full px-4 py-3 border border-gray-300 rounded-xl resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              placeholder-gray-400
            "
            style={{ 
              minHeight: '48px',
              maxHeight: '120px'
            }}
          />
          
          {/* Character count */}
          <div className="flex items-center justify-between mt-2 px-1">
            <span className={`text-xs ${
              inputState.characterCount > 1000 ? 'text-red-500' : 'text-gray-400'
            }`}>
              {inputState.characterCount}/1000
            </span>
            
            {inputState.wordCount > 0 && (
              <span className="text-xs text-gray-400">
                {inputState.wordCount} words
              </span>
            )}
          </div>
        </div>

        {/* Voice Input Button */}
        {features?.voiceInput && (
          <button
            onClick={chatState.currentVoiceInput ? stopVoiceRecognition : startVoiceRecognition}
            disabled={isInputDisabled}
            className={`
              p-3 rounded-xl transition-colors
              ${chatState.currentVoiceInput
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title={chatState.currentVoiceInput ? 'Stop recording' : 'Start voice input'}
          >
            {chatState.currentVoiceInput ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Send Button */}
        <button
          onClick={() => sendMessage()}
          disabled={!canSendMessage}
          className="
            p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
            text-white rounded-xl transition-colors
            disabled:cursor-not-allowed
          "
          title="Send message"
        >
          {functionLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  if (functionError) {
    return (
      <ErrorBoundary onError={onError}>
        <FeatureWrapper
          className={className}
          mode={mode}
          title="Chat Interface"
          error={functionError}
          onRetry={initializeSession}
        >
          <div className="text-center py-8">
            <p className="text-gray-600">Failed to initialize chat interface.</p>
          </div>
        </FeatureWrapper>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={`${className} ${chatState.isFullscreen ? 'fixed inset-0 z-50' : ''}`}
        mode={mode}
        title="AI Chat Assistant"
      >
        <div className={`
          flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm
          ${chatState.isFullscreen ? 'h-full' : 'h-[600px]'}
        `}>
          {/* Chat Header */}
          {renderChatHeader()}

          {/* Search Panel */}
          {showSettings && features?.search && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => handleSearchMessages(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Rate Limit Warning */}
          <RateLimitWarning rateLimitState={rateLimitState} />

          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {!chatState.isConnected ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="large" text="Connecting to AI assistant..." />
              </div>
            ) : (
              <div>
                {/* Display filtered messages if searching, otherwise all messages */}
                {(searchQuery ? filteredMessages : chatState.messages).map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    showTimestamp={features?.timestamps !== false}
                    showSources={ragConfig.showSources !== false}
                    onReaction={handleReaction}
                    onCopy={copyToClipboard}
                    onSpeak={speakText}
                  />
                ))}
                
                {/* Typing Indicator */}
                {chatState.isTyping && <TypingIndicator />}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && (
            <SuggestedQuestions
              questions={suggestedQuestions}
              onQuestionClick={handleSuggestedQuestionClick}
              isDisabled={isInputDisabled}
            />
          )}

          {/* Chat Input */}
          {renderChatInput()}
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};

export default PortalChatInterface;