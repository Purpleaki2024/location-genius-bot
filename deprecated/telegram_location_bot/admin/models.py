# models.py
"""Database models for users and locations."""
from sqlalchemy import Column, Integer, BigInteger, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

# Deprecate Flask models
# These models are redundant with Supabase tables and are no longer needed.
# class User(Base):
#     pass
#
# class Location(Base):
#     pass
