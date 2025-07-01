import ConversationListItem from '@/components/chat/ConversationListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Conversation } from '@/lib/types';
import { BookText, Cake, Calendar, Lightbulb, ListTodo, MessageSquare } from 'lucide-react';

const conversations: Conversation[] = [
  {
    id: 'general',
    title: 'General',
    lastMessage: '¡Hola! ¿Cómo te fue el día?',
    timestamp: '11:42',
    avatar: '/avatars/general.png',
    pinned: true,
  },
  {
    id: 'ideas',
    title: 'Ideas',
    lastMessage: 'Una app que te recuerde regar las plantas',
    timestamp: '11:30',
    avatar: '/avatars/ideas.png',
  },
    {
    id: 'tareas',
    title: 'Tareas',
    lastMessage: 'Comprar leche y pan',
    timestamp: 'Ayer',
    avatar: '/avatars/tareas.png',
  },
  {
    id: 'recetas',
    title: 'Recetas',
    lastMessage: 'Receta de la abuela para la tarta de manzana',
    timestamp: 'Ayer',
    avatar: '/avatars/recetas.png',
    unreadCount: 1,
  },
  {
    id: 'eventos',
    title: 'Eventos',
    lastMessage: 'Cena con amigos el sábado',
    timestamp: '23/04/24',
    avatar: '/avatars/eventos.png',
  },
  {
    id: 'cumpleanos',
    title: 'Cumpleaños',
    lastMessage: 'Cumple de mamá el 2 de Mayo',
    timestamp: '19/04/24',
    avatar: '/avatars/cumpleanos.png',
    unreadCount: 3,
  },
];

const categoryIcons: {[key: string]: React.ReactNode} = {
  general: <MessageSquare className="w-6 h-6 text-primary" />,
  ideas: <Lightbulb className="w-6 h-6 text-yellow-500" />,
  tareas: <ListTodo className="w-6 h-6 text-blue-500" />,
  recetas: <BookText className="w-6 h-6 text-green-500" />,
  eventos: <Calendar className="w-6 h-6 text-red-500" />,
  cumpleanos: <Cake className="w-6 h-6 text-pink-500" />,
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
          {pinned.length > 0 && <Separator className="my-1" />}
          {unpinned.map((conv) => (
             <ConversationListItem key={conv.id} conversation={conv} icon={categoryIcons[conv.id]} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
