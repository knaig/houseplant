import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { inngest, events } from '@/lib/inngest'
import { enforcePlantLimit } from '@/lib/billing-middleware'
import { validatePlantName, normalizePlantName } from '@/lib/name-generator'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check plant limit before proceeding
    const limitError = await enforcePlantLimit(request)
    if (limitError) {
      return limitError
    }
    
    const body = await request.json()
    const { token, name, speciesId, potSizeCm, lightLevel, location, personality, lastWateredAt } = body
    
    // Validate and normalize plant name
    const normalizedName = normalizePlantName(name)
    const nameValidation = validatePlantName(normalizedName)
    
    if (!nameValidation.valid) {
      console.log(`Name validation failed for user ${userId}: ${nameValidation.reason}`)
      return NextResponse.json(
        { error: `Invalid plant name: ${nameValidation.reason}` },
        { status: 400 }
      )
    }
    
    // Validate claim token
    const claimToken = await db.claimToken.findUnique({
      where: { token },
    })
    
    if (!claimToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }
    
    if (claimToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
    }
    
    if (claimToken.redeemedByUserId) {
      return NextResponse.json({ error: 'Token has already been redeemed' }, { status: 400 })
    }
    
    // Get user from Clerk ID
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
    
    // Check for name uniqueness within user's collection
    const existingPlants = await db.plant.findMany({
      where: { userId: user.id },
      select: { name: true }
    })
    
    const isNameUnique = !existingPlants.some(plant => 
      plant.name.toLowerCase() === normalizedName.toLowerCase()
    )
    
    if (!isNameUnique) {
      console.log(`Duplicate name attempt for user ${userId}: ${normalizedName}`)
      return NextResponse.json(
        { error: `You already have a plant named "${normalizedName}". Please choose a different name.` },
        { status: 400 }
      )
    }
    
    // Create plant
    const plant = await db.plant.create({
      data: {
        userId: user.id,
        name: normalizedName,
        speciesId,
        potSizeCm,
        lightLevel,
        location,
        personality,
        lastWateredAt: new Date(lastWateredAt),
        claimTokenId: claimToken.id,
      },
      include: {
        species: true,
      },
    })
    
    // Mark token as redeemed
    await db.claimToken.update({
      where: { id: claimToken.id },
      data: { redeemedByUserId: user.id },
    })
    
    // Schedule first reminder
    const nextWaterDue = new Date(new Date(lastWateredAt).getTime() + (plant.species.defaultWaterDays * 24 * 60 * 60 * 1000))
    
    await inngest.send({
      name: 'plant/reminder.scheduled',
      data: {
        plantId: plant.id,
        userId: user.id,
        scheduledFor: nextWaterDue.toISOString(),
      },
    })
    
    // Update plant with next water due
    await db.plant.update({
      where: { id: plant.id },
      data: { nextWaterDue },
    })
    
    return NextResponse.json({ success: true, plant })
    
  } catch (error) {
    console.error('Error claiming plant:', error)
    
    // Handle Prisma unique constraint violation (P2002)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Plant name already exists in your collection. Please choose a different name.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ error: 'Failed to claim plant' }, { status: 500 })
  }
}
