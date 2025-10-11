#!/usr/bin/env node
/**
 * List all campaigns/templates from AiSensy
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";

async function listCampaigns() {
  try {
    console.log('📋 Fetching campaigns from AiSensy...');
    
    // Try different endpoints to list campaigns
    const endpoints = [
      'https://backend.aisensy.com/campaign/t1/api/v2',
      'https://backend.aisensy.com/campaigns/t1/api/v2',
      'https://backend.aisensy.com/templates/t1/api/v2',
      'https://backend.aisensy.com/campaign/t1/api/v1',
      'https://backend.aisensy.com/campaigns/t1/api/v1'
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🔍 Trying endpoint: ${endpoint}`);
      
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AISENSY_API_KEY}`
          }
        });

        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ SUCCESS!');
          console.log('Response:', JSON.stringify(data, null, 2));
          return;
        } else {
          const errorText = await response.text();
          console.log(`   Error: ${errorText.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`   Error: ${error.message}`);
      }
    }

    // Try POST request to list campaigns
    console.log('\n🔍 Trying POST to list campaigns...');
    const postResponse = await fetch('https://backend.aisensy.com/campaigns/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: AISENSY_API_KEY
      })
    });

    console.log(`POST Status: ${postResponse.status}`);
    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log('✅ POST SUCCESS!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await postResponse.text();
      console.log(`POST Error: ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listCampaigns();
