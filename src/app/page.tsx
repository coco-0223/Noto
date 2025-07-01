import ConversationListItem from '@/components/chat/ConversationListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Conversation } from '@/lib/types';
import { MessageSquare } from 'lucide-react';

const conversations: Conversation[] = [
  {
    id: 'general',
    title: 'General',
    lastMessage: '¡Hola! ¿Cómo te fue el día?',
    timestamp: 'Ahora',
    avatar: '/avatars/general.png',
    pinned: true,
  },
];

const categoryIcons: {[key: string]: React.ReactNode} = {
  general: <MessageSquare className="w-6 h-6 text-primary" />,
};


export default function ConversationsPage() {
  const pinned = conversations.filter(c => c.pinned);
  const unpinned = conversations.filter(c => !c.pinned);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground max-w-4xl mx-auto border-x shadow-2xl">
      <header className="flex items-center justify-between p-4 border-b bg-secondary/50 sticky top-0 z-10 backdrop-blur-sm">
        <h1 className="text-xl font-bold">Chats</h1>
      </header>
      <ScrollArea className="flex-1">
        <div>
          {pinned.map((conv) => (
            <ConversationListItem key={conv.id} conversation={conv} icon={categoryIcons[conv.id]} />
          ))}
          {pinned.length > 0 && unpinned.length > 0 && <Separator className="my-1" />}
          {unpinned.map((conv) => (
             <ConversationListItem key={conv.id} conversation={conv} icon={categoryIcons[conv.id]} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
