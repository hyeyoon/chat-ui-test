import React, { forwardRef, CSSProperties } from 'react';
import { useKeyboardState, useKeyboardAnimation } from '../hooks';

export interface KeyboardAwareViewProps {
  /** Child elements */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Whether to animate the view when keyboard appears */
  animated?: boolean;
  /** Offset from keyboard when visible */
  offset?: number;
  /** Behavior when keyboard appears */
  behavior?: 'position' | 'height' | 'padding';
  /** Enable safe area handling */
  enableSafeArea?: boolean;
}

/**
 * A view that automatically adjusts its layout when the keyboard appears.
 * Provides multiple behaviors for handling keyboard appearance.
 * 
 * @example
 * // Basic usage - adjusts height when keyboard appears
 * <KeyboardAwareView>
 *   <YourContent />
 * </KeyboardAwareView>
 * 
 * @example
 * // Move content up with animation and offset
 * <KeyboardAwareView 
 *   behavior="position" 
 *   animated={true} 
 *   offset={20}
 * >
 *   <YourContent />
 * </KeyboardAwareView>
 * 
 * @example
 * // Add padding to bottom when keyboard appears
 * <KeyboardAwareView behavior="padding">
 *   <YourContent />
 * </KeyboardAwareView>
 */
export const KeyboardAwareView = forwardRef<HTMLDivElement, KeyboardAwareViewProps>(({
  children,
  className = '',
  style = {},
  animated = true,
  offset = 0,
  behavior = 'height',
  enableSafeArea = true,
  ...props
}, ref) => {
  const { keyboard, safeArea, availableHeight } = useKeyboardState();
  const { height: animatedHeight } = useKeyboardAnimation();
  
  const keyboardHeight = animated ? animatedHeight : keyboard.height;
  const isVisible = keyboard.isVisible;

  const getViewStyle = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      ...style,
      transition: animated ? 'all 0.25s ease-out' : undefined,
    };

    // Apply safe area if enabled
    if (enableSafeArea) {
      baseStyle.paddingTop = Math.max(
        parseInt(String(baseStyle.paddingTop || 0)), 
        safeArea.top
      );
      baseStyle.paddingLeft = Math.max(
        parseInt(String(baseStyle.paddingLeft || 0)), 
        safeArea.left
      );
      baseStyle.paddingRight = Math.max(
        parseInt(String(baseStyle.paddingRight || 0)), 
        safeArea.right
      );
      baseStyle.paddingBottom = Math.max(
        parseInt(String(baseStyle.paddingBottom || 0)), 
        safeArea.bottom
      );
    }

    if (!isVisible) {
      return baseStyle;
    }

    switch (behavior) {
      case 'height':
        return {
          ...baseStyle,
          height: `${availableHeight}px`,
          maxHeight: `${availableHeight}px`,
          overflow: 'hidden',
        };

      case 'position':
        return {
          ...baseStyle,
          transform: `translateY(-${keyboardHeight + offset}px)`,
        };

      case 'padding':
        return {
          ...baseStyle,
          paddingBottom: `${keyboardHeight + offset + (baseStyle.paddingBottom ? parseInt(String(baseStyle.paddingBottom)) : 0)}px`,
        };

      default:
        return baseStyle;
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={getViewStyle()}
      {...props}
    >
      {children}
    </div>
  );
});

KeyboardAwareView.displayName = 'KeyboardAwareView';