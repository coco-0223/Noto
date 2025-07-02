'use server';
/**
 * @fileOverview A flow for the chatbot to proactively initiate a conversation.
 *
 * - initiateChat - A function that generates a conversation starter.
 */

import {ai} from '@/ai/genkit';

export async function initiateChat(): Promise<{message: string}> {
    const response = await ai.generate({
        prompt: `You are a proactive and friendly AI assistant named Noto. 
        It's time to start a conversation with the user.
        Generate a single, short, engaging, and natural conversation starter.
        For example: "Hey! How's your day going?" or "Just checking in. Anything new and exciting happening?".
        Keep it very short and simple.`,
    });
    
    return { message: response.text };
}
