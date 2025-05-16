# admin_commands.py
"""Bot commands available only to admins."""
from bot import bot
from bot import admin as bot_admin
from bot import database
from bot import rbac
from bot.rate_limit import rate_limit
from bot.auth import authenticate_user
from admin.models import User
from sqlalchemy import func
from werkzeug.security import generate_password_hash
import pyotp
from bot.utils import format_user, safe_reply

# Admin-only: /stats – show basic statistics
@bot.message_handler(commands=['stats'])
@rbac.admin_required
@rate_limit(limit_sec=2)
def stats_command(message):
    stats_text = bot_admin.get_stats()
    safe_reply(bot, message, f"\U0001F4CA <b>Bot Statistics:</b>\n{stats_text}", parse_mode='HTML')

# Admin-only: /promote <user_id|username> – promote a user to admin
@bot.message_handler(commands=['promote'])
@rbac.admin_required
@rate_limit(limit_sec=2)
def promote_command(message):
    parts = message.text.split()
    if len(parts) < 2:
        safe_reply(bot, message, "ℹ️ Usage: /promote <user_id or @username>")
        return
    identifier = parts[1].lstrip('@')
    session = database.SessionLocal()
    try:
        target_user = None
        if identifier.isdigit():
            target_user = session.query(User).filter(User.telegram_id == int(identifier)).first()
        else:
            target_user = session.query(User).filter(func.lower(User.username) == identifier.lower()).first()
        if not target_user:
            safe_reply(bot, message, f"❌ User not found: {identifier}")
            return
        if target_user.is_admin:
            safe_reply(bot, message, f"ℹ️ User {format_user(target_user)} is already an admin.")
            return
        target_user.is_admin = True
        if not target_user.totp_secret:
            target_user.totp_secret = pyotp.random_base32()
        session.commit()
        if target_user.telegram_id:
            try:
                bot.send_message(target_user.telegram_id, \
                    f"🎉 You have been <b>promoted</b> to admin.\nUsername: {target_user.username}\nPlease set up 2FA with this code: <code>{target_user.totp_secret}</code>.", parse_mode='HTML')
            except Exception as e:
                print(f"Failed to send promotion message to user {target_user.telegram_id}: {e}")
        note = "" if target_user.password_hash else "\n⚠️ No password set! Use /setpassword to set a login password for this user."
        safe_reply(bot, message, f"✅ Promoted {format_user(target_user)} to admin.{note}")
    finally:
        session.close()

# Admin-only: /demote <user_id|username> – revoke admin rights
@bot.message_handler(commands=['demote'])
@rbac.admin_required
@rate_limit(limit_sec=2)
def demote_command(message):
    parts = message.text.split()
    if len(parts) < 2:
        safe_reply(bot, message, "ℹ️ Usage: /demote <user_id or @username>")
        return
    identifier = parts[1].lstrip('@')
    session = database.SessionLocal()
    try:
        target_user = None
        if identifier.isdigit():
            target_user = session.query(User).filter(User.telegram_id == int(identifier)).first()
        else:
            target_user = session.query(User).filter(func.lower(User.username) == identifier.lower()).first()
        if not target_user:
            safe_reply(bot, message, f"❌ User not found: {identifier}")
            return
        if not target_user.is_admin:
            safe_reply(bot, message, f"ℹ️ User {format_user(target_user)} is not an admin.")
            return
        if target_user.telegram_id == message.from_user.id:
            safe_reply(bot, message, "⚠️ You cannot demote yourself.")
            return
        target_user.is_admin = False
        session.commit()
        if target_user.telegram_id:
            try:
                bot.send_message(target_user.telegram_id, "⚠️ Your admin access has been <b>revoked</b>.", parse_mode='HTML')
            except Exception as e:
                print(f"Failed to send demotion message to user {target_user.telegram_id}: {e}")
        safe_reply(bot, message, f"✅ {format_user(target_user)} has been demoted and is no longer an admin.")
    finally:
        session.close()

# Admin-only: /backup – create a backup of the database and send it
@bot.message_handler(commands=['backup'])
@rbac.admin_required
@rate_limit(limit_sec=30)
def backup_command(message):
    backup_path = bot_admin.backup_database()
    if not backup_path:
        safe_reply(bot, message, "❌ Backup failed. Please check server settings.")
    else:
        try:
            with open(backup_path, 'rb') as f:
                bot.send_document(message.chat.id, f, caption=f"💾 Database backup created: {backup_path}")
        except Exception as e:
            safe_reply(bot, message, "⚠️ Backup created, but I couldn't send the file (size might be too large).")
            print(f"Error sending backup file: {e}")

# Admin-only: /setpassword <user_id|username> <new_password> – set a user's password
@bot.message_handler(commands=['setpassword'])
@rbac.admin_required
@rate_limit(limit_sec=5)
def setpassword_command(message):
    parts = message.text.split(None, 2)
    if len(parts) < 3:
        safe_reply(bot, message, "ℹ️ Usage: /setpassword <user_id or @username> <new_password>")
        return
    identifier = parts[1].lstrip('@')
    new_password = parts[2].strip()
    if (new_password.startswith('"') and new_password.endswith('"')) or (new_password.startswith("'") and new_password.endswith("'")):
        new_password = new_password[1:-1]
    if not new_password:
        safe_reply(bot, message, "❌ Password cannot be empty.")
        return
    session = database.SessionLocal()
    try:
        target_user = None
        if identifier.isdigit():
            target_user = session.query(User).filter(User.telegram_id == int(identifier)).first()
        else:
            target_user = session.query(User).filter(func.lower(User.username) == identifier.lower()).first()
        if not target_user:
            safe_reply(bot, message, f"❌ User not found: {identifier}")
            return
        target_user.password_hash = generate_password_hash(new_password)
        session.commit()
        safe_reply(bot, message, f"✅ Password updated for {format_user(target_user)}.")
    finally:
        session.close()
