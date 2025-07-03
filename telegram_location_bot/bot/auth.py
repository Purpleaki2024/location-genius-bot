# auth.py
"""Authentication utilities for admin login and 2FA."""
from functools import wraps
from flask import session, redirect, url_for, flash
from werkzeug.security import check_password_hash
import pyotp
from admin.models import User

# Deprecate authenticate_user and verify_totp functions
# These functions are redundant with Supabase authentication and 2FA mechanisms.
# def authenticate_user(username, password):
#     pass

# def verify_totp(user, code):
#     pass

def login_required(func):
    """Flask route decorator to require admin login (including 2FA)."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        from bot.database import SessionLocal  # moved import inside function to avoid circular import
        user_id = session.get('user_id')
        if not user_id:
            # Not logged in
            return redirect(url_for('admin_bp.login'))
        # Optionally verify user still exists and is admin
        session_db = SessionLocal()
        try:
            user = session_db.query(User).get(user_id)
            if not user or not user.is_admin or not user.is_active:
                # User no longer authorized (could have been removed or demoted)
                session.clear()
                flash("Your account is no longer authorized. Please log in again.", "warning")
                return redirect(url_for('admin_bp.login'))
        finally:
            session_db.close()
        # User is logged in and still authorized
        return func(*args, **kwargs)
    return wrapper
