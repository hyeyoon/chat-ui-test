import { useEffect, useState, useRef } from 'react';

interface ViewportDimensions {
  width: number;
  height: number;
  keyboardHeight: number;
  availableHeight: number;
  isKeyboardOpen: boolean;
}

export function useViewport(): ViewportDimensions {
  const [dimensions, setDimensions] = useState<ViewportDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
    keyboardHeight: 0,
    availableHeight: window.innerHeight,
    isKeyboardOpen: false,
  });
  
  const pendingUpdate = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    let initialHeight = window.innerHeight;
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
          });
          
          // CSS 변수 업데이트
          document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
          document.documentElement.style.setProperty('--viewport-height', `${finalHeight}px`);
          document.documentElement.style.setProperty('--visual-viewport-height', `${visualViewport.height}px`);
          
          // 키보드 상태에 따른 body 클래스 토글
          if (isKeyboardOpen) {
            document.body.classList.add('keyboard-open');
          } else {
            document.body.classList.remove('keyboard-open');
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

    // 초기 업데이트
    updateViewport();
    
    // 이벤트 리스너 등록
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      window.visualViewport.addEventListener('scroll', updateViewport);
    }
    
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', () => {
      timeoutRef.current = setTimeout(() => {
        initialHeight = window.innerHeight;
        updateViewport();
      }, 500);
    });
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
        window.visualViewport.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return dimensions;
}