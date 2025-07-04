#!/bin/bash

# Test script for Location Genius MCP Server

echo "🧪 Testing Location Genius MCP Server..."
echo "=========================================="

# Check if the server is built
if [ ! -f "dist/index.js" ]; then
    echo "❌ Server not built. Running build..."
    npm run build
fi

# Test 1: List available tools
echo "📋 Test 1: Listing available tools..."
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | timeout 5s node dist/index.js 2>/dev/null | head -20

echo ""
echo "✅ Test completed!"
echo ""
echo "🚀 To start the MCP server for use with clients:"
echo "   ./start-mcp-server.sh"
echo ""
echo "🔧 To configure with GitHub Copilot:"
echo "   1. Install MCP extension in VS Code"
echo "   2. Add server configuration to VS Code settings"
echo "   3. Set up your environment variables in .env"
echo ""
echo "📖 See INTEGRATION_GUIDE.md for detailed setup instructions."
