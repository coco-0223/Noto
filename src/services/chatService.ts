'use server';
import type { Conversation, Message, Memory } from '@/lib/types';

// In-memory store
let conversations: Conversation[] = [
    {
        id: '1',
        title: 'General',
        lastMessage: '¡Hola! ¿Cómo te fue el día?',
        timestamp: new Date().toISOString(),
        pinned: true,
    }
];
let messages: { [conversationId: string]: Message[] } = {
    '1': []
};
let memories: Memory[] = [];

let nextConvId = 2;
let nextMsgId = 1;
let nextMemId = 1;


export async function getConversations(): Promise<Conversation[]> {
    // sort by pinned then by timestamp
    return [...conversations].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
}

export async function getMessages(conversationId: string): Promise<Message[]> {
    return messages[conversationId] || [];
}

export async function addMessage(conversationId: string, message: { text: string; sender: 'user' | 'bot' }): Promise<Message> {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
        throw new Error(`Conversation with id ${conversationId} not found.`);
    }
    const newMessage: Message = {
        ...message,
        id: (nextMsgId++).toString(),
        timestamp: new Date().toISOString()
    };
    if (!messages[conversationId]) {
        messages[conversationId] = [];
    }
    messages[conversationId].push(newMessage);

    conversation.lastMessage = message.text;
    conversation.timestamp = newMessage.timestamp;

    return newMessage;
}

export async function saveMemory(memory: { summary: string; category: string }): Promise<string> {
    const newMemory: Memory = {
        ...memory,
        id: (nextMemId++).toString(),
        createdAt: new Date().toISOString()
    };
    memories.push(newMemory);
    return newMemory.id!;
}

export async function getOrCreateConversation(category: string): Promise<string> {
    const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    let conversation = conversations.find(c => c.title === normalizedCategory);

    if (conversation) {
        return conversation.id;
    }

    const newConv: Conversation = {
        id: (nextConvId++).toString(),
        title: normalizedCategory,
        lastMessage: `Se ha creado un nuevo chat para ${normalizedCategory}.`,
        timestamp: new Date().toISOString(),
        pinned: false,
    };
    conversations.push(newConv);
    messages[newConv.id] = [];
    return newConv.id;
}

export async function searchMemories(query?: string): Promise<Memory[]> {
    // This is a simple implementation. A real app would use a vector search for better results.
    let results = [...memories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (query && query.trim() !== '') {
         results = results.filter(m => m.summary.toLowerCase().includes(query.toLowerCase()));
    }
    return results.slice(0, 20);
}
