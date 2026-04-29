import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import ChatSidebar from '../../components/customer/ChatSidebar';
import ChatMessage from '../../components/customer/ChatMessage';
import ChatInput from '../../components/customer/ChatInput';
import ChatWelcome from '../../components/customer/ChatWelcome';
import ChatScrollSpy from '../../components/customer/ChatScrollSpy';
import useChatSignalR from '../../hooks/useChatSignalR';
import { getSessions, getSessionMessages, streamChat } from '../../services/api/chat.service';
import { getDecodedToken } from '../../utils/authUtils';

const ChatPage = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Streaming states
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [activeStreamingId, setActiveStreamingId] = useState(null);
  
  const scrollRef = useRef(null);
  const userId = useRef(getDecodedToken(localStorage.getItem('token'))?.nameid || 'unknown');
  const isInitialLoad = useRef(true);

  // Fetch session history
  const fetchSessions = useCallback(async () => {
    try {
      const data = await getSessions();
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Load messages for existing session
  const loadMessages = useCallback(async (sessionId) => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    try {
      const data = await getSessionMessages(sessionId);
      const items = data?.items || [];
      const sorted = [...items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(sorted);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }, []);

  // Listen for sessionId changes
  useEffect(() => {
    if (isInitialLoad.current) {
       loadMessages(currentSessionId);
    }
  }, [currentSessionId, loadMessages]);

  // Scroll to bottom when messages load or change
  useEffect(() => {
    if (scrollRef.current) {
      // Small timeout ensures DOM is fully rendered before calculating height
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages, streamingContent, isThinking]);

  // SignalR Handlers
  const onReceiveChunk = useCallback((messageId, chunk) => {
    setIsThinking(false);
    setIsStreaming(true);
    setActiveStreamingId(messageId);
    setStreamingContent(prev => prev + chunk);
  }, []);

  const onMessageCompleted = useCallback((messageId) => {
    setIsStreaming(false);
    setIsThinking(false);
    setActiveStreamingId(null);
    setStreamingContent('');
    
    if (currentSessionId) {
      loadMessages(currentSessionId);
      fetchSessions();
    }
  }, [currentSessionId, loadMessages, fetchSessions]);

  const onTitleUpdated = useCallback((sessionId, newTitle) => {
    setSessions(prev => {
      const exists = prev.some(s => s.id === sessionId);
      if (exists) {
        return prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s);
      } else {
        return [{ id: sessionId, title: newTitle, createdAt: new Date().toISOString() }, ...prev];
      }
    });
  }, []);

  const onReceiveError = useCallback((error) => {
    console.error('SignalR Error:', error);
    setIsThinking(false);
    setIsStreaming(false);
  }, []);

  const signalRHandlers = useMemo(() => ({
    ReceiveMessageChunk: onReceiveChunk,
    MessageCompleted: onMessageCompleted,
    SessionTitleUpdated: onTitleUpdated,
    ReceiveError: onReceiveError
  }), [onReceiveChunk, onMessageCompleted, onTitleUpdated, onReceiveError]);

  useChatSignalR(signalRHandlers);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      isInitialLoad.current = false;
      setCurrentSessionId(sessionId);
    }

    const userMsg = { 
      id: `temp-u-${Date.now()}`, 
      role: 'User', 
      content: text, 
      createdAt: new Date().toISOString() 
    };
    setMessages(prev => [...prev, userMsg]);
    
    setIsThinking(true);
    setStreamingContent('');

    try {
      await streamChat(text, sessionId);
    } catch (err) {
      console.error('API Error:', err);
      if (!isStreaming) {
        setIsThinking(false);
        setMessages(prev => [...prev, { 
          id: `err-${Date.now()}`, 
          role: 'AI', 
          content: 'Uplink synchronization failed.', 
          createdAt: new Date().toISOString() 
        }]);
      }
    }
  };

  const handleSelectSession = (id) => {
    isInitialLoad.current = true;
    setCurrentSessionId(id);
    setStreamingContent('');
    setIsStreaming(false);
    setIsThinking(false);
    setIsSidebarOpen(false);
  };

  const handleScrollToMessage = useCallback((id) => {
    const element = document.getElementById(id);
    if (element && scrollRef.current) {
      // Bulletproof scroll calculation using viewport coordinates
      const containerTop = scrollRef.current.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      
      // Target position = current scroll + difference in viewport + offset
      const scrollPosition = scrollRef.current.scrollTop + (elementTop - containerTop) - 80;
      
      scrollRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleScrollTop = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <CustomerLayout title="KINETIC AI" fullWidth={true}>
      <div className="flex flex-grow h-[calc(100vh-64px)] overflow-hidden relative">
        <ChatSidebar 
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Scrollspy Navigation */}
        <ChatScrollSpy 
          messages={messages} 
          onScrollTo={handleScrollToMessage} 
          onScrollTop={handleScrollTop} 
        />

        <div className="flex-grow flex flex-col min-w-0 bg-background relative h-full">
          {!isSidebarOpen && (
            <div className="absolute top-20 left-4 z-[60]">
               <button 
                 onClick={() => setIsSidebarOpen(true)}
                 className="w-10 h-10 rounded-full bg-surface-container-highest/80 backdrop-blur-md flex items-center justify-center border border-white/5 shadow-2xl hover:border-primary/30 transition-all active:scale-90 group"
               >
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">menu_open</span>
               </button>
            </div>
          )}

          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto px-4 py-8 space-y-6 pb-32 custom-scrollbar pt-20 scroll-smooth"
          >
            {messages.length === 0 && !isStreaming && !isThinking && (
              <ChatWelcome onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
            )}

            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id}
                id={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
            ))}

            {isThinking && (
              <ChatMessage 
                role="AI"
                content=""
                isThinking={true}
              />
            )}

            {isStreaming && (
              <ChatMessage 
                key={activeStreamingId || 'streaming'}
                role="AI"
                content={streamingContent}
                isStreaming={true}
              />
            )}
          </div>

          <ChatInput 
            onSend={handleSendMessage} 
            isLoading={isStreaming || isThinking} 
            isWelcome={messages.length === 0 && !isStreaming && !isThinking}
          />
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ChatPage;
