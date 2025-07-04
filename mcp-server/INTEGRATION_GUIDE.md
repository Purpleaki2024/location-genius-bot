# Location Genius MCP Integration Guide

This guide explains how to integrate the Location Genius MCP server with various AI assistants and development tools.

## Quick Start

1. **Set up environment variables:**
   ```bash
   cd mcp-server
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Install and build:**
   ```bash
   npm install
   npm run build
   ```

3. **Start the server:**
   ```bash
   ./start-mcp-server.sh
   ```

## Integration with GitHub Copilot

### Method 1: VS Code Extension
1. Install the MCP extension for VS Code (search for "MCP" in extensions)
2. Add the server configuration to your VS Code settings:

```json
{
  "mcp.servers": {
    "location-genius": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_SERVICE_KEY": "your_supabase_service_key",
        "TELEGRAM_BOT_TOKEN": "your_telegram_bot_token"
      },
      "cwd": "${workspaceFolder}"
    }
  }
}
```

### Method 2: Direct Integration
Use the MCP server directly in your development workflow:

```bash
# Terminal 1: Start the MCP server
cd mcp-server
npm start

# Terminal 2: Use MCP client tools
# (Connect your preferred MCP client)
```

## Integration with Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "location-genius": {
      "command": "node",
      "args": ["/path/to/location-genius-bot/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_SERVICE_KEY": "your_supabase_service_key",
        "TELEGRAM_BOT_TOKEN": "your_telegram_bot_token"
      }
    }
  }
}
```

## Available MCP Tools

### 🗺️ Location Management
- **get_locations**: Retrieve all locations or filter by category/tags
- **add_location**: Add new locations with coordinates and metadata
- **update_location**: Modify existing location details
- **delete_location**: Remove locations from the database
- **search_locations**: Search by text or geographic proximity

### 👥 User Management
- **get_users**: List users with optional role filtering
- **add_user**: Register new users from Telegram
- **update_user_role**: Promote/demote user permissions

### 📊 Analytics
- **get_location_stats**: Get usage statistics and metrics

### 🤖 Telegram Integration
- **send_telegram_message**: Send messages through the bot
- **get_telegram_bot_info**: Get bot configuration details

## Example Usage Scenarios

### 1. Adding a New Location
```json
{
  "tool": "add_location",
  "arguments": {
    "name": "Central Park",
    "description": "Large public park in Manhattan",
    "latitude": 40.7829,
    "longitude": -73.9654,
    "address": "New York, NY 10024",
    "category": "park",
    "tags": ["outdoor", "recreation", "nyc"]
  }
}
```

### 2. Searching Nearby Locations
```json
{
  "tool": "search_locations",
  "arguments": {
    "query": "coffee",
    "center_lat": 40.7589,
    "center_lng": -73.9851,
    "radius": 2,
    "limit": 10
  }
}
```

### 3. Getting User Statistics
```json
{
  "tool": "get_location_stats",
  "arguments": {
    "timeframe": "month"
  }
}
```

### 4. Sending Notifications
```json
{
  "tool": "send_telegram_message",
  "arguments": {
    "chat_id": "123456789",
    "text": "New location added nearby!",
    "parse_mode": "HTML"
  }
}
```

## Security Considerations

- **Service Key**: Use Supabase service role key for admin operations
- **Environment Variables**: Store sensitive data in environment variables
- **Rate Limiting**: Implement rate limiting for production use
- **Authentication**: Add proper authentication for public deployments

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Run `npm install` in the mcp-server directory
   - Ensure TypeScript is compiled with `npm run build`

2. **Database connection errors**
   - Check your SUPABASE_URL and SUPABASE_SERVICE_KEY
   - Verify your Supabase project is active

3. **Telegram API errors**
   - Verify your TELEGRAM_BOT_TOKEN is correct
   - Check if the bot has necessary permissions

### Debug Mode

Run with debug logging:
```bash
NODE_ENV=development npm run dev
```

### Testing Tools

Test individual tools:
```bash
# Example: Test getting locations
echo '{"method": "tools/call", "params": {"name": "get_locations", "arguments": {"limit": 5}}}' | node dist/index.js
```

## Development

### Adding New Tools

1. Add tool definition to `ListToolsRequestSchema` handler
2. Implement tool logic in the `CallToolRequestSchema` handler
3. Add appropriate validation schemas
4. Update this documentation

### Testing Changes

```bash
# Development mode with auto-reload
npm run dev

# Build and test
npm run build
npm start
```

## Support

For issues and feature requests:
1. Check the logs for error messages
2. Verify your environment configuration
3. Test with minimal examples
4. Create detailed issue reports

## Next Steps

1. **Enhance Security**: Add authentication middleware
2. **Add Caching**: Implement Redis caching for frequently accessed data
3. **Monitoring**: Add logging and monitoring capabilities
4. **WebSocket Support**: Add real-time features
5. **Geographic Queries**: Implement advanced PostGIS queries
