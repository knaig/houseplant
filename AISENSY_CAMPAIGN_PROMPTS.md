# AiSensy Campaign Creation Prompts

## Campaign 1: Watering Reminder (`watering_reminder`)

**Campaign Name:** `watering_reminder`
**Campaign Type:** WhatsApp Template Message
**Category:** Plant Care Reminders

**Template Content:**
```
🌱 Hey {{1}}, your plants need attention! 

Plants needing water: {{2}}

{{3}}

{{4}}

Visit our website to mark plants as watered: https://houseplant-koo2g5b6f-knaigs-projects.vercel.app
```

**Template Parameters:**
- `{{1}}` - User name (e.g., "Karthik")
- `{{2}}` - Plant list (e.g., "Monstera - 2 days overdue, Snake Plant - Due today")
- `{{3}}` - Personality header (e.g., "🌱 Your plants are getting thirsty! 😄")
- `{{4}}` - Personality footer (e.g., "Time to be a plant hero! 💪")

**Usage:** Sent daily at 9 AM to users with plants needing water

---

## Campaign 2: QR Scan Welcome (`qr_scan_welcome`)

**Campaign Name:** `qr_scan_welcome`
**Campaign Type:** WhatsApp Template Message
**Category:** Onboarding

**Template Content:**
```
🌱 Welcome to Plant Care!

Hey {{1}}, you've scanned the QR code for "{{2}}". 

Please visit our website to complete the setup and start receiving personalized care reminders!

🔗 Visit: {{3}}

We'll help you keep your plants happy and healthy! 🌿
```

**Template Parameters:**
- `{{1}}` - User name (e.g., "Karthik")
- `{{2}}` - Plant name (e.g., "Monstera")
- `{{3}}` - Website URL (e.g., "https://houseplant-koo2g5b6f-knaigs-projects.vercel.app")

**Usage:** Sent immediately when user scans QR code to claim a plant

---

## Campaign 3: Opt-in Confirmation (`optin_confirmation`)

**Campaign Name:** `optin_confirmation`
**Campaign Type:** WhatsApp Template Message
**Category:** User Onboarding

**Template Content:**
```
🌱 Welcome to Plant Care Reminders!

Hey {{1}}, you've successfully opted in to receive WhatsApp notifications for your plants.

We'll send you:
• Watering reminders
• Plant care tips  
• Growth updates

Manage your preferences: {{2}}

Happy gardening! 🌿
```

**Template Parameters:**
- `{{1}}` - User name (e.g., "Karthik")
- `{{2}}` - Website URL (e.g., "https://houseplant-koo2g5b6f-knaigs-projects.vercel.app")

**Usage:** Sent when user enables WhatsApp notifications in dashboard

---

## Campaign 4: Watering Confirmation (`watering_confirmation`)

**Campaign Name:** `watering_confirmation`
**Campaign Type:** WhatsApp Template Message
**Category:** User Feedback

**Template Content:**
```
✅ Great job!

Hey {{1}}, you've watered "{{2}}". 

We've updated your plant's schedule and will remind you again when it's time for the next watering.

Keep up the excellent plant parenting! 🌱
```

**Template Parameters:**
- `{{1}}` - User name (e.g., "Karthik")
- `{{2}}` - Plant name (e.g., "Monstera")

**Usage:** Sent when user confirms they've watered a plant via QR code scan

---

## Instructions for AiSensy Dashboard

### Step 1: Create Campaigns
1. Go to AiSensy Dashboard → Campaigns
2. Click "Create New Campaign"
3. Select "WhatsApp Template Message"
4. Use the exact campaign names above

### Step 2: Set Up Templates
1. For each campaign, create a WhatsApp template
2. Use the template content provided above
3. Add the template parameters in the correct order
4. Submit for WhatsApp approval

### Step 3: Template Approval
1. Wait for WhatsApp to approve your templates
2. Once approved, templates will be available for use
3. Test with your phone number

### Step 4: API Integration
1. Copy the exact campaign names to your environment variables
2. Test the integration using the test script
3. Deploy to production

---

## Template Approval Tips

### For WhatsApp Approval:
- **Keep it simple:** Avoid excessive emojis or special characters
- **Clear purpose:** Make it obvious this is for plant care reminders
- **Professional tone:** Keep language friendly but professional
- **No spam:** Ensure templates are for legitimate business purposes

### Common Approval Issues:
- Too many emojis (limit to 2-3 per message)
- Unclear purpose (make plant care context obvious)
- Missing business context (ensure it's clearly a plant care service)
- Template too long (keep under 160 characters when possible)

---

## Testing Checklist

- [ ] All 4 campaigns created in AiSensy
- [ ] Templates submitted for WhatsApp approval
- [ ] Templates approved by WhatsApp
- [ ] Environment variables updated
- [ ] Test script runs successfully
- [ ] Messages received on test phone number
- [ ] Production deployment completed

---

## Support

If you need help with template approval or campaign setup, contact AiSensy support or refer to their documentation at https://wiki.aisensy.com/
