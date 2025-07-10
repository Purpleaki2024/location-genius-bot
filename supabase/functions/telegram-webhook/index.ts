// Telegram Location Bot - Simple and Reliable Implementation
// This is the main webhook handler for the Telegram bot

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Type definitions
interface TelegramUpdate {
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
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
  VERSION: "3.0.0",
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

function checkRateLimit(userId: number): { allowed: boolean; requestsLeft: number } {
  const now = Date.now();
  const userRequest = userRequests.get(userId);
  
  if (!userRequest || (now - userRequest.lastReset) > CONFIG.USER_LIMITS.RATE_LIMIT_WINDOW) {
    // Reset or initialize
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

// Mock geocoding function (replace with real service in production)
function geocodeLocation(query: string): { lat: number; lon: number; address: string } {
  const locations = {
    'london': { lat: 51.5074, lon: -0.1278, address: 'London, UK' },
    'manchester': { lat: 53.4808, lon: -2.2426, address: 'Manchester, UK' },
    'birmingham': { lat: 52.4862, lon: -1.8904, address: 'Birmingham, UK' },
    'liverpool': { lat: 53.4084, lon: -2.9916, address: 'Liverpool, UK' },
    'leeds': { lat: 53.8008, lon: -1.5491, address: 'Leeds, UK' },
    'new york': { lat: 40.7128, lon: -74.0060, address: 'New York, NY, USA' },
    'los angeles': { lat: 34.0522, lon: -118.2437, address: 'Los Angeles, CA, USA' },
    'chicago': { lat: 41.8781, lon: -87.6298, address: 'Chicago, IL, USA' },
    'paris': { lat: 48.8566, lon: 2.3522, address: 'Paris, France' },
    'berlin': { lat: 52.5200, lon: 13.4050, address: 'Berlin, Germany' },
  };

  const normalizedQuery = query.toLowerCase().trim();
  
  // Exact match
  if (locations[normalizedQuery]) {
    return locations[normalizedQuery];
  }
  
  // Partial match
  for (const [city, coords] of Object.entries(locations)) {
    if (normalizedQuery.includes(city) || city.includes(normalizedQuery)) {
      return coords;
    }
  }
  
  // Default to London
  return locations.london;
}

// Sample data function (replace with real database query)
function getNearbyNumbers(lat: number, lon: number, count: number = 1): PhoneNumberEntry[] {
  // This is sample data - in production, query your database
  const sampleNumbers: PhoneNumberEntry[] = [
    { phone: '+44 7700 900123', name: 'Dr. Sarah Johnson', latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'UK', category: 'Emergency Medicine' },
    { phone: '+44 7700 900456', name: 'Dr. Michael Smith', latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'UK', category: 'General Practice' },
    { phone: '+44 7700 900789', name: 'Dr. Emma Wilson', latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'UK', category: 'Cardiology' },
    { phone: '+44 7700 900321', name: 'Dr. James Brown', latitude: 53.4808, longitude: -2.2426, city: 'Manchester', country: 'UK', category: 'Pediatrics' },
    { phone: '+44 7700 900654', name: 'Dr. Lisa Davis', latitude: 53.4808, longitude: -2.2426, city: 'Manchester', country: 'UK', category: 'Dermatology' },
    { phone: '+1 555 123 4567', name: 'Dr. Alex Wilson', latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'USA', category: 'Emergency Medicine' },
    { phone: '+1 555 987 6543', name: 'Dr. Maria Garcia', latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'USA', category: 'Internal Medicine' },
  ];

  // Simple distance-based filtering (in production, use proper spatial queries)
  return sampleNumbers.slice(0, count);
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

To find a local Medic, simply click <b>/number</b>

Click <b>/help</b> for more commands.

If you need your limit raised, please ask an admin in the chat.

Thank you, and we hope to see you again! 🙏`;
}

function getHelpMessage(): string {
  return `<b>📚 Available Commands:</b>

<b>/start</b> - Show welcome message
<b>/number</b> - Find a single local medic
<b>/numbers</b> - Find multiple local medics
<b>/help</b> - Show this help message
<b>/invite</b> - Get invite link for the bot

<b>🔍 How to search:</b>
1. Use /number or /numbers
2. Enter your location when prompted
3. Get nearby medic contact details

<b>📍 Location examples:</b>
• London
• Manchester
• New York
• Your postal code

<b>⚠️ Remember:</b>
• You have 3 requests per 24 hours
• For emergencies, always call 999/911
• This bot provides contact information only

Need help? Contact an admin in the main chat.`;
}

function getInviteMessage(): string {
  return `<b>🤝 Invite Others to the Local Medic Directory</b>

Share this bot with others who might need medical contacts:

<b>Bot Link:</b> https://t.me/YourBotUsername

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
}

// Command handlers
async function handleStart(botToken: string, chatId: number, firstName: string, userId: number) {
  const { requestsLeft } = checkRateLimit(userId);
  const message = getWelcomeMessage(firstName, requestsLeft);
  await sendMessage(botToken, chatId, message);
}

async function handleHelp(botToken: string, chatId: number) {
  const message = getHelpMessage();
  await sendMessage(botToken, chatId, message);
}

async function handleInvite(botToken: string, chatId: number) {
  const message = getInviteMessage();
  await sendMessage(botToken, chatId, message);
}

async function handleNumber(botToken: string, chatId: number, userId: number) {
  const { allowed, requestsLeft } = checkRateLimit(userId);
  
  if (!allowed) {
    await sendMessage(botToken, chatId, 
      `❌ <b>Daily limit reached!</b>\n\nYou've used all your requests for today. Please try again in 24 hours or contact an admin if you need more requests.`);
    return;
  }

  await setUserState(userId, 'waiting_for_location_single');
  await sendMessage(botToken, chatId, 
    `📍 <b>Find a Local Medic</b>\n\nPlease enter your location (city, postal code, or address):\n\n<i>Example: London, Manchester, SW1A 1AA</i>\n\n⚡ <b>${requestsLeft - 1} requests left after this</b>`);
}

async function handleNumbers(botToken: string, chatId: number, userId: number) {
  const { allowed, requestsLeft } = checkRateLimit(userId);
  
  if (!allowed) {
    await sendMessage(botToken, chatId, 
      `❌ <b>Daily limit reached!</b>\n\nYou've used all your requests for today. Please try again in 24 hours or contact an admin if you need more requests.`);
    return;
  }

  await setUserState(userId, 'waiting_for_location_multiple');
  await sendMessage(botToken, chatId, 
    `📍 <b>Find Multiple Local Medics</b>\n\nPlease enter your location (city, postal code, or address):\n\n<i>Example: London, Manchester, SW1A 1AA</i>\n\n⚡ <b>${requestsLeft - 1} requests left after this</b>`);
}

async function handleLocationQuery(botToken: string, chatId: number, userId: number, query: string, isMultiple: boolean) {
  try {
    // Use request
    useRequest(userId);
    
    // Geocode the location
    const location = geocodeLocation(query);
    const count = isMultiple ? 3 : 1;
    
    // Get nearby numbers
    const numbers = getNearbyNumbers(location.lat, location.lon, count);
    
    if (numbers.length === 0) {
      await sendMessage(botToken, chatId, 
        `❌ <b>No medics found</b>\n\nSorry, we couldn't find any medics near "${query}". Please try a different location or contact an admin.`);
      return;
    }

    // Format results
    let message = `📍 <b>Medics near ${location.address}</b>\n\n`;
    
    numbers.forEach((number, index) => {
      message += `<b>${index + 1}. ${number.name}</b>\n`;
      message += `📞 ${number.phone}\n`;
      if (number.category) {
        message += `🏥 ${number.category}\n`;
      }
      if (number.city) {
        message += `📍 ${number.city}, ${number.country}\n`;
      }
      message += '\n';
    });

    message += `<i>⚠️ For emergencies, always call 999 (UK) or 911 (US)</i>\n`;
    message += `<i>🔄 Use /number or /numbers to search again</i>`;

    await sendMessage(botToken, chatId, message);

    // Clear user state
    await clearUserState(userId);
    
  } catch (error) {
    log('ERROR', 'Failed to handle location query', { error: error.message, query });
    await sendMessage(botToken, chatId, 
      `❌ <b>Search failed</b>\n\nSorry, there was an error processing your request. Please try again or contact an admin.`);
    await clearUserState(userId);
  }
}

// Main request handler
async function handleRequest(request: Request): Promise<Response> {
  // Handle CORS preflight
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
    log('INFO', 'Received update', { message_id: body.message?.message_id });

    // Only process text messages
    if (!body.message?.text) {
      return new Response("OK", { headers: corsHeaders });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text.trim();
    const firstName = message.from.first_name || "Friend";

    log('INFO', 'Processing message', { userId, chatId, text: text.substring(0, 50) });

    // Check if user is in a conversation state
    const userState = await getUserState(userId);
    
    if (userState === 'waiting_for_location_single') {
      await handleLocationQuery(botToken, chatId, userId, text, false);
      return new Response("OK", { headers: corsHeaders });
    }
    
    if (userState === 'waiting_for_location_multiple') {
      await handleLocationQuery(botToken, chatId, userId, text, true);
      return new Response("OK", { headers: corsHeaders });
    }

    // Handle commands
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
        await handleNumber(botToken, chatId, userId);
        break;
        
      case CONFIG.COMMANDS.NUMBERS:
        await handleNumbers(botToken, chatId, userId);
        break;
        
      default:
        await sendMessage(botToken, chatId, 
          `❓ <b>Unknown command</b>\n\nI didn't understand that command. Use /help to see available commands.`);
    }

    return new Response("OK", { headers: corsHeaders });

  } catch (error) {
    log('ERROR', 'Request handling failed', { error: error.message });
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// Start the server
serve(handleRequest);
