'use server';

import { chat } from '@/ai/flows/chat-flow';
import { personalizeChatbotStyle } from '@/ai/flows/personalize-chatbot-style';
import * as chatService from '@/services/chatService';
import type { ChatHistory, Message } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getBotResponse(userMessages: string[], conversationId: string) {
  try {
    const combinedInput = userMessages.join('\n');

    // 1. Save user messages individually
    for (const messageText of userMessages) {
        await chatService.addMessage(conversationId, { text: messageText, sender: 'user' });
    }

    // 2. Get conversation context
    const recentMessages = await chatService.getMessages(conversationId, 10);
    const chatHistory: ChatHistory[] = recentMessages.map(m => ({
        role: m.sender,
        content: m.text,
    }));

    // 3. Call the new, simple AI flow
    const chatbotResponse = await chat(combinedInput, chatHistory);

    // 4. Save bot response
    const botMessage = await chatService.addMessage(conversationId, {
      text: chatbotResponse,
      sender: 'bot',
    });
    
    revalidatePath(`/chat/${conversationId}`);

    // Return a simplified response, as we are no longer saving memories automatically.
    return {
      success: true,
      data: {
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
