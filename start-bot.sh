#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Ensure environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$TELEGRAM_BOT_TOKEN" ]; then
  echo "Error: Required environment variables are not set."
  echo "Please set SUPABASE_URL, SUPABASE_ANON_KEY, and TELEGRAM_BOT_TOKEN in the .env file."
  exit 1
fi

# Deploy Supabase Edge Function
supabase functions deploy telegram-webhook
if [ $? -ne 0 ]; then
  echo "Error: Failed to deploy Supabase Edge Function."
  exit 1
fi

# Set Telegram webhook
WEBHOOK_URL="$SUPABASE_URL/functions/v1/telegram-webhook"
response=$(curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" -d "url=$WEBHOOK_URL")
if [[ $response == *"true"* ]]; then
  echo "Telegram webhook set successfully."
else
  echo "Error: Failed to set Telegram webhook. Response: $response"
  exit 1
fi

# Start Python bot (optional, for legacy support)
read -p "Do you want to start the Python bot for legacy support? (y/n): " start_python_bot
if [[ "$start_python_bot" == "y" ]]; then
  python3 telegram_location_bot/app.py
fi

echo "Bot setup complete."
