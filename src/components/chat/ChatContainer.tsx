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

  // 전체 컨테이너는 항상 화면 전체를 차지 (흰 공백 방지)
  const containerStyle = useMemo(() => {
    return {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
    };
  }, []);

  // 메시지 리스트 영역 - 키보드가 열릴 때 패딩 추가
  const messageListStyle = useMemo(() => {
    if (keyboard.isVisible) {
      // 키보드 + 입력 영역 높이만큼 패딩 추가
      return {
        paddingBottom: `${keyboard.height + 60}px`,
      };
    }
    return {};
  }, [keyboard.isVisible, keyboard.height]);

  // 입력 영역 - 키보드 위에 고정
  const inputAreaStyle = useMemo(() => {
    if (keyboard.isVisible) {
      return {
        position: 'fixed' as const,
        bottom: `${keyboard.height}px`,
        left: 0,
        right: 0,
        zIndex: 1000,
      };
    }
    return {};
  }, [keyboard.isVisible, keyboard.height]);

  return (
    <>
      {/* 개발 환경에서 키보드 상태 디버그 정보 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="keyboard-debug">
          Platform: {keyboard.platform}<br/>
          Keyboard: {keyboard.isVisible ? `visible (${keyboard.height}px)` : 'hidden'}<br/>
          Visual Height: {window.visualViewport?.height || 'N/A'}<br/>
          Inner Height: {window.innerHeight}
        </div>
      )}

      <div 
        className="flex flex-col bg-white"
        style={containerStyle}
      >
        {/* Header with top safe area */}
        <header className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0 safe-area-top">
          <h1 className="text-lg font-semibold text-gray-900">채팅</h1>
        </header>
        
        {/* Message List */}
        <main 
          className="flex-1 min-h-0 overflow-auto"
          style={messageListStyle}
        >
          <MessageList />
        </main>
        
        {/* Input Area with bottom safe area */}
        <footer 
          className={`flex-shrink-0 bg-white border-t border-gray-200 ${
            keyboard.isVisible ? 'keyboard-input-with-safe-area' : 'safe-area-bottom'
          }`}
          style={inputAreaStyle}
        >
          <MessageInput />
        </footer>
      </div>
    </>
  );
};