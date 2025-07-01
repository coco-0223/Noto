'use client';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Message } from '@/lib/types';

export default function useChatMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
        setMessages([]);
        setLoading(false);
        return;
    }

    setLoading(true);

    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(conversationRef, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Message));
      setMessages(newMessages);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching chat messages:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  return { messages, setMessages, loading };
}
