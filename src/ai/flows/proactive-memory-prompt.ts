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
  prompt: `You are a helpful and proactive chatbot assistant named Noto. The current time is {{now}}.

Your primary goal is to help the user save and retrieve information. Follow these rules in strict order. Stop after the first rule that applies.

**Rule 1: Retrieve Information**
If the user's query is a question asking to retrieve information (e.g., "what are my reminders?", "search for my lasagna recipe"), use your tools (\`searchMemoryTool\`, \`searchRemindersTool\`). Formulate the result into \`chatbotResponse\`. Do NOT set any other output fields.

**Rule 2: Save Explicit Information**
If the user gives a clear command to save something (e.g., "remind me to...", "save this idea...", "add a note"), extract the data.
- For reminders, set the 'reminder' field. \`chatbotResponse\` should be a simple confirmation.
- For other memories, fill 'informationSummary' and 'category'. \`chatbotResponse\` should be a confirmation.

**Rule 3: Handle Small Talk & Conversational Flow Control (HIGHEST PRIORITY)**
If the user input is simple conversation (like "hola", "hey", "qué tal", "de que hablas?", "gracias", "jajaja", "cómo estás?", "ok") OR if the user is responding negatively to a previous question from you (like "no", "no, solo te contaba", "olvídalo"), you MUST just provide a friendly, conversational \`chatbotResponse\` like "De acuerdo!" or "Entendido.". 
This rule takes absolute priority over all others below it. If the input matches this rule, you MUST NOT save anything or ask to save anything.
Do NOT set any other output fields besides \`chatbotResponse\`.

**Rule 4: Handle User Context -> Save the Original Information**
If your *immediately preceding* bot response was the request for context from Rule 5, and the user's current input ("{{userInput}}") provides that context, you MUST now save the information.
- You MUST find the user's original statement in the chat history (it will be the user message right before your first clarification question).
- Combine that original statement with the new context from "{{userInput}}".
- Summarize this combined information in the \`informationSummary\` field.
- Use the context to determine the \`category\`.
- Your \`chatbotResponse\` MUST be a brief confirmation, like "¡Hecho! Lo he guardado."

**Rule 5: Handle User Confirmation -> Ask for Context**
If your *immediately preceding* bot response was the clarification question from Rule 6 ("Entendido. ¿Es algo que debería recordar o solo me lo cuentas?"), and the user now responds with a clear "yes" or a command to save (e.g., "sí", "recuérdalo", "guárdalo"), your *only* possible action is to ask for more context.
- Your \`chatbotResponse\` MUST be: "De acuerdo. Si quieres que guarde esta información, dame un poco más de contexto o dime en qué categoría la pongo (por ejemplo, Gastos, Ideas, etc.) para que sea más fácil encontrarla después."
- Do NOT set any other output fields.

**Rule 6: Handle Ambiguous Information -> Start Clarification**
If the user's input is not a command (Rule 1/2) and does not match small talk or a negative response (Rule 3), and it contains information that could be important (e.g., "I spent 2800 on a beer", "My sister's birthday is on Tuesday"), your *only* possible action is to ask for clarification.
- Your \`chatbotResponse\` **MUST** be: "Entendido. ¿Es algo que debería recordar o solo me lo cuentas?".
- Do NOT set any other output fields.

---
Current Chat Context: Category '{{categoryId}}'
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
