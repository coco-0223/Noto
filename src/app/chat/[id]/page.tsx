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
  
  const displayIcon = chatInfo?.title ? categoryIcons[chatInfo.title] || <MessageSquare className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />;
  const displayTitle = chatInfo?.title || 'Cargando...';

  const processQueue = async () => {
    // Do not process if the queue is empty or a request is already in flight.
    if (messageQueue.current.length === 0 || isSending) {
        return;
    }

    const messagesToProcess = [...messageQueue.current];
    messageQueue.current = []; // Clear the queue for this batch

    setIsSending(true);

    const response = await getBotResponse(messagesToProcess, chatId);

    setIsSending(false);

    // The listener will update the list with the real messages from the DB.
    // We just need to remove the optimistic messages we added for this batch.
    setMessages(prev => prev.filter(m => !m.id.startsWith('optimistic-')));

    if (response.success && response.data) {
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
       toast({
        variant: "destructive",
        title: "Error",
        description: response.error || 'Lo siento, algo salió mal. Por favor, inténtalo de nuevo.',
      });
    }
    inputRef.current?.focus();

    // After processing, check if new messages were queued up while we were busy
    // and if so, trigger another processing cycle.
    if (messageQueue.current.length > 0) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(processQueue, 2000);
    }
  }

  const handleSendMessage = async (input: string) => {
    // Always clear the existing timer on a new message to reset the debounce period.
    if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
    }
    
    // Add the new message to our queue.
    messageQueue.current.push(input);

    // Add an optimistic message to the UI for immediate feedback.
    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    // Set a new timer. After 2 seconds of inactivity, process the whole queue.
    debounceTimer.current = setTimeout(processQueue, 2000);
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

  useEffect(() => {
    // Focus input on initial load
    inputRef.current?.focus();
    
    // Cleanup timer on component unmount
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
