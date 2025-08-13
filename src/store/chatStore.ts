import { create } from 'zustand';
import type { Message } from '../types/chat';

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  setMessages: (messages: Message[]) => void;
  prependMessages: (messages: Message[]) => void;
  setLoading: (isLoading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  hasMore: true,
  error: null,
  
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
    
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),
    
  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    })),
    
  setMessages: (messages) => set({ messages }),
  
  prependMessages: (messages) =>
    set((state) => ({ messages: [...messages, ...state.messages] })),
    
  setLoading: (isLoading) => set({ isLoading }),
  
  setHasMore: (hasMore) => set({ hasMore }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
}))