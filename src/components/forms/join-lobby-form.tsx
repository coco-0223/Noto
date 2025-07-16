
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { verifyLobbyPassword } from "@/app/actions";
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Verificando...' : 'Unirse al Lobby'}
    </Button>
  );
}

type JoinLobbyFormProps = {
    lobbyId: string;
}

export function JoinLobbyForm({ lobbyId }: JoinLobbyFormProps) {
  const [state, formAction] = useFormState(verifyLobbyPassword, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña del Lobby</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          placeholder="••••••••" 
          required 
        />
        <input type="hidden" name="lobbyId" value={lobbyId} />
      </div>
      {state?.message && (
         <p aria-live="polite" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
