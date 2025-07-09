# Telegram Bot Quick Setup Guide

This guide will help you quickly and consistently start your Telegram bot for testing and development.

## Prerequisites

1. **Supabase CLI** installed globally:
   ```bash
   npm install -g supabase
   ```

2. **Environment variables** configured in `.env` file:
   ```bash
   # Required variables
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   
   # Optional
   DATABASE_URL=your_postgres_connection_string
   ```

## Quick Start (One Command)

Run this single command to start your bot:

```bash
./start-telegram-bot.sh
```

This script will:
- ✅ Validate environment variables
- ✅ Deploy the Supabase function
- ✅ Set the Telegram webhook
- ✅ Test connectivity
- ✅ Show you the bot username

## Manual Steps (If Needed)

If the automated script doesn't work, follow these manual steps:

### 1. Deploy the Function
```bash
supabase functions deploy telegram-webhook --no-verify-jwt
```

### 2. Set the Webhook
```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$SUPABASE_URL/functions/v1/telegram-webhook\"}"
```

### 3. Run Database Migrations
```bash
supabase db push
```

## Testing Your Bot

### 1. Run the Test Script
```bash
./test-bot.sh
```

### 2. Manual Testing
Send these commands to your bot:

1. **Basic Commands:**
   - `/start` - Welcome message with rate limits
   - `/help` - Show all available commands
   - `/invite` - Get invite link

2. **Number Search Commands:**
   - `/number` - Search for a single phone number
     - Bot will ask for location
     - Enter "London" or any location
     - Receive 1 closest number
   
   - `/numbers` - Search for multiple phone numbers
     - Bot will ask for location  
     - Enter "London" or any location
     - Receive up to 5 closest numbers

### 3. Expected Bot Behavior

The bot replicates the exact functionality from your Python handlers:

- **Rate Limiting:** 3 requests per 24 hours per user
- **State Management:** Remembers when user is searching for numbers
- **Welcome Message:** Matches your original welcome text
- **Phone Number Format:** Shows numbers with clickable tel: links
- **Error Handling:** Graceful fallbacks for geocoding/database errors

## Bot Commands Implemented

| Command | Description | State Changes |
|---------|-------------|---------------|
| `/start` | Welcome message + rate limit info | Sets state to 'start' |
| `/number` | Single number search | Sets state to 'awaiting_location' |
| `/numbers` | Multiple numbers search | Sets state to 'awaiting_location_numbers' |
| `/invite` | Show invite link | No state change |
| `/help` | Show all commands | No state change |

## Database Tables Used

- **`user_states`** - Tracks conversation state for each user
- **`phone_numbers`** - Stores phone numbers with geographic coordinates
- **`telegram_users`** - User information and activity tracking
- **`location_searches`** - Search history and rate limiting
- **`bot_logs`** - Comprehensive logging for debugging

## Monitoring & Debugging

### View Logs
```bash
supabase functions logs telegram-webhook
```

### Check Database
Open your Supabase dashboard and check the tables:
- Recent entries in `bot_logs`
- User states in `user_states`
- Search history in `location_searches`

### Stop the Bot
```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/deleteWebhook"
```

## Troubleshooting

### Bot Not Responding
1. Check webhook is set: `curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"`
2. Check function logs: `supabase functions logs telegram-webhook`
3. Test webhook URL directly in browser

### Database Errors
1. Run migrations: `supabase db push`
2. Check table exists: Query `user_states` and `phone_numbers` in Supabase dashboard
3. Verify RLS policies allow operations

### Rate Limiting Issues
Check `location_searches` table for recent entries by user ID.

## Sample Phone Numbers (For Testing)

The migration includes these test numbers:
- London: +44 7700 900123, +44 7700 900456, +44 7700 900789
- New York: +1 555 123 4567, +1 555 987 6543

## Next Steps

1. **Add Real Data:** Replace sample phone numbers with real contact data
2. **Geocoding Service:** Replace mock geocoding with real service (Google Maps, Mapbox)
3. **Advanced Features:** Add admin commands, backup functionality, etc.
4. **Monitoring:** Set up alerts for errors and performance monitoring

---

📝 **Note:** This implementation exactly replicates your Python bot's functionality but uses Supabase Edge Functions instead of Flask/SQLAlchemy.
