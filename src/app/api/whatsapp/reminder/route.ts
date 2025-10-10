import { NextRequest, NextResponse } from 'next/server'
import { whatsappService } from '@/lib/whatsapp'
import { plantCareService } from '@/lib/plant-care'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId, phoneNumber } = await request.json()
    
    if (!userId || !phoneNumber) {
      return NextResponse.json({ error: 'User ID and phone number required' }, { status: 400 })
    }

    // Get user's plants
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        plants: {
          include: { species: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate which plants need watering
    const plantsNeedingWater = []
    
    for (const plant of user.plants) {
      const careCalculation = plantCareService.calculateWateringSchedule(plant)
      
      if (careCalculation.needsWater) {
            plantsNeedingWater.push({
              plantId: plant.id,
              plantName: plant.name,
              speciesName: plant.species.commonName,
              daysOverdue: careCalculation.daysOverdue,
              personality: plant.personality || 'CLASSIC',
              qrCode: plantCareService.generateWateringQRCode(plant.id)
            })
      }
    }

    // Send watering reminder if any plants need water
    if (plantsNeedingWater.length > 0) {
      const success = await whatsappService.sendWateringReminder(phoneNumber, plantsNeedingWater)
      
      if (success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Watering reminder sent',
          plantsNeedingWater: plantsNeedingWater.length
        })
      } else {
        return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 })
      }
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'No plants need watering at this time',
        plantsNeedingWater: 0
      })
    }

  } catch (error) {
    console.error('Error sending watering reminder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user's plants and their watering status
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        plants: {
          include: { species: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate watering status for each plant
    const plantStatus = user.plants.map(plant => {
      const careCalculation = plantCareService.calculateWateringSchedule(plant)
      
      return {
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

    return NextResponse.json({ 
      success: true,
      plants: plantStatus,
      totalPlants: plantStatus.length,
      plantsNeedingWater: plantStatus.filter(p => p.needsWater).length
    })

  } catch (error) {
    console.error('Error getting plant status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
