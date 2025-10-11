#!/usr/bin/env node
/**
 * Get templates using correct AiSensy API endpoint
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";

async function getTemplates() {
  try {
    console.log('📋 Getting templates from AiSensy...');
    
    // Try different possible endpoints
    const endpoints = [
      'https://backend.aisensy.com/template/t1/api/v1',
      'https://backend.aisensy.com/campaign/t1/api/v1',
      'https://backend.aisensy.com/template/api/v2',
      'https://backend.aisensy.com/campaign/api/v2',
      'https://backend.aisensy.com/api/templates',
      'https://backend.aisensy.com/api/campaigns'
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🔍 Trying: ${endpoint}`);
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: AISENSY_API_KEY
          })
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

    console.log('\n❌ No working endpoints found');
    console.log('\n💡 Let me try a different approach...');
    
    // Try GET request to a potential dashboard endpoint
    console.log('\n🔍 Trying dashboard endpoint...');
    const dashboardResponse = await fetch('https://backend.aisensy.com/dashboard/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: AISENSY_API_KEY
      })
    });

    console.log(`Dashboard Status: ${dashboardResponse.status}`);
    if (dashboardResponse.ok) {
      const data = await dashboardResponse.json();
      console.log('Dashboard Response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getTemplates();
