import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { generateQRCode, createClaimToken } from '@/lib/qr'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // In a real app, you'd check if user has admin role
    // For now, we'll allow any authenticated user
    
    const { count } = await request.json()
    
    if (!count || count < 1 || count > 100) {
      return NextResponse.json({ error: 'Count must be between 1 and 100' }, { status: 400 })
    }
    
    const qrCodes = []
    
    for (let i = 0; i < count; i++) {
      const token = createClaimToken()
      
      // Create claim token in database
      await db.claimToken.create({
        data: {
          token,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })
      
      // Generate QR code
      const qrCode = await generateQRCode({ token })
      
      qrCodes.push({
        token,
        qrCode,
      })
    }
    
    return NextResponse.json({ qrCodes })
    
  } catch (error) {
    console.error('Error generating QR codes:', error)
    return NextResponse.json({ error: 'Failed to generate QR codes' }, { status: 500 })
  }
}
