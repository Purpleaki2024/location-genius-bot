
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    
    // Create the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get update from Telegram
    const update = await req.json();
    console.log("Received update:", JSON.stringify(update));
    
    // Extract user data for tracking
    const telegramUserId = update.message?.from?.id?.toString();
    const telegramUsername = update.message?.from?.username;
    
    // Store the update in the database for debugging/audit
    await supabase.from("user_activities").insert({
      activity_type: "telegram_update",
      telegram_user_id: telegramUserId,
      telegram_username: telegramUsername,
      message: update.message?.text,
    });
    
    // Update bot statistics
    if (telegramUserId) {
      // Update unique users count - first check if user exists
      const { data: existingUser } = await supabase
        .from("telegram_users")
        .select("id")
        .eq("telegram_id", telegramUserId)
        .single();
      
      if (!existingUser) {
        // If user doesn't exist, add them
        await supabase.from("telegram_users").insert({
          telegram_id: telegramUserId,
          username: telegramUsername || "unknown",
          first_name: update.message?.from?.first_name || "",
          last_name: update.message?.from?.last_name || "",
          first_seen: new Date().toISOString(),
        });
        
        // Update the bot stats counter
        await supabase.rpc("increment_bot_stats", { stat_name: "unique_users", increment_by: 1 });
      }
      
      // Always increment total messages counter
      await supabase.rpc("increment_bot_stats", { stat_name: "total_messages", increment_by: 1 });
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
      await supabase.rpc("increment_bot_stats", { stat_name: `cmd_${cmd}`, increment_by: 1 });
      
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
            
            // First send the text message
            await fetch(`https://api.telegram.org/bot${telegramBotToken}/${method}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            
            // Then send the location as a separate message
            await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendLocation`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: message.chat.id,
                latitude: lat,
                longitude: lng
              }),
            });
            
            // Log the location search
            await supabase.from("location_searches").insert({
              query: argsText,
              telegram_user_id: telegramUserId,
              latitude: lat.toString(),
              longitude: lng.toString(),
              query_type: "geocode"
            });
            
            // Increment location searches counter
            await supabase.rpc("increment_bot_stats", { stat_name: "location_searches", increment_by: 1 });
            
            // We've already sent the response, so just return
            return new Response(
              JSON.stringify({ ok: true }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          break;
          
        case 'city':
        case 'town': 
        case 'village':
        case 'postcode':
          if (!argsText) {
            payload.text = `Please provide a search term. Example: /${cmd} London`;
          } else {
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
            
            const { data: locations, error } = await query;
              
            if (error) {
              console.error("Error fetching locations:", error);
              payload.text = "Sorry, there was an error processing your search.";
            } else if (!locations || locations.length === 0) {
              // If no results, try a broader search without type filter
              const { data: broadLocations } = await supabase
                .from('locations')
                .select('*')
                .or(`name.ilike.%${argsText}%,address.ilike.%${argsText}%`)
                .eq('active', true)
                .order('name')
                .limit(10);
              
              if (broadLocations && broadLocations.length > 0) {
                payload.text = `Found ${broadLocations.length} location(s) matching "${argsText}" (broader search):\n\n`;
                broadLocations.forEach((loc) => {
                  payload.text += `📍 ${loc.name}\nAddress: ${loc.address}\nType: ${loc.type || 'Unknown'}\nRating: ${'★'.repeat(Math.round(loc.rating || 0))}${'☆'.repeat(5-Math.round(loc.rating || 0))}\n\n`;
                });
                
                // Update visit counts
                for (const loc of broadLocations) {
                  await supabase
                    .from('locations')
                    .update({ visits: (loc.visits || 0) + 1 })
                    .eq('id', loc.id);
                }
              } else {
                payload.text = `No locations found matching "${argsText}". Try a different search term or check if locations are available in the database.`;
              }
            } else {
              payload.text = `Found ${locations.length} ${cmd}(s) matching "${argsText}":\n\n`;
              
              locations.forEach((loc) => {
                payload.text += `📍 ${loc.name}\nAddress: ${loc.address}\nRating: ${'★'.repeat(Math.round(loc.rating))}${'☆'.repeat(5-Math.round(loc.rating))}\n\n`;
              });
              
              // Update visit counts
              for (const loc of locations) {
                await supabase
                  .from('locations')
                  .update({ visits: (loc.visits || 0) + 1 })
                  .eq('id', loc.id);
              }
              
              // Log the search
              await supabase.from("location_searches").insert({
                query: argsText,
                telegram_user_id: telegramUserId,
                query_type: cmd
              });
              
              // Increment location searches counter
              await supabase.rpc("increment_bot_stats", { stat_name: "location_searches", increment_by: 1 });
            }
          }
          break;
          
        default:
          payload.text = `Sorry, I don't recognize the command "/${cmd}". Try /help for available commands.`;
      }
    } else if (message.location) {
      // Handle user sharing their location
      const { latitude, longitude } = message.location;
      
      // Find nearby locations (simulated with random selection)
      const { data: nearbyLocations } = await supabase
        .from('locations')
        .select('*')
        .eq('active', true)
        .order('name')
        .limit(3);
        
      if (nearbyLocations && nearbyLocations.length > 0) {
        payload.text = `📍 Here are some locations near you:\n\n`;
        
        nearbyLocations.forEach((loc) => {
          payload.text += `📍 ${loc.name}\nAddress: ${loc.address}\nType: ${loc.type}\nRating: ${'★'.repeat(Math.round(loc.rating))}${'☆'.repeat(5-Math.round(loc.rating))}\n\n`;
          
          // Update visit counts
          supabase
            .from('locations')
            .update({ visits: (loc.visits || 0) + 1 })
            .eq('id', loc.id);
        });
        
        // Log the search
        await supabase.from("location_searches").insert({
          telegram_user_id: telegramUserId,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          query_type: "nearby"
        });
        
        // Increment location searches counter
        await supabase.rpc("increment_bot_stats", { stat_name: "location_searches", increment_by: 1 });
      } else {
        payload.text = `I received your location (${latitude}, ${longitude}), but I couldn't find any nearby places.`;
      }
    } else {
      // Process as a location query
      const query = message.text.trim();
      
      // Query locations by name or address
      const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
        .eq('active', true)
        .order('name')
        .limit(5);
        
      if (error) {
        console.error("Error searching locations:", error);
        payload.text = "Sorry, there was an error processing your search.";
      } else if (!locations || locations.length === 0) {
        payload.text = `No locations found matching "${query}". Try a different search term or use /help to see available commands.`;
      } else {
        payload.text = `Found ${locations.length} location(s) matching "${query}":\n\n`;
        
        locations.forEach((loc) => {
          payload.text += `📍 ${loc.name}\nAddress: ${loc.address}\nType: ${loc.type}\nRating: ${'★'.repeat(Math.round(loc.rating))}${'☆'.repeat(5-Math.round(loc.rating))}\n\n`;
        });
        
        // Update visit counts
        for (const loc of locations) {
          await supabase
            .from('locations')
            .update({ visits: (loc.visits || 0) + 1 })
            .eq('id', loc.id);
        }
        
        // Log the search
        await supabase.from("location_searches").insert({
          query: query,
          telegram_user_id: telegramUserId,
          query_type: "text"
        });
        
        // Increment location searches counter  
        await supabase.rpc("increment_bot_stats", { stat_name: "location_searches", increment_by: 1 });
      }
    }
    
    // Send response to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/${method}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    
    const telegramData = await telegramResponse.json();
    console.log("Telegram API response:", telegramData);
    
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
