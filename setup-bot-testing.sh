#!/bin/bash

# Bot Testing Setup Script
# This script helps set up test data and deploy the improved bot

set -e

echo "🤖 Bot Testing Setup"
echo "==================="
echo

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"

# Deploy the updated function
echo "🚀 Deploying updated telegram-webhook function..."
supabase functions deploy telegram-webhook

if [ $? -eq 0 ]; then
    echo "✅ Function deployed successfully!"
else
    echo "❌ Function deployment failed"
    exit 1
fi

echo

# Check if sample data should be added
read -p "Do you want to add sample location data for testing? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📊 Adding sample location data..."
    
    # Check if sample-locations.sql exists
    if [ ! -f "sample-locations.sql" ]; then
        echo "❌ sample-locations.sql not found"
        exit 1
    fi
    
    # Add the sample data via psql (if available) or provide instructions
    if command -v psql &> /dev/null && [ -n "$DATABASE_URL" ]; then
        echo "Adding data via psql..."
        psql "$DATABASE_URL" -f sample-locations.sql
        echo "✅ Sample data added successfully!"
    else
        echo "📋 Please run the following SQL in your Supabase SQL editor:"
        echo "   Go to: https://supabase.com/dashboard/project/[your-project]/sql"
        echo "   Copy and paste the contents of sample-locations.sql"
        echo
        cat sample-locations.sql
    fi
else
    echo "⏭️  Skipping sample data"
fi

echo
echo "🎉 Setup completed!"
echo
echo "🧪 Test your bot with these commands:"
echo "   /start - Welcome message"
echo "   /city London - Search for London locations"
echo "   /town Oxford - Search for Oxford locations"
echo "   /village Cotswold - Search for Cotswold villages"
echo "   /postcode SW1A - Search by postcode"
echo "   London Eye - Direct location search"
echo
echo "📊 Monitor bot activity:"
echo "   npm run bot:logs"
echo
echo "🔧 Bot management:"
echo "   npm run bot:deploy - Redeploy bot"
echo "   npm run bot:logs - View logs"
