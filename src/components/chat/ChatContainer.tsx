import React, { useEffect, useState, useRef } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatStore } from '../../store/chatStore';
import { getInitialMessages } from '../../api/mockData';

export const ChatContainer: React.FC = () => {
  const { setMessages, setLoading } = useChatStore();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const initialViewportHeight = useRef(window.innerHeight);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  // 키보드 감지 로직
  useEffect(() => {
    const detectKeyboard = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        let detectedHeight = 0;
        
        // 키보드 높이 감지
        if (window.visualViewport) {
          detectedHeight = Math.max(0, initialViewportHeight.current - window.visualViewport.height);
        } else {
          detectedHeight = Math.max(0, initialViewportHeight.current - window.innerHeight);
        }
        
        const isVisible = detectedHeight > 50 && isInputFocused;
        
        setKeyboardHeight(detectedHeight);
        setIsKeyboardVisible(isVisible);
        
        // iOS 빈 공간 해결
        if (isIOS) {
          if (isVisible) {
            document.body.style.height = `${window.visualViewport?.height || window.innerHeight}px`;
            document.body.style.position = 'fixed';
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.height = '';
            document.body.style.position = '';
            document.body.style.overflow = '';
          }
        }
      }, 100);
    };
    
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsInputFocused(true);
        detectKeyboard();
      }
    };
    
    const handleFocusOut = () => {
      setIsInputFocused(false);
      detectKeyboard();
    };
    
    const handleResize = () => {
      detectKeyboard();
    };
    
    // 이벤트 리스너 등록
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    window.addEventListener('resize', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('resize', handleResize);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // iOS 정리
      if (isIOS) {
        document.body.style.height = '';
        document.body.style.position = '';
        document.body.style.overflow = '';
      }
    };
  }, [isInputFocused, isIOS]);

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
  
  // 채팅 영역 높이 계산
  const availableHeight = isKeyboardVisible 
    ? window.visualViewport?.height || (window.innerHeight - keyboardHeight)
    : window.innerHeight;

  return (
    <div 
      className="flex flex-col bg-white"
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div 
        className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0"
        style={{
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 0.75rem)`,
        }}
      >
        <h1 className="text-lg font-semibold text-gray-900">채팅</h1>
      </div>
      
      {/* Message List */}
      <div 
        className="flex-1 overflow-hidden"
        style={{
          height: isKeyboardVisible ? `${availableHeight - 60 - 60}px` : 'auto', // 60px header, 60px input
          maxHeight: isKeyboardVisible ? `${availableHeight - 60 - 60}px` : 'none',
        }}
      >
        <MessageList />
      </div>
      
      {/* Input Area */}
      <div 
        className="flex-shrink-0 bg-white"
        style={{
          // 기본 위치: 하단 고정
          position: isKeyboardVisible && (isIOS || isAndroid) ? 'fixed' : 'relative',
          
          // 키보드 위에 위치
          bottom: (() => {
            if (!isKeyboardVisible) return 'auto';
            
            if (isAndroid) {
              // Android: 키보드 바로 위 + safe area
              return `${keyboardHeight}px`;
            } else if (isIOS) {
              // iOS: 키보드 바로 위
              return `${keyboardHeight}px`;
            }
            return 'auto';
          })(),
          
          left: isKeyboardVisible && (isIOS || isAndroid) ? '0' : 'auto',
          right: isKeyboardVisible && (isIOS || isAndroid) ? '0' : 'auto',
          zIndex: isKeyboardVisible ? 1000 : 'auto',
          
          // Safe area padding
          paddingBottom: isKeyboardVisible ? '0' : 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          
          // 부드러운 전환
          transition: 'bottom 0.25s ease-out, position 0.25s ease-out',
        }}
      >
        <MessageInput />
      </div>
    </div>
  );
};