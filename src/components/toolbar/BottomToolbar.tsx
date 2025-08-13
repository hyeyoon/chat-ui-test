import React, { useState, useEffect } from 'react';
import { ToolbarMenu } from './ToolbarMenu';
import { useKeyboard } from '../../hooks/useKeyboard';
import { cn } from '../../utils/cn';

export const BottomToolbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [referenceLinks, setReferenceLinks] = useState<string[]>([]);
  const { isKeyboardOpen, keyboardHeight } = useKeyboard();
  
  useEffect(() => {
    setReferenceLinks([
      'https://docs.example.com',
      'https://api.example.com',
      'https://github.com/example',
    ]);
  }, []);
  
  const handleLinkClick = (link: string) => {
    console.log(`Opening link: ${link}`);
    window.open(link, '_blank');
  };
  
  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <div
      className={cn(
        'relative bg-white border-t border-gray-200',
        'transition-all duration-300 ease-out'
      )}
    >
      <ToolbarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          <button
            onClick={handleToggleMenu}
            className={cn(
              'flex-shrink-0 p-2 rounded-lg',
              'hover:bg-gray-100 active:bg-gray-200',
              'transition-colors'
            )}
            aria-label="More options"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          {referenceLinks.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-gray-500 flex-shrink-0">참고:</span>
              {referenceLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleLinkClick(link)}
                  className={cn(
                    'text-xs text-blue-500 hover:text-blue-600',
                    'underline flex-shrink-0 px-1'
                  )}
                >
                  링크 {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          className={cn(
            'flex-shrink-0 p-2 rounded-lg ml-2',
            'hover:bg-gray-100 active:bg-gray-200',
            'transition-colors'
          )}
          aria-label="Settings"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};