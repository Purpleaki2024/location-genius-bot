
import { supabase } from "@/integrations/supabase/client";
import { TelegramUpdate, CommandHandler, TelegramMessage } from "./telegramBotApi";
import { toast } from "sonner";

// Types for location queries
export type LocationQueryType = 'village' | 'town' | 'city' | 'postcode' | 'all';

// Helper function to search locations based on query and type
export const searchLocations = async (query: string, type?: LocationQueryType) => {
  try {
    // Start with a base query
    let dbQuery = supabase.from('locations')
      .select('*')
      .order('name');
    
    // Apply filters based on type and query
    if (type && type !== 'all') {
      dbQuery = dbQuery.eq('type', type);
    }
    
    // Apply text search on name and address fields
    dbQuery = dbQuery.or(`name.ilike.%${query}%,address.ilike.%${query}%`);
    
    // Only return active locations
    dbQuery = dbQuery.eq('active', true);
    
    // Execute query
    const { data, error } = await dbQuery;
    
    if (error) {
      console.error('Error searching locations:', error);
      throw new Error('Failed to search locations');
    }
    
    return data;
  } catch (error) {
    console.error('Error in location search:', error);
    throw error;
  }
};

// Format a location for the telegram message
const formatLocationForTelegram = (location: any): string => {
  return `📍 *${location.name}*\n` +
    `Address: ${location.address}\n` +
    `Type: ${location.type}\n` +
    `Rating: ${'★'.repeat(Math.round(location.rating))}${'☆'.repeat(5-Math.round(location.rating))}\n` +
    `[View on Map](https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng})`;
};

// Command handlers for location-related commands
export const createLocationCommandHandlers = (): Record<string, CommandHandler> => {
  const handlers: Record<string, CommandHandler> = {
    // Handler for /start command
    start: async (message) => {
      return {
        chat_id: message.chat.id,
        text: `👋 Welcome to TeleLocator Bot!\n\n` +
          `I can help you find locations by name, address, or type.\n\n` +
          `Try these commands:\n` +
          `/help - Show available commands\n` +
          `/city London - Search for locations in London\n` +
          `/village Cotswold - Search for villages\n` +
          `/town Oxford - Search for towns\n` +
          `/postcode SW1A - Search by postcode\n\n` +
          `Or simply send me a location name or address to search!`,
        parse_mode: 'Markdown'
      };
    },
    
    // Handler for /help command
    help: async (message) => {
      return {
        chat_id: message.chat.id,
        text: `🔍 *Available Commands:*\n\n` +
          `/start - Start the bot\n` +
          `/help - Show this help message\n` +
          `/city [name] - Find locations in a city\n` +
          `/town [name] - Find locations in a town\n` +
          `/village [name] - Find locations in a village\n` +
          `/postcode [code] - Find locations by postcode\n` +
          `/nearby - Find locations near you (coming soon)\n\n` +
          `You can also just send a location name or address to search!`,
        parse_mode: 'Markdown'
      };
    },
    
    // Handler for city searches
    city: async (message, args) => {
      return await handleLocationSearch(message, args, 'city');
    },
    
    // Handler for town searches
    town: async (message, args) => {
      return await handleLocationSearch(message, args, 'town');
    },
    
    // Handler for village searches
    village: async (message, args) => {
      return await handleLocationSearch(message, args, 'village');
    },
    
    // Handler for postcode searches
    postcode: async (message, args) => {
      return await handleLocationSearch(message, args, 'postcode');
    },
    
    // Generic location search handler
    location: async (message, args) => {
      return await handleLocationSearch(message, args);
    }
  };
  
  return handlers;
};

// Helper function for handling location searches
const handleLocationSearch = async (
  message: TelegramUpdate['message'], 
  query: string,
  type?: LocationQueryType
): Promise<TelegramMessage> => {
  if (!message) {
    return {
      chat_id: 0,
      text: 'Error: Invalid message'
    };
  }
  
  if (!query || query.trim() === '') {
    return {
      chat_id: message.chat.id,
      text: `Please provide a search term. Example: ${type ? `/${type} London` : 'London'}`,
      parse_mode: 'Markdown'
    };
  }
  
  try {
    // Log the activity
    await supabase.from('user_activities').insert({
      activity_type: 'location_search',
      telegram_user_id: message.from.id.toString(),
      telegram_username: message.from.username,
      message: `${type ? `/${type}` : ''} ${query}`
    });
    
    // Search for locations
    const locations = await searchLocations(query, type);
    
    if (!locations || locations.length === 0) {
      return {
        chat_id: message.chat.id,
        text: `No ${type ? type : 'locations'} found matching "${query}". Try a different search term.`,
        parse_mode: 'Markdown'
      };
    }
    
    // Format response for telegram
    let responseText = `Found ${locations.length} location${locations.length > 1 ? 's' : ''} matching "${query}":\n\n`;
    
    // Limit to 5 results to avoid message size limits
    const limitedResults = locations.slice(0, 5);
    
    responseText += limitedResults.map(formatLocationForTelegram).join('\n\n');
    
    if (locations.length > 5) {
      responseText += `\n\n...and ${locations.length - 5} more results.`;
    }
    
    // Update the location visit count
    for (const location of limitedResults) {
      await supabase
        .from('locations')
        .update({ visits: location.visits + 1 })
        .eq('id', location.id);
    }
    
    return {
      chat_id: message.chat.id,
      text: responseText,
      parse_mode: 'Markdown'
    };
  } catch (error) {
    console.error('Error in handleLocationSearch:', error);
    return {
      chat_id: message.chat.id,
      text: 'Sorry, there was an error processing your search. Please try again later.',
      parse_mode: 'Markdown'
    };
  }
};
