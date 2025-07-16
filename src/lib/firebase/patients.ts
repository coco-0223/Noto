import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { LOBBIES, PATIENTS } from '@/lib/constants';
import type { Patient } from '@/lib/types';

// Type for the data sent to Firestore when creating a patient
type PatientCreationData = Omit<Patient, 'id' | 'lobbyId' | 'lastEntry'>;

// Function to add a new patient to a lobby's subcollection
export const addPatient = async (lobbyId: string, patientData: PatientCreationData) => {
  const lobbyRef = doc(db, LOBBIES, lobbyId);
  const patientsCollectionRef = collection(lobbyRef, PATIENTS);
  
  const patientWithDefaults = {
    ...patientData,
    createdAt: serverTimestamp(),
  };

  await addDoc(patientsCollectionRef, patientWithDefaults);

  // Increment the patientCount in the lobby document
  await updateDoc(lobbyRef, {
      patientCount: increment(1)
  });
};

// Function to get all patients for a lobby and listen for real-time updates
export const getPatients = (
  lobbyId: string,
  onUpdate: (patients: Patient[]) => void,
  onError: (error: Error) => void
) => {
  const patientsQuery = query(collection(db, LOBBIES, lobbyId, PATIENTS), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(patientsQuery, (querySnapshot) => {
    const patients: Patient[] = [];
    querySnapshot.forEach((doc) => {
      patients.push({ id: doc.id, lobbyId: lobbyId, ...doc.data() } as Patient);
    });
    onUpdate(patients);
  }, (error) => {
    console.error("Error fetching patients: ", error);
    onError(new Error("Failed to fetch patients"));
  });

  return unsubscribe;
};
