// Test setup file
import '@testing-library/jest-dom'

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.CLERK_SECRET_KEY = 'test-key'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-publishable-key'
process.env.STRIPE_SECRET_KEY = 'test-stripe-key'
process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-secret'
process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO = 'test-price'
process.env.TWILIO_ACCOUNT_SID = 'test-sid'
process.env.TWILIO_AUTH_TOKEN = 'test-token'
process.env.TWILIO_MESSAGING_SERVICE_SID = 'test-service-sid'
process.env.APP_BASE_URL = 'http://localhost:3000'
