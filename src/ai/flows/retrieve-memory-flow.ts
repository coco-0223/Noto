'use server';

/**
 * @fileOverview A flow to retrieve information that the user has previously provided to the chatbot.
 *
 * - retrieveMemory - A function that handles the retrieval of information.
 * - RetrieveMemoryInput - The input type for the retrieveMemory function.
 * - RetrieveMemoryOutput - The return type for the retrieveMemory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchMemories, searchReminders } from '@/services/chatService';
import { Timestamp } from 'firebase/firestore';

const RetrieveMemoryInputSchema = z.object({
  query: z.string().describe('The query to retrieve information about.'),
});
export type RetrieveMemoryInput = z.infer<typeof RetrieveMemoryInputSchema>;

const RetrieveMemoryOutputSchema = z.object({
  retrievedInformation: z.string().describe('The information retrieved from the chatbot memory, formulated as a natural language response.'),
});
export type RetrieveMemoryOutput = z.infer<typeof RetrieveMemoryOutputSchema>;


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


export async function retrieveMemory(input: RetrieveMemoryInput): Promise<RetrieveMemoryOutput> {
  return retrieveMemoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'retrieveMemoryPrompt',
  tools: [searchMemoryTool, searchRemindersTool],
  input: {schema: RetrieveMemoryInputSchema},
  output: {schema: RetrieveMemoryOutputSchema},
  prompt: `You are a helpful chatbot that remembers information provided by the user. The user is asking you to retrieve some information. Here is the user's query:
"{{query}}"

You have two tools to find information:
1. \`searchMemoryTool\`: Use this to search for general notes, ideas, recipes, etc.
2. \`searchRemindersTool\`: Use this specifically when the user asks about their reminders, upcoming tasks, or scheduled events.

Based on the user's query, decide which tool is appropriate. If the query is vague (e.g., "what's up?"), you can use \`searchMemoryTool\` with an empty query to get recent context.

Formulate a natural language response based on the search results. If you cannot find any relevant information, respond that you cannot find it.`,
});

const retrieveMemoryFlow = ai.defineFlow(
  {
    name: 'retrieveMemoryFlow',
    inputSchema: RetrieveMemoryInputSchema,
    outputSchema: RetrieveMemoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a valid response.");
    }
    return output;
  }
);
