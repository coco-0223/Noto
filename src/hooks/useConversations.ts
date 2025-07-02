'use client';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Conversation } from '@/lib/types';
import { getOrCreateConversation } from '@/services/chatService';

export default function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
         // Create the first "General" conversation if none exist
         const generalConv = await getOrCreateConversation('General', true);
         setConversations([generalConv]);
      } else {
        const convs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        } as Conversation));
        setConversations(convs);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching conversations:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { conversations, loading };
}
