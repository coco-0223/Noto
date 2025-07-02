'use server';
/**
 * @fileOverview A flow for the chatbot to proactively initiate a conversation.
 *
 * - initiateChat - A function that generates a conversation starter.
 * - InitiateChatInput - The input type for the initiateChat function.
 * - InitiateChatOutput - The return type for the initiateChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchMemories } from '@/services/chatService';

const InitiateChatInputSchema = z.object({
  // No specific user input, but it will use tools to get context.
});
export type InitiateChatInput = z.infer<typeof InitiateChatInputSchema>;

const InitiateChatOutputSchema = z.object({
  message: z.string().describe('A short, engaging, and natural conversation starter.'),
});
export type InitiateChatOutput = z.infer<typeof InitiateChatOutputSchema>;


const searchRecentMemoriesTool = ai.defineTool(
  {
    name: 'searchRecentMemoriesTool',
    description: 'Searches for the user\'s most recent memories to get context for starting a conversation.',
    inputSchema: z.object({}), // No input needed
    outputSchema: z.array(z.object({
        summary: z.string(),
        category: z.string(),
        createdAt: z.string(),
    })),
  },
  async () => {
    // Search with an empty query gets recent memories
    return searchMemories(); 
  }
);


export async function initiateChat(input: InitiateChatInput): Promise<InitiateChatOutput> {
  return initiateChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'initiateChatPrompt',
  tools: [searchRecentMemoriesTool],
  input: {schema: InitiateChatInputSchema},
  output: {schema: InitiateChatOutputSchema},
  prompt: `You are a proactive and friendly AI assistant named Noto. It's time to start a conversation with the user.

  Your goal is to be engaging and natural, not robotic. You can use the searchRecentMemoriesTool to see what the user has been up to recently and ask a relevant follow-up question. For example, if they recently saved a recipe, you could ask "Hey, thinking about that recipe you saved, have you had a chance to try it out?".

  If there are no recent memories or nothing interesting to follow up on, just ask a general, friendly question like "Hey! How's your day going?" or "Just checking in. Anything new and exciting happening?".

  Generate a single, short message to start the conversation.
  `,
});

const initiateChatFlow = ai.defineFlow(
  {
    name: 'initiateChatFlow',
    inputSchema: InitiateChatInputSchema,
    outputSchema: InitiateChatOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a valid proactive message.");
    }
    return output;
  }
);
