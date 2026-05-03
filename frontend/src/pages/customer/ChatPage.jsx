import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout';
import ChatSidebar from '../../components/customer/ChatSidebar';
import ChatMessage from '../../components/customer/ChatMessage';
import ChatInput from '../../components/customer/ChatInput';
import ChatWelcome from '../../components/customer/ChatWelcome';
import ChatScrollSpy from '../../components/customer/ChatScrollSpy';
import useChatSignalR from '../../hooks/useChatSignalR';
import { getSessions, getSessionMessages, streamChat, changeTitle } from '../../services/api/chat.service';
import { getDecodedToken } from '../../utils/authUtils';
import { logout } from '../../services/api/auth.service';

const ChatPage = () => {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(urlSessionId || null);
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Pagination states
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Streaming states
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [activeStreamingId, setActiveStreamingId] = useState(null);
  
  const scrollRef = useRef(null);
  const userId = useRef(getDecodedToken(localStorage.getItem('token'))?.nameid || 'unknown');
  const isInitialLoad = useRef(true);
  const prevScrollHeight = useRef(0);

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
      setHasMore(false);
      setNextCursor(null);
      return;
    }
    try {
      const data = await getSessionMessages(sessionId);
      const items = data?.items || [];
      const sorted = [...items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setMessages(sorted);
      setHasMore(data?.hasMore || false);
      setNextCursor(data?.nextCursor || null);
      
      // For initial load, scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!currentSessionId || !hasMore || !nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    // Store current scroll height before adding new elements
    prevScrollHeight.current = scrollRef.current.scrollHeight;

    try {
      const data = await getSessionMessages(currentSessionId, nextCursor);
      const newItems = data?.items || [];
      const sortedNew = [...newItems].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setMessages(prev => [...sortedNew, ...prev]);
      setHasMore(data?.hasMore || false);
      setNextCursor(data?.nextCursor || null);

      // Adjust scroll position to maintain context
      setTimeout(() => {
        if (scrollRef.current) {
          const newHeight = scrollRef.current.scrollHeight;
          const diff = newHeight - prevScrollHeight.current;
          scrollRef.current.scrollTop = diff;
        }
      }, 0);
    } catch (err) {
      console.error('Failed to load more messages', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentSessionId, hasMore, nextCursor, isLoadingMore]);

  // Scroll detection for infinite load
  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  // Sync with URL
  useEffect(() => {
    setCurrentSessionId(urlSessionId || null);
    isInitialLoad.current = true;
  }, [urlSessionId]);

  // Listen for sessionId changes
  useEffect(() => {
    if (isInitialLoad.current) {
       loadMessages(currentSessionId);
    }
  }, [currentSessionId, loadMessages]);

  // Scroll to bottom when new messages arrive (only if already near bottom or AI is typing)
  useEffect(() => {
    if (scrollRef.current && (isStreaming || isThinking)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, streamingContent, isThinking]);

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
    if (id) {
      navigate(`/chat/${id}`);
    } else {
      navigate('/chat');
    }
    setIsSidebarOpen(false);
  };

  const handleRenameSession = async (id, newTitle) => {
    try {
      await changeTitle(id, newTitle);
      // Update local state immediately for better UX
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
    } catch (err) {
      console.error('Failed to rename session', err);
      // Revert on failure (could add a toast notification here)
      fetchSessions();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleScrollToMessage = useCallback((id) => {
    if (!scrollRef.current) return;
    // Query within the scroll container using data attribute for reliability
    const element = scrollRef.current.querySelector(`[data-message-id="${id}"]`);
    if (element) {
      const containerTop = scrollRef.current.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const scrollPosition = scrollRef.current.scrollTop + (elementTop - containerTop) - 80;
      scrollRef.current.scrollTo({ top: scrollPosition, behavior: 'smooth' });
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
          onRenameSession={handleRenameSession}
          onLogout={handleLogout}
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
            <div className="absolute top-20 left-4 z-[700] md:top-20">
               <button 
                 onClick={() => setIsSidebarOpen(true)}
                 className="w-10 h-10 rounded-full bg-surface-container-highest/90 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-2xl hover:border-primary/40 transition-all active:scale-90 group"
               >
                  <span className="material-symbols-outlined text-on-surface group-hover:text-primary text-xl">menu</span>
               </button>
            </div>
          )}

          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-grow overflow-y-auto px-4 md:px-[10%] lg:px-[15%] py-6 space-y-4 pb-32 custom-scrollbar pt-20"
          >
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {messages.length === 0 && !isStreaming && !isThinking && (
              <ChatWelcome onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
            )}

            {messages.map((msg, index) => {
              const uniqueId = msg.id || `msg-${msg.createdAt}-${index}`;
              return (
                <ChatMessage 
                  key={uniqueId}
                  messageId={uniqueId}
                  role={msg.role}
                  content={msg.content}
                  timestamp={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
              );
            })}

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
