
'use client';

import { useEffect, useState } from 'react';
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
import { getLobbies } from '@/lib/firebase/lobbies';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { JoinLobbyForm } from '@/components/forms/join-lobby-form';
import { signOut } from '@/lib/firebase/auth';


export default function LobbiesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateLobbyOpen, setCreateLobbyOpen] = useState(false);
    const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);
    const [isJoinLobbyOpen, setJoinLobbyOpen] = useState(false);


    useEffect(() => {
        const unsubscribe = getLobbies(
            (lobbies) => {
                setLobbies(lobbies);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error fetching lobbies:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error al cargar lobbies',
                    description: 'No se pudieron obtener los lobbies desde la base de datos.',
                });
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [toast]);


    const handleJoinLobbyClick = (lobby: Lobby) => {
        if (lobby.hasPassword) {
            setSelectedLobby(lobby);
            setJoinLobbyOpen(true);
        } else {
            router.push(`/lobbies/${lobby.id}`);
        }
    };
    
    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    const handleLobbyCreated = () => {
        setCreateLobbyOpen(false);
        toast({
            title: 'Lobby creado',
            description: 'El nuevo lobby se ha creado exitosamente.',
        })
    };

    const handleSuccessfulJoin = (lobbyId: string) => {
        setJoinLobbyOpen(false);
        setSelectedLobby(null);
        router.push(`/lobbies/${lobbyId}`);
    };


  return (
    <div className="flex min-h-screen bg-secondary/30">
        <aside className="w-64 bg-background p-4 flex flex-col justify-between">
            <div>
                <h1 className="text-2xl font-bold mb-6 text-primary">Noto</h1>
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

        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-1/4" />
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lobbies.map((lobby) => (
                <Card key={lobby.id} className="flex flex-col">
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
                <CardContent className="flex-grow flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{lobby.patientCount} pacientes</span>
                </CardContent>
                <div className="p-6 pt-0">
                    <Button onClick={() => handleJoinLobbyClick(lobby)} className="w-full">
                        Unirse al Lobby
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                </Card>
            ))}
            </div>
        )}
      </main>

      {/* Join Lobby with Password Dialog */}
      <Dialog open={isJoinLobbyOpen} onOpenChange={setJoinLobbyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contraseña Requerida</DialogTitle>
            <DialogDescription>
              El lobby "{selectedLobby?.name}" está protegido. Por favor, introduce la contraseña para unirte.
            </DialogDescription>
          </DialogHeader>
          {selectedLobby && (
            <JoinLobbyForm 
              lobbyId={selectedLobby.id} 
              onSuccessfulJoin={handleSuccessfulJoin}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
