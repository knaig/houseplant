import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { plan } = await request.json()
    
    if (!plan || !['PRO', 'PRO_PLUS'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    
    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if user already has an active subscription
    if (user.subscription && user.subscription.status === 'ACTIVE') {
      return NextResponse.json({ error: 'User already has an active subscription' }, { status: 400 })
    }
    
    const successUrl = `${process.env.APP_BASE_URL}/app/settings?success=true`
    const cancelUrl = `${process.env.APP_BASE_URL}/app/settings?canceled=true`
    
    const session = await createCheckoutSession({
      userId: user.id,
      plan: plan as 'PRO' | 'PRO_PLUS',
      successUrl,
      cancelUrl,
    })
    
    return NextResponse.json({ sessionId: session.id, url: session.url })
    
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
