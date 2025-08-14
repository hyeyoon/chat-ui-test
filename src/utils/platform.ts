/**
 * 플랫폼 감지 유틸리티
 * 모바일 키보드 처리를 위한 플랫폼별 전략 결정에 사용
 */

export type Platform = 'ios' | 'android' | 'web';

export interface PlatformCapabilities {
  supportsVisualViewport: boolean;
  supportsVirtualKeyboard: boolean;
  supportsInteractiveWidget: boolean;
  supportsKeyboardEnvVariables: boolean;
}

/**
 * 현재 플랫폼 감지
 */
export function detectPlatform(): Platform {
  const userAgent = navigator.userAgent;
  
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'ios';
  }
  
  if (/Android/.test(userAgent)) {
    return 'android';
  }
  
  return 'web';
}

/**
 * 플랫폼별 지원 기능 확인
 */
export function getPlatformCapabilities(platform: Platform): PlatformCapabilities {
  const hasVisualViewport = typeof window !== 'undefined' && 'visualViewport' in window;
  const hasVirtualKeyboard = typeof navigator !== 'undefined' && 'virtualKeyboard' in navigator;
  
  switch (platform) {
    case 'ios':
      return {
        supportsVisualViewport: hasVisualViewport,
        supportsVirtualKeyboard: false, // Safari doesn't support VirtualKeyboard API
        supportsInteractiveWidget: false, // Safari doesn't support interactive-widget
        supportsKeyboardEnvVariables: false, // Safari doesn't support env(keyboard-inset-*)
      };
      
    case 'android':
      return {
        supportsVisualViewport: hasVisualViewport,
        supportsVirtualKeyboard: hasVirtualKeyboard,
        supportsInteractiveWidget: true, // Chrome 108+ supports interactive-widget
        supportsKeyboardEnvVariables: hasVirtualKeyboard, // Chrome 108+ supports env(keyboard-inset-*)
      };
      
    case 'web':
    default:
      return {
        supportsVisualViewport: hasVisualViewport,
        supportsVirtualKeyboard: hasVirtualKeyboard,
        supportsInteractiveWidget: true,
        supportsKeyboardEnvVariables: hasVirtualKeyboard,
      };
  }
}

/**
 * 브라우저가 Chrome 108+ 인지 확인 (Android VirtualKeyboard API 지원 여부)
 */
export function isChromeWithVirtualKeyboard(): boolean {
  const userAgent = navigator.userAgent;
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
  
  if (!chromeMatch) return false;
  
  const chromeVersion = parseInt(chromeMatch[1], 10);
  return chromeVersion >= 108;
}