// Minimal Telegram Bot Webhook - Working Version
// This handles /start, /number, /numbers, /help, /invite commands with state management

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// User states for conversation flow
const USER_STATES = new Map();

// Simple logging function
function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level}: ${message}`, data || '');
}

// Send message to Telegram
async function sendTelegramMessage(botToken: string, chatId: number, text: string, parseMode = "HTML") {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    log('ERROR', 'Failed to send message', { error: error.message, chatId, text: text.substring(0, 100) });
    throw error;
  }
}

// Mock geocoding function (replace with real service)
function geocodeAddress(address: string) {
  // Mock geocoding - in real implementation, use Google Maps or similar
  const locations = {
    'london': { lat: 51.5074, lon: -0.1278, address: 'London, UK' },
    'new york': { lat: 40.7128, lon: -74.0060, address: 'New York, NY, USA' },
    'paris': { lat: 48.8566, lon: 2.3522, address: 'Paris, France' },
  };
  
  const key = address.toLowerCase();
  for (const [city, coords] of Object.entries(locations)) {
    if (key.includes(city)) {
      return coords;
    }
  }
  
  // Default to London if not found
  return locations.london;
}

// Get sample phone numbers near location with updated North East data
function getNearbyNumbers(lat: number, lon: number, limit = 1) {
  // Updated sample data with North East medical contacts
  const sampleNumbers = [
    // North East - All use same contact info with different cities
    { phone: '+44 799 9877582', name: 'Top Shagger NE', lat: 54.9783, lon: -1.6178, city: 'Newcastle upon Tyne' },
    { phone: '+44 799 9877582', name: 'Durham Medics', lat: 54.7761, lon: -1.5733, city: 'Durham' },
    { phone: '+44 799 9877582', name: 'Sunderland Health', lat: 54.9069, lon: -1.3838, city: 'Sunderland' },
    { phone: '+44 799 9877582', name: 'Middlesbrough Care', lat: 54.5742, lon: -1.2351, city: 'Middlesbrough' },
    
    // Other UK locations  
    { phone: '+44 7700 900123', name: 'John Smith', lat: 51.5074, lon: -0.1278, city: 'London' },
    { phone: '+44 7700 900456', name: 'Sarah Johnson', lat: 51.5074, lon: -0.1278, city: 'London' },
    { phone: '+44 7700 900789', name: 'Mike Davis', lat: 51.5074, lon: -0.1278, city: 'London' },
    { phone: '+1 555 123 4567', name: 'Alex Wilson', lat: 40.7128, lon: -74.0060, city: 'New York' },
    { phone: '+1 555 987 6543', name: 'Emma Brown', lat: 40.7128, lon: -74.0060, city: 'New York' },
  ];
  
  // Simple distance calculation - prioritize North East for relevant locations
  const isNorthEastLocation = lat > 54 && lat < 56 && lon > -3 && lon < 0; // Rough North East bounds
  
  if (isNorthEastLocation) {
    // Return North East contacts first for locations in that region
    return sampleNumbers.filter(num => num.city.includes('Newcastle') || num.city.includes('Durham') || num.city.includes('Sunderland') || num.city.includes('Middlesbrough')).slice(0, limit);
  }
  
  return sampleNumbers.slice(0, limit);
}

// Welcome message
function getWelcomeMessage(requestsLeft = 3) {
  return `Hey,

Welcome to the find a local Medic directory, Don't panic we got you covered.

As we are helping other members 24/7 in the Medic chat we have to enforce the following limits:

🎉 3 requests per 24hrs
⚡ ${requestsLeft} requests left for today

✨ <b>How to find a local Medic</b>

To find a local Medic simply click <b>/number</b>

Click <b>/help</b> for an array of other, tempting commands.

If you need your limit raised for whatever please ask an admin in the chat or press <b>/help</b>

Thank you, and we hope to see you again

🎉 3 requests per 24hrs
⚡ ${requestsLeft} requests left for today`;
}

// Handle /start command
async function handleStart(botToken: string, message: any) {
  const chatId = message.chat.id;
  const userId = message.from.id.toString();
  
  USER_STATES.set(userId, 'start');
  log('INFO', 'Start command', { userId, chatId });
  
  const welcomeMessage = getWelcomeMessage();
  await sendTelegramMessage(botToken, chatId, welcomeMessage);
}

// Handle /number command
async function handleNumber(botToken: string, message: any) {
  const chatId = message.chat.id;
  const userId = message.from.id.toString();
  
  USER_STATES.set(userId, 'awaiting_location');
  log('INFO', 'Number command', { userId, chatId });
  
  await sendTelegramMessage(botToken, chatId, "📍 Please enter a location or postcode to search for numbers near you.", "");
}

// Handle /numbers command
async function handleNumbers(botToken: string, message: any) {
  const chatId = message.chat.id;
  const userId = message.from.id.toString();
  
  USER_STATES.set(userId, 'awaiting_location_numbers');
  log('INFO', 'Numbers command', { userId, chatId });
  
  await sendTelegramMessage(botToken, chatId, "📍 Please enter a location or postcode to search for multiple numbers near you.", "");
}

// Handle location query for /number
async function handleLocationQuery(botToken: string, message: any) {
  const chatId = message.chat.id;
  const userId = message.from.id.toString();
  const userName = message.from.first_name || message.from.username || 'there';
  const locationQuery = message.text.trim();
  
  log('INFO', 'Location query', { userId, chatId, query: locationQuery });
  
  // Geocode the location
  const geoResult = geocodeAddress(locationQuery);
  if (!geoResult) {
    await sendTelegramMessage(botToken, chatId, `❌ Could not find any location for: ${locationQuery}`, "");
    return;
  }
  
  // Get nearby numbers
  const numbers = getNearbyNumbers(geoResult.lat, geoResult.lon, 1);
  if (numbers.length === 0) {
    await sendTelegramMessage(botToken, chatId, "No records found near that location.", "");
    return;
  }
  
  const number = numbers[0];
  const isNorthEastSpecial = ['Top Shagger NE', 'Durham Medics', 'Sunderland Health', 'Middlesbrough Care'].includes(number.name);
  
  let specialMessage = '';
  if (isNorthEastSpecial) {
    // All North East locations use the same contact info and start message
    specialMessage = '\n⚠️ Start message with "John Topper sent you"\nTap the phone numbers to copy them';
  }
  
  const reply = `Hello ${userName},

Here is 1 number near: ${geoResult.address}

⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️
<b>${number.name}</b>
<a href='tel:${number.phone}'>${number.phone}</a>${specialMessage || '\n🔒 Start your message on WhatsApp with password NIGELLA to get the full menu'}
⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️

✂️ Tap the number to copy
⚠️ All distances are approximate
⚠️ Use at your own risk. Never pay upfront.`;
  
  await sendTelegramMessage(botToken, chatId, reply);
  USER_STATES.set(userId, 'start');
}

// Handle location query for /numbers
async function handleNumbersQuery(botToken: string, message: any) {
  const chatId = message.chat.id;
  const userId = message.from.id.toString();
  const userName = message.from.first_name || message.from.username || 'there';
  const locationQuery = message.text.trim();
  
  log('INFO', 'Numbers query', { userId, chatId, query: locationQuery });
  
  // Geocode the location
  const geoResult = geocodeAddress(locationQuery);
  if (!geoResult) {
    await sendTelegramMessage(botToken, chatId, `❌ Could not find any location for: ${locationQuery}`, "");
    return;
  }
  
  // Get nearby numbers
  const numbers = getNearbyNumbers(geoResult.lat, geoResult.lon, 5);
  if (numbers.length === 0) {
    await sendTelegramMessage(botToken, chatId, "No records found near that location.", "");
    return;
  }
  
  let numbersSection = "";
  for (const number of numbers) {
    const isNorthEastSpecial = ['Top Shagger NE', 'Durham Medics', 'Sunderland Health', 'Middlesbrough Care'].includes(number.name);
    
    numbersSection += `⭐️ ${number.name}\nPhone: ${number.phone}\n`;
    
    if (isNorthEastSpecial) {
      // All North East locations use the same contact info and start message
      numbersSection += `⚠️ Start message with "John Topper sent you"\nTap the phone numbers to copy them\n\n`;
    } else {
      numbersSection += `🔒 Start your message on WhatsApp with password NIGELLA to get the full menu\n\n`;
    }
  }
  
  const reply = `Hello ${userName},

Here are numbers near: ${geoResult.address}

${numbersSection}✂️ Tap the number to copy
⚠️ All distances are approximate
⚠️ Use at your own risk. Never pay upfront.`;
  
  await sendTelegramMessage(botToken, chatId, reply, "");
  USER_STATES.set(userId, 'start');
}

// Handle /help command
async function handleHelp(botToken: string, message: any) {
  const chatId = message.chat.id;
  const helpMessage = `🤖 Available Commands:

/start - Welcome message
/number - Search for a single phone number
/numbers - Search for multiple phone numbers
/help - Show this help message
/invite - Get invite link

Just use the commands above to get started!`;
  
  await sendTelegramMessage(botToken, chatId, helpMessage, "");
}

// Handle /invite command
async function handleInvite(botToken: string, message: any) {
  const chatId = message.chat.id;
  await sendTelegramMessage(botToken, chatId, "🔗 Here is your invite link: https://t.me/Moatboat_bot?start=invite", "");
}

// Main handler
async function handleRequest(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get bot token from environment
    const botToken = '8035173425:AAGeegxgp5JtKwi1zSnh6BZ2bRTahKj7Gsc'; // Your bot token
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not set');
    }

    const body = await request.json();
    log('INFO', 'Received webhook', { updateId: body.update_id });

    if (!body.message) {
      return new Response(JSON.stringify({ ok: true }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const message = body.message;
    const userId = message.from?.id?.toString();
    const text = message.text?.trim();

    if (!text) {
      return new Response(JSON.stringify({ ok: true }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Handle commands
    if (text === "/start") {
      await handleStart(botToken, message);
    } else if (text === "/number") {
      await handleNumber(botToken, message);
    } else if (text === "/numbers") {
      await handleNumbers(botToken, message);
    } else if (text === "/help") {
      await handleHelp(botToken, message);
    } else if (text === "/invite") {
      await handleInvite(botToken, message);
    } else {
      // Handle text based on user state
      const userState = USER_STATES.get(userId) || 'start';
      
      if (userState === 'awaiting_location') {
        await handleLocationQuery(botToken, message);
      } else if (userState === 'awaiting_location_numbers') {
        await handleNumbersQuery(botToken, message);
      } else {
        // Fallback message
        await sendTelegramMessage(botToken, message.chat.id, "❓ Please use /number to search for a number, or /invite to invite a friend.", "");
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    log('ERROR', 'Handler error', { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

serve(handleRequest);
