#!/bin/bash

# Telegram Bot Deployment Script
# This script sets up the recommended Supabase Edge Function for the Telegram bot

set -e

echo "🤖 Telegram Bot Deployment Script"
echo "=================================="
echo

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   More info: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/functions/telegram-webhook/index.ts" ]; then
    echo "❌ telegram-webhook function not found. Make sure you're in the project root directory."
    exit 1
fi

echo "✅ Supabase CLI found"
echo "✅ Telegram webhook function found"
echo

# Check if .env file exists and has required variables
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it with your configuration."
    exit 1
fi

# Source the .env file to get the bot token
source .env

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN not found in .env file"
    exit 1
fi

echo "✅ Environment variables found"
echo

# Deploy the function
echo "🚀 Deploying telegram-webhook function..."
supabase functions deploy telegram-webhook

if [ $? -eq 0 ]; then
    echo "✅ Function deployed successfully!"
else
    echo "❌ Function deployment failed"
    exit 1
fi

echo

# Get the project reference for webhook URL
echo "📋 Getting project information..."
PROJECT_REF=$(supabase status | grep "API URL" | cut -d'/' -f3 | cut -d'.' -f1)

if [ -z "$PROJECT_REF" ]; then
    echo "⚠️  Could not auto-detect project reference. Please check your supabase configuration."
    echo "   You can find your project reference in your Supabase dashboard URL."
    exit 1
fi

WEBHOOK_URL="https://${PROJECT_REF}.supabase.co/functions/v1/telegram-webhook"

echo "📡 Setting webhook URL: $WEBHOOK_URL"

# Set the webhook
WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$WEBHOOK_URL\"}")

# Check if webhook was set successfully
if echo "$WEBHOOK_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook set successfully!"
else
    echo "❌ Failed to set webhook. Response: $WEBHOOK_RESPONSE"
    exit 1
fi

echo

# Verify webhook info
echo "🔍 Verifying webhook setup..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo")

echo "Webhook info: $WEBHOOK_INFO"
echo

echo "🎉 Bot deployment completed successfully!"
echo
echo "📱 Your Telegram bot is now running on Supabase Edge Functions"
echo "🔗 Webhook URL: $WEBHOOK_URL"
echo
echo "Next steps:"
echo "1. Test your bot by sending a message on Telegram"
echo "2. Check function logs: supabase functions logs telegram-webhook"
echo "3. Monitor your bot usage in the Supabase dashboard"
echo
echo "For troubleshooting, see: BOT_STARTUP_GUIDE.md"
