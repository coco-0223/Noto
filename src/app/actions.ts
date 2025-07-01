'use server';

import { proactiveMemory } from '@/ai/flows/proactive-memory-prompt';
import type { ChatHistory } from '@/lib/types';
import { personalizeChatbotStyle } from '@/ai/flows/personalize-chatbot-style';

export async function getBotResponse(
  userInput: string,
  chatHistory: ChatHistory[]
) {
  try {
    const response = await proactiveMemory({
      userInput,
      chatHistory,
    });
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to get response from AI.',
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
