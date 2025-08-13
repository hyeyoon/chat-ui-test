import type { Message } from '../types/chat';

const mockMessages: Message[] = [
  {
    id: '1',
    content: '안녕하세요! 무엇을 도와드릴까요?',
    sender: 'assistant',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'delivered',
  },
  {
    id: '2', 
    content: '오늘 날씨가 어떤가요?',
    sender: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
    status: 'read',
  },
  {
    id: '3',
    content: '오늘은 맑고 화창한 날씨입니다. 기온은 약 22도 정도로 야외 활동하기 좋은 날씨네요.',
    sender: 'assistant',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22),
    status: 'delivered',
  },
];

export const generateMockMessages = (count: number, beforeId?: string): Message[] => {
  const startId = beforeId ? parseInt(beforeId) - count : mockMessages.length + 1;
  const messages: Message[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = (startId + i).toString();
    messages.push({
      id,
      content: `이전 메시지 #${id}`,
      sender: i % 2 === 0 ? 'user' : 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * (25 + count - i)),
      status: 'delivered',
    });
  }
  
  return messages;
};

export const getInitialMessages = (): Promise<Message[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMessages);
    }, 500);
  });
};

export const loadMoreMessages = (beforeId: string): Promise<Message[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const messages = generateMockMessages(10, beforeId);
      resolve(messages);
    }, 1000);
  });
};

export const sendMessage = (content: string): Promise<Message> => {
  return new Promise((resolve) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };
    
    setTimeout(() => {
      resolve({ ...userMessage, status: 'sent' });
    }, 500);
  });
};

export const getAssistantResponse = (userMessage: string): Promise<Message> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        '네, 알겠습니다.',
        '좋은 질문이네요!',
        '더 자세히 설명해 주시겠어요?',
        '그것에 대해 도움을 드릴 수 있습니다.',
        '흥미로운 주제네요.',
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'assistant',
        timestamp: new Date(),
        status: 'delivered',
      };
      
      resolve(response);
    }, 1500);
  });
};