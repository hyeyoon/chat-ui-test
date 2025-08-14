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

  // Simplified container style using CSS custom properties
  const containerStyle = useMemo(() => {
    return {
      height: '100%',
      maxHeight: '100%',
      position: 'relative' as const,
    };
  }, []);

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