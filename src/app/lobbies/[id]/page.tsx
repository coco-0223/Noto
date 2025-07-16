
'use client';
import { ArrowLeft, PlusCircle, UserPlus, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const mockPatients = [
    { id: '1', name: 'Juan Pérez', diagnosis: 'Faringitis aguda', lastEntry: { text: 'Presenta fiebre de 38.5°C.', timestamp: 'Hace 5 min', status: 'attention' } },
    { id: '2', name: 'Ana Gómez', diagnosis: 'Migraña crónica', lastEntry: { text: 'Paciente estable, sin quejas.', timestamp: 'Hace 25 min', status: 'ok' } },
    { id: '3', name: 'Carlos Sánchez', diagnosis: 'Postoperatorio apendicectomía', lastEntry: { text: 'Refiere dolor en la zona de la incisión.', timestamp: 'Hace 1 hora', status: 'note' } },
];


export default function LobbyDetailPage() {
  const params = useParams();
  const lobbyId = params.id as string;
  
  // Mock data
  const lobbyName = `Ala Pediátrica`; // Example name

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
            <div className="flex items-center justify-between mb-4">
                <TabsList>
                    <TabsTrigger value="patients"><Users className="mr-2 h-4 w-4" /> Pacientes</TabsTrigger>
                    <TabsTrigger value="admin"><Settings className="mr-2 h-4 w-4" /> Administración</TabsTrigger>
                </TabsList>
                 <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Añadir Paciente
                </Button>
            </div>
            
            <TabsContent value="patients">
                <div className="space-y-4">
                    {mockPatients.map((patient) => (
                        <Card key={patient.id} className="cursor-pointer hover:shadow-lg transition-shadow">
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
                        <CardTitle>Administrar Enfermeros y Permisos</CardTitle>
                        <CardDescription>
                            Añade, elimina o modifica los roles de los enfermeros en este lobby.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm text-center py-8">
                            La gestión de enfermeros estará disponible próximamente.
                        </p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

