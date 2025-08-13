import { useEffect, useState } from 'react';

export function useKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const detectKeyboard = () => {
      if (!window.visualViewport) return;
      
      const keyboardHeight = window.innerHeight - window.visualViewport.height;
      const isOpen = keyboardHeight > 50;
      
      setKeyboardHeight(keyboardHeight);
      setIsKeyboardOpen(isOpen);
    };

    detectKeyboard();
    
    window.visualViewport?.addEventListener('resize', detectKeyboard);
    window.visualViewport?.addEventListener('scroll', detectKeyboard);
    
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        setTimeout(detectKeyboard, 300);
      }
    };
    
    const handleBlur = () => {
      setTimeout(detectKeyboard, 300);
    };
    
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', detectKeyboard);
      window.visualViewport?.removeEventListener('scroll', detectKeyboard);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  return { isKeyboardOpen, keyboardHeight };
}