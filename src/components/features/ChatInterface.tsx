import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
}

interface ChatInterfaceProps {
  sessionId?: string;
  suggestedQuestions?: string[];
  onStartSession: () => Promise<{ sessionId: string; suggestedQuestions: string[] }>;
  onSendMessage: (sessionId: string, message: string) => Promise<{ content: string; confidence?: number }>;
  onEndSession?: (sessionId: string, rating?: number, feedback?: string) => Promise<void>;
}

export const ChatInterface = ({
  sessionId: initialSessionId,
  suggestedQuestions: initialQuestions = [],
  onStartSession,
  onSendMessage,
  onEndSession
}: ChatInterfaceProps) => {
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState(initialQuestions);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewSession = async () => {
    try {
      setLoading(true);
      const { sessionId: newSessionId, suggestedQuestions: questions } = await onStartSession();
      setSessionId(newSessionId);
      setSuggestedQuestions(questions);
      
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm here to answer questions about this CV. What would you like to know?",
        timestamp: new Date()
      }]);
    } catch {
      toast.error('Failed to start chat session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      startNewSession();
    }
  }, [sessionId, startNewSession]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || !sessionId) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await onSendMessage(sessionId, text);
      
      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        confidence: response.confidence
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Clear suggested questions after first message
      if (suggestedQuestions.length > 0) {
        setSuggestedQuestions([]);
      }
    } catch {
      toast.error('Failed to send message');
      // Remove the user message if sending failed
      setMessages(prev => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endSession = async () => {
    if (!sessionId || !onEndSession) return;
    
    try {
      await onEndSession(sessionId, rating || undefined);
      toast.success('Thanks for your feedback!');
      setShowFeedback(false);
    } catch {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-800 rounded-xl">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100">CV Assistant</h3>
            <p className="text-sm text-gray-400">Ask me anything about this CV</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' 
                ? 'bg-gray-600' 
                : 'bg-gradient-to-br from-cyan-500 to-blue-600'
            }`}>
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-gray-200" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}>
                <p className="text-sm">{message.content}</p>
                {message.confidence !== undefined && (
                  <p className="text-xs mt-1 opacity-70">
                    Confidence: {Math.round(message.confidence * 100)}%
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-700 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => sendMessage(question)}
                className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {showFeedback && (
        <div className="px-6 py-3 bg-gray-700/50 border-t border-gray-600">
          <p className="text-sm text-gray-300 mb-2">How was your experience?</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setRating(1);
                endSession();
              }}
              className={`p-2 rounded-lg transition-colors ${
                rating === 1 ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              <ThumbsUp className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => {
                setRating(-1);
                endSession();
              }}
              className={`p-2 rounded-lg transition-colors ${
                rating === -1 ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              <ThumbsDown className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setShowFeedback(false)}
              className="ml-auto text-sm text-gray-400 hover:text-gray-300"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            disabled={loading}
            className="flex-1 bg-gray-700 text-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="p-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
        {messages.length > 2 && !showFeedback && (
          <button
            onClick={() => setShowFeedback(true)}
            className="mt-2 text-xs text-gray-400 hover:text-gray-300"
          >
            End conversation
          </button>
        )}
      </div>
    </div>
  );
};