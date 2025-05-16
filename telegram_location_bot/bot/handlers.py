
"""Handlers for standard bot commands and messages."""
from bot import bot
from bot import database
from bot import location
from bot import rbac
from bot.rate_limit import rate_limit

# Handle /start command
@bot.message_handler(commands=['start'])
@rate_limit(limit_sec=2)
def start_command(message):
    user = database.ensure_user(message.from_user)
    if not user.is_active:
        # Do not respond to banned users
        return
    bot.reply_to(message, 
                 "\U0001F44B Hello {}! I'm a location lookup bot.\n" 
                 "Send me a location pin or use /locate <address> to search for a place.".format(user.first_name or user.username or "there"))

# Handle /help command
@bot.message_handler(commands=['help'])
@rate_limit(limit_sec=2)
def help_command(message):
    user = database.ensure_user(message.from_user)
    if not user.is_active:
        return
    help_text = ["\U0001F4CB *Available commands:*\n",
                 "/locate `<address>` – Get coordinates for a location by address.\n",
                 "/city `<city name>` – Search for locations in a city.\n",
                 "/town `<town name>` – Search for locations in a town.\n",
                 "/village `<village name>` – Search for locations in a village.\n",
                 "/postcode `<code>` – Search by postcode.\n",
                 "(You can also send a location pin, and I'll tell you the address.)\n"]
    # If user is admin, list admin commands
    if user.is_admin:
        help_text.append("\n*Admin commands:*\n")
        help_text.append("/stats – Show bot usage statistics.\n")
        help_text.append("/promote `<user_id|username>` – Promote a user to admin.\n")
        help_text.append("/demote `<user_id|username>` – Revoke a user's admin status.\n")
        help_text.append("/backup – Create a database backup.\n")
    bot.reply_to(message, "".join(help_text), parse_mode='Markdown')

# Handle /locate command (address lookup)
@bot.message_handler(commands=['locate'])
@rate_limit(limit_sec=3)
def locate_command(message):
    user = database.ensure_user(message.from_user)
    if not user.is_active:
        return
    # Extract address query from the message
    parts = message.text.split(None, 1)
    if len(parts) < 2 or not parts[1].strip():
        bot.reply_to(message, "\u2139\ufe0f Usage: /locate <address or place name>")
        return
    query = parts[1].strip()
    bot.send_chat_action(message.chat.id, 'typing')
    try:
        result = location.geocode_address(query)
    except Exception as e:
        bot.reply_to(message, "\u26a0\ufe0f An error occurred while searching for the location.")
        print(f"Error in geocode_address: {e}")
        return
    if not result:
        bot.reply_to(message, f"\u274c Could not find any location for: {query}")
    else:
        lat, lon, address = result
        # Send location pin
        try:
            bot.send_location(message.chat.id, latitude=lat, longitude=lon)
        except Exception as e:
            print(f"Failed to send location via Telegram: {e}")
        # Send address info
        reply_text = f"\U0001F4CD *Location found:* {address}\n(Latitude: {lat}, Longitude: {lon})"
        bot.reply_to(message, reply_text, parse_mode='Markdown')
        # Log the query in database
        database.add_location_entry(user.id, str(lat), str(lon), address, query=query)

# Handle incoming location messages (user shares their live/static location)
@bot.message_handler(content_types=['location'])
@rate_limit(limit_sec=3)
def location_shared(message):
    user = database.ensure_user(message.from_user)
    if not user.is_active:
        return
    lat = message.location.latitude
    lon = message.location.longitude
    bot.send_chat_action(message.chat.id, 'find_location')
    try:
        address = location.reverse_geocode(lat, lon)
    except Exception as e:
        bot.reply_to(message, "\u26a0\ufe0f An error occurred while looking up the address.")
        print(f"Error in reverse_geocode: {e}")
        return
    if address:
        bot.reply_to(message, f"\U0001F4CD You are at: {address}")
    else:
        bot.reply_to(message, "\u2139\ufe0f Received your location (lat={lat}, lon={lon}).\nSorry, I couldn't find an address for it.".format(lat=lat, lon=lon))
        address = None
    # Log the location event
    database.add_location_entry(user.id, str(lat), str(lon), address, query=None)

# Handle city, town, village, postcode commands
@bot.message_handler(commands=['city', 'town', 'village', 'postcode'])
@rate_limit(limit_sec=3)
def location_type_command(message):
    user = database.ensure_user(message.from_user)
    if not user.is_active:
        return
        
    # Get command type and query text
    command = message.text.split()[0][1:]  # Remove the / prefix
    parts = message.text.split(None, 1)
    
    if len(parts) < 2 or not parts[1].strip():
        bot.reply_to(message, f"\u2139\ufe0f Usage: /{command} <name>")
        return
        
    query = parts[1].strip()
    bot.send_chat_action(message.chat.id, 'typing')
    
    # Here we would typically query our database for locations of this type
    # For this handler, we'll just acknowledge the command
    bot.reply_to(message, 
                f"🔍 Searching for {command}s matching '{query}'...\n\n"
                f"This would show results from our location database.")
    
    # Log the query
    database.add_location_entry(
        user.id, 
        None,  # No coordinates for this search type
        None, 
        f"Search for {command}: {query}", 
        query=query
    )

# Fallback handler for any other text
@bot.message_handler(func=lambda msg: msg.content_type == 'text', commands=None)
@rate_limit(limit_sec=1)
def fallback(message):
    user = database.ensure_user(message.from_user)
    if not user.is_active:
        return
    # Respond with a generic help prompt
    bot.reply_to(message, "\u2753 I didn't understand that. Type /help to see available commands.")
