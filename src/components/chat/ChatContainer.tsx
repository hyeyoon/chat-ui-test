import React, { useEffect, useMemo } from 'react';
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

  // 컨테이너 스타일 - 키보드가 열릴 때 높이 조정
  const containerStyle = useMemo(() => {
    if (keyboard.isVisible) {
      // Visual Viewport API를 사용하여 실제 보이는 영역 계산
      const visualHeight = window.visualViewport?.height || (window.innerHeight - keyboard.height);
      return {
        height: `${visualHeight}px`,
        transition: 'height 0.3s ease-out',
      };
    }
    return {
      height: '100%',
    };
  }, [keyboard.isVisible, keyboard.height]);

  // 입력 영역 스타일 - 키보드 바로 위에 위치
  const inputAreaStyle = useMemo(() => {
    if (keyboard.isVisible) {
      return {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        transform: `translateY(-${keyboard.height}px)`,
        transition: 'transform 0.3s ease-out',
      };
    }
    return {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
    };
  }, [keyboard.isVisible, keyboard.height]);

  return (
    <>
      {/* 개발 환경에서 키보드 상태 디버그 정보 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="keyboard-debug">
          Platform: {keyboard.platform}<br/>
          Keyboard: {keyboard.isVisible ? `visible (${keyboard.height}px)` : 'hidden'}<br/>
          Visual Height: {window.visualViewport?.height || 'N/A'}
        </div>
      )}

      <div 
        className="absolute inset-0 flex flex-col bg-white safe-area"
        style={containerStyle}
      >
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-900">채팅</h1>
        </header>
        
        {/* Message List - 키보드가 열릴 때 높이가 자동으로 줄어듦 */}
        <main className="flex-1 min-h-0 overflow-auto">
          <MessageList />
        </main>
        
        {/* Input Area - 키보드 위에 위치 */}
        <footer 
          className="flex-shrink-0 bg-white border-t border-gray-200"
          style={inputAreaStyle}
        >
          <MessageInput />
        </footer>
      </div>
    </>
  );
};