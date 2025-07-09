#!/bin/bash

# 🤖 Location Genius Bot - Easy Startup Script
# One simple command to start your Telegram bot
# Usage: ./start-bot-easy.sh

set -e

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Print functions
print_header() {
    echo -e "${CYAN}🤖 Location Genius Bot - Easy Startup${NC}"
    echo -e "${CYAN}=====================================${NC}"
    echo
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_step() {
    echo -e "${CYAN}🔄 $1${NC}"
}

# Main function
main() {
    print_header

    # Step 1: Check environment file
    print_step "Checking environment configuration..."
    if [[ ! -f .env ]]; then
        print_error ".env file not found!"
        print_info "Creating template .env file..."
        create_env_template
        print_warning "Please fill in your credentials in .env and run this script again."
        exit 1
    fi

    # Load environment variables
    source .env

    # Step 2: Validate required variables
    print_step "Validating environment variables..."
    validate_env_vars

    # Step 3: Check Supabase CLI
    print_step "Checking Supabase CLI..."
    setup_supabase_cli

    # Step 4: Deploy function
    print_step "Deploying Telegram webhook function..."
    deploy_function

    # Step 5: Set webhook
    print_step "Setting up Telegram webhook..."
    setup_webhook

    # Step 6: Test setup
    print_step "Testing bot setup..."
    test_bot_setup

    # Step 7: Show success message
    show_success_message
}

# Create .env template
create_env_template() {
    cat > .env << 'EOF'
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Database URL for direct access
DATABASE_URL=your_postgres_connection_string_here
EOF
}

# Validate environment variables
validate_env_vars() {
    local missing=()
    
    [[ -z "$TELEGRAM_BOT_TOKEN" || "$TELEGRAM_BOT_TOKEN" == "your_bot_token_here" ]] && missing+=("TELEGRAM_BOT_TOKEN")
    [[ -z "$SUPABASE_URL" || "$SUPABASE_URL" == "https://your-project.supabase.co" ]] && missing+=("SUPABASE_URL")
    [[ -z "$SUPABASE_SERVICE_ROLE_KEY" || "$SUPABASE_SERVICE_ROLE_KEY" == "your_service_role_key_here" ]] && missing+=("SUPABASE_SERVICE_ROLE_KEY")
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing[@]}"; do
            echo "  - $var"
        done
        print_info "Please update your .env file with the correct values."
        exit 1
    fi
    
    print_success "Environment variables validated"
}

# Setup Supabase CLI
setup_supabase_cli() {
    if command -v supabase &> /dev/null; then
        SUPABASE_CMD="supabase"
        print_success "Supabase CLI found (global installation)"
    elif command -v npx &> /dev/null && npx supabase --version &> /dev/null; then
        SUPABASE_CMD="npx supabase"
        print_success "Supabase CLI found (via npx)"
    else
        print_error "Supabase CLI not found!"
        print_info "Please install it with: npm install -g supabase"
        print_info "Or make sure Node.js/npm is installed for npx"
        exit 1
    fi
}

# Deploy function
deploy_function() {
    if [[ ! -f "supabase/functions/telegram-webhook/index.ts" ]]; then
        print_error "Telegram webhook function not found!"
        print_info "Expected: supabase/functions/telegram-webhook/index.ts"
        exit 1
    fi

    print_info "Deploying function with Supabase CLI..."
    if $SUPABASE_CMD functions deploy telegram-webhook; then
        print_success "Function deployed successfully!"
    else
        print_error "Function deployment failed!"
        exit 1
    fi
}

# Setup webhook
setup_webhook() {
    local webhook_url="$SUPABASE_URL/functions/v1/telegram-webhook"
    print_info "Setting webhook URL: $webhook_url"

    # First, delete any existing webhook to clear pending updates
    print_info "Clearing existing webhook..."
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/deleteWebhook" > /dev/null

    # Set new webhook
    local response
    response=$(curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
        -H "Content-Type: application/json" \
        -d "{\"url\":\"$webhook_url\"}")

    if echo "$response" | grep -q '"ok":true'; then
        print_success "Webhook set successfully!"
    else
        print_error "Failed to set webhook!"
        print_info "Response: $response"
        exit 1
    fi
}

# Test bot setup
test_bot_setup() {
    print_info "Testing webhook accessibility..."
    local webhook_url="$SUPABASE_URL/functions/v1/telegram-webhook"
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$webhook_url")

    if [[ "$status_code" -eq 200 ]] || [[ "$status_code" -eq 405 ]]; then
        print_success "Webhook is accessible (HTTP $status_code)"
    else
        print_warning "Webhook returned HTTP $status_code (this might be normal)"
    fi

    print_info "Getting bot information..."
    local bot_info
    bot_info=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe")
    local bot_username
    bot_username=$(echo "$bot_info" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)

    if [[ -n "$bot_username" ]]; then
        print_success "Bot is ready! Username: @$bot_username"
        BOT_USERNAME="@$bot_username"
    else
        print_warning "Could not get bot username, but setup seems complete"
        BOT_USERNAME="your bot"
    fi
}

# Show success message
show_success_message() {
    echo
    echo -e "${GREEN}🎉 Bot Setup Complete!${NC}"
    echo -e "${GREEN}======================${NC}"
    echo
    echo -e "${BLUE}📱 Your Telegram bot is now running!${NC}"
    echo -e "${BLUE}Webhook URL: $SUPABASE_URL/functions/v1/telegram-webhook${NC}"
    echo
    echo -e "${CYAN}📝 Available Commands:${NC}"
    echo "   /start - Welcome message"
    echo "   /number - Find a single medic"
    echo "   /numbers - Find multiple medics"
    echo "   /help - Show help"
    echo "   /invite - Get invite link"
    echo
    echo -e "${CYAN}🔧 Management Commands:${NC}"
    echo "   npm run bot:logs - View bot logs"
    echo "   npm run bot:status - Check webhook status"
    echo "   npm run bot:stop - Stop webhook"
    echo "   ./start-bot-easy.sh - Restart bot"
    echo
    echo -e "${CYAN}💡 Next Steps:${NC}"
    echo "1. Test your bot by messaging $BOT_USERNAME"
    echo "2. Use 'npm run bot:logs' to monitor activity"
    echo "3. Check your Supabase dashboard for function logs"
    echo
    echo -e "${YELLOW}If the bot doesn't respond, wait 1-2 minutes and try again.${NC}"
    echo -e "${YELLOW}Supabase functions may take time to become fully active.${NC}"
    echo
}

# Run main function
main "$@"
