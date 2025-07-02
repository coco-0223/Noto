import { NextResponse } from 'next/server';
import * as chatService from '@/services/chatService';
import { initiateChat } from '@/ai/flows/initiate-chat-flow';
import { Timestamp } from 'firebase/firestore';

export const dynamic = 'force-dynamic'; // defaults to auto

// This endpoint should be secured in a production environment,
// for example by checking a secret token passed in the request header.
// For now, it's open for simplicity.

async function handleReminders() {
    const reminders = await chatService.getDueReminders();
    if (reminders.length === 0) {
      return 0;
    }
  
    const processedIds: string[] = [];
    for (const reminder of reminders) {
      if (reminder.id) {
        await chatService.addMessage(reminder.conversationId, {
          text: reminder.text,
          sender: 'bot',
        });
        processedIds.push(reminder.id);
      }
    }
  
    if (processedIds.length > 0) {
      await chatService.markRemindersAsProcessed(processedIds);
    }
    return processedIds.length;
}

async function handleProactiveChat() {
    const WAKE_HOURS = { start: 8, end: 22 }; // 8 AM to 10 PM UTC
    const MIN_INTERVAL_HOURS = 4;
    const RANDOM_EXTRA_HOURS = 3;
  
    const now = new Date();
    const currentHour = now.getUTCHours();
  
    // Only send messages during reasonable hours
    if (currentHour < WAKE_HOURS.start || currentHour >= WAKE_HOURS.end) {
      return { sent: false, reason: 'Outside of wake hours.' };
    }
  
    const appState = await chatService.getAppState();
    const lastProactiveTimestamp = appState?.lastProactiveMessageTimestamp?.toDate();
    
    // Check if enough time has passed since the last proactive message
    if (lastProactiveTimestamp) {
        // Use a stored random interval if it exists, otherwise generate a new one
        const requiredInterval = appState?.lastProactiveInterval || (MIN_INTERVAL_HOURS + Math.random() * RANDOM_EXTRA_HOURS);
        const hoursSinceLast = (now.getTime() - lastProactiveTimestamp.getTime()) / (1000 * 60 * 60);
      
        if (hoursSinceLast < requiredInterval) {
            return { sent: false, reason: `Not enough time has passed. Need ${requiredInterval.toFixed(2)} hours, but only ${hoursSinceLast.toFixed(2)} have passed.` };
        }
    }
  
    // Time to send a message. Get the "General" conversation.
    const generalConv = await chatService.getOrCreateConversation('General');
    
    try {
      const { message } = await initiateChat({});
      await chatService.addMessage(generalConv.id, {
        text: message,
        sender: 'bot',
      });
      
      // Save the timestamp and generate a new random interval for next time
      const nextInterval = MIN_INTERVAL_HOURS + Math.random() * RANDOM_EXTRA_HOURS;
      await chatService.updateAppState({ 
          lastProactiveMessageTimestamp: Timestamp.now(),
          lastProactiveInterval: nextInterval 
      });
  
      return { sent: true, reason: 'Message sent.' };
    } catch (error) {
        console.error('Failed to generate or send proactive chat:', error);
        return { sent: false, reason: 'AI failed to generate a message.' };
    }
  }

export async function GET(request: Request) {
  try {
    // First, process any user-set reminders that are due
    const remindersProcessed = await handleReminders();
    
    // Then, attempt to send a proactive, non-reminder message
    const proactiveResult = await handleProactiveChat();

    return NextResponse.json({ 
        success: true, 
        processedReminders: remindersProcessed,
        proactiveChat: proactiveResult,
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
