'use server';
import { db } from '@/lib/firebase-admin';
import type { Conversation, Message, Memory } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

const conversationsCollection = db.collection('conversations');

export async function getConversations(): Promise<Conversation[]> {
    const snapshot = await conversationsCollection.orderBy('pinned', 'desc').orderBy('lastMessageTimestamp', 'desc').get();

    if (snapshot.empty) {
        console.log('No conversations found, creating initial "General" chat.');
        const generalConv = {
            title: 'General',
            lastMessage: '¡Hola! ¿Cómo te fue el día?',
            lastMessageTimestamp: Timestamp.now(),
            pinned: true,
        };
        const docRef = await conversationsCollection.add(generalConv);
        const doc = await docRef.get();
        const data = doc.data()!;
        return [{
            id: doc.id,
            title: data.title,
            lastMessage: data.lastMessage,
            timestamp: (data.lastMessageTimestamp as Timestamp).toDate().toISOString(),
            pinned: data.pinned
        }];
    }

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            lastMessage: data.lastMessage,
            timestamp: (data.lastMessageTimestamp as Timestamp).toDate().toISOString(),
            pinned: data.pinned,
        } as Conversation;
    });
}

export async function getMessages(conversationId: string): Promise<Message[]> {
    const snapshot = await conversationsCollection.doc(conversationId).collection('messages').orderBy('timestamp', 'asc').limit(50).get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            text: data.text,
            sender: data.sender,
            timestamp: (data.timestamp as Timestamp).toDate().toISOString(),
        } as Message;
    });
}

export async function addMessage(conversationId: string, message: { text: string; sender: 'user' | 'bot' }) {
     const messageWithTimestamp = { ...message, timestamp: Timestamp.now() };
     await conversationsCollection.doc(conversationId).collection('messages').add(messageWithTimestamp);
     await conversationsCollection.doc(conversationId).update({
         lastMessage: message.text,
         lastMessageTimestamp: messageWithTimestamp.timestamp
     });
}

export async function saveMemory(memory: { summary: string; category: string }): Promise<string> {
    const memoryWithTimestamp = { ...memory, createdAt: Timestamp.now() };
    const docRef = await db.collection('memories').add(memoryWithTimestamp);
    return docRef.id;
}

export async function getOrCreateConversation(category: string): Promise<string> {
    if (!category || category === 'General') {
        const generalSnapshot = await conversationsCollection.where('title', '==', 'General').limit(1).get();
        if(!generalSnapshot.empty) return generalSnapshot.docs[0].id;
    }

    const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    const snapshot = await conversationsCollection.where('title', '==', normalizedCategory).limit(1).get();
    
    if (!snapshot.empty) {
        return snapshot.docs[0].id;
    } else {
        const newConv = {
            title: normalizedCategory,
            lastMessage: `Se ha creado un nuevo chat para ${normalizedCategory}.`,
            lastMessageTimestamp: Timestamp.now(),
            pinned: false,
        };
        const docRef = await conversationsCollection.add(newConv);
        return docRef.id;
    }
}

export async function searchMemories(query?: string): Promise<Memory[]> {
    // This is a simple implementation. A real app would use a vector search for better results.
    const snapshot = await db.collection('memories').orderBy('createdAt', 'desc').limit(20).get();
     return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            summary: data.summary,
            category: data.category,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        } as Memory
    });
}
