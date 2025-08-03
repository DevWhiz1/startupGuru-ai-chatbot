import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const messagesEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Check screen size and adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load chat sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions);
      setChatSessions(sessions);
    }
    const tutorialSeen = localStorage.getItem('tutorialSeen');
    if (tutorialSeen) setShowTutorial(false);
  }, []);

  // Save chat sessions to localStorage
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  // Create or update current session
  useEffect(() => {
    if (messages.length > 0) {
      if (!currentSessionId) {
        const newSessionId = Date.now().toString();
        const newSession = {
          id: newSessionId,
          title: messages[0].text.substring(0, 30) + (messages[0].text.length > 30 ? '...' : ''),
          timestamp: new Date().toISOString(),
          messages: messages,
          lastMessage: messages[messages.length - 1].text.substring(0, 50) + '...'
        };
        setChatSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSessionId);
      } else {
        setChatSessions(prev => prev.map(session => 
          session.id === currentSessionId 
            ? {
                ...session,
                messages: messages,
                lastMessage: messages[messages.length - 1].text.substring(0, 50) + '...',
                timestamp: new Date().toISOString()
              }
            : session
        ));
      }
    }
  }, [messages]);

  const categories = [
    { id: 'all', name: 'All', icon: '🌟' },
    { id: 'ideation', name: 'Ideation', icon: '💡' },
    { id: 'launch', name: 'Launch', icon: '🚀' },
    { id: 'growth', name: 'Growth', icon: '📈' },
    { id: 'funding', name: 'Funding', icon: '💰' },
  ];

  const defaultTopics = [
    // Ideation Phase
    { category: 'ideation', icon: "🧠", title: "Generate Ideas", prompt: "Generate 5 innovative startup ideas based on current market trends", gradient: "from-purple-400 to-pink-400" },
    // { category: 'ideation', icon: "🔍", title: "Validate Ideas", prompt: "How do I validate my startup idea before investing time and money?", gradient: "from-blue-400 to-cyan-400" },
    // { category: 'ideation', icon: "🎯", title: "Find Niche", prompt: "Help me identify profitable niches for my startup", gradient: "from-green-400 to-emerald-400" },
    
    // Launch Phase
    { category: 'launch', icon: "📋", title: "Business Plan", prompt: "Create a business plan outline for my startup", gradient: "from-orange-400 to-red-400" },
    // { category: 'launch', icon: "⚖️", title: "Legal Setup", prompt: "What legal steps do I need to launch my startup?", gradient: "from-pink-400 to-rose-400" },
    // { category: 'launch', icon: "🛠️", title: "MVP Guide", prompt: "Guide me through building an MVP for my startup idea", gradient: "from-teal-400 to-blue-400" },
    
    // Growth Phase
    { category: 'growth', icon: "📣", title: "Marketing", prompt: "Create a digital marketing strategy for my startup", gradient: "from-purple-400 to-indigo-400" },
    // { category: 'growth', icon: "📱", title: "Social Media", prompt: "Build a social media strategy for my startup", gradient: "from-blue-400 to-purple-400" },
    // { category: 'growth', icon: "🔄", title: "Retention", prompt: "Best strategies for customer retention?", gradient: "from-green-400 to-teal-400" },
    
    // Funding Phase
    { category: 'funding', icon: "💸", title: "Funding Options", prompt: "Explain all funding options for my startup", gradient: "from-yellow-400 to-amber-400" },
    // { category: 'funding', icon: "📑", title: "Pitch Deck", prompt: "Help me create a pitch deck for investors", gradient: "from-indigo-400 to-blue-400" },
    // { category: 'funding', icon: "🤝", title: "Find Investors", prompt: "How do I find investors for my startup?", gradient: "from-purple-400 to-pink-400" },
  ];

const quickPrompts = [
  "Startup idea using AI in healthcare",
  "Profitable SaaS idea for small businesses",
  "30-day launch plan for a marketplace app",
  "Marketing strategy to get first 1000 users",
//   "Investor pitch summary for B2B SaaS",
//   "How to bootstrap a startup with no money",
  "Best low-cost marketing hacks for startups",
  "AI tools to scale my startup quickly"
];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const loadChatSession = (session) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const deleteChatSession = (sessionId, e) => {
    e.stopPropagation();
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (sessionId === currentSessionId) {
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const clearAllChats = () => {
    if (window.confirm('Are you sure you want to delete all chat history?')) {
      setChatSessions([]);
      setMessages([]);
      setCurrentSessionId(null);
      localStorage.removeItem('chatSessions');
    }
  };

  const handleTopicClick = (prompt) => {
    setInputText(prompt);
    handleSubmit(null, prompt);
  };

  const handleQuickPrompt = (prompt) => {
    setInputText(prompt);
    handleSubmit(null, prompt);
  };

  const handleSubmit = async (e, customPrompt = null) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || inputText;
    if (!promptToSend.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: promptToSend,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowTutorial(false);
    localStorage.setItem('tutorialSeen', 'true');

    try {
      const response = await axios.post(`${API_URL}/generate-idea`, {
        prompt: promptToSend
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.generated_text,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, An error encountered. Please try again.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTopics = selectedCategory === 'all' 
    ? defaultTopics 
    : defaultTopics.filter(topic => topic.category === selectedCategory);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('tutorialSeen', 'true');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden">
      {/* Sidebar Overlay for mobile */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed md:relative z-30 md:z-0 h-full ${
          isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-80'
        } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-lg`}
      >
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="truncate">New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Chat History</h3>
          {chatSessions.length === 0 ? (
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No chat history yet</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => loadChatSession(session)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                    currentSessionId === session.id
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 shadow-sm'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{session.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(session.timestamp)}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate">{session.lastMessage}</p>
                    </div>
                    <button
                      onClick={(e) => deleteChatSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-50 rounded"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {chatSessions.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={clearAllChats}
              className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear all chats</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 md:hidden"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      StartupGuru AI
                    </h1>
                    <p className="text-xs text-gray-500 hidden sm:block">Your AI Startup Assistant</p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-600">
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full shadow-sm">💡 Ideation</span>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full shadow-sm hidden md:inline">🚀 Launch</span>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full shadow-sm hidden lg:inline">📈 Growth</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="text-center py-6 sm:py-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                    Turn Your Ideas Into Successful Startups
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-6">
                    I'm your AI startup mentor, here to help you generate ideas, validate concepts, 
                    create business plans, develop marketing strategies, and scale your business!
                  </p>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickPrompt(prompt)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:border-purple-400 hover:text-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Category Filters */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                          selectedCategory === cat.id
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="mr-1">{cat.icon}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Topic Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTopics.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => handleTopicClick(topic.prompt)}
                        className="group relative overflow-hidden rounded-xl p-5 bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left border border-gray-100"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${topic.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        <div className="relative z-10">
                          <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                            {topic.icon}
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-900 mb-1">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-gray-500 mb-3">{topic.prompt.substring(0, 60)}...</p>
                          <div className="flex items-center text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Try this</span>
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${topic.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Message Display */
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white ml-8'
                        : 'bg-white text-gray-800 border border-gray-200 mr-8'
                    } shadow-md`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' 
                          ? 'bg-white/20' 
                          : 'bg-gradient-to-r from-purple-400 to-blue-400 shadow-sm'
                      }`}>
                        {message.sender === 'user' ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className={`font-semibold text-sm ${
                            message.sender === 'user' ? 'text-white/90' : 'text-purple-600'
                          }`}>
                            {message.sender === 'user' ? 'You' : 'StartupGuru AI'}
                          </span>
                          <span className={`text-xs ml-2 ${
                            message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                          }`}>
                            {message.timestamp}
                          </span>
                        </div>
                        {message.sender === 'ai' ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({children}) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                                ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                                li: ({children}) => <li className="text-gray-700">{children}</li>,
                                strong: ({children}) => <strong className="font-semibold text-purple-600">{children}</strong>,
                                em: ({children}) => <em className="italic text-gray-600">{children}</em>,
                                h1: ({children}) => <h1 className="text-xl font-bold text-gray-800 mb-2">{children}</h1>,
                                h2: ({children}) => <h2 className="text-lg font-bold text-gray-800 mb-2">{children}</h2>,
                                h3: ({children}) => <h3 className="text-md font-bold text-gray-800 mb-2">{children}</h3>,
                                blockquote: ({children}) => <blockquote className="border-l-4 border-purple-400 pl-3 italic my-3 bg-purple-50 px-2 py-1 rounded-r">{children}</blockquote>,
                                code: ({children}) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-white text-sm sm:text-base">{message.text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Loading Animation */}
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white rounded-xl px-4 py-3 shadow-md border border-gray-200 mr-8 max-w-xs sm:max-w-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-600 mb-1">Thinking...</p>
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Enhanced Input Form */}
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Suggested Actions when conversation is active */}
            {/* {messages.length > 0 && messages.length < 4 && (
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Try asking:</span>
                <button
                  onClick={() => handleQuickPrompt("Tell me more about this")}
                  className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors shadow-sm"
                >
                  Tell me more
                </button>
                <button
                  onClick={() => handleQuickPrompt("What are the next steps?")}
                  className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors shadow-sm"
                >
                  Next steps
                </button>
                <button
                  onClick={() => handleQuickPrompt("Give me specific examples")}
                  className="text-xs px-3 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors shadow-sm"
                >
                  Examples
                </button>
              </div>
            )} */}
            
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about startup ideas, business plans, marketing strategies, funding..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 placeholder-gray-400 shadow-sm hover:shadow transition-all"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <span className="font-medium">Send</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            
            <div className="mt-2 text-center text-xs text-gray-500">
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI Assistant • 24/7
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;