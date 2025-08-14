import { 
  KeyboardState, 
  SafeAreaInsets, 
  KeyboardControllerState, 
  KeyboardEvent, 
  KeyboardEventListener, 
  KeyboardEventType,
  KeyboardControllerConfig 
} from './types';

class KeyboardControllerClass {
  private listeners: Map<KeyboardEventType, Set<KeyboardEventListener>> = new Map();
  private currentState: KeyboardControllerState;
  private config: KeyboardControllerConfig;
  private isInitialized = false;
  private rafId: number | null = null;
  private initialViewportHeight: number;
  private timeoutId: number | null = null;

  constructor() {
    this.initialViewportHeight = window.innerHeight;
    this.currentState = {
      keyboard: {
        isVisible: false,
        height: 0,
        duration: 0,
        timestamp: Date.now(),
        target: 0,
        type: 'stable',
        platform: this.detectPlatform(),
      },
      safeArea: this.getSafeAreaInsets(),
      availableHeight: window.innerHeight,
    };
    this.config = {
      debug: false,
      animation: {
        useNativeDriver: true,
        duration: 250,
        easing: 'ease-out',
      },
    };
  }

  /**
   * Initialize the keyboard controller
   */
  initialize(config?: KeyboardControllerConfig): void {
    if (this.isInitialized) {
      this.log('KeyboardController already initialized');
      return;
    }

    this.config = { ...this.config, ...config };
    this.setupEventListeners();
    this.setupVirtualKeyboardAPI();
    this.isInitialized = true;
    this.log('KeyboardController initialized', this.config);
  }

  /**
   * Get current keyboard state
   */
  state(): KeyboardState {
    return { ...this.currentState.keyboard };
  }

  /**
   * Check if keyboard is currently visible
   */
  isVisible(): boolean {
    return this.currentState.keyboard.isVisible;
  }

  /**
   * Get current safe area insets
   */
  getSafeAreaInsets(): SafeAreaInsets {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
    };
  }

  /**
   * Get current controller state
   */
  getState(): KeyboardControllerState {
    return { ...this.currentState };
  }

  /**
   * Add event listener
   */
  addListener(eventType: KeyboardEventType, listener: KeyboardEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Remove event listener
   */
  removeListener(eventType: KeyboardEventType, listener: KeyboardEventListener): void {
    this.listeners.get(eventType)?.delete(listener);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(eventType?: KeyboardEventType): void {
    if (eventType) {
      this.listeners.get(eventType)?.clear();
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Dismiss keyboard programmatically
   */
  dismiss(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.contentEditable === 'true'
    )) {
      activeElement.blur();
    }
  }

  /**
   * Set keyboard animation config
   */
  setAnimationConfig(config: Partial<KeyboardControllerConfig['animation']>): void {
    this.config.animation = { ...this.config.animation, ...config };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.removeEventListeners();
    this.removeAllListeners();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.isInitialized = false;
    this.log('KeyboardController destroyed');
  }

  private detectPlatform(): 'ios' | 'android' | 'web' {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    return 'web';
  }

  private setupEventListeners(): void {
    // Focus/Blur events
    document.addEventListener('focusin', this.handleFocusIn);
    document.addEventListener('focusout', this.handleFocusOut);

    // Visual Viewport API
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.handleViewportResize);
      window.visualViewport.addEventListener('scroll', this.handleViewportScroll);
    }

    // Window events
    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener('orientationchange', this.handleOrientationChange);
  }

  private setupVirtualKeyboardAPI(): void {
    // Enable VirtualKeyboard API if available
    if ('virtualKeyboard' in navigator) {
      const virtualKeyboard = (navigator as any).virtualKeyboard;
      
      if (this.currentState.keyboard.platform === 'android') {
        // For Android: Enable overlay mode to get accurate keyboard height
        virtualKeyboard.overlaysContent = true;
        this.log('VirtualKeyboard API enabled for Android with overlaysContent=true');
        
        // Listen to geometry changes for real-time updates
        virtualKeyboard.addEventListener('geometrychange', () => {
          this.scheduleStateUpdate();
        });
      } else {
        // For other platforms: Use default behavior
        virtualKeyboard.overlaysContent = false;
        this.log('VirtualKeyboard API enabled with overlaysContent=false');
      }
    }
  }

  private removeEventListeners(): void {
    document.removeEventListener('focusin', this.handleFocusIn);
    document.removeEventListener('focusout', this.handleFocusOut);

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.handleViewportResize);
      window.visualViewport.removeEventListener('scroll', this.handleViewportScroll);
    }

    window.removeEventListener('resize', this.handleWindowResize);
    window.removeEventListener('orientationchange', this.handleOrientationChange);
  }

  private handleFocusIn = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;
    if (this.isInputElement(target)) {
      this.log('Input focused', target.tagName);
      this.scheduleStateUpdate();
    }
  };

  private handleFocusOut = (): void => {
    this.log('Input blurred');
    this.scheduleStateUpdate();
  };

  private handleViewportResize = (): void => {
    this.scheduleStateUpdate();
  };

  private handleViewportScroll = (): void => {
    this.scheduleStateUpdate();
  };

  private handleWindowResize = (): void => {
    this.scheduleStateUpdate();
  };

  private handleOrientationChange = (): void => {
    setTimeout(() => {
      this.initialViewportHeight = window.innerHeight;
      this.scheduleStateUpdate();
    }, 500);
  };

  private scheduleStateUpdate(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      this.updateKeyboardState();
    }, 100);
  }

  private updateKeyboardState(): void {
    const previousState = { ...this.currentState.keyboard };
    const newState = this.calculateKeyboardState();

    // Check if state actually changed
    if (this.statesEqual(previousState, newState)) {
      return;
    }

    // Determine transition type
    if (!previousState.isVisible && newState.isVisible) {
      this.emitEvent('keyboardWillShow', newState);
      newState.type = 'opening';
    } else if (previousState.isVisible && !newState.isVisible) {
      this.emitEvent('keyboardWillHide', newState);
      newState.type = 'closing';
    } else {
      newState.type = 'stable';
    }

    // Update state
    this.currentState = {
      keyboard: newState,
      safeArea: this.getSafeAreaInsets(),
      availableHeight: this.calculateAvailableHeight(newState),
    };

    // Update CSS variables
    this.updateCSSVariables();

    // Emit completion events
    if (newState.type === 'opening') {
      setTimeout(() => this.emitEvent('keyboardDidShow', newState), newState.duration);
    } else if (newState.type === 'closing') {
      setTimeout(() => this.emitEvent('keyboardDidHide', newState), newState.duration);
    }

    this.log('Keyboard state updated', this.currentState);
  }

  private calculateKeyboardState(): KeyboardState {
    const timestamp = Date.now();
    const platform = this.currentState.keyboard.platform;
    
    let keyboardHeight = 0;
    let isVisible = false;

    // Check if input is focused
    const activeElement = document.activeElement as HTMLElement;
    const isInputFocused = this.isInputElement(activeElement);
    
    if (platform === 'android') {
      // Android: Prioritize VirtualKeyboard API for accurate height
      if ('virtualKeyboard' in navigator) {
        const computedStyle = getComputedStyle(document.documentElement);
        keyboardHeight = parseInt(computedStyle.getPropertyValue('--keyboard-inset-height') || '0');
        
        // If VirtualKeyboard API doesn't give height, use Visual Viewport
        if (keyboardHeight === 0 && window.visualViewport) {
          keyboardHeight = Math.max(0, this.initialViewportHeight - window.visualViewport.height);
        }
      } else if (window.visualViewport) {
        keyboardHeight = Math.max(0, this.initialViewportHeight - window.visualViewport.height);
      } else {
        // Fallback for older Android browsers
        keyboardHeight = Math.max(0, this.initialViewportHeight - window.innerHeight);
      }
      
      // Android threshold is higher due to browser chrome
      isVisible = keyboardHeight > 100 && isInputFocused;
      
    } else if (platform === 'ios') {
      // iOS: Use Visual Viewport API with special handling for Safari quirks
      if (window.visualViewport) {
        const visualHeight = window.visualViewport.height;
        keyboardHeight = Math.max(0, this.initialViewportHeight - visualHeight);
        
        // iOS Safari specific: Handle the case where Safari doesn't properly report height
        if (isInputFocused && keyboardHeight < 50) {
          // Try to detect keyboard presence even when height is not properly reported
          const heightDiff = this.initialViewportHeight - window.innerHeight;
          if (heightDiff > 50) {
            keyboardHeight = heightDiff;
          }
        }
      } else {
        keyboardHeight = Math.max(0, this.initialViewportHeight - window.innerHeight);
      }
      
      isVisible = keyboardHeight > 50 && isInputFocused;
      
    } else {
      // Web/Desktop: Standard detection
      if (window.visualViewport) {
        keyboardHeight = Math.max(0, this.initialViewportHeight - window.visualViewport.height);
      } else {
        keyboardHeight = Math.max(0, this.initialViewportHeight - window.innerHeight);
      }
      
      isVisible = keyboardHeight > 50 && isInputFocused;
    }

    return {
      isVisible,
      height: keyboardHeight,
      duration: this.config.animation?.duration || 250,
      timestamp,
      target: activeElement ? this.getElementId(activeElement) : 0,
      type: 'stable',
      platform,
    };
  }

  private calculateAvailableHeight(keyboardState: KeyboardState): number {
    const safeArea = this.getSafeAreaInsets();
    const windowHeight = window.visualViewport?.height || window.innerHeight;
    return windowHeight - safeArea.top - safeArea.bottom - (keyboardState.isVisible ? keyboardState.height : 0);
  }

  private updateCSSVariables(): void {
    const { keyboard, safeArea, availableHeight } = this.currentState;
    
    document.documentElement.style.setProperty('--keyboard-height', `${keyboard.height}px`);
    document.documentElement.style.setProperty('--keyboard-visible', keyboard.isVisible ? '1' : '0');
    document.documentElement.style.setProperty('--available-height', `${availableHeight}px`);
    document.documentElement.style.setProperty('--safe-area-inset-top', `${safeArea.top}px`);
    document.documentElement.style.setProperty('--safe-area-inset-bottom', `${safeArea.bottom}px`);
    document.documentElement.style.setProperty('--safe-area-inset-left', `${safeArea.left}px`);
    document.documentElement.style.setProperty('--safe-area-inset-right', `${safeArea.right}px`);
    
    // iOS Safari: Fix blank space issue
    if (keyboard.platform === 'ios') {
      this.fixiOSBlankSpace(keyboard.isVisible, keyboard.height);
    }
  }

  private fixiOSBlankSpace(isKeyboardVisible: boolean, keyboardHeight: number): void {
    if (isKeyboardVisible) {
      // Prevent iOS Safari from creating blank space below content
      document.body.style.height = `${window.visualViewport?.height || window.innerHeight}px`;
      document.body.style.overflow = 'hidden';
      
      // Ensure the main container takes full height
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.height = '100%';
        rootElement.style.overflow = 'hidden';
      }
    } else {
      // Restore normal height when keyboard is hidden
      document.body.style.height = '';
      document.body.style.overflow = '';
      
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.height = '';
        rootElement.style.overflow = '';
      }
    }
  }

  private emitEvent(type: KeyboardEventType, state: KeyboardState): void {
    const event: KeyboardEvent = {
      type,
      state: { ...state },
      timestamp: Date.now(),
    };

    this.listeners.get(type)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in keyboard event listener for ${type}:`, error);
      }
    });

    this.log(`Event emitted: ${type}`, event);
  }

  private isInputElement(element: HTMLElement | null): boolean {
    if (!element) return false;
    return (
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.contentEditable === 'true'
    );
  }

  private getElementId(element: HTMLElement): number {
    // Simple hash function for element identification
    const str = element.tagName + (element.id || '') + (element.className || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private statesEqual(state1: KeyboardState, state2: KeyboardState): boolean {
    return (
      state1.isVisible === state2.isVisible &&
      state1.height === state2.height &&
      state1.target === state2.target
    );
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[KeyboardController] ${message}`, data || '');
    }
  }
}

// Singleton instance
export const KeyboardController = new KeyboardControllerClass();