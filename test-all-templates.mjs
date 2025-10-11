#!/usr/bin/env node
/**
 * Test all AiSensy templates after they're created
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

const templates = [
  {
    name: "optin_confirmation",
    params: ["Karthik", "http://localhost:3001/dashboard"],
    description: "User opts into WhatsApp notifications"
  },
  {
    name: "qr_scan_welcome", 
    params: ["Karthik", "Monstera Deliciosa", "http://localhost:3001/dashboard"],
    description: "User scans QR to claim plant"
  },
  {
    name: "watering_reminder",
    params: [
      "Karthik", 
      "Monstera (2 days overdue), Snake Plant (due today)",
      "🌱 Your plants are getting thirsty! 😄",
      "Time to be a plant hero! 💪"
    ],
    description: "Daily watering reminder"
  },
  {
    name: "watering_confirmation",
    params: ["Karthik", "Monstera Deliciosa"],
    description: "User marks plant as watered"
  }
];

async function testTemplate(template) {
  console.log(`\n🧪 Testing: ${template.name}`);
  console.log(`   Purpose: ${template.description}`);
  console.log(`   Params: ${template.params.join(' | ')}`);
  console.log('   ' + '─'.repeat(60));
  
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

async function testAllTemplates() {
  console.log('📱 Testing All AiSensy Templates');
  console.log('='.repeat(80));
  console.log(`Phone: ${PHONE_NUMBER}`);
  console.log('Note: Templates must be created and approved in AiSensy first!');
  
  let successCount = 0;
  
  for (const template of templates) {
    const success = await testTemplate(template);
    if (success) successCount++;
    
    // Wait 3 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`📊 Results: ${successCount}/${templates.length} templates working`);
  
  if (successCount === templates.length) {
    console.log('🎉 All templates are working perfectly!');
    console.log('📱 Check your WhatsApp (+919886974008) for all test messages!');
    console.log('\n✅ Ready to update app code and deploy!');
  } else {
    console.log('⚠️  Some templates still need to be created or approved');
    console.log('\n📋 Missing templates:');
    templates.forEach((template, index) => {
      if (index >= successCount) {
        console.log(`   - ${template.name}: ${template.description}`);
      }
    });
  }
}

testAllTemplates();
