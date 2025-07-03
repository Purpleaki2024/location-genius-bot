
/// <reference path="./deno.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuration constants
const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BATCH_SIZE: 10,
  CONNECTION_TIMEOUT: 5000,
  RATE_LIMIT: {
    MESSAGES_PER_MINUTE: 20,
    COMMANDS_PER_MINUTE: 10,
    SEARCHES_PER_MINUTE: 15,
  },
  MAX_QUERY_LENGTH: 100,
  ALLOWED_SEARCH_CHARS: /^[a-zA-Z0-9\s\-.,#&'()]+$/,
  VERSION: "1.0.1", // Added version for debugging
};

// Helper function to validate Telegram update structure
function validateTelegramUpdate(update: any): boolean {
  if (!update || typeof update !== 'object') return false;
  if (!update.message || typeof update.message !== 'object') return false;
  if (!update.message.from || !update.message.from.id) return false;
  if (!update.message.chat || !update.message.chat.id) return false;
  return true;
}

// Security: Input sanitization for search queries
function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  
  // Trim and limit length
  const trimmed = query.trim().substring(0, CONFIG.MAX_QUERY_LENGTH);
  
  // Remove potentially dangerous characters, keep only alphanumeric, spaces, and common punctuation
  const sanitized = trimmed.replace(/[^a-zA-Z0-9\s\-.,#&'()]/g, '');
  
  // Remove excessive whitespace
  return sanitized.replace(/\s+/g, ' ').trim();
}

// Security: Rate limiting check
async function checkRateLimit(supabase: any, telegramUserId: string, action: string): Promise<boolean> {
  if (!telegramUserId) return true; // Allow if no user ID
  
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    // Get action count in the last minute
    const { count, error } = await supabase
      .from('user_activities')
      .select('*', { count: 'exact', head: true })
      .eq('telegram_user_id', telegramUserId)
      .eq('activity_type', action)
      .gte('created_at', oneMinuteAgo.toISOString());
    
    if (error) {
      console.warn('Rate limit check failed:', error);
      return true; // Allow on error to prevent blocking legitimate users
    }
    
    const limits: { [key: string]: number } = {
      'telegram_message': CONFIG.RATE_LIMIT.MESSAGES_PER_MINUTE,
      'telegram_command': CONFIG.RATE_LIMIT.COMMANDS_PER_MINUTE,
      'telegram_search': CONFIG.RATE_LIMIT.SEARCHES_PER_MINUTE,
    };
    
    const limit = limits[action] || CONFIG.RATE_LIMIT.MESSAGES_PER_MINUTE;
    return (count || 0) < limit;
  } catch (error) {
    console.warn('Rate limit check error:', error);
    return true; // Allow on error
  }
}

// Utility: Format location message (reduces code duplication)
function formatLocationMessage(location: any): string {
  const rating = Math.round(location.rating || 0);
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  
  return `📍 ${location.name}\n` +
         `Address: ${location.address}\n` +
         `Type: ${location.type || 'Unknown'}\n` +
         `Rating: ${stars}\n\n`;
}

// Utility: Build location search query (reduces code duplication)
function buildLocationQuery(supabase: any, searchTerm: string, locationType?: string, limit: number = 10) {
  let query = supabase
    .from('locations')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
    .eq('active', true)
    .order('name')
    .limit(limit);
  
  if (locationType) {
    query = query.eq('type', locationType);
  }
  
  return query;
}

// Utility: Execute database search with retry (reduces code duplication)
async function executeLocationSearch(
  supabase: any, 
  searchTerm: string, 
  locationType?: string, 
  limit: number = 10
): Promise<{ data: any[] | null; error: any }> {
  const sanitizedTerm = sanitizeSearchQuery(searchTerm);
  if (!sanitizedTerm) {
    return { data: null, error: new Error('Invalid search term') };
  }
  
  return await retryOperation(async () => {
    const query = buildLocationQuery(supabase, sanitizedTerm, locationType, limit);
    const result = await query;
    if (result.error) throw result.error;
    return result;
  });
}

// Utility: Log search activity with privacy consideration
async function logSearchActivity(
  supabase: any,
  params: {
    query?: string;
    telegramUserId?: string;
    latitude?: string;
    longitude?: string;
    queryType: string;
  }
): Promise<void> {
  try {
    await retryOperation(async () => {
      // Only log non-sensitive data
      const logData: any = {
        query_type: params.queryType,
        telegram_user_id: params.telegramUserId,
      };
      
      // Only include search terms that are not too specific (privacy)
      if (params.query && params.query.length <= 50) {
        logData.query = sanitizeSearchQuery(params.query);
      }
      
      // Include coordinates for location-based searches
      if (params.latitude && params.longitude) {
        logData.latitude = params.latitude;
        logData.longitude = params.longitude;
      }
      
      const { error } = await supabase.from("location_searches").insert(logData);
      if (error) throw error;
    });
  } catch (error) {
    console.error('Failed to log search activity:', error);
  }
}

// Utility: Increment bot stats with error handling
async function incrementBotStats(supabase: any, statName: string, incrementBy: number = 1): Promise<void> {
  try {
    await retryOperation(async () => {
      const { error } = await supabase.rpc("increment_bot_stats", { 
        stat_name: statName, 
        increment_by: incrementBy 
      });
      if (error) throw error;
    });
  } catch (error) {
    console.error(`Failed to increment stat ${statName}:`, error);
  }
}

// Handler: Process locate command
async function handleLocateCommand(
  supabase: any,
  telegramBotToken: string,
  message: any,
  argsText: string,
  telegramUserId?: string
): Promise<void> {
  if (!argsText) {
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: `Please provide an address. Example: /locate 123 Main St, City`
    });
    return;
  }

  try {
    // Geocode the address (simulate with random coordinates for demo)
    const lat = 51.5 + (Math.random() * 0.1);
    const lng = -0.12 + (Math.random() * 0.1);
    
    const payload = {
      chat_id: message.chat.id,
      text: `📍 Location found for "${sanitizeSearchQuery(argsText)}":\nLatitude: ${lat}\nLongitude: ${lng}\n\nHere's the location:`
    };
    
    // First send the text message with retry
    await sendTelegramMessage(telegramBotToken, "sendMessage", payload);
    
    // Then send the location as a separate message with retry
    await sendTelegramMessage(telegramBotToken, "sendLocation", {
      chat_id: message.chat.id,
      latitude: lat,
      longitude: lng
    });
    
    // Log the location search and increment counter in parallel
    const logOperations = [
      logSearchActivity(supabase, {
        query: argsText,
        telegramUserId,
        latitude: lat.toString(),
        longitude: lng.toString(),
        queryType: "geocode"
      }),
      incrementBotStats(supabase, "location_searches")
    ];
    
    await Promise.allSettled(logOperations);
  } catch (error) {
    console.error("Error in locate command:", error);
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "Sorry, there was an error processing your location request."
    });
  }
}

// Handler: Process location search commands (city, town, village, postcode)
async function handleLocationSearch(
  supabase: any,
  cmd: string,
  argsText: string,
  telegramUserId: string | undefined,
  chatId: number
): Promise<any> {
  const payload = { chat_id: chatId, text: "" };
  
  if (!argsText) {
    payload.text = `Please provide a search term. Example: /${cmd} London`;
    return payload;
  }

  // Security: Check search rate limits
  const isSearchRateLimited = !(await checkRateLimit(supabase, telegramUserId || '', 'telegram_search'));
  if (isSearchRateLimited) {
    payload.text = "⚠️ You're searching too quickly. Please wait a moment and try again.";
    return payload;
  }

  try {
    // Use the new utility function for search
    const locationType = cmd === 'postcode' ? undefined : cmd;
    const { data: locations, error } = await executeLocationSearch(supabase, argsText, locationType, 10);
      
    if (error) {
      console.error("Error fetching locations:", error);
      payload.text = "Sorry, there was an error processing your search.";
    } else if (!locations || locations.length === 0) {
      // If no results, try a broader search without type filter
      const { data: broadLocations } = await executeLocationSearch(supabase, argsText, undefined, 10);
      
      if (broadLocations && broadLocations.length > 0) {
        payload.text = `Found ${broadLocations.length} location(s) matching "${sanitizeSearchQuery(argsText)}" (broader search):\n\n`;
        broadLocations.forEach((loc) => {
          payload.text += formatLocationMessage(loc);
        });
        
        // Update visit counts using batch function
        await batchUpdateVisitCounts(supabase, broadLocations);
      } else {
        payload.text = `No locations found matching "${sanitizeSearchQuery(argsText)}". Try a different search term or check if locations are available in the database.`;
      }
    } else {
      payload.text = `Found ${locations.length} ${cmd}(s) matching "${sanitizeSearchQuery(argsText)}":\n\n`;
      
      locations.forEach((loc) => {
        payload.text += formatLocationMessage(loc);
      });
      
      // Update visit counts using batch function
      await batchUpdateVisitCounts(supabase, locations);
      
      // Log the search and increment counter in parallel
      const logOperations = [
        logSearchActivity(supabase, {
          query: argsText,
          telegramUserId,
          queryType: cmd
        }),
        incrementBotStats(supabase, "location_searches")
      ];
      
      await Promise.allSettled(logOperations);
    }
  } catch (error) {
    console.error(`Error in ${cmd} search:`, error);
    payload.text = "Sorry, there was an error processing your search. Please try again.";
  }
  
  return payload;
}

// Handler: Process location sharing
async function handleLocationSharing(
  supabase: any,
  location: { latitude: number; longitude: number },
  telegramUserId: string | undefined,
  chatId: number
): Promise<any> {
  const payload = { chat_id: chatId, text: "" };
  
  try {
    // Find nearby locations (simulated with random selection)
    const { data: nearbyLocations } = await retryOperation(async () => {
      const result = await supabase
        .from('locations')
        .select('*')
        .eq('active', true)
        .order('name')
        .limit(3);
      if (result.error) throw result.error;
      return result;
    });
      
    if (nearbyLocations && nearbyLocations.length > 0) {
      payload.text = `📍 Here are some locations near you:\n\n`;
      
      nearbyLocations.forEach((loc) => {
        payload.text += formatLocationMessage(loc);
      });
      
      // Update visit counts using batch function
      await batchUpdateVisitCounts(supabase, nearbyLocations);
      
      // Log the search and increment counter in parallel
      const logOperations = [
        logSearchActivity(supabase, {
          telegramUserId,
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          queryType: "nearby"
        }),
        incrementBotStats(supabase, "location_searches")
      ];
      
      await Promise.allSettled(logOperations);
    } else {
      payload.text = `I received your location (${location.latitude}, ${location.longitude}), but I couldn't find any nearby places.`;
    }
  } catch (error) {
    console.error("Error processing location sharing:", error);
    payload.text = "Sorry, there was an error processing your location. Please try again.";
  }
  
  return payload;
}

// Handler: Process text search
async function handleTextSearch(
  supabase: any,
  query: string,
  telegramUserId: string | undefined,
  chatId: number
): Promise<any> {
  const payload = { chat_id: chatId, text: "" };
  
  // Security: Check search rate limits
  const isSearchRateLimited = !(await checkRateLimit(supabase, telegramUserId || '', 'telegram_search'));
  if (isSearchRateLimited) {
    payload.text = "⚠️ You're searching too quickly. Please wait a moment and try again.";
    return payload;
  }
  
  try {
    // Use the new utility function for search
    const { data: locations, error } = await executeLocationSearch(supabase, query, undefined, 5);
      
    if (error) {
      console.error("Error searching locations:", error);
      payload.text = "Sorry, there was an error processing your search.";
    } else if (!locations || locations.length === 0) {
      payload.text = `No locations found matching "${sanitizeSearchQuery(query)}". Try a different search term or use /help to see available commands.`;
    } else {
      payload.text = `Found ${locations.length} location(s) matching "${sanitizeSearchQuery(query)}":\n\n`;
      
      locations.forEach((loc) => {
        payload.text += formatLocationMessage(loc);
      });
      
      // Update visit counts using batch function
      await batchUpdateVisitCounts(supabase, locations);
      
      // Log the search and increment counter in parallel
      const logOperations = [
        logSearchActivity(supabase, {
          query,
          telegramUserId,
          queryType: "text"
        }),
        incrementBotStats(supabase, "location_searches")
      ];
      
      await Promise.allSettled(logOperations);
    }
  } catch (error) {
    console.error("Error in text search:", error);
    payload.text = "Sorry, there was an error processing your search. Please try again.";
  }
  
  return payload;
}

// Helper function to retry operations with exponential backoff
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = CONFIG.MAX_RETRIES,
  delay: number = CONFIG.RETRY_DELAY
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

// Helper function to batch update visit counts
async function batchUpdateVisitCounts(supabase: any, locations: any[]): Promise<void> {
  if (!locations || locations.length === 0) return;
  
  try {
    // Use RPC function for atomic batch update
    const locationIds = locations.map(loc => loc.id);
    const { error } = await supabase.rpc('batch_increment_visits', {
      location_ids: locationIds
    });
    
    if (error) {
      console.error('Error in batch visit count update:', error);
      // Fallback to individual updates if batch fails
      await fallbackVisitCountUpdate(supabase, locations);
    }
  } catch (error) {
    console.error('Critical error in batch visit count update:', error);
    // Fallback to individual updates
    await fallbackVisitCountUpdate(supabase, locations);
  }
}

// Fallback function for individual visit count updates
async function fallbackVisitCountUpdate(supabase: any, locations: any[]): Promise<void> {
  const updatePromises = locations.map(async (loc) => {
    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('locations')
          .update({ visits: (loc.visits || 0) + 1 })
          .eq('id', loc.id);
        
        if (error) throw error;
      });
    } catch (error) {
      console.error(`Failed to update visit count for location ${loc.id}:`, error);
    }
  });
  
  await Promise.allSettled(updatePromises);
}

// Helper function to send Telegram message with retry
async function sendTelegramMessage(
  telegramBotToken: string, 
  method: string, 
  payload: any
): Promise<any> {
  return await retryOperation(async () => {
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Debug: Log available environment variables (without exposing sensitive data)
    console.log("Environment check:", {
      hasTelegramToken: !!Deno.env.get("TELEGRAM_BOT_TOKEN"),
      hasBotToken: !!Deno.env.get("BOT_TOKEN"),
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      hasSupabaseKey: !!Deno.env.get("SUPABASE_ANON_KEY")
    });
    
    // Get the telegram bot token from environment (try multiple variable names)
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || Deno.env.get("BOT_TOKEN");
    
    if (!telegramBotToken) {
      console.error("Telegram bot token not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Telegram bot token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create the Supabase client with connection pooling considerations
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: 'public'
      },
      auth: {
        persistSession: false
      },
      global: {
        headers: {
          'connection': 'keep-alive'
        }
      }
    });
    
    // Get and validate update from Telegram
    const update = await req.json();
    console.log("Received update:", JSON.stringify(update));
    
    // Validate the Telegram update structure
    if (!validateTelegramUpdate(update)) {
      console.warn("Invalid Telegram update structure:", update);
      return new Response(
        JSON.stringify({ ok: true, message: "Invalid update structure" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Extract user data for tracking (with privacy considerations)
    const telegramUserId = update.message?.from?.id?.toString();
    const telegramUsername = update.message?.from?.username;
    
    // Security: Check rate limits
    const isRateLimited = !(await checkRateLimit(supabase, telegramUserId || '', 'telegram_message'));
    if (isRateLimited) {
      console.warn(`Rate limit exceeded for user ${telegramUserId}`);
      return new Response(
        JSON.stringify({ ok: true, message: "Rate limit exceeded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Batch database operations for better performance
    const dbOperations: Promise<void>[] = [];
    
    // Store the update in the database for debugging/audit (with privacy considerations)
    dbOperations.push(
      retryOperation(async () => {
        const { error } = await supabase.from("user_activities").insert({
          activity_type: "telegram_message",
          telegram_user_id: telegramUserId,
          // Don't log the full message content for privacy - just indicate if it was a command
          message: update.message?.text?.startsWith('/') ? 'command' : 'text_message',
        });
        if (error) throw error;
      })
    );
    
    // Update bot statistics and user tracking
    if (telegramUserId) {
      // Check if user exists and handle user registration/stats update
      dbOperations.push(
        retryOperation(async () => {
          const { data: existingUser, error: userError } = await supabase
            .from("telegram_users")
            .select("id")
            .eq("telegram_id", telegramUserId)
            .maybeSingle();
          
          if (userError) throw userError;
          
          if (!existingUser) {
            // User doesn't exist, create new user
            const { error: insertError } = await supabase.from("telegram_users").insert({
              telegram_id: telegramUserId,
              username: telegramUsername || "unknown",
              first_name: update.message?.from?.first_name || "",
              last_name: update.message?.from?.last_name || "",
              first_seen: new Date().toISOString(),
            });
            
            if (insertError) throw insertError;
            
            // Increment unique users counter
            const { error: statsError } = await supabase.rpc("increment_bot_stats", { 
              stat_name: "unique_users", 
              increment_by: 1 
            });
            if (statsError) throw statsError;
          }
          
          // Always increment total messages counter
          const { error: msgStatsError } = await supabase.rpc("increment_bot_stats", { 
            stat_name: "total_messages", 
            increment_by: 1 
          });
          if (msgStatsError) throw msgStatsError;
        })
      );
    }
    
    // Execute all database operations in parallel
    try {
      await Promise.allSettled(dbOperations);
    } catch (error) {
      console.error("Error in initial database operations:", error);
      // Continue processing even if some operations fail
    }
    
    // Process the message
    const message = update.message;
    if (!message || !message.text) {
      return new Response(
        JSON.stringify({ ok: true, message: "No text message to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let responseText = "Processing your request...";
    let method = "sendMessage";
    let payload = {
      chat_id: message.chat.id,
      text: responseText,
    };

    // Check if it's a command
    if (message.text.startsWith('/')) {
      const [command, ...args] = message.text.split(' ');
      const cmd = command.substring(1).toLowerCase(); // Remove '/' and convert to lowercase
      const argsText = args.join(' ');
      
      // Security: Check command rate limits
      const isCommandRateLimited = !(await checkRateLimit(supabase, telegramUserId || '', 'telegram_command'));
      if (isCommandRateLimited) {
        payload.text = "⚠️ You're sending commands too quickly. Please wait a moment and try again.";
      } else {
        // Log command activity
        await retryOperation(async () => {
          const { error } = await supabase.from("user_activities").insert({
            activity_type: "telegram_command",
            telegram_user_id: telegramUserId,
            message: cmd, // Only log the command name, not args for privacy
          });
          if (error) throw error;
        });
        
        // Increment command usage stat
        await incrementBotStats(supabase, `cmd_${cmd}`);
        
        switch (cmd) {
          case 'start':
            payload.text = `👋 Welcome to TeleLocator Bot!\n\nI can help you find locations by name, address, or type.\n\nTry these commands:\n/help - Show available commands\n/city London - Search for locations in London\n/village Cotswold - Search for villages\n/town Oxford - Search for towns\n/postcode SW1A - Search by postcode\n/locate 123 Main St - Get coordinates for an address\n\nOr simply send me a location name or address to search!`;
            break;
          case 'help':
            payload.text = `🔍 Available Commands:\n\n/start - Start the bot\n/help - Show this help message\n/city [name] - Find locations in a city\n/town [name] - Find locations in a town\n/village [name] - Find locations in a village\n/postcode [code] - Find locations by postcode\n/locate [address] - Get coordinates for an address\n/nearby - Find locations near you (when you share your location)\n\nYou can also just send a location name or address to search!`;
            break;
            
          case 'locate':
            await handleLocateCommand(supabase, telegramBotToken, message, argsText, telegramUserId);
            return new Response(
              JSON.stringify({ ok: true }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
            
          case 'city':
          case 'town': 
          case 'village':
          case 'postcode':
            payload = await handleLocationSearch(supabase, cmd, argsText, telegramUserId, message.chat.id);
            break;
            
          default:
            payload.text = `Sorry, I don't recognize the command "/${cmd}". Try /help for available commands.`;
        }
      }
    } else if (message.location) {
      // Handle user sharing their location
      payload = await handleLocationSharing(supabase, message.location, telegramUserId, message.chat.id);
    } else {
      // Process as a location query
      payload = await handleTextSearch(supabase, message.text.trim(), telegramUserId, message.chat.id);
    }
    
    // Send response to Telegram with retry mechanism
    try {
      const telegramData = await sendTelegramMessage(telegramBotToken, method, payload);
      console.log("Telegram API response:", telegramData);
    } catch (error) {
      console.error("Failed to send Telegram message after retries:", error);
      // Don't throw here - we still want to return success to Telegram to prevent retries
    }
    
    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage, details: "Check function logs for more information" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
