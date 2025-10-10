import { NextRequest, NextResponse } from 'next/server'
import { inngest } from '@/lib/inngest'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phoneNumber } = await request.json()
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    // Trigger test reminder job
    await inngest.send({
      name: 'test/reminder',
      data: {
        userId,
        phoneNumber
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Test reminder triggered successfully'
    })

  } catch (error) {
    console.error('Error triggering test reminder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
