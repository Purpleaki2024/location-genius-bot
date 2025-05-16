# utils.py
"""General utility functions for the bot."""
import logging
from telebot.types import Message

def safe_reply(bot, message: Message, text: str, **kwargs):
    """Safely reply to a message, catching and logging exceptions."""
    try:
        return bot.reply_to(message, text, **kwargs)
    except Exception as e:
        logging.warning(f"Failed to reply to user {getattr(message.from_user, 'id', '?')}: {e}")
        return None

def format_user(user):
    """Return a display name for the user (prefers username, else full name, else telegram id)."""
    if hasattr(user, 'username') and user.username:
        return f"@{user.username}"
    name = (getattr(user, 'first_name', '') or '') + ' ' + (getattr(user, 'last_name', '') or '')
    name = name.strip()
    if name:
        return name
    if hasattr(user, 'telegram_id') and user.telegram_id:
        return f"user {user.telegram_id}"
    if hasattr(user, 'id'):
        return f"user {user.id}"
    return "the user"
