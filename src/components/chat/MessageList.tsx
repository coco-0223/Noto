'use client';
import type { Message } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';
import { useEffect, useRef } from 'react';

type Props = {
  messages: Message[];
  isLoading: boolean;
  onFeedback?: (messageId: string, feedback: 'liked' | 'disliked') => void;
};

export default function MessageList({ messages, isLoading, onFeedback }: Props) {
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1" viewportRef={viewport}>
      <div className="p-4 space-y-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onFeedback={onFeedback} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-card rounded-lg px-4 py-3 text-sm shadow-sm rounded-bl-none">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
