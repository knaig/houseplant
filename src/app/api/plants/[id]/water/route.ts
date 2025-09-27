import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { inngest } from '@/lib/inngest';

export async function POST(
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
          take: 10
        }
      }
    });

    if (!plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 });
    }

    if (plant.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update plant with manual watering
    const now = new Date();
    const updatedPlant = await db.plant.update({
      where: { id: plantId },
      data: {
        lastWateredAt: now,
        nextWaterDue: null // Will be recalculated by Inngest worker
      },
      include: {
        species: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    // Log manual watering as system message
    await db.message.create({
      data: {
        userId: userId,
        plantId: plantId,
        direction: 'INBOUND',
        channel: 'WHATSAPP', // Using WHATSAPP as default channel for system messages
        body: 'MANUAL_WATERING',
        twilioSid: `manual_${Date.now()}`
      }
    });

    // Trigger Inngest worker to recalculate next watering and schedule reminder
    await inngest.send({
      name: 'plant/feedback.processed',
      data: {
        plantId: plantId,
        feedback: 'watered',
        userId: userId,
        timestamp: now.toISOString()
      }
    });

    return NextResponse.json({ 
      plant: updatedPlant,
      message: 'Plant watered successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error watering plant:', error);
    return NextResponse.json(
      { error: 'Failed to water plant' }, 
      { status: 500 }
    );
  }
}
