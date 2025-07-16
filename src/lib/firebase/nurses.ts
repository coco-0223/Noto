// Firebase functions for nurse management will go here.
// For example: adding a nurse to a lobby, getting nurses for a lobby, etc.

import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, where, doc, setDoc } from 'firebase/firestore';
import { NURSES, LOBBIES, MEMBERS } from '@/lib/constants';
import type { Nurse, LobbyRole } from '@/lib/types';

/**
 * Adds a nurse to a specific lobby with a given role.
 * This function is simplified. In a real app, you'd handle sending an invitation email.
 */
export const addNurseToLobby = async (lobbyId: string, email: string, role: LobbyRole) => {
    // In a real app, you would first find the nurse's main document by email
    // to get their ID. For now, we'll use a placeholder.
    // This is a simplified version.
    const nurseId = `user_for_${email}`; // Placeholder
    
    const lobbyMemberRef = doc(db, LOBBIES, lobbyId, MEMBERS, nurseId);

    await setDoc(lobbyMemberRef, {
        email: email,
        role: role,
        joinedAt: new Date(),
    });
};

/**
 * Gets all nurses for a specific lobby.
 */
export const getNursesForLobby = (
    lobbyId: string,
    onUpdate: (nurses: Nurse[]) => void,
    onError: (error: Error) => void
) => {
    const membersQuery = query(collection(db, LOBBIES, lobbyId, MEMBERS));

    const unsubscribe = onSnapshot(membersQuery, (snapshot) => {
        const nurses: Nurse[] = [];
        // This is simplified. In a real app, you'd fetch the full nurse profile
        // for each member using their ID.
        snapshot.forEach((doc) => {
            const data = doc.data();
            nurses.push({
                id: doc.id,
                email: data.email,
                fullName: `Nurse ${doc.id.substring(0,5)}`, // Placeholder name
                role: data.role,
            });
        });
        onUpdate(nurses);
    }, (error) => {
        console.error("Error fetching lobby members:", error);
        onError(new Error("Failed to fetch lobby members"));
    });

    return unsubscribe;
};
