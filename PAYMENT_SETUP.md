# Payment Setup Guide

## Razorpay Setup (Already Configured ✅)

Your Razorpay credentials are already set up:
- API Key: `rzp_test_RLiaxvMuJUImxt`
- API Secret: `kZyUvXflrRbP345QR66i59iU`

### Razorpay Dashboard Setup
1. Go to https://dashboard.razorpay.com/
2. Navigate to Settings > Webhooks
3. Add webhook URL: `https://your-domain.vercel.app/api/razorpay/webhook`
4. Enable events: `payment.captured`, `payment.failed`

## Stripe Setup (Needs Configuration)

### 1. Create Stripe Account
1. Go to https://stripe.com/
2. Sign up for a free account
3. Complete account verification

### 2. Get API Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your Publishable key and Secret key
3. Update `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
```

### 3. Create Products and Prices
1. Go to https://dashboard.stripe.com/products
2. Create products:
   - **Pro Plan**: ₹4.99/month (up to 10 plants)
   - **Pro Plus Plan**: ₹9.99/month (up to 25 plants)
3. Copy the Price IDs and update `.env.local`:

```env
STRIPE_PRO_PRICE_ID=price_your_pro_price_id
STRIPE_PRO_PLUS_PRICE_ID=price_your_pro_plus_price_id
```

### 4. Set up Webhooks
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret and update `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Testing Payments

### Razorpay Test Cards
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Stripe Test Cards
- **Success**: 4242 4242 4242 4242
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Current Status
- ✅ Razorpay integration complete
- ✅ Stripe integration code ready
- ⏳ Need actual Stripe credentials
- ⏳ Need to create Stripe products/prices
