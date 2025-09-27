# Razorpay Integration for India 🇮🇳

## Overview

Your "Text From Your Plants" app now supports **dual payment systems**:
- **Stripe** for international users (USD)
- **Razorpay** for Indian users (INR)

## What's Added

### 1. Razorpay Library Integration
- `src/lib/razorpay.ts` - Core Razorpay functionality
- Order creation, payment verification, webhook handling
- Indian pricing: ₹4.99/mo (Pro), ₹9.99/mo (Pro Plus)

### 2. API Routes
- `src/app/api/razorpay/order/route.ts` - Create payment orders
- `src/app/api/razorpay/verify/route.ts` - Verify payments
- `src/app/api/razorpay/webhook/route.ts` - Handle webhook events

### 3. UI Components
- `src/components/razorpay-payment.tsx` - Razorpay payment component
- Updated billing section with payment method toggle
- Indian pricing displayed in ₹ (rupees)

### 4. Environment Variables
```env
# Razorpay (India)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

## Setup Instructions

### 1. Create Razorpay Account
1. Go to [razorpay.com](https://razorpay.com)
2. Sign up and complete KYC verification
3. Get your API keys from Dashboard → Settings → API Keys

### 2. Configure Environment
Add your Razorpay credentials to `.env.local`:
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 3. Set Up Webhooks (Optional)
1. In Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
3. Select events: `payment.captured`, `payment.failed`

## How It Works

### Payment Flow
1. User clicks "Pay with Razorpay" button
2. App creates Razorpay order via `/api/razorpay/order`
3. Razorpay checkout modal opens
4. User completes payment
5. Payment verified via `/api/razorpay/verify`
6. Subscription activated in database

### Pricing Structure
- **Free**: ₹0 (1 plant)
- **Pro**: ₹4.99/month (10 plants)
- **Pro Plus**: ₹9.99/month (25 plants)

### Payment Methods Supported
- Credit/Debit Cards
- Net Banking
- UPI
- Wallets (Paytm, PhonePe, etc.)
- EMI options

## User Experience

### Landing Page
- Shows Indian pricing in ₹
- Three-tier pricing structure
- Clear value proposition

### Settings Page
- Toggle between Stripe and Razorpay
- Seamless payment method switching
- Localized pricing display

### Payment Process
- Native Razorpay checkout
- Multiple payment options
- Secure payment verification
- Instant subscription activation

## Benefits for Indian Users

1. **Local Payment Methods**: UPI, Net Banking, Indian cards
2. **Lower Fees**: Razorpay typically has better rates for Indian transactions
3. **Familiar UX**: Indian users are comfortable with Razorpay interface
4. **Compliance**: Handles Indian tax and compliance requirements
5. **Support**: Local customer support in Hindi/English

## Testing

### Test Cards (Razorpay)
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI IDs
- `success@razorpay` (successful payment)
- `failure@razorpay` (failed payment)

## Monitoring

### Razorpay Dashboard
- Track payments and refunds
- Monitor success rates
- View settlement reports
- Handle disputes

### App Integration
- Payment events logged in database
- Webhook events processed
- Subscription status updated
- User notifications sent

## Security

- Webhook signature verification
- Payment signature validation
- Secure API key handling
- PCI DSS compliance via Razorpay

## Next Steps

1. **Set up Razorpay account** and get API keys
2. **Add credentials** to environment variables
3. **Test payments** using test cards/UPI
4. **Configure webhooks** for production
5. **Monitor transactions** in Razorpay dashboard

Your app is now ready to serve Indian plant lovers with local payment methods! 🌱🇮🇳
