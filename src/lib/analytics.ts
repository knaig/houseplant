// Analytics and monitoring utilities

export function trackEvent(event: string, properties?: Record<string, any>) {
  // PostHog tracking
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture(event, properties)
  }
  
  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', event, properties)
  }
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.identify(userId, properties)
  }
}

// Common events
export const events = {
  USER_SIGNED_UP: 'user_signed_up',
  PLANT_CLAIMED: 'plant_claimed',
  PLANT_ADDED: 'plant_added',
  SMS_SENT: 'sms_sent',
  SMS_REPLIED: 'sms_replied',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  QR_CODE_GENERATED: 'qr_code_generated',
  PLANT_WATERED: 'plant_watered',
} as const
