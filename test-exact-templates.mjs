#!/usr/bin/env node
/**
 * Test exact template names from AiSensy dashboard
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

// Exact names from your screenshot
const templates = [
  { name: "watering_confirmation", params: ["Karthik", "Monstera"] },
  { name: "optin_confirmation", params: ["Karthik", "http://localhost:3001"] },
  { name: "qr_scan_welcome", params: ["Karthik", "Monstera", "http://localhost:3001"] },
  { name: "watering_reminder", params: ["Karthik", "Monstera, Snake Plant", "🌱 Your plants are getting thirsty!", "Time to be a plant hero! 💪"] }
];

async function testTemplate(template) {
  console.log(`\n🧪 Testing: ${template.name}`);
  console.log('━'.repeat(50));
  
  try {
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: template.name,
      destination: PHONE_NUMBER,
      userName: "Karthik",
      templateParams: template.params
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
      console.log(`❌ ${template.name}: FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${responseText}`);
      return false;
    }

    const result = JSON.parse(responseText);
    console.log(`✅ ${template.name}: SUCCESS`);
    console.log(`   Message ID: ${result.submitted_message_id}`);
    return true;

  } catch (error) {
    console.log(`❌ ${template.name}: ERROR - ${error.message}`);
    return false;
  }
}

async function testAllTemplates() {
  console.log('📱 Testing All AiSensy Templates');
  console.log('='.repeat(50));
  console.log(`Phone: ${PHONE_NUMBER}`);
  
  let successCount = 0;
  
  for (const template of templates) {
    const success = await testTemplate(template);
    if (success) successCount++;
    
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Results: ${successCount}/${templates.length} templates working`);
  
  if (successCount === templates.length) {
    console.log('🎉 All templates are working perfectly!');
  } else {
    console.log('⚠️  Some templates need attention');
  }
}

testAllTemplates();
