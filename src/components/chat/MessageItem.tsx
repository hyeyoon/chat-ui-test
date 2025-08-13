import React from 'react';
import type { Message } from '../../types/chat';
import { cn } from '../../utils/cn';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          isUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={cn(
            'text-xs mt-1 flex items-center gap-1',
            isUser ? 'text-blue-100' : 'text-gray-500'
          )}
        >
          <span>{formatTime(message.timestamp)}</span>
          {isUser && message.status && (
            <span className="ml-1">
              {message.status === 'sending' && '⏱'}
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && (
                <span className="text-blue-200">✓✓</span>
              )}
              {message.status === 'error' && '⚠️'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};