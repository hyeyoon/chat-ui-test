import React, { useEffect, useMemo } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatStore } from '../../store/chatStore';
import { getInitialMessages } from '../../api/mockData';
import { useVirtualKeyboard } from '../../hooks/useVirtualKeyboard';

export const ChatContainer: React.FC = () => {
  const { setMessages, setLoading } = useChatStore();
  const keyboard = useVirtualKeyboard();
  
  // Platform detection
  const platform = useMemo(() => {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    return 'web';
  }, []);

  useEffect(() => {
    const loadInitialMessages = async () => {
      setLoading(true);
      try {
        const messages = await getInitialMessages();
        setMessages(messages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialMessages();
  }, [setMessages, setLoading]);

  // Calculate container height based on platform and keyboard state
  const containerStyle = useMemo(() => {
    if (!keyboard.isVisible) {
      return {
        height: '100vh',
        maxHeight: '100vh',
      };
    }

    if (platform === 'android') {
      // Android: Reduce container height by keyboard height to show chat content with scroll
      const availableHeight = window.visualViewport?.height || (window.innerHeight - keyboard.height);
      return {
        height: `${availableHeight}px`,
        maxHeight: `${availableHeight}px`,
      };
    } else if (platform === 'ios') {
      // iOS: Use visual viewport height to prevent blank space
      const availableHeight = window.visualViewport?.height || window.innerHeight;
      return {
        height: `${availableHeight}px`,
        maxHeight: `${availableHeight}px`,
      };
    }

    return {
      height: '100vh',
      maxHeight: '100vh',
    };
  }, [keyboard.isVisible, keyboard.height, platform]);

  return (
    <div 
      className="flex flex-col bg-white safe-area"
      style={containerStyle}
    >
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">채팅</h1>
      </header>
      
      {/* Message List - Flex-grow to fill available space with scroll */}
      <main className="flex-1 min-h-0 overflow-auto">
        <MessageList />
      </main>
      
      {/* Input Area - Platform-specific positioning */}
      <footer 
        className="flex-shrink-0 bg-white"
        style={{
          position: keyboard.isVisible && platform !== 'web' ? 'sticky' : 'relative',
          bottom: 0,
          zIndex: keyboard.isVisible ? 1000 : 'auto',
          // Remove transform approach for more reliable positioning
        }}
      >
        <MessageInput />
      </footer>
    </div>
  );
};