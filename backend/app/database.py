"""
Database connection and session management.
Resilient to Render internal DNS failures with automatic SQLite fallback.
"""

import logging
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("uvicorn.error")

RAW_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

# Normalize postgres:// to postgresql://
if RAW_DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = RAW_DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    DATABASE_URL = RAW_DATABASE_URL


def create_resilient_engine():
    global DATABASE_URL
    connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    try:
        eng = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
        # Test connection
        with eng.connect() as conn:
            pass
        masked = DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else DATABASE_URL
        logger.info(f"Database connected successfully to {masked}")
        return eng
    except Exception as exc:
        logger.warning(f"Database connection error ({exc}). Falling back to SQLite local database.")
        DATABASE_URL = "sqlite:///./dev.db"
        return create_engine("sqlite:///./dev.db", connect_args={"check_same_thread": False}, pool_pre_ping=True)


engine = create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency that yields a DB session and ensures it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
