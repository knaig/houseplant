#!/usr/bin/env node
/**
 * Test all WhatsApp message types using the working template
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

const messages = [
  {
    name: "Watering Reminder",
    params: ["Karthik", "Monstera (Monstera Deliciosa) - 2 days overdue, Snake Plant (Sansevieria) - Due today - 🌱 Your plants are getting thirsty! 😄"]
  },
  {
    name: "QR Scan Welcome", 
    params: ["Karthik", "Welcome! You've claimed Snake Plant. Visit: http://localhost:3001"]
  },
  {
    name: "Opt-in Confirmation",
    params: ["Karthik", "You're now subscribed to plant care reminders! Visit: http://localhost:3001"]
  },
  {
    name: "Watering Confirmation",
    params: ["Karthik", "Great job watering your Fiddle Leaf Fig! 🌱"]
  }
];

async function sendMessage(messageType, params) {
  try {
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: 'watering_confirmation',
      destination: PHONE_NUMBER,
      userName: "Karthik",
      templateParams: params
    };

    console.log(`\n📤 Sending: ${messageType}`);
    console.log(`   Params: ${params.join(' | ')}`);
    
    const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

async function testAllMessages() {
  console.log('🧪 Testing All WhatsApp Message Types');
  console.log('='.repeat(60));
  console.log(`Phone: ${PHONE_NUMBER}`);
  console.log(`Template: watering_confirmation (working template)`);
  
  let successCount = 0;
  
  for (const message of messages) {
    const success = await sendMessage(message.name, message.params);
    if (success) successCount++;
    
    // Wait 3 seconds between messages
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Results: ${successCount}/${messages.length} messages sent successfully`);
  
  if (successCount === messages.length) {
    console.log('🎉 All message types are working!');
    console.log('📱 Check your WhatsApp (+919886974008) for 4 different messages!');
  } else {
    console.log('⚠️  Some messages failed - check the logs above');
  }
}

testAllMessages();
