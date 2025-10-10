#!/usr/bin/env node

/**
 * AiSensy WhatsApp API Test Script
 * Tests your AiSensy WhatsApp API integration
 */

const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const config = {
  apiKey: process.env.AISENSY_API_KEY,
  baseUrl: 'https://backend.aisensy.com/campaign/t1/api/v2',
  campaigns: {
    watering: process.env.AISENSY_WATERING_CAMPAIGN || 'watering_reminder',
    qrScan: process.env.AISENSY_QR_SCAN_CAMPAIGN || 'qr_scan_welcome',
    optin: process.env.AISENSY_OPTIN_CAMPAIGN || 'optin_confirmation',
    confirmation: process.env.AISENSY_WATERING_CONFIRMATION_CAMPAIGN || 'watering_confirmation'
  }
};

async function testAiSensyAPI() {
  console.log('🧪 Testing AiSensy WhatsApp API Configuration...\n');

  // Check if API key is set
  if (!config.apiKey) {
    console.error('❌ Missing AISENSY_API_KEY environment variable');
    console.error('Please add it to your .env.local file');
    return;
  }

  console.log('✅ AiSensy API key is configured\n');

  // Test 1: Send a test watering reminder
  console.log('🌱 Testing Watering Reminder...');
  try {
    const testMessage = {
      apiKey: config.apiKey,
      campaignName: config.campaigns.watering,
      destination: '+919812345678', // Replace with your test number
      userName: 'Test User',
      templateParams: [
        'Test User',
        'Monstera (Monstera deliciosa) - 2 days overdue, Snake Plant (Sansevieria) - Due today',
        '🌱 Your plants are getting thirsty! 😄',
        'Time to be a plant hero! 💪'
      ]
    };

    const success = await sendMessage(testMessage);
    if (success) {
      console.log('✅ Watering reminder test sent successfully');
    } else {
      console.log('❌ Failed to send watering reminder test');
    }
  } catch (error) {
    console.error('❌ Error testing watering reminder:', error.message);
  }

  console.log('');

  // Test 2: Send QR scan message
  console.log('📱 Testing QR Scan Message...');
  try {
    const qrMessage = {
      apiKey: config.apiKey,
      campaignName: config.campaigns.qrScan,
      destination: '+919812345678', // Replace with your test number
      userName: 'Test User',
      templateParams: [
        'Test User',
        'Monstera',
        process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
      ]
    };

    const success = await sendMessage(qrMessage);
    if (success) {
      console.log('✅ QR scan message test sent successfully');
    } else {
      console.log('❌ Failed to send QR scan message test');
    }
  } catch (error) {
    console.error('❌ Error testing QR scan message:', error.message);
  }

  console.log('');

  // Test 3: Send opt-in confirmation
  console.log('✅ Testing Opt-in Confirmation...');
  try {
    const optinMessage = {
      apiKey: config.apiKey,
      campaignName: config.campaigns.optin,
      destination: '+919812345678', // Replace with your test number
      userName: 'Test User',
      templateParams: [
        'Test User',
        process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
      ]
    };

    const success = await sendMessage(optinMessage);
    if (success) {
      console.log('✅ Opt-in confirmation test sent successfully');
    } else {
      console.log('❌ Failed to send opt-in confirmation test');
    }
  } catch (error) {
    console.error('❌ Error testing opt-in confirmation:', error.message);
  }

  console.log('');

  // Test 4: Send watering confirmation
  console.log('💧 Testing Watering Confirmation...');
  try {
    const confirmationMessage = {
      apiKey: config.apiKey,
      campaignName: config.campaigns.confirmation,
      destination: '+919812345678', // Replace with your test number
      userName: 'Test User',
      templateParams: [
        'Test User',
        'Monstera'
      ]
    };

    const success = await sendMessage(confirmationMessage);
    if (success) {
      console.log('✅ Watering confirmation test sent successfully');
    } else {
      console.log('❌ Failed to send watering confirmation test');
    }
  } catch (error) {
    console.error('❌ Error testing watering confirmation:', error.message);
  }

  console.log('\n🎉 AiSensy API integration test completed!');
  console.log('\nNext steps:');
  console.log('1. Create campaigns in AiSensy dashboard with the names above');
  console.log('2. Set up message templates for each campaign');
  console.log('3. Test with real phone numbers');
  console.log('4. Deploy to production');
}

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(message);
    
    const options = {
      hostname: 'backend.aisensy.com',
      port: 443,
      path: '/campaign/t1/api/v2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('   Response:', jsonData);
            resolve(true);
          } else {
            console.error('   Error Response:', jsonData);
            resolve(false);
          }
        } catch (error) {
          console.error('   Invalid JSON response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('   Request error:', error.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Run the test
testAiSensyAPI().catch(console.error);
