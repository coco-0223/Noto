
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, LogOut, Hospital, Users, Lock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data, this will come from Firestore later
const lobbies = [
  { id: '1', name: 'Ala Pediátrica', facility: 'Hospital General', patients: 12, requiresPassword: true },
  { id: '2', name: 'Cuidados Intensivos', facility: 'Hospital Central', patients: 8, requiresPassword: true },
  { id: '3', name: 'Maternidad', facility: 'Clínica Santa María', patients: 15, requiresPassword: false },
  { id: '4', name: 'Geriatría', facility: 'Hospital General', patients: 25, requiresPassword: false },
];

export default function LobbiesPage() {
    const router = useRouter();

    const handleJoinLobby = (lobbyId: string) => {
        // TODO: Handle password prompt if lobby.requiresPassword is true
        // TODO: Cache password
        router.push(`/lobbies/${lobbyId}`);
    };
    
    const handleLogout = () => {
        // TODO: Implement Firebase logout
        router.push('/');
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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Nuevo Lobby
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lobbies.map((lobby) => (
            <Card key={lobby.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{lobby.name}</span>
                    {lobby.requiresPassword && <Lock className="h-4 w-4 text-muted-foreground" />}
                </CardTitle>
                <CardDescription className='flex items-center pt-1'>
                    <Hospital className="mr-2 h-4 w-4" />
                    {lobby.facility}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>{lobby.patients} pacientes</span>
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
