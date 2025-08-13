import React, { useState } from 'react';
import { cn } from '../../utils/cn';

interface ToolbarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ToolbarMenu: React.FC<ToolbarMenuProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { id: 'camera', icon: '📷', label: '카메라' },
    { id: 'gallery', icon: '🖼️', label: '갤러리' },
    { id: 'file', icon: '📁', label: '파일' },
    { id: 'location', icon: '📍', label: '위치' },
    { id: 'contact', icon: '👤', label: '연락처' },
    { id: 'calendar', icon: '📅', label: '일정' },
  ];
  
  const handleItemClick = (itemId: string) => {
    console.log(`Menu item clicked: ${itemId}`);
    onClose();
  };
  
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}
      
      <div
        className={cn(
          'absolute bottom-full left-0 right-0 bg-white rounded-t-2xl',
          'shadow-xl border-t border-gray-200',
          'transition-transform duration-300 ease-out z-50',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="p-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          
          <div className="grid grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3',
                  'rounded-lg hover:bg-gray-100 active:bg-gray-200',
                  'transition-colors'
                )}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-gray-600">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};