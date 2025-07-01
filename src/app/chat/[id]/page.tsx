'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Message } from '@/lib/types';
import { getBotResponse, getInitialChatData } from '@/app/actions';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BookText, Cake, Calendar, Lightbulb, ListTodo, MessageSquare, Loader2 } from 'lucide-react';

const categoryIcons: {[key: string]: React.ReactNode} = {
    General: <MessageSquare className="w-5 h-5" />,
    Ideas: <Lightbulb className="w-5 h-5" />,
    Tareas: <ListTodo className="w-5 h-5" />,
    Recetas: <BookText className="w-5 h-5" />,
    Eventos: <Calendar className="w-5 h-5" />,
    Cumpleaños: <Cake className="w-5 h-5" />,
};

export default function ChatPage() {
  const params = useParams();
  const chatId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatInfo, setChatInfo] = useState<{title: string, icon: React.ReactNode}>({ title: 'Cargando...', icon: <Loader2 className="w-5 h-5 animate-spin" /> });
  const { toast } = useToast();

  useEffect(() => {
    const loadChat = async () => {
      setIsLoading(true);
      const response = await getInitialChatData(chatId);
      if (response.success && response.data) {
        setMessages(response.data.messages);
        setChatInfo({
          title: response.data.title,
          icon: categoryIcons[response.data.icon] || <MessageSquare className="w-5 h-5" />,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error al cargar el chat",
          description: response.error,
        });
        setChatInfo({ title: 'Error', icon: <MessageSquare className="w-5 h-5" /> });
      }
      setIsLoading(false);
    };
    loadChat();
  }, [chatId, toast]);

  const handleSendMessage = async (input: string) => {
    setIsSending(true);
    const optimisticMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);

    const response = await getBotResponse(input, chatId);

    setIsSending(false);

    if (response.success && response.data) {
       setMessages(prev => {
        const newMessages = prev.filter(m => m.id !== optimisticMessage.id);
        return [...newMessages, response.data.userMessage, response.data.botMessage];
       });
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
        timestamp: new Date().toISOString(),
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
      <MessageList messages={messages} isLoading={isLoading || isSending} onFeedback={handleFeedback} />
      <MessageInput onSubmit={handleSendMessage} isLoading={isSending} />
    </div>
  );
}
