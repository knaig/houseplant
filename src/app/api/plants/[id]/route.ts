import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { Personality, LightLevel } from '@prisma/client';
import { z } from 'zod';

// Validation schema for plant updates
const updatePlantSchema = z.object({
  personality: z.nativeEnum(Personality).optional(),
  lightLevel: z.nativeEnum(LightLevel).optional(),
  location: z.string().min(1).max(100).optional(),
  potSizeCm: z.number().int().min(10).max(100).optional(),
  customWaterDays: z.number().int().min(1).max(30).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plantId = params.id;
    if (!plantId) {
      return NextResponse.json({ error: 'Plant ID is required' }, { status: 400 });
    }

    // Find plant and validate ownership
    const plant = await db.plant.findUnique({
      where: { id: plantId },
      include: {
        species: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    if (plant.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ plant }, { status: 200 });

  } catch (error) {
    console.error('Error fetching plant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plant' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plantId = params.id;
    if (!plantId) {
      return NextResponse.json({ error: 'Plant ID is required' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updatePlantSchema.parse(body);

    // Find plant and validate ownership
    const existingPlant = await db.plant.findUnique({
      where: { id: plantId },
      include: { species: true }
    });

    if (!existingPlant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    if (existingPlant.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.personality !== undefined) {
      updateData.personality = validatedData.personality;
    }
    
    if (validatedData.lightLevel !== undefined) {
      updateData.lightLevel = validatedData.lightLevel;
    }
    
    if (validatedData.location !== undefined) {
      updateData.location = validatedData.location;
    }
    
    if (validatedData.potSizeCm !== undefined) {
      updateData.potSizeCm = validatedData.potSizeCm;
    }
    
    if (validatedData.customWaterDays !== undefined) {
      updateData.customWaterDays = validatedData.customWaterDays;
    }

    // Update plant
    const updatedPlant = await db.plant.update({
      where: { id: plantId },
      data: updateData,
      include: {
        species: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    // Log settings change as system message
    const changes = Object.keys(validatedData).join(', ');
    await db.message.create({
      data: {
        userId: userId,
        plantId: plantId,
        direction: 'INBOUND',
        channel: 'WHATSAPP',
        body: `SETTINGS_UPDATED: ${changes}`,
        twilioSid: `settings_${Date.now()}`
      }
    });

    // If watering schedule changed, recalculate next watering
    if (validatedData.customWaterDays !== undefined && existingPlant.lastWateredAt) {
      const { inngest } = await import('@/lib/inngest');
      await inngest.send({
        name: 'plant/schedule.recalculated',
        data: {
          plantId: plantId,
          userId: userId,
          reason: 'custom_watering_days_updated'
        }
      });
    }

    return NextResponse.json({ 
      plant: updatedPlant,
      message: 'Plant settings updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating plant:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update plant' }, 
      { status: 500 }
    );
  }
}
