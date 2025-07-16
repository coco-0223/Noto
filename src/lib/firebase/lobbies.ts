import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { LOBBIES } from '@/lib/constants';
import type { Lobby } from '@/lib/types';

// Type for the data sent to Firestore when creating a lobby
type LobbyCreationData = Omit<Lobby, 'id' | 'patientCount'>;

// Function to add a new lobby to Firestore
export const addLobby = async (lobbyData: LobbyCreationData) => {
  const lobbyWithDefaults = {
    ...lobbyData,
    patientCount: 0,
    createdAt: serverTimestamp(),
  };
  await addDoc(collection(db, LOBBIES), lobbyWithDefaults);
};

// Function to get all lobbies from Firestore and listen for real-time updates
export const getLobbies = (
  onUpdate: (lobbies: Lobby[]) => void,
  onError: (error: Error) => void
) => {
  const lobbiesQuery = query(collection(db, LOBBIES), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(lobbiesQuery, (querySnapshot) => {
    const lobbies: Lobby[] = [];
    querySnapshot.forEach((doc) => {
      lobbies.push({ id: doc.id, ...doc.data() } as Lobby);
    });
    onUpdate(lobbies);
  }, (error) => {
    console.error("Error fetching lobbies: ", error);
    onError(new Error("Failed to fetch lobbies"));
  });

  return unsubscribe;
};
