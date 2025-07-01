import { NextResponse } from 'next/server';
import * as chatService from '@/services/chatService';

export const dynamic = 'force-dynamic'; // defaults to auto

// This endpoint should be secured in a production environment,
// for example by checking a secret token passed in the request header.
// For now, it's open for simplicity.

export async function GET(request: Request) {
  try {
    const reminders = await chatService.getDueReminders();
    
    if (reminders.length === 0) {
      return NextResponse.json({ success: true, message: 'No due reminders.' });
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
    
    return NextResponse.json({ success: true, processed: processedIds.length });

  } catch (error) {
    console.error('Cron job failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
