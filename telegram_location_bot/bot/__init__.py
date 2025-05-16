"""Bot package initializer. Sets up the Telegram bot instance."""
from bot import config
import telebot

# Initialize the Telegram Bot
bot = telebot.TeleBot(config.BOT_TOKEN, parse_mode='HTML')

# Load handlers and admin commands to register them with the bot
from bot import handlers, admin_commands
