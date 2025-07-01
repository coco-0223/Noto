'use client';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  message: Message;
  onFeedback?: (messageId: string, feedback: 'liked' | 'disliked') => void;
};

export default function MessageBubble({ message, onFeedback }: Props) {
  const isUser = message.sender === 'user';
  const showFeedbackButtons = !isUser && onFeedback;

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className="flex flex-col gap-1 items-start max-w-[80%] md:max-w-[65%]">
        <div
          className={cn(
            'group relative rounded-lg px-3 py-2 text-sm md:text-base shadow-sm',
            isUser
              ? 'bg-primary/20 rounded-br-none'
              : 'bg-card rounded-bl-none',
            isUser ? 'text-foreground' : 'text-card-foreground'
          )}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
          <div className='flex justify-end items-end w-full'>
            <span className="text-[10px] text-muted-foreground/80 float-right mt-1 ml-2">
              {message.timestamp}
            </span>
          </div>

          {showFeedbackButtons && (
             <div className="absolute top-0 -right-2 transform -translate-x-full mt-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-6 w-6 rounded-full",
                    message.feedback === 'liked' && 'bg-accent/20 text-accent'
                  )}
                  onClick={() => onFeedback(message.id, 'liked')}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-6 w-6 rounded-full",
                    message.feedback === 'disliked' && 'bg-destructive/20 text-destructive'
                  )}
                  onClick={() => onFeedback(message.id, 'disliked')}
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
