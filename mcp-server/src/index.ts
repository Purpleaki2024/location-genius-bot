#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Validation schemas
const LocationSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const UserSchema = z.object({
  telegram_id: z.string(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

const TelegramMessageSchema = z.object({
  chat_id: z.string(),
  text: z.string(),
  parse_mode: z.enum(['HTML', 'Markdown', 'MarkdownV2']).optional(),
});

class LocationGeniusMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'location-genius-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_locations',
            description: 'Get all locations or filter by category/tags',
            inputSchema: {
              type: 'object',
              properties: {
                category: { type: 'string', description: 'Filter by category' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
                limit: { type: 'number', description: 'Maximum number of results', default: 100 },
              },
            },
          },
          {
            name: 'add_location',
            description: 'Add a new location to the database',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Location name' },
                description: { type: 'string', description: 'Location description' },
                latitude: { type: 'number', description: 'Latitude coordinate' },
                longitude: { type: 'number', description: 'Longitude coordinate' },
                address: { type: 'string', description: 'Street address' },
                category: { type: 'string', description: 'Location category' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Location tags' },
              },
              required: ['name', 'latitude', 'longitude'],
            },
          },
          {
            name: 'update_location',
            description: 'Update an existing location',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Location ID' },
                name: { type: 'string', description: 'Location name' },
                description: { type: 'string', description: 'Location description' },
                latitude: { type: 'number', description: 'Latitude coordinate' },
                longitude: { type: 'number', description: 'Longitude coordinate' },
                address: { type: 'string', description: 'Street address' },
                category: { type: 'string', description: 'Location category' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Location tags' },
              },
              required: ['id'],
            },
          },
          {
            name: 'delete_location',
            description: 'Delete a location by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Location ID to delete' },
              },
              required: ['id'],
            },
          },
          {
            name: 'get_users',
            description: 'Get all users or filter by role',
            inputSchema: {
              type: 'object',
              properties: {
                role: { type: 'string', enum: ['user', 'admin'], description: 'Filter by role' },
                limit: { type: 'number', description: 'Maximum number of results', default: 100 },
              },
            },
          },
          {
            name: 'add_user',
            description: 'Add a new user to the system',
            inputSchema: {
              type: 'object',
              properties: {
                telegram_id: { type: 'string', description: 'Telegram user ID' },
                username: { type: 'string', description: 'Telegram username' },
                first_name: { type: 'string', description: 'First name' },
                last_name: { type: 'string', description: 'Last name' },
                role: { type: 'string', enum: ['user', 'admin'], description: 'User role' },
              },
              required: ['telegram_id'],
            },
          },
          {
            name: 'update_user_role',
            description: 'Update user role (admin only)',
            inputSchema: {
              type: 'object',
              properties: {
                telegram_id: { type: 'string', description: 'Telegram user ID' },
                role: { type: 'string', enum: ['user', 'admin'], description: 'New role' },
              },
              required: ['telegram_id', 'role'],
            },
          },
          {
            name: 'get_location_stats',
            description: 'Get statistics about locations and usage',
            inputSchema: {
              type: 'object',
              properties: {
                timeframe: { type: 'string', enum: ['day', 'week', 'month', 'year'], default: 'month' },
              },
            },
          },
          {
            name: 'search_locations',
            description: 'Search locations by name, description, or address',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search query' },
                radius: { type: 'number', description: 'Search radius in kilometers' },
                center_lat: { type: 'number', description: 'Center latitude for radius search' },
                center_lng: { type: 'number', description: 'Center longitude for radius search' },
                limit: { type: 'number', description: 'Maximum number of results', default: 50 },
              },
              required: ['query'],
            },
          },
          {
            name: 'send_telegram_message',
            description: 'Send a message via Telegram bot',
            inputSchema: {
              type: 'object',
              properties: {
                chat_id: { type: 'string', description: 'Telegram chat ID' },
                text: { type: 'string', description: 'Message text' },
                parse_mode: { type: 'string', enum: ['HTML', 'Markdown', 'MarkdownV2'], description: 'Message formatting' },
              },
              required: ['chat_id', 'text'],
            },
          },
          {
            name: 'get_telegram_bot_info',
            description: 'Get information about the Telegram bot',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_locations':
            return await this.getLocations(args);
          case 'add_location':
            return await this.addLocation(args);
          case 'update_location':
            return await this.updateLocation(args);
          case 'delete_location':
            return await this.deleteLocation(args);
          case 'get_users':
            return await this.getUsers(args);
          case 'add_user':
            return await this.addUser(args);
          case 'update_user_role':
            return await this.updateUserRole(args);
          case 'get_location_stats':
            return await this.getLocationStats(args);
          case 'search_locations':
            return await this.searchLocations(args);
          case 'send_telegram_message':
            return await this.sendTelegramMessage(args);
          case 'get_telegram_bot_info':
            return await this.getTelegramBotInfo(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async getLocations(args: any) {
    const { category, tags, limit = 100 } = args;
    let query = supabase.from('locations').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch locations: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ locations: data, count: data?.length || 0 }, null, 2),
        },
      ],
    };
  }

  private async addLocation(args: any) {
    const validatedData = LocationSchema.parse(args);
    
    const { data, error } = await supabase
      .from('locations')
      .insert([validatedData])
      .select();

    if (error) {
      throw new Error(`Failed to add location: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, location: data[0] }, null, 2),
        },
      ],
    };
  }

  private async updateLocation(args: any) {
    const { id, ...updates } = args;
    
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(`Failed to update location: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, location: data[0] }, null, 2),
        },
      ],
    };
  }

  private async deleteLocation(args: any) {
    const { id } = args;
    
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete location: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, message: 'Location deleted successfully' }, null, 2),
        },
      ],
    };
  }

  private async getUsers(args: any) {
    const { role, limit = 100 } = args;
    let query = supabase.from('users').select('*');

    if (role) {
      query = query.eq('role', role);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ users: data, count: data?.length || 0 }, null, 2),
        },
      ],
    };
  }

  private async addUser(args: any) {
    const validatedData = UserSchema.parse(args);
    
    const { data, error } = await supabase
      .from('users')
      .insert([validatedData])
      .select();

    if (error) {
      throw new Error(`Failed to add user: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, user: data[0] }, null, 2),
        },
      ],
    };
  }

  private async updateUserRole(args: any) {
    const { telegram_id, role } = args;
    
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('telegram_id', telegram_id)
      .select();

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, user: data[0] }, null, 2),
        },
      ],
    };
  }

  private async getLocationStats(args: any) {
    const { timeframe = 'month' } = args;
    
    // Call the get_stats function from Supabase
    const { data, error } = await supabase.rpc('get_stats', { timeframe });

    if (error) {
      throw new Error(`Failed to fetch location stats: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ stats: data }, null, 2),
        },
      ],
    };
  }

  private async searchLocations(args: any) {
    const { query, radius, center_lat, center_lng, limit = 50 } = args;
    
    let supabaseQuery = supabase.from('locations').select('*');

    // Text search
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`);
    }

    // Radius search (if center coordinates are provided)
    if (radius && center_lat && center_lng) {
      // This would require a PostGIS extension for proper geospatial queries
      // For now, we'll use a simple bounding box approximation
      const latDelta = radius / 111.32; // rough conversion km to degrees
      const lngDelta = radius / (111.32 * Math.cos(center_lat * Math.PI / 180));
      
      supabaseQuery = supabaseQuery
        .gte('latitude', center_lat - latDelta)
        .lte('latitude', center_lat + latDelta)
        .gte('longitude', center_lng - lngDelta)
        .lte('longitude', center_lng + lngDelta);
    }

    supabaseQuery = supabaseQuery.limit(limit);

    const { data, error } = await supabaseQuery;

    if (error) {
      throw new Error(`Failed to search locations: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ locations: data, count: data?.length || 0 }, null, 2),
        },
      ],
    };
  }

  private async sendTelegramMessage(args: any) {
    const { chat_id, text, parse_mode } = TelegramMessageSchema.parse(args);
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const payload = {
      chat_id,
      text,
      parse_mode,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to send Telegram message: ${result.description || 'Unknown error'}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, message_id: result.result.message_id }, null, 2),
        },
      ],
    };
  }

  private async getTelegramBotInfo(args: any) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    const url = `https://api.telegram.org/bot${botToken}/getMe`;
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to get bot info: ${result.description || 'Unknown error'}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ bot_info: result.result }, null, 2),
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Location Genius MCP server running on stdio');
  }
}

const server = new LocationGeniusMCPServer();
server.run().catch(console.error);
