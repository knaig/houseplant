import { serve } from 'inngest/next'
import { inngest, events } from '@/lib/inngest'
import { db } from '@/lib/db'
import { sendWhatsApp, getOrCreateUserConversation, sendConversationMessage } from '@/lib/twilio'
import { getPersonalityMessage } from '@/lib/personalities'
import { sendWateringReminders, sendTestReminder } from '@/lib/jobs/watering-reminders'

// Schedule reminder job
export const scheduleReminder = inngest.createFunction(
  { id: 'schedule-reminder' },
  { event: events['plant/reminder.scheduled'] as any },
  async ({ event }) => {
    const { plantId, scheduledFor } = event.data
    
    // Schedule the actual reminder
    await inngest.send({
      name: 'plant/reminder.send',
      data: {
        plantId,
        userId: event.data.userId,
      },
      // Schedule for the specified time
      ts: new Date(scheduledFor).getTime(),
    } as any)
  }
)

// Send reminder job
export const sendReminder = inngest.createFunction(
  { id: 'send-reminder' },
  { event: events['plant/reminder.send'] as any },
  async ({ event }) => {
    const { plantId, userId } = event.data
    
    // Get plant and user data
    const plant = await db.plant.findUnique({
      where: { id: plantId },
      include: {
        user: {
          include: {
            plants: true,
          },
        },
        species: true,
      },
    })
    
    if (!plant || !plant.user.phoneE164) {
      console.error('Plant or user phone not found:', { plantId, userId })
      return
    }
    
    // Calculate hours until next watering
    const now = new Date()
    const hoursLeft = plant.nextWaterDue 
      ? Math.max(0, Math.ceil((plant.nextWaterDue.getTime() - now.getTime()) / (1000 * 60 * 60)))
      : 0
    
    // Generate reminder message
    const message = getPersonalityMessage(
      plant.personality,
      'reminder',
      {
        plantName: plant.name,
        hoursLeft: hoursLeft,
      }
    )
    
    // Try to send via conversation first, fallback to individual WhatsApp
    let result
    let conversationId = null
    
    try {
      // Get or create user conversation
      const conversationResult = await getOrCreateUserConversation({
        id: plant.user.id,
        phoneE164: plant.user.phoneE164,
        plants: plant.user.plants.map(p => ({
          id: p.id,
          name: p.name,
          personality: p.personality,
        })),
      })
      
      if (conversationResult.success) {
        // Send message to conversation with plant as author
        const conversationMessage = `${plant.name} 🌱: ${message}`
        result = await sendConversationMessage({
          conversationSid: conversationResult.conversationSid!,
          author: `plant_${plant.id}`,
          body: conversationMessage,
        })
        
        // Get conversation ID for logging
        if (conversationResult.conversationId) {
          conversationId = conversationResult.conversationId
        }
        
        console.log('Sent conversation message:', result)
      } else {
        throw new Error(`Conversation failed: ${conversationResult.error}`)
      }
    } catch (error) {
      console.warn('Failed to send conversation message, falling back to individual WhatsApp:', error)
      
      // Fallback to individual WhatsApp message
      result = await sendWhatsApp({
        to: plant.user.phoneE164,
        body: message,
      })
      
      console.log('Sent individual WhatsApp message:', result)
    }
    
    // Log the message
    await db.message.create({
      data: {
        userId: plant.userId,
        plantId: plant.id,
        direction: 'OUTBOUND',
        channel: 'WHATSAPP',
        body: result.success ? (conversationId ? `${plant.name} 🌱: ${message}` : message) : message,
        twilioSid: result.success ? result.sid : null,
        conversationId,
      },
    })
    
    if (!result.success) {
      console.error('Failed to send reminder WhatsApp:', result.error)
      throw new Error(`Failed to send WhatsApp: ${result.error}`)
    }
  }
)

// Process feedback job
export const processFeedback = inngest.createFunction(
  { id: 'process-feedback' },
  { event: events['plant/feedback.processed'] as any },
  async ({ event }) => {
    const { plantId, feedback, confidence } = event.data
    
    const plant = await db.plant.findUnique({
      where: { id: plantId },
      include: { species: true },
    })
    
    if (!plant) {
      console.error('Plant not found:', plantId)
      return
    }
    
    const now = new Date()
    
    if (feedback === 'watered') {
      // Use custom watering days if set, otherwise use species default
      const wateringDays = plant.customWaterDays ?? plant.species.defaultWaterDays;
      
      // Update last watered and schedule next
      await db.plant.update({
        where: { id: plantId },
        data: {
          lastWateredAt: now,
          nextWaterDue: new Date(now.getTime() + (wateringDays * 24 * 60 * 60 * 1000)),
          moistureBias: Math.max(-2, plant.moistureBias - 0.5), // Slightly reduce bias
        },
      })
      
      // Schedule next reminder
      const nextWaterDue = new Date(now.getTime() + (wateringDays * 24 * 60 * 60 * 1000))
      await inngest.send({
        name: 'plant/reminder.scheduled',
        data: {
          plantId,
          userId: plant.userId,
          scheduledFor: nextWaterDue.toISOString(),
        },
      } as any)
      
    } else if (feedback === 'too_dry') {
      // Increase watering frequency
      await db.plant.update({
        where: { id: plantId },
        data: {
          moistureBias: Math.min(2, plant.moistureBias + 1), // Increase bias
        },
      })
      
    } else if (feedback === 'droopy') {
      // Slight increase in frequency
      await db.plant.update({
        where: { id: plantId },
        data: {
          moistureBias: Math.min(2, plant.moistureBias + 0.5),
        },
      })
    }
  }
)

// Schedule next watering job
export const scheduleNextWatering = inngest.createFunction(
  { id: 'schedule-next-watering' },
  { event: events['plant/water.schedule'] as any },
  async ({ event }) => {
    const { plantId, lastWateredAt } = event.data
    
    const plant = await db.plant.findUnique({
      where: { id: plantId },
      include: { species: true },
    })
    
    if (!plant) {
      console.error('Plant not found:', plantId)
      return
    }
    
    // Calculate next watering with bias adjustment
    const baseDays = plant.customWaterDays ?? plant.species.defaultWaterDays
    const adjustedDays = Math.max(1, baseDays + plant.moistureBias)
    const nextWaterDue = new Date(new Date(lastWateredAt).getTime() + (adjustedDays * 24 * 60 * 60 * 1000))
    
    await db.plant.update({
      where: { id: plantId },
      data: {
        nextWaterDue,
      },
    })
    
    // Schedule reminder
    await inngest.send({
      name: 'plant/reminder.scheduled',
      data: {
        plantId,
        userId: plant.userId,
        scheduledFor: nextWaterDue.toISOString(),
      },
    } as any)
  }
)

// Recalculate schedule job
export const recalculateSchedule = inngest.createFunction(
  { id: 'recalculate-schedule' },
  { event: events['plant/schedule.recalculated'] as any },
  async ({ event }) => {
    const { plantId, userId, reason } = event.data
    
    const plant = await db.plant.findUnique({
      where: { id: plantId },
      include: { species: true },
    })
    
    if (!plant || !plant.lastWateredAt) {
      console.error('Plant not found or no watering history:', plantId)
      return
    }
    
    // Use custom watering days if set, otherwise use species default
    const wateringDays = plant.customWaterDays ?? plant.species.defaultWaterDays;
    const adjustedDays = Math.max(1, wateringDays + plant.moistureBias);
    const nextWaterDue = new Date(plant.lastWateredAt.getTime() + (adjustedDays * 24 * 60 * 60 * 1000));
    
    await db.plant.update({
      where: { id: plantId },
      data: {
        nextWaterDue,
      },
    })
    
    // Schedule new reminder
    await inngest.send({
      name: 'plant/reminder.scheduled',
      data: {
        plantId,
        userId: plant.userId,
        scheduledFor: nextWaterDue.toISOString(),
      },
    } as any)
    
    console.log(`Recalculated schedule for plant ${plantId} due to: ${reason}`)
  }
)

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    scheduleReminder,
    sendReminder,
    processFeedback,
    scheduleNextWatering,
    recalculateSchedule,
    sendWateringReminders,
    sendTestReminder,
  ],
})
