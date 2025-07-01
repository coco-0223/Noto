'use server';

import { proactiveMemory } from '@/ai/flows/proactive-memory-prompt';
import { personalizeChatbotStyle } from '@/ai/flows/personalize-chatbot-style';
import * as chatService from '@/services/chatService';
import type { ChatHistory, Message } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function getBotResponse(userInput: string, conversationId: string) {
  try {
    // 1. Save user message
    const userMessage = await chatService.addMessage(conversationId, { text: userInput, sender: 'user' });

    // 2. Get conversation context
    // In a real app, getting messages for history would be more complex and paginated.
    // For now, we'll keep it simple, but this is not scalable.
    const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
    const categoryId = conversationDoc.data()?.title || 'General';

    // 3. Call AI flow
    const response = await proactiveMemory({
      userInput,
      chatHistory: [], // Keeping this empty for simplicity for now. A real implementation would fetch recent messages.
      categoryId,
      now: new Date().toISOString(),
    });

    // 4. Save bot response
    const botMessage = await chatService.addMessage(conversationId, {
      text: response.chatbotResponse,
      sender: 'bot',
    });
    
    // 5. Save memory if any
    if (response.informationSummary) {
      const createdConv = await chatService.getOrCreateConversation(response.category);
      
      await chatService.saveMemory({
        summary: response.informationSummary,
        category: response.category,
      });

      if (createdConv.id !== conversationId && response.category !== categoryId) {
         revalidatePath('/');
      }
    }
    
    // 6. Save reminder if any
    if (response.reminder) {
        await chatService.addReminder({
            ...response.reminder,
            conversationId: conversationId,
        });
    }

    revalidatePath(`/chat/${conversationId}`);

    return {
      success: true,
      data: {
        ...response,
        userMessage,
        botMessage,
      },
    };
  } catch (error) {
    console.error('Error in getBotResponse:', error);
    const errorMessage = 'Failed to get response from AI.';
    await chatService.addMessage(conversationId, { text: errorMessage, sender: 'bot' });
    revalidatePath(`/chat/${conversationId}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updatePersona(exampleTexts: string[], currentPersona?: string) {
    try {
        const response = await personalizeChatbotStyle({
            exampleTexts,
            chatbotPersona: currentPersona
        });
        return {
            success: true,
            data: response
        }
    } catch(error) {
        console.error(error);
        return {
            success: false,
            error: "Failed to update persona"
        }
    }
}
