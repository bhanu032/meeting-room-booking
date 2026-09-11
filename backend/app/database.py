"""
Database connection and session management.

Local dev: set DATABASE_URL=sqlite:///./dev.db in .env (or leave unset — defaults to SQLite).
Production: set DATABASE_URL to a PostgreSQL connection string.

SQLAlchemy handles both drivers transparently; the only difference is the
connect_args needed for SQLite's thread safety restriction.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

# Render / Neon sometimes provide postgres:// URIs; SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite requires check_same_thread=False when used with FastAPI's thread pool
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency that yields a DB session and ensures it's closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
