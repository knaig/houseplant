import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { createCustomerPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user and their subscription
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    })
    
    if (!user || !user.subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }
    
    const returnUrl = `${process.env.APP_BASE_URL}/app/settings`
    
    const session = await createCustomerPortalSession(
      user.subscription.stripeCustomerId,
      returnUrl
    )
    
    return NextResponse.json({ url: session.url })
    
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
