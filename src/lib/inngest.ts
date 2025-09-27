import { Inngest } from 'inngest'
import { env } from './env'

export const inngest = new Inngest({
  id: 'houseplant-app',
  eventKey: env.INNGEST_EVENT_KEY,
})

export const events = {
  'plant/reminder.scheduled': {
    data: {
      plantId: 'string',
      userId: 'string',
      scheduledFor: 'string', // ISO date string
    },
  },
  'plant/reminder.send': {
    data: {
      plantId: 'string',
      userId: 'string',
    },
  },
  'plant/feedback.processed': {
    data: {
      plantId: 'string',
      feedback: 'watered' | 'moved' | 'droopy' | 'too_dry',
      confidence: 'number',
    },
  },
  'plant/water.schedule': {
    data: {
      plantId: 'string',
      lastWateredAt: 'string', // ISO date string
    },
  },
} as const
