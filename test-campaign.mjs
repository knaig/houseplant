#!/usr/bin/env node
/**
 * Test specific AiSensy campaign with correct parameters
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

const campaigns = {
  watering_confirmation: {
    params: ["Karthik", "Monstera"]  // {{1}} userName, {{2}} plantName
  },
  qr_scan_welcome: {
    params: ["Karthik", "Monstera", "http://localhost:3001"]  // {{1}} userName, {{2}} plantName, {{3}} appUrl
  },
  optin_confirmation: {
    params: ["Karthik", "http://localhost:3001"]  // {{1}} userName, {{2}} appUrl
  },
  watering_reminder: {
    params: [
      "Karthik",                           // {{1}} userName
      "Monstera, Snake Plant",             // {{2}} plantList
      "🌱 Your plants are getting thirsty!", // {{3}} header
      "Time to be a plant hero! 💪"        // {{4}} footer
    ]
  }
};

const campaignName = process.argv[2] || 'watering_confirmation';

if (!campaigns[campaignName]) {
  console.error(`❌ Unknown campaign: ${campaignName}`);
  console.log('Available campaigns:', Object.keys(campaigns).join(', '));
  process.exit(1);
}

console.log('📱 Sending WhatsApp via AiSensy');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Phone:', PHONE_NUMBER);
console.log('Campaign:', campaignName);
console.log('Params:', campaigns[campaignName].params);
console.log('');

async function sendMessage() {
  try {
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: campaignName,
      destination: PHONE_NUMBER,
      userName: "Karthik",
      templateParams: campaigns[campaignName].params
    };

    console.log('Calling AiSensy API...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('');
    
    const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('❌ Failed!');
      console.error('Status:', response.status);
      console.error('Error:', responseText);
      return;
    }

    const result = JSON.parse(responseText);
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('');
    console.log('📱 Check your WhatsApp (+919886974008) now!');
    console.log('   Message should arrive in 5-10 seconds.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendMessage();

