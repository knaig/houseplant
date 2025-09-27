import Razorpay from 'razorpay'
import { env } from './env'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
})

export const RAZORPAY_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    plantLimit: 1,
    features: ['1 plant', 'SMS reminders', 'All personalities', 'Basic dashboard']
  },
  PRO: {
    name: 'Pro',
    price: 499, // ₹4.99 in paise
    plantLimit: 10,
    features: ['Up to 10 plants', 'SMS reminders', 'All personalities', 'Advanced dashboard', 'Priority support']
  },
  PRO_PLUS: {
    name: 'Pro Plus',
    price: 999, // ₹9.99 in paise
    plantLimit: 25,
    features: ['Up to 25 plants', 'SMS reminders', 'All personalities', 'Advanced dashboard', 'Priority support', 'Analytics']
  }
} as const

export type RazorpayPlanType = keyof typeof RAZORPAY_PLANS

export async function createRazorpayOrder({
  userId,
  plan,
  amount,
  currency = 'INR'
}: {
  userId: string
  plan: RazorpayPlanType
  amount: number
  currency?: string
}) {
  const options = {
    amount: amount * 100, // Convert to paise
    currency,
    receipt: `plant_${plan}_${userId}_${Date.now()}`,
    notes: {
      userId,
      plan,
    },
  }

  try {
    const order = await razorpay.orders.create(options)
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    }
  } catch (error) {
    console.error('Razorpay order creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function verifyRazorpayPayment({
  orderId,
  paymentId,
  signature
}: {
  orderId: string
  paymentId: string
  signature: string
}) {
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  return expectedSignature === signature
}

export function getPlantLimitForRazorpayPlan(plan: RazorpayPlanType): number {
  return RAZORPAY_PLANS[plan].plantLimit
}

export function canAddPlantRazorpay(currentPlantCount: number, plan: RazorpayPlanType): boolean {
  return currentPlantCount < getPlantLimitForRazorpayPlan(plan)
}
