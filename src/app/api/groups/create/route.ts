import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { getOrCreateUserConversation } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user from Clerk ID
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        plants: {
          include: {
            species: true,
          },
        },
        conversation: true,
      },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (!user.phoneE164) {
      return NextResponse.json({ 
        error: 'Phone number required for WhatsApp group. Please add your phone number in your profile.' 
      }, { status: 400 })
    }
    
    // Check if user already has an active conversation
    if (user.conversation && user.conversation.isActive) {
      return NextResponse.json({ 
        success: true, 
        conversation: {
          id: user.conversation.id,
          name: user.conversation.name,
          participantCount: user.plants.length + 1, // plants + user
          createdAt: user.conversation.createdAt,
        },
        message: 'Plant Family group already exists'
      })
    }
    
    // Create conversation using Twilio library
    const conversationResult = await getOrCreateUserConversation({
      id: user.id,
      phoneE164: user.phoneE164,
      plants: user.plants.map(plant => ({
        id: plant.id,
        name: plant.name,
        personality: plant.personality,
      })),
    })
    
    if (!conversationResult.success) {
      console.error('Failed to create conversation:', conversationResult.error)
      return NextResponse.json({ 
        error: `Failed to create Plant Family group: ${conversationResult.error}` 
      }, { status: 500 })
    }
    
    // Get the created conversation from database
    const conversation = await db.conversation.findUnique({
      where: { id: conversationResult.conversationId! },
    })
    
    if (!conversation) {
      return NextResponse.json({ 
        error: 'Failed to retrieve created conversation' 
      }, { status: 500 })
    }
    
    // Log system message about group creation
    await db.message.create({
      data: {
        userId: user.id,
        direction: 'OUTBOUND',
        channel: 'WHATSAPP',
        body: `🌱 Your Plant Family group has been created! You'll now receive messages from all your plants in one WhatsApp conversation.`,
        conversationId: conversation.id,
      },
    })
    
    return NextResponse.json({ 
      success: true, 
      conversation: {
        id: conversation.id,
        name: conversation.name,
        participantCount: user.plants.length + 1,
        createdAt: conversation.createdAt,
      },
      message: conversationResult.isNew ? 'Plant Family group created successfully!' : 'Plant Family group already exists'
    })
    
  } catch (error) {
    console.error('Error creating plant family group:', error)
    
    // Handle Prisma unique constraint violation (P2002)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Plant Family group already exists for this user.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ error: 'Failed to create Plant Family group' }, { status: 500 })
  }
}
