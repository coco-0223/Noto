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
