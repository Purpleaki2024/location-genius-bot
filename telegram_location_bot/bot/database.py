"""Database setup and helper functions."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from bot import config
from admin import models

# Create database engine
# Enable check_same_thread for SQLite if using threading
connect_args = {}
if config.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
engine = create_engine(config.DATABASE_URL, echo=False, future=True, connect_args=connect_args)

# Create session factory
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

# Initial admin user setup
def init_admin_user():
    """Create the initial admin user if not present."""
    session = SessionLocal()
    try:
        # Check if any admin user exists
        admin_user = session.query(models.User).filter(models.User.is_admin == True).first()
        if admin_user is None:
            # Create initial admin user with credentials from config
            from werkzeug.security import generate_password_hash
            admin = models.User(
                telegram_id=None,
                username=config.ADMIN_USERNAME,
                first_name="Admin",
                last_name="User",
                is_admin=True,
                is_active=True,
                password_hash=generate_password_hash(config.ADMIN_PASSWORD),
                totp_secret=config.ADMIN_TOTP_SECRET
            )
            session.add(admin)
            session.commit()
            # Log creation
            print(f"Created initial admin user: username='{config.ADMIN_USERNAME}'")
    finally:
        session.close()

# Initialize admin user on startup
init_admin_user()

def get_user_by_telegram_id(session, telegram_id):
    return session.query(models.User).filter(models.User.telegram_id == telegram_id).first()

def create_user(session, telegram_user):
    """Create a new user in the database from a Telegram user object."""
    from werkzeug.security import generate_password_hash
    user = models.User(
        telegram_id=telegram_user.id,
        username=(telegram_user.username or ""),
        first_name=(telegram_user.first_name or ""),
        last_name=(telegram_user.last_name or ""),
        is_admin=False,
        is_active=True,
        password_hash=None,  # no password for bot-only users
        totp_secret=None
    )
    session.add(user)
    return user

def ensure_user(telegram_user):
    """Get or create a user corresponding to the given Telegram user. Updates info if changed."""
    session = SessionLocal()
    user = get_user_by_telegram_id(session, telegram_user.id)
    if user:
        # Update basic info if changed
        updated = False
        if telegram_user.username and user.username != telegram_user.username:
            user.username = telegram_user.username
            updated = True
        # Only update name if not empty strings to avoid overwriting with None
        if telegram_user.first_name and user.first_name != telegram_user.first_name:
            user.first_name = telegram_user.first_name
            updated = True
        if telegram_user.last_name and user.last_name != telegram_user.last_name:
            user.last_name = telegram_user.last_name
            updated = True
        if updated:
            session.commit()
    else:
        # Create new user record
        user = create_user(session, telegram_user)
        session.commit()
    session.expunge(user)  # detach user object before closing session
    session.close()
    return user

def add_location_entry(user, latitude, longitude, address, query=None):
    """Add a new location query entry for the given user (models.User or user id)."""
    session = SessionLocal()
    try:
        # Accept user object or user id
        if isinstance(user, models.User):
            user_id = user.id
        else:
            user_id = user
        loc = models.Location(
            user_id=user_id,
            latitude=latitude,
            longitude=longitude,
            address=address,
            query=query
        )
        session.add(loc)
        session.commit()
        session.refresh(loc)  # get generated id
        return loc
    finally:
        session.close()
