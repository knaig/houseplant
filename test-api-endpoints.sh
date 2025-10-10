#!/bin/bash
# API Endpoints Testing Script
# Tests all major API endpoints

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🧪 Testing Houseplant API Endpoints"
echo "===================================="
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo "  ${method} ${endpoint}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X ${method} "${BASE_URL}${endpoint}")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X ${method} "${BASE_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -d "${data}")
    fi
    
    if [ $response -eq 200 ] || [ $response -eq 201 ]; then
        echo -e "  ${GREEN}✅ Success (${response})${NC}"
    elif [ $response -eq 401 ] || [ $response -eq 403 ]; then
        echo -e "  ${YELLOW}⚠️  Auth required (${response})${NC}"
    else
        echo -e "  ${RED}❌ Failed (${response})${NC}"
    fi
    echo ""
}

# Public endpoints
echo "📋 Public Endpoints"
echo "-------------------"
test_endpoint "GET" "/api/species" "Get plant species list"

echo ""
echo "🔐 Protected Endpoints (may require auth)"
echo "----------------------------------------"
test_endpoint "GET" "/api/whatsapp/optin" "Get WhatsApp opt-in status"
test_endpoint "GET" "/api/whatsapp/webhook" "WhatsApp webhook health check"

echo ""
echo "📊 Admin Endpoints"
echo "-----------------"
test_endpoint "GET" "/api/admin/qr" "Admin QR generation page"

echo ""
echo "🌿 Plant Management"
echo "------------------"
test_endpoint "GET" "/api/plants/water?plant=test" "Get watering status (invalid ID)"
test_endpoint "GET" "/api/user/plants/names" "Get user's plant names"

echo ""
echo "💳 Payment Endpoints"
echo "-------------------"
test_endpoint "GET" "/api/stripe/checkout" "Stripe checkout"
test_endpoint "GET" "/api/razorpay/order" "Razorpay order"

echo ""
echo "⚙️  Background Jobs"
echo "------------------"
test_endpoint "GET" "/api/inngest" "Inngest endpoint health"

echo ""
echo "✅ API Endpoint Testing Complete!"
echo ""
echo "Note: Many endpoints require authentication."
echo "Sign in at ${BASE_URL}/sign-in to test protected routes."

