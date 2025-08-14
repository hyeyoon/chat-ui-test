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

  // 입력 영역 - 키보드 바로 위에 고정
  const inputAreaStyle = useMemo(() => {
    if (keyboard.isVisible && keyboard.height > 0) {
      // 키보드가 감지되면 키보드 바로 위에 위치
      return {
        position: 'fixed' as const,
        bottom: `${keyboard.height}px`,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000,
        transform: 'none',
        transition: 'bottom 0.3s ease-out',
      };
    }
    // 키보드가 없을 때는 하단에 고정
    return {
      position: 'relative' as const,
      bottom: 'auto',
      transform: 'none',
    };
  }, [keyboard.isVisible, keyboard.height]);

  return (
    <>
      {/* 개발 환경에서 키보드 상태 디버그 정보 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="keyboard-debug">
          Platform: {keyboard.platform}<br/>
          Keyboard: {keyboard.isVisible ? `visible (${keyboard.height}px)` : 'hidden'}<br/>
          Visual Height: {window.visualViewport?.height || 'N/A'}<br/>
          Inner Height: {window.innerHeight}<br/>
          Input Position: {keyboard.isVisible ? `fixed bottom:${keyboard.height}px` : 'relative'}<br/>
          Container Height: 100%
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
            keyboard.isVisible && keyboard.height > 0 
              ? 'keyboard-input-with-safe-area keyboard-fixed-input' 
              : 'safe-area-bottom'
          }`}
          style={inputAreaStyle}
        >
          <MessageInput />
        </footer>
      </div>
    </>
  );
};