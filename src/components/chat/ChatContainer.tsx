import React, { useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useIOSKeyboardFix } from '../../hooks/useIOSKeyboardFix';
import { useChatStore } from '../../store/chatStore';
import { getInitialMessages } from '../../api/mockData';
import { cn } from '../../utils/cn';

export const ChatContainer: React.FC = () => {
  const { isKeyboardOpen, chatContainerStyle, inputContainerStyle } = useIOSKeyboardFix();
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
        'flex flex-col bg-white h-full',
        'transition-all duration-200 ease-out'
      )}
      style={chatContainerStyle}
    >
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">채팅</h1>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>
      
      <div 
        className="flex-shrink-0"
        style={inputContainerStyle}
      >
        <MessageInput />
      </div>
    </div>
  );
};