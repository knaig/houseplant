#!/usr/bin/env node

/**
 * WhatsApp API Test Script
 * Tests your WhatsApp Business API credentials
 */

const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const config = {
  baseUrl: process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com',
  apiVersion: process.env.WHATSAPP_API_VERSION || 'v22.0',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '817409881455418',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
};

async function testWhatsAppAPI() {
  console.log('🧪 Testing WhatsApp Business API Configuration...\n');

  // Check if all required environment variables are set
  const requiredVars = ['WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_BUSINESS_ACCOUNT_ID'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease add these to your .env.local file');
    return;
  }

  console.log('✅ All required environment variables are set\n');

  // Test 1: Get Phone Number Info
  console.log('📱 Testing Phone Number Info...');
  try {
    const phoneInfo = await makeRequest(`/${config.apiVersion}/${config.phoneNumberId}`);
    console.log('✅ Phone Number Info Retrieved:');
    console.log(`   - Display Name: ${phoneInfo.display_phone_number}`);
    console.log(`   - Quality Rating: ${phoneInfo.quality_rating}`);
    console.log(`   - Status: ${phoneInfo.status}\n`);
  } catch (error) {
    console.error('❌ Failed to get phone number info:', error.message);
    return;
  }

  // Test 2: Get Business Account Info
  console.log('🏢 Testing Business Account Info...');
  try {
    const businessInfo = await makeRequest(`/${config.apiVersion}/${config.businessAccountId}`);
    console.log('✅ Business Account Info Retrieved:');
    console.log(`   - Name: ${businessInfo.name}`);
    console.log(`   - ID: ${businessInfo.id}\n`);
  } catch (error) {
    console.error('❌ Failed to get business account info:', error.message);
    return;
  }

  // Test 3: Test Message Template (if any)
  console.log('📝 Testing Message Templates...');
  try {
    const templates = await makeRequest(`/${config.apiVersion}/${config.businessAccountId}/message_templates`);
    console.log('✅ Message Templates Retrieved:');
    if (templates.data && templates.data.length > 0) {
      templates.data.forEach(template => {
        console.log(`   - ${template.name} (${template.status})`);
      });
    } else {
      console.log('   - No message templates found (this is normal for new accounts)');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Failed to get message templates:', error.message);
  }

  console.log('🎉 WhatsApp API configuration test completed!');
  console.log('\nNext steps:');
  console.log('1. Configure webhook in Meta Business Manager');
  console.log('2. Test sending a message to your phone number');
  console.log('3. Set up your webhook URL: https://houseplant-koo2g5b6f-knaigs-projects.vercel.app/api/whatsapp/webhook');
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${config.baseUrl}${path}?access_token=${config.accessToken}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.error) {
            reject(new Error(jsonData.error.message));
          } else {
            resolve(jsonData);
          }
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Run the test
testWhatsAppAPI().catch(console.error);
