
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
};

// Helper function to validate Telegram update structure
function validateTelegramUpdate(update: any): boolean {
  if (!update || typeof update !== 'object') return false;
  if (!update.message || typeof update.message !== 'object') return false;
  if (!update.message.from || !update.message.from.id) return false;
  if (!update.message.chat || !update.message.chat.id) return false;
  return true;
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
    // Get the telegram bot token from environment
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    
    if (!telegramBotToken) {
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
    
    // Extract user data for tracking
    const telegramUserId = update.message?.from?.id?.toString();
    const telegramUsername = update.message?.from?.username;
    
    // Batch database operations for better performance
    const dbOperations: Promise<void>[] = [];
    
    // Store the update in the database for debugging/audit
    dbOperations.push(
      retryOperation(async () => {
        const { error } = await supabase.from("user_activities").insert({
          activity_type: "telegram_update",
          telegram_user_id: telegramUserId,
          telegram_username: telegramUsername,
          message: update.message?.text,
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
      
      // Increment command usage stat
      try {
        await retryOperation(async () => {
          const { error } = await supabase.rpc("increment_bot_stats", { 
            stat_name: `cmd_${cmd}`, 
            increment_by: 1 
          });
          if (error) throw error;
        });
      } catch (error) {
        console.error(`Failed to increment command stat for ${cmd}:`, error);
      }
      
      switch (cmd) {
        case 'start':
          payload.text = `👋 Welcome to TeleLocator Bot!\n\nI can help you find locations by name, address, or type.\n\nTry these commands:\n/help - Show available commands\n/city London - Search for locations in London\n/village Cotswold - Search for villages\n/town Oxford - Search for towns\n/postcode SW1A - Search by postcode\n/locate 123 Main St - Get coordinates for an address\n\nOr simply send me a location name or address to search!`;
          break;
        case 'help':
          payload.text = `🔍 Available Commands:\n\n/start - Start the bot\n/help - Show this help message\n/city [name] - Find locations in a city\n/town [name] - Find locations in a town\n/village [name] - Find locations in a village\n/postcode [code] - Find locations by postcode\n/locate [address] - Get coordinates for an address\n/nearby - Find locations near you (when you share your location)\n\nYou can also just send a location name or address to search!`;
          break;
          
        case 'locate':
          if (!argsText) {
            payload.text = `Please provide an address. Example: /locate 123 Main St, City`;
          } else {
            // Geocode the address (simulate with random coordinates for demo)
            const lat = 51.5 + (Math.random() * 0.1);
            const lng = -0.12 + (Math.random() * 0.1);
            
            payload.text = `📍 Location found for "${argsText}":\nLatitude: ${lat}\nLongitude: ${lng}\n\nHere's the location:`;
            
            try {
              // First send the text message with retry
              await sendTelegramMessage(telegramBotToken, method, payload);
              
              // Then send the location as a separate message with retry
              await sendTelegramMessage(telegramBotToken, "sendLocation", {
                chat_id: message.chat.id,
                latitude: lat,
                longitude: lng
              });
              
              // Log the location search and increment counter in parallel
              const logOperations = [
                retryOperation(async () => {
                  const { error } = await supabase.from("location_searches").insert({
                    query: argsText,
                    telegram_user_id: telegramUserId,
                    latitude: lat.toString(),
                    longitude: lng.toString(),
                    query_type: "geocode"
                  });
                  if (error) throw error;
                }),
                retryOperation(async () => {
                  const { error } = await supabase.rpc("increment_bot_stats", { 
                    stat_name: "location_searches", 
                    increment_by: 1 
                  });
                  if (error) throw error;
                })
              ];
              
              await Promise.allSettled(logOperations);
              
              // We've already sent the response, so just return
              return new Response(
                JSON.stringify({ ok: true }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            } catch (error) {
              console.error("Error in locate command:", error);
              payload.text = "Sorry, there was an error processing your location request.";
            }
          }
          break;
          
        case 'city':
        case 'town': 
        case 'village':
        case 'postcode':
          if (!argsText) {
            payload.text = `Please provide a search term. Example: /${cmd} London`;
          } else {
            try {
              // Query locations - search in both name and address, and optionally filter by type
              let query = supabase
                .from('locations')
                .select('*')
                .or(`name.ilike.%${argsText}%,address.ilike.%${argsText}%`)
                .eq('active', true)
                .order('name')
                .limit(10);
              
              // If searching for specific type, add type filter
              if (cmd !== 'postcode') {
                // For postcode, don't filter by type, just search in address/name
                query = query.eq('type', cmd);
              }
              
              const { data: locations, error } = await retryOperation(async () => {
                const result = await query;
                if (result.error) throw result.error;
                return result;
              });
                
              if (error) {
                console.error("Error fetching locations:", error);
                payload.text = "Sorry, there was an error processing your search.";
              } else if (!locations || locations.length === 0) {
                // If no results, try a broader search without type filter
                const { data: broadLocations } = await retryOperation(async () => {
                  const result = await supabase
                    .from('locations')
                    .select('*')
                    .or(`name.ilike.%${argsText}%,address.ilike.%${argsText}%`)
                    .eq('active', true)
                    .order('name')
                    .limit(10);
                  if (result.error) throw result.error;
                  return result;
                });
                
                if (broadLocations && broadLocations.length > 0) {
                  payload.text = `Found ${broadLocations.length} location(s) matching "${argsText}" (broader search):\n\n`;
                  broadLocations.forEach((loc) => {
                    payload.text += `📍 ${loc.name}\nAddress: ${loc.address}\nType: ${loc.type || 'Unknown'}\nRating: ${'★'.repeat(Math.round(loc.rating || 0))}${'☆'.repeat(5-Math.round(loc.rating || 0))}\n\n`;
                  });
                  
                  // Update visit counts using batch function
                  await batchUpdateVisitCounts(supabase, broadLocations);
                } else {
                  payload.text = `No locations found matching "${argsText}". Try a different search term or check if locations are available in the database.`;
                }
              } else {
                payload.text = `Found ${locations.length} ${cmd}(s) matching "${argsText}":\n\n`;
                
                locations.forEach((loc) => {
                  payload.text += `📍 ${loc.name}\nAddress: ${loc.address}\nRating: ${'★'.repeat(Math.round(loc.rating || 0))}${'☆'.repeat(5-Math.round(loc.rating || 0))}\n\n`;
                });
                
                // Update visit counts using batch function
                await batchUpdateVisitCounts(supabase, locations);
                
                // Log the search and increment counter in parallel
                const logOperations = [
                  retryOperation(async () => {
                    const { error } = await supabase.from("location_searches").insert({
                      query: argsText,
                      telegram_user_id: telegramUserId,
                      query_type: cmd
                    });
                    if (error) throw error;
                  }),
                  retryOperation(async () => {
                    const { error } = await supabase.rpc("increment_bot_stats", { 
                      stat_name: "location_searches", 
                      increment_by: 1 
                    });
                    if (error) throw error;
                  })
                ];
                
                await Promise.allSettled(logOperations);
              }
            } catch (error) {
              console.error(`Error in ${cmd} search:`, error);
              payload.text = "Sorry, there was an error processing your search. Please try again.";
            }
          }
          break;
          
        default:
          payload.text = `Sorry, I don't recognize the command "/${cmd}". Try /help for available commands.`;
      }
    } else if (message.location) {
      // Handle user sharing their location
      const { latitude, longitude } = message.location;
      
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
            payload.text += `📍 ${loc.name}\nAddress: ${loc.address}\nType: ${loc.type}\nRating: ${'★'.repeat(Math.round(loc.rating || 0))}${'☆'.repeat(5-Math.round(loc.rating || 0))}\n\n`;
          });
          
          // Update visit counts using batch function
          await batchUpdateVisitCounts(supabase, nearbyLocations);
          
          // Log the search and increment counter in parallel
          const logOperations = [
            retryOperation(async () => {
              const { error } = await supabase.from("location_searches").insert({
                telegram_user_id: telegramUserId,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                query_type: "nearby"
              });
              if (error) throw error;
            }),
            retryOperation(async () => {
              const { error } = await supabase.rpc("increment_bot_stats", { 
                stat_name: "location_searches", 
                increment_by: 1 
              });
              if (error) throw error;
            })
          ];
          
          await Promise.allSettled(logOperations);
        } else {
          payload.text = `I received your location (${latitude}, ${longitude}), but I couldn't find any nearby places.`;
        }
      } catch (error) {
        console.error("Error processing location sharing:", error);
        payload.text = "Sorry, there was an error processing your location. Please try again.";
      }
    } else {
      // Process as a location query
      const query = message.text.trim();
      
      try {
        // Query locations by name or address
        const { data: locations, error } = await retryOperation(async () => {
          const result = await supabase
            .from('locations')
            .select('*')
            .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
            .eq('active', true)
            .order('name')
            .limit(5);
          if (result.error) throw result.error;
          return result;
        });
          
        if (error) {
          console.error("Error searching locations:", error);
          payload.text = "Sorry, there was an error processing your search.";
        } else if (!locations || locations.length === 0) {
          payload.text = `No locations found matching "${query}". Try a different search term or use /help to see available commands.`;
        } else {
          payload.text = `Found ${locations.length} location(s) matching "${query}":\n\n`;
          
          locations.forEach((loc) => {
            payload.text += `📍 ${loc.name}\nAddress: ${loc.address}\nType: ${loc.type}\nRating: ${'★'.repeat(Math.round(loc.rating || 0))}${'☆'.repeat(5-Math.round(loc.rating || 0))}\n\n`;
          });
          
          // Update visit counts using batch function
          await batchUpdateVisitCounts(supabase, locations);
          
          // Log the search and increment counter in parallel
          const logOperations = [
            retryOperation(async () => {
              const { error } = await supabase.from("location_searches").insert({
                query: query,
                telegram_user_id: telegramUserId,
                query_type: "text"
              });
              if (error) throw error;
            }),
            retryOperation(async () => {
              const { error } = await supabase.rpc("increment_bot_stats", { 
                stat_name: "location_searches", 
                increment_by: 1 
              });
              if (error) throw error;
            })
          ];
          
          await Promise.allSettled(logOperations);
        }
      } catch (error) {
        console.error("Error in text search:", error);
        payload.text = "Sorry, there was an error processing your search. Please try again.";
      }
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
