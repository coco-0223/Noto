import type { Timestamp } from 'firebase/firestore';

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Timestamp | string; // Firestore uses Timestamp, optimistic uses string
  feedback?: 'liked' | 'disliked';
};

export type ChatHistory = {
  role: 'user' | 'bot';
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Timestamp;
  pinned?: boolean;
};

export type Memory = {
    id?: string;
    summary: string;
    category: string;
    createdAt: Timestamp;
}

export type Reminder = {
    id?: string;
    conversationId: string;
    text: string;
    triggerAt: Timestamp;
    processed: boolean;
}
