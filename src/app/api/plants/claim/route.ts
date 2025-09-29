import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'
import { inngest, events } from '@/lib/inngest'
import { enforcePlantLimit } from '@/lib/billing-middleware'
import { validatePlantName, normalizePlantName } from '@/lib/name-generator'

export async function GET() {
  return NextResponse.json({ message: 'API route is working' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, name, speciesId, potSizeCm, lightLevel, location, personality, lastWateredAt } = body

    // Validate required fields
    if (!token || !name || !speciesId) {
      return NextResponse.json({
        error: 'Missing required fields: token, name, and speciesId are required'
      }, { status: 400 })
    }

    // Validate token
    const tokenResult = await db.$queryRaw`
      SELECT id, token, "expiresAt", "redeemedByUserId", "createdAt"
      FROM "ClaimToken"
      WHERE token = ${token}
      LIMIT 1
    `

    const claimToken = Array.isArray(tokenResult) && tokenResult.length > 0 ? tokenResult[0] : null

    if (!claimToken) {
      return NextResponse.json({
        error: 'Invalid or expired token'
      }, { status: 400 })
    }

    // Check if token is expired
    if (claimToken.expiresAt < new Date()) {
      return NextResponse.json({
        error: 'Token has expired'
      }, { status: 400 })
    }

    // Check if token is already redeemed
    if (claimToken.redeemedByUserId) {
      return NextResponse.json({
        error: 'Token has already been redeemed'
      }, { status: 400 })
    }

    // Get authenticated user (optional for claim flow)
    const { userId } = await auth()
    
    let user
    if (userId) {
      // User is authenticated - find or create user
      user = await db.user.findUnique({
        where: { clerkId: userId },
        select: {
          id: true,
          email: true,
          clerkId: true,
          createdAt: true
        }
      })
      
      if (!user) {
        user = await db.user.create({
          data: {
            clerkId: userId,
            email: 'user@example.com' // This should come from Clerk user data
          },
          select: {
            id: true,
            email: true,
            clerkId: true,
            createdAt: true
          }
        })
      }
    } else {
      // User is not authenticated - create a temporary user for the claim
      user = await db.user.create({
        data: {
          clerkId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email: `temp-${Date.now()}@temp.com`
        },
        select: {
          id: true,
          email: true,
          clerkId: true,
          createdAt: true
        }
      })
    }
    
    // Create the plant
    const plant = await db.plant.create({
      data: {
        name: name,
        userId: user.id,
        speciesId: speciesId,
        potSizeCm: potSizeCm || 15,
        lightLevel: lightLevel || 'MEDIUM',
        location: location || '',
        personality: personality || 'FUNNY',
        lastWateredAt: lastWateredAt ? new Date(lastWateredAt) : new Date(),
        nextWaterDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        claimTokenId: claimToken.id
      },
      select: {
        id: true,
        name: true,
        speciesId: true,
        potSizeCm: true,
        lightLevel: true,
        location: true,
        personality: true,
        lastWateredAt: true,
        nextWaterDue: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({ 
      message: 'Plant creation successful', 
      user: user,
      plant: plant,
      token: claimToken
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error processing POST request:', error)
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error.message,
      type: error.constructor.name
    }, { status: 500 })
  }
}