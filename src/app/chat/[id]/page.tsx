'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import type { Message, ChatHistory } from '@/lib/types';
import { getBotResponse } from '@/app/actions';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BookText, Cake, Calendar, Lightbulb, ListTodo, MessageSquare } from 'lucide-react';

const conversationsData: {[key: string]: { title: string; icon: React.ReactNode }} = {
    general: { title: 'General', icon: <MessageSquare className="w-5 h-5" /> },
    ideas: { title: 'Ideas', icon: <Lightbulb className="w-5 h-5" /> },
    tareas: { title: 'Tareas', icon: <ListTodo className="w-5 h-5" /> },
    recetas: { title: 'Recetas', icon: <BookText className="w-5 h-5" /> },
    eventos: { title: 'Eventos', icon: <Calendar className="w-5 h-5" /> },
    cumpleanos: { title: 'Cumpleaños', icon: <Cake className="w-5 h-5" /> },
};


const initialMessages: Message[] = [
  {
    id: '1',
    text: '¡Hola! ¿Cómo te fue el día?',
    sender: 'bot',
    timestamp: format(new Date(), 'p'),
  },
];

export default function ChatPage() {
  const params = useParams();
  const chatId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const chatInfo = conversationsData[chatId] || { title: 'Chat', icon: <MessageSquare className="w-5 h-5" /> };


  const handleSendMessage = async (input: string) => {
    setIsLoading(true);
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: format(new Date(), 'p'),
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    const chatHistory: ChatHistory[] = updatedMessages.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'bot',
      content: msg.text,
    }));

    const response = await getBotResponse(input, chatHistory, chatId);

    setIsLoading(false);

    if (response.success && response.data) {
      const botMessage: Message = {
        id: Date.now().toString(),
        text: response.data.chatbotResponse,
        sender: 'bot',
        timestamp: format(new Date(), 'p'),
      };
      setMessages((prev) => [...prev, botMessage]);
      if (response.data.informationSummary) {
          toast({
              title: `Noto ha guardado algo en ${response.data.category}`,
              description: `Resumen: ${response.data.informationSummary}`
          })
      }
    } else {
      const errorBotMessage: Message = {
        id: Date.now().toString(),
        text: 'Lo siento, algo salió mal. Por favor, inténtalo de nuevo.',
        sender: 'bot',
        timestamp: format(new Date(), 'p'),
      };
      setMessages((prev) => [...prev, errorBotMessage]);
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  };

  const handleFeedback = (messageId: string, feedback: 'liked' | 'disliked') => {
    setMessages(messages => messages.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
    toast({
      title: "¡Gracias!",
      description: "Tus comentarios nos ayudan a mejorar.",
    })
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground max-w-4xl mx-auto border-x shadow-2xl">
      <ChatHeader title={chatInfo.title} icon={chatInfo.icon} />
      <MessageList messages={messages} isLoading={isLoading} onFeedback={handleFeedback} />
      <MessageInput onSubmit={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
