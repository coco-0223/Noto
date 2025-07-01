export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
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
  timestamp: string;
  pinned?: boolean;
};

export type Memory = {
    id?: string;
    summary: string;
    category: string;
    createdAt: string;
}
