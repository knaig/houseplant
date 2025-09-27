import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user exists
    let user = await db.user.findUnique({
      where: { clerkId: userId },
    })
    
    if (!user) {
      // Create user if doesn't exist
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: '', // Will be updated when we get email from Clerk
        },
      })
    }
    
    return NextResponse.json({ success: true, user })
    
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    )
  }
}
