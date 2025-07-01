'use server';
/**
 * @fileOverview A proactive memory AI agent that proactively asks the user about their day and records important information.
 *
 * - proactiveMemory - A function that handles the proactive memory process.
 * - ProactiveMemoryInput - The input type for the proactiveMemory function.
 * - ProactiveMemoryOutput - The return type for the proactiveMemory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProactiveMemoryInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input to be processed and stored in memory.'),
  chatHistory: z.array(z.object({role: z.enum(['user', 'bot']), content: z.string()})).optional().describe('The chat history between the user and the bot.'),
  categoryId: z.string().optional().describe('The category context of the current chat.'),
});
export type ProactiveMemoryInput = z.infer<typeof ProactiveMemoryInputSchema>;

const ProactiveMemoryOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot response to the user input.'),
  informationSummary: z.string().describe('A summary of the important information extracted from the user input. Empty if none.'),
  category: z.enum(['General', 'Ideas', 'Tareas', 'Recetas', 'Eventos', 'Cumpleaños']).describe('The category for this information. Defaults to General.'),
});
export type ProactiveMemoryOutput = z.infer<typeof ProactiveMemoryOutputSchema>;

export async function proactiveMemory(input: ProactiveMemoryInput): Promise<ProactiveMemoryOutput> {
  return proactiveMemoryFlow(input);
}

const proactiveMemoryPrompt = ai.definePrompt({
  name: 'proactiveMemoryPrompt',
  input: {schema: ProactiveMemoryInputSchema},
  output: {schema: ProactiveMemoryOutputSchema},
  prompt: `You are a proactive chatbot that aims to engage the user in conversation and record important information such as recipes, birthdays, and events. Your response must be text-only. Do not generate images, videos, or files. Do not use external information from the internet. Only use the information provided in the chat history and the current user input.

  The user is currently in the '{{categoryId | default: 'General'}}' chat category.

  Here's the chat history so far:
  {{#each chatHistory}}
  {{#if (eq role "user")}}
  User: {{{content}}}
  {{else}}
  Chatbot: {{{content}}}
  {{/if}}
  {{/each}}

  Based on the user input:
  {{userInput}}

  1.  Respond to the user in a way that mimics a human-like conversation style. Try to mimic the user's style based on previous turns.
  2.  Identify and extract any important information (recipes, birthdays, events, ideas, tasks, etc.) from the user input.
  3.  Provide a concise summary of the extracted information. If no important information is found, leave the summary empty.
  4.  Categorize the information into one of the following: General, Ideas, Tareas, Recetas, Eventos, Cumpleaños. If the user is already in a specific category, prefer that one unless the new information clearly belongs elsewhere. If no specific category fits, use 'General'.

  Ensure the chatbotResponse is engaging and natural. Do not ask the user for their name or other personally identifying information.
  `,
});

const proactiveMemoryFlow = ai.defineFlow(
  {
    name: 'proactiveMemoryFlow',
    inputSchema: ProactiveMemoryInputSchema,
    outputSchema: ProactiveMemoryOutputSchema,
  },
  async input => {
    const {output} = await proactiveMemoryPrompt(input);
    return output!;
  }
);
