import { useEffect, useState, useRef, useCallback } from 'react';

interface IOSKeyboardState {
  isOpen: boolean;
  height: number;
  isInputFocused: boolean;
}

export function useIOSKeyboard(): IOSKeyboardState {
  const [keyboardState, setKeyboardState] = useState<IOSKeyboardState>({
    isOpen: false,
    height: 0,
    isInputFocused: false,
  });
  
  const isIOSRef = useRef(/iPad|iPhone|iPod/.test(navigator.userAgent));
  const initialViewportHeight = useRef(window.innerHeight);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cleanupFunctionRef = useRef<(() => void) | null>(null);
  
  // iOS 키보드 워크어라운드 적용
  const applyKeyboardWorkaround = useCallback(() => {
    if (!isIOSRef.current) return;
    
    // 현재 스크롤 위치 저장
    const scrollY = window.scrollY;
    
    // body를 fixed로 고정하여 viewport 이동 방지
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    // 터치 이벤트 제어
    const preventTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      
      // input 요소가 아닌 경우에만 터치 이동 방지
      if (!isInput) {
        e.preventDefault();
      }
    };
    
    // 패시브하지 않은 리스너로 등록하여 preventDefault가 동작하도록 함
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    
    // 정리 함수 저장
    cleanupFunctionRef.current = () => {
      document.removeEventListener('touchmove', preventTouchMove);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      // 원래 스크롤 위치로 복원
      window.scrollTo(0, scrollY);
    };
    
  }, []);
  
  // 워크어라운드 제거
  const removeKeyboardWorkaround = useCallback(() => {
    if (cleanupFunctionRef.current) {
      cleanupFunctionRef.current();
      cleanupFunctionRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    if (!isIOSRef.current) {
      return;
    }
    
    const updateKeyboardState = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        const visualViewport = window.visualViewport;
        
        if (visualViewport) {
          const keyboardHeight = Math.max(0, initialViewportHeight.current - visualViewport.height);
          const isOpen = keyboardHeight > 50;
          const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                                document.activeElement?.tagName === 'TEXTAREA' ||
                                document.activeElement?.contentEditable === 'true';
          
          setKeyboardState({
            isOpen,
            height: keyboardHeight,
            isInputFocused: Boolean(isInputFocused),
          });
          
          // iOS 워크어라운드 적용/제거
          if (isOpen && isInputFocused) {
            applyKeyboardWorkaround();
          } else {
            removeKeyboardWorkaround();
          }
        }
      }, 100);
    };
    
    // Focus 이벤트 처리
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        updateKeyboardState();
      }
    };
    
    const handleFocusOut = () => {
      updateKeyboardState();
    };
    
    // 초기 상태 설정
    updateKeyboardState();
    
    // 이벤트 리스너 등록
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateKeyboardState);
    }
    
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    // 화면 방향 변경 처리
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        initialViewportHeight.current = window.innerHeight;
        updateKeyboardState();
      }, 500);
    });
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateKeyboardState);
      }
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // 컴포넌트 언마운트 시 워크어라운드 제거
      removeKeyboardWorkaround();
    };
  }, [applyKeyboardWorkaround, removeKeyboardWorkaround]);
  
  return keyboardState;
}