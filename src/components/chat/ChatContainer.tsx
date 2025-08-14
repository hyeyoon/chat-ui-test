import React, { useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatStore } from '../../store/chatStore';
import { getInitialMessages } from '../../api/mockData';
import { useVirtualKeyboard } from '../../hooks/useVirtualKeyboard';

export const ChatContainer: React.FC = () => {
  const { setMessages, setLoading } = useChatStore();
  const keyboard = useVirtualKeyboard();

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

  return (
    <div className="h-full flex flex-col bg-white safe-area">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">채팅</h1>
      </header>
      
      {/* Message List - Flex-grow to fill available space */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <MessageList />
      </main>
      
      {/* Input Area - VirtualKeyboard API handles positioning */}
      <footer 
        className="flex-shrink-0 bg-white keyboard-aware"
        style={{
          // Use CSS custom property set by useVirtualKeyboard hook
          transform: keyboard.isVisible 
            ? `translateY(-${keyboard.height}px)` 
            : 'translateY(0)',
          transition: 'transform 0.25s ease-out',
        }}
      >
        <MessageInput />
      </footer>
    </div>
  );
};