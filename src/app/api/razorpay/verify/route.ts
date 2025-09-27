import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { verifyRazorpayPayment } from '@/lib/razorpay'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { orderId, paymentId, signature, plan } = await request.json()
    
    if (!orderId || !paymentId || !signature || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Verify payment signature
    const isValid = await verifyRazorpayPayment({
      orderId,
      paymentId,
      signature,
    })
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }
    
    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Create or update subscription
    await db.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeCustomerId: `razorpay_${paymentId}`, // Use Razorpay payment ID as customer ID
        stripeSubId: `razorpay_${orderId}`, // Use Razorpay order ID as subscription ID
        plan: plan as 'PRO' | 'PRO_PLUS',
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      create: {
        userId: user.id,
        stripeCustomerId: `razorpay_${paymentId}`,
        stripeSubId: `razorpay_${orderId}`,
        plan: plan as 'PRO' | 'PRO_PLUS',
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}
