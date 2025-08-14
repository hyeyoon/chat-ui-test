import React, { useEffect, useMemo } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatStore } from '../../store/chatStore';
import { getInitialMessages } from '../../api/mockData';
import { useVirtualKeyboard } from '../../hooks/useVirtualKeyboard';
import { getPlatformCapabilities } from '../../utils/platform';

export const ChatContainer: React.FC = () => {
  const { setMessages, setLoading } = useChatStore();
  const keyboard = useVirtualKeyboard();
  const capabilities = getPlatformCapabilities(keyboard.platform);

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

  // 플랫폼별 컨테이너 클래스명 생성
  const containerClasses = useMemo(() => {
    const baseClasses = 'flex flex-col bg-white safe-area h-full keyboard-transition';
    const platformClass = `platform-${keyboard.platform}`;
    const keyboardClass = keyboard.isVisible ? 'keyboard-active' : '';
    const androidKeyboardClass = keyboard.platform === 'android' && capabilities.supportsKeyboardEnvVariables 
      ? 'android-keyboard-container' : '';
    
    return [baseClasses, platformClass, keyboardClass, androidKeyboardClass].filter(Boolean).join(' ');
  }, [keyboard.platform, keyboard.isVisible, capabilities.supportsKeyboardEnvVariables]);

  // iOS에서 키보드가 열릴 때 입력 영역의 위치 계산
  const getInputAreaStyle = useMemo(() => {
    if (!keyboard.isVisible) {
      return {};
    }

    // iOS Safari: transform 기반 positioning (position: fixed 문제 해결)
    if (keyboard.platform === 'ios') {
      const visualHeight = window.visualViewport?.height || window.innerHeight;
      return {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        top: `${visualHeight - 60}px`, // 입력 영역 높이만큼 위에서 계산
        transform: 'translateY(-100%)',
        zIndex: 1000,
      };
    }

    // Android Chrome 108+: CSS 환경변수가 지원되는 경우 CSS에서 처리
    if (keyboard.platform === 'android' && capabilities.supportsKeyboardEnvVariables) {
      return {};
    }

    // Fallback: 기본 fixed positioning
    return {
      position: 'fixed' as const,
      bottom: `${keyboard.height}px`,
      left: 0,
      right: 0,
      zIndex: 1000,
    };
  }, [keyboard.isVisible, keyboard.platform, keyboard.height, capabilities.supportsKeyboardEnvVariables]);

  // 입력 영역 클래스명 생성
  const inputAreaClasses = useMemo(() => {
    const baseClasses = 'flex-shrink-0 bg-white';
    const keyboardClass = keyboard.isVisible ? 'keyboard-input-active' : 'border-t border-gray-200';
    
    // iOS: transform 기반 클래스
    const iosClass = keyboard.platform === 'ios' && keyboard.isVisible ? 'ios-keyboard-input-fixed' : '';
    
    // Android: CSS 환경변수 클래스
    const androidClass = keyboard.platform === 'android' && keyboard.isVisible && capabilities.supportsKeyboardEnvVariables 
      ? 'android-keyboard-input-env' : '';

    return [baseClasses, keyboardClass, iosClass, androidClass].filter(Boolean).join(' ');
  }, [keyboard.isVisible, keyboard.platform, capabilities.supportsKeyboardEnvVariables]);

  // 메시지 리스트 영역 패딩 조정 (iOS에서 키보드가 열릴 때)
  const getMessageListStyle = useMemo(() => {
    if (keyboard.platform === 'ios' && keyboard.isVisible) {
      return {
        paddingBottom: '80px', // 입력 영역을 위한 공간 확보
      };
    }
    return {};
  }, [keyboard.platform, keyboard.isVisible]);

  return (
    <>
      {/* 개발 환경에서 키보드 상태 디버그 정보 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="keyboard-debug">
          Platform: {keyboard.platform}<br/>
          Keyboard: {keyboard.isVisible ? `visible (${keyboard.height}px)` : 'hidden'}<br/>
          VirtualKB API: {capabilities.supportsVirtualKeyboard ? 'Yes' : 'No'}<br/>
          Env Variables: {capabilities.supportsKeyboardEnvVariables ? 'Yes' : 'No'}
        </div>
      )}

      <div className={containerClasses}>
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-900">채팅</h1>
        </header>
        
        {/* Message List */}
        <main 
          className="flex-1 min-h-0 overflow-auto"
          style={getMessageListStyle}
        >
          <MessageList />
        </main>
        
        {/* Input Area - 플랫폼별 키보드 처리 */}
        <footer 
          className={inputAreaClasses}
          style={getInputAreaStyle}
        >
          <MessageInput />
        </footer>
      </div>
    </>
  );
};