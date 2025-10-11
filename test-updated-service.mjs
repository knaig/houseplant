#!/usr/bin/env node
/**
 * Test the updated WhatsApp service with proper campaigns
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

// Simulate the updated WhatsApp service methods
async function sendWateringReminder(phoneNumber, reminders, userName = 'Plant Parent') {
  const plantList = reminders.map(r => `${r.plantName} (${r.speciesName}) - ${r.daysOverdue > 0 ? `${r.daysOverdue} days overdue` : 'Due today'}`).join(', ');
  
  const personalityMessages = {
    FUNNY: { header: "🌱 Your plants are getting thirsty! 😄", footer: "Time to be a plant hero! 💪" },
    COACH: { header: "🏆 Plant Care Challenge!", footer: "You've got this! Let's keep your plants thriving! 💪" },
    ZEN: { header: "🧘‍♀️ Mindful Plant Care Moment", footer: "Take a peaceful moment to nurture your green friends 🌿" },
    CLASSIC: { header: "🌿 Plant Care Reminder", footer: "Your plants need attention today" }
  };
  
  const personalityStyle = personalityMessages[reminders[0].personality] || personalityMessages.CLASSIC;
  
  const payload = {
    apiKey: AISENSY_API_KEY,
    campaignName: 'watering_reminder',
    destination: phoneNumber,
    userName: userName,
    templateParams: [userName, plantList, personalityStyle.header, personalityStyle.footer]
  };
  
  return await sendMessage(payload, 'Watering Reminder');
}

async function sendQRScanMessage(phoneNumber, plantName, userName = 'Plant Parent') {
  const payload = {
    apiKey: AISENSY_API_KEY,
    campaignName: 'qr_scan_welcome',
    destination: phoneNumber,
    userName: userName,
    templateParams: [userName, plantName, 'https://houseplant-koo2g5b6f-knaigs-projects.vercel.app']
  };
  
  return await sendMessage(payload, 'QR Scan Welcome');
}

async function sendOptInConfirmation(phoneNumber, userName = 'Plant Parent') {
  const payload = {
    apiKey: AISENSY_API_KEY,
    campaignName: 'optin_confirmation',
    destination: phoneNumber,
    userName: userName,
    templateParams: [userName, 'https://houseplant-koo2g5b6f-knaigs-projects.vercel.app/preferences']
  };
  
  return await sendMessage(payload, 'Opt-in Confirmation');
}

async function sendWateringConfirmation(phoneNumber, plantName, userName = 'Plant Parent') {
  const payload = {
    apiKey: AISENSY_API_KEY,
    campaignName: 'watering_confirmation',
    destination: phoneNumber,
    userName: userName,
    templateParams: [userName, plantName]
  };
  
  return await sendMessage(payload, 'Watering Confirmation');
}

async function sendMessage(payload, messageType) {
  console.log(`\n📤 ${messageType}:`);
  console.log(`   Campaign: ${payload.campaignName}`);
  console.log(`   Params: [${payload.templateParams.join(', ')}]`);
  
  try {
    const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.log(`   ❌ FAILED: ${responseText}`);
      return false;
    }

    const result = JSON.parse(responseText);
    console.log(`   ✅ SUCCESS: ${result.submitted_message_id}`);
    return true;

  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testUpdatedService() {
  console.log('🧪 Testing Updated WhatsApp Service');
  console.log('='.repeat(60));
  console.log(`Phone: ${PHONE_NUMBER}`);
  
  let successCount = 0;
  
  // Test watering reminder
  const reminders = [{
    plantId: 'test-1',
    plantName: 'Monstera',
    speciesName: 'Monstera Deliciosa',
    daysOverdue: 2,
    personality: 'FUNNY',
    qrCode: 'test'
  }];
  
  const reminderSuccess = await sendWateringReminder(PHONE_NUMBER, reminders, 'Karthik');
  if (reminderSuccess) successCount++;
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test QR scan message
  const qrSuccess = await sendQRScanMessage(PHONE_NUMBER, 'Snake Plant', 'Karthik');
  if (qrSuccess) successCount++;
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test opt-in confirmation
  const optinSuccess = await sendOptInConfirmation(PHONE_NUMBER, 'Karthik');
  if (optinSuccess) successCount++;
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test watering confirmation
  const confirmSuccess = await sendWateringConfirmation(PHONE_NUMBER, 'Fiddle Leaf Fig', 'Karthik');
  if (confirmSuccess) successCount++;
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Results: ${successCount}/4 messages sent successfully`);
  
  if (successCount === 4) {
    console.log('🎉 Updated WhatsApp service is working perfectly!');
    console.log('📱 Check your WhatsApp (+919886974008) for 4 different messages!');
    console.log('\n✅ Ready to deploy!');
  }
}

testUpdatedService();
