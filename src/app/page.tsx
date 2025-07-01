'use client';
import ConversationListItem from '@/components/chat/ConversationListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Conversation } from '@/lib/types';
import { BookText, Cake, Calendar, Lightbulb, ListTodo, MessageSquare, Loader2 } from 'lucide-react';
import useConversations from '@/hooks/useConversations';

const categoryIcons: {[key: string]: React.ReactNode} = {
  General: <MessageSquare className="w-6 h-6 text-primary" />,
  Ideas: <Lightbulb className="w-6 h-6 text-primary" />,
  Tareas: <ListTodo className="w-6 h-6 text-primary" />,
  Recetas: <BookText className="w-6 h-6 text-primary" />,
  Eventos: <Calendar className="w-6 h-6 text-primary" />,
  Cumpleaños: <Cake className="w-6 h-6 text-primary" />,
  Recordatorios: <Calendar className="w-6 h-6 text-primary" />,
};

function getIconForConversation(conversation: Conversation) {
    return categoryIcons[conversation.title] || <MessageSquare className="w-6 h-6 text-primary" />;
}

export default function ConversationsPage() {
  const { conversations, loading } = useConversations();
  const pinned = conversations.filter(c => c.pinned);
  const unpinned = conversations.filter(c => !c.pinned);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground max-w-4xl mx-auto border-x shadow-2xl">
      <header className="flex items-center justify-between p-4 border-b bg-secondary/50 sticky top-0 z-10 backdrop-blur-sm">
        <h1 className="text-xl font-bold">Chats</h1>
      </header>
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="text-center text-muted-foreground p-8 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando conversaciones...</span>
          </div>
        ) : (
          <div>
            {pinned.map((conv) => (
              <ConversationListItem key={conv.id} conversation={conv} icon={getIconForConversation(conv)} />
            ))}
            {pinned.length > 0 && unpinned.length > 0 && <Separator className="my-1" />}
            {unpinned.map((conv) => (
              <ConversationListItem key={conv.id} conversation={conv} icon={getIconForConversation(conv)} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
