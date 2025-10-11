#!/bin/bash
# Trigger Inngest test events to populate dashboard

echo "🧪 Triggering Inngest test events..."
echo ""

# Test 1: Trigger cron job manually (for sendWateringReminders)
echo "1. Testing watering reminders cron job..."
curl -s -X POST http://localhost:3001/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "inngest/scheduled.timer", "data": {"function_id": "send-watering-reminders"}}' | jq .

echo ""
echo "2. Triggering test reminder event..."
curl -s -X POST http://localhost:3001/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "test/reminder", "data": {"userId": "test_user", "phoneNumber": "+919876543210"}}' | jq .

echo ""
echo "3. Triggering plant feedback event..."
curl -s -X POST http://localhost:3001/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "plant/feedback.processed", "data": {"plantId": "test_plant", "feedback": "watered", "confidence": 0.9}}' | jq .

echo ""
echo "✅ Test events triggered!"
echo ""
echo "Now check Inngest dashboard: http://localhost:8288"
echo "You should see:"
echo "  - Functions tab (7 functions)"
echo "  - Events tab (3 events)"
echo "  - Runs tab (function executions)"


