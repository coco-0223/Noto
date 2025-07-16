
'use client';
import { ArrowLeft, Mic, Send } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useParams } from 'next/navigation';

export default function LobbyDetailPage() {
  const params = useParams();
  const lobbyId = params.id as string;
  
  // Mock data
  const lobbyName = `Lobby ${lobbyId}`;

  return (
    <div className="flex h-screen bg-secondary/30">
      <main className="flex-1 flex flex-col">
        <header className="bg-background border-b p-4 flex items-center justify-between">
            <div className='flex items-center gap-4'>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/lobbies">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">{lobbyName}</h1>
            </div>
            {/* Action buttons for the lobby can go here */}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-3 gap-8">
            <div className="col-span-3 lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Notas del Turno</CardTitle>
                        <CardDescription>Transcripciones y notas de voz.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Here we will list the transcribed voice notes */}
                        <p className="text-muted-foreground text-sm text-center py-8">
                            Aún no hay notas para este turno.
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="col-span-3 lg:col-span-1">
                 <Card className="sticky top-8">
                    <CardHeader>
                        <CardTitle>Pacientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Patient list will go here */}
                        <p className="text-muted-foreground text-sm text-center py-8">
                            No hay pacientes asignados.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
        
        <footer className="bg-background border-t p-4">
            <div className="relative">
                <Textarea 
                    placeholder="Escribe una nota o usa el micrófono para transcribir..."
                    className="pr-20"
                />
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex items-center gap-2">
                    <Button size="icon" variant="ghost">
                        <Mic className="h-5 w-5"/>
                        <span className="sr-only">Grabar nota de voz</span>
                    </Button>
                    <Button size="icon">
                        <Send className="h-5 w-5"/>
                        <span className="sr-only">Enviar nota</span>
                    </Button>
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
}

