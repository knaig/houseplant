#!/usr/bin/env node
/**
 * Test templates with correct parameters based on actual template content
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

const templates = [
  {
    name: "optin_confirmation",
    params: [
      "Karthik",                                    // [John]
      "https://houseplant-koo2g5b6f-knaigs-projects.vercel.app/preferences"  // [https://example.com/preferences]
    ],
    description: "User opts into WhatsApp notifications"
  },
  {
    name: "qr_scan_welcome", 
    params: [
      "Karthik",                                    // [John]
      "Monstera Deliciosa",                         // [Monstera Deliciosa]
      "https://houseplant-koo2g5b6f-knaigs-projects.vercel.app/setup"        // [https://plantcare.example.com/setup]
    ],
    description: "User scans QR to claim plant"
  },
  {
    name: "watering_reminder",
    params: [
      "Karthik",                                    // [John]
      "Monstera, Snake Plant",                      // [Monstera, Snake Plant]
      "Last watered: 3 days ago",                   // [Last watered: 5 days ago]
      "Recommended: Water today"                    // [Recommended: Water today]
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
  console.log('📱 Testing All AiSensy Templates with Correct Parameters');
  console.log('='.repeat(80));
  console.log(`Phone: ${PHONE_NUMBER}`);
  console.log('Using actual template content and parameters');
  
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
    console.log('⚠️  Some templates still need attention');
    console.log('\n📋 Templates that failed:');
    templates.forEach((template, index) => {
      if (index >= successCount) {
        console.log(`   - ${template.name}: ${template.description}`);
      }
    });
  }
}

testAllTemplates();
