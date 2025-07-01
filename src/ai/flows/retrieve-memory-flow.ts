// src/ai/flows/retrieve-memory-flow.ts
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

const RetrieveMemoryInputSchema = z.object({
  query: z.string().describe('The query to retrieve information about.'),
});
export type RetrieveMemoryInput = z.infer<typeof RetrieveMemoryInputSchema>;

const RetrieveMemoryOutputSchema = z.object({
  retrievedInformation: z.string().describe('The information retrieved from the chatbot memory.'),
});
export type RetrieveMemoryOutput = z.infer<typeof RetrieveMemoryOutputSchema>;

export async function retrieveMemory(input: RetrieveMemoryInput): Promise<RetrieveMemoryOutput> {
  return retrieveMemoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'retrieveMemoryPrompt',
  input: {schema: RetrieveMemoryInputSchema},
  output: {schema: RetrieveMemoryOutputSchema},
  prompt: `You are a helpful chatbot that remembers information provided by the user.

  The user is asking you to retrieve some information. Here is the user's query:
  {{query}}

  Retrieve the information from your memory and respond to the user. If you cannot find the information, respond that you cannot find it.
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
    return output!;
  }
);
