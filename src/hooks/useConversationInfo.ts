'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Conversation } from '@/lib/types';
import * as C from '@/lib/constants';

export default function useConversationInfo(conversationId: string | null) {
  const [info, setInfo] = useState<Partial<Conversation> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
        setInfo(null);
        setLoading(false);
        return;
    }

    setLoading(true);
    const docRef = doc(db, C.CONVERSATIONS, conversationId);

    const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            setInfo({ id: doc.id, ...doc.data() } as Conversation);
        } else {
            console.error("Conversation not found");
            setInfo(null);
        }
        setLoading(false);
    }, (error) => {
        console.error("Error fetching conversation info:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  return { info, loading };
}
