'use server';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LOBBIES } from '@/lib/constants';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const formSchema = z.object({
  password: z.string(),
  lobbyId: z.string(),
});

type State = {
  message: string;
}

export async function verifyLobbyPassword(
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    const { password, lobbyId } = formSchema.parse({
      password: formData.get('password'),
      lobbyId: formData.get('lobbyId'),
    });

    if (!lobbyId || !password) {
      return { message: 'ID de lobby o contraseña no proporcionados.' };
    }

    const lobbyRef = doc(db, LOBBIES, lobbyId);
    const lobbySnap = await getDoc(lobbyRef);

    if (!lobbySnap.exists()) {
      return { message: 'El lobby no existe.' };
    }

    const lobbyData = lobbySnap.data();

    if (lobbyData.password !== password) {
      return { message: 'La contraseña es incorrecta.' };
    }
  } catch (error) {
    console.error('Error verifying lobby password:', error);
    return { message: 'Ocurrió un error en el servidor.' };
  }
  
  // If password is correct, redirect on the server
  const lobbyId = formData.get('lobbyId') as string;
  redirect(`/lobbies/${lobbyId}`);
}
