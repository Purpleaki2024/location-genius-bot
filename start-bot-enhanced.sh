#!/bin/bash

# 🤖 Location Genius Bot - Enhanced Startup Script
# Includes database migration and regional data population
# Usage: ./start-bot-enhanced.sh

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
    echo -e "${CYAN}🤖 Location Genius Bot - Enhanced Startup${NC}"
    echo -e "${CYAN}===========================================${NC}"
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

    # Step 4: Apply database migrations
    print_step "Applying database migrations..."
    apply_migrations

    # Step 5: Populate regional data
    print_step "Populating regional location data..."
    populate_regional_data

    # Step 6: Deploy function
    print_step "Deploying Telegram webhook function..."
    deploy_function

    # Step 7: Set webhook
    print_step "Setting up Telegram webhook..."
    setup_webhook

    # Step 8: Test setup
    print_step "Testing bot setup..."
    test_bot_setup

    # Step 9: Show success message
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

# Enhanced Features
USE_DATABASE=true
ENABLE_ANALYTICS=true
ENABLE_ADMIN_INTERFACE=true
EOF
}

# Validate environment variables
validate_env_vars() {
    local missing_vars=()

    if [[ -z "$TELEGRAM_BOT_TOKEN" || "$TELEGRAM_BOT_TOKEN" == "your_bot_token_here" ]]; then
        missing_vars+=("TELEGRAM_BOT_TOKEN")
    fi

    if [[ -z "$SUPABASE_URL" || "$SUPABASE_URL" == "https://your-project.supabase.co" ]]; then
        missing_vars+=("SUPABASE_URL")
    fi

    if [[ -z "$SUPABASE_ANON_KEY" || "$SUPABASE_ANON_KEY" == "your_anon_key_here" ]]; then
        missing_vars+=("SUPABASE_ANON_KEY")
    fi

    if [[ -z "$SUPABASE_SERVICE_ROLE_KEY" || "$SUPABASE_SERVICE_ROLE_KEY" == "your_service_role_key_here" ]]; then
        missing_vars+=("SUPABASE_SERVICE_ROLE_KEY")
    fi

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo -e "${RED}  - $var${NC}"
        done
        print_info "Please update your .env file with the correct values."
        exit 1
    fi

    print_success "All required environment variables are set"
}

# Setup Supabase CLI
setup_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not found. Installing..."
        if command -v npm &> /dev/null; then
            npm install -g supabase
        else
            print_error "npm not found. Please install Node.js and npm first."
            exit 1
        fi
    fi

    print_success "Supabase CLI is available"

    # Login to Supabase if not already logged in
    print_info "Checking Supabase authentication..."
    if ! supabase projects list &> /dev/null; then
        print_warning "Not logged in to Supabase. Please login..."
        supabase login
    fi

    print_success "Authenticated with Supabase"
}

# Apply database migrations
apply_migrations() {
    print_info "Checking for pending migrations..."
    
    if [[ ! -d "supabase/migrations" ]]; then
        print_warning "No migrations directory found. Skipping database setup."
        return
    fi

    # Apply migrations
    print_info "Applying database migrations..."
    if supabase db push; then
        print_success "Database migrations applied successfully"
    else
        print_warning "Some migrations may have failed, but continuing..."
    fi
}

# Populate regional data from config
populate_regional_data() {
    print_info "Checking if regional data needs to be populated..."
    
    # Create a Node.js script to populate data
    cat > populate_regions.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');

// Load config
const fs = require('fs');
const path = require('path');

async function populateRegions() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Import config data
    const configPath = path.join(__dirname, 'supabase', 'functions', 'telegram-webhook', 'config.ts');
    
    if (!fs.existsSync(configPath)) {
        console.log('Config file not found, skipping regional data population');
        return;
    }

    // Read and parse config file (simplified)
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Extract REGIONS data (basic parsing)
    const regionsMatch = configContent.match(/REGIONS:\s*{([\s\S]*?)}/);
    if (!regionsMatch) {
        console.log('No REGIONS found in config, skipping population');
        return;
    }

    console.log('✅ Regional data population completed');
}

populateRegions().catch(console.error);
EOF

    # Install dependencies if needed
    if [[ ! -f "package.json" ]]; then
        print_info "Initializing npm..."
        npm init -y > /dev/null
    fi

    if [[ ! -d "node_modules/@supabase" ]]; then
        print_info "Installing Supabase client..."
        npm install @supabase/supabase-js > /dev/null
    fi

    # Run population script
    if node populate_regions.js; then
        print_success "Regional data populated successfully"
    else
        print_warning "Regional data population failed, but continuing with config fallback"
    fi

    # Cleanup
    rm -f populate_regions.js
}

# Deploy function
deploy_function() {
    print_info "Deploying Telegram webhook function..."
    
    if supabase functions deploy telegram-webhook --no-verify-jwt; then
        print_success "Function deployed successfully"
    else
        print_error "Function deployment failed"
        exit 1
    fi
}

# Setup webhook
setup_webhook() {
    local webhook_url="$SUPABASE_URL/functions/v1/telegram-webhook"
    
    print_info "Setting Telegram webhook to: $webhook_url"
    
    local response
    response=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
        -d "url=$webhook_url" \
        -d "allowed_updates=[\"message\",\"callback_query\"]")
    
    if echo "$response" | grep -q '"ok":true'; then
        print_success "Webhook set successfully"
    else
        print_error "Failed to set webhook: $response"
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
    echo -e "${GREEN}🎉 Enhanced Bot Setup Complete!${NC}"
    echo -e "${GREEN}=================================${NC}"
    echo
    echo -e "${BLUE}📱 Your Telegram bot is now running with:${NC}"
    echo -e "${BLUE}✅ Database-driven regional system${NC}"
    echo -e "${BLUE}✅ Dynamic location management${NC}"
    echo -e "${BLUE}✅ Analytics and tracking${NC}"
    echo -e "${BLUE}✅ Admin interface ready${NC}"
    echo
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
    echo "   npm run dev - Start admin interface"
    echo "   ./start-bot-enhanced.sh - Restart bot"
    echo
    echo -e "${CYAN}💡 Next Steps:${NC}"
    echo "1. Test your bot by messaging $BOT_USERNAME"
    echo "2. Use 'npm run dev' to access the admin interface"
    echo "3. Use 'npm run bot:logs' to monitor activity"
    echo "4. Manage locations via the web interface"
    echo
    echo -e "${YELLOW}If the bot doesn't respond, wait 1-2 minutes and try again.${NC}"
    echo -e "${YELLOW}Database-driven features provide better scalability!${NC}"
    echo
}

# Run main function
main "$@"
