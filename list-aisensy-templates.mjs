#!/usr/bin/env node
/**
 * List all available templates from AiSensy
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";

async function listTemplates() {
  try {
    console.log('📋 Fetching templates from AiSensy...');
    
    const response = await fetch('https://backend.aisensy.com/template/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: AISENSY_API_KEY
      })
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch templates');
      console.error('Status:', response.status);
      const errorText = await response.text();
      console.error('Error:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('\n✅ Available Templates:');
    console.log('='.repeat(60));
    
    if (data.templates && Array.isArray(data.templates)) {
      data.templates.forEach((template, index) => {
        console.log(`${index + 1}. Name: "${template.name}"`);
        console.log(`   Status: ${template.status}`);
        console.log(`   Type: ${template.type}`);
        console.log(`   Content: ${template.content ? template.content.substring(0, 100) + '...' : 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('📄 Response structure:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listTemplates();
