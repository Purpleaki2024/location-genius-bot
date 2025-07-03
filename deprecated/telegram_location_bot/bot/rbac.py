# rbac.py
"""Role-based access control for bot commands."""
from functools import wraps
from bot import bot, database

def is_user_admin(telegram_id):
    """Check if the user with given Telegram ID is an admin and active."""
    session = database.SessionLocal()
    try:
        user = database.get_user_by_telegram_id(session, telegram_id)
        if not user:
            return False
        return bool(user.is_admin and user.is_active)
    finally:
        session.close()

def admin_required(func):
    """Decorator for bot command handlers to restrict to admin users only."""
    @wraps(func)
    def wrapper(message, *args, **kwargs):
        user_id = message.from_user.id
        if not is_user_admin(user_id):
            try:
                bot.reply_to(message, "\u26d4 You are not authorized to use this command.")
            except Exception as e:
                print(f"Failed to send unauthorized message: {e}")
            return
        return func(message, *args, **kwargs)
    return wrapper
