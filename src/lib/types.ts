// Types for Nursey App

export type Nurse = {
    id: string;
    email: string;
    fullName: string;
    // TO-DO: Add permissions later
    // permissions: {
    //     [lobbyId: string]: 'admin' | 'editor' | 'viewer';
    // }
};

export type Lobby = {
    id: string;
    name: string;
    facility: string;
    patientCount: number;
    hasPassword?: boolean;
    password?: string;
};

export type Patient = {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    diagnosis: string;
    lobbyId: string;
};

export type EntryType = "observation" | "adverseEffect" | "complaint";
export type EntryStatus = "ok" | "attention" | "note";

export type Entry = {
    id: string;
    patientId: string;
    authorId: string; // Nurse ID
    authorName: string;
    type: EntryType;
    status: EntryStatus;
    note?: string; // Only if status is 'note'
    audioUrl?: string; // Link to the voice note if it exists
    timestamp: Date;
};
