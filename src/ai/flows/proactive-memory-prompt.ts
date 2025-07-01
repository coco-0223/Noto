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
  now: z.string().datetime().describe("The current date and time in ISO 8601 format, to be used as a reference for time-based queries."),
});
export type ProactiveMemoryInput = z.infer<typeof ProactiveMemoryInputSchema>;

const ProactiveMemoryOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot response to the user input.'),
  informationSummary: z.string().describe('A concise, factual summary of the information to be stored. Empty if none.'),
  category: z.enum(['General', 'Ideas', 'Tareas', 'Recetas', 'Eventos', 'Cumpleaños', 'Recordatorios']).describe('The category for this information. Defaults to General.'),
  reminder: z.object({
      text: z.string().describe("The text content of the reminder."),
      remindAt: z.string().datetime().describe("The future date and time for the reminder in ISO 8601 format.")
  }).optional().describe("Set this if the user asks for a reminder at a specific time in the future.")
});
export type ProactiveMemoryOutput = z.infer<typeof ProactiveMemoryOutputSchema>;

export async function proactiveMemory(input: ProactiveMemoryInput): Promise<ProactiveMemoryOutput> {
  return proactiveMemoryFlow(input);
}

const proactiveMemoryPrompt = ai.definePrompt({
  name: 'proactiveMemoryPrompt',
  input: {schema: ProactiveMemoryInputSchema},
  output: {schema: ProactiveMemoryOutputSchema},
  prompt: `You are a proactive chatbot assistant. Your primary goal is to identify and save important information from the user's input, and secondarily to be a conversational partner. The current time is {{now}}.

- When the user provides information that should be saved (like a recipe, a task, an event, or an idea), your main job is to extract it, summarize it for storage, and categorize it. Your 'chatbotResponse' should be a brief confirmation. For example: "Anotado en 'Recetas'." or "OK, lo agrego a tus tareas."
- If the user's request involves a future action or reminder (e.g., 'remind me tomorrow at 5pm', 'in 2 hours'), identify the task and the exact time it should be triggered. Set 'reminder.text' to the content of the reminder and 'reminder.remindAt' to the calculated date and time in ISO 8601 format. For these, your chatbotResponse should confirm the reminder, like "OK, te lo recordaré."
- Only when the user is making small talk or asking a direct question that does not involve saving information should you provide a more conversational 'chatbotResponse'.
- Do not use external information from the internet.
- Never ask for personally identifying information.

The user is currently in the '{{categoryId}}' chat category.

Here's the chat history so far:
{{#if chatHistory}}
{{#each chatHistory}}
{{this.role}}: {{{this.content}}}
{{/each}}
{{/if}}

User Input: "{{userInput}}"

Based on the user input, generate the response, summary, category, and reminder if applicable.
  `,
});

const proactiveMemoryFlow = ai.defineFlow(
  {
    name: 'proactiveMemoryFlow',
    inputSchema: ProactiveMemoryInputSchema,
    outputSchema: ProactiveMemoryOutputSchema,
  },
  async input => {
    const {output} = await proactiveMemoryPrompt({
      ...input,
      categoryId: input.categoryId || 'General',
    });
    if (!output) {
      throw new Error(
        'The AI failed to generate a response that matched the required format.'
      );
    }
    return output;
  }
);
