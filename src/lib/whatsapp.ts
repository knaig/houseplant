import { Plant, Personality } from '@prisma/client'

export interface AiSensyMessage {
  apiKey: string
  campaignName: string
  destination: string
  userName: string
  templateParams: string[]
}

export interface WateringReminder {
  plantId: string
  plantName: string
  speciesName: string
  daysOverdue: number
  personality: Personality
  qrCode: string
}

export class WhatsAppService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.AISENSY_API_KEY || ''
    this.baseUrl = 'https://backend.aisensy.com/campaign/t1/api/v2'
  }

  /**
   * Send a WhatsApp message via AiSensy
   */
  async sendMessage(message: AiSensyMessage): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('AiSensy API Error:', error)
        return false
      }

      const result = await response.json()
      console.log('WhatsApp message sent successfully via AiSensy:', result)
      return true
    } catch (error) {
      console.error('Error sending WhatsApp message via AiSensy:', error)
      return false
    }
  }

  /**
   * Send watering reminder with plant personality
   */
  async sendWateringReminder(phoneNumber: string, reminders: WateringReminder[], userName: string = 'Plant Parent'): Promise<boolean> {
    if (reminders.length === 0) return true

    const personalityMessages = {
      FUNNY: {
        header: "🌱 Your plants are getting thirsty! 😄",
        footer: "Time to be a plant hero! 💪"
      },
      COACH: {
        header: "🏆 Plant Care Challenge!",
        footer: "You've got this! Let's keep your plants thriving! 💪"
      },
      ZEN: {
        header: "🧘‍♀️ Mindful Plant Care Moment",
        footer: "Take a peaceful moment to nurture your green friends 🌿"
      },
      CLASSIC: {
        header: "🌿 Plant Care Reminder",
        footer: "Your plants need attention today"
      }
    }

    // Use the personality of the first plant (or most urgent)
    const primaryPersonality = reminders[0].personality
    const personalityStyle = personalityMessages[primaryPersonality]

    // Create bullet points for each plant
    const plantList = reminders.map(reminder => {
      const urgency = reminder.daysOverdue > 0 ? 
        `${reminder.daysOverdue} day${reminder.daysOverdue > 1 ? 's' : ''} overdue` : 
        'Due today'
      
      return `${reminder.plantName} (${reminder.speciesName}) - ${urgency}`
    }).join(', ')

    // Create message for AiSensy template
    const message: AiSensyMessage = {
      apiKey: this.apiKey,
      campaignName: 'watering_reminder', // Use proper watering reminder campaign
      destination: phoneNumber,
      userName: userName,
      templateParams: [
        userName,
        plantList,
        personalityStyle.header,
        personalityStyle.footer
      ]
    }

    return await this.sendMessage(message)
  }

  /**
   * Send QR code scan message (when user scans QR to claim plant)
   */
  async sendQRScanMessage(phoneNumber: string, plantName: string, userName: string = 'Plant Parent'): Promise<boolean> {
    const message: AiSensyMessage = {
      apiKey: this.apiKey,
      campaignName: 'qr_scan_welcome', // Use proper QR scan campaign
      destination: phoneNumber,
      userName: userName,
      templateParams: [
        userName,
        plantName,
        process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
      ]
    }

    return await this.sendMessage(message)
  }

  /**
   * Send opt-in confirmation message
   */
  async sendOptInConfirmation(phoneNumber: string, userName: string = 'Plant Parent'): Promise<boolean> {
    const message: AiSensyMessage = {
      apiKey: this.apiKey,
      campaignName: 'optin_confirmation', // Use proper opt-in campaign
      destination: phoneNumber,
      userName: userName,
      templateParams: [
        userName,
        process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
      ]
    }

    return await this.sendMessage(message)
  }

  /**
   * Send watering confirmation message
   */
  async sendWateringConfirmation(phoneNumber: string, plantName: string, userName: string = 'Plant Parent'): Promise<boolean> {
    const message: AiSensyMessage = {
      apiKey: this.apiKey,
      campaignName: 'watering_confirmation', // Use proper watering confirmation campaign
      destination: phoneNumber,
      userName: userName,
      templateParams: [
        userName,
        plantName
      ]
    }

    return await this.sendMessage(message)
  }
}

export const whatsappService = new WhatsAppService()
