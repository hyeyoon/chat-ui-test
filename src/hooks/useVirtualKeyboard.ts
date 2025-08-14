import { useEffect, useState, useRef } from 'react';

interface VirtualKeyboardState {
  isVisible: boolean;
  height: number;
  isSupported: boolean;
}

/**
 * iOS Safari keyboard-aware viewport management
 * Based on 2024 best practices for iOS Safari keyboard handling
 * Uses CSS custom properties approach to solve viewport issues
 */
export function useVirtualKeyboard(): VirtualKeyboardState {
  const [state, setState] = useState<VirtualKeyboardState>({
    isVisible: false,
    height: 0,
    isSupported: false,
  });
  
  const initialViewportHeight = useRef<number>(window.innerHeight);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    // iOS Safari viewport height fix function
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // For iOS Safari keyboard handling
      if (isIOS) {
        const visualHeight = window.visualViewport?.height || window.innerHeight;
        document.documentElement.style.setProperty('--app-height', `${visualHeight}px`);
      } else {
        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
      }
    };

    const updateKeyboardState = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        let keyboardHeight = 0;
        let isVisible = false;

        // Calculate keyboard height
        if (window.visualViewport) {
          keyboardHeight = Math.max(0, initialViewportHeight.current - window.visualViewport.height);
        } else {
          keyboardHeight = Math.max(0, initialViewportHeight.current - window.innerHeight);
        }

        // Platform-specific thresholds
        if (isIOS) {
          isVisible = keyboardHeight > 100;
        } else if (isAndroid) {
          isVisible = keyboardHeight > 150;
        } else {
          isVisible = keyboardHeight > 50;
        }

        setState({
          isVisible,
          height: keyboardHeight,
          isSupported: 'visualViewport' in window,
        });

        // Update viewport height for iOS Safari fix
        setViewportHeight();
        
        // Platform-specific handling
        if (isIOS) {
          if (isVisible) {
            document.body.classList.add('ios-keyboard-active');
          } else {
            document.body.classList.remove('ios-keyboard-active');
          }
        } else if (isAndroid) {
          if (isVisible) {
            document.body.classList.add('android-keyboard-active');
          } else {
            document.body.classList.remove('android-keyboard-active');
          }
        }
      }, 100);
    };

    // Event listeners
    const handleResize = () => {
      setViewportHeight();
      updateKeyboardState();
    };
    
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        setTimeout(updateKeyboardState, 300);
      }
    };
    
    const handleFocusOut = () => {
      setTimeout(updateKeyboardState, 300);
    };
    
    // Visual Viewport API (best for iOS Safari)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    // Window resize fallback
    window.addEventListener('resize', handleResize);
    
    // Focus events for keyboard detection
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    // Orientation change handling
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        initialViewportHeight.current = window.innerHeight;
        setViewportHeight();
        updateKeyboardState();
      }, 500);
    });

    // Initial setup
    setViewportHeight();
    updateKeyboardState();

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }

      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      document.body.classList.remove('ios-keyboard-active', 'android-keyboard-active');
    };
  }, []);

  return state;
}