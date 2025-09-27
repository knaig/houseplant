import { getPersonalityMessage, PERSONALITIES } from '@/lib/personalities'

describe('Personality Messages', () => {
  test('should format funny personality message', () => {
    const message = getPersonalityMessage('FUNNY', 'reminder', {
      plantName: 'Frank',
      hoursLeft: 24,
    })
    
    expect(message).toContain('Frank')
    expect(message).toContain('24')
    expect(message).toContain('🌿')
  })
  
  test('should format coach personality message', () => {
    const message = getPersonalityMessage('COACH', 'reminder', {
      plantName: 'Motivational Monstera',
      hoursLeft: 12,
    })
    
    expect(message).toContain('Motivational Monstera')
    expect(message).toContain('12')
    expect(message).toContain('consistent')
  })
  
  test('should format zen personality message', () => {
    const message = getPersonalityMessage('ZEN', 'reminder', {
      plantName: 'Zen Master',
      hoursLeft: 6,
    })
    
    expect(message).toContain('Zen Master')
    expect(message).toContain('6')
    expect(message).toContain('balance')
  })
  
  test('should format classic personality message', () => {
    const message = getPersonalityMessage('CLASSIC', 'reminder', {
      plantName: 'Classic Plant',
      hoursLeft: 8,
    })
    
    expect(message).toContain('Classic Plant')
    expect(message).toContain('8')
    expect(message).toContain('watered')
  })
  
  test('should have all required message types for each personality', () => {
    const requiredTypes = ['onboarding', 'reminder', 'nudge', 'congrats', 'seasonalTip', 'help']
    
    Object.keys(PERSONALITIES).forEach(personality => {
      requiredTypes.forEach(type => {
        expect(PERSONALITIES[personality][type as keyof typeof PERSONALITIES.FUNNY]).toBeDefined()
        expect(PERSONALITIES[personality][type as keyof typeof PERSONALITIES.FUNNY]).not.toBe('')
      })
    })
  })
})
