// Types for Nursey App

export type Nurse = {
    id: string;
    email: string;
    fullName: string;
};

export type Lobby = {
    id: string;
    name: string;
    facility: string;
    patientCount: number;
    hasPassword?: boolean;
};

export type Patient = {
    id: string;
    name: string;
    roomNumber: string;
    // other patient details
};

export type Note = {
    id: string;
    text: string;
    authorId: string; // Nurse ID
    authorName: string;
    timestamp: Date;
    audioUrl?: string; // Link to the voice note if it exists
};
