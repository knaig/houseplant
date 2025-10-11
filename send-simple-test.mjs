#!/usr/bin/env node
/**
 * Send simple test WhatsApp message
 * Usage: node send-simple-test.mjs [campaign_name]
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";
const CAMPAIGN_NAME = process.argv[2] || "test_message";

console.log('📱 Sending WhatsApp via AiSensy');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Phone:', PHONE_NUMBER);
console.log('Campaign:', CAMPAIGN_NAME);
console.log('');

async function sendMessage() {
  try {
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: CAMPAIGN_NAME,
      destination: PHONE_NUMBER,
      userName: "Karthik",
      templateParams: ["Karthik"]
    };

    console.log('Calling AiSensy API...');
    
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
      console.log('');
      console.log('💡 Make sure:');
      console.log(`   1. Campaign "${CAMPAIGN_NAME}" exists in AiSensy dashboard`);
      console.log('   2. Template is approved by WhatsApp');
      console.log('   3. Phone number is verified in AiSensy');
      console.log('   4. You have credits in your account');
      return;
    }

    const result = JSON.parse(responseText);
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('');
    console.log('📱 Check your WhatsApp now! Message should arrive in 5-10 seconds.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendMessage();


