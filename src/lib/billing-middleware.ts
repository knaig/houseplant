import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// Simple plant limits without Stripe dependency
const PLANT_LIMITS = {
  FREE: 1,
  PRO: 10,
  PRO_PLUS: 25
} as const

export async function enforcePlantLimit(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user and their plants
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        plants: true,
      },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // For now, use PRO_PLUS limit (25 plants) for all users
    const plantLimit = PLANT_LIMITS.PRO_PLUS
    const currentPlantCount = user.plants.length
    
    if (currentPlantCount >= plantLimit) {
      return NextResponse.json({ 
        error: 'Plant limit reached',
        details: {
          currentCount: currentPlantCount,
          limit: plantLimit,
          plan: 'PRO_PLUS',
        }
      }, { status: 403 })
    }
    
    return null // No error, continue
    
  } catch (error) {
    console.error('Error enforcing plant limit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
