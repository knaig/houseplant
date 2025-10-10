import { Plant, Species, Personality } from '@prisma/client'
import { WateringReminder } from './whatsapp'

export interface PlantCareCalculation {
  baseWaterDays: number
  adjustedWaterDays: number
  factors: {
    potSize: number
    lightLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    season: 'spring' | 'summer' | 'autumn' | 'winter'
    humidity: 'low' | 'medium' | 'high'
  }
  lastWateredAt: Date
  nextWaterDue: Date
  daysOverdue: number
  needsWater: boolean
}

export class PlantCareService {
  /**
   * Calculate when a plant needs watering based on species and conditions
   */
  calculateWateringSchedule(plant: Plant & { species: Species }): PlantCareCalculation {
    const now = new Date()
    const lastWatered = plant.lastWateredAt ? new Date(plant.lastWateredAt) : new Date()
    
    // Base watering frequency from species
    let baseWaterDays = plant.species.defaultWaterDays || 7
    
    // Adjust based on pot size (larger pots hold more water)
    const potSizeFactor = plant.potSizeCm 
      ? Math.max(0.7, Math.min(1.3, plant.potSizeCm / 15))
      : 1.0
    
    // Adjust based on light level
    const lightFactor = plant.lightLevel ? {
      'LOW': 1.2,    // Less light = less water needed
      'MEDIUM': 1.0, // Normal watering
      'HIGH': 0.8    // More light = more water needed
    }[plant.lightLevel] : 1.0
    
    // Adjust based on season (simplified - assumes northern hemisphere)
    const currentMonth = now.getMonth() + 1
    const season = this.getSeason(currentMonth)
    const seasonFactor = {
      'spring': 1.0,
      'summer': 0.8,  // More frequent watering in summer
      'autumn': 1.1,
      'winter': 1.3   // Less frequent watering in winter
    }[season]
    
    // Calculate adjusted watering frequency
    const adjustedWaterDays = Math.round(baseWaterDays * potSizeFactor * lightFactor * seasonFactor)
    
    // Calculate next watering date
    const nextWaterDue = new Date(lastWatered)
    nextWaterDue.setDate(nextWaterDue.getDate() + adjustedWaterDays)
    
    // Calculate days overdue
    const daysOverdue = Math.max(0, Math.floor((now.getTime() - nextWaterDue.getTime()) / (1000 * 60 * 60 * 24)))
    
    // Determine if plant needs water (overdue by 1+ days)
    const needsWater = daysOverdue >= 1
    
    return {
      baseWaterDays,
      adjustedWaterDays,
      factors: {
        potSize: plant.potSizeCm || 15,
        lightLevel: plant.lightLevel || 'MEDIUM',
        season,
        humidity: 'medium' // Default assumption
      },
      lastWateredAt: lastWatered,
      nextWaterDue,
      daysOverdue,
      needsWater
    }
  }

  /**
   * Get season based on month
   */
  private getSeason(month: number): 'spring' | 'summer' | 'autumn' | 'winter' {
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'autumn'
    return 'winter'
  }

  /**
   * Get all plants that need watering for a user
   */
  async getPlantsNeedingWater(userId: string): Promise<WateringReminder[]> {
    // This would typically query the database
    // For now, returning mock data structure
    return []
  }

  /**
   * Update plant's last watered date
   */
  async markPlantAsWatered(plantId: string, userId: string): Promise<boolean> {
    // This would update the database
    // For now, returning true
    return true
  }

  /**
   * Generate QR code for plant watering confirmation
   */
  generateWateringQRCode(plantId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
    return `${baseUrl}/water?plant=${plantId}`
  }

  /**
   * Parse QR code to get plant ID
   */
  parseWateringQRCode(qrData: string): string | null {
    try {
      const url = new URL(qrData)
      if (url.pathname === '/water' && url.searchParams.has('plant')) {
        return url.searchParams.get('plant')
      }
    } catch {
      // Not a valid URL
    }
    return null
  }

  /**
   * Calculate optimal watering time based on AI analysis
   */
  async calculateOptimalWateringTime(plant: Plant & { species: Species }): Promise<{
    recommendedDays: number
    confidence: number
    reasoning: string
  }> {
    // This would integrate with OpenAI or similar AI service
    // For now, returning calculated values
    
    const calculation = this.calculateWateringSchedule(plant)
    
    return {
      recommendedDays: calculation.adjustedWaterDays,
      confidence: 0.85,
      reasoning: `Based on ${plant.species.commonName} requirements, ${plant.potSizeCm}cm pot size, ${plant.lightLevel.toLowerCase()} light conditions, and current season.`
    }
  }
}

export const plantCareService = new PlantCareService()
