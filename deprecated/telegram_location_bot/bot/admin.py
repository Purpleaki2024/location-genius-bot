# admin.py
"""Administrative utility functions for the bot (not Flask)."""
from bot import config
from admin.models import User, Location

def get_stats():
    from bot.database import SessionLocal  # moved import inside function to avoid circular import
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

# Deprecate backup_database function
# This function is redundant with Supabase's automated backups and is no longer needed.
# def backup_database():
#     pass
