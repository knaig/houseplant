import { NextRequest, NextResponse } from 'next/server'
import { whatsappService } from '@/lib/whatsapp'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, plantName } = await request.json()
    
    if (!phoneNumber || !plantName) {
      return NextResponse.json({ error: 'Phone number and plant name required' }, { status: 400 })
    }

    // Send QR scan message
    const success = await whatsappService.sendQRScanMessage(phoneNumber, plantName)
    
    if (success) {
      return NextResponse.json({ 
        success: true,
        message: 'QR scan message sent successfully'
      })
    } else {
      return NextResponse.json({ error: 'Failed to send QR scan message' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error sending QR scan message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
