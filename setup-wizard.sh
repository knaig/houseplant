#!/bin/bash
# Interactive Setup Wizard for Houseplant App
# This will guide you through getting all necessary API keys

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🌱 Houseplant App Setup Wizard 🌱   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}This wizard will help you set up all required API keys.${NC}"
echo -e "${CYAN}We'll create your .env.local file step by step.${NC}"
echo ""
read -p "Press Enter to start..."
clear

# Initialize .env.local
ENV_FILE=".env.local"
echo "# Houseplant App Environment Variables" > $ENV_FILE
echo "# Generated on $(date)" >> $ENV_FILE
echo "" >> $ENV_FILE

# ============================================================================
# Step 1: Database
# ============================================================================
echo -e "${PURPLE}═══════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}Step 1/3: Database Setup (PostgreSQL)${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}You need a PostgreSQL database. Choose an option:${NC}"
echo ""
echo "  1) Supabase (Recommended - FREE, easy, 5 min setup)"
echo "  2) Neon (Alternative - FREE, fast)"
echo "  3) Local PostgreSQL (Advanced)"
echo "  4) Skip for now (I'll add it later)"
echo ""
read -p "Enter choice [1-4]: " db_choice

case $db_choice in
  1)
    echo ""
    echo -e "${CYAN}📝 Supabase Setup Instructions:${NC}"
    echo ""
    echo "  1. Open browser: ${BLUE}https://supabase.com${NC}"
    echo "  2. Click 'Start your project'"
    echo "  3. Sign up with GitHub/Google"
    echo "  4. Click 'New project'"
    echo "  5. Fill in:"
    echo "     - Name: houseplant"
    echo "     - Database Password: (create a strong password)"
    echo "     - Region: (choose closest to you)"
    echo "  6. Click 'Create new project' (wait 2 minutes)"
    echo "  7. Go to Settings → Database"
    echo "  8. Under 'Connection string' → URI, copy the string"
    echo "  9. Replace [YOUR-PASSWORD] with your actual password"
    echo ""
    echo -e "${GREEN}✋ Complete steps above, then come back here...${NC}"
    echo ""
    read -p "Paste your DATABASE_URL: " db_url
    echo "DATABASE_URL=\"$db_url\"" >> $ENV_FILE
    echo -e "${GREEN}✅ Database configured!${NC}"
    ;;
  2)
    echo ""
    echo -e "${CYAN}📝 Neon Setup Instructions:${NC}"
    echo ""
    echo "  1. Open browser: ${BLUE}https://neon.tech${NC}"
    echo "  2. Sign up"
    echo "  3. Create new project"
    echo "  4. Copy connection string"
    echo ""
    read -p "Paste your DATABASE_URL: " db_url
    echo "DATABASE_URL=\"$db_url\"" >> $ENV_FILE
    echo -e "${GREEN}✅ Database configured!${NC}"
    ;;
  3)
    echo ""
    echo -e "${CYAN}📝 Local PostgreSQL:${NC}"
    echo ""
    echo "Example: postgresql://username:password@localhost:5432/houseplant"
    read -p "Enter your DATABASE_URL: " db_url
    echo "DATABASE_URL=\"$db_url\"" >> $ENV_FILE
    echo -e "${GREEN}✅ Database configured!${NC}"
    ;;
  4)
    echo "DATABASE_URL=\"postgresql://user:pass@localhost:5432/houseplant\"" >> $ENV_FILE
    echo -e "${YELLOW}⚠️  Skipped - Remember to add this later!${NC}"
    ;;
esac

echo ""
read -p "Press Enter to continue..."
clear

# ============================================================================
# Step 2: Authentication
# ============================================================================
echo -e "${PURPLE}═══════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}Step 2/3: Authentication (Clerk)${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Clerk handles user sign up/sign in (FREE up to 10K users)${NC}"
echo ""
echo -e "${CYAN}📝 Clerk Setup Instructions:${NC}"
echo ""
echo "  1. Open browser: ${BLUE}https://clerk.com${NC}"
echo "  2. Sign up (free)"
echo "  3. Click 'Create application'"
echo "  4. Name: Houseplant"
echo "  5. Choose auth methods: Email + Google (recommended)"
echo "  6. Click 'Create application'"
echo "  7. You'll see a 'Next.js Quickstart' page"
echo "  8. Copy both keys:"
echo "     - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (starts with pk_)"
echo "     - CLERK_SECRET_KEY (starts with sk_)"
echo ""
echo -e "${GREEN}✋ Complete steps above, then come back here...${NC}"
echo ""
read -p "Do you want to add Clerk keys now? (y/n): " add_clerk

if [[ $add_clerk == "y" || $add_clerk == "Y" ]]; then
  echo ""
  read -p "Paste NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: " clerk_pub
  read -p "Paste CLERK_SECRET_KEY: " clerk_secret
  echo "" >> $ENV_FILE
  echo "# Clerk Authentication" >> $ENV_FILE
  echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\"$clerk_pub\"" >> $ENV_FILE
  echo "CLERK_SECRET_KEY=\"$clerk_secret\"" >> $ENV_FILE
  echo -e "${GREEN}✅ Clerk configured!${NC}"
else
  echo "" >> $ENV_FILE
  echo "# Clerk Authentication" >> $ENV_FILE
  echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\"pk_test_your_key_here\"" >> $ENV_FILE
  echo "CLERK_SECRET_KEY=\"sk_test_your_key_here\"" >> $ENV_FILE
  echo -e "${YELLOW}⚠️  Skipped - Remember to add this later!${NC}"
fi

echo ""
read -p "Press Enter to continue..."
clear

# ============================================================================
# Step 3: Optional Services
# ============================================================================
echo -e "${PURPLE}═══════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}Step 3/3: Optional Services${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}These are optional - you can skip and add later:${NC}"
echo ""

# Inngest
echo -e "${CYAN}Inngest (Background Jobs - FREE):${NC}"
read -p "Add Inngest? (y/n): " add_inngest
if [[ $add_inngest == "y" || $add_inngest == "Y" ]]; then
  echo "Visit: https://inngest.com → Sign up → Copy Event Key"
  read -p "Paste INNGEST_EVENT_KEY: " inngest_key
  echo "" >> $ENV_FILE
  echo "# Inngest Background Jobs" >> $ENV_FILE
  echo "INNGEST_EVENT_KEY=\"$inngest_key\"" >> $ENV_FILE
  echo -e "${GREEN}✅ Inngest configured!${NC}"
else
  echo "" >> $ENV_FILE
  echo "# Inngest Background Jobs (optional)" >> $ENV_FILE
  echo "# INNGEST_EVENT_KEY=\"your_key_here\"" >> $ENV_FILE
fi
echo ""

# AiSensy
echo -e "${CYAN}AiSensy (WhatsApp - ₹999/month):${NC}"
read -p "Add AiSensy? (y/n): " add_aisensy
if [[ $add_aisensy == "y" || $add_aisensy == "Y" ]]; then
  echo "Visit: https://aisensy.com → Sign up → Copy API Key"
  read -p "Paste AISENSY_API_KEY: " aisensy_key
  echo "" >> $ENV_FILE
  echo "# AiSensy WhatsApp" >> $ENV_FILE
  echo "AISENSY_API_KEY=\"$aisensy_key\"" >> $ENV_FILE
  echo "AISENSY_WATERING_CAMPAIGN=\"watering_reminder\"" >> $ENV_FILE
  echo "AISENSY_QR_SCAN_CAMPAIGN=\"qr_scan_welcome\"" >> $ENV_FILE
  echo "AISENSY_OPTIN_CAMPAIGN=\"optin_confirmation\"" >> $ENV_FILE
  echo "AISENSY_WATERING_CONFIRMATION_CAMPAIGN=\"watering_confirmation\"" >> $ENV_FILE
  echo -e "${GREEN}✅ AiSensy configured!${NC}"
else
  echo "" >> $ENV_FILE
  echo "# AiSensy WhatsApp (optional)" >> $ENV_FILE
  echo "# AISENSY_API_KEY=\"your_key_here\"" >> $ENV_FILE
fi
echo ""

# Add app URLs
echo "" >> $ENV_FILE
echo "# App Configuration" >> $ENV_FILE
echo "NEXT_PUBLIC_APP_URL=\"http://localhost:3000\"" >> $ENV_FILE
echo "APP_BASE_URL=\"http://localhost:3000\"" >> $ENV_FILE
echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> $ENV_FILE

clear
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ Setup Complete! ✅          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Your .env.local file has been created!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "  1. Review your .env.local file:"
echo -e "     ${BLUE}cat .env.local${NC}"
echo ""
echo "  2. Install dependencies:"
echo -e "     ${BLUE}npm install${NC}"
echo ""
echo "  3. Setup database:"
echo -e "     ${BLUE}npm run db:push${NC}"
echo -e "     ${BLUE}npm run db:seed${NC}"
echo ""
echo "  4. Start the app:"
echo -e "     ${BLUE}npm run dev${NC}"
echo ""
echo "  5. Visit: ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}🎉 You're ready to go!${NC}"
echo ""

# Offer to run setup now
read -p "Would you like me to run the setup commands now? (y/n): " run_setup

if [[ $run_setup == "y" || $run_setup == "Y" ]]; then
  echo ""
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  
  echo ""
  echo -e "${YELLOW}Setting up database...${NC}"
  npm run db:push
  npm run db:seed
  
  echo ""
  echo -e "${GREEN}✅ Setup complete! Starting dev server...${NC}"
  echo ""
  npm run dev
else
  echo ""
  echo -e "${CYAN}No problem! Run the commands above when you're ready.${NC}"
  echo ""
fi

