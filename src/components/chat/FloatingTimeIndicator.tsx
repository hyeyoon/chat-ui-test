import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

interface FloatingTimeIndicatorProps {
  lastRefreshTime: Date | null;
  isVisible: boolean;
}

export const FloatingTimeIndicator: React.FC<FloatingTimeIndicatorProps> = ({
  lastRefreshTime,
  isVisible,
}) => {
  const [displayTime, setDisplayTime] = useState<string>('');
  
  useEffect(() => {
    if (lastRefreshTime) {
      const timeString = lastRefreshTime.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setDisplayTime(`마지막 업데이트: ${timeString}`);
    }
  }, [lastRefreshTime]);
  
  return (
    <div
      className={cn(
        'absolute top-4 left-1/2 -translate-x-1/2 z-20',
        'px-4 py-2 rounded-full',
        'bg-black/70 backdrop-blur-md text-white text-sm',
        'transition-all duration-300 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-full pointer-events-none'
      )}
      style={{
        top: 'calc(var(--safe-area-inset-top) + 1rem)',
      }}
    >
      {displayTime}
    </div>
  );
};