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
import { searchMemories } from '@/services/chatService';

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
    description: 'Searches the user\'s stored memories for relevant information to answer their query.',
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


export async function retrieveMemory(input: RetrieveMemoryInput): Promise<RetrieveMemoryOutput> {
  return retrieveMemoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'retrieveMemoryPrompt',
  tools: [searchMemoryTool],
  input: {schema: RetrieveMemoryInputSchema},
  output: {schema: RetrieveMemoryOutputSchema},
  prompt: `You are a helpful chatbot that remembers information provided by the user.

  The user is asking you to retrieve some information. Here is the user's query:
  "{{query}}"

  Use the searchMemoryTool to find relevant memories. If the user's query is vague (e.g., "what's up?"), you can search with an empty query to get the most recent memories as context.

  Based on the search results, formulate a natural language response to the user. If you cannot find any relevant information, respond that you cannot find it.
  `,
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
