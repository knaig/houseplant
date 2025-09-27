import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Clerk Auth
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PRICE_PRO: z.string().min(1),
  
  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  
  // Twilio
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_MESSAGING_SERVICE_SID: z.string().min(1),
  TWILIO_WHATSAPP_FROM: z.string().regex(/^whatsapp:\+\d{10,15}$/),
  TWILIO_STATUS_CALLBACK_URL: z.string().url().optional(),
  TWILIO_API_KEY: z.string().min(1).optional(),
  TWILIO_API_SECRET: z.string().min(1).optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  
  // Background Jobs
  INNGEST_EVENT_KEY: z.string().min(1).optional(),
  
  // App URLs
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),
})

export const env = envSchema.parse(process.env)
