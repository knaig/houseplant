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
  '/api/inngest(.*)', // Inngest endpoint must be public
  '/api/tokens/validate',
  '/api/plants/claim',
  '/api/species',
  '/claim(.*)',
  '/app(.*)', // Temporarily make app routes public to debug
  '/_next(.*)',
  '/favicon.ico',
])

export default clerkMiddleware((auth, req) => {
  console.log('🔍 Middleware: Request to', req.url, 'isPublic:', isPublicRoute(req))
  
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }
  
  // Check if auth is available before calling protect
  if (!auth) {
    console.error('🔍 Middleware: auth is undefined, redirecting to sign-in')
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
  
  // Use auth.protect() which handles authentication and redirects
  auth.protect()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
