
'use client';
import { ArrowLeft, Mic, Send, User, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import { CreateEntryNoteForm } from '@/components/forms/create-entry-note-form';
import { Entry, EntryStatus, EntryType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


// Mock data
const mockPatient = { id: '1', name: 'Juan Pérez', diagnosis: 'Faringitis aguda' };
const mockEntries: Entry[] = [
    { id: 'e1', patientId: '1', authorId: 'n1', authorName: 'Enf. María López', type: 'observation', status: 'attention', note: 'Presenta fiebre de 38.5°C y dolor de garganta intenso.', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
    { id: 'e2', patientId: '1', authorId: 'n2', authorName: 'Enf. Carlos Ruiz', type: 'adverseEffect', status: 'note', note: 'Refiere náuseas leves tras la administración del antibiótico.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    { id: 'e3', patientId: '1', authorId: 'n1', authorName: 'Enf. María López', type: 'observation', status: 'ok', note: 'La temperatura ha bajado a 37.2°C. El paciente se siente mejor.', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) },
    { id: 'e4', patientId: '1', authorId: 'n2', authorName: 'Enf. Carlos Ruiz', type: 'complaint', status: 'note', note: 'Se queja de que la comida del hospital es insípida.', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
];


function getStatusBadgeVariant(status: EntryStatus) {
    switch (status) {
        case 'ok': return 'secondary';
        case 'attention': return 'destructive';
        case 'note': return 'default';
        default: return 'default';
    }
}

function getStatusText(status: EntryStatus) {
    switch (status) {
        case 'ok': return 'OK';
        case 'attention': return 'Atención';
        case 'note': return 'Nota';
    }
}

function getTypeDescription(type: EntryType) {
    switch (type) {
        case 'observation': return 'Observación';
        case 'adverseEffect': return 'Efecto Adverso';
        case 'complaint': return 'Queja';
    }
}


export default function PatientDetailPage() {
  const params = useParams();
  const lobbyId = params.id as string;
  const patientId = params.patientId as string;

  const handleNoteCreated = (values: { note: string; }) => {
    // TODO: Connect to Firestore to create a new entry
    console.log("New note created:", values);
  };
  

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-background border-b p-4 flex items-center justify-between sticky top-0 z-10">
        <div className='flex items-center gap-4'>
            <Button variant="outline" size="icon" asChild>
                <Link href={`/lobbies/${lobbyId}`}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="text-xl font-bold">{mockPatient.name}</h1>
                <p className="text-sm text-muted-foreground">{mockPatient.diagnosis}</p>
            </div>
        </div>
        {/* Actions for the patient can go here */}
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-40">
        {/* Timeline */}
        <div className="relative pl-8">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
            {mockEntries.map(entry => (
                <div key={entry.id} className="mb-8 relative">
                    <div className={cn(
                        "absolute left-4 top-1.5 w-3 h-3 rounded-full -translate-x-1/2",
                        entry.status === 'ok' && 'bg-green-500',
                        entry.status === 'attention' && 'bg-red-500',
                        entry.status === 'note' && 'bg-blue-500'
                    )}></div>
                    <div className="text-sm text-muted-foreground mb-1 ml-1 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Avatar className='h-5 w-5'>
                                <AvatarImage src={`https://i.pravatar.cc/40?u=${entry.authorId}`} alt={entry.authorName} />
                                <AvatarFallback>{entry.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{entry.authorName}</span>
                            <span>creó una entrada de <span className="font-semibold">{getTypeDescription(entry.type)}</span></span>
                         </div>
                         <span className='flex items-center gap-1'><Clock className="h-3 w-3" />{formatDistanceToNow(entry.timestamp, { addSuffix: true, locale: es })}</span>
                    </div>
                    <Card>
                        <CardHeader>
                           <Badge variant={getStatusBadgeVariant(entry.status)} className="w-fit">
                             {getStatusText(entry.status)}
                           </Badge>
                        </CardHeader>
                        <CardContent>
                           <p className="text-foreground">{entry.note}</p>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4 z-10">
        <CreateEntryNoteForm onNoteCreated={handleNoteCreated} />
      </footer>
    </div>
  );
}
