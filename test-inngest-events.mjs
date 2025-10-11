#!/usr/bin/env node
/**
 * Test Inngest Events
 * Sends events through the Inngest client
 */

import { Inngest } from 'inngest';

const inngest = new Inngest({
  id: 'houseplant-app',
  eventKey: process.env.INNGEST_EVENT_KEY || 'test-key',
});

console.log('🧪 Testing Inngest Events\n');

async function sendTestEvents() {
  try {
    // Test 1: Send feedback event
    console.log('1. Sending plant feedback event...');
    await inngest.send({
      name: 'plant/feedback.processed',
      data: {
        plantId: 'test_plant_123',
        feedback: 'watered',
        confidence: 0.9
      }
    });
    console.log('✅ Feedback event sent\n');

    // Test 2: Send schedule event
    console.log('2. Sending schedule recalculation event...');
    await inngest.send({
      name: 'plant/schedule.recalculated',
      data: {
        plantId: 'test_plant_123',
        userId: 'test_user_123',
        reason: 'test_event'
      }
    });
    console.log('✅ Schedule event sent\n');

    // Test 3: Send reminder scheduled event
    console.log('3. Sending reminder scheduled event...');
    await inngest.send({
      name: 'plant/reminder.scheduled',
      data: {
        plantId: 'test_plant_123',
        userId: 'test_user_123',
        scheduledFor: new Date(Date.now() + 60000).toISOString() // 1 minute from now
      }
    });
    console.log('✅ Reminder scheduled event sent\n');

    console.log('✅ All test events sent successfully!');
    console.log('');
    console.log('Check Inngest dashboard at http://localhost:8288');
    console.log('  - Functions tab: See all 7 functions');
    console.log('  - Events tab: See the 3 events we just sent');
    console.log('  - Runs tab: See function executions (may show errors without real data)');
    
  } catch (error) {
    console.error('❌ Error sending events:', error);
  }
}

sendTestEvents();


