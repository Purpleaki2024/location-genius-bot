# rate_limit.py
"""Rate limiting decorator to prevent spam from users."""
import time
from bot import bot

# Track last command timestamp per user
_last_time = {}

def rate_limit(limit_sec=1):
    """Decorator to limit how frequently a user can invoke a handler (in seconds)."""
    def decorator(func):
        def wrapper(message, *args, **kwargs):
            user_id = message.from_user.id
            now = time.time()
            last = _last_time.get(user_id)
            if last and (now - last < limit_sec):
                # Too soon since last command from this user
                try:
                    bot.reply_to(message, "\u26a0\ufe0f Please slow down. You are sending commands too quickly.")
                except Exception as e:
                    # In case replying fails (e.g., blocked user)
                    print(f"Rate limit warning failed to send: {e}")
                return  # skip calling the handler
            # Update last command time and proceed
            _last_time[user_id] = now
            return func(message, *args, **kwargs)
        return wrapper
    return decorator
