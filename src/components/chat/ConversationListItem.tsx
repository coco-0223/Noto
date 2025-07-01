'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/lib/types';
import { Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type Props = {
  conversation: Conversation;
  icon: React.ReactNode;
};

export default function ConversationListItem({ conversation, icon }: Props) {
  const timeAgo = formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true, locale: es });

  return (
    <Link href={`/chat/${conversation.id}`} className="block transition-colors hover:bg-secondary/50">
      <div className="flex items-center gap-4 p-4">
        <Avatar className="h-12 w-12 bg-secondary flex items-center justify-center">
           {icon}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className="font-semibold truncate">{conversation.title}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
          <div className="flex justify-between items-start mt-1">
            <p className="text-sm text-muted-foreground truncate pr-4">
              {conversation.lastMessage}
            </p>
            <div className='flex items-center gap-2 shrink-0'>
              {conversation.pinned && <Pin className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
