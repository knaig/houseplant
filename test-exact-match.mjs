#!/usr/bin/env node
/**
 * Test with exact template names - no variations
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

async function testExactTemplate(templateName, params) {
  console.log(`\n🧪 Testing EXACT: "${templateName}"`);
  console.log(`   Params: [${params.map(p => `"${p}"`).join(', ')}]`);
  
  try {
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: templateName,
      destination: PHONE_NUMBER,
      userName: "Karthik",
      templateParams: params
    };

    console.log('   Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${responseText}`);
    
    if (!response.ok) {
      console.log(`   ❌ FAILED`);
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

async function testExactTemplates() {
  console.log('🔍 Testing EXACT Template Names');
  console.log('='.repeat(60));
  console.log(`Phone: ${PHONE_NUMBER}`);
  console.log('Testing with exact names as provided by user');
  
  // Test each template with minimal parameters first
  const templates = [
    { name: 'optin_confirmation', params: ['Karthik'] },
    { name: 'qr_scan_welcome', params: ['Karthik'] },
    { name: 'watering_reminder', params: ['Karthik'] },
    { name: 'watering_confirmation', params: ['Karthik', 'Test Plant'] }
  ];
  
  for (const template of templates) {
    await testExactTemplate(template.name, template.params);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔍 Exact name test complete!');
}

testExactTemplates();
