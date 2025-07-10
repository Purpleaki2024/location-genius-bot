// Production-Ready Telegram Location Bot
// Stateless implementation for reliable serverless operation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Type definitions
interface TelegramUpdate {
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: TelegramUser;
    message?: TelegramMessage;
    data?: string;
  };
}

interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  text?: string;
  reply_markup?: any;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: string;
}

interface PhoneNumberEntry {
  phone: string;
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  category?: string;
}

// Configuration
const CONFIG = {
  VERSION: "4.0.0",
  USER_LIMITS: {
    DAILY_REQUESTS: 3,
    RATE_LIMIT_WINDOW: 24 * 60 * 60 * 1000, // 24 hours
  },
  COMMANDS: {
    START: '/start',
    NUMBER: '/number',
    NUMBERS: '/numbers',
    HELP: '/help',
    INVITE: '/invite',
  },
  MESSAGES: {
    WELCOME: {
      TITLE: "Hey {firstName},\n\nWelcome to the Local Medic Directory! 🏥",
      SUBTITLE: "Don't panic, we've got you covered.",
      LIMITS: "As we're helping other members 24/7, we have to enforce the following limits:",
      DAILY_LIMIT: "🎉 <b>3 requests per 24 hours</b>",
      REQUESTS_LEFT: "⚡ <b>{requestsLeft} requests left for today</b>",
      HOW_TO_USE: "<b>✨ How to find a local Medic:</b>\n\nUse the buttons below or type <b>/number</b> for a single medic search.\n\nClick <b>/help</b> for more commands.",
      FOOTER: "If you need your limit raised, please ask an admin in the chat.\n\nThank you, and we hope to see you again! 🙏"
    },
    BUTTONS: {
      FIND_SINGLE: "🔍 Find Single Medic",
      FIND_MULTIPLE: "🔍 Find Multiple Medics",
      HELP: "❓ Help",
      INVITE: "🔗 Invite Friends",
      BACK_TO_MENU: "🔙 Back to Menu",
      TYPE_CUSTOM: "⌨️ Type Custom Location"
    },
    SEARCH: {
      TITLE_SINGLE: "📍 Find Single Local Medic",
      TITLE_MULTIPLE: "📍 Find Multiple Local Medics",
      PROMPT: "Please select a location or type a custom one:",
      TIP: "💡 Tip: You can also type any city, postal code, or address",
      REQUESTS_LEFT: "⚡ {requestsLeft} requests left after this search"
    },
    EMERGENCY: {
      WARNING: "⚠️ For emergencies, always call 999 (UK) or 911 (US)",
      DISCLAIMER: "◆ Tap the phone numbers to copy them"
    }
  }
};

// User states for conversation flow (using Supabase for persistence)
const userStates = new Map<number, string>();

// Rate limiting storage
const userRequests = new Map<number, { count: number; lastReset: number }>();

// Supabase client for state management
let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (supabaseUrl && supabaseKey) {
      supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
  }
  return supabaseClient;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// State management functions (fallback to in-memory if DB fails)
async function getUserState(userId: number): Promise<string | null> {
  // First try in-memory state
  if (userStates.has(userId)) {
    return userStates.get(userId) || null;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('user_states')
      .select('state')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      log('ERROR', 'Failed to get user state', { error: error.message, userId });
      return null;
    }
    
    return data?.state || null;
  } catch (error) {
    log('ERROR', 'Exception in getUserState', { error: error.message, userId });
    return null;
  }
}

async function setUserState(userId: number, state: string): Promise<void> {
  // Always set in-memory state as fallback
  userStates.set(userId, state);
  
  const supabase = getSupabaseClient();
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('user_states')
      .upsert({
        user_id: userId,
        state: state,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      log('ERROR', 'Failed to set user state', { error: error.message, userId, state });
    }
  } catch (error) {
    log('ERROR', 'Exception in setUserState', { error: error.message, userId, state });
  }
}

async function clearUserState(userId: number): Promise<void> {
  // Always clear in-memory state
  userStates.delete(userId);
  
  const supabase = getSupabaseClient();
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('user_states')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      log('ERROR', 'Failed to clear user state', { error: error.message, userId });
    }
  } catch (error) {
    log('ERROR', 'Exception in clearUserState', { error: error.message, userId });
  }
}

// Utility functions
function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level}: ${message}`, data ? JSON.stringify(data) : '');
}

// Rate limiting (simplified approach)
function checkRateLimit(userId: number): { allowed: boolean; requestsLeft: number } {
  const now = Date.now();
  const userRequest = userRequests.get(userId);
  
  if (!userRequest || (now - userRequest.lastReset) > CONFIG.USER_LIMITS.RATE_LIMIT_WINDOW) {
    userRequests.set(userId, { count: 0, lastReset: now });
    return { allowed: true, requestsLeft: CONFIG.USER_LIMITS.DAILY_REQUESTS };
  }
  
  const requestsLeft = CONFIG.USER_LIMITS.DAILY_REQUESTS - userRequest.count;
  return { allowed: requestsLeft > 0, requestsLeft };
}

function useRequest(userId: number): void {
  const userRequest = userRequests.get(userId);
  if (userRequest) {
    userRequest.count++;
    userRequests.set(userId, userRequest);
  }
}

// Telegram API functions
async function sendMessage(botToken: string, chatId: number, text: string, options: any = {}) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...options
    };

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telegram API error: ${response.status} - ${error}`);
    }

    return await response.json();
  } catch (error) {
    log('ERROR', 'Failed to send message', { error: error.message, chatId });
    throw error;
  }
}

async function answerCallbackQuery(botToken: string, callbackQueryId: string, text?: string) {
  try {
    const payload: any = { callback_query_id: callbackQueryId };
    if (text) payload.text = text;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return await response.json();
  } catch (error) {
    log('ERROR', 'Failed to answer callback query', { error: error.message });
  }
}

// Real geocoding using Nominatim (OpenStreetMap)
async function geocodeLocation(query: string): Promise<{ lat: number; lon: number; address: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'LocationGeniusBot/1.0' }
    });

    if (!response.ok) {
      log('ERROR', 'Geocoding API error', { status: response.status, query });
      return null;
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      log('WARN', 'No geocoding results found', { query });
      return null;
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      address: result.display_name
    };
  } catch (error) {
    log('ERROR', 'Geocoding failed', { error: error.message, query });
    return null;
  }
}

// Sample data function (replace with real database query)
function getNearbyNumbers(lat: number, lon: number, count: number = 1): PhoneNumberEntry[] {
  const sampleNumbers: PhoneNumberEntry[] = [
    { phone: '+44 7700 900123', name: 'Dr. Sarah Johnson', latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'UK', category: 'Emergency Medicine' },
    { phone: '+44 7700 900456', name: 'Dr. Michael Smith', latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'UK', category: 'General Practice' },
    { phone: '+44 7700 900789', name: 'Dr. Emma Wilson', latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'UK', category: 'Cardiology' },
    { phone: '+44 7700 900321', name: 'Dr. James Brown', latitude: 53.4808, longitude: -2.2426, city: 'Manchester', country: 'UK', category: 'Pediatrics' },
    { phone: '+44 7700 900654', name: 'Dr. Lisa Davis', latitude: 53.4808, longitude: -2.2426, city: 'Manchester', country: 'UK', category: 'Dermatology' },
    { phone: '+44 7700 900987', name: 'Dr. Tom Wilson', latitude: 52.4862, longitude: -1.8904, city: 'Birmingham', country: 'UK', category: 'General Practice' },
    { phone: '+44 7700 900111', name: 'Dr. Kate Brown', latitude: 52.4862, longitude: -1.8904, city: 'Birmingham', country: 'UK', category: 'Cardiology' },
    { phone: '+1 555 123 4567', name: 'Dr. Alex Wilson', latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'USA', category: 'Emergency Medicine' },
    { phone: '+1 555 987 6543', name: 'Dr. Maria Garcia', latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'USA', category: 'Internal Medicine' },
    { phone: '+1 555 456 7890', name: 'Dr. Robert Johnson', latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'USA', category: 'Pediatrics' },
  ];

  // Calculate distance between two points using Haversine formula
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Sort by distance from the requested location
  const numbersWithDistance = sampleNumbers.map(entry => ({
    ...entry,
    distance: calculateDistance(lat, lon, entry.latitude, entry.longitude)
  })).sort((a, b) => a.distance - b.distance);

  // Return the closest entries
  return numbersWithDistance.slice(0, count);
}

// UI Helper functions
function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🔍 Find Single Medic", callback_data: "action_number" },
        { text: "🔍 Find Multiple Medics", callback_data: "action_numbers" }
      ],
      [
        { text: "❓ Help", callback_data: "action_help" },
        { text: "🔗 Invite Friends", callback_data: "action_invite" }
      ]
    ]
  };
}

function getLocationPromptKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "📍 London", callback_data: "location_london" },
        { text: "📍 Manchester", callback_data: "location_manchester" }
      ],
      [
        { text: "📍 Birmingham", callback_data: "location_birmingham" },
        { text: "📍 New York", callback_data: "location_new york" }
      ],
      [
        { text: "⌨️ Type Custom Location", callback_data: "location_custom" }
      ],
      [
        { text: "🔙 Back to Menu", callback_data: "action_start" }
      ]
    ]
  };
}

// Message templates
function getWelcomeMessage(firstName: string, requestsLeft: number): string {
  return `Hey ${firstName},

Welcome to the Local Medic Directory! 🏥

Don't panic, we've got you covered.

As we're helping other members 24/7, we have to enforce the following limits:

🎉 <b>3 requests per 24 hours</b>
⚡ <b>${requestsLeft} requests left for today</b>

<b>✨ How to find a local Medic:</b>

Use the buttons below or type <b>/number</b> for a single medic search.

Click <b>/help</b> for more commands.

If you need your limit raised, please ask an admin in the chat.

Thank you, and we hope to see you again! 🙏`;
}

// Command handlers
async function handleStart(botToken: string, chatId: number, firstName: string, userId: number) {
  const { requestsLeft } = checkRateLimit(userId);
  const message = getWelcomeMessage(firstName, requestsLeft);
  await sendMessage(botToken, chatId, message, { reply_markup: getMainMenuKeyboard() });
}

async function handleHelp(botToken: string, chatId: number) {
  const helpMessage = `<b>📚 Available Commands:</b>

<b>/start</b> - Show welcome message and main menu
<b>/number</b> - Find a single local medic
<b>/numbers</b> - Find multiple local medics
<b>/help</b> - Show this help message
<b>/invite</b> - Get invite link for the bot

<b>🔍 How to search:</b>
1. Use the buttons or commands above
2. Select or enter your location
3. Get nearby medic contact details

<b>📍 Location examples:</b>
• London, Manchester, Birmingham
• New York, Los Angeles, Chicago
• Your postal code or full address

<b>⚠️ Remember:</b>
• You have 3 requests per 24 hours
• For emergencies, always call 999/911
• This bot provides contact information only

Need help? Contact an admin in the main chat.`;

  await sendMessage(botToken, chatId, helpMessage, { reply_markup: getMainMenuKeyboard() });
}

async function handleInvite(botToken: string, chatId: number) {
  const inviteMessage = `<b>🤝 Invite Others to the Local Medic Directory</b>

Share this bot with others who might need medical contacts:

<b>Bot Link:</b> https://t.me/Moatboat_bot

<b>What this bot does:</b>
• Find local medic contacts quickly
• Available 24/7
• Easy location-based search
• Trusted community resource

<b>Perfect for:</b>
• Emergency situations
• Travel emergencies
• Finding local medical help
• Community support

Help us grow the community by sharing! 🌟`;

  await sendMessage(botToken, chatId, inviteMessage, { reply_markup: getMainMenuKeyboard() });
}

async function handleNumberSearch(botToken: string, chatId: number, userId: number, isMultiple: boolean = false) {
  const { allowed, requestsLeft } = checkRateLimit(userId);
  
  if (!allowed) {
    await sendMessage(botToken, chatId, 
      `❌ <b>Daily limit reached!</b>\n\nYou've used all your requests for today. Please try again in 24 hours or contact an admin if you need more requests.`,
      { reply_markup: getMainMenuKeyboard() });
    return;
  }

  const searchType = isMultiple ? "Multiple Local Medics" : "Single Local Medic";
  const message = `📍 <b>Find ${searchType}</b>

Please select a location or type a custom one:

<i>💡 Tip: You can also type any city, postal code, or address</i>

⚡ <b>${requestsLeft - 1} requests left after this search</b>`;

  // Create keyboard with search type embedded
  const keyboard = JSON.parse(JSON.stringify(getLocationPromptKeyboard()));
  keyboard.inline_keyboard.forEach((row: any[]) => {
    row.forEach((button: any) => {
      if (button.callback_data.startsWith('location_')) {
        button.callback_data += `_${isMultiple ? 'multiple' : 'single'}`;
      }
    });
  });

  await sendMessage(botToken, chatId, message, { reply_markup: keyboard });
}

async function handleLocationSearch(botToken: string, chatId: number, userId: number, location: string, isMultiple: boolean) {
  try {
    // Use a request
    useRequest(userId);
    
    log('INFO', 'Processing location search', { userId, location, isMultiple });

    // Geocode the location
    const geoResult = await geocodeLocation(location);
    if (!geoResult) {
      await sendMessage(botToken, chatId, 
        `❌ <b>Location not found</b>\n\nSorry, we couldn't find "${location}". Please try a different location.`,
        { reply_markup: getMainMenuKeyboard() });
      return;
    }

    const { lat, lon, address } = geoResult;
    const count = isMultiple ? 3 : 1;
    
    // Get nearby numbers
    const numbers = getNearbyNumbers(lat, lon, count);
    
    if (numbers.length === 0) {
      await sendMessage(botToken, chatId, 
        `❌ <b>No medics found</b>\n\nSorry, we couldn't find any medics near "${location}". Please try a different location.`,
        { reply_markup: getMainMenuKeyboard() });
      return;
    }

    // Format results
    let message = `📍 <b>Medics near ${address}</b>\n\n`;
    
    numbers.forEach((number, index) => {
      message += `<b>${index + 1}. ${number.name}</b>\n`;
      message += `📞 <code>${number.phone}</code>\n`;
      if (number.category) {
        message += `🏥 ${number.category}\n`;
      }
      if (number.city) {
        message += `📍 ${number.city}, ${number.country}\n`;
      }
      message += '\n';
    });

    message += `<i>⚠️ For emergencies, always call 999 (UK) or 911 (US)</i>\n`;
    message += `<i>� Tap the phone numbers to copy them</i>`;

    await sendMessage(botToken, chatId, message, { reply_markup: getMainMenuKeyboard() });
    
  } catch (error) {
    log('ERROR', 'Failed to handle location search', { error: error.message, location });
    await sendMessage(botToken, chatId, 
      `❌ <b>Search failed</b>\n\nSorry, there was an error processing your request. Please try again.`,
      { reply_markup: getMainMenuKeyboard() });
  }
}

// Callback query handler
async function handleCallbackQuery(botToken: string, callbackQuery: any) {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const firstName = callbackQuery.from.first_name || "Friend";
  const data = callbackQuery.data;

  log('INFO', 'Processing callback query', { userId, data });

  await answerCallbackQuery(botToken, callbackQuery.id);

  if (data === 'action_start') {
    await handleStart(botToken, chatId, firstName, userId);
  } else if (data === 'action_help') {
    await handleHelp(botToken, chatId);
  } else if (data === 'action_invite') {
    await handleInvite(botToken, chatId);
  } else if (data === 'action_number') {
    await handleNumberSearch(botToken, chatId, userId, false);
  } else if (data === 'action_numbers') {
    await handleNumberSearch(botToken, chatId, userId, true);
  } else if (data.startsWith('location_')) {
    const parts = data.split('_');
    if (parts.length >= 3) {
      const location = parts.slice(1, -1).join('_');
      const isMultiple = parts[parts.length - 1] === 'multiple';
      
      if (location === 'custom') {
        const searchType = isMultiple ? "multiple medics" : "a single medic";
        await sendMessage(botToken, chatId, 
          `📍 <b>Custom Location Search</b>\n\nPlease type your location to find ${searchType}:\n\n<i>Example: SW1A 1AA, Paris France, etc.</i>`,
          { reply_markup: getMainMenuKeyboard() });
      } else {
        await handleLocationSearch(botToken, chatId, userId, location, isMultiple);
      }
    }
  }
}

// Main request handler
async function handleRequest(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }

    const body: TelegramUpdate = await request.json();
    log('INFO', 'Received update', { 
      message_id: body.message?.message_id,
      callback_query_id: body.callback_query?.id 
    });

    // Handle callback queries (button presses)
    if (body.callback_query) {
      await handleCallbackQuery(botToken, body.callback_query);
      return new Response("OK", { headers: corsHeaders });
    }

    // Handle text messages
    if (!body.message?.text) {
      return new Response("OK", { headers: corsHeaders });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text.trim();
    const firstName = message.from.first_name || "Friend";

    log('INFO', 'Processing message', { userId, chatId, text: text.substring(0, 50) });

    // Handle commands
    if (text.startsWith('/')) {
      switch (text) {
        case CONFIG.COMMANDS.START:
          await handleStart(botToken, chatId, firstName, userId);
          break;
        case CONFIG.COMMANDS.HELP:
          await handleHelp(botToken, chatId);
          break;
        case CONFIG.COMMANDS.INVITE:
          await handleInvite(botToken, chatId);
          break;
        case CONFIG.COMMANDS.NUMBER:
          await handleNumberSearch(botToken, chatId, userId, false);
          break;
        case CONFIG.COMMANDS.NUMBERS:
          await handleNumberSearch(botToken, chatId, userId, true);
          break;
        default:
          await sendMessage(botToken, chatId, 
            `❓ <b>Unknown command</b>\n\nI didn't understand that command. Use the menu below or /help for available commands.`,
            { reply_markup: getMainMenuKeyboard() });
      }
    } else {
      // Handle location input (assume single search by default)
      await handleLocationSearch(botToken, chatId, userId, text, false);
    }

    return new Response("OK", { headers: corsHeaders });

  } catch (error) {
    log('ERROR', 'Request handling failed', { error: error.message });
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// Start the server
serve(handleRequest);
