'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import type { Message } from '@/lib/types';
import { getBotResponse } from '@/app/actions';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useToast } from '@/hooks/use-toast';
import useChatMessages from '@/hooks/useChatMessages';
import useConversationInfo from '@/hooks/useConversationInfo';
import { BookText, Cake, Calendar, Lightbulb, ListTodo, MessageSquare, Loader2, CreditCard } from 'lucide-react';

const categoryIcons: {[key: string]: React.ReactNode} = {
    General: <MessageSquare className="w-5 h-5" />,
    Ideas: <Lightbulb className="w-5 h-5" />,
    Tareas: <ListTodo className="w-5 h-5" />,
    Recetas: <BookText className="w-5 h-5" />,
    Eventos: <Calendar className="w-5 h-5" />,
    Cumpleaños: <Cake className="w-5 h-5" />,
    Recordatorios: <Calendar className="w-5 h-5" />,
    Gastos: <CreditCard className="w-5 h-5" />,
};


export default function ChatPage() {
  const params = useParams();
  const chatId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  const { messages, setMessages, loading: messagesLoading } = useChatMessages(chatId);
  const { info: chatInfo, loading: infoLoading } = useConversationInfo(chatId);

  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const messageQueue = useRef<string[]>([]);
  const optimisticIds = useRef<string[]>([]);
  
  const displayIcon = chatInfo?.title ? categoryIcons[chatInfo.title] || <MessageSquare className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />;
  const displayTitle = chatInfo?.title || 'Cargando...';

  const processQueue = async () => {
    if (messageQueue.current.length === 0 || isSending) {
        return;
    }

    const messagesToProcess = [...messageQueue.current];
    const idsToClear = [...optimisticIds.current];
    messageQueue.current = [];
    optimisticIds.current = [];

    setIsSending(true);

    const response = await getBotResponse(messagesToProcess, chatId);

    setIsSending(false);

    setMessages(prev => prev.filter(m => !idsToClear.includes(m.id)));

    if (!response.success) {
       toast({
        variant: "destructive",
        title: "Error",
        description: response.error || 'Lo siento, algo salió mal. Por favor, inténtalo de nuevo.',
      });
    }
    inputRef.current?.focus();

    if (messageQueue.current.length > 0) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(processQueue, 2000);
    }
  }

  const handleSendMessage = async (input: string) => {
    if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
    }
    
    const optimisticId = `optimistic-${Date.now()}`;
    optimisticIds.current.push(optimisticId);
    messageQueue.current.push(input);

    const optimisticMessage: Message = {
      id: optimisticId,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    debounceTimer.current = setTimeout(processQueue, 2000);
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

  useEffect(() => {
    inputRef.current?.focus();
    
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground max-w-4xl mx-auto border-x shadow-2xl">
      <ChatHeader title={displayTitle} icon={displayIcon} />
      <MessageList messages={messages} isLoading={isSending} onFeedback={handleFeedback} />
      <MessageInput ref={inputRef} onSubmit={handleSendMessage} isLoading={isSending} />
    </div>
  );
}
