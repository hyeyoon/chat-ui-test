import React, { useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { KeyboardAvoidingView } from '../../keyboard/components/KeyboardAvoidingView';
import { KeyboardStickyView } from '../../keyboard/components/KeyboardStickyView';
import { useKeyboardState } from '../../keyboard/hooks/useKeyboardState';
import { useChatStore } from '../../store/chatStore';
import { getInitialMessages } from '../../api/mockData';
import { cn } from '../../utils/cn';

export const ChatContainer: React.FC = () => {
  const { keyboard, safeArea } = useKeyboardState();
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
    <div className="h-full flex flex-col bg-white">
      {/* Header with safe area top */}
      <div 
        className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0"
        style={{
          paddingTop: `calc(${safeArea.top}px + 0.75rem)`,
          paddingLeft: `max(1rem, ${safeArea.left}px)`,
          paddingRight: `max(1rem, ${safeArea.right}px)`,
        }}
      >
        <h1 className="text-lg font-semibold text-gray-900">채팅</h1>
      </div>
      
      {/* Main content area with keyboard avoidance */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior="height"
        animated={true}
        keyboardVerticalOffset={0}
      >
        <MessageList />
      </KeyboardAvoidingView>
      
      {/* Input area - sticks above keyboard */}
      <KeyboardStickyView
        position="top"
        offset={0}
        animated={true}
        enableSafeArea={true}
      >
        <MessageInput />
      </KeyboardStickyView>
    </div>
  );
};