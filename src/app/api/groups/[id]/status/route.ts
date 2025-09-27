import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getConversationService } from '@/lib/twilio';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;

    // Validate user owns the conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        user: {
          clerkId: userId
        }
      },
      include: {
        user: true,
        plants: true
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get message statistics
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [messagesToday, messagesWeek, messagesMonth, lastMessage] = await Promise.all([
      db.message.count({
        where: {
          conversationId,
          createdAt: { gte: oneDayAgo }
        }
      }),
      db.message.count({
        where: {
          conversationId,
          createdAt: { gte: oneWeekAgo }
        }
      }),
      db.message.count({
        where: {
          conversationId,
          createdAt: { gte: oneMonthAgo }
        }
      }),
      db.message.findFirst({
        where: { conversationId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Get most active plant
    const mostActivePlant = await db.message.groupBy({
      by: ['author'],
      where: {
        conversationId,
        createdAt: { gte: oneWeekAgo },
        author: { startsWith: 'plant_' }
      },
      _count: {
        author: true
      },
      orderBy: {
        _count: {
          author: 'desc'
        }
      },
      take: 1
    });

    let connectionStatus = 'connected';
    let isActive = true;
    let participantCount = conversation.plants.length + 1; // +1 for user

    // Check Twilio conversation status
    try {
      const conversationService = getConversationService();
      const twilioConversation = await conversationService.conversations(conversation.twilioConversationSid).fetch();
      
      if (twilioConversation.state === 'closed') {
        connectionStatus = 'disconnected';
        isActive = false;
      } else if (twilioConversation.state === 'inactive') {
        connectionStatus = 'warning';
        isActive = false;
      }

      // Get actual participant count from Twilio
      const participants = await conversationService
        .conversations(conversation.twilioConversationSid)
        .participants
        .list();
      
      participantCount = participants.length;
    } catch (error) {
      console.error('Error checking Twilio conversation status:', error);
      connectionStatus = 'error';
      isActive = false;
    }

    // Calculate activity metrics
    const messageStats = {
      today: messagesToday,
      week: messagesWeek,
      month: messagesMonth,
      mostActivePlant: mostActivePlant[0]?.author || null,
      lastActivity: lastMessage?.createdAt.toISOString() || null
    };

    // Determine overall status
    let statusMessage = 'WhatsApp group active';
    if (connectionStatus === 'disconnected') {
      statusMessage = 'Connection lost - tap to reconnect';
    } else if (connectionStatus === 'warning') {
      statusMessage = 'Some messages may be delayed';
    } else if (connectionStatus === 'error') {
      statusMessage = 'Connection error - check settings';
    }

    return NextResponse.json({
      isActive,
      connectionStatus,
      participantCount,
      lastActivity: lastMessage?.createdAt.toISOString() || null,
      messageStats,
      statusMessage,
      conversation: {
        id: conversation.id,
        name: conversation.name,
        createdAt: conversation.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching conversation status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation status' },
      { status: 500 }
    );
  }
}
