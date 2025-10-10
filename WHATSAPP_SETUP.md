# WhatsApp Webhook Configuration Guide

## Webhook URL Setup

### 1. Production Webhook URL
```
https://houseplant-koo2g5b6f-knaigs-projects.vercel.app/api/whatsapp/webhook
```

### 2. Local Development Webhook URL (using ngrok)
```bash
# Install ngrok if you haven't
npm install -g ngrok

# Start your local server
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Use the ngrok URL for webhook
https://your-ngrok-url.ngrok.io/api/whatsapp/webhook
```

## Meta Business Manager Configuration

### Step 1: Go to WhatsApp Business API Settings
1. Visit [Meta Business Manager](https://business.facebook.com/)
2. Navigate to WhatsApp Business API → Configuration
3. Go to Webhooks section

### Step 2: Configure Webhook
1. **Callback URL**: `https://houseplant-koo2g5b6f-knaigs-projects.vercel.app/api/whatsapp/webhook`
2. **Verify Token**: Use the same value as `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in your .env.local
3. **Webhook Fields**: Subscribe to `messages` events

### Step 3: Test Webhook
1. Click "Verify and Save"
2. Meta will send a GET request to verify your webhook
3. Our webhook handler will respond with the challenge token

## Webhook Events We Handle

### Incoming Messages
- **Text Messages**: User responses to reminders
- **Interactive Messages**: Button clicks (Watered All, Watered Some, etc.)
- **Commands**: Help, status, etc.

### Message Types Supported
- `text`: Regular text messages
- `interactive`: Button and list interactions
- `button_reply`: Button responses
- `list_reply`: List item selections

## Testing Your Webhook

### 1. Test Webhook Verification
```bash
curl -X GET "https://houseplant-koo2g5b6f-knaigs-projects.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=test_challenge&hub.verify_token=your_webhook_verify_token"
```

### 2. Test Message Sending
```bash
curl -X POST "https://houseplant-koo2g5b6f-knaigs-projects.vercel.app/api/whatsapp/test-reminder" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

## Troubleshooting

### Common Issues
1. **Webhook Verification Failed**: Check verify token matches
2. **Messages Not Received**: Ensure webhook URL is accessible
3. **Permission Errors**: Verify phone number is verified in Meta Business Manager

### Debug Steps
1. Check webhook logs in Meta Business Manager
2. Monitor your application logs
3. Test webhook endpoint manually
4. Verify phone number format (+1234567890)

## Security Notes
- Keep your access token secure
- Use HTTPS for webhook URLs
- Validate webhook signatures (optional but recommended)
- Rate limit your API calls
