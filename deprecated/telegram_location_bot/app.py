# app.py
"""Main application entry point for the Telegram bot and Flask admin panel."""
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, session, redirect, url_for

# Import configuration and bot instance
from bot import config, bot as telegram_bot
from admin import admin_bp

# Configure logging to file
handler = RotatingFileHandler('logs/bot.log', maxBytes=1000000, backupCount=3)
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(name)s: %(message)s')
handler.setFormatter(formatter)
logging.getLogger().setLevel(logging.INFO)
logging.getLogger().addHandler(handler)

logging.info("Starting application...")

# Initialize Flask app
app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['SECRET_KEY'] = config.SECRET_KEY

# Register Flask blueprint for admin routes
app.register_blueprint(admin_bp, url_prefix='/admin')

# Define a simple index route
@app.route('/')
def index():
    # If already logged in, go to dashboard
    if 'user_id' in session:
        return redirect(url_for('admin_bp.dashboard'))
    return """<html><head><meta http-equiv='Refresh' content='0; URL=/admin/login'/></head></html>"""

if __name__ == '__main__':
    # Start Telegram bot in a separate thread
    import threading
    def run_bot():
        telegram_bot.polling(none_stop=True, timeout=60)
    bot_thread = threading.Thread(target=run_bot)
    bot_thread.daemon = True
    bot_thread.start()
    logging.info("Telegram bot polling started.")
    # Start Flask development server
    app.run(host='0.0.0.0', port=5000)
