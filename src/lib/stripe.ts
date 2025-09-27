import Stripe from 'stripe'
import { env } from './env'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
})

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    plantLimit: 1,
    features: ['1 plant', 'SMS reminders', 'All personalities', 'Basic dashboard']
  },
  PRO: {
    name: 'Pro',
    price: 599, // $5.99 in cents
    plantLimit: 10,
    features: ['Up to 10 plants', 'SMS reminders', 'All personalities', 'Advanced dashboard', 'Priority support']
  },
  PRO_PLUS: {
    name: 'Pro Plus',
    price: 999, // $9.99 in cents
    plantLimit: 25,
    features: ['Up to 25 plants', 'SMS reminders', 'All personalities', 'Advanced dashboard', 'Priority support', 'Analytics']
  }
} as const

export type PlanType = keyof typeof PLANS

export async function createCheckoutSession({
  userId,
  plan,
  successUrl,
  cancelUrl
}: {
  userId: string
  plan: PlanType
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
    },
  })

  return session
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export function getPlantLimitForPlan(plan: PlanType): number {
  return PLANS[plan].plantLimit
}

export function canAddPlant(currentPlantCount: number, plan: PlanType): boolean {
  return currentPlantCount < getPlantLimitForPlan(plan)
}
