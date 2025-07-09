#!/bin/bash

# Telegram Bot Startup Script
# Simple, consistent way to start the bot for testing and development

set -e

echo "🤖 Starting Telegram Location Bot"
echo "================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_info "Creating template .env file..."
    cat > .env << EOF
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Optional: Database URL for direct access
DATABASE_URL=your_postgres_connection_string_here
EOF
    print_warning "Please fill in your credentials in the .env file and run this script again."
    exit 1
fi

# Load environment variables
print_info "Loading environment variables..."
export $(grep -v '^#' .env | xargs)

# Check required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    print_error "Missing required environment variables!"
    print_info "Please check your .env file contains:"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_ANON_KEY" 
    echo "  - TELEGRAM_BOT_TOKEN"
    exit 1
fi

print_status "Environment variables loaded"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found!"
    print_info "Install it with: npm install -g supabase"
    exit 1
fi

print_status "Supabase CLI found"

# Check if we're in a Supabase project
if [ ! -f supabase/config.toml ]; then
    print_error "Not in a Supabase project directory!"
    print_info "Make sure you're in the root of your project with supabase/config.toml"
    exit 1
fi

print_status "Supabase project detected"

# Deploy the Telegram webhook function
print_info "Deploying Telegram webhook function..."
supabase functions deploy telegram-webhook --no-verify-jwt

if [ $? -eq 0 ]; then
    print_status "Webhook function deployed successfully!"
else
    print_error "Failed to deploy webhook function"
    exit 1
fi

# Set the Telegram webhook
WEBHOOK_URL="$SUPABASE_URL/functions/v1/telegram-webhook"
print_info "Setting Telegram webhook to: $WEBHOOK_URL"

response=$(curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"$WEBHOOK_URL\"}")

if echo "$response" | grep -q '"ok":true'; then
    print_status "Telegram webhook set successfully!"
else
    print_error "Failed to set Telegram webhook"
    print_info "Response: $response"
    exit 1
fi

# Optional: Test the webhook
print_info "Testing webhook connectivity..."
test_response=$(curl -s -o /dev/null -w "%{http_code}" "$WEBHOOK_URL")

if [ "$test_response" -eq 200 ] || [ "$test_response" -eq 405 ]; then
    print_status "Webhook is accessible (HTTP $test_response)"
else
    print_warning "Webhook returned HTTP $test_response (this might be normal for GET requests)"
fi

# Show bot information
print_info "Getting bot information..."
bot_info=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe")
bot_username=$(echo "$bot_info" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)

if [ -n "$bot_username" ]; then
    print_status "Bot is ready! Username: @$bot_username"
    print_info "You can now test your bot by messaging @$bot_username"
else
    print_warning "Could not retrieve bot username, but setup appears complete"
fi

echo
echo "🎉 Bot Setup Complete!"
echo "======================"
echo
echo "📝 Test Commands:"
echo "   /start - Welcome message"
echo "   /number - Search for a single number"
echo "   /numbers - Search for multiple numbers" 
echo "   /help - Show all commands"
echo "   /invite - Get invite link"
echo
echo "📊 Monitor your bot:"
echo "   View logs: supabase functions logs telegram-webhook"
echo "   View database: Open your Supabase dashboard"
echo
echo "🔧 Management:"
echo "   Redeploy: ./start-telegram-bot.sh"
echo "   Stop webhook: curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/deleteWebhook"
echo
