# 🤖 Location Genius Bot - Quick Start Guide

This guide provides a **simplified and reliable** way to start your Telegram location bot. No more confusion!

## 🚀 One-Command Setup (Recommended)

To start your Telegram bot, simply run:

```bash
./start-bot-easy.sh
```

That's it! The script will handle everything automatically.

## Alternative: Using npm
```bash
npm run bot:start
```

### Option 2: Direct script execution
```bash
./start-bot-simple.sh
```

That's it! The script will:
- ✅ Check your environment variables
- ✅ Deploy the Supabase function
- ✅ Set up the webhook
- ✅ Test the connection
- ✅ Show you the bot username

## 📋 Prerequisites

### 1. Environment Variables
Create a `.env` file in your project root with:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Supabase Configuration  
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. How to Get These Values

#### Telegram Bot Token
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the prompts
3. Copy the token that looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

#### Supabase Values
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or open your existing one
3. Go to Settings → API
4. Copy:
   - **URL**: Your project URL
   - **anon key**: The public anon key
   - **service_role key**: The service role key (keep this secret!)

## 🎯 Available Commands

Once your bot is running, users can use these commands:

- `/start` - Welcome message with usage info
- `/number` - Find a single local medic
- `/numbers` - Find multiple local medics (up to 3)
- `/help` - Show help and available commands
- `/invite` - Get invite link to share the bot

## 🔧 Management Commands

Use these npm scripts to manage your bot:

```bash
# Start the bot (recommended)
npm run bot:start

# Check bot status and webhook info
npm run bot:status

# View bot logs in real-time
npm run bot:logs

# Stop the bot (delete webhook)
npm run bot:stop

# Advanced startup (with more options)
npm run bot:start-advanced
```

## 🔍 Troubleshooting

### Common Issues

**"TELEGRAM_BOT_TOKEN not configured"**
- Check your `.env` file exists and has the correct token
- Make sure there are no spaces around the `=` sign

**"Supabase CLI not available"**
- Install Node.js and npm
- The script will try to use `npx supabase` automatically

**"Failed to set webhook"**
- Check your Supabase URL is correct
- Verify your bot token is valid
- Ensure your Supabase project is active

**"Function deployment failed"**
- Make sure you're in the project root directory
- Check that `supabase/functions/telegram-webhook/` exists
- Verify your Supabase project is linked

### Getting Help

1. **Check the logs**: `npm run bot:logs`
2. **Verify webhook status**: `npm run bot:status`
3. **Test manually**: Message your bot directly
4. **Check Supabase dashboard**: Look for function logs

## 📊 Features

### Rate Limiting
- Each user gets 3 requests per 24 hours
- Prevents spam and abuse
- Configurable limits

### Location Search
- Supports city names (London, Manchester, etc.)
- Postal codes and addresses
- Intelligent geocoding with fallbacks

### Sample Data
- Currently uses sample medical contacts
- Easy to replace with real database queries
- Structured data format ready for expansion

## 🛠️ Development

### File Structure
```
supabase/functions/telegram-webhook/
├── index.ts          # Main bot logic (simplified)
├── index-simple.ts   # Ultra-minimal version
├── types.ts          # Type definitions
└── supabaseClient.ts # Database client
```

### Customization
- Edit `index.ts` to modify bot behavior
- Update sample data in `getNearbyNumbers()` function
- Modify rate limits in `CONFIG` object
- Add new commands in the switch statement

### Testing
```bash
# Test the bot manually
npm run bot:test

# Check if everything is working
npm run bot:status
```

## 🔄 Migration from Old Setup

If you were using the old complicated setup:

1. **Stop old implementations**:
   ```bash
   # If you had Python bot running
   pkill -f "python.*telegram"
   
   # Delete old webhook
   npm run bot:stop
   ```

2. **Clean start**:
   ```bash
   npm run bot:start
   ```

3. **Verify it's working**:
   ```bash
   npm run bot:status
   ```

## 🎉 Success!

Once you see "Bot Setup Complete!" your bot is ready to use. Test it by:

1. Finding your bot username in the startup output
2. Messaging your bot directly on Telegram
3. Trying the `/start` command
4. Testing location search with `/number`

## 🆘 Still Having Issues?

If you're still having problems:

1. Check the [detailed troubleshooting guide](./BOT_TROUBLESHOOTING.md)
2. Look at the [original setup guide](./BOT_SETUP_GUIDE.md) for advanced options
3. Check the logs: `npm run bot:logs`
4. Verify your environment variables are correct

The new simplified approach should work for 99% of use cases. If you need advanced features, you can always use `npm run bot:start-advanced` instead.
