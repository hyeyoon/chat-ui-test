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
    if (platform === 'android') {
      if (keyboard.isVisible) {
        // Android: Use visual viewport height to stay within visible area
        const availableHeight = window.visualViewport?.height || (window.innerHeight - keyboard.height);
        return {
          height: `${availableHeight}px`,
          maxHeight: `${availableHeight}px`,
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        };
      } else {
        // Android: Normal state
        return {
          height: '100vh',
          maxHeight: '100vh',
          position: 'relative' as const,
        };
      }
    } else if (platform === 'ios') {
      if (keyboard.isVisible) {
        // iOS: Reduce viewport by keyboard height to show content properly
        const availableHeight = window.visualViewport?.height || (window.innerHeight - keyboard.height);
        return {
          height: `${availableHeight}px`,
          maxHeight: `${availableHeight}px`,
          position: 'relative' as const,
        };
      } else {
        // iOS: Normal state
        return {
          height: '100vh',
          maxHeight: '100vh',
          position: 'relative' as const,
        };
      }
    }

    // Web: Default behavior
    return {
      height: '100vh',
      maxHeight: '100vh',
      position: 'relative' as const,
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
          position: 'relative',
          bottom: 0,
          zIndex: keyboard.isVisible ? 1000 : 'auto',
        }}
      >
        <MessageInput />
      </footer>
    </div>
  );
};