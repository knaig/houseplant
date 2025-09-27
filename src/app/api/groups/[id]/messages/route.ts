import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { Message, Plant } from '@prisma/client';

interface MessageWithPlant extends Message {
  plant?: Plant | null;
}

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
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validate user owns the conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        user: {
          clerkId: userId
        }
      },
      include: {
        user: true
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Build query with cursor-based pagination
    const whereClause: any = {
      conversationId
    };

    if (cursor) {
      whereClause.createdAt = {
        lt: new Date(cursor)
      };
    }

    // Fetch messages with plant data
    const messages = await db.message.findMany({
      where: whereClause,
      include: {
        plant: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit + 1 // Take one extra to check if there are more
    });

    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? messagesToReturn[messagesToReturn.length - 1].createdAt.toISOString() : null;

    // Transform messages for frontend consumption
    const transformedMessages = messagesToReturn.map((message: MessageWithPlant) => {
      let author = 'System';
      let authorEmoji = '🤖';
      let authorName = 'System';

      if (message.author.startsWith('plant_')) {
        const plantId = message.author.replace('plant_', '');
        if (message.plant) {
          author = `plant_${plantId}`;
          authorEmoji = message.plant.personalityEmoji || '🌱';
          authorName = message.plant.name;
        }
      } else if (message.author === conversation.user.phoneNumber) {
        author = 'user';
        authorEmoji = '👤';
        authorName = 'You';
      }

      return {
        id: message.id,
        content: message.content,
        author,
        authorEmoji,
        authorName,
        createdAt: message.createdAt.toISOString(),
        messageType: message.messageType,
        isInbound: message.isInbound
      };
    });

    return NextResponse.json({
      messages: transformedMessages,
      hasMore,
      nextCursor
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
