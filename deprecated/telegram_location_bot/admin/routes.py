"""Flask routes for admin panel pages."""
from flask import render_template, request, redirect, url_for, session, flash
from admin import admin_bp
from bot.auth import authenticate_user, verify_totp, login_required
from admin.models import User, Location
import pyotp
import sqlite3

DB_PATH = 'path_to_your_database.db'

# Define constants for route names
ADMIN_BP_LOGIN = 'admin_bp.login'
ADMIN_BP_VERIFY_2FA = 'admin_bp.verify_2fa'
ADMIN_BP_DASHBOARD = 'admin_bp.dashboard'

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if not username or not password:
            flash("Please enter both username and password.", "warning")
            return redirect(url_for(ADMIN_BP_LOGIN))
        user = authenticate_user(username, password)
        if not user:
            flash("Invalid username or password.", "danger")
            return redirect(url_for(ADMIN_BP_LOGIN))
        # Credentials ok
        if user.totp_secret:
            # Require 2FA verification
            session['pending_user_id'] = user.id
            flash("Please enter the 2FA code from your authenticator.", "info")
            return redirect(url_for(ADMIN_BP_VERIFY_2FA))
        else:
            # No 2FA, log in directly
            session['user_id'] = user.id
            flash("Welcome, {}!".format(user.username or user.first_name), "success")
            return redirect(url_for(ADMIN_BP_DASHBOARD))
    # GET request
    return render_template('login.html')

@admin_bp.route('/verify_2fa', methods=['GET', 'POST'])
def verify_2fa():
    # Only accessible after a pending login
    pending_id = session.get('pending_user_id')
    if not pending_id:
        # If user already logged in, skip to dashboard; otherwise go to login
        if session.get('user_id'):
            return redirect(url_for(ADMIN_BP_DASHBOARD))
        else:
            return redirect(url_for(ADMIN_BP_LOGIN))
    if request.method == 'POST':
        code = request.form.get('code', '').strip()
        # Basic validation
        if not code:
            flash("Please enter the 2FA code.", "warning")
            return redirect(url_for(ADMIN_BP_VERIFY_2FA))
        # Load pending user
        from bot.database import SessionLocal
        session_db = SessionLocal()
        try:
            user = session_db.query(User).get(pending_id)
        finally:
            session_db.close()
        if not user:
            flash("Session expired. Please log in again.", "danger")
            session.pop('pending_user_id', None)
            return redirect(url_for(ADMIN_BP_LOGIN))
        if verify_totp(user, code):
            # 2FA success
            session.pop('pending_user_id', None)
            session['user_id'] = user.id
            flash("2FA verified. Welcome, {}!".format(user.username or user.first_name), "success")
            return redirect(url_for(ADMIN_BP_DASHBOARD))
        else:
            flash("Invalid or expired 2FA code. Please try again.", "danger")
            return redirect(url_for(ADMIN_BP_VERIFY_2FA))
    # GET request
    return render_template('verify_2fa.html')

@admin_bp.route('/logout')
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for(ADMIN_BP_LOGIN))

@admin_bp.route('/dashboard')
@login_required
def dashboard():
    # Fetch some stats to display
    from bot.database import SessionLocal
    session_db = SessionLocal()
    try:
        total_users = session_db.query(User).count()
        admin_count = session_db.query(User).filter(User.is_admin == True).count()
        location_count = session_db.query(Location).count()
        # Latest 5 location queries
        recent_locations = session_db.query(Location).order_by(Location.id.desc()).limit(5).all()
        # Optionally, eager load user for each location (since we'll access user)
        for loc in recent_locations:
            session_db.refresh(loc, attribute_names=['user'])
    finally:
        session_db.close()
    stats = {
        'total_users': total_users,
        'admin_count': admin_count,
        'location_count': location_count
    }
    return render_template('dashboard.html', stats=stats, recent_locations=recent_locations)

@admin_bp.route('/users', methods=['GET', 'POST'])
@login_required
def users():
    def fetch_users():
        # Logic to fetch users from the database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        conn.close()
        return users

    def process_user_data(user):
        # Logic to process individual user data
        return {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[3]
        }

    def render_users_page(users):
        # Logic to render the users page
        return render_template('admin/users.html', users=users)

    users = fetch_users()
    processed_users = [process_user_data(user) for user in users]
    return render_users_page(processed_users)

@admin_bp.route('/locations')
@login_required
def locations():
    # List all location records
    from bot.database import SessionLocal
    session_db = SessionLocal()
    try:
        records = session_db.query(Location).order_by(Location.id.desc()).all()
        # Optionally load user info for each location (for template)
        for loc in records:
            session_db.refresh(loc, attribute_names=['user'])
    finally:
        session_db.close()
    return render_template('locations.html', locations=records)

@admin_bp.route('/analytics/sentiment')
def sentiment_analytics():
    """Display sentiment analytics from Loveable.dev."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT sentiment, COUNT(*) FROM analysis_results GROUP BY sentiment")
    data = cursor.fetchall()
    conn.close()

    return render_template('admin/sentiment_analytics.html', data=data)
