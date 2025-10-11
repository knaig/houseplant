#!/usr/bin/env node
/**
 * Send test WhatsApp message directly via AiSensy
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

console.log('📱 Sending test WhatsApp message...');
console.log('To:', PHONE_NUMBER);
console.log('');

async function sendTestMessage() {
  try {
    const message = {
      apiKey: AISENSY_API_KEY,
      campaignName: "optin_confirmation",
      destination: PHONE_NUMBER,
      userName: "Karthik",
      templateParams: [
        "Karthik",
        "http://localhost:3001"
      ]
    };

    console.log('Sending to AiSensy API...');
    
    const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AiSensy API Error:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ WhatsApp message sent successfully!');
    console.log('Response:', result);
    console.log('');
    console.log('📱 Check your WhatsApp on +919886974008');
    console.log('');
    console.log('Note: If you don\'t receive a message:');
    console.log('  1. Make sure the "optin_confirmation" template exists in AiSensy');
    console.log('  2. Check that your phone number is verified in AiSensy');
    console.log('  3. Verify you have credits in your AiSensy account');

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
  }
}

sendTestMessage();


