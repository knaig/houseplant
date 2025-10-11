#!/usr/bin/env node
/**
 * Debug template parameters - try different combinations
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

async function testTemplateWithParams(templateName, params, description) {
  console.log(`\n🧪 Testing: ${templateName}`);
  console.log(`   Description: ${description}`);
  console.log(`   Params: [${params.map(p => `"${p}"`).join(', ')}]`);
  console.log('   ' + '─'.repeat(60));
  
  try {
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: templateName,
      destination: PHONE_NUMBER,
      userName: "Karthik",
      templateParams: params
    };

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

async function debugTemplates() {
  console.log('🔍 Debugging Template Parameters');
  console.log('='.repeat(80));
  console.log(`Phone: ${PHONE_NUMBER}`);
  
  // Test optin_confirmation with different parameter counts
  console.log('\n📋 Testing optin_confirmation with different parameters:');
  
  await testTemplateWithParams('optin_confirmation', ['Karthik'], 'Just name');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testTemplateWithParams('optin_confirmation', ['Karthik', 'https://example.com/preferences'], 'Name + URL');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test qr_scan_welcome with different parameter counts
  console.log('\n📋 Testing qr_scan_welcome with different parameters:');
  
  await testTemplateWithParams('qr_scan_welcome', ['Karthik'], 'Just name');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testTemplateWithParams('qr_scan_welcome', ['Karthik', 'Monstera Deliciosa'], 'Name + Plant');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testTemplateWithParams('qr_scan_welcome', ['Karthik', 'Monstera Deliciosa', 'https://example.com/setup'], 'Name + Plant + URL');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test watering_reminder with different parameter counts
  console.log('\n📋 Testing watering_reminder with different parameters:');
  
  await testTemplateWithParams('watering_reminder', ['Karthik'], 'Just name');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testTemplateWithParams('watering_reminder', ['Karthik', 'Monstera, Snake Plant'], 'Name + Plants');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testTemplateWithParams('watering_reminder', ['Karthik', 'Monstera, Snake Plant', 'Last watered: 3 days ago'], 'Name + Plants + Last watered');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testTemplateWithParams('watering_reminder', ['Karthik', 'Monstera, Snake Plant', 'Last watered: 3 days ago', 'Recommended: Water today'], 'All 4 parameters');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n' + '='.repeat(80));
  console.log('🔍 Debug complete! Check which parameter combinations work.');
}

debugTemplates();
