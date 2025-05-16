# models.py
"""Database models for users and locations."""
from sqlalchemy import Column, Integer, BigInteger, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, nullable=True)
    username = Column(String(64), nullable=False, default="")
    first_name = Column(String(64), nullable=False, default="")
    last_name = Column(String(64), nullable=False, default="")
    is_admin = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    password_hash = Column(String(255), nullable=True)  # hashed password for admin login
    totp_secret = Column(String(32), nullable=True)     # TOTP secret for 2FA

    # Relationship to locations (list of Location entries made by the user)
    locations = relationship("Location", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} telegram_id={self.telegram_id} username='{self.username}' is_admin={self.is_admin}>"

class Location(Base):
    __tablename__ = 'locations'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    latitude = Column(String(32), nullable=False)
    longitude = Column(String(32), nullable=False)
    address = Column(Text, nullable=True)
    query = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationship back to user
    user = relationship("User", back_populates="locations")

    def __repr__(self):
        return f"<Location id={self.id} user_id={self.user_id} lat={self.latitude} lon={self.longitude}>"
