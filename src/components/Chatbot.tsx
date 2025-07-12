import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader, Sparkles, HelpCircle, Code, Lightbulb, Zap, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'code';
  confidence?: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  prompt: string;
  color: string;
  category: 'help' | 'code' | 'career' | 'platform';
}

export const Chatbot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'help',
      label: '💡 How to ask amazing questions?',
      icon: HelpCircle,
      prompt: 'I want to ask really great questions that get helpful answers. Can you give me your best tips and strategies?',
      color: 'text-blue-600',
      category: 'help'
    },
    {
      id: 'code',
      label: '💻 Code formatting best practices',
      icon: Code,
      prompt: 'How can I format my code and technical content to look professional and be easy to read?',
      color: 'text-green-600',
      category: 'code'
    },
    {
      id: 'reputation',
      label: '🚀 Build my reputation fast',
      icon: Lightbulb,
      prompt: 'What are the best strategies to build reputation and become a respected member of the StackIt community?',
      color: 'text-purple-600',
      category: 'career'
    },
    {
      id: 'features',
      label: '⚡ Master StackIt features',
      icon: Zap,
      prompt: 'Tell me about the coolest StackIt features and how to use them effectively to get better results.',
      color: 'text-orange-600',
      category: 'platform'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Enhanced welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hey there${user ? `, ${user.username}` : ''}! 👋 I'm Stacky, your AI-powered assistant!

I'm here to help you become a StackIt superstar! I can assist you with:

🎯 **Crafting killer questions** that get amazing answers
✨ **Writing helpful responses** that the community loves  
🛠️ **Mastering StackIt features** like a pro
🚀 **Building your reputation** and becoming a community legend
💻 **Code formatting magic** to make your posts shine
🧠 **Technical problem-solving** with AI-powered insights

I'm powered by Google's latest Gemini 2.0 Flash AI, so I can provide really smart, contextual help. What would you like to explore today? 🤗`,
        isBot: true,
        timestamp: new Date(),
        type: 'text',
        confidence: 95
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user]);

  const simulateTyping = async (duration: number = 1500) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTyping(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      isBot: false,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate typing delay for better UX
    await simulateTyping(800 + Math.random() * 1000);

    try {
      // Enhanced context-aware prompt for Gemini
      const chatPrompt = `You are Stacky, an enthusiastic and knowledgeable AI assistant for StackIt, a Q&A platform for developers and learners. You're powered by Google's Gemini 2.0 Flash AI.

Your personality:
- Friendly, encouraging, and genuinely helpful
- Enthusiastic about coding and learning
- Use emojis naturally but don't overdo it
- Conversational and warm, like talking to a knowledgeable friend
- Provide specific, actionable advice
- Ask follow-up questions when helpful

Context about StackIt:
- It's a modern Q&A platform for developers
- Users can ask questions, provide answers, vote, and earn reputation
- Has AI-powered features for content analysis and suggestions
- Supports rich text editing, tags, anonymous posting
- Has expert users, badges, and reputation system
- Includes admin panel and content moderation

User context: ${user ? `User is logged in as ${user.username} with ${user.reputation} reputation` : 'User is not logged in'}

User message: "${content}"

Guidelines for your response:
- Be conversational and helpful (2-4 sentences usually)
- If it's about StackIt features, explain them enthusiastically
- If it's about coding/technical topics, provide practical advice
- If it's about community/reputation, share engagement strategies
- If it's general conversation, be friendly and redirect to how you can help
- Include relevant emojis naturally
- End with a question or suggestion when appropriate

Respond as Stacky would - helpful, encouraging, and knowledgeable!`;

      let response;
      try {
        response = await aiService.callGeminiAPI(chatPrompt);
      } catch (apiError) {
        console.error('Gemini API error:', apiError);
        throw new Error('AI service temporarily unavailable');
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response || "I'm having trouble generating a response right now. Could you try asking your question again?",
        isBot: true,
        timestamp: new Date(),
        type: 'text',
        confidence: response ? (90 + Math.random() * 10) : 50
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setError('Failed to send message. Please try again.');
      
      // Enhanced fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Oops! 😅 I'm having a little trouble connecting to my AI brain right now, but I'm still here to help!

While I get back online, here are some quick tips that always work:

🎯 **For great questions:**
• Be specific with your problem
• Include relevant code examples
• Mention what you've already tried
• Use clear, descriptive titles

🏷️ **For better visibility:**
• Choose relevant tags carefully
• Search existing questions first
• Provide context about your environment

💡 **For building reputation:**
• Answer questions in your expertise area
• Provide detailed, helpful responses
• Engage positively with the community

Try chatting with me again in just a moment - my AI powers should be back! 🚀✨`,
        isBot: true,
        timestamp: new Date(),
        type: 'text',
        confidence: 85
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt);
  };

  const formatMessage = (content: string) => {
    // Guard against null or undefined content
    if (!content || typeof content !== 'string') {
      return "I'm having trouble generating a proper response. Could you try rephrasing your question?";
    }
    
    // If content is just a number (like confidence percentage), return a default message
    if (/^\d+%?$/.test(content.trim())) {
      return "I'm having trouble generating a proper response. Could you try rephrasing your question?";
    }
    
    // Enhanced markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/🎯\s*\*\*(.*?)\*\*/g, '<div class="mt-2 mb-1"><span class="text-blue-600 font-semibold">🎯 $1</span></div>')
      .replace(/🏷️\s*\*\*(.*?)\*\*/g, '<div class="mt-2 mb-1"><span class="text-green-600 font-semibold">🏷️ $1</span></div>')
      .replace(/💡\s*\*\*(.*?)\*\*/g, '<div class="mt-2 mb-1"><span class="text-purple-600 font-semibold">💡 $1</span></div>')
      .replace(/✨\s*\*\*(.*?)\*\*/g, '<div class="mt-2 mb-1"><span class="text-orange-600 font-semibold">✨ $1</span></div>')
      .replace(/🛠️\s*\*\*(.*?)\*\*/g, '<div class="mt-2 mb-1"><span class="text-indigo-600 font-semibold">🛠️ $1</span></div>')
      .replace(/🚀\s*\*\*(.*?)\*\*/g, '<div class="mt-2 mb-1"><span class="text-red-600 font-semibold">🚀 $1</span></div>')
      .replace(/🧠\s*\*\*(.*?)\*\*/g, '<div class="mt-2 mb-1"><span class="text-pink-600 font-semibold">🧠 $1</span></div>')
      .replace(/^•\s+(.+)$/gm, '<div class="ml-4 text-gray-700">• $1</div>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center relative ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-600 rotate-180' 
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 animate-pulse-slow hover:scale-110'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                <Brain className="w-2 h-2 text-white" />
              </div>
            </>
          )}
        </button>
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 text-white p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center relative">
                <Bot className="w-6 h-6" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Stacky AI</h3>
                <p className="text-sm opacity-90 flex items-center space-x-1">
                  <Brain className="w-3 h-3" />
                  <span>Powered by Gemini 2.0 Flash</span>
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
              >
                <div className={`flex items-start space-x-2 max-w-[85%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isBot 
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  }`}>
                    {message.isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-2xl p-4 shadow-sm ${
                    message.isBot 
                      ? 'bg-white text-gray-800 border border-gray-200' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  }`}>
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content || '') }}
                    />
                    <div className={`flex items-center justify-between mt-3 text-xs ${
                      message.isBot ? 'text-gray-500' : 'text-blue-100'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.confidence && message.isBot && (
                        <span className="flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{Math.round(message.confidence)}%</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(isLoading || isTyping) && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">Stacky is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-4 py-3 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 mb-3 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Quick help to get you started:</span>
              </p>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="w-full text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3 border border-gray-100 hover:border-gray-200"
                  >
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                    <span className="flex-1">{action.label}</span>
                    <div className="text-xs text-gray-400">→</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && !isTyping && handleSendMessage(inputValue)}
                placeholder="Ask me anything about StackIt..."
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isLoading || isTyping}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || isTyping || !inputValue.trim()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Powered by Gemini AI</span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Online</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};