# Telegram Bot Troubleshooting Guide

This guide helps you resolve common issues with the Telegram location bot.

## 🔍 Quick Diagnostics

Run these commands to check your setup:

```bash
# Check if bot is configured
npm run bot:status

# View recent logs
npm run bot:logs

# Test environment variables
source .env && echo "Token: ${TELEGRAM_BOT_TOKEN:0:10}..." && echo "URL: $SUPABASE_URL"
```

## 🚨 Common Issues & Solutions

### 1. Bot Token Issues

**Error**: `TELEGRAM_BOT_TOKEN not configured`

**Solutions**:
```bash
# Check .env file exists
ls -la .env

# Verify token format (should be numbers:letters)
grep TELEGRAM_BOT_TOKEN .env

# Test token directly
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"
```

**Valid token format**: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2. Supabase Connection Issues

**Error**: `Failed to deploy function` or `Supabase CLI not available`

**Solutions**:
```bash
# Check if Supabase CLI is installed
which supabase || which npx

# Try manual installation
npm install -g supabase

# Test Supabase connection
supabase functions list
```

### 3. Webhook Setup Issues

**Error**: `Failed to set webhook`

**Solutions**:
```bash
# Check current webhook status
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"

# Delete existing webhook
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/deleteWebhook"

# Set webhook manually
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$SUPABASE_URL/functions/v1/telegram-webhook\"}"
```

### 4. Function Deployment Issues

**Error**: `Function deployment failed`

**Solutions**:
```bash
# Check if you're in the right directory
pwd
ls supabase/functions/telegram-webhook/

# Check function file exists and is not empty
ls -la supabase/functions/telegram-webhook/index.ts
head -n 20 supabase/functions/telegram-webhook/index.ts

# Try deploying manually
supabase functions deploy telegram-webhook --no-verify-jwt
```

### 5. Environment Variables Issues

**Error**: Missing or incorrect environment variables

**Solutions**:
```bash
# Check all required variables
cat .env | grep -E "(TELEGRAM_BOT_TOKEN|SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)"

# Test loading variables
source .env
echo "Token exists: $([[ -n "$TELEGRAM_BOT_TOKEN" ]] && echo "YES" || echo "NO")"
echo "URL exists: $([[ -n "$SUPABASE_URL" ]] && echo "YES" || echo "NO")"
echo "Service key exists: $([[ -n "$SUPABASE_SERVICE_ROLE_KEY" ]] && echo "YES" || echo "NO")"
```

### 6. Bot Not Responding

**Issue**: Bot deployed but not responding to messages

**Debugging**:
```bash
# Check logs for errors
npm run bot:logs

# Test webhook manually
curl -X POST "$SUPABASE_URL/functions/v1/telegram-webhook" \
  -H "Content-Type: application/json" \
  -d '{"message":{"text":"/start","chat":{"id":123},"from":{"id":123,"first_name":"Test"}}}'

# Check webhook status
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo" | jq .
```

## 🔧 Advanced Troubleshooting

### Check Function Logs
```bash
# Real-time logs
supabase functions logs telegram-webhook --follow

# Recent logs
supabase functions logs telegram-webhook
```

### Test Bot Manually
```bash
# Create test message
node -e "
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = 'YOUR_CHAT_ID'; // Replace with your chat ID
fetch(\`https://api.telegram.org/bot\${botToken}/sendMessage\`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({chat_id: chatId, text: 'Test message'})
}).then(r => r.json()).then(console.log);
"
```

### Database Connection Test
```bash
# Test Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('bot_logs').select('*').limit(1).then(console.log);
"
```

## 📊 Monitoring & Maintenance

### Regular Health Checks
```bash
# Add to your cron job or run regularly
#!/bin/bash
# Check bot health
status=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo" | jq -r '.result.url')
if [[ "$status" == *"telegram-webhook"* ]]; then
  echo "✅ Bot is healthy"
else
  echo "❌ Bot needs attention"
  # Auto-restart
  npm run bot:start
fi
```

### Log Analysis
```bash
# Check for errors in logs
supabase functions logs telegram-webhook | grep -i error

# Count requests by hour
supabase functions logs telegram-webhook | grep -o '\[.*\]' | sort | uniq -c

# Find most active users
supabase functions logs telegram-webhook | grep -o 'userId: [0-9]*' | sort | uniq -c
```

## 🛠️ Recovery Procedures

### Complete Reset
If everything is broken, start fresh:

```bash
# 1. Stop everything
npm run bot:stop

# 2. Clean deploy
rm -rf .supabase/functions/telegram-webhook/
npm run bot:start

# 3. If still broken, reset Supabase function
supabase functions delete telegram-webhook
npm run bot:start
```

### Backup Important Data
```bash
# Backup current function
cp supabase/functions/telegram-webhook/index.ts supabase/functions/telegram-webhook/index.ts.backup

# Backup environment
cp .env .env.backup
```

## 🔍 Getting More Help

### Enable Debug Mode
Add to your `.env`:
```env
DEBUG=true
LOG_LEVEL=debug
```

### Useful Commands
```bash
# Show all npm scripts
npm run

# Check Node/npm versions
node --version && npm --version

# Check disk space
df -h

# Check if ports are in use
lsof -i :3000
```

### Contact Information
- Check the main [README.md](./README.md) for project details
- Review [BOT_QUICK_START.md](./BOT_QUICK_START.md) for basic setup
- Look at [BOT_SETUP_GUIDE.md](./BOT_SETUP_GUIDE.md) for advanced configuration

## 🎯 Prevention Tips

1. **Always test in development first**
2. **Keep your `.env` file secure and backed up**
3. **Monitor logs regularly**: `npm run bot:logs`
4. **Test webhook status**: `npm run bot:status`
5. **Use version control for your bot code**
6. **Document any custom changes you make**

## 🚑 Emergency Procedures

### Bot Completely Down
1. `npm run bot:stop`
2. `npm run bot:start`
3. Check logs: `npm run bot:logs`
4. Test manually: message the bot

### Webhook Conflicts
1. `curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/deleteWebhook"`
2. Wait 30 seconds
3. `npm run bot:start`

### Function Corrupted
1. `supabase functions delete telegram-webhook`
2. `npm run bot:start`

Remember: The new simplified setup is designed to be much more reliable than the old system. Most issues can be resolved with `npm run bot:start`.
