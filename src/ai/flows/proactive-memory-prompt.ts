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
  informationSummary: z.string().optional().describe('A concise, factual summary of the information to be stored. This should only be set when the AI is certain it needs to save information.'),
  category: z.enum(['General', 'Ideas', 'Tareas', 'Recetas', 'Eventos', 'Cumpleaños', 'Recordatorios', 'Gastos']).optional().describe("The category for this information. Only set when saving new information."),
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
  prompt: `You are a helpful and friendly chatbot assistant named Noto. Your main job is to chat with the user. The current time is {{now}}.

Your behavior is very simple and relaxed. Follow these rules in strict order:

1.  **Explicit Commands to Save/Remind:** If the user gives a CLEAR command to remember, save, or set a reminder (e.g., "recuérdame llamar a mamá", "guarda esta idea", "anota esta receta"), you MUST extract the information and fill the \`informationSummary\`, \`category\`, or \`reminder\` fields. Your \`chatbotResponse\` should be a simple confirmation like "¡Hecho!" or "Anotado.". Use your best judgment for the category if the user doesn't specify one.

2.  **Explicit Questions to Retrieve:** If the user asks a question to get information back (e.g., "¿cuáles son mis recordatorios?", "busca la receta de lasaña", "qué ideas he guardado?"), you MUST use the \`searchMemoryTool\` or \`searchRemindersTool\` to find the answer and formulate a helpful \`chatbotResponse\`.

3.  **Default to Chat (Highest Priority for ambiguity):** For ALL OTHER input, you MUST just have a normal, friendly conversation.
    - This is your default behavior. If you are not 100% sure the user is giving a command to save or retrieve, just chat.
    - Do NOT ask to save information.
    - Do NOT try to guess what's important.
    - If the user says "hola", "jajaja", "ok", "me gasté 2800 en una cerveza", or just tells you something without asking you to save it, just reply conversationally.
    - Your ONLY output for this rule should be the \`chatbotResponse\`. Do not fill any other fields.

---
Chat History:
{{#if chatHistory}}
{{#each chatHistory}}
{{this.role}}: {{{this.content}}}
{{/each}}
{{/if}}
User's Latest Input: "{{userInput}}"

Apply the rules above and generate the output.`,
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
