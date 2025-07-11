// Production-Ready Telegram Location Bot
// Stateless implementation for reliable serverless operation

/// <reference types="https://deno.land/x/deno@1.28.0/lib/deno.ns.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { BOT_CONFIG } from "./config.ts";

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

interface Region {
  id: string;
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  emoji: string;
  display_order: number;
}

interface RegionLocation {
  id: string;
  region_id: string;
  location_name: string;
  location_code: string;
  latitude?: number;
  longitude?: number;
  display_order: number;
}

interface MedicalContact {
  id: string;
  region_id?: string;
  location_id?: string;
  name: string;
  phone: string;
  email?: string;
  specialty?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  is_emergency: boolean;
}

// Configuration - imported from config.ts
const CONFIG = BOT_CONFIG;

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

// Get nearby medical contacts from database
async function getNearbyNumbers(lat: number, lon: number, count: number = 1): Promise<PhoneNumberEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    log('ERROR', 'Supabase client not available, falling back to sample data');
    return getFallbackNumbers(lat, lon, count);
  }

  try {
    // Query medical contacts from database
    const { data: contacts, error } = await supabase
      .from('medical_contacts')
      .select(`
        name,
        phone,
        specialty,
        address,
        latitude,
        longitude,
        is_emergency,
        region_locations!inner (
          location_name,
          regions!inner (
            country_name
          )
        )
      `)
      .eq('is_active', true)
      .order('is_emergency', { ascending: false }); // Emergency contacts first

    if (error) {
      log('ERROR', 'Failed to fetch medical contacts from database', { error: error.message });
      return getFallbackNumbers(lat, lon, count);
    }

    if (!contacts || contacts.length === 0) {
      log('WARN', 'No medical contacts found in database, using fallback');
      return getFallbackNumbers(lat, lon, count);
    }

    // Convert to PhoneNumberEntry format and calculate distances
    const phoneEntries: PhoneNumberEntry[] = contacts
      .filter(contact => contact.latitude && contact.longitude)
      .map(contact => ({
        phone: contact.phone,
        name: contact.name,
        latitude: contact.latitude!,
        longitude: contact.longitude!,
        city: contact.region_locations?.location_name || 'Unknown',
        country: contact.region_locations?.regions?.country_name || 'UK',
        category: contact.specialty || 'Medical Services',
        distance: calculateDistance(lat, lon, contact.latitude!, contact.longitude!)
      }));

    // Sort by distance and return closest entries
    return phoneEntries
      .sort((a, b) => a.distance! - b.distance!)
      .slice(0, count);

  } catch (error) {
    log('ERROR', 'Exception in getNearbyNumbers', { error: error.message });
    return getFallbackNumbers(lat, lon, count);
  }
}

// Fallback function with sample data
function getFallbackNumbers(lat: number, lon: number, count: number = 1): PhoneNumberEntry[] {
  const sampleNumbers: PhoneNumberEntry[] = [
    // North East - All use same contact info with different cities
    { phone: '+44 799 9877582', name: 'Top Shagger NE', latitude: 54.9783, longitude: -1.6178, city: 'Newcastle upon Tyne', country: 'UK', category: 'Medical Supplies 11am-12pm' },
    { phone: '+44 799 9877582', name: 'Durham Medics', latitude: 54.7761, longitude: -1.5733, city: 'Durham', country: 'UK', category: 'Medical Supplies 11am-12pm' },
    { phone: '+44 799 9877582', name: 'Sunderland Health', latitude: 54.9069, longitude: -1.3838, city: 'Sunderland', country: 'UK', category: 'Medical Supplies 11am-12pm' },
    { phone: '+44 799 9877582', name: 'Middlesbrough Care', latitude: 54.5742, longitude: -1.2351, city: 'Middlesbrough', country: 'UK', category: 'Medical Supplies 11am-12pm' },
    
    // Other UK cities
    { phone: '+44 7700 900123', name: 'Dr. Sarah Johnson', latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'UK', category: 'Emergency Medicine' },
    { phone: '+44 7700 900321', name: 'Dr. James Brown', latitude: 53.4808, longitude: -2.2426, city: 'Manchester', country: 'UK', category: 'Pediatrics' },
    { phone: '+44 7700 900987', name: 'Dr. Tom Wilson', latitude: 52.4862, longitude: -1.8904, city: 'Birmingham', country: 'UK', category: 'General Practice' },
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

// Helper function to calculate distance between coordinates
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

// UI Helper functions
function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: CONFIG.MESSAGES.BUTTONS.FIND_SINGLE, callback_data: "action_number" },
        { text: CONFIG.MESSAGES.BUTTONS.FIND_MULTIPLE, callback_data: "action_numbers" }
      ],
      [
        { text: CONFIG.MESSAGES.BUTTONS.HELP, callback_data: "action_help" },
        { text: CONFIG.MESSAGES.BUTTONS.INVITE, callback_data: "action_invite" }
      ]
    ]
  };
}

function getCountrySelectionKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England", callback_data: "country_england" },
        { text: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland", callback_data: "country_scotland" }
      ],
      [
        { text: "🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales", callback_data: "country_wales" },
        { text: "🇮🇪 Ireland", callback_data: "country_ireland" }
      ],
      [
        { text: CONFIG.MESSAGES.BUTTONS.TYPE_CUSTOM, callback_data: "location_custom" }
      ],
      [
        { text: CONFIG.MESSAGES.BUTTONS.BACK_TO_MENU, callback_data: "action_start" }
      ]
    ]
  };
}

async function getRegionalKeyboard(countryCode: string) {
  log('INFO', 'Getting regional keyboard', { countryCode });
  
  // Always try config-based regions first as fallback
  const countryData = CONFIG.REGIONS[countryCode];
  if (countryData && countryData.regions) {
    log('INFO', 'Using config-based regions', { countryCode, regionCount: countryData.regions.length });
    
    const keyboard: any[][] = [];
    for (let i = 0; i < countryData.regions.length; i += 2) {
      const row = [
        { text: countryData.regions[i].text, callback_data: `region_${countryData.regions[i].value}` }
      ];
      if (i + 1 < countryData.regions.length) {
        row.push({ text: countryData.regions[i + 1].text, callback_data: `region_${countryData.regions[i + 1].value}` });
      }
      keyboard.push(row);
    }
    
    keyboard.push([
      { text: CONFIG.MESSAGES.BUTTONS.TYPE_CUSTOM, callback_data: "location_custom" }
    ]);
    keyboard.push([
      { text: "🔙 Back to Countries", callback_data: "show_countries" },
      { text: CONFIG.MESSAGES.BUTTONS.BACK_TO_MENU, callback_data: "action_start" }
    ]);
    
    return { inline_keyboard: keyboard };
  }

  // Try database if config doesn't have the country
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: regions, error } = await supabase
        .from('regions')
        .select('*')
        .eq('country_code', countryCode)
        .eq('is_active', true)
        .order('display_order');

      if (!error && regions && regions.length > 0) {
        log('INFO', 'Using database regions', { countryCode, regionCount: regions.length });
        
        const keyboard: any[][] = [];
        for (let i = 0; i < regions.length; i += 2) {
          const row = [
            { text: `${regions[i].emoji} ${regions[i].region_name}`, callback_data: `region_${regions[i].region_code}` }
          ];
          if (i + 1 < regions.length) {
            row.push({ text: `${regions[i + 1].emoji} ${regions[i + 1].region_name}`, callback_data: `region_${regions[i + 1].region_code}` });
          }
          keyboard.push(row);
        }
        
        keyboard.push([
          { text: CONFIG.MESSAGES.BUTTONS.TYPE_CUSTOM, callback_data: "location_custom" }
        ]);
        keyboard.push([
          { text: "🔙 Back to Countries", callback_data: "show_countries" },
          { text: CONFIG.MESSAGES.BUTTONS.BACK_TO_MENU, callback_data: "action_start" }
        ]);
        
        return { inline_keyboard: keyboard };
      } else {
        log('ERROR', 'Failed to fetch regions from database', { error: error?.message, countryCode });
      }
    } catch (error: any) {
      log('ERROR', 'Exception in getRegionalKeyboard', { error: error.message, countryCode });
    }
  }

  // Final fallback - return to country selection with error message
  log('ERROR', 'No regions found for country', { countryCode });
  return getCountrySelectionKeyboard();
}

async function getLocationKeyboard(regionCode: string) {
  log('INFO', 'Getting location keyboard', { regionCode });
  
  // Always try config-based locations first as fallback
  for (const country of Object.values(CONFIG.REGIONS)) {
    const region = country.regions.find(r => r.value === regionCode);
    if (region && region.cities) {
      log('INFO', 'Using config-based locations', { regionCode, cityCount: region.cities.length });
      
      const keyboard: any[][] = [];
      for (let i = 0; i < region.cities.length; i += 2) {
        const row = [
          { text: `📍 ${region.cities[i]}`, callback_data: `location_${region.cities[i].toLowerCase().replace(/\s+/g, '_')}` }
        ];
        if (i + 1 < region.cities.length) {
          row.push({ text: `📍 ${region.cities[i + 1]}`, callback_data: `location_${region.cities[i + 1].toLowerCase().replace(/\s+/g, '_')}` });
        }
        keyboard.push(row);
      }
      
      keyboard.push([
        { text: CONFIG.MESSAGES.BUTTONS.TYPE_CUSTOM, callback_data: "location_custom" }
      ]);
      
      // Find which country this region belongs to for proper back navigation
      let countryCode = '';
      for (const [countryKey, countryData] of Object.entries(CONFIG.REGIONS)) {
        if (countryData.regions.find(r => r.value === regionCode)) {
          countryCode = countryKey;
          break;
        }
      }
      
      keyboard.push([
        { text: "🔙 Back to Regions", callback_data: `country_${countryCode}` },
        { text: CONFIG.MESSAGES.BUTTONS.BACK_TO_MENU, callback_data: "action_start" }
      ]);
      
      return { inline_keyboard: keyboard };
    }
  }

  // Try database if config doesn't have the region
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: locations, error } = await supabase
        .from('region_locations')
        .select(`
          *,
          regions!inner (
            region_code
          )
        `)
        .eq('regions.region_code', regionCode)
        .eq('is_active', true)
        .order('display_order');

      if (!error && locations && locations.length > 0) {
        log('INFO', 'Using database locations', { regionCode, locationCount: locations.length });
        
        const keyboard: any[][] = [];
        for (let i = 0; i < locations.length; i += 2) {
          const row = [
            { text: `📍 ${locations[i].location_name}`, callback_data: `location_${locations[i].location_code}` }
          ];
          if (i + 1 < locations.length) {
            row.push({ text: `📍 ${locations[i + 1].location_name}`, callback_data: `location_${locations[i + 1].location_code}` });
          }
          keyboard.push(row);
        }
        
        keyboard.push([
          { text: CONFIG.MESSAGES.BUTTONS.TYPE_CUSTOM, callback_data: "location_custom" }
        ]);
        keyboard.push([
          { text: "🔙 Back to Regions", callback_data: "show_countries" },
          { text: CONFIG.MESSAGES.BUTTONS.BACK_TO_MENU, callback_data: "action_start" }
        ]);
        
        return { inline_keyboard: keyboard };
      } else {
        log('ERROR', 'Failed to fetch locations from database', { error: error?.message, regionCode });
      }
    } catch (error: any) {
      log('ERROR', 'Exception in getLocationKeyboard', { error: error.message, regionCode });
    }
  }

  // Final fallback - return to country selection
  log('ERROR', 'No locations found for region', { regionCode });
  return getCountrySelectionKeyboard();
}

function getLocationPromptKeyboard() {
  // This function is now replaced by getCountrySelectionKeyboard()
  return getCountrySelectionKeyboard();
}

// Message templates
function getWelcomeMessage(firstName: string, requestsLeft: number): string {
  const welcome = CONFIG.MESSAGES.WELCOME;
  return `${welcome.TITLE.replace('{firstName}', firstName)}

${welcome.SUBTITLE}

${welcome.LIMITS}

${welcome.DAILY_LIMIT}
${welcome.REQUESTS_LEFT.replace('{requestsLeft}', requestsLeft.toString())}

${welcome.HOW_TO_USE}

${welcome.FOOTER}`;
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

  const searchTitle = isMultiple ? CONFIG.MESSAGES.SEARCH.TITLE_MULTIPLE : CONFIG.MESSAGES.SEARCH.TITLE_SINGLE;
  const message = `${searchTitle}

${CONFIG.MESSAGES.SEARCH.PROMPT}

<i>${CONFIG.MESSAGES.SEARCH.TIP}</i>

${CONFIG.MESSAGES.SEARCH.REQUESTS_LEFT.replace('{requestsLeft}', (requestsLeft - 1).toString())}`;

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
    
    // Get nearby numbers (now async)
    const numbers = await getNearbyNumbers(lat, lon, count);
    
    if (numbers.length === 0) {
      await sendMessage(botToken, chatId, 
        `❌ <b>No medics found</b>\n\nSorry, we couldn't find any medics near "${location}". Please try a different location.`,
        { reply_markup: getMainMenuKeyboard() });
      return;
    }

    // Format results with updated styling for North East locations
    let message = `📍 <b>Medics near ${address}</b>\n\n`;
    
    numbers.forEach((number, index) => {
      const isNorthEastSpecial = ['Top Shagger NE', 'Durham Medics', 'Sunderland Health', 'Middlesbrough Care'].includes(number.name);
      
      if (isNorthEastSpecial) {
        // Special formatting for North East locations as per your requirements
        message += `<b>${index + 1}. ${number.name}</b>\n`;
        message += `📞 <code>${number.phone}</code>\n`;
        message += `🏥 ${number.category}\n`;
        message += `📍 ${number.city}, ${number.country}\n\n`;
        
        // All North East locations use the same start message
        message += `⚠️ Start message with "John Topper sent you"\n`;
        message += `Tap the phone numbers to copy them\n\n`;
      } else {
        // Standard formatting for other locations
        message += `<b>${index + 1}. ${number.name}</b>\n`;
        message += `📞 <code>${number.phone}</code>\n`;
        if (number.category) {
          message += `🏥 ${number.category}\n`;
        }
        if (number.city) {
          message += `📍 ${number.city}, ${number.country}\n`;
        }
        message += '\n';
      }
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
  } else if (data === 'show_countries') {
    const keyboard = getCountrySelectionKeyboard();
    await sendMessage(botToken, chatId, 
      `${CONFIG.MESSAGES.SEARCH.TITLE_SINGLE}\n\n${CONFIG.MESSAGES.SEARCH.PROMPT}\n\n${CONFIG.MESSAGES.SEARCH.TIP}`,
      { reply_markup: keyboard });
  } else if (data.startsWith('country_')) {
    const countryCode = data.replace('country_', '');
    const keyboard = await getRegionalKeyboard(countryCode);
    const countryName = CONFIG.REGIONS[countryCode]?.name || countryCode;
    await sendMessage(botToken, chatId, 
      `🗺️ <b>Select a region in ${countryName}</b>\n\nChoose your region or type a custom location:`,
      { reply_markup: keyboard });
  } else if (data.startsWith('region_')) {
    const regionCode = data.replace('region_', '');
    const keyboard = await getLocationKeyboard(regionCode);
    
    // Find the region name for display
    let regionName = regionCode;
    let countryName = '';
    for (const [countryKey, countryData] of Object.entries(CONFIG.REGIONS)) {
      const region = countryData.regions.find(r => r.value === regionCode);
      if (region) {
        regionName = region.text;
        countryName = countryData.name;
        break;
      }
    }
    
    await sendMessage(botToken, chatId, 
      `📍 <b>Select a location in ${regionName}</b>\n\nChoose your city/town or type a custom location:`,
      { reply_markup: keyboard });
  } else if (data === 'show_regions') {
    // Navigate back to country selection since we don't store the previous country
    const keyboard = getCountrySelectionKeyboard();
    await sendMessage(botToken, chatId, 
      `${CONFIG.MESSAGES.SEARCH.TITLE_SINGLE}\n\n${CONFIG.MESSAGES.SEARCH.PROMPT}\n\n${CONFIG.MESSAGES.SEARCH.TIP}`,
      { reply_markup: keyboard });
  } else if (data.startsWith('location_')) {
    const parts = data.split('_');
    if (parts.length >= 2) {
      let location = parts.slice(1).join('_');
      
      if (location === 'custom') {
        await sendMessage(botToken, chatId, 
          `📍 <b>Custom Location Search</b>\n\nPlease type your location to find a medic:\n\n<i>Example: SW1A 1AA, Paris France, etc.</i>`,
          { reply_markup: getMainMenuKeyboard() });
      } else {
        // Convert location code back to readable name
        location = location.replace(/_/g, ' ');
        // Capitalize first letter of each word
        location = location.replace(/\b\w/g, l => l.toUpperCase());
        
        log('INFO', 'Processing location selection', { userId, location });
        await handleLocationSearch(botToken, chatId, userId, location, false);
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
    const text = message.text?.trim() || '';
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
