import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { createRazorpayOrder, RAZORPAY_PLANS } from '@/lib/razorpay'

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
    
    const planDetails = RAZORPAY_PLANS[plan as 'PRO' | 'PRO_PLUS']
    
    const result = await createRazorpayOrder({
      userId: user.id,
      plan: plan as 'PRO' | 'PRO_PLUS',
      amount: planDetails.price,
    })
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    
    return NextResponse.json({
      orderId: result.orderId,
      amount: result.amount,
      currency: result.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
    
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
