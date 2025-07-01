'use server';

import { proactiveMemory } from '@/ai/flows/proactive-memory-prompt';
import { personalizeChatbotStyle } from '@/ai/flows/personalize-chatbot-style';
import * as chatService from '@/services/chatService';
import type { ChatHistory, Message } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getBotResponse(userInput: string, conversationId: string) {
  try {
    // 1. Save user message
    const userMessage = await chatService.addMessage(conversationId, { text: userInput, sender: 'user' });

    // 2. Get conversation context
    const messages = await chatService.getMessages(conversationId);
    const chatHistory: ChatHistory[] = messages.slice(-10).map((msg) => ({ // Get last 10 messages for context
      role: msg.sender,
      content: msg.text,
    }));

    const conversations = await chatService.getConversations();
    const currentConversation = conversations.find(c => c.id === conversationId);
    const categoryId = currentConversation?.title || 'General';

    // 3. Call AI flow
    const response = await proactiveMemory({
      userInput,
      chatHistory,
      categoryId,
    });

    // 4. Save bot response
    const botMessage = await chatService.addMessage(conversationId, {
      text: response.chatbotResponse,
      sender: 'bot',
    });
    
    // 5. Save memory if any
    if (response.informationSummary) {
      await chatService.saveMemory({
        summary: response.informationSummary,
        category: response.category,
      });

      // 6. Create new conversation if category is new
      if (response.category !== categoryId) {
        await chatService.getOrCreateConversation(response.category);
        revalidatePath('/'); // Revalidate home page to show new conversation
      }
    }
    
    revalidatePath(`/chat/${conversationId}`); // Revalidate chat page

    return {
      success: true,
      data: {
        ...response,
        userMessage,
        botMessage,
      },
    };
  } catch (error) {
    console.error('Error in getBotResponse:', error);
    const errorMessage = 'Failed to get response from AI.';
    await chatService.addMessage(conversationId, { text: errorMessage, sender: 'bot' });
    revalidatePath(`/chat/${conversationId}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getInitialChatData(conversationId: string) {
    try {
        const messages = await chatService.getMessages(conversationId);
        const conversations = await chatService.getConversations();
        const currentConversation = conversations.find(c => c.id === conversationId);
        if (!currentConversation) {
          throw new Error('Conversation not found');
        }
        return {
            success: true,
            data: {
                messages,
                title: currentConversation.title,
                icon: currentConversation.title,
            }
        }
    } catch(error) {
        console.error('Error fetching initial chat data:', error);
        return {
            success: false,
            error: 'Failed to load chat data'
        }
    }
}


export async function updatePersona(exampleTexts: string[], currentPersona?: string) {
    try {
        const response = await personalizeChatbotStyle({
            exampleTexts,
            chatbotPersona: currentPersona
        });
        return {
            success: true,
            data: response
        }
    } catch(error) {
        console.error(error);
        return {
            success: false,
            error: "Failed to update persona"
        }
    }
}
