
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
    
    // Store the update in the database for debugging/audit
    await supabase.from("user_activities").insert({
      activity_type: "telegram_update",
      telegram_user_id: update.message?.from?.id?.toString(),
      telegram_username: update.message?.from?.username,
      message: update.message?.text,
    });
    
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
      
      switch (cmd) {
        case 'start':
          payload.text = `👋 Welcome to TeleLocator Bot!\n\nI can help you find locations by name, address, or type.\n\nTry these commands:\n/help - Show available commands\n/city London - Search for locations in London\n/village Cotswold - Search for villages\n/town Oxford - Search for towns\n/postcode SW1A - Search by postcode\n\nOr simply send me a location name or address to search!`;
          break;
        case 'help':
          payload.text = `🔍 Available Commands:\n\n/start - Start the bot\n/help - Show this help message\n/city [name] - Find locations in a city\n/town [name] - Find locations in a town\n/village [name] - Find locations in a village\n/postcode [code] - Find locations by postcode\n/nearby - Find locations near you (coming soon)\n\nYou can also just send a location name or address to search!`;
          break;
        case 'city':
        case 'town': 
        case 'village':
        case 'postcode':
          if (!argsText) {
            payload.text = `Please provide a search term. Example: /${cmd} London`;
          } else {
            // Query locations
            const { data: locations, error } = await supabase
              .from('locations')
              .select('*')
              .eq('type', cmd)
              .ilike('address', `%${argsText}%`)
              .eq('active', true)
              .order('name')
              .limit(5);
              
            if (error) {
              console.error("Error fetching locations:", error);
              payload.text = "Sorry, there was an error processing your search.";
            } else if (locations.length === 0) {
              payload.text = `No ${cmd}s found matching "${argsText}". Try a different search.`;
            } else {
              payload.text = `Found ${locations.length} ${cmd}(s) matching "${argsText}":\n\n`;
              
              locations.forEach((loc) => {
                payload.text += `📍 ${loc.name}\nAddress: ${loc.address}\nRating: ${'★'.repeat(Math.round(loc.rating))}${'☆'.repeat(5-Math.round(loc.rating))}\n\n`;
              });
              
              // Update visit counts
              for (const loc of locations) {
                await supabase
                  .from('locations')
                  .update({ visits: loc.visits + 1 })
                  .eq('id', loc.id);
              }
            }
          }
          break;
        default:
          payload.text = `Sorry, I don't recognize the command "/${cmd}". Try /help for available commands.`;
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
      } else if (locations.length === 0) {
        payload.text = `No locations found matching "${query}". Try a different search term.`;
      } else {
        payload.text = `Found ${locations.length} location(s) matching "${query}":\n\n`;
        
        locations.forEach((loc) => {
          payload.text += `📍 ${loc.name}\nAddress: ${loc.address}\nType: ${loc.type}\nRating: ${'★'.repeat(Math.round(loc.rating))}${'☆'.repeat(5-Math.round(loc.rating))}\n\n`;
        });
        
        // Update visit counts
        for (const loc of locations) {
          await supabase
            .from('locations')
            .update({ visits: loc.visits + 1 })
            .eq('id', loc.id);
        }
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
