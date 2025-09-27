import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')
    
    if (expectedSignature !== signature) {
      console.error('Razorpay webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    const event = JSON.parse(body)
    
    console.log('Received Razorpay webhook event:', event.event)
    
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity
        
        // Find subscription by Razorpay payment ID
        const subscription = await db.subscription.findFirst({
          where: {
            stripeCustomerId: `razorpay_${payment.id}`,
          },
        })
        
        if (subscription) {
          await db.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'ACTIVE',
            },
          })
          
          console.log('Subscription activated for payment:', payment.id)
        }
        break
      }
      
      case 'payment.failed': {
        const payment = event.payload.payment.entity
        
        // Find subscription by Razorpay payment ID
        const subscription = await db.subscription.findFirst({
          where: {
            stripeCustomerId: `razorpay_${payment.id}`,
          },
        })
        
        if (subscription) {
          await db.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'PAST_DUE',
            },
          })
          
          console.log('Subscription marked as past due for failed payment:', payment.id)
        }
        break
      }
      
      default:
        console.log(`Unhandled Razorpay event type: ${event.event}`)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
