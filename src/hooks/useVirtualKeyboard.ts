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
    }, debounceMs);
  }, [state.platform, threshold, debounceMs]);

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

    // 이벤트 리스너 등록
    const resizeHandler = updateKeyboardState;

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
    };
  }, [state.platform, updateKeyboardState, handleFocusIn, handleFocusOut]);

  return state;
}