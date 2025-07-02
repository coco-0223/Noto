'use server';
/**
 * @fileOverview A proactive memory AI agent that can save, retrieve, and chat with the user.
 *
 * - proactiveMemory - A function that handles the main chat interaction.
 * - ProactiveMemoryInput - The input type for the proactiveMemory function.
 * - ProactiveMemoryOutput - The return type for the proactiveMemory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchMemories, searchReminders } from '@/services/chatService';
import { Timestamp } from 'firebase/firestore';

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
  informationSummary: z.string().describe('A concise, factual summary of the information to be stored. Should be empty if the user is asking a question or making small talk.'),
  category: z.enum(['General', 'Ideas', 'Tareas', 'Recetas', 'Eventos', 'Cumpleaños', 'Recordatorios']).describe('The category for this information. Defaults to General.'),
  reminder: z.object({
      text: z.string().describe("The text content of the reminder."),
      remindAt: z.string().datetime().describe("The future date and time for the reminder in ISO 8601 format.")
  }).optional().describe("Set this if the user asks for a reminder at a specific time in the future.")
});
export type ProactiveMemoryOutput = z.infer<typeof ProactiveMemoryOutputSchema>;


const searchMemoryTool = ai.defineTool(
  {
    name: 'searchMemoryTool',
    description: 'Searches the user\'s stored memories for relevant information like general notes, ideas, recipes etc. to answer their query.',
    inputSchema: z.object({
        query: z.string().optional().describe('The search query. Can be empty to retrieve recent memories.')
    }),
    outputSchema: z.array(z.object({
        summary: z.string(),
        category: z.string(),
        createdAt: z.string(),
    })),
  },
  async ({ query }) => {
    return searchMemories(query);
  }
);

const searchRemindersTool = ai.defineTool(
    {
      name: 'searchRemindersTool',
      description: 'Searches the user\'s stored reminders for upcoming events or tasks.',
      inputSchema: z.object({}), // No input needed
      outputSchema: z.array(z.object({
          text: z.string(),
          triggerAt: z.string().datetime(),
      })),
    },
    async () => {
      // We'll map the triggerAt to an ISO string for the AI
      const reminders = await searchReminders();
      return reminders.map(r => ({ text: r.text, triggerAt: (r.triggerAt as Timestamp).toDate().toISOString() }));
    }
  );


export async function proactiveMemory(input: ProactiveMemoryInput): Promise<ProactiveMemoryOutput> {
  return proactiveMemoryFlow(input);
}

const proactiveMemoryPrompt = ai.definePrompt({
  name: 'proactiveMemoryPrompt',
  tools: [searchMemoryTool, searchRemindersTool],
  input: {schema: ProactiveMemoryInputSchema},
  output: {schema: ProactiveMemoryOutputSchema},
  prompt: `You are a helpful and proactive chatbot assistant named Noto. The current time is {{now}}.

Your abilities are:
1.  **Saving Information:** When the user provides new information (like an idea, task, recipe, or asks for a reminder), you must extract it, summarize it, and categorize it.
    - For reminders, you MUST set the 'reminder' field with the text and the exact ISO 8601 time. Your 'chatbotResponse' should be a confirmation like "OK, te lo recordaré."
    - For other memories, fill 'informationSummary' and 'category'. Your 'chatbotResponse' should be a brief confirmation, like "OK, lo he anotado en tus ideas."
2.  **Retrieving Information:** When the user asks a question or wants to recall something (e.g., "what are my reminders?", "what was that pizza recipe?"), you must use your tools to find the answer.
    - Use \`searchMemoryTool\` for general information.
    - Use \`searchRemindersTool\` for reminders.
    - Formulate the retrieved information into a natural 'chatbotResponse'. For retrievals, 'informationSummary' and 'reminder' must be empty.
3.  **Conversing:** For small talk or questions not related to saving/retrieving, just provide a friendly, conversational 'chatbotResponse'. In this case, 'informationSummary' and 'reminder' must be empty. For example, if the user says "Me gasté 2800 en una cerveza", that is small talk. Your response should be something conversational like "¡Salud!" or "¡Qué bien!", and the 'informationSummary' and 'reminder' fields must be empty.

The user is currently in the '{{categoryId}}' chat category.

Here's the chat history so far:
{{#if chatHistory}}
{{#each chatHistory}}
{{this.role}}: {{{this.content}}}
{{/each}}
{{/if}}

User Input: "{{userInput}}"

Based on the input, decide whether to save, retrieve, or just chat, and generate the appropriate response and data.
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
