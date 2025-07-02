# 🤖 Bot Quick Reference

## Current Status
- ✅ **Supabase Edge Function** (Recommended) - `supabase/functions/telegram-webhook/`
- ⚠️ **Python Bot** (Redundant) - `telegram_location_bot/` 

## Quick Commands

### Deploy Recommended Bot (Supabase Function)
```bash
npm run bot:deploy
# OR
./deploy-bot.sh
```

### View Bot Logs
```bash
npm run bot:logs
# OR
supabase functions logs telegram-webhook
```

### Remove Redundant Python Bot
```bash
npm run bot:cleanup
# OR
./cleanup-python-bot.sh
```

### Manual Supabase Function Deployment
```bash
supabase functions deploy telegram-webhook
```

### Check Webhook Status
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## Files Created/Modified
- 📄 `BOT_STARTUP_GUIDE.md` - Comprehensive setup guide
- 🚀 `deploy-bot.sh` - Automated deployment script
- 🧹 `cleanup-python-bot.sh` - Remove redundant Python bot
- 📝 `README.md` - Updated with new bot information
- ⚙️ `package.json` - Added bot management scripts

## Architecture Decision
**Recommendation**: Use Supabase Edge Function (webhooks) instead of Python bot (polling) for:
- Better scalability
- Lower costs
- Easier maintenance
- Better integration with existing Supabase infrastructure
