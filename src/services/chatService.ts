'use server';
import type { Conversation, Message, Memory, Reminder } from '@/lib/types';
import { db } from '@/lib/firebase';
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    orderBy, 
    getDocs, 
    where,
    limit,
    doc,
    updateDoc,
    Timestamp,
    getDoc,
    setDoc,
} from 'firebase/firestore';

function docToConversation(doc: any): Conversation {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
    } as Conversation;
}

export async function getConversations(): Promise<Conversation[]> {
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, orderBy('pinned', 'desc'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        // Create the first "General" conversation if none exist
        const generalConv = await getOrCreateConversation('General', true);
        const convDoc = await getDoc(doc(db, 'conversations', generalConv.id));
        return [docToConversation(convDoc)];
    }
    return snapshot.docs.map(docToConversation);
}

export async function getMessages(conversationId: string, count: number = 10): Promise<Message[]> {
    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(conversationRef, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
        } as Message;
    });
    return messages.reverse();
}

export async function addMessage(conversationId: string, message: { text: string; sender: 'user' | 'bot' }): Promise<Message> {
    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(conversationRef, 'messages');
    
    const messageData = {
        ...message,
        timestamp: serverTimestamp(),
    };

    const messageDocRef = await addDoc(messagesRef, messageData);
    
    // Update conversation's last message and timestamp
    await updateDoc(conversationRef, {
        lastMessage: message.text,
        timestamp: serverTimestamp()
    });

    return {
        ...message,
        id: messageDocRef.id,
        timestamp: new Date().toISOString() // Return optimistic timestamp
    };
}

export async function saveMemory(memory: { summary: string; category: string }): Promise<string> {
    const memoriesRef = collection(db, 'memories');
    const memoryData = {
        ...memory,
        createdAt: serverTimestamp()
    };
    const docRef = await addDoc(memoriesRef, memoryData);
    return docRef.id;
}


export async function getOrCreateConversation(category: string, pinned = false): Promise<Conversation> {
    const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('title', '==', normalizedCategory), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        return docToConversation(snapshot.docs[0]);
    }

    const newConvData = {
        title: normalizedCategory,
        lastMessage: `Se ha creado un nuevo chat para ${normalizedCategory}.`,
        timestamp: serverTimestamp(),
        pinned,
    };
    const docRef = await addDoc(conversationsRef, newConvData);
    
    return {
        id: docRef.id,
        ...newConvData,
        timestamp: Timestamp.now()
    };
}

export async function addReminder(reminder: { text: string, remindAt: string, conversationId: string }): Promise<string> {
    const remindersRef = collection(db, 'reminders');
    const reminderData = {
        ...reminder,
        triggerAt: Timestamp.fromDate(new Date(reminder.remindAt)),
        processed: false,
    };
    const docRef = await addDoc(remindersRef, reminderData);
    return docRef.id;
}

export async function searchReminders(): Promise<Reminder[]> {
    const remindersRef = collection(db, 'reminders');
    const q = query(remindersRef, where('processed', '==', false), orderBy('triggerAt', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Reminder));
}

export async function searchMemories(query?: string): Promise<Memory[]> {
    const memoriesRef = collection(db, 'memories');
    let q;
    if (query && query.trim() !== '') {
        // Firestore doesn't support case-insensitive search natively. A real app would use a 
        // third-party search service like Algolia or Typesense, or store a lowercase version of the summary.
        // For this demo, we'll fetch and filter, which is not scalable.
        q = query(memoriesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Memory))
               .filter(m => m.summary.toLowerCase().includes(query.toLowerCase()))
               .slice(0, 20);
    } else {
        q = query(memoriesRef, orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Memory));
    }
}


export async function getDueReminders(): Promise<Reminder[]> {
    const now = Timestamp.now();
    const remindersRef = collection(db, 'reminders');
    const q = query(remindersRef, where('processed', '==', false), where('triggerAt', '<=', now));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
}

export async function markRemindersAsProcessed(reminderIds: string[]): Promise<void> {
    const promises = reminderIds.map(id => {
        const reminderRef = doc(db, 'reminders', id);
        return updateDoc(reminderRef, { processed: true });
    });
    await Promise.all(promises);
}

export async function getAppState() {
    const appStateRef = doc(db, 'app_state', 'singleton');
    const docSnap = await getDoc(appStateRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
}

export async function updateAppState(data: any) {
    const appStateRef = doc(db, 'app_state', 'singleton');
    await setDoc(appStateRef, data, { merge: true });
}
