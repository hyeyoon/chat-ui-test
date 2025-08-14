import { useEffect, useState, useRef } from 'react';

interface VirtualKeyboardState {
  isVisible: boolean;
  height: number;
  isSupported: boolean;
}

/**
 * Modern VirtualKeyboard API hook for 2024
 * Falls back to Visual Viewport API for older browsers
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
    // Check VirtualKeyboard API support
    const hasVirtualKeyboardAPI = 'virtualKeyboard' in navigator;
    
    // Enable VirtualKeyboard API if available
    if (hasVirtualKeyboardAPI) {
      try {
        (navigator as any).virtualKeyboard.overlaysContent = true;
        console.log('VirtualKeyboard API enabled');
      } catch (error) {
        console.warn('Failed to enable VirtualKeyboard API:', error);
      }
    }

    const updateKeyboardState = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        let keyboardHeight = 0;
        let isVisible = false;

        if (hasVirtualKeyboardAPI) {
          // Modern approach: Use VirtualKeyboard API
          try {
            const virtualKeyboard = (navigator as any).virtualKeyboard;
            const boundingRect = virtualKeyboard.boundingRect;
            keyboardHeight = boundingRect.height || 0;
            
            // Fallback to CSS environment variable
            if (keyboardHeight === 0) {
              const computedStyle = getComputedStyle(document.documentElement);
              keyboardHeight = parseInt(computedStyle.getPropertyValue('--keyboard-inset-height') || '0');
            }
          } catch (error) {
            console.warn('VirtualKeyboard API error:', error);
          }
        }

        // Fallback: Visual Viewport API
        if (keyboardHeight === 0 && window.visualViewport) {
          keyboardHeight = Math.max(0, initialViewportHeight.current - window.visualViewport.height);
        }

        // Final fallback: window.innerHeight
        if (keyboardHeight === 0) {
          keyboardHeight = Math.max(0, initialViewportHeight.current - window.innerHeight);
        }

        isVisible = keyboardHeight > 50; // 50px threshold

        setState({
          isVisible,
          height: keyboardHeight,
          isSupported: hasVirtualKeyboardAPI,
        });

        // Update CSS custom property for other components
        document.documentElement.style.setProperty('--detected-keyboard-height', `${keyboardHeight}px`);
        
        // iOS Safari specific fixes for blank space issue - More aggressive approach
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          if (isVisible) {
            // Multiple strategies to prevent iOS Safari blank space
            const visualHeight = window.visualViewport?.height || window.innerHeight;
            
            // 1. Fix body height and position
            document.body.style.height = `${visualHeight}px`;
            document.body.style.maxHeight = `${visualHeight}px`;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = '0';
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.bottom = '0';
            
            // 2. Fix root element
            const rootElement = document.getElementById('root');
            if (rootElement) {
              rootElement.style.height = '100%';
              rootElement.style.maxHeight = '100%';
              rootElement.style.overflow = 'hidden';
              rootElement.style.position = 'relative';
            }
            
            // 3. Prevent scroll and zoom
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.height = `${visualHeight}px`;
            document.documentElement.style.maxHeight = `${visualHeight}px`;
            
            // 4. Add iOS-specific class for additional CSS control
            document.body.classList.add('ios-keyboard-active');
            
          } else {
            // Restore normal behavior completely
            document.body.style.height = '';
            document.body.style.maxHeight = '';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.bottom = '';
            
            const rootElement = document.getElementById('root');
            if (rootElement) {
              rootElement.style.height = '';
              rootElement.style.maxHeight = '';
              rootElement.style.overflow = '';
              rootElement.style.position = '';
            }
            
            document.documentElement.style.overflow = '';
            document.documentElement.style.height = '';
            document.documentElement.style.maxHeight = '';
            
            document.body.classList.remove('ios-keyboard-active');
          }
        }
      }, 100);
    };

    // Event listeners
    const handleResize = () => updateKeyboardState();
    const handleGeometryChange = () => updateKeyboardState();
    
    // Focus/blur events for more accurate keyboard detection
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        // Delay to allow keyboard animation
        setTimeout(updateKeyboardState, 300);
      }
    };
    
    const handleFocusOut = () => {
      // Delay to allow keyboard animation
      setTimeout(updateKeyboardState, 300);
    };
    
    // VirtualKeyboard API events
    if (hasVirtualKeyboardAPI) {
      const virtualKeyboard = (navigator as any).virtualKeyboard;
      virtualKeyboard.addEventListener('geometrychange', handleGeometryChange);
    }

    // Visual Viewport API events
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    // Window resize fallback
    window.addEventListener('resize', handleResize);
    
    // Focus events for keyboard detection
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    // Initial state
    updateKeyboardState();

    // Cleanup
    return () => {
      if (hasVirtualKeyboardAPI) {
        const virtualKeyboard = (navigator as any).virtualKeyboard;
        virtualKeyboard.removeEventListener('geometrychange', handleGeometryChange);
      }

      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }

      window.removeEventListener('resize', handleResize);
      
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Clean up iOS styles on unmount - Complete cleanup
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        document.body.style.height = '';
        document.body.style.maxHeight = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.bottom = '';
        document.body.classList.remove('ios-keyboard-active');
        
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.style.height = '';
          rootElement.style.maxHeight = '';
          rootElement.style.overflow = '';
          rootElement.style.position = '';
        }
        
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        document.documentElement.style.maxHeight = '';
      }
    };
  }, []);

  return state;
}