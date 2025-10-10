# 🚀 Getting Started - 5 Minute Setup

The absolute fastest way to get the houseplant app running.

---

## ⚡ Super Quick Start

Run the interactive setup wizard:

```bash
./setup-wizard.sh
```

The wizard will:
1. ✅ Guide you through getting API keys
2. ✅ Create your `.env.local` file
3. ✅ Set up the database
4. ✅ Start the app

**Total time: 5-10 minutes** (mostly waiting for Supabase to provision)

---

## 📋 Manual Setup (if you prefer)

### Step 1: Get Database (2 minutes)

**Easiest: Supabase**

1. Go to https://supabase.com
2. Click "Start your project" → Sign up
3. Click "New project"
4. Name: `houseplant`, create a password
5. Wait ~2 minutes for setup
6. Go to Settings → Database
7. Copy "Connection string" (URI format)
8. Replace `[YOUR-PASSWORD]` with your actual password

**You'll get something like:**
```
postgresql://postgres.abcdefghijklmn:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### Step 2: Get Authentication (2 minutes)

**Clerk**

1. Go to https://clerk.com
2. Sign up (free)
3. Click "Create application"
4. Name: `Houseplant`
5. Choose: Email + Google
6. Click "Create application"
7. Copy both keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)

### Step 3: Create .env.local (1 minute)

Create a file called `.env.local` in the project root:

```env
# Database
DATABASE_URL="your-supabase-connection-string"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_SECRET_KEY="sk_test_xxxxx"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_BASE_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 4: Run Setup (2 minutes)

```bash
# Install dependencies
npm install

# Setup database
npm run db:push
npm run db:seed

# Start app
npm run dev
```

### Step 5: Visit App

Open http://localhost:3000 in your browser!

**You're running!** 🎉

---

## ✅ What You Can Do Now

With just database + auth, you can:

- ✅ Sign up for an account
- ✅ Sign in
- ✅ View the dashboard
- ✅ Generate QR codes (admin)
- ✅ Claim plants
- ✅ View plant details
- ✅ Manual watering logs

---

## 🔜 Add More Features Later

### For WhatsApp Reminders

Add AiSensy:

1. Go to https://aisensy.com (₹999/month)
2. Sign up and get API key
3. Add to `.env.local`:
```env
AISENSY_API_KEY="your_key"
AISENSY_WATERING_CAMPAIGN="watering_reminder"
AISENSY_QR_SCAN_CAMPAIGN="qr_scan_welcome"
AISENSY_OPTIN_CAMPAIGN="optin_confirmation"
AISENSY_WATERING_CONFIRMATION_CAMPAIGN="watering_confirmation"
```

### For Background Jobs

Add Inngest:

1. Go to https://inngest.com (FREE)
2. Sign up and get Event Key
3. Add to `.env.local`:
```env
INNGEST_EVENT_KEY="your_key"
```

### For Payments

Add Stripe (international) or Razorpay (India):

**Stripe:**
```env
STRIPE_SECRET_KEY="sk_test_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PRO="price_xxxxx"
```

**Razorpay:**
```env
RAZORPAY_KEY_ID="rzp_test_xxxxx"
RAZORPAY_KEY_SECRET="xxxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxxx"
```

---

## 🐛 Troubleshooting

### Database connection error

Check:
- Connection string is correct
- Password has no special characters that need escaping
- Try wrapping in quotes: `DATABASE_URL="postgresql://..."`

### Clerk error

Check:
- Both keys are copied correctly
- Keys start with `pk_test_` and `sk_test_`
- No extra spaces

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

---

## 📚 Next Steps

- Read `TESTING_GUIDE.md` for testing
- Read `API_KEYS_SETUP.md` for all API keys
- Read `WHATSAPP_SETUP.md` for WhatsApp config
- Check `COMPLETION_SUMMARY.md` for what's built

---

## 🆘 Need Help?

**Still stuck?** The setup wizard makes it even easier:

```bash
./setup-wizard.sh
```

It will walk you through each step interactively!

