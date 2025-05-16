"""Configuration for the Telegram bot and Flask app."""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Telegram Bot Token (required)
BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN is not set in environment or .env file.")

# Flask secret key for sessions (use a secure random value in production)
SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key")

# Database URL (SQLite by default)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///bot_data.db")

# Initial admin credentials (for creating the first admin user)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "adminpass")
ADMIN_TOTP_SECRET = os.getenv("ADMIN_TOTP_SECRET")

# If no TOTP secret provided, generate one (print it out for setup)
if not ADMIN_TOTP_SECRET:
    try:
        import pyotp
        ADMIN_TOTP_SECRET = pyotp.random_base32()
        print(f"Generated TOTP secret for admin (save this for 2FA setup): {ADMIN_TOTP_SECRET}")
    except ImportError:
        # If pyotp not installed yet at import time, skip generation
        ADMIN_TOTP_SECRET = None
