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
      
      {/* Message List - Adjust for keyboard and floating input */}
      <main 
        className="flex-1 min-h-0 overflow-auto"
        style={{
          // Reduce height when keyboard is visible to account for floating input
          paddingBottom: keyboard.isVisible ? '60px' : '0px',
        }}
      >
        <MessageList />
      </main>
      
      {/* Input Area - Always positioned above keyboard */}
      <footer 
        className={`flex-shrink-0 bg-white ${keyboard.isVisible ? 'keyboard-input-active' : ''}`}
        style={{
          position: keyboard.isVisible ? 'fixed' : 'relative',
          bottom: keyboard.isVisible ? `${keyboard.height}px` : 0,
          left: keyboard.isVisible ? 0 : 'auto',
          right: keyboard.isVisible ? 0 : 'auto',
          zIndex: keyboard.isVisible ? 1000 : 'auto',
          width: keyboard.isVisible ? '100%' : 'auto',
          transition: 'bottom 0.25s ease-out, box-shadow 0.25s ease-out',
          // Safe area padding when keyboard is visible
          paddingLeft: keyboard.isVisible ? 'env(safe-area-inset-left, 0px)' : 'auto',
          paddingRight: keyboard.isVisible ? 'env(safe-area-inset-right, 0px)' : 'auto',
        }}
      >
        <MessageInput />
      </footer>
    </div>
  );
};