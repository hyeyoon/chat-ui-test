import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatContainer } from './components/chat/ChatContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="fixed inset-0 overflow-hidden">
        <ChatContainer />
      </div>
    </QueryClientProvider>
  );
}

export default App;