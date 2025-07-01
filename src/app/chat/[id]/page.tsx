'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Message } from '@/lib/types';
import { getBotResponse } from '@/app/actions';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useToast } from '@/hooks/use-toast';
import useChatMessages from '@/hooks/useChatMessages';
import useConversationInfo from '@/hooks/useConversationInfo';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { BookText, Cake, Calendar, Lightbulb, ListTodo, MessageSquare, Loader2 } from 'lucide-react';

const categoryIcons: {[key: string]: React.ReactNode} = {
    General: <MessageSquare className="w-5 h-5" />,
    Ideas: <Lightbulb className="w-5 h-5" />,
    Tareas: <ListTodo className="w-5 h-5" />,
    Recetas: <BookText className="w-5 h-5" />,
    Eventos: <Calendar className="w-5 h-5" />,
    Cumpleaños: <Cake className="w-5 h-5" />,
    Recordatorios: <Calendar className="w-5 h-5" />,
};


export default function ChatPage() {
  const params = useParams();
  const chatId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  const { messages, setMessages, loading: messagesLoading } = useChatMessages(chatId);
  const { info: chatInfo, loading: infoLoading } = useConversationInfo(chatId);

  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  const displayIcon = chatInfo?.title ? categoryIcons[chatInfo.title] || <MessageSquare className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />;
  const displayTitle = chatInfo?.title || 'Cargando...';


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
       // Optimistic message will be replaced by the real-time listener
       setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));

       if (response.data.informationSummary) {
          toast({
              title: `Nota guardada`,
              description: `Tu nota ha sido guardada en "${response.data.category}".`
          })
      }
       if (response.data.reminder) {
          toast({
              title: `Recordatorio establecido`,
              description: `Te recordaré sobre "${response.data.reminder.text}".`
          })
       }
    } else {
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
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
    // This would update the document in Firestore in a real app
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
      <ChatHeader title={displayTitle} icon={displayIcon} />
      <MessageList messages={messages} isLoading={messagesLoading || isSending} onFeedback={handleFeedback} />
      <MessageInput onSubmit={handleSendMessage} isLoading={isSending} />
    </div>
  );
}
