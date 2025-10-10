import { inngest } from '@/lib/inngest'
import { whatsappService } from '@/lib/whatsapp'
import { plantCareService } from '@/lib/plant-care'
import { db } from '@/lib/db'

// Send watering reminders every day at 9 AM
export const sendWateringReminders = inngest.createFunction(
  { id: 'send-watering-reminders' },
  { cron: '0 9 * * *' }, // 9 AM daily
  async ({ event }) => {
    console.log('Starting watering reminder job...')

    try {
      // Get all users who have opted in to WhatsApp notifications
      const users = await db.user.findMany({
        where: {
          whatsappOptIn: true,
          phoneE164: { not: null }
        },
        include: {
          plants: {
            include: { species: true }
          }
        }
      })

      console.log(`Found ${users.length} users with WhatsApp opt-in`)

      let totalRemindersSent = 0
      let totalUsersNotified = 0

      for (const user of users) {
        try {
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

          // Send reminder if any plants need water
          if (plantsNeedingWater.length > 0 && user.phoneE164) {
            const success = await whatsappService.sendWateringReminder(
              user.phoneE164, 
              plantsNeedingWater
            )
            
            if (success) {
              totalRemindersSent += plantsNeedingWater.length
              totalUsersNotified++
              console.log(`Sent reminder to user ${user.id} for ${plantsNeedingWater.length} plants`)
            } else {
              console.error(`Failed to send reminder to user ${user.id}`)
            }
          }
        } catch (error) {
          console.error(`Error processing user ${user.id}:`, error)
        }
      }

      console.log(`Watering reminder job completed: ${totalRemindersSent} reminders sent to ${totalUsersNotified} users`)

      return {
        success: true,
        totalUsers: users.length,
        totalUsersNotified,
        totalRemindersSent
      }

    } catch (error) {
      console.error('Error in watering reminder job:', error)
      throw error
    }
  }
)

// Send test reminder (for testing purposes)
export const sendTestReminder = inngest.createFunction(
  { id: 'send-test-reminder' },
  { event: 'test/reminder' },
  async ({ event }) => {
    const { userId, phoneNumber } = event.data

    if (!userId || !phoneNumber) {
      throw new Error('User ID and phone number required')
    }

    try {
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
        throw new Error('User not found')
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

      // Send test reminder
      if (plantsNeedingWater.length > 0) {
        const success = await whatsappService.sendWateringReminder(phoneNumber, plantsNeedingWater)
        
        if (success) {
          return {
            success: true,
            message: 'Test reminder sent successfully',
            plantsNeedingWater: plantsNeedingWater.length
          }
        } else {
          throw new Error('Failed to send test reminder')
        }
      } else {
        return {
          success: true,
          message: 'No plants need watering at this time',
          plantsNeedingWater: 0
        }
      }

    } catch (error) {
      console.error('Error sending test reminder:', error)
      throw error
    }
  }
)
