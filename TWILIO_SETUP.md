# Twilio Setup Guide

## 1. Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your phone number

## 2. Get Your Credentials
1. Go to https://console.twilio.com/
2. Copy your Account SID and Auth Token from the dashboard
3. Add them to your `.env.local` file:

```env
TWILIO_ACCOUNT_SID=your_actual_account_sid_here
TWILIO_AUTH_TOKEN=your_actual_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number
```

## 3. Purchase a Phone Number
1. In Twilio Console, go to Phone Numbers > Manage > Buy a number
2. Choose a number with SMS capabilities
3. Copy the phone number and add it to your `.env.local`

## 4. Configure Webhooks (for production)
When you deploy to Vercel, update these webhook URLs in Twilio:
- SMS Webhook: `https://your-domain.vercel.app/api/twilio/inbound`

## 5. Test SMS
You can test SMS functionality by:
1. Setting up the credentials above
2. Using the admin panel to send test messages
3. Claiming a plant and receiving reminders

## Current Status
- ✅ Twilio client configured in code
- ✅ Inbound webhook handler ready
- ✅ Outbound messaging service ready
- ⏳ Need actual Twilio credentials
