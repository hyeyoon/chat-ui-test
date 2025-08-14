import React, { useState, useRef, KeyboardEvent } from 'react';
import { useChatStore } from '../../store/chatStore';
import { sendMessage, getAssistantResponse } from '../../api/mockData';
import { cn } from '../../utils/cn';

export const MessageInput: React.FC = () => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { addMessage, updateMessage } = useChatStore();
  
  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    
    const messageContent = input.trim();
    setInput('');
    setIsSending(true);
    
    try {
      const sentMessage = await sendMessage(messageContent);
      addMessage(sentMessage);
      updateMessage(sentMessage.id, { status: 'delivered' });
      
      const typingMessage = {
        id: 'typing',
        content: '...',
        sender: 'assistant' as const,
        timestamp: new Date(),
        isTyping: true,
      };
      addMessage(typingMessage);
      
      const response = await getAssistantResponse(messageContent);
      updateMessage('typing', response);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  };
  
  const handleQuickLink = () => {
    console.log('바로가기 클릭');
    window.open('https://example.com', '_blank');
    setIsMenuOpen(false);
  };
  
  return (
    <div className="relative bg-white">
      {/* 메뉴 패널 */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-t-lg shadow-lg z-20 mb-1">
            <div className="p-4">
              <button
                onClick={handleQuickLink}
                className="flex items-center gap-2 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-gray-700">바로가기</span>
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* 입력 영역 */}
      <div 
        className="border-t border-gray-200 bg-white px-4 py-3"
        style={{
          paddingBottom: `max(0.75rem, env(safe-area-inset-bottom))`,
          paddingLeft: `max(1rem, env(safe-area-inset-left))`,
          paddingRight: `max(1rem, env(safe-area-inset-right))`,
        }}
      >
        <div className="flex items-end gap-2">
          {/* + 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              'rounded-full p-2 transition-all',
              'hover:bg-gray-100 active:scale-95',
              isMenuOpen ? 'bg-gray-100 rotate-45' : 'bg-white'
            )}
            aria-label="More options"
          >
            <svg
              className="w-5 h-5 text-gray-600 transition-transform"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 5v14m-7-7h14" />
            </svg>
          </button>
          
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className={cn(
              'flex-1 resize-none rounded-2xl border border-gray-300',
              'px-4 py-2 focus:outline-none focus:border-blue-500',
              'min-h-[40px] max-h-[120px] transition-colors'
            )}
            rows={1}
            disabled={isSending}
          />
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className={cn(
              'rounded-full p-2 transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              input.trim() && !isSending
                ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                : 'bg-gray-200 text-gray-400'
            )}
            aria-label="Send message"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};