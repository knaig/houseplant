# Text From Your Plants 🌱

A Next.js application that lets plants send personalized SMS reminders to their owners. Each plant gets a QR sticker that users can scan to claim their plant and set up SMS reminders with different personalities.

## Features

- **QR Code Plant Claiming**: Scan QR stickers to claim plants
- **SMS Reminders**: Personalized messages based on plant species and personality
- **Multiple Personalities**: Choose from Funny, Coach, Zen, or Classic personalities
- **Smart Scheduling**: Adaptive watering schedules based on user feedback
- **Stripe Billing**: Free tier (1 plant) and Pro tier (up to 10 plants)
- **Admin Dashboard**: Generate QR codes and manage plants

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **SMS**: Twilio
- **Payments**: Stripe
- **Background Jobs**: Inngest
- **QR Codes**: qrcode library

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd houseplant
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp env.template .env.local
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/houseplant"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...

# Razorpay (India)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_MESSAGING_SERVICE_SID=MG...

# App URLs
NEXTAUTH_URL=http://localhost:3000
APP_BASE_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Push the schema to your database
npm run db:push

# Seed with species data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Setup Guide

### 1. Database (PostgreSQL)

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Create database
createdb houseplant
```

**Option B: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Add to `.env.local`

**Option C: Neon**
1. Go to [neon.tech](https://neon.tech)
2. Create new database
3. Get connection string
4. Add to `.env.local`

### 2. Clerk Authentication

1. Go to [clerk.com](https://clerk.com)
2. Create new application
3. Copy publishable key and secret key
4. Add to `.env.local`

### 3. Twilio SMS

1. Go to [twilio.com](https://twilio.com)
2. Create account and get phone number
3. Get Account SID and Auth Token
4. Create Messaging Service
5. Add credentials to `.env.local`

### 4. Stripe Payments (International)

1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Get API keys from Dashboard
4. Create a product and price for Pro plan
5. Add credentials to `.env.local`

### 5. Razorpay Payments (India)

1. Go to [razorpay.com](https://razorpay.com)
2. Create account and complete KYC
3. Get API keys from Dashboard
4. Add credentials to `.env.local`

### 6. Inngest (Background Jobs)

1. Go to [inngest.com](https://inngest.com)
2. Create account
3. Get event key
4. Add to `.env.local`

## Usage

### 1. Generate QR Stickers

1. Sign in to the app
2. Go to `/admin/qr`
3. Generate QR codes (e.g., 10 codes)
4. Download PDF with stickers
5. Print and cut stickers
6. Stick on plant pots

### 2. Claim a Plant

1. User scans QR code or visits `/claim?token=...`
2. Signs in with Clerk
3. Fills out plant details form
4. Plant is claimed and first reminder is scheduled

### 3. Receive SMS Reminders

- Plants send reminders based on species and pot size
- Users reply with "watered", "moved", "droopy", "too dry"
- System adjusts watering schedule based on feedback

### 4. Manage Plants

- View all plants in dashboard
- See watering status and next due date
- Manual watering triggers
- Plant details and message history

## API Endpoints

- `GET /api/species` - List all plant species
- `POST /api/plants/claim` - Claim a plant with token
- `POST /api/twilio/inbound` - Twilio webhook for SMS
- `POST /api/admin/qr/generate` - Generate QR codes
- `POST /api/admin/qr/pdf` - Download QR sticker PDF

## Database Schema

Key models:
- `User` - User accounts with Clerk integration
- `Plant` - Individual plants with species and personality
- `Species` - Plant species with default watering intervals
- `Message` - SMS messages sent/received
- `ClaimToken` - QR code tokens for plant claiming
- `Subscription` - Stripe billing information

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run db:push      # Push schema changes
npm run db:migrate   # Create migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Testing the Flow

1. **Seed the database**: `npm run db:seed`
2. **Generate QR codes**: Visit `/admin/qr` and generate 5 codes
3. **Claim a plant**: Use one of the tokens in `/claim?token=...`
4. **Simulate SMS**: Use Twilio webhook or manually trigger reminders
5. **Test billing**: Upgrade to Pro plan via Stripe

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t houseplant .

# Run container
docker run -p 3000:3000 houseplant
```

## Monitoring

- **Sentry**: Error tracking and performance monitoring
- **PostHog**: Analytics and user behavior tracking
- **Inngest**: Background job monitoring and retries

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create GitHub issue
- Check documentation
- Join Discord community

---

**Made with 🌱 for plant lovers**