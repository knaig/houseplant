# 🔑 API Keys & Setup Guide

Complete guide to getting all necessary API keys and credentials.

---

## 🚦 **Priority Levels**

- 🔴 **REQUIRED** - App won't work without these
- 🟡 **RECOMMENDED** - Core features need these
- 🟢 **OPTIONAL** - Nice to have, but not critical

---

## 🔴 **REQUIRED** (Minimum to run app)

### 1. Database - PostgreSQL

**What it's for:** Storing users, plants, messages, etc.

**Free Options:**

**Option A: Supabase (Recommended)**
```bash
1. Go to https://supabase.com
2. Sign up (free tier)
3. Create new project
4. Wait 2-3 minutes for setup
5. Go to Settings → Database
6. Copy "Connection string" (URI format)
7. Add to .env.local as DATABASE_URL
```

**Option B: Neon**
```bash
1. Go to https://neon.tech
2. Sign up (free tier)
3. Create database
4. Copy connection string
5. Add to .env.local as DATABASE_URL
```

**Option C: Local PostgreSQL**
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb houseplant

# Ubuntu/Debian
sudo apt install postgresql
sudo -u postgres createdb houseplant

# Connection string:
DATABASE_URL="postgresql://username:password@localhost:5432/houseplant"
```

**Cost:** FREE (all options have free tiers)

---

### 2. Clerk - Authentication

**What it's for:** User sign up, sign in, session management

**Setup:**
```bash
1. Go to https://clerk.com
2. Sign up (free tier: 10,000 monthly active users)
3. Create new application
4. Choose authentication methods (Email + Google recommended)
5. Go to API Keys
6. Copy:
   - Publishable key → NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - Secret key → CLERK_SECRET_KEY
```

**Environment Variables:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

**Cost:** FREE up to 10,000 users/month

---

## 🟡 **RECOMMENDED** (For core features)

### 3. AiSensy - WhatsApp Integration

**What it's for:** Sending WhatsApp messages (watering reminders, confirmations)

**Setup:**
```bash
1. Go to https://www.aisensy.com
2. Sign up (paid service, starts ~₹999/month)
3. Verify your WhatsApp Business account
4. Go to Settings → API
5. Copy API Key
6. Go to Campaigns → Templates
7. Create these 4 templates:
   - watering_reminder
   - qr_scan_welcome
   - optin_confirmation
   - watering_confirmation
```

**Environment Variables:**
```env
AISENSY_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AISENSY_WATERING_CAMPAIGN=watering_reminder
AISENSY_QR_SCAN_CAMPAIGN=qr_scan_welcome
AISENSY_OPTIN_CAMPAIGN=optin_confirmation
AISENSY_WATERING_CONFIRMATION_CAMPAIGN=watering_confirmation
```

**Cost:** ₹999-2999/month depending on volume

**Alternative (FREE):** Twilio (see below)

---

### 4. Inngest - Background Jobs

**What it's for:** Scheduling daily watering reminders, processing events

**Setup:**
```bash
1. Go to https://www.inngest.com
2. Sign up (free tier: 50,000 steps/month)
3. Create new app
4. Go to Settings → Keys
5. Copy Event Key
```

**Environment Variables:**
```env
INNGEST_EVENT_KEY=your-event-key
```

**For Development:**
```bash
# Run local Inngest dev server
npx inngest-cli dev
# Visit http://localhost:8288 to see dashboard
```

**Cost:** FREE up to 50,000 steps/month

---

### 5. Payment Gateway (choose one or both)

#### 5A. Stripe (International)

**What it's for:** Subscription billing for Pro plan

**Setup:**
```bash
1. Go to https://stripe.com
2. Sign up (free, pay only processing fees)
3. Go to Developers → API Keys
4. Copy:
   - Publishable key (starts with pk_)
   - Secret key (starts with sk_)
5. Go to Products → Create product "Pro Plan"
6. Set price (e.g., $5/month)
7. Copy Price ID (starts with price_)
8. Set up webhook endpoint
```

**Environment Variables:**
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Cost:** FREE to setup, 2.9% + $0.30 per transaction

#### 5B. Razorpay (India)

**What it's for:** Subscription billing for Indian users

**Setup:**
```bash
1. Go to https://razorpay.com
2. Sign up and complete KYC
3. Go to Settings → API Keys
4. Generate Test Keys
5. Copy Key ID and Secret
```

**Environment Variables:**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

**Cost:** FREE to setup, 2% per transaction

---

## 🟢 **OPTIONAL** (Enhanced features)

### 6. Twilio - SMS (Alternative to AiSensy)

**What it's for:** SMS reminders if not using WhatsApp

**Setup:**
```bash
1. Go to https://www.twilio.com
2. Sign up (free trial: $15 credit)
3. Get a phone number
4. Go to Console → Account Info
5. Copy Account SID and Auth Token
6. Create Messaging Service
```

**Environment Variables:**
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_MESSAGING_SERVICE_SID=MGxxxxx
```

**Cost:** FREE trial, then ~$1/month + $0.0075 per SMS

---

### 7. OpenAI - AI Plant Care (Future feature)

**What it's for:** Advanced plant care recommendations

**Setup:**
```bash
1. Go to https://platform.openai.com
2. Sign up
3. Go to API Keys
4. Create new secret key
```

**Environment Variables:**
```env
OPENAI_API_KEY=sk-xxxxx
```

**Cost:** Pay per use (~$0.002 per request)

---

### 8. Sentry - Error Tracking

**What it's for:** Production error monitoring

**Setup:**
```bash
1. Go to https://sentry.io
2. Sign up (free tier)
3. Create new project (Next.js)
4. Copy DSN
```

**Environment Variables:**
```env
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**Cost:** FREE up to 5,000 errors/month

---

### 9. PostHog - Analytics

**What it's for:** User behavior analytics

**Setup:**
```bash
1. Go to https://posthog.com
2. Sign up (free tier: 1M events/month)
3. Create new project
4. Copy Project API Key
```

**Environment Variables:**
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
```

**Cost:** FREE up to 1M events/month

---

## ⚡ **Quick Start - Minimal Setup**

To get started with **minimal setup**, you only need:

### 1. Create `.env.local` file:

```env
# REQUIRED - Database
DATABASE_URL="your-supabase-or-neon-connection-string"

# REQUIRED - Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# RECOMMENDED - Background jobs
INNGEST_EVENT_KEY=your-event-key

# OPTIONAL - WhatsApp (can skip for testing)
AISENSY_API_KEY=your-api-key

# OPTIONAL - Payments (can skip for testing)
STRIPE_SECRET_KEY=sk_test_xxxxx

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

### 2. Setup database:

```bash
npm run db:push
npm run db:seed
```

### 3. Start app:

```bash
npm run dev
```

### 4. Visit http://localhost:3000

---

## 📋 **Setup Checklist**

Use this to track what you've set up:

**Essential (to run app):**
- [ ] Database (Supabase/Neon/Local)
- [ ] Clerk authentication
- [ ] `.env.local` created
- [ ] Database pushed and seeded

**Core Features:**
- [ ] Inngest (for scheduled reminders)
- [ ] AiSensy or Twilio (for messaging)
- [ ] Stripe or Razorpay (for billing)

**Enhanced Features:**
- [ ] Sentry (error tracking)
- [ ] PostHog (analytics)
- [ ] OpenAI (AI features)

---

## 🎯 **Recommended Development Setup**

For the best development experience:

1. **Database:** Supabase (FREE, easy)
2. **Auth:** Clerk (FREE, 10K users)
3. **Jobs:** Inngest (FREE, local dev)
4. **WhatsApp:** Skip initially, test without it
5. **Payments:** Skip initially, test without it

**Total Cost: $0** to start testing!

---

## 🔄 **Environment Variable Template**

Copy this to create your `.env.local`:

```env
# ===================================
# REQUIRED FOR APP TO RUN
# ===================================

# Database (Get from Supabase/Neon)
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Clerk Auth (Get from clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_
CLERK_SECRET_KEY=sk_test_

# ===================================
# CORE FEATURES
# ===================================

# Inngest Background Jobs (Get from inngest.com)
INNGEST_EVENT_KEY=

# AiSensy WhatsApp (Get from aisensy.com)
AISENSY_API_KEY=
AISENSY_WATERING_CAMPAIGN=watering_reminder
AISENSY_QR_SCAN_CAMPAIGN=qr_scan_welcome
AISENSY_OPTIN_CAMPAIGN=optin_confirmation
AISENSY_WATERING_CONFIRMATION_CAMPAIGN=watering_confirmation

# Stripe Payments (Get from stripe.com)
STRIPE_SECRET_KEY=sk_test_
STRIPE_WEBHOOK_SECRET=whsec_
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_

# Razorpay Payments India (Get from razorpay.com)
RAZORPAY_KEY_ID=rzp_test_
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_

# Twilio SMS Alternative (Get from twilio.com)
TWILIO_ACCOUNT_SID=AC
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=MG

# ===================================
# OPTIONAL ENHANCEMENTS
# ===================================

# OpenAI for AI features (Get from openai.com)
OPENAI_API_KEY=sk-

# Sentry Error Tracking (Get from sentry.io)
SENTRY_DSN=https://

# PostHog Analytics (Get from posthog.com)
NEXT_PUBLIC_POSTHOG_KEY=phc_

# ===================================
# APP CONFIGURATION
# ===================================

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

---

## 💰 **Cost Summary**

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Supabase | 500MB + 2GB bandwidth | $25/month |
| Clerk | 10K users | $25/month |
| Inngest | 50K steps | $20/month |
| AiSensy | ❌ None | ₹999/month |
| Twilio | $15 credit | Pay per use |
| Stripe | Processing only | 2.9% + $0.30 |
| Razorpay | Processing only | 2% |
| Sentry | 5K errors | $26/month |
| PostHog | 1M events | $0 (usage-based) |
| OpenAI | ❌ None | Pay per use |

**Total to start:** **$0** (using free tiers)

---

## 🚀 **Next Steps**

1. **Start with essentials:**
   - Database (Supabase) ← 5 minutes
   - Clerk auth ← 5 minutes
   - Create `.env.local` ← 2 minutes

2. **Run the app:**
   ```bash
   npm install
   npm run db:push
   npm run db:seed
   npm run dev
   ```

3. **Add features gradually:**
   - Add Inngest when you want scheduled reminders
   - Add AiSensy when you want WhatsApp
   - Add payments when you want billing

---

**Questions? Check:**
- `TESTING_GUIDE.md` - How to test everything
- `WHATSAPP_SETUP.md` - WhatsApp specific setup
- `env.template` - All environment variables

**Need help?** Just ask! I can guide you through setting up any specific service.

