"""Flask routes for admin panel pages."""
from flask import render_template, request, redirect, url_for, session, flash
from admin import admin_bp
from bot.auth import authenticate_user, verify_totp, login_required
from bot.database import SessionLocal
from admin.models import User, Location
import pyotp

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if not username or not password:
            flash("Please enter both username and password.", "warning")
            return redirect(url_for('admin_bp.login'))
        user = authenticate_user(username, password)
        if not user:
            flash("Invalid username or password.", "danger")
            return redirect(url_for('admin_bp.login'))
        # Credentials ok
        if user.totp_secret:
            # Require 2FA verification
            session['pending_user_id'] = user.id
            flash("Please enter the 2FA code from your authenticator.", "info")
            return redirect(url_for('admin_bp.verify_2fa'))
        else:
            # No 2FA, log in directly
            session['user_id'] = user.id
            flash("Welcome, {}!".format(user.username or user.first_name), "success")
            return redirect(url_for('admin_bp.dashboard'))
    # GET request
    return render_template('login.html')

@admin_bp.route('/verify_2fa', methods=['GET', 'POST'])
def verify_2fa():
    # Only accessible after a pending login
    pending_id = session.get('pending_user_id')
    if not pending_id:
        # If user already logged in, skip to dashboard; otherwise go to login
        if session.get('user_id'):
            return redirect(url_for('admin_bp.dashboard'))
        else:
            return redirect(url_for('admin_bp.login'))
    if request.method == 'POST':
        code = request.form.get('code', '').strip()
        # Basic validation
        if not code:
            flash("Please enter the 2FA code.", "warning")
            return redirect(url_for('admin_bp.verify_2fa'))
        # Load pending user
        session_db = SessionLocal()
        try:
            user = session_db.query(User).get(pending_id)
        finally:
            session_db.close()
        if not user:
            flash("Session expired. Please log in again.", "danger")
            session.pop('pending_user_id', None)
            return redirect(url_for('admin_bp.login'))
        if verify_totp(user, code):
            # 2FA success
            session.pop('pending_user_id', None)
            session['user_id'] = user.id
            flash("2FA verified. Welcome, {}!".format(user.username or user.first_name), "success")
            return redirect(url_for('admin_bp.dashboard'))
        else:
            flash("Invalid or expired 2FA code. Please try again.", "danger")
            return redirect(url_for('admin_bp.verify_2fa'))
    # GET request
    return render_template('verify_2fa.html')

@admin_bp.route('/logout')
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for('admin_bp.login'))

@admin_bp.route('/dashboard')
@login_required
def dashboard():
    # Fetch some stats to display
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
    session_db = SessionLocal()
    try:
        if request.method == 'POST':
            # Handle user action form
            user_id = request.form.get('user_id')
            action = request.form.get('action')
            if user_id and action:
                target = session_db.query(User).get(int(user_id))
                if not target:
                    flash("User not found.", "danger")
                else:
                    current_user_id = session.get('user_id')
                    # Prevent self-admin modifications that lock oneself out
                    if target.id == current_user_id and action in ['demote', 'deactivate']:
                        flash("You cannot {} your own account.".format("demote" if action == 'demote' else 'deactivate'), "warning")
                    else:
                        if action == 'promote':
                            target.is_admin = True
                            if not target.totp_secret:
                                target.totp_secret = pyotp.random_base32()
                        elif action == 'demote':
                            target.is_admin = False
                        elif action == 'activate':
                            target.is_active = True
                        elif action == 'deactivate':
                            target.is_active = False
                        else:
                            flash("Unknown action.", "danger")
                            session_db.commit()  # commit any changes if made
                            session_db.close()
                            return redirect(url_for('admin_bp.users'))
                        session_db.commit()
                        # Send notifications via bot if applicable
                        if action == 'promote':
                            flash(f"User '{target.username}' promoted to admin.", "success")
                            if target.telegram_id:
                                try:
                                    from bot import bot
                                    bot.send_message(target.telegram_id, 
                                        f"🎉 You have been promoted to admin. Set up 2FA with this code: {target.totp_secret}")
                                except Exception as e:
                                    print(f"Notification failed: {e}")
                        elif action == 'demote':
                            flash(f"Admin privileges revoked for user '{target.username}'.", "info")
                            if target.telegram_id:
                                try:
                                    from bot import bot
                                    bot.send_message(target.telegram_id, "⚠️ Your admin access has been revoked.")
                                except Exception as e:
                                    print(f"Notification failed: {e}")
                        elif action == 'activate':
                            flash(f"User '{target.username}' has been reactivated.", "success")
                            if target.telegram_id:
                                try:
                                    from bot import bot
                                    bot.send_message(target.telegram_id, "✅ Your account has been reactivated by an admin.")
                                except Exception as e:
                                    print(f"Notification failed: {e}")
                        elif action == 'deactivate':
                            flash(f"User '{target.username}' has been deactivated.", "warning")
                            if target.telegram_id:
                                try:
                                    from bot import bot
                                    bot.send_message(target.telegram_id, "⛔ Your account has been deactivated by an admin.")
                                except Exception as e:
                                    print(f"Notification failed: {e}")
            return redirect(url_for('admin_bp.users'))
        else:
            # GET: display list of users
            users_list = session_db.query(User).order_by(User.is_admin.desc(), User.id.asc()).all()
            current_user_id = session.get('user_id')
            return render_template('users.html', users=users_list, current_user_id=current_user_id)
    finally:
        session_db.close()

@admin_bp.route('/locations')
@login_required
def locations():
    # List all location records
    session_db = SessionLocal()
    try:
        records = session_db.query(Location).order_by(Location.id.desc()).all()
        # Optionally load user info for each location (for template)
        for loc in records:
            session_db.refresh(loc, attribute_names=['user'])
    finally:
        session_db.close()
    return render_template('locations.html', locations=records)
