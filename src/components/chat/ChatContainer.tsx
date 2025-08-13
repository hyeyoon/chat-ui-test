import React, { useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useViewport } from '../../hooks/useViewport';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useChatStore } from '../../store/chatStore';
import { getInitialMessages } from '../../api/mockData';
import { cn } from '../../utils/cn';

export const ChatContainer: React.FC = () => {
  const { availableHeight, isKeyboardOpen } = useViewport();
  const { keyboardHeight } = useKeyboard();
  const { setMessages, setLoading } = useChatStore();
  
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
    <div
      className={cn(
        'flex flex-col bg-white',
        'transition-all duration-200 ease-out',
        isKeyboardOpen ? 'h-screen' : 'h-full'
      )}
      style={{
        height: isKeyboardOpen 
          ? `var(--visual-viewport-height)` 
          : `var(--viewport-height)`,
        paddingTop: 'var(--safe-area-inset-top)',
        position: isKeyboardOpen ? 'fixed' : 'relative',
        top: isKeyboardOpen ? '0' : 'auto',
        left: isKeyboardOpen ? '0' : 'auto',
        right: isKeyboardOpen ? '0' : 'auto',
        zIndex: isKeyboardOpen ? 1000 : 'auto',
      }}
    >
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">채팅</h1>
      </div>
      
      <MessageList />
      <MessageInput />
    </div>
  );
};