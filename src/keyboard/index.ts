// Main controller
export { KeyboardController } from './KeyboardController';

// Types
export type {
  KeyboardState,
  SafeAreaInsets,
  KeyboardAnimationState,
  KeyboardControllerState,
  KeyboardEvent,
  KeyboardEventListener,
  KeyboardEventType,
  KeyboardControllerConfig,
} from './types';

// Hooks
export {
  useKeyboardState,
  useKeyboardVisible,
  useKeyboardHeight,
  useAvailableHeight,
  useSafeAreaInsets,
  type KeyboardStateSelector,
} from './hooks/useKeyboardState';

export {
  useKeyboardAnimation,
  useAnimatedKeyboardHeight,
  useAnimatedKeyboardProgress,
  useKeyboardTransform,
  useKeyboardOpacity,
} from './hooks/useKeyboardAnimation';

export {
  useKeyboardHandler,
  useKeyboardShowHandler,
  useKeyboardHideHandler,
  useKeyboardController,
  type KeyboardEventHandler,
  type KeyboardHandlerConfig,
} from './hooks/useKeyboardHandler';

// Components
export {
  KeyboardAwareView,
  type KeyboardAwareViewProps,
} from './components/KeyboardAwareView';

export {
  KeyboardStickyView,
  type KeyboardStickyViewProps,
} from './components/KeyboardStickyView';

export {
  KeyboardAvoidingView,
  type KeyboardAvoidingViewProps,
} from './components/KeyboardAvoidingView';

// Initialize keyboard controller with default config
import { KeyboardController } from './KeyboardController';

// Auto-initialize in development mode
if (typeof window !== 'undefined') {
  // Initialize with debug mode in development
  KeyboardController.initialize({
    debug: process.env.NODE_ENV === 'development',
    animation: {
      useNativeDriver: true,
      duration: 250,
      easing: 'ease-out',
    },
  });
}