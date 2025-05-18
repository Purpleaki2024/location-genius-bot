"""Handlers for standard bot commands and messages."""
from bot import bot
from bot import database
from bot import location
from bot import rbac
from bot.rate_limit import rate_limit
from bot.utils import safe_reply
from bot.loveable import analyze_text
from sqlalchemy import func
from flask import current_app
import datetime as dt

# Only allow these commands at the start
ALLOWED_COMMANDS = {'start', 'number', 'invite'}
USER_STATE = {}

# Helper to get the welcome message from config or database
def get_welcome_message():
    # In production, this could be loaded from the database or a config file
    # For now, try to read from a file, fallback to default
    try:
        with open('welcome_message.txt', 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return (
            "Hey,\n\n"
            "Welcome to the find a local Medic directory, Don't panic we got you covered.\n\n"
            "As we are helping other members 24/7 in the Medic chat we have to enforce the following limits:\n\n"
            "🎉 3 requests per 24hrs\n"
            "⚡ 3 requests left for today\n\n"
            "✨ <b>How to find a local Medic</b>\n\n"
            "To find a local Medic simply click <b>/number</b>\n\n"
            "Click <b>/help</b> for an array of other, tempting commands.\n\n"
            "If you need your limit raised for whatever please ask an admin in the chat or press <b>/help</b>\n\n"
            "Thank you, and we hope to see you again\n\n"
            "🎉 3 requests per 24hrs\n"
            "⚡ 3 requests left for today"
        )

# Handle /start command
@bot.message_handler(commands=['start'])
@rate_limit(limit_sec=2)
def start_command(message):
    user = database.ensure_user(message.from_user)
    USER_STATE[user.id] = 'start'
    if not user.is_active:
        return
    session = database.SessionLocal()
    try:
        if hasattr(database, 'log_analytics_event'):
            database.log_analytics_event(user.id, 'start')
        since = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=1)
        request_count = session.query(database.models.Location).filter(
            database.models.Location.user_id == user.id,
            database.models.Location.timestamp >= since
        ).count()
        requests_left = max(0, 3 - request_count)
    finally:
        session.close()
    welcome = get_welcome_message()
    welcome += f"\n\n🎉 3 requests per 24hrs\n⚡ {requests_left} requests left for today"
    safe_reply(bot, message, welcome, parse_mode='HTML', disable_web_page_preview=True)

@bot.message_handler(commands=['invite'])
@rate_limit(limit_sec=2)
def invite_command(message):
    user = database.ensure_user(message.from_user)
    if not user.is_active:
        return
    safe_reply(bot, message, "🔗 Here is your invite link: https://t.me/your_bot?start=invite")

@bot.message_handler(commands=['number'])
@rate_limit(limit_sec=2)
def number_command(message):
    user = database.ensure_user(message.from_user)
    if not user.is_active:
        return
    USER_STATE[user.id] = 'awaiting_location'
    safe_reply(bot, message, "📍 Please enter a location or postcode to search for numbers near you.")
    
    # Example integration with Loveable.dev
    analysis_result = analyze_text(message.text)
    if "error" in analysis_result:
        safe_reply(bot, message, f"Error analyzing text: {analysis_result['error']}")
    else:
        sentiment = analysis_result.get("sentiment", "unknown")
        safe_reply(bot, message, f"Sentiment analysis result: {sentiment}")

@bot.message_handler(func=lambda msg: USER_STATE.get(msg.from_user.id) == 'awaiting_location' and msg.content_type == 'text')
@rate_limit(limit_sec=2)
def handle_location_query(message):
    user = database.ensure_user(message.from_user)
    if not user.is_active:
        return
    location_query = message.text.strip()
    # Geocode the location
    geo_result = location.geocode_address(location_query)
    if not geo_result:
        safe_reply(bot, message, f"❌ Could not find any location for: {location_query}")
        return
    lat, lon, address = geo_result
    # Find the closest record in the database
    session = database.SessionLocal()
    try:
        # Find closest Location record by Euclidean distance (for demo)
        closest_result = session.query(database.models.Location, database.models.User).join(database.models.User).order_by(
            func.abs(func.cast(database.models.Location.latitude, func.FLOAT) - lat) +
            func.abs(func.cast(database.models.Location.longitude, func.FLOAT) - lon)
        ).first()
        if not closest_result:
            safe_reply(bot, message, "No records found near that location.")
            return
        loc, loc_user = closest_result
        # Format the template as in your screenshot
        reply = (
            f"Hello {user.first_name or user.username or 'there'},\n\n"
            f"Here is 1 number near: {address}\n\n"
            f"⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️\n"
            f"<b>{loc_user.username or loc_user.first_name or 'User'}</b>\n"
            f"<a href='tel:{loc.latitude}'>{loc.latitude}</a>\n"
            f"^🔒 Start your message on WhatsApp with password NIGELLA to get the full menu\n"
            f"⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️\n\n"
            f"✂️ Tap the number to copy\n"
            f"⚠️ All distances are approximate\n"
            f"⚠️ Use at your own risk. Never pay upfront."
        )
        safe_reply(bot, message, reply, parse_mode='HTML', disable_web_page_preview=True)
    finally:
        session.close()
    # Reset state so user must use /number again
    USER_STATE[user.id] = 'start'

# Fallback: only allow /start, /number, /invite at the start
@bot.message_handler(func=lambda msg: msg.content_type == 'text' and USER_STATE.get(msg.from_user.id, 'start') == 'start')
@rate_limit(limit_sec=1)
def fallback(message):
    user = database.ensure_user(message.from_user)
    if not user.is_active:
        return
    safe_reply(bot, message, "❓ Please use /number to search for a number, or /invite to invite a friend.")
