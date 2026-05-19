import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import ChatInput from '../../components/customer/ChatInput';
import ChatMessage from '../../components/customer/ChatMessage';
import ChatScrollSpy from '../../components/customer/ChatScrollSpy';
import ChatSidebar from '../../components/customer/ChatSidebar';
import ChatWelcome from '../../components/customer/ChatWelcome';
import CustomerLayout from '../../components/layout/CustomerLayout';
import useChatSignalR from '../../hooks/useChatSignalR';
import { logout } from '../../services/api/auth.service';
import {
  changeTitle,
  deleteSession,
  getSessionMessages,
  getSessions,
  streamChat,
} from '../../services/api/chat.service';
import { getDecodedToken } from '../../utils/authUtils';

const ChatPage = () => {
  const { t } = useTranslation();
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
  const isNearBottomRef = useRef(true); // Track if user is at the bottom of the chat
  const streamingContentRef = useRef(''); // Holds latest streamed content to avoid stale closures

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

      setMessages((prev) => [...sortedNew, ...prev]);
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

  // Scroll detection for infinite load and auto-scroll logic
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // Track if user is within 150px of the bottom
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 150;

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

  // Smart Scroll: Only auto-scroll if the user is already near the bottom
  useEffect(() => {
    if (scrollRef.current && (isStreaming || isThinking)) {
      if (isNearBottomRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages.length, streamingContent, isThinking, isStreaming]);

  // SignalR Handlers
  const onReceiveChunk = useCallback(
    (messageId, chunk) => {
      if (activeStreamingId && activeStreamingId !== messageId) {
        return;
      }

      setIsThinking(false);
      setIsStreaming(true);
      setActiveStreamingId(messageId);

      // Update both state (for rendering) and ref (for reliable final read)
      streamingContentRef.current += chunk;
      setStreamingContent(streamingContentRef.current);
    },
    [activeStreamingId],
  );

  const onMessageCompleted = useCallback(
    (messageId) => {
      // Read final content from ref — guaranteed to be the latest, no stale closure
      const finalContent = streamingContentRef.current;

      // 1. Clear streaming state FIRST to hide the streaming bubble
      setIsStreaming(false);
      setIsThinking(false);
      setActiveStreamingId(null);
      setStreamingContent('');
      streamingContentRef.current = '';

      // 2. Then append the completed message to the permanent list locally
      if (finalContent) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === messageId);
          if (exists) return prev;
          return [
            ...prev,
            {
              id: messageId,
              role: 'AI',
              content: finalContent,
              createdAt: new Date().toISOString(),
            },
          ];
        });
      }

      // 3. Sync sidebar session list and trigger silent DB sync
      if (currentSessionId) {
        fetchSessions();

        setTimeout(() => {
          loadMessages(currentSessionId);
        }, 1500);
      }
    },
    [currentSessionId, fetchSessions, loadMessages],
  );

  const onTitleUpdated = useCallback((sessionId, newTitle) => {
    setSessions((prev) => {
      const exists = prev.some((s) => s.id === sessionId);
      if (exists) {
        return prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s));
      } else {
        return [{ id: sessionId, title: newTitle, createdAt: new Date().toISOString() }, ...prev];
      }
    });
  }, []);

  const onReceiveError = useCallback((error) => {
    console.error('SignalR Error:', error);
    setIsThinking(false);
    setIsStreaming(false);
    setActiveStreamingId(null);
    setStreamingContent('');
    streamingContentRef.current = '';
  }, []);

  const signalRHandlers = useMemo(
    () => ({
      ReceiveMessageChunk: onReceiveChunk,
      MessageCompleted: onMessageCompleted,
      SessionTitleUpdated: onTitleUpdated,
      ReceiveError: onReceiveError,
    }),
    [onReceiveChunk, onMessageCompleted, onTitleUpdated, onReceiveError],
  );

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
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsThinking(true);
    setStreamingContent('');
    setActiveStreamingId(null);
    streamingContentRef.current = '';

    try {
      await streamChat(text, sessionId);
    } catch (err) {
      console.error('API Error:', err);
      if (!isStreaming) {
        setIsThinking(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'AI',
            content: t('chat.sync_failed'),
            createdAt: new Date().toISOString(),
          },
        ]);
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
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
    } catch (err) {
      console.error('Failed to rename session', err);
      // Revert on failure (could add a toast notification here)
      fetchSessions();
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id);
      // Remove from local state
      setSessions((prev) => prev.filter((s) => s.id !== id));

      // If the deleted session is the currently active one, clear it
      if (currentSessionId === id) {
        handleSelectSession(null);
      }
    } catch (err) {
      console.error('Failed to delete session', err);
      // On failure, refetch to ensure sync
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
          onDeleteSession={handleDeleteSession}
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
                <span className="material-symbols-outlined text-on-surface group-hover:text-primary text-xl">
                  menu
                </span>
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
                  timestamp={new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
              );
            })}

            {isThinking && <ChatMessage role="AI" content="" isThinking={true} />}

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
