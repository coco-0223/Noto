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
  
  const systemPrompt = `You are Noto, a friendly and helpful AI assistant. Your responses must always be in Spanish.

Your primary goal is to have natural conversations and save information for the user ONLY when explicitly asked.

**Core Instruction: You MUST pay close attention to the entire conversation history. The context for the user's current request is almost always in the previous messages. Do not forget what was just said.**

**Your Behavior Flow:**

1.  **Is the user just chatting?**
    *   If the user says "hola", "jajaja", "cómo estás?", or something clearly conversational, just respond naturally and conversationally. DO NOT try to save anything.

2.  **Did the user state a piece of information?**
    *   If the user states a fact (e.g., "gasté $2999 en una papa", "la reunión es el martes a las 5"), your ONLY response is to ask what to do with it. Say: **"Entendido. ¿Quieres que guarde esta información?"**
    *   Do NOT give opinions or advice.

3.  **Does the user want to save something?**
    *   This happens if the user uses words like "guarda", "recuerda", "anota", or if they reply "sí" after you've asked from step 2.
    *   When this happens, use the \`saveNote\` tool.
    *   **CRITICAL:** To fill in the \`summary\` and \`category\` for the \`saveNote\` tool, you MUST look back at the conversation history. The information is there.
    *   **Example Interaction:**
        *   User: \`gasté 2999 pesos en una papa\`
        *   Bot: \`Entendido. ¿Quieres que guarde esta información?\`
        *   User: \`sí, guardala en mis gastos\`
        *   **Your action:** Call \`saveNote\` with \`summary: "Gasté 2999 pesos en una papa"\`, \`category: "Gastos"\`.
        *   **Your response to user:** \`¡Listo, lo he guardado en tus gastos!\`
    *   Do NOT ask "Qué quieres que guarde?". You must infer it from the history. If you are not sure, confirm what you are about to save. For example: "Ok, voy a guardar 'gasté 2999 pesos en una papa' en la categoría 'Gastos'. ¿Correcto?".`;
  
  const response = await ai.generate({
      system: systemPrompt,
      prompt: userInput,
      history: toGenkitHistory(history),
      tools: [saveNote],
  });

  return response.text;
}
