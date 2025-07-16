'use server';

import { doc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { LOBBIES } from './lib/constants';

// Server action to verify lobby password securely
export async function verifyLobbyPassword(lobbyId: string, passwordAttempt: string): Promise<{ success: boolean; message: string }> {
    try {
        const lobbyRef = doc(db, LOBBIES, lobbyId);
        const lobbySnap = await getDoc(lobbyRef);

        if (!lobbySnap.exists()) {
            return { success: false, message: 'El lobby no existe.' };
        }

        const lobbyData = lobbySnap.data();

        if (lobbyData.password === passwordAttempt) {
            return { success: true, message: 'Contraseña correcta.' };
        } else {
            return { success: false, message: 'La contraseña es incorrecta.' };
        }
    } catch (error) {
        console.error("Error verifying lobby password:", error);
        return { success: false, message: 'Ocurrió un error en el servidor.' };
    }
}
