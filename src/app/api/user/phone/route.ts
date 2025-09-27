import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { normalizeIndianNumber, validateIndianMobile } from '@/lib/utils'

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { phone } = await request.json()
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }
    
    // Validate Indian mobile number format
    if (!validateIndianMobile(phone)) {
      return NextResponse.json({ 
        error: 'Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9). Examples: 9876543210, +919876543210' 
      }, { status: 400 })
    }
    
    // Normalize phone number to E.164 format
    let normalizedPhone: string
    try {
      normalizedPhone = normalizeIndianNumber(phone)
    } catch (error) {
      return NextResponse.json({ 
        error: 'Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9). Examples: 9876543210, +919876543210' 
      }, { status: 400 })
    }
    
    console.log('Phone normalization:', { original: phone, normalized: normalizedPhone })
    
    // Get user from database
    let user = await db.user.findUnique({
      where: { clerkId: userId },
    })
    
    if (!user) {
      // Create user if doesn't exist
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: '', // Will be updated when we get email from Clerk
        },
      })
    }
    
    // Update phone number with normalized format
    await db.user.update({
      where: { id: user.id },
      data: { phoneE164: normalizedPhone },
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error updating phone:', error)
    return NextResponse.json({ error: 'Failed to update phone number' }, { status: 500 })
  }
}
