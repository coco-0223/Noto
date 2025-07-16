
'use client';
import { ArrowLeft, UserPlus, Users, Settings, Mail, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { Patient, Lobby, Nurse, LobbyRole } from '@/lib/types';
import { getPatients, addPatient } from '@/lib/firebase/patients';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreatePatientForm } from '@/components/forms/create-patient-form';
import { InviteNurseForm } from '@/components/forms/invite-nurse-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

// Mock data for demonstration - to be replaced with Firestore data
const mockNurses = [
    { id: 'n1', fullName: 'María López', email: 'maria.lopez@hospital.com', role: 'Admin' as LobbyRole },
    { id: 'n2', fullName: 'Carlos Ruiz', email: 'carlos.ruiz@hospital.com', role: 'Enfermero' as LobbyRole },
    { id: 'n3', fullName: 'Ana Gómez', email: 'ana.gomez@hospital.com', role: 'Enfermero' as LobbyRole },
];


export default function LobbyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const lobbyId = params.id as string;
  
  const [lobby, setLobby] = useState<Lobby | null>(null); // In a real app, you'd fetch this
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPatientOpen, setAddPatientOpen] = useState(false);
  const [isInviteNurseOpen, setInviteNurseOpen] = useState(false);
  
  useEffect(() => {
    if (!lobbyId) return;

    // TODO: Fetch lobby details as well
    // For now, we'll just use the ID and generate a mock name
    setLobby({ id: lobbyId, name: `Ala Pediátrica`, facility: 'Hospital General', patientCount: patients.length });

    const unsubscribe = getPatients(
        lobbyId,
        (loadedPatients) => {
            setPatients(loadedPatients);
            setIsLoading(false);
        },
        (error) => {
            console.error("Error fetching patients:", error);
            toast({
                variant: 'destructive',
                title: 'Error al cargar pacientes',
                description: 'No se pudieron obtener los pacientes desde la base de datos.',
            });
            setIsLoading(false);
        }
    );

    return () => unsubscribe();
  }, [lobbyId, toast, patients.length]);

  const handlePatientCreated = async (patientData: Omit<Patient, 'id' | 'lobbyId' | 'lastEntry'>) => {
    try {
        await addPatient(lobbyId, patientData);
        toast({
            title: 'Paciente añadido',
            description: `${patientData.firstName} ${patientData.lastName} ha sido añadido al lobby.`,
        });
        setAddPatientOpen(false);
    } catch(error) {
        console.error("Error adding patient:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo añadir al paciente. Inténtalo de nuevo.',
        });
    }
  };

  const handleInviteSent = (values: { email: string; role: LobbyRole; }) => {
    console.log("Invite sent:", values);
    // TODO: Connect to Firebase to add nurse to lobby
     toast({
        title: 'Invitación Enviada',
        description: `Se ha enviado una invitación a ${values.email} para unirse como ${values.role}.`,
    });
    setInviteNurseOpen(false);
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
                    <h1 className="text-xl font-bold">{lobby?.name || 'Cargando...'}</h1>
                    <p className="text-sm text-muted-foreground">Lobby ID: {lobbyId}</p>
                </div>
            </div>
            {/* Action buttons for the lobby can go here */}
        </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Tabs defaultValue="patients">
            <TabsList className='mb-4'>
                <TabsTrigger value="patients"><Users className="mr-2 h-4 w-4" /> Pacientes ({patients.length})</TabsTrigger>
                <TabsTrigger value="admin"><Settings className="mr-2 h-4 w-4" /> Administración</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patients">
                <div className='flex items-center justify-end mb-4'>
                    <Dialog open={isAddPatientOpen} onOpenChange={setAddPatientOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Añadir Paciente
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Añadir Nuevo Paciente</DialogTitle>
                                <DialogDescription>
                                    Introduce los detalles del nuevo paciente para registrarlo en este lobby.
                                </DialogDescription>
                            </DialogHeader>
                            <CreatePatientForm lobbyId={lobbyId} onPatientCreated={handlePatientCreated} />
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="space-y-4">
                    {isLoading ? (
                        <p>Cargando pacientes...</p>
                    ) : patients.length === 0 ? (
                        <Card className='text-center py-10'>
                            <CardContent>
                                <Users className='mx-auto h-12 w-12 text-muted-foreground' />
                                <h3 className='mt-4 text-lg font-medium'>No hay pacientes</h3>
                                <p className='mt-1 text-sm text-muted-foreground'>Añade el primer paciente para empezar.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        patients.map((patient) => (
                            <Card key={patient.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push(`/lobbies/${lobbyId}/patients/${patient.id}`)}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{patient.firstName} {patient.lastName}</CardTitle>
                                            <CardDescription>{patient.diagnosis}</CardDescription>
                                        </div>
                                        {/* This badge will be dynamic based on the last entry */}
                                        <Badge variant={
                                            !patient.lastEntry || patient.lastEntry.status === 'note' ? 'default' :
                                            patient.lastEntry.status === 'ok' ? 'secondary' :
                                            'destructive'
                                        }>
                                            {
                                                !patient.lastEntry ? 'Sin Entradas' :
                                                patient.lastEntry.status === 'ok' ? 'OK' :
                                                patient.lastEntry.status === 'attention' ? 'Atención' :
                                                'Nota'
                                            }
                                        </Badge>
                                    </div>
                                </CardHeader>
                                {patient.lastEntry && (
                                     <CardContent>
                                        <p className="text-sm text-muted-foreground italic">"{patient.lastEntry.text}"</p>
                                        <p className="text-xs text-right text-muted-foreground mt-2">{patient.lastEntry.timestamp}</p>
                                    </CardContent>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </TabsContent>

            <TabsContent value="admin">
                <Card>
                    <CardHeader className='flex-row items-center justify-between'>
                        <div>
                            <CardTitle>Administrar Enfermeros</CardTitle>
                            <CardDescription>
                                Añade, elimina o modifica los roles de los enfermeros en este lobby.
                            </CardDescription>
                        </div>
                         <Dialog open={isInviteNurseOpen} onOpenChange={setInviteNurseOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Añadir Enfermero
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Invitar Enfermero al Lobby</DialogTitle>
                                    <DialogDescription>
                                        Introduce el correo y asigna un rol al enfermero que quieres invitar.
                                    </DialogDescription>
                                </DialogHeader>
                                <InviteNurseForm onInviteSent={handleInviteSent} />
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockNurses.map((nurse) => (
                                <TableRow key={nurse.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://i.pravatar.cc/40?u=${nurse.email}`} />
                                                <AvatarFallback>{nurse.fullName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{nurse.fullName}</div>
                                                <div className="text-sm text-muted-foreground">{nurse.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={nurse.role === 'Admin' ? 'default' : 'secondary'}>{nurse.role}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Editar Rol</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">Eliminar del Lobby</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
