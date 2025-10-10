import { NextRequest, NextResponse } from 'next/server'
import { whatsappService } from '@/lib/whatsapp'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phoneNumber, optIn } = await request.json()
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format. Use international format (+1234567890)' }, { status: 400 })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user's phone number and WhatsApp opt-in status
    await db.user.update({
      where: { id: user.id },
      data: {
        phoneE164: phoneNumber,
        whatsappOptIn: optIn || true,
        whatsappOptInAt: optIn ? new Date() : null
      }
    })

    // Send opt-in confirmation message
    if (optIn) {
      const success = await whatsappService.sendOptInConfirmation(phoneNumber)
      
      if (!success) {
        console.error('Failed to send WhatsApp opt-in confirmation')
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ 
      success: true,
      message: optIn ? 'Successfully opted in to WhatsApp notifications' : 'WhatsApp notifications disabled',
      phoneNumber: phoneNumber
    })

  } catch (error) {
    console.error('Error updating WhatsApp opt-in:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's WhatsApp opt-in status
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        phoneE164: true,
        whatsappOptIn: true,
        whatsappOptInAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      whatsapp: {
        phoneNumber: user.phoneE164,
        optIn: user.whatsappOptIn,
        optInAt: user.whatsappOptInAt
      }
    })

  } catch (error) {
    console.error('Error getting WhatsApp opt-in status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
