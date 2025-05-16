# auth.py
"""Authentication utilities for admin login and 2FA."""
from functools import wraps
from flask import session, redirect, url_for, flash
from werkzeug.security import check_password_hash
import pyotp
from bot.database import SessionLocal
from admin.models import User

def authenticate_user(username, password):
    """Verify username and password. Returns User object if valid and user is admin & active, else None."""
    session_db = SessionLocal()
    try:
        user = session_db.query(User).filter(User.username == username, User.is_admin == True, User.is_active == True).first()
        if not user:
            return None
        # If user has no password set or password is incorrect
        if not user.password_hash or not check_password_hash(user.password_hash, password):
            return None
        # Authentication successful
        # Detach user before closing session (to use outside)
        session_db.expunge(user)
        return user
    finally:
        session_db.close()

def verify_totp(user, code):
    """Verify a 2FA TOTP code for the given user. Returns True if valid or if user has no TOTP secret (i.e., 2FA not set)."""
    if not user.totp_secret:
        return True
    try:
        totp = pyotp.TOTP(user.totp_secret)
        # Allow some drift by default parameters
        return totp.verify(code)
    except Exception as e:
        print(f"TOTP verification error: {e}")
        return False

def login_required(func):
    """Flask route decorator to require admin login (including 2FA)."""
    @wraps(func)
    def wrapper(*args, **kwargs):
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
