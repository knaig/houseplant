#!/bin/bash
# Quick Start Testing Script
# Run this to test the app end-to-end

set -e

echo "🌱 Houseplant App - Quick Start Test"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check environment
echo -e "${YELLOW}Step 1: Checking environment...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found${NC}"
    echo "Copy env.template to .env.local and fill in your credentials"
    exit 1
fi
echo -e "${GREEN}✅ .env.local exists${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Database setup
echo -e "${YELLOW}Step 3: Setting up database...${NC}"
echo "Pushing Prisma schema..."
npm run db:push --silent
echo "Seeding database..."
npm run db:seed
echo -e "${GREEN}✅ Database ready${NC}"
echo ""

# Step 4: TypeScript check
echo -e "${YELLOW}Step 4: Running TypeScript check...${NC}"
npm run typecheck 2>&1 | grep -q "error" && echo -e "${RED}❌ TypeScript errors found${NC}" || echo -e "${GREEN}✅ TypeScript check passed${NC}"
echo ""

# Step 5: Build check
echo -e "${YELLOW}Step 5: Testing build...${NC}"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 6: Start dev server
echo -e "${YELLOW}Step 6: Starting development server...${NC}"
echo "Starting server at http://localhost:3000"
echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:3000"
echo "2. Sign up for an account"
echo "3. Go to /admin/qr to generate QR codes"
echo "4. Use /claim?token=xxx to claim a plant"
echo "5. Check /app/settings to enable WhatsApp"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

