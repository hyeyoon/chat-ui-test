import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageItem } from './MessageItem';
import { PullToRefresh } from './PullToRefresh';
import { FloatingTimeIndicator } from './FloatingTimeIndicator';
import { useChatStore } from '../../store/chatStore';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { loadMoreMessages } from '../../api/mockData';
import { cn } from '../../utils/cn';

export const MessageList: React.FC = () => {
  const { messages, isLoading, hasMore, prependMessages, setLoading, setHasMore } = useChatStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [showTimeIndicator, setShowTimeIndicator] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const timeIndicatorTimeoutRef = useRef<NodeJS.Timeout>();
  
  const handleRefresh = useCallback(async () => {
    if (!hasMore || messages.length === 0) return;
    
    setLoading(true);
    try {
      const firstMessageId = messages[0]?.id;
      const newMessages = await loadMoreMessages(firstMessageId);
      
      if (newMessages.length === 0) {
        setHasMore(false);
      } else {
        const previousHeight = scrollContainerRef.current?.scrollHeight || 0;
        prependMessages(newMessages);
        
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newHeight = scrollContainerRef.current.scrollHeight;
            const heightDiff = newHeight - previousHeight;
            scrollContainerRef.current.scrollTop = heightDiff;
          }
        });
      }
      
      setLastRefreshTime(new Date());
      setShowTimeIndicator(true);
      
      if (timeIndicatorTimeoutRef.current) {
        clearTimeout(timeIndicatorTimeoutRef.current);
      }
      timeIndicatorTimeoutRef.current = setTimeout(() => {
        setShowTimeIndicator(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, messages, setLoading, setHasMore, prependMessages]);
  
  const {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress,
  } = usePullToRefresh({
    onRefresh: handleRefresh,
  });
  
  useEffect(() => {
    containerRef.current = scrollContainerRef.current;
  }, [containerRef]);
  
  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };
  
  useEffect(() => {
    if (!isUserScrolling) {
      scrollToBottom();
    }
  }, [messages.length, isUserScrolling]);
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setShowScrollButton(!isAtBottom);
      setIsUserScrolling(true);
      
      scrollTimeoutRef.current = setTimeout(() => {
        if (isAtBottom) {
          setIsUserScrolling(false);
        }
      }, 150);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (timeIndicatorTimeoutRef.current) {
        clearTimeout(timeIndicatorTimeoutRef.current);
      }
    };
  }, []);
  
  const handleScrollToBottom = () => {
    scrollToBottom();
    setIsUserScrolling(false);
    setShowScrollButton(false);
  };
  
  return (
    <div className="relative flex-1 overflow-hidden">
      <FloatingTimeIndicator
        lastRefreshTime={lastRefreshTime}
        isVisible={showTimeIndicator}
      />
      
      <PullToRefresh
        isPulling={isPulling}
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        pullProgress={pullProgress}
      />
      
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto px-4 py-4 scrollable-area"
        style={{
          paddingBottom: 'calc(var(--safe-area-inset-bottom) + 1rem)',
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {isLoading && messages.length === 0 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
        
        {!hasMore && messages.length > 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            대화의 시작입니다
          </div>
        )}
        
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        
        <div ref={bottomRef} />
      </div>
      
      {showScrollButton && (
        <button
          onClick={handleScrollToBottom}
          className={cn(
            'absolute bottom-4 right-4 bg-white shadow-lg',
            'rounded-full p-3 transition-all duration-200',
            'hover:scale-110 active:scale-95',
            'border border-gray-200'
          )}
          aria-label="Scroll to bottom"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
};