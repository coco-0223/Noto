'use server';

import { ai } from '@/ai/genkit';
import * as chatService from '@/services/chatService';
import { z } from 'zod';

export const saveNote = ai.defineTool(
    {
        name: 'saveNote',
        description: 'Saves a note or piece of information for the user to retrieve later. Use this when the user explicitly asks to remember or save something.',
        inputSchema: z.object({
            summary: z.string().describe('The content of the note to save.'),
            category: z.string().optional().describe('The category for the note, e.g., Gastos, Ideas, Tareas. Defaults to General if not provided.'),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        const category = input.category || 'General';
        await chatService.saveMemory({ summary: input.summary, category });
        // The text returned here is for the model's benefit, it doesn't have to be shown to the user.
        // The model will generate its own confirmation message based on the prompt.
        return `Note saved successfully in category: ${category}.`;
    }
);

export const searchMyNotes = ai.defineTool(
    {
        name: 'searchMyNotes',
        description: 'Searches and retrieves the user\'s saved notes. Use this tool when the user asks a question about something they might have mentioned in the past, such as "cuánto gasté", "qué dije sobre...", "cuáles son mis gastos", or "búsca en mis notas".',
        inputSchema: z.object({
            query: z.string().describe('The search term to look for in the notes. This could be a keyword like "papas" or a category like "gastos".'),
        }),
        outputSchema: z.string(),
    },
    async ({ query }) => {
        const memories = await chatService.searchMemories(query);
        if (memories.length === 0) {
            return "No se encontraron notas que coincidan con tu búsqueda.";
        }
        const results = memories.map(m => `- ${m.summary} (Categoría: ${m.category})`).join('\n');
        return `He encontrado las siguientes notas:\n${results}`;
    }
);
