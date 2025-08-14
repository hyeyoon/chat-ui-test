import { useState, useEffect, useRef, useCallback } from 'react';
import { KeyboardController } from '../KeyboardController';
import { KeyboardAnimationState, KeyboardEvent } from '../types';

/**
 * Hook that provides animated values for keyboard transitions.
 * Returns smooth animated values that can be used for CSS transformations.
 * 
 * @example
 * const { height, progress } = useKeyboardAnimation();
 * 
 * // Use in component styles
 * <div style={{ transform: `translateY(-${height}px)` }}>
 *   Content that moves with keyboard
 * </div>
 * 
 * // Use progress for fade effects
 * <div style={{ opacity: progress }}>
 *   Element that fades with keyboard
 * </div>
 */
export function useKeyboardAnimation(): KeyboardAnimationState {
  const [animationState, setAnimationState] = useState<KeyboardAnimationState>({
    height: 0,
    progress: 0,
  });

  const animationRef = useRef<{
    startTime: number;
    startHeight: number;
    targetHeight: number;
    duration: number;
    rafId: number | null;
  }>({
    startTime: 0,
    startHeight: 0,
    targetHeight: 0,
    duration: 250,
    rafId: null,
  });

  const animate = useCallback((targetHeight: number, duration: number) => {
    const animation = animationRef.current;
    
    // Cancel previous animation
    if (animation.rafId) {
      cancelAnimationFrame(animation.rafId);
    }

    // Setup new animation
    animation.startTime = performance.now();
    animation.startHeight = animationState.height;
    animation.targetHeight = targetHeight;
    animation.duration = duration;

    const tick = (currentTime: number) => {
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentHeight = animation.startHeight + 
        (animation.targetHeight - animation.startHeight) * easedProgress;
      
      const keyboardProgress = animation.targetHeight > 0 
        ? currentHeight / animation.targetHeight 
        : 1 - (currentHeight / Math.max(animation.startHeight, 1));

      setAnimationState({
        height: currentHeight,
        progress: Math.max(0, Math.min(1, keyboardProgress)),
      });

      if (progress < 1) {
        animation.rafId = requestAnimationFrame(tick);
      } else {
        animation.rafId = null;
      }
    };

    animation.rafId = requestAnimationFrame(tick);
  }, [animationState.height]);

  const handleKeyboardEvent = useCallback((event: KeyboardEvent) => {
    const { state } = event;
    
    switch (event.type) {
      case 'keyboardWillShow':
      case 'keyboardWillHide':
        animate(state.height, state.duration);
        break;
      default:
        break;
    }
  }, [animate]);

  useEffect(() => {
    // Initialize keyboard controller
    KeyboardController.initialize();

    // Subscribe to keyboard events
    const unsubscribes = [
      KeyboardController.addListener('keyboardWillShow', handleKeyboardEvent),
      KeyboardController.addListener('keyboardWillHide', handleKeyboardEvent),
    ];

    // Set initial state
    const currentState = KeyboardController.state();
    setAnimationState({
      height: currentState.height,
      progress: currentState.isVisible ? 1 : 0,
    });

    return () => {
      // Cleanup
      unsubscribes.forEach(unsubscribe => unsubscribe());
      
      if (animationRef.current.rafId) {
        cancelAnimationFrame(animationRef.current.rafId);
      }
    };
  }, [handleKeyboardEvent]);

  return animationState;
}

/**
 * Hook that provides a smooth animated keyboard height value
 */
export function useAnimatedKeyboardHeight(): number {
  const { height } = useKeyboardAnimation();
  return height;
}

/**
 * Hook that provides a smooth animated keyboard progress value (0-1)
 * Useful for fade, scale, or other progressive animations
 */
export function useAnimatedKeyboardProgress(): number {
  const { progress } = useKeyboardAnimation();
  return progress;
}

/**
 * Hook that provides CSS transform values for keyboard-aware animations
 */
export function useKeyboardTransform(options: {
  /** Direction to move element when keyboard appears */
  direction?: 'up' | 'down';
  /** Multiplier for the transform value */
  multiplier?: number;
} = {}) {
  const { direction = 'up', multiplier = 1 } = options;
  const { height } = useKeyboardAnimation();
  
  const transformValue = height * multiplier;
  const translateY = direction === 'up' ? -transformValue : transformValue;
  
  return {
    transform: `translateY(${translateY}px)`,
    transition: 'transform 0.25s ease-out',
  };
}

/**
 * Hook that provides opacity animation based on keyboard state
 */
export function useKeyboardOpacity(options: {
  /** Show when keyboard is visible */
  showWhenVisible?: boolean;
  /** Minimum opacity value */
  minOpacity?: number;
  /** Maximum opacity value */
  maxOpacity?: number;
} = {}) {
  const { showWhenVisible = true, minOpacity = 0, maxOpacity = 1 } = options;
  const { progress } = useKeyboardAnimation();
  
  const opacity = showWhenVisible 
    ? minOpacity + (maxOpacity - minOpacity) * progress
    : maxOpacity - (maxOpacity - minOpacity) * progress;
  
  return {
    opacity,
    transition: 'opacity 0.25s ease-out',
  };
}