import React, { forwardRef, CSSProperties, useMemo } from 'react';
import { useKeyboardState } from '../hooks/useKeyboardState';
import { useKeyboardAnimation } from '../hooks/useKeyboardAnimation';

export interface KeyboardAvoidingViewProps {
  /** Child elements */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional styles */
  style?: CSSProperties;
  /** Whether to animate the view when keyboard appears */
  animated?: boolean;
  /** Behavior when keyboard appears */
  behavior?: 'height' | 'position' | 'padding';
  /** Extra offset to add when avoiding keyboard */
  keyboardVerticalOffset?: number;
  /** Enable automatic behavior detection based on content */
  enabled?: boolean;
  /** Content height for calculations */
  contentInsetAdjustmentBehavior?: 'automatic' | 'scrollableAxes' | 'never' | 'always';
}

/**
 * Enhanced keyboard avoiding view with intelligent behavior detection.
 * Automatically chooses the best avoidance strategy based on content and layout.
 * 
 * @example
 * // Automatic behavior detection
 * <KeyboardAvoidingView>
 *   <ScrollView>
 *     <YourContent />
 *   </ScrollView>
 * </KeyboardAvoidingView>
 * 
 * @example
 * // Force specific behavior with offset
 * <KeyboardAvoidingView 
 *   behavior="position" 
 *   keyboardVerticalOffset={64}
 * >
 *   <YourContent />
 * </KeyboardAvoidingView>
 */
export const KeyboardAvoidingView = forwardRef<HTMLDivElement, KeyboardAvoidingViewProps>(({
  children,
  className = '',
  style = {},
  animated = true,
  behavior,
  keyboardVerticalOffset = 0,
  enabled = true,
  contentInsetAdjustmentBehavior = 'automatic',
  ...props
}, ref) => {
  const { keyboard, safeArea, availableHeight } = useKeyboardState();
  const { height: animatedHeight } = useKeyboardAnimation();
  
  const keyboardHeight = animated ? animatedHeight : keyboard.height;
  const isVisible = keyboard.isVisible && enabled;

  // Automatically determine behavior if not specified
  const determinedBehavior = useMemo(() => {
    if (behavior) return behavior;
    
    // Auto-detection logic
    if (contentInsetAdjustmentBehavior === 'scrollableAxes') {
      return 'padding';
    }
    
    // Default to height for most cases
    return 'height';
  }, [behavior, contentInsetAdjustmentBehavior]);

  const getViewStyle = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      ...style,
      transition: animated ? 'all 0.25s ease-out' : undefined,
    };

    if (!isVisible) {
      return baseStyle;
    }

    const totalOffset = keyboardHeight + keyboardVerticalOffset;

    switch (determinedBehavior) {
      case 'height':
        return {
          ...baseStyle,
          height: `${availableHeight - keyboardVerticalOffset}px`,
          maxHeight: `${availableHeight - keyboardVerticalOffset}px`,
          overflow: 'hidden',
        };

      case 'position':
        return {
          ...baseStyle,
          transform: `translateY(-${totalOffset}px)`,
        };

      case 'padding':
        return {
          ...baseStyle,
          paddingBottom: `${totalOffset + safeArea.bottom}px`,
        };

      default:
        return baseStyle;
    }
  };

  const containerStyle: CSSProperties = {
    flex: 1,
    width: '100%',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...containerStyle, ...getViewStyle() }}
      {...props}
    >
      {children}
    </div>
  );
});

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';