# 🤖 Location Genius Bot - Complete Startup Guide

## 🎯 The Easy Way (Recommended)

**One command to start your bot:**

```bash
./start-bot-easy.sh
```

This script handles everything automatically:
- ✅ Validates your environment
- ✅ Deploys the Supabase function
- ✅ Sets up the Telegram webhook
- ✅ Tests the connection
- ✅ Shows you the results

**Alternative using npm:**
```bash
npm run bot:start
```

## 📋 Prerequisites

Before running the startup script, ensure you have:

1. **Node.js and npm** installed
2. **Telegram bot token** from [@BotFather](https://t.me/BotFather)
3. **Supabase project** URL and service role key

## 🔧 Environment Setup

The startup script will create a `.env` file template if one doesn't exist. Fill in these values:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🤖 Bot Commands

Once your bot is running, users can use:

- `/start` - Welcome message with usage limits
- `/number` - Find a single medic near a location
- `/numbers` - Find multiple medics near a location
- `/help` - Show available commands
- `/invite` - Get bot invite link

## 🛠️ Management Commands

Use these npm scripts to manage your bot:

```bash
# Start the bot
npm run bot:start

# Check bot status
npm run bot:status

# View bot logs
npm run bot:logs

# Stop the bot
npm run bot:stop
```

## 🔍 Troubleshooting

### Bot doesn't respond to messages

1. **Wait 1-2 minutes** after deployment (Supabase functions need time to activate)
2. **Check logs**: `npm run bot:logs`
3. **Verify webhook**: `npm run bot:status`
4. **Restart bot**: `./start-bot-easy.sh`

### Environment variable errors

1. Check your `.env` file has all required values
2. Verify your Supabase URL format: `https://project.supabase.co`
3. Test your bot token with BotFather

### Function deployment fails

1. Ensure you're in the project root directory
2. Check `supabase/functions/telegram-webhook/index.ts` exists
3. Verify Supabase CLI: `npx supabase --version`

## 🏗️ Architecture

This bot uses **Supabase Edge Functions** with webhooks:

- ✅ **Serverless** - No server maintenance required
- ✅ **Auto-scaling** - Handles traffic spikes automatically
- ✅ **Cost-effective** - Pay only for actual usage
- ✅ **Integrated** - Native Supabase database access
- ✅ **Reliable** - Built-in logging and error handling

## 📊 Monitoring

After starting your bot:

1. **Test immediately**: Send `/start` to your bot
2. **Check logs**: `npm run bot:logs` for activity
3. **Monitor webhook**: `npm run bot:status` for health
4. **Dashboard**: Visit your Supabase dashboard for detailed metrics

## 🚨 Important Notes

- **Only use the new startup script** (`start-bot-easy.sh`)
- **Don't use legacy scripts** (they may be outdated)
- **One bot instance** - Don't run multiple webhook bots simultaneously
- **Environment variables** - Always use the `.env` file for configuration

## 🔄 Migration from Legacy Scripts

If you were using old scripts, simply use the new one:

```bash
# OLD (don't use)
./start-bot.sh
./start-telegram-bot.sh
./deploy-bot.sh

# NEW (use this)
./start-bot-easy.sh
```

## 📞 Getting Help

If you encounter issues:

1. **Check logs**: `npm run bot:logs`
2. **Review this guide**: Look for your specific error
3. **Verify environment**: Ensure all `.env` values are correct
4. **Test manually**: Use curl to test your webhook endpoint
5. **Restart fresh**: Run `./start-bot-easy.sh` again

## 🎉 Success Indicators

Your bot is working correctly when:

- ✅ Script completes without errors
- ✅ Bot responds to `/start` command
- ✅ Webhook status shows no errors
- ✅ Logs show message processing
- ✅ Function appears active in Supabase dashboard

---

**Quick Start Summary:**
1. Run `./start-bot-easy.sh`
2. Wait 1-2 minutes
3. Test with `/start`
4. Done! 🎉

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
