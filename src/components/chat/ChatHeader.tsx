'use client';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, ArrowLeft } from 'lucide-react';
import SettingsSheet from './SettingsSheet';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
    title: string;
    icon: React.ReactNode;
}

export default function ChatHeader({ title, icon }: Props) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <header className="flex items-center justify-between p-3 border-b bg-secondary/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Volver</span>
          </Button>
          <Avatar className='bg-secondary flex items-center justify-center'>
            {icon}
          </Avatar>
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
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
