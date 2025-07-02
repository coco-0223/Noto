'use server';
/**
 * @fileOverview A simple chat flow.
 *
 * - chat - A function that handles the main chat interaction.
 */

import {ai} from '@/ai/genkit';
import type {ChatHistory} from '@/lib/types';
import type {MessageData} from 'genkit';

// Map our ChatHistory type to Genkit's MessageData type
function toGenkitHistory(history: ChatHistory[]): MessageData[] {
    // Genkit expects user/model roles, and the last message from the user is handled separately.
    const genkitHistory = history.map(h => ({
        role: h.role === 'bot' ? 'model' : 'user',
        content: [{text: h.content}]
    }));
    // Remove the last message if it's from the user, as it's the current input
    if (genkitHistory.length > 0 && genkitHistory[genkitHistory.length - 1].role === 'user') {
        genkitHistory.pop();
    }
    return genkitHistory as MessageData[];
}


export async function chat(userInput: string, history: ChatHistory[]): Promise<string> {
  
  const response = await ai.generate({
      prompt: userInput,
      history: toGenkitHistory(history),
  });

  return response.text;
}
