#!/usr/bin/env node
/**
 * Test different campaign names to find what actually exists
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

async function testCampaign(campaignName, params, description) {
  console.log(`\n🧪 Testing Campaign: "${campaignName}"`);
  console.log(`   Description: ${description}`);
  console.log(`   Params: [${params.map(p => `"${p}"`).join(', ')}]`);
  
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

async function findCampaigns() {
  console.log('🔍 Finding Available Campaigns');
  console.log('='.repeat(60));
  console.log(`Phone: ${PHONE_NUMBER}`);
  
  // Test various campaign name possibilities
  const campaigns = [
    { name: 'watering_confirmation', params: ['Karthik', 'Test Plant'], desc: 'Known working campaign' },
    { name: 'watering_reminder', params: ['Karthik', 'Monstera, Snake Plant'], desc: 'You mentioned this campaign exists' },
    { name: 'optin_confirmation', params: ['Karthik'], desc: 'Template exists but campaign?' },
    { name: 'qr_scan_welcome', params: ['Karthik', 'Monstera'], desc: 'Template exists but campaign?' },
    { name: 'plant_reminder', params: ['Karthik'], desc: 'Alternative name' },
    { name: 'water_reminder', params: ['Karthik'], desc: 'Alternative name' },
    { name: 'qr_welcome', params: ['Karthik'], desc: 'Alternative name' },
    { name: 'optin_confirm', params: ['Karthik'], desc: 'Alternative name' }
  ];
  
  let successCount = 0;
  
  for (const campaign of campaigns) {
    const success = await testCampaign(campaign.name, campaign.params, campaign.desc);
    if (success) successCount++;
    
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Found ${successCount} working campaigns`);
  
  if (successCount === 0) {
    console.log('❌ No campaigns found. You need to create campaigns in AiSensy dashboard.');
    console.log('\n📋 Steps to create campaigns:');
    console.log('1. Go to AiSensy Dashboard → Campaigns');
    console.log('2. Create campaigns that use your approved templates');
    console.log('3. Campaign names should match what you want to use in code');
  }
}

findCampaigns();
