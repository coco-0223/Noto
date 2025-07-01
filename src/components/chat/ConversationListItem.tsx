'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/lib/types';
import { Pin } from 'lucide-react';

type Props = {
  conversation: Conversation;
  icon: React.ReactNode;
};

export default function ConversationListItem({ conversation, icon }: Props) {
  return (
    <Link href={`/chat/${conversation.id}`} className="block transition-colors hover:bg-secondary/50">
      <div className="flex items-center gap-4 p-4">
        <Avatar className="h-12 w-12 bg-secondary flex items-center justify-center">
           {icon}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className="font-semibold truncate">{conversation.title}</p>
            <p className="text-xs text-muted-foreground">{conversation.timestamp}</p>
          </div>
          <div className="flex justify-between items-start mt-1">
            <p className="text-sm text-muted-foreground truncate pr-4">
              {conversation.lastMessage}
            </p>
            <div className='flex items-center gap-2 shrink-0'>
              {conversation.pinned && <Pin className="w-3.5 h-3.5 text-muted-foreground" />}
              {conversation.unreadCount && conversation.unreadCount > 0 && (
                <Badge className="bg-primary h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
