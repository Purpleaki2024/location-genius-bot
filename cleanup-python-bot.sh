#!/bin/bash

# Cleanup Script for Redundant Python Bot
# This script helps remove the redundant Python bot implementation

set -e

echo "🧹 Telegram Bot Cleanup Script"
echo "=============================="
echo
echo "This script will help you remove the redundant Python bot implementation"
echo "and keep only the recommended Supabase Edge Function."
echo
echo "⚠️  WARNING: This will remove the following:"
echo "   - telegram_location_bot/ directory (Python bot)"
echo "   - Flask admin interface"
echo "   - SQLite database file (bot_data.db)"
echo
echo "✅ This will keep:"
echo "   - Supabase Edge Function (recommended bot)"
echo "   - React frontend (admin interface)"
echo "   - Supabase database"
echo

read -p "Do you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

echo
echo "🗑️  Removing redundant Python bot..."

# Remove the Python bot directory
if [ -d "telegram_location_bot" ]; then
    rm -rf telegram_location_bot
    echo "✅ Removed telegram_location_bot/ directory"
else
    echo "⚠️  telegram_location_bot/ directory not found"
fi

# Remove SQLite database if it exists
if [ -f "bot_data.db" ]; then
    rm -f bot_data.db
    echo "✅ Removed bot_data.db SQLite database"
else
    echo "⚠️  bot_data.db not found"
fi

# Update .gitignore to remove Python-specific entries if they exist
if [ -f ".gitignore" ]; then
    # Remove Python-specific entries
    sed -i '/# Python/d' .gitignore 2>/dev/null || true
    sed -i '/\.pyc$/d' .gitignore 2>/dev/null || true
    sed -i '/__pycache__/d' .gitignore 2>/dev/null || true
    sed -i '/bot_data\.db/d' .gitignore 2>/dev/null || true
    echo "✅ Updated .gitignore"
fi

echo
echo "🎉 Cleanup completed successfully!"
echo
echo "Your project now uses only the recommended Supabase Edge Function for the Telegram bot."
echo
echo "Next steps:"
echo "1. Deploy the Supabase function: ./deploy-bot.sh"
echo "2. Use the React frontend for admin functionality"
echo "3. Commit these changes to your repository"
echo
echo "For more information, see: BOT_STARTUP_GUIDE.md"
