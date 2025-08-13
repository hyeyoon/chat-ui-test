import { useEffect, useState, useRef, useCallback } from 'react';

interface ViewportDimensions {
  width: number;
  height: number;
  keyboardHeight: number;
  availableHeight: number;
  isKeyboardOpen: boolean;
  isIOSKeyboardWorkaround: boolean;
}

export function useViewport(): ViewportDimensions {
  const [dimensions, setDimensions] = useState<ViewportDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
    keyboardHeight: 0,
    availableHeight: window.innerHeight,
    isKeyboardOpen: false,
    isIOSKeyboardWorkaround: false,
  });
  
  const pendingUpdate = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isIOSRef = useRef(/iPad|iPhone|iPod/.test(navigator.userAgent));
  const initialViewportHeight = useRef(window.innerHeight);
  const isFocusedRef = useRef(false);
  
  // iOS 키보드 워크어라운드 함수
  const applyIOSKeyboardWorkaround = useCallback(() => {
    if (!isIOSRef.current) return;
    
    // iOS Safari에서 키보드가 열릴 때 전체 viewport가 밀려올라가는 문제 해결
    // 해결책: 키보드가 열릴 때 body의 position을 fixed로 고정하고 
    // scroll을 방지하여 viewport 이동을 막는다
    document.body.style.position = 'fixed';
    document.body.style.top = '0';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.bottom = '0';
    document.body.style.overflow = 'hidden';
    
    // 터치 이벤트로 인한 스크롤 방지
    const preventScroll = (e: TouchEvent) => {
      // input 요소는 터치 허용
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }
      e.preventDefault();
    };
    
    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);
  
  const removeIOSKeyboardWorkaround = useCallback(() => {
    if (!isIOSRef.current) return;
    
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.bottom = '';
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    let initialHeight = initialViewportHeight.current;
    let savedHeight = initialHeight;
    
    const updateViewport = () => {
      if (pendingUpdate.current) return;
      
      pendingUpdate.current = true;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      requestAnimationFrame(() => {
        const visualViewport = window.visualViewport;
        
        if (visualViewport) {
          // iOS Safari에서 키보드가 열릴 때의 처리
          const keyboardHeight = Math.max(0, initialHeight - visualViewport.height);
          const availableHeight = visualViewport.height;
          const isKeyboardOpen = keyboardHeight > 50; // 50px 이상일 때 키보드가 열린 것으로 간주
          
          // iOS에서 키보드가 열릴 때 워크어라운드 적용
          const shouldApplyWorkaround = isIOSRef.current && isKeyboardOpen && isFocusedRef.current;
          
          // focus된 input이 있을 때 높이를 저장
          if (isKeyboardOpen && document.activeElement?.tagName === 'TEXTAREA') {
            savedHeight = availableHeight;
          }
          
          const finalHeight = isKeyboardOpen ? savedHeight : availableHeight;
          
          setDimensions({
            width: visualViewport.width,
            height: initialHeight,
            keyboardHeight,
            availableHeight: finalHeight,
            isKeyboardOpen,
            isIOSKeyboardWorkaround: shouldApplyWorkaround,
          });
          
          // CSS 변수 업데이트
          document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
          document.documentElement.style.setProperty('--viewport-height', `${finalHeight}px`);
          document.documentElement.style.setProperty('--visual-viewport-height', `${visualViewport.height}px`);
          
          // 키보드 상태에 따른 body 클래스 토글
          if (isKeyboardOpen) {
            document.body.classList.add('keyboard-open');
            if (shouldApplyWorkaround) {
              document.body.classList.add('ios-keyboard-workaround');
              applyIOSKeyboardWorkaround();
            }
          } else {
            document.body.classList.remove('keyboard-open');
            document.body.classList.remove('ios-keyboard-workaround');
            removeIOSKeyboardWorkaround();
          }
          
        } else {
          // Visual Viewport API가 없는 경우 fallback
          const currentHeight = window.innerHeight;
          const keyboardHeight = Math.max(0, initialHeight - currentHeight);
          const isKeyboardOpen = keyboardHeight > 50;
          
          setDimensions({
            width: window.innerWidth,
            height: initialHeight,
            keyboardHeight,
            availableHeight: currentHeight,
            isKeyboardOpen,
            isIOSKeyboardWorkaround: false,
          });
          
          document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
          document.documentElement.style.setProperty('--viewport-height', `${currentHeight}px`);
          
          // 키보드 상태에 따른 body 클래스 토글
          if (isKeyboardOpen) {
            document.body.classList.add('keyboard-open');
          } else {
            document.body.classList.remove('keyboard-open');
          }
        }
        
        pendingUpdate.current = false;
      });
    };

    // Focus/Blur 이벤트 처리 (iOS 키보드 감지용)
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        isFocusedRef.current = true;
        // iOS에서 키보드 감지를 위한 딜레이
        setTimeout(updateViewport, 100);
      }
    };
    
    const handleFocusOut = () => {
      isFocusedRef.current = false;
      // iOS에서 키보드 닫힘 감지를 위한 딜레이
      setTimeout(() => {
        removeIOSKeyboardWorkaround();
        updateViewport();
      }, 100);
    };
    
    // 초기 업데이트
    updateViewport();
    
    // 이벤트 리스너 등록
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }
    
    window.addEventListener('resize', updateViewport);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    window.addEventListener('orientationchange', () => {
      timeoutRef.current = setTimeout(() => {
        initialHeight = window.innerHeight;
        initialViewportHeight.current = window.innerHeight;
        updateViewport();
      }, 500);
    });
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
        window.visualViewport.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // 정리 시 워크어라운드 제거
      removeIOSKeyboardWorkaround();
    };
  }, [applyIOSKeyboardWorkaround, removeIOSKeyboardWorkaround]);

  return dimensions;
}