"""
FastAPI application entry point.
Tables are created and rooms are seeded on startup so the app
is ready to use immediately after deployment.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, SessionLocal
from app.models import Base
from app.routers import rooms, bookings
from app.seed import seed_rooms


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables (idempotent) and seed rooms
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_rooms(db)
    finally:
        db.close()
    yield
    # Shutdown: nothing to clean up for SQLite/PostgreSQL


app = FastAPI(
    title="Meeting Room Booking API",
    description="Book meeting rooms, detect conflicts, and find next available slots.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow requests from the Next.js frontend (both local dev and deployed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms.router)
app.include_router(bookings.router)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "message": "Meeting Room Booking API is running"}
