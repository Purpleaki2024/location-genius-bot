#!/bin/bash

# Bot Testing Script
# Simple script to test basic bot functionality

set -e

echo "🧪 Testing Telegram Bot Functionality"
echo "====================================="

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ .env file not found. Please create it first."
    exit 1
fi

# Check required variables
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN not set in .env file"
    exit 1
fi

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL not set in .env file"
    exit 1
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Testing bot connectivity...${NC}"

# Test 1: Get bot info
echo "1. Testing bot token..."
bot_response=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe")

if echo "$bot_response" | grep -q '"ok":true'; then
    bot_username=$(echo "$bot_response" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Bot token valid. Username: @$bot_username${NC}"
else
    echo -e "${RED}❌ Bot token invalid or bot not accessible${NC}"
    echo "Response: $bot_response"
    exit 1
fi

# Test 2: Test webhook endpoint
echo "2. Testing webhook endpoint..."
webhook_url="$SUPABASE_URL/functions/v1/telegram-webhook"
webhook_response=$(curl -s -o /dev/null -w "%{http_code}" "$webhook_url")

if [ "$webhook_response" -eq 200 ] || [ "$webhook_response" -eq 405 ]; then
    echo -e "${GREEN}✅ Webhook endpoint accessible (HTTP $webhook_response)${NC}"
else
    echo -e "${RED}❌ Webhook endpoint not accessible (HTTP $webhook_response)${NC}"
fi

# Test 3: Check webhook is set
echo "3. Checking webhook configuration..."
webhook_info=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo")

if echo "$webhook_info" | grep -q "$SUPABASE_URL"; then
    echo -e "${GREEN}✅ Webhook is properly configured${NC}"
else
    echo -e "${YELLOW}⚠️  Webhook may not be set to correct URL${NC}"
    echo "Current webhook info: $webhook_info"
fi

# Test 4: Database connectivity (if possible)
echo "4. Testing database connection..."
if command -v psql &> /dev/null && [ -n "$DATABASE_URL" ]; then
    db_test=$(psql "$DATABASE_URL" -c "SELECT 1;" 2>&1)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not connect to database directly${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Direct database testing skipped (psql not available or DATABASE_URL not set)${NC}"
fi

echo
echo "🎯 Bot Testing Summary"
echo "====================="
echo -e "${GREEN}Your bot @$bot_username is ready for testing!${NC}"
echo
echo "📱 Test Commands:"
echo "   Send /start to your bot"
echo "   Send /number and then a location"
echo "   Send /numbers and then a location"
echo "   Send /help for all commands"
echo
echo "📊 Monitor Activity:"
echo "   Logs: supabase functions logs telegram-webhook"
echo "   Database: Check your Supabase dashboard"
echo
echo "🚀 Next Steps:"
echo "   1. Message your bot @$bot_username"
echo "   2. Try the /start command"
echo "   3. Test location searches with /number"
echo
