import { NextRequest, NextResponse } from 'next/server'
import { getFreshDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }
    
    console.log('🔍 Validating token on page load:', token)
    
    const freshDb = getFreshDb()
    
    try {
      // Find the specific token using findUnique to avoid pagination issues
      const claimToken = await freshDb.claimToken.findUnique({
        where: { token }
      })
      
      console.log('🔍 Token validation result:', claimToken ? 'VALID' : 'INVALID')
      
      if (!claimToken) {
        return NextResponse.json({ 
          error: 'Invalid token - token not found in database' 
        }, { status: 400 })
      }
      
      if (claimToken.expiresAt < new Date()) {
        return NextResponse.json({ 
          error: 'Token has expired' 
        }, { status: 400 })
      }
      
      if (claimToken.redeemedByUserId) {
        return NextResponse.json({ 
          error: 'Token has already been used' 
        }, { status: 400 })
      }
      
      await freshDb.$disconnect()
      
      return NextResponse.json({ 
        valid: true,
        message: 'Token is valid'
      })
      
    } catch (dbError) {
      console.error('🔍 Database error during token validation:', dbError)
      await freshDb.$disconnect()
      return NextResponse.json({ 
        error: 'Database error during token validation' 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error validating token:', error)
    return NextResponse.json({ 
      error: 'Failed to validate token' 
    }, { status: 500 })
  }
}
