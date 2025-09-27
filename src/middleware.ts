import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/razorpay/webhook',
  '/api/stripe/webhook',
  '/api/twilio/inbound',
  '/claim(.*)',
  '/_next(.*)',
  '/favicon.ico',
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
