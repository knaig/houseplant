#!/bin/bash

# Setup Vercel Environment Variables
echo "Setting up Vercel environment variables..."

# Database
vercel env add DATABASE_URL production <<< "postgresql://bebrahma:bebrahma@localhost:5432/bebrahma"

# Clerk
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production <<< "pk_test_cGxlYXNpbmctbWFybW9zZXQtODEuY2xlcmsuYWNjb3VudHMuZGV2JA"
vercel env add CLERK_SECRET_KEY production <<< "sk_test_7jvbPqV0g1iZwjuIMfZnaLg9HKWQlmQkwKuhBmVCQE"

# Razorpay
vercel env add RAZORPAY_API_KEY production <<< "rzp_test_RLiaxvMuJUImxt"
vercel env add RAZORPAY_API_SECRET production <<< "kZyUvXflrRbP345QR66i59iU"

# Stripe (placeholder values - need to be updated with real ones)
vercel env add STRIPE_SECRET_KEY production <<< "sk_test_your_stripe_secret_key"
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production <<< "pk_test_your_stripe_publishable_key"
vercel env add STRIPE_WEBHOOK_SECRET production <<< "whsec_your_stripe_webhook_secret"
vercel env add STRIPE_PRO_PRICE_ID production <<< "price_your_pro_price_id"
vercel env add STRIPE_PRO_PLUS_PRICE_ID production <<< "price_your_pro_plus_price_id"

# Twilio (placeholder values - need to be updated with real ones)
vercel env add TWILIO_ACCOUNT_SID production <<< "your_twilio_account_sid"
vercel env add TWILIO_AUTH_TOKEN production <<< "your_twilio_auth_token"
vercel env add TWILIO_PHONE_NUMBER production <<< "+1234567890"

# Inngest
vercel env add INNGEST_EVENT_KEY production <<< "your_inngest_event_key"
vercel env add INNGEST_SIGNING_KEY production <<< "your_inngest_signing_key"

# Analytics
vercel env add NEXT_PUBLIC_POSTHOG_KEY production <<< "your_posthog_key"
vercel env add NEXT_PUBLIC_POSTHOG_HOST production <<< "https://app.posthog.com"
vercel env add SENTRY_DSN production <<< "your_sentry_dsn"

echo "Environment variables setup complete!"
echo "Note: You'll need to update Stripe, Twilio, and other service credentials with real values."
