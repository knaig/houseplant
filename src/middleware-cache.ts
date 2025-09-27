import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function cacheMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Cache static assets for 1 year
  if (request.nextUrl.pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  // Cache images for 1 month
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=2592000')
  }
  
  // Cache API responses for 5 minutes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=300')
  }
  
  return response
}
