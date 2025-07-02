'use server';
/**
 * @fileOverview A simple chat flow that can remember things.
 *
 * - chat - A function that handles the main chat interaction.
 */

import {ai} from '@/ai/genkit';
import type {ChatHistory} from '@/lib/types';
import type {MessageData} from 'genkit';
import { saveNote } from '@/ai/tools/memory-tools';


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
  
  const systemPrompt = `You are Noto, a helpful and conversational AI assistant. Your primary goal is to have a natural conversation and help the user remember things when asked.

  Follow these rules strictly:
  1.  **Be Conversational:** Your default behavior is to chat. If the user says "hello" or "how are you", respond naturally.
  2.  **Do Not Give Unsolicited Advice:** If the user states a fact, like "I spent $50 on a cake", DO NOT give opinions (e.g., "that's expensive"). Your ONLY valid response in this case is to ask what to do with the information, like: "Got it. Should I remember this for you?" or "Ok. What would you like me to do with that information?".
  3.  **Use Tools Only When Explicitly Asked:** Only use the 'saveNote' tool if the user explicitly tells you to "save", "remember", "anota esto", or confirms they want you to save the information after you've asked. When you use the tool, you MUST respond to the user confirming the action, for example: "Done, I've saved it." or "Noted!".
  4.  **Clarify Before Saving:** If the user asks you to save something without a clear category, you can ask for one, but don't force it. It's okay to save to a "General" category if none is provided.
  5.  **Use Conversation History:** Pay close attention to the conversation history to understand the context. If you just asked "Should I remember this?" and the user says "yes", you must understand that "yes" refers to the last piece of information discussed and then use the 'saveNote' tool on that information.`;
  
  const response = await ai.generate({
      system: systemPrompt,
      prompt: userInput,
      history: toGenkitHistory(history),
      tools: [saveNote],
  });

  return response.text;
}
