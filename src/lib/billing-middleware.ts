import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { getPlantLimitForPlan } from '@/lib/stripe'

export async function enforcePlantLimit(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user and their subscription
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        subscription: true,
        plants: true,
      },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const plan = user.subscription?.plan || 'FREE'
    const plantLimit = getPlantLimitForPlan(plan)
    const currentPlantCount = user.plants.length
    
    if (currentPlantCount >= plantLimit) {
      return NextResponse.json({ 
        error: 'Plant limit reached',
        details: {
          currentCount: currentPlantCount,
          limit: plantLimit,
          plan,
        }
      }, { status: 403 })
    }
    
    return null // No error, continue
    
  } catch (error) {
    console.error('Error enforcing plant limit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
