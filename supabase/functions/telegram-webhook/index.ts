// Type definitions for Deno and Supabase
// @deno-types="./deno.d.ts"

// Update import paths for external modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "./supabaseClient.ts";
import type { 
  TelegramUpdate, 
  TelegramMessage, 
  TelegramLocation,
  SupabaseClient, 
  SupabaseLocation, 
  LogSearchParams,
  SearchResult,
  LogActivityData,
  TelegramResponse
} from "./types.ts";

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
  VERSION: "1.0.2", // Added version for debugging
  LOGGING: {
    ENABLED: true,
    LEVEL: "INFO", // DEBUG, INFO, WARN, ERROR
    MAX_MESSAGE_LENGTH: 1000,
    INCLUDE_USER_DATA: false, // For privacy
  }
};

// Logging utility
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
  private supabase: any;

  private constructor() {}

  static getInstance(): BotLogger {
    if (!BotLogger.instance) {
      BotLogger.instance = new BotLogger();
    }
    return BotLogger.instance;
  }

  setSupabase(supabase: any) {
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
  
  // Trim and limit length
  const trimmed = query.trim().substring(0, CONFIG.MAX_QUERY_LENGTH);
  
  // Remove potentially dangerous characters, keep only alphanumeric, spaces, and common punctuation
  const sanitized = trimmed.replace(/[^a-zA-Z0-9\s\-.,#&'()]/g, '');
  
  // Remove excessive whitespace
  return sanitized.replace(/\s+/g, ' ').trim();
}

// Security: Rate limiting check
async function checkRateLimit(supabase: SupabaseClient, telegramUserId: string, action: string): Promise<boolean> {
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
function formatLocationMessage(location: SupabaseLocation): string {
  const rating = Math.round(location.rating || 0);
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  
  return `📍 ${location.name}\n` +
         `Address: ${location.address}\n` +
         `Type: ${location.type || 'Unknown'}\n` +
         `Rating: ${stars}\n\n`;
}

// Utility: Build location search query (reduces code duplication)
function buildLocationQuery(supabase: SupabaseClient, searchTerm: string, locationType?: string, limit: number = 10) {
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
  supabase: SupabaseClient, 
  searchTerm: string, 
  locationType?: string, 
  limit: number = 10
): Promise<SearchResult> {
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
  supabase: SupabaseClient,
  params: LogSearchParams
): Promise<void> {
  try {
    await retryOperation(async () => {
      // Only log non-sensitive data
      const logData: LogActivityData = {
        activity_type: 'search',
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
async function incrementBotStats(supabase: SupabaseClient, statName: string, incrementBy: number = 1): Promise<void> {
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
  supabase: SupabaseClient,
  telegramBotToken: string,
  message: TelegramMessage,
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
  supabase: SupabaseClient,
  cmd: string,
  argsText: string,
  telegramUserId: string | undefined,
  chatId: number
): Promise<TelegramResponse> {
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
  supabase: SupabaseClient,
  location: TelegramLocation,
  telegramUserId: string | undefined,
  chatId: number
): Promise<TelegramResponse> {
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
  supabase: SupabaseClient,
  query: string,
  telegramUserId: string | undefined,
  chatId: number
): Promise<TelegramResponse> {
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

// Handler: Process /start command
async function handleStartCommand(
  supabase: any,
  telegramBotToken: string,
  message: any
): Promise<void> {
  const logger = BotLogger.getInstance();
  const startTime = Date.now();
  const userId = message.from?.id?.toString();
  const chatId = message.chat.id.toString();

  try {
    await logger.logInfo("Start command initiated", userId, chatId);

    const welcomeMessage = `Welcome to the bot! Use /help to see available commands.`;
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: welcomeMessage
    });

    const duration = Date.now() - startTime;
    await logger.logCommand("/start", userId, chatId, duration);
  } catch (error) {
    await logger.logError("Error in start command", error as Error, userId, chatId, "/start");
    throw error;
  }
}

// Handler: Process /help command
async function handleHelpCommand(
  supabase: any,
  telegramBotToken: string,
  message: any
): Promise<void> {
  const logger = BotLogger.getInstance();
  const startTime = Date.now();
  const userId = message.from?.id?.toString();
  const chatId = message.chat.id.toString();

  try {
    await logger.logInfo("Help command initiated", userId, chatId);

    // Check if user is admin
    const isAdmin = await enforceAdminRBAC(supabase, userId || '');
    
    let helpMessage = `🤖 *Available Commands:*\n\n`;
    
    // Basic commands for all users
    helpMessage += `📝 *Basic Commands:*\n`;
    helpMessage += `/start - Welcome message\n`;
    helpMessage += `/help - Show this help message\n`;
    helpMessage += `/invite - Get invite link\n\n`;
    
    // Location commands
    helpMessage += `📍 *Location Commands:*\n`;
    helpMessage += `Just type any location name to search!\n`;
    helpMessage += `Examples: "London", "New York", "Paris"\n\n`;
    
    // Admin commands (only show if user is admin)
    if (isAdmin) {
      helpMessage += `⚙️ *Admin Commands:*\n`;
      helpMessage += `/stats - View bot statistics\n`;
      helpMessage += `/logs - View recent bot logs\n`;
      helpMessage += `/promote <user> - Promote a user to admin\n`;
      helpMessage += `/demote <user> - Demote a user\n`;
      helpMessage += `/setpassword <user> <password> - Set user password\n`;
      helpMessage += `/backup - Create database backup\n\n`;
      helpMessage += `🔒 *Admin Features Unlocked*`;
    } else {
      helpMessage += `💡 *Tips:*\n`;
      helpMessage += `• Send me any location name to search\n`;
      helpMessage += `• Share your location to find nearby places\n`;
      helpMessage += `• Use /invite to share this bot with friends`;
    }

    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: helpMessage,
      parse_mode: "Markdown"
    });

    const duration = Date.now() - startTime;
    await logger.logCommand("/help", userId, chatId, duration);
  } catch (error) {
    await logger.logError("Error in help command", error as Error, userId, chatId, "/help");
    throw error;
  }
}

// Handler: Process /logs command
async function handleLogsCommand(
  supabase: any,
  telegramBotToken: string,
  message: any
): Promise<void> {
  const logger = BotLogger.getInstance();
  const startTime = Date.now();
  const userId = message.from?.id?.toString();
  const chatId = message.chat.id.toString();

  try {
    await logger.logInfo("Logs command initiated", userId, chatId);

    // Check if user is admin (you may want to implement this)
    // const isAdmin = await enforceAdminRBAC(supabase, userId);
    // if (!isAdmin) {
    //   await sendTelegramMessage(telegramBotToken, "sendMessage", {
    //     chat_id: message.chat.id,
    //     text: "❌ Access denied. Admin privileges required."
    //   });
    //   return;
    // }

    // Get recent log statistics
    const { data: logStats, error: statsError } = await supabase.rpc("get_bot_log_stats", { days_back: 1 });
    const { data: errorSummary, error: errorError } = await supabase.rpc("get_bot_error_summary", { days_back: 1 });
    const { data: commandStats, error: commandError } = await supabase.rpc("get_command_usage_stats", { days_back: 1 });

    let logMessage = "📊 *Bot Logs Summary (Last 24 Hours)*\n\n";

    if (!statsError && logStats) {
      logMessage += "*Log Levels:*\n";
      logStats.forEach((stat: any) => {
        const emoji = stat.level === 'ERROR' ? '🔴' : stat.level === 'WARN' ? '🟡' : '🟢';
        logMessage += `${emoji} ${stat.level}: ${stat.count} entries\n`;
      });
      logMessage += "\n";
    }

    if (!commandError && commandStats && commandStats.length > 0) {
      logMessage += "*Command Usage:*\n";
      commandStats.slice(0, 5).forEach((cmd: any) => {
        logMessage += `📈 ${cmd.command}: ${cmd.usage_count} uses (avg: ${cmd.avg_duration_ms}ms)\n`;
      });
      logMessage += "\n";
    }

    if (!errorError && errorSummary && errorSummary.length > 0) {
      logMessage += "*Recent Errors:*\n";
      errorSummary.slice(0, 3).forEach((error: any) => {
        logMessage += `🚨 ${error.command || 'Unknown'}: ${error.count} errors\n`;
        logMessage += `   Last: ${new Date(error.last_occurrence).toLocaleString()}\n`;
      });
    } else {
      logMessage += "✅ No errors in the last 24 hours!\n";
    }

    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: logMessage,
      parse_mode: "Markdown"
    });

    const duration = Date.now() - startTime;
    await logger.logCommand("/logs", userId, chatId, duration);
  } catch (error) {
    await logger.logError("Error in logs command", error as Error, userId, chatId, "/logs");
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "Failed to fetch logs. Please try again later."
    });
  }
}

// Handler: Process /invite command
async function handleInviteCommand(
  telegramBotToken: string,
  message: any
): Promise<void> {
  const inviteLink = `https://t.me/Moatboat_bot?start=invite`;
  await sendTelegramMessage(telegramBotToken, "sendMessage", {
    chat_id: message.chat.id,
    text: `🤖 *Share this bot with your friends!*\n\n🔗 Invite link: ${inviteLink}\n\n💡 They can use this bot to search for locations and get helpful information!`,
    parse_mode: "Markdown"
  });
}

// Handler: Process /stats command
async function handleStatsCommand(
  supabase: any,
  telegramBotToken: string,
  message: any
): Promise<void> {
  const { data, error } = await supabase.rpc("get_stats");
  if (error) {
    console.error("Error fetching stats:", error);
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "Failed to fetch stats. Please try again later."
    });
    return;
  }

  const statsMessage = `Bot Statistics:\nTotal Users: ${data.total_users}\nAdmin Users: ${data.admin_users}\nTotal Locations: ${data.total_locations}`;
  await sendTelegramMessage(telegramBotToken, "sendMessage", {
    chat_id: message.chat.id,
    text: statsMessage
  });
}

// Handler: Process /promote command
async function handlePromoteCommand(
  supabase: any,
  telegramBotToken: string,
  message: any,
  argsText: string
): Promise<void> {
  const { error } = await supabase.rpc("promote_user", { user_identifier: argsText });
  if (error) {
    console.error("Error promoting user:", error);
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "Failed to promote user. Please check the identifier and try again."
    });
    return;
  }

  await sendTelegramMessage(telegramBotToken, "sendMessage", {
    chat_id: message.chat.id,
    text: `User ${argsText} has been promoted to admin.`
  });
}

// Handler: Process /demote command
async function handleDemoteCommand(
  supabase: any,
  telegramBotToken: string,
  message: any,
  argsText: string
): Promise<void> {
  const { error } = await supabase.rpc("demote_user", { user_identifier: argsText });
  if (error) {
    console.error("Error demoting user:", error);
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "Failed to demote user. Please check the identifier and try again."
    });
    return;
  }

  await sendTelegramMessage(telegramBotToken, "sendMessage", {
    chat_id: message.chat.id,
    text: `User ${argsText} has been demoted.`
  });
}

// Handler: Process /setpassword command
async function handleSetPasswordCommand(
  supabase: any,
  telegramBotToken: string,
  message: any,
  argsText: string
): Promise<void> {
  const [identifier, newPassword] = argsText.split(" ", 2);
  if (!identifier || !newPassword) {
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "Usage: /setpassword <user_id|username> <new_password>"
    });
    return;
  }

  const { error } = await supabase.rpc("set_user_password", { user_identifier: identifier, password: newPassword });
  if (error) {
    console.error("Error setting password:", error);
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "Failed to set password. Please check the identifier and try again."
    });
    return;
  }

  await sendTelegramMessage(telegramBotToken, "sendMessage", {
    chat_id: message.chat.id,
    text: `Password for user ${identifier} has been updated.`
  });
}

// Handler: Process /backup command
async function handleBackupCommand(
  supabase: any,
  telegramBotToken: string,
  message: any
): Promise<void> {
  const backupPath = `/backups/backup_${Date.now()}.sql`;
  const { error } = await supabase.rpc("create_backup", { path: backupPath });
  if (error) {
    console.error("Error creating backup:", error);
    await sendTelegramMessage(telegramBotToken, "sendMessage", {
      chat_id: message.chat.id,
      text: "Failed to create backup. Please try again later."
    });
    return;
  }

  await sendTelegramMessage(telegramBotToken, "sendMessage", {
    chat_id: message.chat.id,
    text: `Backup created successfully at ${backupPath}.`
  });
}

// Add RBAC enforcement
async function enforceAdminRBAC(supabase: any, telegramUserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("telegram_users")
    .select("is_admin")
    .eq("telegram_id", telegramUserId)
    .single();

  if (error || !data || !data.is_admin) {
    return false;
  }

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
async function batchUpdateVisitCounts(supabase: SupabaseClient, locations: SupabaseLocation[]): Promise<void> {
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
async function fallbackVisitCountUpdate(supabase: SupabaseClient, locations: SupabaseLocation[]): Promise<void> {
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
  payload: Record<string, unknown>
): Promise<unknown> {
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

// Simplify the serve function
async function handleRequest(req: Request): Promise<Response> {
  const logger = BotLogger.getInstance();
  const requestStartTime = Date.now();

  try {
    await logger.logInfo("Webhook request received", undefined, undefined, {
      method: req.method,
      url: req.url
    });

    // Debug: Check all environment variables
    console.log("Available environment variables:", Object.keys(Deno.env.toObject()));

    // Get the telegram bot token from environment
    const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || Deno.env.get("BOT_TOKEN");
    if (!telegramBotToken) {
      await logger.logError("Telegram bot token not found in environment variables", new Error("Missing bot token"));
      return new Response(
        JSON.stringify({ error: "Telegram bot token not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    await logger.logInfo("Bot token found, creating Supabase client");

    // Create the Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Initialize logger with supabase client
    logger.setSupabase(supabase);

    // Get and validate update from Telegram
    const update = await req.json();
    await logger.logDebug("Received Telegram update", { updateId: update.update_id });

    // Validate the Telegram update structure
    if (!validateTelegramUpdate(update)) {
      await logger.logWarning("Invalid Telegram update structure received", undefined, undefined, { update });
      return new Response(
        JSON.stringify({ ok: true, message: "Invalid update structure" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Process the message
    const message = update.message;
    const userId = message.from?.id?.toString();
    const chatId = message.chat.id.toString();

    if (message && message.text) {
      const text = message.text.trim();
      await logger.logInfo("Processing text message", userId, chatId, { text });

      // Handle commands with individual logging
      if (text === "/start") {
        await handleStartCommand(supabase, telegramBotToken, message);
      } else if (text === "/help") {
        await handleHelpCommand(supabase, telegramBotToken, message);
      } else if (text === "/invite") {
        await handleInviteCommand(telegramBotToken, message);
      } else if (text === "/stats") {
        await handleStatsCommand(supabase, telegramBotToken, message);
      } else if (text === "/logs") {
        await handleLogsCommand(supabase, telegramBotToken, message);
      } else if (text.startsWith("/promote ")) {
        const userId = message.from?.id?.toString();
        const isAdmin = await enforceAdminRBAC(supabase, userId || '');
        if (!isAdmin) {
          await sendTelegramMessage(telegramBotToken, "sendMessage", {
            chat_id: message.chat.id,
            text: "❌ Access denied. Admin privileges required."
          });
        } else {
          const argsText = text.substring(9).trim();
          await handlePromoteCommand(supabase, telegramBotToken, message, argsText);
        }
      } else if (text.startsWith("/demote ")) {
        const userId = message.from?.id?.toString();
        const isAdmin = await enforceAdminRBAC(supabase, userId || '');
        if (!isAdmin) {
          await sendTelegramMessage(telegramBotToken, "sendMessage", {
            chat_id: message.chat.id,
            text: "❌ Access denied. Admin privileges required."
          });
        } else {
          const argsText = text.substring(8).trim();
          await handleDemoteCommand(supabase, telegramBotToken, message, argsText);
        }
      } else if (text.startsWith("/setpassword ")) {
        const userId = message.from?.id?.toString();
        const isAdmin = await enforceAdminRBAC(supabase, userId || '');
        if (!isAdmin) {
          await sendTelegramMessage(telegramBotToken, "sendMessage", {
            chat_id: message.chat.id,
            text: "❌ Access denied. Admin privileges required."
          });
        } else {
          const argsText = text.substring(13).trim();
          await handleSetPasswordCommand(supabase, telegramBotToken, message, argsText);
        }
      } else if (text === "/backup") {
        const userId = message.from?.id?.toString();
        const isAdmin = await enforceAdminRBAC(supabase, userId || '');
        if (!isAdmin) {
          await sendTelegramMessage(telegramBotToken, "sendMessage", {
            chat_id: message.chat.id,
            text: "❌ Access denied. Admin privileges required."
          });
        } else {
          await handleBackupCommand(supabase, telegramBotToken, message);
        }
      } else {
        // Handle location search
        const searchStartTime = Date.now();
        const response = await handleLocationSearch(supabase, "search", text, userId, message.chat.id);
        await sendTelegramMessage(telegramBotToken, "sendMessage", response as unknown as Record<string, unknown>);
        
        const searchDuration = Date.now() - searchStartTime;
        await logger.logInfo("Location search completed", userId, chatId, { 
          query: text, 
          duration: searchDuration 
        });
      }
    } else if (message && message.location) {
      // Handle location messages
      await logger.logInfo("Processing location message", userId, chatId, { 
        lat: message.location.latitude, 
        lng: message.location.longitude 
      });
      
      const response = await handleLocationSharing(supabase, message.location, userId, message.chat.id);
      await sendTelegramMessage(telegramBotToken, "sendMessage", response as unknown as Record<string, unknown>);
    }

    const totalDuration = Date.now() - requestStartTime;
    await logger.logInfo("Request completed successfully", userId, chatId, { 
      totalDuration 
    });

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const totalDuration = Date.now() - requestStartTime;
    await logger.logError("Critical error in request handler", error as Error, undefined, undefined, undefined);
    
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

serve(handleRequest);
