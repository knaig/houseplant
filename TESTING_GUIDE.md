# 🧪 Houseplant App - Testing Guide

Complete testing strategy for validating all functionality.

---

## 📋 Pre-Testing Setup

### 1. Database Setup
```bash
# Push Prisma schema to database
npm run db:push

# Seed database with plant species
npm run db:seed

# Open Prisma Studio to verify data
npm run db:studio
```

### 2. Environment Variables Check
```bash
# Create .env.local from template
cp env.template .env.local

# Edit with your actual credentials
# Make sure these are set:
# - DATABASE_URL
# - CLERK keys
# - AISENSY_API_KEY
# - TWILIO credentials
# - STRIPE/RAZORPAY keys
# - INNGEST_EVENT_KEY
# - NEXT_PUBLIC_APP_URL
```

---

## 🧪 Testing Layers

## 1. Local Development Testing

### Start Dev Server
```bash
npm run dev
# Visit http://localhost:3000
```

### Test Basic Pages
- [ ] Homepage loads (`/`)
- [ ] Sign up flow (`/sign-up`)
- [ ] Sign in flow (`/sign-in`)
- [ ] Dashboard (`/app`)
- [ ] Settings page (`/app/settings`)

---

## 2. API Endpoint Testing

### WhatsApp API Endpoints

#### Test Opt-In Endpoint
```bash
# Get opt-in status (requires auth)
curl http://localhost:3000/api/whatsapp/optin

# Update opt-in status
curl -X POST http://localhost:3000/api/whatsapp/optin \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "optIn": true
  }'
```

#### Test Reminder Endpoint
```bash
# Send manual reminder (requires valid user with plants)
curl -X POST http://localhost:3000/api/whatsapp/reminder \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_xxx",
    "phoneNumber": "+919876543210"
  }'
```

#### Test Watering Endpoint
```bash
# Log plant watering
curl -X POST http://localhost:3000/api/plants/water \
  -H "Content-Type: application/json" \
  -d '{
    "plantId": "plant_xxx",
    "userId": "user_xxx",
    "phoneNumber": "+919876543210"
  }'

# Get watering status
curl "http://localhost:3000/api/plants/water?plant=plant_xxx"
```

### Plant Management Endpoints

#### Get Plant Details
```bash
curl http://localhost:3000/api/plants/[plantId]
```

#### Update Plant Settings
```bash
curl -X PATCH http://localhost:3000/api/plants/[plantId] \
  -H "Content-Type: application/json" \
  -d '{
    "personality": "FUNNY",
    "lightLevel": "HIGH",
    "potSizeCm": 20
  }'
```

---

## 3. WhatsApp Integration Testing

### AiSensy Configuration Check

1. **Verify API Key**
```bash
# Test AiSensy API connection
node test-aisensy-api.js
```

2. **Check Campaign Templates in AiSensy Dashboard**
   - Log into https://app.aisensy.com
   - Go to Campaigns → Templates
   - Verify these templates exist:
     - `watering_reminder`
     - `qr_scan_welcome`
     - `optin_confirmation`
     - `watering_confirmation`

3. **Test WhatsApp Message Sending**
```javascript
// Create test-whatsapp-send.js
const { whatsappService } = require('./src/lib/whatsapp');

async function testSend() {
  const result = await whatsappService.sendOptInConfirmation(
    '+919876543210',
    'Test User'
  );
  console.log('Send result:', result);
}

testSend();
```

### Manual WhatsApp Flow Testing

1. **Opt-In Flow:**
   - Go to `/app/settings`
   - Enter phone number
   - Enable WhatsApp notifications
   - Check if confirmation message arrives

2. **QR Scan Flow:**
   - Generate QR code in admin panel
   - Scan QR code
   - Claim plant
   - Verify welcome message

3. **Watering Reminder Flow:**
   - Claim a plant
   - Wait for reminder or trigger manually
   - Verify message personality matches plant

---

## 4. Inngest Background Jobs Testing

### Access Inngest Dashboard
```bash
# In dev mode, Inngest runs locally
# Visit: http://localhost:8288
```

### Test Daily Watering Reminders

1. **Trigger Test Reminder Manually:**
```bash
curl -X POST http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test/reminder",
    "data": {
      "userId": "user_xxx",
      "phoneNumber": "+919876543210"
    }
  }'
```

2. **Verify in Inngest Dashboard:**
   - Check function execution
   - View logs
   - Check for errors

### Test Watering Schedule Recalculation

```bash
# Update plant settings (triggers recalculation)
curl -X PATCH http://localhost:3000/api/plants/[plantId] \
  -H "Content-Type: application/json" \
  -d '{"customWaterDays": 5}'

# Check Inngest dashboard for plant/schedule.recalculated event
```

---

## 5. Plant Care Calculations Testing

### Test Watering Schedule Calculation

```javascript
// Create test-plant-care.js
const { plantCareService } = require('./src/lib/plant-care');

const testPlant = {
  lastWateredAt: new Date('2025-10-01'),
  potSizeCm: 15,
  lightLevel: 'HIGH',
  species: {
    defaultWaterDays: 7
  }
};

const calculation = plantCareService.calculateWateringSchedule(testPlant);
console.log('Watering calculation:', calculation);
console.log('Needs water:', calculation.needsWater);
console.log('Days overdue:', calculation.daysOverdue);
```

### Test Edge Cases

```javascript
// Test null values
const newPlant = {
  lastWateredAt: null,
  potSizeCm: null,
  lightLevel: null,
  species: { defaultWaterDays: 7 }
};

const result = plantCareService.calculateWateringSchedule(newPlant);
// Should not throw error
```

---

## 6. End-to-End User Flow Testing

### Complete Plant Claiming Flow

1. **As Admin:**
   - [ ] Go to `/admin/qr`
   - [ ] Generate 5 QR codes
   - [ ] Download PDF
   - [ ] Copy one token

2. **As User:**
   - [ ] Visit `/claim?token=xxx`
   - [ ] Sign in with Clerk
   - [ ] Fill plant details:
     - Name: "Monstera"
     - Species: "Monstera Deliciosa"
     - Pot size: 20cm
     - Light level: Medium
     - Personality: Funny
   - [ ] Submit form
   - [ ] Check success message
   - [ ] Verify plant appears in dashboard

3. **Verify WhatsApp:**
   - [ ] Check if QR scan welcome message sent
   - [ ] Opt-in to WhatsApp
   - [ ] Check if opt-in confirmation sent

### Complete Watering Flow

1. **Log Watering:**
   - [ ] Go to plant details page
   - [ ] Click "Mark as Watered"
   - [ ] Verify confirmation message

2. **Via QR Code:**
   - [ ] Generate watering QR code
   - [ ] Scan QR code
   - [ ] Confirm watering
   - [ ] Check if confirmation message sent

3. **Check Schedule:**
   - [ ] Verify `nextWaterDue` updated
   - [ ] Check Inngest scheduled next reminder

---

## 7. Production Testing

### After Vercel Deployment

1. **Verify Deployment:**
```bash
# Check deployment status
vercel ls

# Get deployment URL
vercel inspect [deployment-url]
```

2. **Test Production Endpoints:**
```bash
# Replace with your actual Vercel URL
PROD_URL="https://houseplant-koo2g5b6f-knaigs-projects.vercel.app"

# Test health check
curl $PROD_URL/api/species

# Test WhatsApp webhook
curl $PROD_URL/api/whatsapp/webhook
```

3. **Environment Variables Check:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify all required variables are set:
     - [ ] DATABASE_URL
     - [ ] CLERK keys
     - [ ] AISENSY_API_KEY
     - [ ] AISENSY_WATERING_CAMPAIGN
     - [ ] AISENSY_QR_SCAN_CAMPAIGN
     - [ ] AISENSY_OPTIN_CAMPAIGN
     - [ ] AISENSY_WATERING_CONFIRMATION_CAMPAIGN
     - [ ] TWILIO credentials
     - [ ] STRIPE/RAZORPAY keys
     - [ ] INNGEST_EVENT_KEY
     - [ ] NEXT_PUBLIC_APP_URL

4. **Database Connection:**
```bash
# Test database connection
npm run db:studio
# Verify you can see production data
```

---

## 8. Monitoring & Observability

### Inngest Production Jobs

1. **Connect Inngest to Production:**
   - Go to https://app.inngest.com
   - Add your Vercel deployment URL
   - Verify events are being received

2. **Test Cron Job:**
   - Wait for 9 AM (or modify cron schedule)
   - Check Inngest dashboard for execution
   - Verify messages sent via AiSensy

### Error Tracking (Sentry)

```bash
# Trigger a test error
curl $PROD_URL/api/test-error

# Check Sentry dashboard for error report
```

### Analytics (PostHog)

1. Navigate through the app
2. Check PostHog dashboard for events:
   - Page views
   - Button clicks
   - Plant claims
   - WhatsApp opt-ins

---

## 🐛 Common Issues & Debugging

### Issue: WhatsApp messages not sending

**Check:**
1. AISENSY_API_KEY is correct
2. Campaign names match exactly
3. Phone number is in E.164 format (+country_code + number)
4. AiSensy account has credits

**Debug:**
```javascript
// Check AiSensy API response
const result = await whatsappService.sendMessage({...});
console.log('AiSensy response:', result);
```

### Issue: Inngest jobs not running

**Check:**
1. INNGEST_EVENT_KEY is set
2. Inngest endpoint accessible at `/api/inngest`
3. Functions registered in serve array

**Debug:**
```bash
# Check Inngest dev server
npx inngest-cli dev

# Trigger test event
curl -X POST http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "test/reminder", "data": {}}'
```

### Issue: Database errors

**Check:**
1. DATABASE_URL is correct
2. Prisma schema is pushed
3. Database is accessible

**Debug:**
```bash
# Check Prisma connection
npx prisma db pull

# Regenerate client
npx prisma generate

# View database
npm run db:studio
```

---

## ✅ Testing Checklist

### Core Functionality
- [ ] User registration and login
- [ ] Plant claiming via QR code
- [ ] Dashboard displays plants
- [ ] Plant details page works
- [ ] Manual watering logs

### WhatsApp Features
- [ ] Opt-in flow completes
- [ ] Confirmation message received
- [ ] QR scan message received
- [ ] Watering reminder sent
- [ ] Watering confirmation sent

### Background Jobs
- [ ] Daily reminders scheduled
- [ ] Schedule recalculation works
- [ ] Inngest dashboard shows jobs
- [ ] Error handling works

### Production
- [ ] Vercel deployment successful
- [ ] Production database connected
- [ ] Environment variables set
- [ ] HTTPS working
- [ ] No console errors

---

## 📊 Performance Testing

### Load Testing
```bash
# Install k6
brew install k6  # macOS
# or download from k6.io

# Create load test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  let res = http.get('https://your-app.vercel.app/api/species');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
EOF

# Run load test
k6 run load-test.js
```

### Database Query Performance
```bash
# Enable query logging in Prisma
# Add to schema.prisma datasource
# log = ["query", "info", "warn", "error"]

# Run app and check query times
npm run dev
```

---

## 🎯 Success Criteria

**App is ready for production when:**
- ✅ All API endpoints respond correctly
- ✅ WhatsApp messages send successfully
- ✅ Inngest jobs execute on schedule
- ✅ Database operations work without errors
- ✅ Build completes successfully
- ✅ No TypeScript errors
- ✅ No console errors in production
- ✅ User can complete full flow from QR scan to watering

---

*Last Updated: October 10, 2025*

