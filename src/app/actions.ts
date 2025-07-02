'use server';

import { proactiveMemory } from '@/ai/flows/proactive-memory-prompt';
import { personalizeChatbotStyle } from '@/ai/flows/personalize-chatbot-style';
import * as chatService from '@/services/chatService';
import type { ChatHistory, Message } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function getBotResponse(userMessages: string[], conversationId: string) {
  try {
    const combinedInput = userMessages.join('\n');

    // 1. Save user messages individually
    for (const messageText of userMessages) {
        await chatService.addMessage(conversationId, { text: messageText, sender: 'user' });
    }

    // 2. Get conversation context
    const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
    const categoryId = conversationDoc.data()?.title || 'General';

    const recentMessages = await chatService.getMessages(conversationId, 10);
    const chatHistory: ChatHistory[] = recentMessages.map(m => ({
        role: m.sender,
        content: m.text,
    }));

    // 3. Call AI flow with the combined input
    const response = await proactiveMemory({
      userInput: combinedInput,
      chatHistory,
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
