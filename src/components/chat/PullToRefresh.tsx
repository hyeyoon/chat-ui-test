import React from 'react';
import { cn } from '../../utils/cn';

interface PullToRefreshProps {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  pullProgress: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  isPulling,
  pullDistance,
  isRefreshing,
  pullProgress,
}) => {
  const shouldShow = isPulling || isRefreshing || pullDistance > 0;
  
  if (!shouldShow) return null;
  
  return (
    <div
      className={cn(
        'absolute top-0 left-0 right-0 flex justify-center',
        'transition-transform duration-200 ease-out',
        'pointer-events-none z-10'
      )}
      style={{
        transform: `translateY(${pullDistance}px)`,
      }}
    >
      <div
        className={cn(
          'mt-4 p-2 rounded-full bg-white shadow-lg',
          'transition-all duration-200'
        )}
        style={{
          opacity: Math.min(pullProgress, 1),
          transform: `scale(${0.5 + pullProgress * 0.5})`,
        }}
      >
        {isRefreshing ? (
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
        ) : (
          <svg
            className={cn(
              'w-6 h-6 text-gray-600 transition-transform',
              pullProgress >= 1 && 'rotate-180'
            )}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
      </div>
    </div>
  );
};