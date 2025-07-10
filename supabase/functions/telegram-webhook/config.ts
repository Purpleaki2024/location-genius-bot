// Location Genius Bot Configuration
// Edit this file to customize messages, limits, and bot behavior

export const BOT_CONFIG = {
  VERSION: "4.0.0",
  
  // User limits and restrictions
  USER_LIMITS: {
    DAILY_REQUESTS: 3,
    RATE_LIMIT_WINDOW: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
  
  // Bot commands
  COMMANDS: {
    START: '/start',
    NUMBER: '/number',
    NUMBERS: '/numbers',
    HELP: '/help',
    INVITE: '/invite',
  },
  
  // Customizable messages
  MESSAGES: {
    // Welcome message components
    WELCOME: {
      TITLE: "Hey {firstName},\n\nWelcome to the Local Medic Directory! 🏥",
      SUBTITLE: "Don't panic, we've got you covered.",
      LIMITS: "As we're helping other members 24/7, we have to enforce the following limits:",
      DAILY_LIMIT: "🎉 <b>3 requests per 24 hours</b>",
      REQUESTS_LEFT: "⚡ <b>{requestsLeft} requests left for today</b>",
      HOW_TO_USE: "<b>✨ How to find a local Medic:</b>\n\nUse the buttons below or type <b>/number</b> for a single medic search.\n\nClick <b>/help</b> for more commands.",
      FOOTER: "If you need your limit raised, please ask an admin in the chat.\n\nThank you, and we hope to see you again! 🙏"
    },
    
    // Button text
    BUTTONS: {
      FIND_SINGLE: "🔍 Find Single Medic",
      FIND_MULTIPLE: "🔍 Find Multiple Medics",
      HELP: "❓ Help",
      INVITE: "🔗 Invite Friends",
      BACK_TO_MENU: "🔙 Back to Menu",
      TYPE_CUSTOM: "⌨️ Type Custom Location"
    },
    
    // Search-related messages
    SEARCH: {
      TITLE_SINGLE: "📍 Find Single Local Medic",
      TITLE_MULTIPLE: "📍 Find Multiple Local Medics",
      PROMPT: "Please select a location or type a custom one:",
      TIP: "💡 Tip: You can also type any city, postal code, or address",
      REQUESTS_LEFT: "⚡ {requestsLeft} requests left after this search"
    },
    
    // Emergency and disclaimer messages
    EMERGENCY: {
      WARNING: "⚠️ For emergencies, always call 999 (UK) or 911 (US)",
      DISCLAIMER: "◆ Tap the phone numbers to copy them"
    },
    
    // Help message
    HELP: {
      TITLE: "<b>📚 Available Commands:</b>",
      COMMANDS: [
        "<b>/start</b> - Show welcome message and main menu",
        "<b>/number</b> - Find a single local medic",
        "<b>/numbers</b> - Find multiple local medics",
        "<b>/help</b> - Show this help message",
        "<b>/invite</b> - Get invite link for the bot"
      ],
      SEARCH_TITLE: "<b>🔍 How to search:</b>",
      SEARCH_STEPS: [
        "1. Use the buttons or commands above",
        "2. Select or enter your location",
        "3. Get nearby medic contact details"
      ],
      LOCATION_EXAMPLES: "<b>📍 Location examples:</b>\n• London, Manchester, Birmingham\n• New York, Los Angeles, Chicago\n• Your postal code or full address",
      REMEMBER: "<b>⚠️ Remember:</b>\n• You have 3 requests per 24 hours\n• For emergencies, always call 999/911\n• This bot provides contact information only",
      FOOTER: "Need help? Contact an admin in the main chat."
    },
    
    // Invite message
    INVITE: {
      TITLE: "<b>🤝 Invite Others to the Local Medic Directory</b>",
      DESCRIPTION: "Share this bot with others who might need medical contacts:",
      BOT_LINK: "<b>Bot Link:</b> https://t.me/Moatboat_bot",
      WHAT_IT_DOES: "<b>What this bot does:</b>\n• Find local medic contacts quickly\n• Available 24/7\n• Easy location-based search\n• Trusted community resource",
      PERFECT_FOR: "<b>Perfect for:</b>\n• Emergency situations\n• Travel emergencies\n• Finding local medical help\n• Community support",
      FOOTER: "Help us grow the community by sharing! 🌟"
    },
    
    // Error messages
    ERRORS: {
      RATE_LIMIT: "❌ <b>Daily limit reached!</b>\n\nYou've used all your requests for today. Please try again in 24 hours or contact an admin if you need more requests.",
      LOCATION_NOT_FOUND: "❌ <b>Location not found</b>\n\nSorry, we couldn't find \"{location}\". Please try a different location.",
      NO_MEDICS_FOUND: "❌ <b>No medics found</b>\n\nSorry, we couldn't find any medics near \"{location}\". Please try a different location.",
      SEARCH_FAILED: "❌ <b>Search failed</b>\n\nSorry, there was an error processing your request. Please try again.",
      UNKNOWN_COMMAND: "❓ <b>Unknown command</b>\n\nI didn't understand that command. Use /help to see available commands."
    }
  },
  
  // Location preset buttons (can be customized)
  LOCATION_PRESETS: [
    { text: "📍 London", value: "london" },
    { text: "📍 Manchester", value: "manchester" },
    { text: "📍 Birmingham", value: "birmingham" },
    { text: "📍 New York", value: "new york" }
  ],
  
  // Bot settings
  SETTINGS: {
    PARSE_MODE: "HTML",
    DISABLE_WEB_PAGE_PREVIEW: true,
    GEOCODING_USER_AGENT: "LocationGeniusBot/4.0"
  }
};
