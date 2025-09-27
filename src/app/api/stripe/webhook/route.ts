import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }
    
    let event
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    console.log('Received webhook event:', event.type)
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          // Find user by metadata
          const userId = session.metadata?.userId
          if (!userId) {
            console.error('No userId in session metadata')
            break
          }
          
          // Update or create subscription
          await db.subscription.upsert({
            where: { userId },
            update: {
              stripeCustomerId: session.customer as string,
              stripeSubId: subscription.id,
              plan: (session.metadata?.plan as 'PRO' | 'PRO_PLUS') || 'PRO',
              status: 'ACTIVE',
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            },
            create: {
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubId: subscription.id,
              plan: (session.metadata?.plan as 'PRO' | 'PRO_PLUS') || 'PRO',
              status: 'ACTIVE',
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            },
          })
          
          console.log('Subscription created/updated for user:', userId)
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        // Find subscription in database
        const dbSubscription = await db.subscription.findUnique({
          where: { stripeSubId: subscription.id },
        })
        
        if (dbSubscription) {
          await db.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              status: subscription.status === 'active' ? 'ACTIVE' : 
                     subscription.status === 'past_due' ? 'PAST_DUE' : 'CANCELED',
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            },
          })
          
          console.log('Subscription updated:', subscription.id)
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        // Find and cancel subscription
        const dbSubscription = await db.subscription.findUnique({
          where: { stripeSubId: subscription.id },
        })
        
        if (dbSubscription) {
          await db.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              status: 'CANCELED',
            },
          })
          
          console.log('Subscription canceled:', subscription.id)
        }
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
