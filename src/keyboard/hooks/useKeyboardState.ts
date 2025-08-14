import { useState, useEffect, useCallback, useRef } from 'react';
import { KeyboardController } from '../KeyboardController';
import { KeyboardState, KeyboardControllerState } from '../types';

/**
 * Selector function to pick specific properties from keyboard state
 */
export type KeyboardStateSelector<T> = (state: KeyboardControllerState) => T;

/**
 * Hook that provides access to the current keyboard state.
 * Supports selective updates to prevent unnecessary re-renders.
 * 
 * @param selector - Optional selector function to pick specific state properties
 * @returns Selected keyboard state data
 * 
 * @example
 * // Get full keyboard state
 * const keyboardState = useKeyboardState();
 * 
 * @example
 * // Get only keyboard height (prevents re-renders when other properties change)
 * const keyboardHeight = useKeyboardState(state => state.keyboard.height);
 * 
 * @example
 * // Get keyboard visibility and available height
 * const { isVisible, availableHeight } = useKeyboardState(state => ({
 *   isVisible: state.keyboard.isVisible,
 *   availableHeight: state.availableHeight
 * }));
 */
export function useKeyboardState(): KeyboardControllerState;
export function useKeyboardState<T>(selector: KeyboardStateSelector<T>): T;
export function useKeyboardState<T>(selector?: KeyboardStateSelector<T>): T | KeyboardControllerState {
  const [state, setState] = useState<T | KeyboardControllerState>(() => {
    const currentState = KeyboardController.getState();
    return selector ? selector(currentState) : currentState;
  });

  const selectorRef = useRef(selector);
  const lastSelectedValueRef = useRef(state);

  // Update selector ref
  selectorRef.current = selector;

  const updateState = useCallback(() => {
    const currentState = KeyboardController.getState();
    const newValue = selectorRef.current ? selectorRef.current(currentState) : currentState;

    // Only update if the selected value actually changed
    if (!shallowEqual(lastSelectedValueRef.current, newValue)) {
      lastSelectedValueRef.current = newValue;
      setState(newValue);
    }
  }, []);

  useEffect(() => {
    // Initialize the controller if not already done
    if (!KeyboardController.isVisible && !KeyboardController.state().timestamp) {
      KeyboardController.initialize();
    }

    // Subscribe to all keyboard events
    const unsubscribes = [
      KeyboardController.addListener('keyboardWillShow', updateState),
      KeyboardController.addListener('keyboardDidShow', updateState),
      KeyboardController.addListener('keyboardWillHide', updateState),
      KeyboardController.addListener('keyboardDidHide', updateState),
    ];

    // Initial state update
    updateState();

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [updateState]);

  return state;
}

/**
 * Shallow equality check for preventing unnecessary re-renders
 */
function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

/**
 * Hook that provides only keyboard visibility state
 * Optimized for components that only need to know if keyboard is visible
 */
export function useKeyboardVisible(): boolean {
  return useKeyboardState(state => state.keyboard.isVisible);
}

/**
 * Hook that provides only keyboard height
 * Optimized for components that only need keyboard height
 */
export function useKeyboardHeight(): number {
  return useKeyboardState(state => state.keyboard.height);
}

/**
 * Hook that provides available screen height
 * Optimized for layout components that need to adjust to available space
 */
export function useAvailableHeight(): number {
  return useKeyboardState(state => state.availableHeight);
}

/**
 * Hook that provides safe area insets
 * Optimized for components that need to handle safe areas
 */
export function useSafeAreaInsets() {
  return useKeyboardState(state => state.safeArea);
}