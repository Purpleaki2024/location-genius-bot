# Telegram Bot Startup Guide

## Current State Analysis

This project currently has **TWO DIFFERENT** Telegram bot implementations, which is redundant and can cause conflicts:

1. **Python Bot** (Located in `telegram_location_bot/`) - Uses polling
2. **Supabase Edge Function** (Located in `supabase/functions/telegram-webhook/`) - Uses webhooks

⚠️ **WARNING**: Running both simultaneously will cause message duplication and conflicts.

## Recommended Approach: Supabase Edge Function (Webhooks)

The **Supabase Edge Function** is the recommended approach because:
- ✅ Serverless - no server maintenance required
- ✅ Automatically scales
- ✅ Integrated with your Supabase database
- ✅ More reliable for production use
- ✅ Cost-effective
- ✅ Already fully implemented with all features

### How to Start the Recommended Bot

#### Prerequisites
1. Supabase project set up (already done)
2. Telegram Bot Token (already configured)

#### Setup Steps

1. **Deploy the Supabase Function:**
   ```bash
   cd /workspaces/location-genius-bot
   npx supabase functions deploy telegram-webhook
   ```

2. **Set Environment Variables in Supabase:**
   - Go to your Supabase dashboard
   - Navigate to Settings > Edge Functions
   - Add these environment variables:
     - `TELEGRAM_BOT_TOKEN`: Your bot token
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anon key

3. **Set the Webhook URL:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{
          "url": "https://<your-supabase-project-ref>.supabase.co/functions/v1/telegram-webhook"
        }'
   ```

4. **Verify Setup:**
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
   ```

The bot will now automatically handle all incoming messages through webhooks.

## Alternative: Python Bot (Polling) - NOT RECOMMENDED

The Python bot uses polling and requires a continuously running server. Only use this for development or if you cannot use webhooks.

### How to Start the Python Bot

1. **Navigate to bot directory:**
   ```bash
   cd telegram_location_bot
   ```

2. **Create environment file:**
   ```bash
   cp ../.env .env
   # Edit .env and ensure these variables are set:
   # BOT_TOKEN=your_telegram_bot_token
   # DATABASE_URL=your_database_url
   # SECRET_KEY=your_flask_secret_key
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the bot:**
   ```bash
   python3 app.py
   ```

This will start both the Telegram bot (polling) and Flask admin interface on `http://localhost:5000`.

## Feature Comparison

| Feature | Supabase Function | Python Bot |
|---------|------------------|------------|
| Message Handling | ✅ Full | ✅ Full |
| Location Search | ✅ Yes | ❌ Limited |
| Database Integration | ✅ Native Supabase | ❌ Separate SQLite |
| Admin Interface | ❌ No | ✅ Flask Web UI |
| Scalability | ✅ Serverless | ❌ Single Server |
| Maintenance | ✅ Minimal | ❌ Server Required |
| Cost | ✅ Pay-per-use | ❌ Always Running |

## Recommendation

1. **Use the Supabase Edge Function** for the Telegram bot
2. **Remove the Python bot** to avoid conflicts
3. **Use the React frontend** for admin functionality instead of the Flask interface

This provides a cleaner, more scalable architecture with better integration.

## Next Steps

1. Deploy the Supabase function
2. Set up the webhook
3. Test the bot functionality
4. Remove the redundant Python bot implementation
