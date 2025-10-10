import { NextRequest, NextResponse } from 'next/server'
import { plantCareService } from '@/lib/plant-care'
import { whatsappService } from '@/lib/whatsapp'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { plantId, userId, phoneNumber } = await request.json()
    
    if (!plantId || !userId) {
      return NextResponse.json({ error: 'Plant ID and User ID required' }, { status: 400 })
    }

    // Verify the plant belongs to the user
    const plant = await db.plant.findFirst({
      where: { 
        id: plantId,
        userId: userId
      },
      include: { species: true }
    })

    if (!plant) {
      return NextResponse.json({ error: 'Plant not found or access denied' }, { status: 404 })
    }

    // Update plant's last watered date
    const now = new Date()
    await db.plant.update({
      where: { id: plantId },
      data: { lastWateredAt: now }
    })

    // Send confirmation message if phone number provided
    if (phoneNumber) {
      await whatsappService.sendWateringConfirmation(phoneNumber, plant.name)
    }

    // Calculate next watering date
    const careCalculation = plantCareService.calculateWateringSchedule({
      ...plant,
      lastWateredAt: now
    })

    return NextResponse.json({ 
      success: true,
      message: 'Plant marked as watered',
      plant: {
        id: plant.id,
        name: plant.name,
        lastWateredAt: now,
        nextWaterDue: careCalculation.nextWaterDue
      }
    })

  } catch (error) {
    console.error('Error marking plant as watered:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const plantId = searchParams.get('plant')
    
    if (!plantId) {
      return NextResponse.json({ error: 'Plant ID required' }, { status: 400 })
    }

    // Get plant details
    const plant = await db.plant.findUnique({
      where: { id: plantId },
      include: { 
        species: true,
        user: true
      }
    })

    if (!plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    // Calculate watering status
    const careCalculation = plantCareService.calculateWateringSchedule(plant)

    return NextResponse.json({ 
      success: true,
      plant: {
        id: plant.id,
        name: plant.name,
        species: plant.species.commonName,
        lastWateredAt: plant.lastWateredAt,
        nextWaterDue: careCalculation.nextWaterDue,
        daysOverdue: careCalculation.daysOverdue,
        needsWater: careCalculation.needsWater,
        wateringQRCode: plantCareService.generateWateringQRCode(plant.id)
      }
    })

  } catch (error) {
    console.error('Error getting plant watering status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
