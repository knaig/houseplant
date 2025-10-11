#!/usr/bin/env node
/**
 * Test the updated WhatsApp service
 */

import { whatsappService } from './src/lib/whatsapp.js';

async function testWhatsAppService() {
  console.log('🧪 Testing Updated WhatsApp Service');
  console.log('='.repeat(50));
  
  const phoneNumber = '+919886974008';
  const userName = 'Karthik';
  
  try {
    // Test watering reminder
    console.log('\n1️⃣ Testing Watering Reminder...');
    const reminders = [{
      plantId: 'test-plant-1',
      plantName: 'Monstera',
      speciesName: 'Monstera Deliciosa',
      daysOverdue: 2,
      personality: 'FUNNY',
      qrCode: 'test-qr-code'
    }];
    
    const reminderSuccess = await whatsappService.sendWateringReminder(phoneNumber, reminders, userName);
    console.log(`   Result: ${reminderSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test QR scan message
    console.log('\n2️⃣ Testing QR Scan Message...');
    const qrSuccess = await whatsappService.sendQRScanMessage(phoneNumber, 'Snake Plant', userName);
    console.log(`   Result: ${qrSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test opt-in confirmation
    console.log('\n3️⃣ Testing Opt-in Confirmation...');
    const optinSuccess = await whatsappService.sendOptInConfirmation(phoneNumber, userName);
    console.log(`   Result: ${optinSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test watering confirmation
    console.log('\n4️⃣ Testing Watering Confirmation...');
    const confirmSuccess = await whatsappService.sendWateringConfirmation(phoneNumber, 'Fiddle Leaf Fig', userName);
    console.log(`   Result: ${confirmSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    console.log('\n' + '='.repeat(50));
    console.log('📱 Check your WhatsApp (+919886974008) for 4 test messages!');
    console.log('   Messages should arrive within 30 seconds.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWhatsAppService();
