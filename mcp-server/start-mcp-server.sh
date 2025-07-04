#!/bin/bash

# Location Genius MCP Server Startup Script

set -e

echo "🚀 Starting Location Genius MCP Server..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the mcp-server directory."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create one from .env.example"
    echo "📋 Required environment variables:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_KEY"
    echo "   - TELEGRAM_BOT_TOKEN"
    echo ""
    echo "🔧 Creating .env file from example..."
    cp .env.example .env
    echo "✅ Please edit .env file with your actual values before running the server."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed. Please check the build output above."
    exit 1
fi

echo "✅ Build successful!"

# Start the server
echo "🏁 Starting MCP server..."
echo "📝 The server will run on stdio transport."
echo "🔌 Connect your MCP client to use the Location Genius tools."
echo ""

# Run the server
npm start
