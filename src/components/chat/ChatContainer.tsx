import React, { useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { KeyboardAvoidingView } from '../../keyboard/components/KeyboardAvoidingView';
import { useKeyboardState } from '../../keyboard/hooks/useKeyboardState';
import { useChatStore } from '../../store/chatStore';
import { getInitialMessages } from '../../api/mockData';

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
      <div className="flex-1 flex flex-col">
        <KeyboardAvoidingView
          className="flex-1"
          behavior="height"
          animated={true}
          keyboardVerticalOffset={60} // Input 높이만큼 offset
        >
          <MessageList />
        </KeyboardAvoidingView>
        
        {/* Input area - 플랫폼별 키보드 처리 */}
        <div 
          className="flex-shrink-0"
          style={{
            paddingBottom: keyboard.isVisible 
              ? '0px' 
              : `max(${safeArea.bottom}px, env(safe-area-inset-bottom, 0px))`,
            paddingLeft: `max(1rem, ${safeArea.left}px)`,
            paddingRight: `max(1rem, ${safeArea.right}px)`,
            // 플랫폼별 키보드 대응
            ...(keyboard.isVisible && {
              position: 'fixed',
              bottom: keyboard.platform === 'android' 
                ? `${keyboard.height + safeArea.bottom}px`  // Android: 키보드 위에 정확히 위치
                : `${keyboard.height}px`,  // iOS: 키보드 위에 위치 (Safari가 자동으로 safeArea 처리)
              left: `${safeArea.left}px`,
              right: `${safeArea.right}px`,
              zIndex: 1000,
            }),
            transition: keyboard.platform === 'ios' 
              ? 'bottom 0.25s ease-out' 
              : 'bottom 0.2s ease-out',
          }}
        >
          <MessageInput />
        </div>
      </div>
    </div>
  );
};