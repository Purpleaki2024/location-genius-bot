# admin.py
"""Administrative utility functions for the bot (not Flask)."""
import os
import shutil
from datetime import datetime
from bot import config
from bot.database import SessionLocal
from admin.models import User, Location

def get_stats():
    """Gather basic stats about the bot usage (user count, admin count, location count)."""
    session = SessionLocal()
    try:
        total_users = session.query(User).count()
        admin_users = session.query(User).filter(User.is_admin == True).count()
        total_locations = session.query(Location).count()
    finally:
        session.close()
    stats = (f"\U0001F465 Total users: {total_users} (Admins: {admin_users})\n" 
             f"\U0001F4CD Locations logged: {total_locations}")
    return stats

def backup_database():
    """Create a backup of the SQLite database file in the backups directory. Returns the backup file path or None on failure."""
    db_url = config.DATABASE_URL
    if not db_url.startswith("sqlite"):
        return None
    prefix = "sqlite:///"
    if db_url.startswith(prefix):
        db_path = db_url[len(prefix):]
    else:
        return None
    if not os.path.isabs(db_path):
        db_path = os.path.join(os.getcwd(), db_path)
    if not os.path.exists(db_path):
        return None
    os.makedirs("backups", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"backup_{timestamp}.db"
    backup_path = os.path.join("backups", backup_filename)
    try:
        shutil.copy(db_path, backup_path)
    except Exception as e:
        print(f"Backup failed: {e}")
        return None
    return backup_path
