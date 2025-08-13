import { useEffect, useState, useRef, useCallback } from 'react';

interface IOSKeyboardFix {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  inputContainerStyle: React.CSSProperties;
  chatContainerStyle: React.CSSProperties;
}

export function useIOSKeyboardFix(): IOSKeyboardFix {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputContainerStyle, setInputContainerStyle] = useState<React.CSSProperties>({});
  const [chatContainerStyle, setChatContainerStyle] = useState<React.CSSProperties>({});
  
  const isIOSRef = useRef(/iPad|iPhone|iPod/.test(navigator.userAgent));
  const initialViewportHeight = useRef(window.innerHeight);
  const isFocusedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const updateLayout = useCallback(() => {
    if (!isIOSRef.current) return;
    
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;
    
    const currentKeyboardHeight = Math.max(0, initialViewportHeight.current - visualViewport.height);
    const isOpen = currentKeyboardHeight > 50 && isFocusedRef.current;
    
    setIsKeyboardOpen(isOpen);
    setKeyboardHeight(currentKeyboardHeight);
    
    if (isOpen) {
      // iOS Safari에서 키보드가 열릴 때:
      // 1. 화면 전체를 absolute로 고정하여 viewport 이동 방지
      // 2. input을 visual viewport의 bottom에 고정
      
      setChatContainerStyle({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: `${visualViewport.height}px`,
        overflow: 'hidden',
        zIndex: 1000,
      });
      
      setInputContainerStyle({
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1001,
        transform: 'none',
      });
      
      // body 스크롤 방지
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
      document.body.style.height = '100%';
      
    } else {
      // 키보드가 닫힐 때 원래 상태로 복원
      setChatContainerStyle({});
      setInputContainerStyle({});
      
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.height = '';
    }
  }, []);
  
  const debounceUpdate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(updateLayout, 100);
  }, [updateLayout]);
  
  useEffect(() => {
    if (!isIOSRef.current) {
      return;
    }
    
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        isFocusedRef.current = true;
        debounceUpdate();
      }
    };
    
    const handleFocusOut = () => {
      isFocusedRef.current = false;
      debounceUpdate();
    };
    
    const handleResize = () => {
      debounceUpdate();
    };
    
    // 이벤트 리스너 등록
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    // 화면 회전 처리
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        initialViewportHeight.current = window.innerHeight;
        debounceUpdate();
      }, 500);
    });
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // 컴포넌트 언마운트 시 스타일 정리
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.height = '';
    };
  }, [debounceUpdate]);
  
  return {
    isKeyboardOpen,
    keyboardHeight,
    inputContainerStyle,
    chatContainerStyle,
  };
}