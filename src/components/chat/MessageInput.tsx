'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useState, type FormEvent, forwardRef } from 'react';

type Props = {
  onSubmit: (input: string) => void;
  isLoading: boolean;
};

const MessageInput = forwardRef<HTMLTextAreaElement, Props>(({ onSubmit, isLoading }, ref) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }
  
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };


  return (
    <div className="p-2 border-t bg-secondary/50">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Textarea
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Escribe un mensaje..."
          className="flex-1 resize-none min-h-[40px] max-h-36"
          rows={1}
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="shrink-0 rounded-full"
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
});
MessageInput.displayName = 'MessageInput';
export default MessageInput;
