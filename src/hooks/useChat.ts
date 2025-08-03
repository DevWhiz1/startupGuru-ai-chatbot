import { useState, useCallback } from 'react';
import { Message, ChatState } from '../types/chat';

// Mock bot responses for demonstration
const mockBotResponses = [
  "Hello! I'm your AI assistant. How can I help you today?",
  "That's an interesting question! Let me think about that for a moment.",
  "I understand what you're asking. Here's what I think...",
  "Thanks for sharing that with me. Is there anything specific you'd like to know more about?",
  "I'm here to help! Feel free to ask me anything you'd like to know.",
  "That's a great point. Let me provide you with some additional information.",
  "I appreciate your question. Here's my response based on what I know.",
];

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isTyping: false,
  });

  const sendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
    }));

    // Simulate bot response with typing delay
    setTimeout(() => {
      const randomResponse = mockBotResponses[Math.floor(Math.random() * mockBotResponses.length)];
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: randomResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isTyping: false,
      }));
    }, 1000 + Math.random() * 2000);
  }, []);

  const clearChat = useCallback(() => {
    setState({
      messages: [],
      isTyping: false,
    });
  }, []);

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    sendMessage,
    clearChat,
  };
};