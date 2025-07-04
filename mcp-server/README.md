# MCP Client Configuration

This document provides configuration examples for connecting various MCP clients to the Location Genius MCP server.

## Claude Desktop Integration

Add this configuration to your Claude Desktop config file:

### Windows
File location: `%APPDATA%\Claude\claude_desktop_config.json`

### macOS
File location: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Linux
File location: `~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "location-genius": {
      "command": "node",
      "args": ["/workspaces/location-genius-bot/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_SERVICE_KEY": "your_supabase_service_key",
        "TELEGRAM_BOT_TOKEN": "your_telegram_bot_token",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## GitHub Copilot Integration

For GitHub Copilot integration, you can use the MCP server through VS Code extensions or CLI tools.

### VS Code MCP Extension

1. Install an MCP extension for VS Code
2. Configure the server path in VS Code settings:

```json
{
  "mcp.servers": {
    "location-genius": {
      "command": "node",
      "args": ["/workspaces/location-genius-bot/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_SERVICE_KEY": "your_supabase_service_key",
        "TELEGRAM_BOT_TOKEN": "your_telegram_bot_token"
      }
    }
  }
}
```

## CLI Usage

You can also run the MCP server directly for testing:

```bash
cd /workspaces/location-genius-bot/mcp-server
npm run build
node dist/index.js
```

## Environment Variables

Make sure to set these environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key (for admin operations)
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
- `NODE_ENV`: Environment (development/production)

## Available Tools

The MCP server provides the following tools:

### Location Management
- `get_locations`: Retrieve locations with optional filtering
- `add_location`: Add new locations
- `update_location`: Update existing locations
- `delete_location`: Remove locations
- `search_locations`: Search locations by text or coordinates

### User Management
- `get_users`: Retrieve user list
- `add_user`: Add new users
- `update_user_role`: Change user roles

### Statistics
- `get_location_stats`: Get usage statistics

### Telegram Integration
- `send_telegram_message`: Send messages through the bot
- `get_telegram_bot_info`: Get bot information

## Security Notes

- Use service role keys only for server-side operations
- Keep your Telegram bot token secure
- Consider using environment-specific configurations
- Implement proper authentication for production use
