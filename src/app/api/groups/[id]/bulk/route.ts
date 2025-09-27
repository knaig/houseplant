import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { sendConversationMessage } from '@/lib/twilio';
import { inngest } from '@/lib/inngest';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;
    const body = await request.json();
    const { message, plantIds, sendAsSystem = false } = body;

    // Validate message content
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    if (message.length > 160) {
      return NextResponse.json({ error: 'Message too long (max 160 characters)' }, { status: 400 });
    }

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

    // Check rate limiting (3 bulk messages per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentBulkMessages = await db.message.count({
      where: {
        conversationId,
        createdAt: { gte: oneHourAgo },
        content: { contains: '[BULK]' }
      }
    });

    if (recentBulkMessages >= 3) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Maximum 3 bulk messages per hour.' 
      }, { status: 429 });
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    const batchId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (sendAsSystem) {
      // Send single system message
      try {
        const systemMessage = `🌱 Plant Family: ${message}`;
        
        await inngest.send({
          name: 'whatsapp/send.conversation.message',
          data: {
            conversationSid: conversation.twilioConversationSid,
            message: systemMessage,
            author: 'system',
            conversationId: conversation.id
          }
        });

        // Log system message
        await db.message.create({
          data: {
            content: `[BULK] ${message}`,
            author: 'system',
            conversationId: conversation.id,
            messageType: 'text',
            isInbound: false,
            metadata: {
              batchId,
              sendAsSystem: true
            }
          }
        });

        results.sent = 1;
      } catch (error) {
        console.error('Error sending system message:', error);
        results.failed = 1;
        results.errors.push('Failed to send system message');
      }
    } else {
      // Send messages from selected plants
      const selectedPlants = plantIds 
        ? conversation.plants.filter(plant => plantIds.includes(plant.id))
        : conversation.plants;

      if (selectedPlants.length === 0) {
        return NextResponse.json({ error: 'No plants selected' }, { status: 400 });
      }

      if (selectedPlants.length > 10) {
        return NextResponse.json({ 
          error: 'Maximum 10 plants per bulk message' 
        }, { status: 400 });
      }

      // Send messages with small delays to avoid rate limiting
      for (let i = 0; i < selectedPlants.length; i++) {
        const plant = selectedPlants[i];
        
        try {
          const plantMessage = `${plant.name} ${plant.personalityEmoji || '🌱'}: ${message}`;
          
          await inngest.send({
            name: 'whatsapp/send.conversation.message',
            data: {
              conversationSid: conversation.twilioConversationSid,
              message: plantMessage,
              author: `plant_${plant.id}`,
              conversationId: conversation.id
            }
          });

          // Log plant message
          await db.message.create({
            data: {
              content: `[BULK] ${message}`,
              author: `plant_${plant.id}`,
              conversationId: conversation.id,
              messageType: 'text',
              isInbound: false,
              plantId: plant.id,
              metadata: {
                batchId,
                plantName: plant.name,
                plantEmoji: plant.personalityEmoji
              }
            }
          });

          results.sent++;

          // Small delay between messages (500ms)
          if (i < selectedPlants.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Error sending message from plant ${plant.name}:`, error);
          results.failed++;
          results.errors.push(`Failed to send message from ${plant.name}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      batchId,
      message: `Bulk message sent: ${results.sent} successful, ${results.failed} failed`
    });

  } catch (error) {
    console.error('Error sending bulk message:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk message' },
      { status: 500 }
    );
  }
}
