// Enhanced Telegram Webhook with /number and /numbers commands
// This file replaces the existing index.ts to add the missing functionality

// Type definitions for Deno and Supabase
// @deno-types="./deno.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "./supabaseClient.ts";
import type {
  TelegramUpdate,
  TelegramMessage,
  SupabaseClient,
  UserState,
} from "./types.ts";

// Add Node.js type definitions
// Added @types/node to recognize process object

// Define CORS headers
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
  VERSION: "2.0.0", // Updated version with number commands
  LOGGING: {
    ENABLED: true,
    LEVEL: "INFO",
    MAX_MESSAGE_LENGTH: 1000,
    INCLUDE_USER_DATA: false,
  },
  USER_LIMITS: {
    DAILY_REQUESTS: 3,
    RATE_LIMIT_WINDOW: 24 * 60 * 60 * 1000, // 24 hours in ms
  }
};

// Allowed commands for the bot
const ALLOWED_COMMANDS = new Set(['start', 'number', 'invite', 'numbers', 'help']);

// Logging utility class
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  userId?: string;
  chatId?: string;
  command?: string;
  error?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class BotLogger {
  private static instance: BotLogger;
  private supabase: SupabaseClient | null = null;

  private constructor() {}

  static getInstance(): BotLogger {
    if (!BotLogger.instance) {
      BotLogger.instance = new BotLogger();
    }
    return BotLogger.instance;
  }

  setSupabase(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  private async logToDatabase(entry: LogEntry): Promise<void> {
    if (!this.supabase || !CONFIG.LOGGING.ENABLED) return;

    try {
      const { error } = await this.supabase
        .from('bot_logs')
        .insert({
          timestamp: entry.timestamp,
          level: entry.level,
          message: entry.message.substring(0, CONFIG.LOGGING.MAX_MESSAGE_LENGTH),
          user_id: entry.userId,
          chat_id: entry.chatId,
          command: entry.command,
          error_message: entry.error,
          duration_ms: entry.duration,
          metadata: entry.metadata
        });

      if (error) {
        console.error('Failed to log to database:', error);
      }
    } catch (error) {
      console.error('Error in database logging:', error);
    }
  }

  async logInfo(message: string, userId?: string, chatId?: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      userId,
      chatId,
      metadata
    };

    console.log(`[INFO] ${message}`, metadata ? { metadata } : '');
    await this.logToDatabase(entry);
  }

  async logCommand(command: string, userId?: string, chatId?: string, duration?: number): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: `Command executed: ${command}`,
      userId,
      chatId,
      command,
      duration
    };

    console.log(`[COMMAND] ${command} executed in ${duration}ms`);
    await this.logToDatabase(entry);
  }

  async logError(message: string, error: Error, userId?: string, chatId?: string, command?: string): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      userId,
      chatId,
      command,
      error: error.message
    };

    console.error(`[ERROR] ${message}:`, error);
    await this.logToDatabase(entry);
  }

  async logWarning(message: string, userId?: string, chatId?: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      userId,
      chatId,
      metadata
    };

    console.warn(`[WARN] ${message}`, metadata ? { metadata } : '');
    await this.logToDatabase(entry);
  }

  async logDebug(message: string, metadata?: Record<string, unknown>): Promise<void> {
    if (CONFIG.LOGGING.LEVEL !== 'DEBUG') return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      message,
      metadata
    };

    console.debug(`[DEBUG] ${message}`, metadata ? { metadata } : '');
    await this.logToDatabase(entry);
  }
}

// User State Management
class UserStateManager {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getUserState(telegramUserId: string): Promise<UserState | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_states')
        .select('*')
        .eq('telegram_user_id', telegramUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error getting user state:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserState:', error);
      return null;
    }
  }

  async setUserState(telegramUserId: string, state: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_states')
        .upsert({
          telegram_user_id: telegramUserId,
          state,
          metadata,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error setting user state:', error);
      }
    } catch (error) {
      console.error('Error in setUserState:', error);
    }
  }

  async clearUserState(telegramUserId: string): Promise<void> {
    await this.setUserState(telegramUserId, 'start');
  }
}

// Helper function to validate Telegram update structure
function validateTelegramUpdate(update: unknown): update is TelegramUpdate {
  if (!update || typeof update !== 'object') return false;
  const u = update as Record<string, unknown>;
  if (!u.message || typeof u.message !== 'object') return false;
  const message = u.message as Record<string, unknown>;
  if (!message.from || !message.chat) return false;
  return true;
}

// Security: Input sanitization for search queries
function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  
  const trimmed = query.trim().substring(0, CONFIG.MAX_QUERY_LENGTH);
  const sanitized = trimmed.replace(/[^a-zA-Z0-9\s\-.,#&'()]/g, '');
  return sanitized.replace(/\s+/g, ' ').trim();
}

// Rate limiting check
async function checkRateLimit(supabase: SupabaseClient, userId: string): Promise<{ allowed: boolean; requestsLeft: number }> {
  try {
    const since = new Date(Date.now() - CONFIG.USER_LIMITS.RATE_LIMIT_WINDOW).toISOString();
    
    const { data, error } = await supabase
      .from('location_searches')
      .select('id')
      .eq('telegram_user_id', userId)
      .gte('created_at', since);

    if (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true, requestsLeft: CONFIG.USER_LIMITS.DAILY_REQUESTS };
    }

    const requestCount = data?.length || 0;
    const requestsLeft = Math.max(0, CONFIG.USER_LIMITS.DAILY_REQUESTS - requestCount);
    
    return { 
      allowed: requestCount < CONFIG.USER_LIMITS.DAILY_REQUESTS, 
      requestsLeft 
    };
  } catch (error) {
    console.error('Error in rate limit check:', error);
    return { allowed: true, requestsLeft: CONFIG.USER_LIMITS.DAILY_REQUESTS };
  }
}

// Get welcome message with rate limit info
async function getWelcomeMessage(supabase: SupabaseClient, userId: string): Promise<string> {
  const { requestsLeft } = await checkRateLimit(supabase, userId);
  
  const baseMessage = `Hey,

Welcome to the find a local Medic directory, Don't panic we got you covered.

As we are helping other members 24/7 in the Medic chat we have to enforce the following limits:

🎉 ${CONFIG.USER_LIMITS.DAILY_REQUESTS} requests per 24hrs
⚡ ${requestsLeft} requests left for today

✨ <b>How to find a local Medic</b>

To find a local Medic simply click <b>/number</b>

Click <b>/help</b> for an array of other, tempting commands.

If you need your limit raised for whatever please ask an admin in the chat or press <b>/help</b>

Thank you, and we hope to see you again

🎉 ${CONFIG.USER_LIMITS.DAILY_REQUESTS} requests per 24hrs
⚡ ${requestsLeft} requests left for today`;

  return baseMessage;
}

// Geocoding function (mock implementation - replace with real geocoding service)
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number; address: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Failed to fetch geocoding data:', response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.length === 0) {
      console.warn('No results found for address:', address);
      return null;
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      address: result.display_name,
    };
  } catch (error) {
    console.error('Error in geocoding:', error);
    return null;
  }
}

// Add missing type definition for NumberSearchResult
interface NumberSearchResult {
  phone_number: string;
  user_name: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
}

// Find closest phone numbers in database
async function findClosestNumbers(
  supabase: SupabaseClient, 
  lat: number, 
  lon: number, 
  limit: number = 1
): Promise<NumberSearchResult[]> {
  try {
    // Query medical contacts from database
    const { data, error } = await supabase
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
      .order('is_emergency', { ascending: false })
      .limit(limit * 2); // Get more to filter by distance

    if (error) {
      console.error('Error finding medical contacts:', error);
      return getFallbackContacts(lat, lon, limit);
    }

    if (!data || data.length === 0) {
      return getFallbackContacts(lat, lon, limit);
    }

    // Calculate distances and sort
    const results = data
      .filter(contact => contact.latitude && contact.longitude)
      .map(contact => ({
        phone_number: contact.phone,
        user_name: contact.name,
        latitude: contact.latitude!,
        longitude: contact.longitude!,
        distance_km: calculateDistance(lat, lon, contact.latitude!, contact.longitude!),
        specialty: contact.specialty || 'Medical Services',
        location: contact.region_locations?.location_name || 'Unknown'
      }))
      .sort((a, b) => a.distance_km! - b.distance_km!)
      .slice(0, limit);

    return results;
  } catch (error) {
    console.error('Error in findClosestNumbers:', error);
    return getFallbackContacts(lat, lon, limit);
  }
}

// Fallback contacts when database is unavailable
function getFallbackContacts(lat: number, lon: number, limit: number = 1): NumberSearchResult[] {
  const fallbackContacts = [
    // North East - Updated with specific requirements
    { phone_number: '+44 799 9877582', user_name: 'Top Shagger NE', latitude: 54.9783, longitude: -1.6178, specialty: 'Medical Supplies 11am-12pm', location: 'Newcastle upon Tyne' },
    { phone_number: '+44 799 1234567', user_name: 'Durham Medics', latitude: 54.7761, longitude: -1.5733, specialty: 'Medical Supplies 10am-11am', location: 'Durham' },
    { phone_number: '+44 799 7654321', user_name: 'Sunderland Health', latitude: 54.9069, longitude: -1.3838, specialty: 'Medical Supplies 1pm-2pm', location: 'Sunderland' },
    { phone_number: '+44 799 1122334', user_name: 'Middlesbrough Care', latitude: 54.5742, longitude: -1.2351, specialty: 'Medical Supplies 3pm-4pm', location: 'Middlesbrough' },
    
    // Other UK locations
    { phone_number: '+44 7700 900123', user_name: 'Dr. Sarah Johnson', latitude: 51.5074, longitude: -0.1278, specialty: 'Emergency Medicine', location: 'London' },
    { phone_number: '+44 7700 900321', user_name: 'Dr. James Brown', latitude: 53.4808, longitude: -2.2426, specialty: 'Pediatrics', location: 'Manchester' },
  ];

  return fallbackContacts
    .map(contact => ({
      ...contact,
      distance_km: calculateDistance(lat, lon, contact.latitude, contact.longitude)
    }))
    .sort((a, b) => a.distance_km! - b.distance_km!)
    .slice(0, limit);
}

// Helper function to calculate distance
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

// Send Telegram message
async function sendTelegramMessage(
  botToken: string,
  method: string,
  payload: Record<string, unknown>
): Promise<Response> {
  const url = `https://api.telegram.org/bot${botToken}/${method}`;
  
  return await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// Ensure user exists in database
async function ensureUser(supabase: SupabaseClient, telegramUser: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('telegram_users')
      .upsert({
        telegram_id: telegramUser.id.toString(),
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        is_active: true,
        last_seen: new Date().toISOString()
      });

    if (error) {
      console.error('Error ensuring user:', error);
    }
  } catch (error) {
    console.error('Error in ensureUser:', error);
  }
}

// Handler: Process /start command
async function handleStartCommand(
  supabase: SupabaseClient,
  telegramBotToken: string,
  message: TelegramMessage,
  stateManager: UserStateManager
): Promise<void> {
  const logger = BotLogger.getInstance();
  const startTime = Date.now();
  const userId = message.from?.id?.toString();
  const chatId = message.chat.id.toString();

  try {
    await logger.logInfo("Start command initiated", userId, chatId);

    // Set user state to start
    if (userId) {
      await stateManager.setUserState(userId, 'start');
    }

    // Ensure user exists in database
    if (message.from) {
      await ensureUser(supabase, message.from);
    }

    const welcomeMessage = await getWelcomeMessage(supabase, userId || '');
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: welcomeMessage,
      parse_mode: "HTML"
    });

    const duration = Date.now() - startTime;
    await logger.logCommand("/start", userId, chatId, duration);
  } catch (error) {
    await logger.logError("Error in start command", error as Error, userId, chatId, "/start");
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "Welcome to the Location Finder Bot! Use /help to see available commands."
    });
  }
}

// Handler: Process /number command
async function handleNumberCommand(
  supabase: SupabaseClient,
  telegramBotToken: string,
  message: TelegramMessage,
  stateManager: UserStateManager
): Promise<void> {
  const logger = BotLogger.getInstance();
  const startTime = Date.now();
  const userId = message.from?.id?.toString();
  const chatId = message.chat.id.toString();

  try {
    await logger.logInfo("Number command initiated", userId, chatId);

    // Check rate limit
    const { allowed } = await checkRateLimit(supabase, userId || '');
    if (!allowed) {
      await sendTelegramMessage(telegramBotToken, "sendMessage", {
        chat_id: message.chat.id,
        text: "❌ You've reached your daily limit of requests. Please try again tomorrow."
      });
      return;
    }

    // Ensure user exists
    if (message.from) {
      await ensureUser(supabase, message.from);
    }

    // Set user state to awaiting location
    if (userId) {
      await stateManager.setUserState(userId, 'awaiting_location');
    }

    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "📍 Please enter a location or postcode to search for numbers near you."
    });

    const duration = Date.now() - startTime;
    await logger.logCommand("/number", userId, chatId, duration);
  } catch (error) {
    await logger.logError("Error in number command", error as Error, userId, chatId, "/number");
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "❌ An error occurred. Please try again later."
    });
  }
}

// Handler: Process /numbers command  
async function handleNumbersCommand(
  supabase: SupabaseClient,
  telegramBotToken: string,
  message: TelegramMessage,
  stateManager: UserStateManager
): Promise<void> {
  const logger = BotLogger.getInstance();
  const startTime = Date.now();
  const userId = message.from?.id?.toString();
  const chatId = message.chat.id.toString();

  try {
    await logger.logInfo("Numbers command initiated", userId, chatId);

    // Check rate limit
    const { allowed } = await checkRateLimit(supabase, userId || '');
    if (!allowed) {
      await sendTelegramMessage(telegramBotToken, "sendMessage", {
        chat_id: message.chat.id,
        text: "❌ You've reached your daily limit of requests. Please try again tomorrow."
      });
      return;
    }

    // Ensure user exists
    if (message.from) {
      await ensureUser(supabase, message.from);
    }

    // Set user state to awaiting location for numbers
    if (userId) {
      await stateManager.setUserState(userId, 'awaiting_location_numbers');
    }

    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "📍 Please enter a location or postcode to search for multiple numbers near you."
    });

    const duration = Date.now() - startTime;
    await logger.logCommand("/numbers", userId, chatId, duration);
  } catch (error) {
    await logger.logError("Error in numbers command", error as Error, userId, chatId, "/numbers");
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "❌ An error occurred. Please try again later."
    });
  }
}

// Handler: Process location query for single number
async function handleSingleNumberQuery(
  supabase: SupabaseClient,
  telegramBotToken: string,
  message: TelegramMessage,
  stateManager: UserStateManager
): Promise<void> {
  const logger = BotLogger.getInstance();
  const userId = message.from?.id?.toString();
  const chatId = message.chat.id.toString();
  const locationQuery = sanitizeSearchQuery(message.text || '');

  try {
    await logger.logInfo("Processing single number location query", userId, chatId, { query: locationQuery });

    // Geocode the location
    const geoResult = await geocodeAddress(locationQuery);
    if (!geoResult) {
      await sendTelegramMessage(telegramBotToken, "sendMessage", {
        chat_id: message.chat.id,
        text: `❌ Could not find any location for: ${locationQuery}`
      });
      return;
    }

    const { lat, lon, address } = geoResult;

    // Find the closest phone number
    const numbers = await findClosestNumbers(supabase, lat, lon, 1);
    if (!numbers || numbers.length === 0) {
      await sendTelegramMessage(telegramBotToken, "sendMessage", {
        chat_id: message.chat.id,
        text: "No records found near that location."
      });
      return;
    }

    const phoneNumber = numbers[0];
    const isNorthEastSpecial = ['Top Shagger NE', 'Durham Medics', 'Sunderland Health', 'Middlesbrough Care'].includes(phoneNumber.user_name);
    
    let specialMessage = '';
    if (isNorthEastSpecial) {
      if (phoneNumber.user_name === 'Top Shagger NE') {
        specialMessage = '\n⚠️ Start message with "John Topper sent you"\nTap the phone numbers to copy them';
      } else if (phoneNumber.user_name === 'Durham Medics') {
        specialMessage = '\n⚠️ Start message with "Dr. Smith recommended you"\nTap the phone numbers to copy them';
      } else if (phoneNumber.user_name === 'Sunderland Health') {
        specialMessage = '\n⚠️ Start message with "Nurse Jane referred you"\nTap the phone numbers to copy them';
      } else if (phoneNumber.user_name === 'Middlesbrough Care') {
        specialMessage = '\n⚠️ Start message with "Dr. Brown sent you"\nTap the phone numbers to copy them';
      }
    }
    
    const reply = `Hello ${message.from?.first_name || message.from?.username || 'there'},

Here is 1 number near: ${address}

⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️
<b>${phoneNumber.user_name}</b>
<a href='tel:${phoneNumber.phone_number}'>${phoneNumber.phone_number}</a>${specialMessage || '\n🔒 Start your message on WhatsApp with password NIGELLA to get the full menu'}
⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️

✂️ Tap the number to copy
⚠️ All distances are approximate
⚠️ Use at your own risk. Never pay upfront.`;

    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: reply,
      parse_mode: "HTML"
    });

    // Log the search
    await supabase.from('location_searches').insert({
      telegram_user_id: userId,
      query: locationQuery,
      latitude: lat.toString(),
      longitude: lon.toString(),
      query_type: 'single_number',
      success: true
    });

  } catch (error) {
    await logger.logError("Error in single number query", error as Error, userId, chatId);
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: `❌ An error occurred: ${(error as Error).message}`
    });
  } finally {
    // Reset user state
    if (userId) {
      await stateManager.clearUserState(userId);
    }
  }
}

// Handler: Process location query for multiple numbers
async function handleMultipleNumbersQuery(
  supabase: SupabaseClient,
  telegramBotToken: string,
  message: TelegramMessage,
  stateManager: UserStateManager
): Promise<void> {
  const logger = BotLogger.getInstance();
  const userId = message.from?.id?.toString();
  const chatId = message.chat.id.toString();
  const locationQuery = sanitizeSearchQuery(message.text || '');

  try {
    await logger.logInfo("Processing multiple numbers location query", userId, chatId, { query: locationQuery });

    // Geocode the location
    const geoResult = await geocodeAddress(locationQuery);
    if (!geoResult) {
      await sendTelegramMessage(telegramBotToken, "sendMessage", {
        chat_id: message.chat.id,
        text: `❌ Could not find any location for: ${locationQuery}`
      });
      return;
    }

    const { lat, lon, address } = geoResult;

    // Find the closest phone numbers (up to 5)
    const numbers = await findClosestNumbers(supabase, lat, lon, 5);
    if (!numbers || numbers.length === 0) {
      await sendTelegramMessage(telegramBotToken, "sendMessage", {
        chat_id: message.chat.id,
        text: "No records found near that location."
      });
      return;
    }

    // Format the numbers section with special messaging for North East locations
    let numbersSection = "";
    numbers.forEach(number => {
      const isNorthEastSpecial = ['Top Shagger NE', 'Durham Medics', 'Sunderland Health', 'Middlesbrough Care'].includes(number.user_name);
      
      numbersSection += `⭐️ ${number.user_name}\nPhone: ${number.phone_number}\n`;
      
      if (isNorthEastSpecial) {
        if (number.user_name === 'Top Shagger NE') {
          numbersSection += `⚠️ Start message with "John Topper sent you"\nTap the phone numbers to copy them\n\n`;
        } else if (number.user_name === 'Durham Medics') {
          numbersSection += `⚠️ Start message with "Dr. Smith recommended you"\nTap the phone numbers to copy them\n\n`;
        } else if (number.user_name === 'Sunderland Health') {
          numbersSection += `⚠️ Start message with "Nurse Jane referred you"\nTap the phone numbers to copy them\n\n`;
        } else if (number.user_name === 'Middlesbrough Care') {
          numbersSection += `⚠️ Start message with "Dr. Brown sent you"\nTap the phone numbers to copy them\n\n`;
        }
      } else {
        numbersSection += `🔒 Start your message on WhatsApp with password NIGELLA to get the full menu\n\n`;
      }
    });

    const reply = `Hello ${message.from?.first_name || message.from?.username || 'there'},

Here are numbers near: ${address}

${numbersSection}✂️ Tap the number to copy
⚠️ All distances are approximate
⚠️ Use at your own risk. Never pay upfront.`;

    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: reply
    });

    // Log the search
    await supabase.from('location_searches').insert({
      telegram_user_id: userId,
      query: locationQuery,
      latitude: lat.toString(),
      longitude: lon.toString(),
      query_type: 'multiple_numbers',
      success: true,
      search_result_count: numbers.length
    });

  } catch (error) {
    await logger.logError("Error in multiple numbers query", error as Error, userId, chatId);
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: `❌ An error occurred: ${(error as Error).message}`
    });
  } finally {
    // Reset user state
    if (userId) {
      await stateManager.clearUserState(userId);
    }
  }
}

// Handler: Process /invite command
async function handleInviteCommand(
  telegramBotToken: string,
  message: TelegramMessage
): Promise<void> {
  await sendTelegramMessage(telegramBotToken, "sendMessage", {
    chat_id: message.chat.id,
    text: "🔗 Here is your invite link: https://t.me/your_bot?start=invite"
  });
}

// Handler: Process /help command
async function handleHelpCommand(
  telegramBotToken: string,
  message: TelegramMessage
): Promise<void> {
  const helpMessage = `🤖 *Available Commands:*

📝 *Basic Commands:*
/start - Welcome message
/help - Show this help message
/invite - Get invite link

📍 *Number Search Commands:*
/number - Search for a single phone number near a location
/numbers - Search for multiple phone numbers near a location

*Usage Examples:*
1. Type /number
2. Enter "London" or any location
3. Get the closest contact number

*Features:*
• 🎉 3 requests per 24 hours
• 📍 Location-based search
• ⚡ Fast response times
• 🔒 Secure and private

*Tips:*
• Be specific with locations for better results
• Use postcodes for precise searches
• Contact admin if you need higher limits`;

  await sendTelegramMessage(telegramBotToken, "sendMessage", {
    chat_id: message.chat.id,
    text: helpMessage,
    parse_mode: "Markdown"
  });
}

// Refactor handleRequest to reduce cognitive complexity
async function handleRequest(request: Request): Promise<Response> {
  const logger = BotLogger.getInstance();

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const supabase = createClient();
  logger.setSupabase(supabase);
  const stateManager = new UserStateManager(supabase);

  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!telegramBotToken) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
  }

  try {
    const body = await request.json();
    if (!validateTelegramUpdate(body)) {
      await logger.logWarning("Invalid Telegram update received", undefined, undefined, { body });
      return new Response("Invalid update", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const update = body as TelegramUpdate;
    const message = update.message;
    if (!message) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await processMessage(message, supabase, telegramBotToken, stateManager, logger);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    await logger.logError("Critical error in request handler", error as Error);
    return new Response(JSON.stringify({ error: (error as Error).message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Extracted function to process messages
async function processMessage(
  message: TelegramMessage,
  supabase: SupabaseClient,
  telegramBotToken: string,
  stateManager: UserStateManager,
  logger: BotLogger
): Promise<void> {
  const userId = message.from?.id?.toString();
  const chatId = message.chat.id.toString();

  // Refactor nested ternary operation
  const messageType = message.text
    ? "text"
    : message.location
    ? "location"
    : "other";

  await logger.logInfo("Processing message", userId, chatId, { messageType });

  if (message.text) {
    const text = message.text.trim();
    if (text.startsWith("/")) {
      await handleCommand(text, supabase, telegramBotToken, message, stateManager, logger);
    } else if (userId) {
      await handleUserState(userId, message, supabase, telegramBotToken, stateManager, logger);
    }
  }
}

// Extracted function to handle commands
async function handleCommand(
  text: string,
  supabase: SupabaseClient,
  telegramBotToken: string,
  message: TelegramMessage,
  stateManager: UserStateManager,
  logger: BotLogger
): Promise<void> {
  const chatId = message.chat.id.toString();

  switch (text) {
    case "/start":
      await handleStartCommand(supabase, telegramBotToken, message, stateManager);
      break;
    case "/number":
      await handleNumberCommand(supabase, telegramBotToken, message, stateManager);
      break;
    case "/numbers":
      await handleNumbersCommand(supabase, telegramBotToken, message, stateManager);
      break;
    case "/invite":
      await handleInviteCommand(telegramBotToken, message);
      break;
    case "/help":
      await handleHelpCommand(telegramBotToken, message);
      break;
    default:
      await sendTelegramMessage(telegramBotToken, "sendMessage", {
        chat_id: chatId,
        text: "❓ Unknown command. Use /help to see available commands.",
      });
  }
}

// Extracted function to handle user state
async function handleUserState(
  userId: string,
  message: TelegramMessage,
  supabase: SupabaseClient,
  telegramBotToken: string,
  stateManager: UserStateManager,
  logger: BotLogger
): Promise<void> {
  if (userId) {
    const userState = await stateManager.getUserState(userId);
    if (userState?.state === "awaiting_location") {
      await handleSingleNumberQuery(supabase, telegramBotToken, message, stateManager);
    } else if (userState?.state === "awaiting_location_numbers") {
      await handleMultipleNumbersQuery(supabase, telegramBotToken, message, stateManager);
    } else {
      await sendTelegramMessage(telegramBotToken, "sendMessage", {
        chat_id: message.chat.id,
        text: "❓ Please use /number to search for a number, or /invite to invite a friend.",
      });
    }
  }
}

serve(handleRequest);
