#!/usr/bin/env node
/**
 * Find exact template names by trying variations
 */

const AISENSY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU0MzlkZTNlN2E3MGI5NTg5YTY2OCIsIm5hbWUiOiJDb250ZW50b3IiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjcwZTQzOWRlM2U3YTcwYjk1ODlhNjViIiwiYWN0aXZlUGxhbiI6IlBST19NT05USExZIiwiaWF0IjoxNzYwMTE4NzUwfQ.k2rRBTPHzzG_SKQBDSK74G4cDUMvKtYG32JL_3OVOgo";
const PHONE_NUMBER = "+919886974008";

// Based on your screenshot, trying different variations
const possibleNames = [
  // From screenshot - truncated names
  "optin_confirmat",  // optin_confirmation
  "qr_scan_welco",    // qr_scan_welcome  
  "watering_remin",   // watering_reminder
  
  // Common variations
  "optin_confirmation",
  "qr_scan_welcome", 
  "watering_reminder",
  
  // Alternative naming patterns
  "optin_confirm",
  "qr_welcome",
  "plant_reminder",
  "water_reminder",
  
  // With underscores
  "optin_confirm_at",
  "qr_scan_welcome_message",
  "watering_reminder_daily"
];

async function testTemplateName(name) {
  try {
    const payload = {
      apiKey: AISENSY_API_KEY,
      campaignName: name,
      destination: PHONE_NUMBER,
      userName: "Karthik",
      templateParams: ["Karthik", "Test Plant"]
    };

    const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    
    if (response.ok) {
      console.log(`✅ FOUND: "${name}"`);
      return true;
    } else if (responseText.includes("Template params does not match")) {
      console.log(`✅ EXISTS: "${name}" (wrong params)`);
      return true;
    } else {
      console.log(`❌ "${name}" - ${responseText}`);
      return false;
    }

  } catch (error) {
    console.log(`❌ "${name}" - ERROR: ${error.message}`);
    return false;
  }
}

async function findTemplates() {
  console.log('🔍 Finding exact template names...');
  console.log('='.repeat(50));
  
  const found = [];
  
  for (const name of possibleNames) {
    const exists = await testTemplateName(name);
    if (exists) found.push(name);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📋 Found ${found.length} existing templates:`);
  found.forEach(name => console.log(`   ✅ ${name}`));
}

findTemplates();
