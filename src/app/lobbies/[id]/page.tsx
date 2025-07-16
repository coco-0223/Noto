
'use client';
import { ArrowLeft, UserPlus, Users, Settings, Mail, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InviteNurseForm } from '@/components/forms/invite-nurse-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LobbyRole, Nurse } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

// Mock data for demonstration
const mockPatients = [
    { id: '1', name: 'Juan Pérez', diagnosis: 'Faringitis aguda', lastEntry: { text: 'Presenta fiebre de 38.5°C.', timestamp: 'Hace 5 min', status: 'attention' } },
    { id: '2', name: 'Ana Gómez', diagnosis: 'Migraña crónica', lastEntry: { text: 'Paciente estable, sin quejas.', timestamp: 'Hace 25 min', status: 'ok' } },
    { id: '3', name: 'Carlos Sánchez', diagnosis: 'Postoperatorio apendicectomía', lastEntry: { text: 'Refiere dolor en la zona de la incisión.', timestamp: 'Hace 1 hora', status: 'note' } },
];

const mockNurses: (Nurse & { role: LobbyRole })[] = [
    { id: 'n1', fullName: 'María López', email: 'maria@hospital.com', role: 'Admin' },
    { id: 'n2', fullName: 'Carlos Ruiz', email: 'carlos@hospital.com', role: 'Enfermero' },
    { id: 'n3', fullName: 'Ana García', email: 'ana@hospital.com', role: 'Espectador' },
]


function getRoleBadgeVariant(role: LobbyRole) {
    switch (role) {
        case 'Admin': return 'destructive';
        case 'Enfermero': return 'default';
        case 'Espectador': return 'secondary';
        default: return 'outline';
    }
}

export default function LobbyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lobbyId = params.id as string;
  
  // Mock data
  const lobbyName = `Ala Pediátrica`; // Example name

  const handleInviteSent = (values: { email: string; role: LobbyRole; }) => {
    // TODO: Connect to Firebase to send invitation
    console.log("Invite sent:", values);
  }

  return (
    <div className="flex flex-col h-screen bg-secondary/30">
        <header className="bg-background border-b p-4 flex items-center justify-between sticky top-0 z-10">
            <div className='flex items-center gap-4'>
                <Button variant="outline" size="icon" asChild>
                    <Link href="/lobbies">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-xl font-bold">{lobbyName}</h1>
                    <p className="text-sm text-muted-foreground">Lobby ID: {lobbyId}</p>
                </div>
            </div>
            {/* Action buttons for the lobby can go here */}
        </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Tabs defaultValue="patients">
            <TabsList>
                <TabsTrigger value="patients"><Users className="mr-2 h-4 w-4" /> Pacientes</TabsTrigger>
                <TabsTrigger value="admin"><Settings className="mr-2 h-4 w-4" /> Administración</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patients">
                <div className='flex items-center justify-end mb-4'>
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Añadir Paciente
                    </Button>
                </div>
                <div className="space-y-4">
                    {mockPatients.map((patient) => (
                        <Card key={patient.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push(`/lobbies/${lobbyId}/patients/${patient.id}`)}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{patient.name}</CardTitle>
                                        <CardDescription>{patient.diagnosis}</CardDescription>
                                    </div>
                                    <Badge variant={
                                        patient.lastEntry.status === 'ok' ? 'secondary' :
                                        patient.lastEntry.status === 'attention' ? 'destructive' :
                                        'default'
                                    }>
                                        {
                                            patient.lastEntry.status === 'ok' ? 'OK' :
                                            patient.lastEntry.status === 'attention' ? 'Atención' :
                                            'Nota'
                                        }
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic">"{patient.lastEntry.text}"</p>
                                <p className="text-xs text-right text-muted-foreground mt-2">{patient.lastEntry.timestamp}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="admin">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Administrar Enfermeros</CardTitle>
                                <CardDescription>
                                    Añade, elimina o modifica los roles de los enfermeros en este lobby.
                                </CardDescription>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Añadir Enfermero
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Invitar Enfermero al Lobby</DialogTitle>
                                        <DialogDescription>
                                            El enfermero recibirá una invitación por correo. Si no tiene una cuenta, se le pedirá que se registre.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <InviteNurseForm onInviteSent={handleInviteSent} />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <ul className="space-y-4">
                            {mockNurses.map(nurse => (
                                <li key={nurse.id} className="flex items-center justify-between p-3 rounded-md border bg-card">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={`https://i.pravatar.cc/40?u=${nurse.id}`} alt={nurse.fullName} />
                                            <AvatarFallback>{nurse.fullName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{nurse.fullName}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className='h-3 w-3' />{nurse.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={getRoleBadgeVariant(nurse.role)}>{nurse.role}</Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Editar Rol</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar del Lobby
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </li>
                            ))}
                       </ul>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
