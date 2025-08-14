import React, { forwardRef, CSSProperties } from 'react';
import { useKeyboardState } from '../hooks/useKeyboardState';
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation';

export interface KeyboardStickyViewProps {
  /** Child elements */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Whether to animate the view when keyboard appears */
  animated?: boolean;
  /** Offset from keyboard edge */
  offset?: number;
  /** Position relative to keyboard */
  position?: 'top' | 'bottom';
  /** Enable safe area handling */
  enableSafeArea?: boolean;
}

/**
 * A view that sticks to the keyboard edge and follows its movement.
 * Perfect for input toolbars, send buttons, or floating action buttons.
 * 
 * @example
 * // Sticky view above keyboard (like input toolbar)
 * <KeyboardStickyView position="top" offset={8}>
 *   <InputToolbar />
 * </KeyboardStickyView>
 * 
 * @example
 * // Sticky view below keyboard with animation
 * <KeyboardStickyView 
 *   position="bottom" 
 *   animated={true}
 *   offset={16}
 * >
 *   <FloatingActionButton />
 * </KeyboardStickyView>
 */
export const KeyboardStickyView = forwardRef<HTMLDivElement, KeyboardStickyViewProps>(({
  children,
  className = '',
  style = {},
  animated = true,
  offset = 0,
  position = 'top',
  enableSafeArea = true,
  ...props
}, ref) => {
  const { keyboard, safeArea } = useKeyboardState();
  const { height: animatedHeight, progress } = useKeyboardAnimation();
  
  const keyboardHeight = animated ? animatedHeight : keyboard.height;
  const isVisible = keyboard.isVisible;

  const getViewStyle = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      position: 'fixed',
      left: enableSafeArea ? safeArea.left : 0,
      right: enableSafeArea ? safeArea.right : 0,
      zIndex: 1000,
      transition: animated ? 'all 0.25s ease-out' : undefined,
      ...style,
    };

    if (!isVisible && keyboardHeight === 0) {
      // Hide when keyboard is not visible
      return {
        ...baseStyle,
        bottom: -100, // Move off-screen
        opacity: 0,
        pointerEvents: 'none',
      };
    }

    const safeBottomOffset = enableSafeArea ? safeArea.bottom : 0;

    if (position === 'top') {
      // Position above keyboard
      return {
        ...baseStyle,
        bottom: keyboardHeight + offset + safeBottomOffset,
        opacity: animated ? progress : 1,
      };
    } else {
      // Position below keyboard
      return {
        ...baseStyle,
        bottom: Math.max(0, keyboardHeight - offset) + safeBottomOffset,
        opacity: animated ? progress : 1,
      };
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

KeyboardStickyView.displayName = 'KeyboardStickyView';