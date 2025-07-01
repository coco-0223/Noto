'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import SettingsSheet from './SettingsSheet';
import { useState } from 'react';

export default function ChatHeader() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between p-3 border-b bg-secondary/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="logo robot" alt="Noto Bot" />
            <AvatarFallback>NB</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-base font-semibold text-foreground">Noto</h2>
            <p className="text-xs text-muted-foreground">en línea</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
          <MoreVertical className="w-5 h-5" />
          <span className="sr-only">Ajustes</span>
        </Button>
      </header>
      <SettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
