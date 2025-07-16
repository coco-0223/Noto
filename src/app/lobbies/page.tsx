
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, LogOut, Hospital, Users, Lock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lobby } from '@/lib/types';
import { CreateLobbyForm } from '@/components/forms/create-lobby-form';


// Mock data, this will come from Firestore later
const initialLobbies: Lobby[] = [
  { id: '1', name: 'Ala Pediátrica', facility: 'Hospital General', patientCount: 12, hasPassword: true },
  { id: '2', name: 'Cuidados Intensivos', facility: 'Hospital Central', patientCount: 8, hasPassword: true },
  { id: '3', name: 'Maternidad', facility: 'Clínica Santa María', patientCount: 15, hasPassword: false },
  { id: '4', name: 'Geriatría', facility: 'Hospital General', patientCount: 25, hasPassword: false },
];

export default function LobbiesPage() {
    const router = useRouter();
    const [lobbies, setLobbies] = useState<Lobby[]>(initialLobbies);
    const [isCreateLobbyOpen, setCreateLobbyOpen] = useState(false);

    const handleJoinLobby = (lobbyId: string) => {
        // TODO: Handle password prompt if lobby.hasPassword is true
        // TODO: Cache password
        router.push(`/lobbies/${lobbyId}`);
    };
    
    const handleLogout = () => {
        // TODO: Implement Firebase logout
        router.push('/');
    };

    const handleLobbyCreated = (newLobby: Omit<Lobby, 'id' | 'patientCount'>) => {
        const lobbyWithId: Lobby = {
            ...newLobby,
            id: (lobbies.length + 1).toString(),
            patientCount: 0,
        };
        setLobbies(prevLobbies => [...prevLobbies, lobbyWithId]);
        setCreateLobbyOpen(false);
    };

  return (
    <div className="flex min-h-screen bg-secondary/30">
        <aside className="w-64 bg-background p-4 flex flex-col justify-between">
            <div>
                <h1 className="text-2xl font-bold mb-6 text-primary">Nursey</h1>
                <nav>
                    {/* Navigation items can go here later */}
                </nav>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
            </Button>
        </aside>

      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Lobbies de Pacientes</h2>
          <Dialog open={isCreateLobbyOpen} onOpenChange={setCreateLobbyOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Nuevo Lobby
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear un nuevo lobby</DialogTitle>
                    <DialogDescription>
                        Configura una nueva sala para gestionar pacientes. Puedes protegerla con una contraseña.
                    </DialogDescription>
                </DialogHeader>
                <CreateLobbyForm onLobbyCreated={handleLobbyCreated} />
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lobbies.map((lobby) => (
            <Card key={lobby.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{lobby.name}</span>
                    {lobby.hasPassword && <Lock className="h-4 w-4 text-muted-foreground" />}
                </CardTitle>
                <CardDescription className='flex items-center pt-1'>
                    <Hospital className="mr-2 h-4 w-4" />
                    {lobby.facility}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>{lobby.patientCount} pacientes</span>
              </CardContent>
              <div className="p-6 pt-0">
                <Button onClick={() => handleJoinLobby(lobby.id)} className="w-full">
                    Unirse al Lobby
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
