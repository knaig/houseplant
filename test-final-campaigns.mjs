#!/usr/bin/env node
/**
 * Test campaigns with correct parameters based on template content
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

async function testCampaignWithParams(campaignName, params, description) {
  console.log(`\n🧪 Testing: ${campaignName}`);
  console.log(`   Purpose: ${description}`);
  console.log(`   Params: [${params.map(p => `"${p}"`).join(', ')}]`);
  console.log('   ' + '─'.repeat(60));
  
  try {
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: campaignName,
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

async function testAllCampaigns() {
  console.log('🎯 Testing All Campaigns with Correct Parameters');
  console.log('='.repeat(80));
  console.log(`Phone: ${PHONE_NUMBER}`);
  
  const campaigns = [
    {
      name: 'optin_confirmation',
      params: ['Karthik', 'https://houseplant-koo2g5b6f-knaigs-projects.vercel.app/preferences'],
      description: 'User opts into WhatsApp notifications'
    },
    {
      name: 'qr_scan_welcome',
      params: ['Karthik', 'Monstera Deliciosa', 'https://houseplant-koo2g5b6f-knaigs-projects.vercel.app/setup'],
      description: 'User scans QR to claim plant'
    },
    {
      name: 'watering_reminder',
      params: ['Karthik', 'Monstera, Snake Plant', 'Last watered: 3 days ago', 'Recommended: Water today'],
      description: 'Daily watering reminder'
    },
    {
      name: 'watering_confirmation',
      params: ['Karthik', 'Monstera Deliciosa'],
      description: 'User marks plant as watered'
    }
  ];
  
  let successCount = 0;
  
  for (const campaign of campaigns) {
    const success = await testCampaignWithParams(campaign.name, campaign.params, campaign.description);
    if (success) successCount++;
    
    // Wait 3 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`📊 Results: ${successCount}/${campaigns.length} campaigns working`);
  
  if (successCount === campaigns.length) {
    console.log('🎉 All campaigns are working perfectly!');
    console.log('📱 Check your WhatsApp (+919886974008) for all test messages!');
    console.log('\n✅ Ready to update app code and deploy!');
  } else {
    console.log('⚠️  Some campaigns need parameter adjustments');
  }
}

testAllCampaigns();
