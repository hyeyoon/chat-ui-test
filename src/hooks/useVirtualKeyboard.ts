import { useEffect, useState, useRef, useCallback } from 'react';
import { detectPlatform, getPlatformCapabilities, isChromeWithVirtualKeyboard, type Platform } from '../utils/platform';

interface VirtualKeyboardState {
  isVisible: boolean;
  height: number;
  platform: Platform;
  isSupported: boolean;
}

interface KeyboardConfig {
  /** 키보드가 열린 것으로 간주할 최소 높이 (px) */
  threshold: number;
  /** 상태 업데이트 디바운스 시간 (ms) */
  debounceMs: number;
}

const DEFAULT_CONFIG: KeyboardConfig = {
  threshold: 50,
  debounceMs: 100,
};

/**
 * 2024년 모바일 키보드 처리 베스트 프랙티스를 구현한 훅
 * 
 * 플랫폼별 전략:
 * - iOS Safari: Visual Viewport API 사용
 * - Android Chrome 108+: VirtualKeyboard API + CSS 환경변수
 * - 기타: Fallback to window resize
 */
export function useVirtualKeyboard(config: Partial<KeyboardConfig> = {}): VirtualKeyboardState {
  const { threshold, debounceMs } = { ...DEFAULT_CONFIG, ...config };
  
  const [state, setState] = useState<VirtualKeyboardState>(() => {
    const platform = detectPlatform();
    const capabilities = getPlatformCapabilities(platform);
    
    return {
      isVisible: false,
      height: 0,
      platform,
      isSupported: capabilities.supportsVisualViewport || capabilities.supportsVirtualKeyboard,
    };
  });

  const initialViewportHeight = useRef<number>(window.innerHeight);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isInputFocused = useRef<boolean>(false);

  // iOS Safari용 정확한 viewport 높이 설정
  const setAppHeight = useCallback((customHeight?: number) => {
    let targetHeight = customHeight || window.innerHeight;
    
    // iOS에서 Visual Viewport API 사용하여 정확한 높이 계산
    if (state.platform === 'ios' && window.visualViewport) {
      targetHeight = window.visualViewport.height;
    }
    
    const vh = targetHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--app-height', `${targetHeight}px`);
    
    // iOS에서 완전한 뷰포트 제어를 위한 body 스타일 설정
    if (state.platform === 'ios') {
      // body 전체를 고정하고 정확한 높이 설정
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100vw';
      document.body.style.height = `${targetHeight}px`;
      document.body.style.minHeight = `${targetHeight}px`;
      document.body.style.maxHeight = `${targetHeight}px`;
      document.body.style.overflow = 'hidden';
      
      // 키보드 영역에 흰 배경 제거를 위한 추가 설정
      document.documentElement.style.height = `${targetHeight}px`;
      document.documentElement.style.minHeight = `${targetHeight}px`;
      document.documentElement.style.maxHeight = `${targetHeight}px`;
      document.documentElement.style.overflow = 'hidden';
    }
  }, [state.platform]);

  const updateKeyboardState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      let keyboardHeight = 0;
      let isVisible = false;

      // iOS Safari: Visual Viewport API를 사용한 정확한 키보드 높이 감지
      if (state.platform === 'ios' && window.visualViewport) {
        const visualHeight = window.visualViewport.height;
        keyboardHeight = Math.max(0, initialViewportHeight.current - visualHeight);
        
        // iOS는 더 높은 threshold 사용 (가상 키보드 vs 주소창 구분)
        isVisible = keyboardHeight > (threshold * 2) && isInputFocused.current;
      }
      // Android Chrome 108+: VirtualKeyboard API 지원 시
      else if (state.platform === 'android' && isChromeWithVirtualKeyboard()) {
        if (window.visualViewport) {
          keyboardHeight = Math.max(0, initialViewportHeight.current - window.visualViewport.height);
          isVisible = keyboardHeight > threshold;
        }
      }
      // Fallback: 기본 window resize 감지
      else {
        const currentHeight = window.innerHeight;
        keyboardHeight = Math.max(0, initialViewportHeight.current - currentHeight);
        isVisible = keyboardHeight > threshold;
      }

      setState(prev => ({
        ...prev,
        isVisible,
        height: keyboardHeight,
      }));

      // 플랫폼별 키보드 상태 관리
      if (isVisible) {
        document.body.classList.add('keyboard-open');
        
        if (state.platform === 'ios') {
          // iOS: Visual Viewport 높이로 뷰포트 크기 조절
          const visualHeight = window.visualViewport?.height || (window.innerHeight - keyboardHeight);
          setAppHeight(visualHeight);
          
          console.log(`iOS keyboard detected: ${keyboardHeight}px, adjusting viewport to: ${visualHeight}px`);
        }
      } else {
        document.body.classList.remove('keyboard-open');
        
        if (state.platform === 'ios') {
          // iOS: 키보드 닫힐 때 원래 뷰포트로 복원 및 스타일 정리
          setAppHeight(initialViewportHeight.current);
          
          // body와 html 스타일 완전 복원
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.left = '';
          document.body.style.right = '';
          document.body.style.width = '';
          document.body.style.height = '';
          document.body.style.minHeight = '';
          document.body.style.maxHeight = '';
          document.body.style.overflow = '';
          
          document.documentElement.style.height = '';
          document.documentElement.style.minHeight = '';
          document.documentElement.style.maxHeight = '';
          document.documentElement.style.overflow = '';
          
          console.log(`iOS keyboard hidden, restoring viewport to: ${initialViewportHeight.current}px`);
        }
      }
    }, debounceMs);
  }, [state.platform, threshold, debounceMs, setAppHeight]);

  // 입력 필드 포커스 감지 (iOS Safari에서 중요)
  const handleFocusIn = useCallback((e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      isInputFocused.current = true;
      // iOS에서는 포커스 후 키보드 애니메이션을 위한 딜레이
      setTimeout(updateKeyboardState, state.platform === 'ios' ? 300 : 150);
    }
  }, [updateKeyboardState, state.platform]);

  const handleFocusOut = useCallback(() => {
    isInputFocused.current = false;
    // 키보드 닫힘 감지를 위한 딜레이
    setTimeout(updateKeyboardState, state.platform === 'ios' ? 300 : 150);
  }, [updateKeyboardState, state.platform]);

  useEffect(() => {
    const platform = state.platform;
    const capabilities = getPlatformCapabilities(platform);

    // Android Chrome 108+: VirtualKeyboard API 활성화
    if (platform === 'android' && capabilities.supportsVirtualKeyboard) {
      try {
        (navigator as any).virtualKeyboard.overlaysContent = true;
        console.log('✅ VirtualKeyboard API enabled for Android Chrome 108+');
      } catch (error) {
        console.warn('❌ VirtualKeyboard API activation failed:', error);
      }
    }

    // 초기 높이 설정
    setAppHeight();

    // iOS Safari를 위한 Visual Viewport 전용 핸들러
    const visualViewportHandler = () => {
      if (platform === 'ios' && window.visualViewport) {
        const visualHeight = window.visualViewport.height;
        const keyboardHeight = Math.max(0, initialViewportHeight.current - visualHeight);
        const isKeyboardVisible = keyboardHeight > (threshold * 2) && isInputFocused.current;
        
        // 실시간 뷰포트 조절
        setAppHeight(visualHeight);
        
        // 상태 업데이트
        setState(prev => ({
          ...prev,
          isVisible: isKeyboardVisible,
          height: keyboardHeight,
        }));
        
        console.log(`iOS Visual Viewport: ${visualHeight}px, Keyboard: ${keyboardHeight}px`);
      } else {
        updateKeyboardState();
      }
    };

    // 이벤트 리스너 등록
    const resizeHandler = platform === 'ios' ? visualViewportHandler : updateKeyboardState;

    // Visual Viewport API 우선 사용 (iOS Safari, Android Chrome)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resizeHandler);
    }

    // Fallback: window resize
    window.addEventListener('resize', resizeHandler);
    
    // 입력 필드 포커스 감지
    document.addEventListener('focusin', handleFocusIn, { passive: true });
    document.addEventListener('focusout', handleFocusOut, { passive: true });

    // 화면 회전 감지
    const orientationHandler = () => {
      setTimeout(() => {
        initialViewportHeight.current = window.innerHeight;
        updateKeyboardState();
      }, 500);
    };
    window.addEventListener('orientationchange', orientationHandler);

    // 초기 상태 설정
    updateKeyboardState();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', resizeHandler);
      }
      window.removeEventListener('resize', resizeHandler);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('orientationchange', orientationHandler);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // cleanup 시 키보드 관련 스타일 모두 제거
      document.body.classList.remove('keyboard-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.minHeight = '';
      document.body.style.maxHeight = '';
      document.body.style.overflow = '';
      
      // html 스타일도 초기화
      document.documentElement.style.height = '';
      document.documentElement.style.minHeight = '';
      document.documentElement.style.maxHeight = '';
      document.documentElement.style.overflow = '';
      
      // CSS 변수 초기화
      document.documentElement.style.setProperty('--app-height', '100vh');
      document.documentElement.style.setProperty('--vh', '1vh');
    };
  }, [state.platform, updateKeyboardState, handleFocusIn, handleFocusOut, setAppHeight]);

  return state;
}