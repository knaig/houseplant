import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { addConversationParticipant } from '@/lib/twilio'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const conversationId = params.id
    
    // Get conversation and validate ownership
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: {
          include: {
            plants: {
              include: {
                species: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    
    if (conversation.user.clerkId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        name: conversation.name,
        isActive: conversation.isActive,
        participantCount: conversation.user.plants.length + 1,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        recentMessages: conversation.messages,
      },
    })
    
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const conversationId = params.id
    const body = await request.json()
    const { name, syncPlants } = body
    
    // Get conversation and validate ownership
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: {
          include: {
            plants: true,
          },
        },
      },
    })
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    
    if (conversation.user.clerkId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const updates: any = {}
    
    // Update conversation name if provided
    if (name) {
      updates.name = name
    }
    
    // Sync plants if requested
    if (syncPlants && conversation.isActive) {
      // Add any new plants as participants
      for (const plant of conversation.user.plants) {
        const participantResult = await addConversationParticipant({
          conversationSid: conversation.twilioSid,
          identity: `plant_${plant.id}`,
        })
        
        if (!participantResult.success) {
          console.error(`Failed to add plant ${plant.name} participant:`, participantResult.error)
          // Continue if Twilio is not configured
          if (!participantResult.error?.includes('Twilio client not initialized')) {
            // Only log non-Twilio errors
          }
        }
      }
    }
    
    // Update conversation in database
    const updatedConversation = await db.conversation.update({
      where: { id: conversationId },
      data: updates,
    })
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: updatedConversation.id,
        name: updatedConversation.name,
        isActive: updatedConversation.isActive,
        participantCount: conversation.user.plants.length + 1,
        updatedAt: updatedConversation.updatedAt,
      },
    })
    
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const conversationId = params.id
    
    // Get conversation and validate ownership
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: true,
      },
    })
    
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    
    if (conversation.user.clerkId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Deactivate conversation instead of deleting
    const updatedConversation = await db.conversation.update({
      where: { id: conversationId },
      data: { isActive: false },
    })
    
    // Log system message about group deactivation
    await db.message.create({
      data: {
        userId: conversation.userId,
        direction: 'OUTBOUND',
        channel: 'WHATSAPP',
        body: `🌱 Your Plant Family group has been deactivated. You'll now receive individual messages from your plants.`,
        conversationId: conversation.id,
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Plant Family group deactivated successfully',
    })
    
  } catch (error) {
    console.error('Error deactivating conversation:', error)
    return NextResponse.json({ error: 'Failed to deactivate conversation' }, { status: 500 })
  }
}
