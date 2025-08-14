export interface KeyboardState {
  /** Whether the keyboard is currently visible */
  isVisible: boolean;
  /** Height of the keyboard in pixels */
  height: number;
  /** Animation duration in milliseconds */
  duration: number;
  /** Timestamp when the keyboard state changed */
  timestamp: number;
  /** Target element that triggered the keyboard */
  target: number;
  /** Keyboard transition type */
  type: 'opening' | 'closing' | 'stable';
  /** Platform information */
  platform: 'ios' | 'android' | 'web';
}

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface KeyboardAnimationState {
  /** Animated keyboard height value */
  height: number;
  /** Animated keyboard progress (0-1) */
  progress: number;
}

export interface KeyboardControllerState {
  /** Current keyboard state */
  keyboard: KeyboardState;
  /** Safe area insets */
  safeArea: SafeAreaInsets;
  /** Available screen height excluding keyboard and safe areas */
  availableHeight: number;
}

export type KeyboardEventType = 'keyboardWillShow' | 'keyboardDidShow' | 'keyboardWillHide' | 'keyboardDidHide';

export interface KeyboardEvent {
  type: KeyboardEventType;
  state: KeyboardState;
  timestamp: number;
}

export type KeyboardEventListener = (event: KeyboardEvent) => void;

export interface KeyboardAnimationConfig {
  /** Enable native driver for animations */
  useNativeDriver?: boolean;
  /** Animation duration override */
  duration?: number;
  /** Easing function */
  easing?: string;
}

export interface KeyboardControllerConfig {
  /** Enable debug logging */
  debug?: boolean;
  /** Animation configuration */
  animation?: KeyboardAnimationConfig;
  /** Platform-specific overrides */
  platformOverrides?: {
    ios?: Partial<KeyboardControllerConfig>;
    android?: Partial<KeyboardControllerConfig>;
  };
}