import { NextRequest, NextResponse } from 'next/server'
import { whatsappService } from '@/lib/whatsapp'
import { plantCareService } from '@/lib/plant-care'
import { db } from '@/lib/db'

// Note: AiSensy handles webhook events differently
// This endpoint is kept for future use or alternative integrations
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'WhatsApp webhook endpoint - AiSensy integration active',
    status: 'active'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle AiSensy webhook events (if any)
    // AiSensy typically handles message delivery status via their dashboard
    console.log('AiSensy webhook event received:', body)

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Note: AiSensy handles message responses differently
// Users typically respond through the website or QR code scanning
// This function is kept for future enhancements
