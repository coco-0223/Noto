// src/ai/flows/personalize-chatbot-style.ts
'use server';

/**
 * @fileOverview Flow to personalize the chatbot's writing style based on user examples.
 *
 * - personalizeChatbotStyle - A function that personalizes the chatbot's style.
 * - PersonalizeChatbotStyleInput - The input type for the personalizeChatbotStyle function.
 * - PersonalizeChatbotStyleOutput - The return type for the personalizeChatbotStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizeChatbotStyleInputSchema = z.object({
  exampleTexts: z
    .array(z.string())
    .describe("An array of example texts written by the user to mimic."),
  chatbotPersona: z.string().optional().describe("Optional description of the chatbot's existing persona."),
});
export type PersonalizeChatbotStyleInput = z.infer<typeof PersonalizeChatbotStyleInputSchema>;

const PersonalizeChatbotStyleOutputSchema = z.object({
  updatedPersona: z
    .string()
    .describe('A description of the updated chatbot persona, incorporating the user writing style.'),
});
export type PersonalizeChatbotStyleOutput = z.infer<typeof PersonalizeChatbotStyleOutputSchema>;

export async function personalizeChatbotStyle(
  input: PersonalizeChatbotStyleInput
): Promise<PersonalizeChatbotStyleOutput> {
  return personalizeChatbotStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeChatbotStylePrompt',
  input: {schema: PersonalizeChatbotStyleInputSchema},
  output: {schema: PersonalizeChatbotStyleOutputSchema},
  prompt: `You are a chatbot persona creator. A user wants to personalize their chatbot to mimic their writing style.

  Here are some examples of the user's writing:
  {{#each exampleTexts}}
  - {{{this}}}
  {{/each}}

  {% if chatbotPersona %}
  The chatbot currently has the following persona: {{chatbotPersona}}
  {% endif %}

  Create an updated chatbot persona that incorporates the user's writing style. Return the updated persona.
  Do not be verbose in your answer, return the updated persona description only.
  `, 
});

const personalizeChatbotStyleFlow = ai.defineFlow(
  {
    name: 'personalizeChatbotStyleFlow',
    inputSchema: PersonalizeChatbotStyleInputSchema,
    outputSchema: PersonalizeChatbotStyleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
