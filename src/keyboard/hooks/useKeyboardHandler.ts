import { useEffect, useRef, useCallback } from 'react';
import { KeyboardController } from '../KeyboardController';
import { KeyboardEvent, KeyboardEventType } from '../types';

/**
 * Keyboard event handler function
 */
export type KeyboardEventHandler = (event: KeyboardEvent) => void;

/**
 * Configuration for keyboard event handlers
 */
export interface KeyboardHandlerConfig {
  /** Handler for when keyboard starts to show */
  onKeyboardWillShow?: KeyboardEventHandler;
  /** Handler for when keyboard finishes showing */
  onKeyboardDidShow?: KeyboardEventHandler;
  /** Handler for when keyboard starts to hide */
  onKeyboardWillHide?: KeyboardEventHandler;
  /** Handler for when keyboard finishes hiding */
  onKeyboardDidHide?: KeyboardEventHandler;
  /** Handler called for any keyboard event */
  onKeyboardEvent?: KeyboardEventHandler;
}

/**
 * Low-level hook for handling keyboard events.
 * Provides access to keyboard lifecycle events and real-time position data.
 * 
 * @param config - Event handlers configuration
 * 
 * @example
 * useKeyboardHandler({
 *   onKeyboardWillShow: (event) => {
 *     console.log('Keyboard will show with height:', event.state.height);
 *     // Start custom animations
 *   },
 *   onKeyboardDidShow: (event) => {
 *     console.log('Keyboard animation completed');
 *     // Finalize UI adjustments
 *   },
 *   onKeyboardWillHide: (event) => {
 *     console.log('Keyboard will hide');
 *     // Start hide animations
 *   },
 *   onKeyboardDidHide: (event) => {
 *     console.log('Keyboard hidden');
 *     // Reset UI state
 *   }
 * });
 * 
 * @example
 * // Generic handler for all keyboard events
 * useKeyboardHandler({
 *   onKeyboardEvent: (event) => {
 *     switch (event.type) {
 *       case 'keyboardWillShow':
 *         // Handle keyboard appearing
 *         break;
 *       case 'keyboardDidHide':
 *         // Handle keyboard hidden
 *         break;
 *     }
 *   }
 * });
 */
export function useKeyboardHandler(config: KeyboardHandlerConfig): void {
  const configRef = useRef(config);
  configRef.current = config;

  const handleKeyboardEvent = useCallback((eventType: KeyboardEventType) => (event: KeyboardEvent) => {
    const handlers = configRef.current;
    
    // Call specific handler
    switch (eventType) {
      case 'keyboardWillShow':
        handlers.onKeyboardWillShow?.(event);
        break;
      case 'keyboardDidShow':
        handlers.onKeyboardDidShow?.(event);
        break;
      case 'keyboardWillHide':
        handlers.onKeyboardWillHide?.(event);
        break;
      case 'keyboardDidHide':
        handlers.onKeyboardDidHide?.(event);
        break;
    }
    
    // Call generic handler
    handlers.onKeyboardEvent?.(event);
  }, []);

  useEffect(() => {
    // Initialize keyboard controller
    KeyboardController.initialize();

    // Subscribe to all keyboard events
    const unsubscribes = [
      KeyboardController.addListener('keyboardWillShow', handleKeyboardEvent('keyboardWillShow')),
      KeyboardController.addListener('keyboardDidShow', handleKeyboardEvent('keyboardDidShow')),
      KeyboardController.addListener('keyboardWillHide', handleKeyboardEvent('keyboardWillHide')),
      KeyboardController.addListener('keyboardDidHide', handleKeyboardEvent('keyboardDidHide')),
    ];

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [handleKeyboardEvent]);
}

/**
 * Hook for handling keyboard show events only
 */
export function useKeyboardShowHandler(handler: KeyboardEventHandler): void {
  useKeyboardHandler({
    onKeyboardWillShow: handler,
    onKeyboardDidShow: handler,
  });
}

/**
 * Hook for handling keyboard hide events only
 */
export function useKeyboardHideHandler(handler: KeyboardEventHandler): void {
  useKeyboardHandler({
    onKeyboardWillHide: handler,
    onKeyboardDidHide: handler,
  });
}

/**
 * Hook that provides keyboard event data without automatic re-renders
 * Useful for accessing current keyboard state in event handlers without causing re-renders
 */
export function useKeyboardController() {
  useEffect(() => {
    KeyboardController.initialize();
  }, []);

  return {
    /** Get current keyboard state (doesn't trigger re-renders) */
    state: () => KeyboardController.state(),
    /** Check if keyboard is visible (doesn't trigger re-renders) */
    isVisible: () => KeyboardController.isVisible(),
    /** Get full controller state (doesn't trigger re-renders) */
    getState: () => KeyboardController.getState(),
    /** Dismiss keyboard programmatically */
    dismiss: () => KeyboardController.dismiss(),
    /** Add event listener */
    addListener: KeyboardController.addListener.bind(KeyboardController),
    /** Remove event listener */
    removeListener: KeyboardController.removeListener.bind(KeyboardController),
  };
}